import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

//redis me kabhi kabhi "null" ya kharab data pad jata hai, isliye hamesha array hi return karo
const parseMessages = (raw)=>{
    if(!raw) return null
    try{
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : null
    }catch(error){
        return null
    }
}

export const getMemory=async(conversationId)=>{
const key = `messages-${conversationId}`
const cached = parseMessages(await redis.get(key))
if(cached)
{
    return cached
}

 const messages = await getMessages(conversationId)
 const safeMessages = Array.isArray(messages) ? messages : []
 await redis.set(key , JSON.stringify(safeMessages), "EX", 24*60*60)
 return safeMessages

}

export const addMessage = async(conversationId, role , content)=>{
    const key = `messages-${conversationId}`
    const messages = parseMessages(await redis.get(key)) ?? []
    messages.push({
        role,content
    })

    if(messages.length>20)
    {
        messages.shift()
    }

    await redis.set(key, JSON.stringify(messages))

}
