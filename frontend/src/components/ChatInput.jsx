import { Code, FileText, Globe, Image, MessageSquare, Mic, Paperclip, Presentation, Send, X, Zap } from 'lucide-react'
import React, { useRef } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import sendMessage from "../features/sendMessage";
import { addMessage, setArtifacts, setLoading } from '../redux/messageSlice'
import { setCredits } from '../redux/userSlice'
import { createConversation } from '../features/createConversation';
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice';
import { updateConversationTitle } from '../features/updateConversationTitle';
const ChatInput = () => {

    const [value , setValue]=useState("")
    const[selectedAgent , setSelectedAgent]=useState("Auto")
    const[selectedFile, setSelectedFile]=useState(null)
    const fileRef=useRef(null)
    const dispatch = useDispatch()
    const {selectedConversation} = useSelector(state=>state.conversation)
    const {isLoading} = useSelector(state=>state.message)

    const handleSendMessage= async()=>{
        const prompt = value.trim()
        if(!prompt) return;

        let conversation = selectedConversation
        if(!conversation)
        {
            const conv = await createConversation()
            if(!conv?._id){
                console.error("Conversation banane me fail hua, message nahi bheja")
                return;
            }
            dispatch(setSelectedConversation(conv))
            dispatch(addConversation(conv))
            conversation=conv
        }

        if(conversation.title=="New Chat")
        {
            await updateConversationTitle({id:conversation?._id , title : prompt})
            dispatch(setConvTitle({conversationId:conversation._id,title:prompt.slice(0,40)}))
        }


        const formData = new FormData()
formData.append("prompt", value.trim())
formData.append("conversationId", conversation?._id)
formData.append("agent", selectedAgent.toLowerCase())
if(selectedFile) formData.append("file", selectedFile)


        setValue("")
        setSelectedFile(null)
        if(fileRef.current) fileRef.current.value = ""
        dispatch(addMessage({role:"user", content: prompt}))
        dispatch(setLoading(true))
        try{
        const data = await sendMessage(formData)
        data?.artifacts?.forEach((artifact) => dispatch(setArtifacts(artifact)))
        if(data?.message){
            dispatch(addMessage({role:"assistant", content: data.message , images : data.images}))
        } else if(data?.error){
            dispatch(addMessage({role:"assistant", content: `⚠️ ${data.error}`}))
        }
        if(typeof data?.creditsRemaining === "number"){
            dispatch(setCredits(data.creditsRemaining))
        }
        }finally{
        dispatch(setLoading(false))
        }
    }

    const handleKeyDown = (e) => {
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            handleSendMessage();
        }
    }

    //ye ids backend router ke agents se match karni chahiye (graph/router.js)
    const agents =[
        {
            id:"auto",
            icon:Zap,
            label:"Auto"
        },
        {
            id : "chat",
            icon:MessageSquare,
            label:"Chat"
        },
        {
            id : "search",
            icon:Globe,
            label:"Search"
        },
        {
            id : "coding",
            icon:Code,
            label:"Coding"
        },
        {
            id : "pdf",
            icon:FileText,
            label:"PDF"
        },
        {
            id : "ppt",
            icon:Presentation,
            label:"PPT"
        },
        {
            id : "vision",
            icon:Image,
            label:"Vision"
        }
    ]

  return (
   <div className="w-full border-t border-white/[0.06] bg-[#0d0f14] px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4">
  <div className="w-full flex flex-col gap-1.5 sm:gap-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl px-3 sm:px-4 pt-2.5 sm:pt-3 md:pt-3.5 pb-2 sm:pb-2.5 md:pb-3">
  <div className='w-full max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
  <div className='flex gap-1.5 sm:gap-2 w-max pb-0.5 pr-6'>
    {agents.map((agent)=>{
       const isActive = selectedAgent===agent.label
       const Icon = agent.icon
       return(
        <div
        key={agent.id}
        onClick={()=>setSelectedAgent(agent.label)}
        className={`
        flex-shrink-0
        cursor-pointer
inline-flex
items-center
gap-1
sm:gap-1.5
px-2.5
sm:px-3
py-1.5
sm:py-2
rounded-full
text-[11px]
sm:text-xs
font-medium
border
transition-all
${
  isActive
    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-transparent shadow-[0_1px_8px_rgba(99,102,241,.35)]"
    : "bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.07]"
}
`}>
   <Icon
  size={14}
  className={
    isActive
      ? "text-white"
      : "text-slate-500"
  }
/>

<span>{agent.label}</span>
        </div>
       )
    })}
  </div>
  </div>
{
  selectedFile && (
    <div className="my-1 sm:my-2">
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 sm:px-3 py-1.5 sm:py-2 max-w-full">
        {
          selectedFile?.type === "application/pdf" ? (
            <FileText size={16} className="text-red-400 shrink-0" />
          ) : (
            selectedFile.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shrink-0"/>
          )
        }
             <div className="min-w-0 flex-1">
  <p className='text-[11px] sm:text-xs text-white truncate'>
    {selectedFile?.name}
  </p>
  <p className='text-[9px] sm:text-[10px] text-slate-500'>
    {Math.ceil(selectedFile.size)}KB
  </p>
</div>

<button className='ml-1 shrink-0' onClick={() => { setSelectedFile(null); fileRef.current.value = "" }}><X size={14} className='text-slate-500 hover:text-white' /></button>

      </div>
    </div>
  )
}
    <textarea
      placeholder={isLoading ? "Please wait..." : "Ask Anything..."}
      value={value}
      onChange={(e)=>setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={isLoading}
      className="w-full min-w-0 bg-transparent outline-none resize-none text-[14px] text-slate-200 placeholder:text-slate-600 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
      rows={2}
    />

    <div className="flex items-center justify-between">
  <div className="flex items-center gap-0.5 sm:gap-1">
<input type="file" accept=".pdf,image/*" hidden ref={fileRef} onChange={(e) => {
  const file = e.target.files[0]
  if (file) {
    setSelectedFile(file)
  }
}} />
    <button disabled={isLoading} className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={()=>fileRef.current.click()}>
      <Paperclip size={16} />
    </button>

    <button disabled={isLoading} className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] transition-all duration-150 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
      <Mic size={16} />
    </button>
  </div>

  <button
disabled={!value || isLoading}
onClick={handleSendMessage}
className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border-none cursor-pointer transition-all duration-150 ${value.trim() && !isLoading ? "bg-linear-to-br from-indigo-500 to-violet-700 hover:opacity-90 text-white" : "bg-white/[0.05] text-slate-600 cursor-not-allowed"}`}>
    <Send size={15}/>
</button>

</div>
      
  </div>
</div>
  )
}

export default ChatInput