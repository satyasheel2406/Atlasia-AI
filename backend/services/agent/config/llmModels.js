import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenRouter } from "@langchain/openrouter";

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
})


const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    maxRetries: 2,
    // other params...
})

const openrouter = new ChatOpenRouter({
  model: "deepseek/deepseek-chat",
  temperature: 0,
  //1024 bahut kam tha — multi-file website generation ke beech me hi kat jaata tha,
  //jisse JSON output ke andar string unterminated reh jaati thi
  maxTokens: 8192,
  // other params...
});

//ab hum export function banaenge jo ki agent ke naam ke hisaab se sahi model return karega

export const getModel = async (agent)=>{
   switch(agent){
    case "chat":
        return groq;
    case "search":
        return groq;
    case "coding":
        return openrouter;
    case "imageAnalyzer":
        return gemini;
    default:
       return groq;
   }
    
}

