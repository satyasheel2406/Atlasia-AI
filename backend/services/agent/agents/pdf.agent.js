import { getModel } from "../config/llmModels.js"
import { generatePdf } from "../utils/generatePdf.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import {deductCredits} from "../utils/deductCredits.js"
import { checkLimit } from "../config/agentLimit.js"

export const pdfAgent = async (state) => {
 
    try{
       await checkLimit(state.userId,"pdf")
         const llm = await getModel("pdf")
         const prompt = `
You are an expert document and PDF content generator.

Your task is to transform the user's request into structured content
that can be used by a PDF generation system.

Return ONLY valid JSON.
Do NOT return markdown.
Do NOT return explanations.
Do NOT wrap the JSON in code fences.

The output MUST follow exactly this structure:

{
  "title": "",
  "subtitle": "",
  "sections": [
    {
      "heading": "",
      "points": []
    }
  ]
}

Rules:
- Understand the user's request carefully.
- Generate complete, well-structured content.
- Use appropriate sections and subsections.
- Keep the content professional and coherent.
- Do not invent factual information unnecessarily.
- Follow any structure explicitly requested by the user.
- Keep "points" as an array of strings.
- Return valid JSON only.

USER REQUEST:
${state.prompt}
`
const res = await llm.invoke(prompt)
const data =JSON.parse(res.content)
  const creditRes = await deductCredits(state.userId , "pdf")
const pdfBuffer=await generatePdf(data)
const filename = `pdf-${Date.now()}.pdf`

await uploadToS3(filename , pdfBuffer ,"application/pdf")
const downloadUrl = await getFromS3(filename, 24*60)

return{

    ...state,
aiResponse:`# PDF Generated

**${data.title}**

📥 [Download PDF](${downloadUrl})

_Link expires in 10 minutes._`,
creditsRemaining: creditRes?.credits

}
    }
    catch(error)
    {
        console.log(error)
 
 return{
    ...state,
    aiResponse:error?.data?.message || "Failed to generate pdf"
   }
    }
}
