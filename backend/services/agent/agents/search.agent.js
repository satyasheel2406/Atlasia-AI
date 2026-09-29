import { checkLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import {deductCredits} from "../utils/deductCredits.js"

//Tavily ka pura payload bahut bada hota hai (raw_content, per-result images, scores).
//Usko seedha prompt me daalne se Groq ka TPM limit cross ho jata hai, isliye chhota kar rahe hain.
const MAX_RESULTS = 5
const MAX_CONTENT_CHARS = 600
const MAX_IMAGES = 6

export const searchAgent = async (state) => {
    
    try{
        await checkLimit(state.userId,"search")
        const raw = await searchTool.invoke({
            query:state.prompt
        })

        const results = (raw?.results || []).slice(0, MAX_RESULTS).map((r)=>({
            title: r.title,
            url: r.url,
            content: (r.content || "").slice(0, MAX_CONTENT_CHARS)
        }))
          const creditRes = await deductCredits(state.userId , "search")
        console.log(`search: "${state.prompt}" -> ${results.length} results`)


        return{
            ...state,
            searchResults:results,
            images : (raw?.images || []).slice(0, MAX_IMAGES),
            creditsRemaining: creditRes?.credits
        }
    }catch(error)
    {
        console.log(error)
 
 return{
    ...state,
    aiResponse:error?.data?.message || "Failed to search",
     images :[],
     searchResults:[]

   }
    }
}
