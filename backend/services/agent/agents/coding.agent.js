import { checkLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { searchImages } from "../config/unsplash.js"
import {deductCredits} from "../utils/deductCredits.js"

export const codingAgent = async(state)=>{
try{
  await checkLimit(state.userId,"coding")
        const intentLlm = await getModel("intent")
        const intentResponse = await intentLlm.invoke(`
            You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:
${state.prompt}

  `)

  const intent = intentResponse.content.trim()
  const llm = await getModel("coding")

  if(intent=="CODE_GENERATION")
  {
    //asli, kaam karne wali Unsplash image URLs pehle hi le lo — model ko khud URL
    //banane dene se broken links ban jaati hain (fake photo IDs)
    const images = await searchImages(state.prompt)

    const imageInstructions = images.length > 0
      ? `Available Images (use ONLY these exact URLs where images are needed, do not invent your own):
${images.map((img) => `- ${img.url} (alt: "${img.alt}")`).join("\n")}`
      : `No images are available right now. Do not use <img> tags with made-up URLs — use a styled CSS placeholder (e.g. a colored div with an icon or gradient) wherever an image would go.`

    const prompt = `You are CortexAI Coding Agent.

Generate the requested project.

Default stack:
- HTML
- CSS
- JavaScript

Use React / Next.js / Vue ONLY if explicitly requested.

Rules:

- Responsive
- Modern UI
- CSS Variables
- Flexbox/Grid
- Smooth Scroll
- Hover Effects
- Beautiful spacing
- Single page unless user asks otherwise.

${imageInstructions}

Return ONLY valid JSON.

Schema:

{
  "files":[
    {
      "name":"index.html",
      "content": "..."
    },
    {
      "name":"style.css",
      "content":"..."
    },
    {
      "name":"script.js",
      "content":"..."
    }
  ]
}

Rules:

- Output must start with {
- Output must end with }
- No markdown
- No explanation
- No extra text
- No \`\`\`
- Never mention intent

User Request:
${state.prompt}
`
const res = await llm.invoke(prompt)

//model prompt me mana karne ke baad bhi kabhi kabhi ```json fence laga deta hai, usko strip karo
const cleaned = res.content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "")
const content = JSON.parse(cleaned);

  const creditRes1 = await deductCredits(state.userId , "coding")

  return {
    ...state,
    aiResponse: "Code Generated Successfully" ,
    artifacts: [
        {
            id : Date.now(),
            type:"Project",
            files:content.files || [],
            title:state.prompt,
        }
    ],
    creditsRemaining: creditRes1?.credits
  }
  }

  const res = await llm.invoke(`
    The user's request is:

${intent}

Return Markdown only.

Never generate project files.

Use headings like:

# Overview

## Explanation

## Problems

## Improvements

## Best Practices

## Optimized Code (if needed)

User Request:

${state.prompt}

    `)
    const content = res.content
      const creditRes2 = await deductCredits(state.userId , "coding")
    return {
        ...state,
        aiResponse: content,
        artifacts: [],
        creditsRemaining: creditRes2?.credits
    }}catch(error)
    {
       console.log(error)
 
 return{
    ...state,
    aiResponse:error?.data?.message || "Failed to generate code"
   }
    }
    }

