import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";


export const agent = async(req,res,next)=>{
    try{
       const { prompt , conversationId, agent } = req.body
       const file= req.file
       const userId = req.headers["x-user-id"]

       if(!userId)
       {
        return res.status(401).json({ error : "Unauthorized" })
       }

       await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
         conversationId,
         role: "user",
         content: prompt
       });

       const result = await graph.invoke({
        prompt , conversationId , agent , userId,file
       })
       const response = result.aiResponse

       //khali response DB me mat likho, warna refresh par blank bubbles dikhte hain
       if(!response)
       {
        return res.status(500).json({
          error : `Agent "${result.agent || agent}" ne koi response return nahi kiya`
        })
       }

        await addMessage(conversationId, "user", prompt)
       await addMessage(conversationId, "assistant", response)

        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
         conversationId,
         role: "assistant",
         content: response,
         images:result.images,
         artifacts : result.artifacts
       });



       return res.status(200).json({
        message : response,
        images : result.images,
        artifacts : result.artifacts,
        creditsRemaining: result.creditsRemaining
       })
    }catch(error){
        next(error)
    }
}