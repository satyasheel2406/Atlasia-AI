import React, { useEffect, useState } from "react";
import { Coins, LogOut, MessageSquare, PenSquare, Plus, User, X } from "lucide-react";
import { getConversations } from "../features/getConversations";
import { createConversation } from "../features/createConversation";
import { setConversations, setSelectedConversation } from "../redux/conversationSlice";
import { addConversation } from "../redux/conversationSlice";
import { useDispatch, useSelector } from "react-redux";
import { setUserdata } from "../redux/userSlice";
import logout from "../features/logout.js";
import BillingDrawer from "./BillingDrawer.jsx";

function SideBar({ open, onClose }) {
   const [imageError, setImageError] = useState(false)
   const [showBilling, setShowBilling] = useState(false)
   const dispatch = useDispatch()
   const { conversations, selectedConversation } = useSelector((state) => state.conversation)
   const { userData } = useSelector((state) => state.user)

   useEffect(() => {
       const getConv = async () => {
           const data = await getConversations()
           dispatch(setConversations(data))
       }
       getConv()
   }, [userData?._id])

   const handleSelect = (conv) => {
       dispatch(setSelectedConversation(conv))
       onClose()
   }

   const handleNewChat = () => {
       dispatch(setSelectedConversation(null))
       onClose()
   }

   const sidebarContent = (
       <div className='flex flex-col h-full'>
           {/* Header */}
           <div className='flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]'>
               <span className='text-[16px] font-semibold text-slate-100 tracking-tight flex-1'>
                   AtlasiaAI
               </span>
               <span className='text-[10px] font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full tracking-wide capitalize'>{userData?.plan || "free"}</span>
               {/* Close button on mobile */}
               <button className='lg:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-500
                   hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent
                   border-none cursor-pointer' onClick={onClose}>
                   <X size={16} />
               </button>
               {/* New chat button */}
               <button className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500
                   hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent
                   border-none cursor-pointer' onClick={handleNewChat}>
                   <PenSquare size={16} />
               </button>
           </div>

           {/* New Chat Button */}
           <div className='px-4 pt-4 pb-1'>
               <button className='w-full flex items-center justify-center gap-2 text-sm font-medium text-white
                   bg-gradient-to-br from-indigo-500 to-violet-700 rounded-xl py-[10px] border-none cursor-pointer
                   hover:opacity-90 transition-opacity duration-150' onClick={handleNewChat}>
                   <Plus size={16} />
                   New Chat
               </button>
           </div>

           {/* Section label */}
           <div className='px-5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase text-slate-400 tracking-widest'>
               {conversations.length === 0 ? "No recent conversations" : "Recent Conversations"}
           </div>

           {/* Conversation list */}
           <div className='flex-1 overflow-y-auto px-2.5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
               {conversations.map((conv, i) => {
                   const isActive = selectedConversation && selectedConversation._id === conv._id
                   return (
                       <div onClick={() => handleSelect(conv)} key={i}
                           className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${isActive ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"}`}>
                           <div className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${isActive ? "bg-indigo-500 text-white" : "bg-white/[0.06] text-slate-400"}`}>
                               <MessageSquare size={16} />
                           </div>
                           <span className={`text-[13px] font-medium truncate ${isActive ? "text-white" : "text-slate-400"}`}>
                               {conv?.title || "New Chat"}
                           </span>
                       </div>
                   )
               })}
           </div>

           <div className='mx-2.5 h-px bg-white/[0.06]' />

           {/* User footer */}
           <div className='px-3.5 py-3.5'>
               {userData ? (
                   <div className='flex items-center gap-2.5 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors duration-150'>
                       <div className='relative shrink-0'>
                           {userData?.avatar && !imageError ? (
                               <img className='w-8 h-8 rounded-md object-cover border-2 border-indigo-500/25'
                                   src={userData.avatar}
                                   alt="User Avatar"
                                   onError={() => setImageError(true)}
                               />
                           ) : (
                               <div className='w-8 h-8 rounded-md bg-white/[0.06] flex items-center justify-center'>
                                   <User className='w-4 h-4 text-slate-400' />
                               </div>
                           )}
                       </div>
                       <div onClick={() => setShowBilling(true)} className='cursor-pointer flex-1 min-w-0'>
                           <p className='text-[13.5px] font-semibold text-slate-100 truncate'>{userData?.name || "User"}</p>
                           <p className='text-[11px] text-slate-400 mt-px capitalize hover:text-indigo-400 transition-colors duration-150'>
                               {userData?.plan || "free"} Plan
                           </p>
                       </div>
                       <div className='flex gap-1 shrink-0'>
                           <button onClick={() => setShowBilling(true)}
                               className='flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150'>
                               <Coins size={16} />
                           </button>
                           <button className='flex items-center justify-center w-7 h-7 rounded-[7px] border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/[0.08] hover:text-slate-400 transition-all duration-150'
                               onClick={async () => {
                                   if (!window.confirm("Are you sure you want to log out?")) return;
                                   await logout();
                                   dispatch(setUserdata(null));
                                   dispatch(setConversations([]));
                                   dispatch(setSelectedConversation(null));
                                   onClose()
                               }}>
                               <LogOut size={16} />
                           </button>
                       </div>
                   </div>
               ) : (
                   <button>Login</button>
               )}
           </div>
       </div>
   )

   return (
       <>
           {/* Mobile: overlay + slide-in drawer */}
           <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
               {/* Backdrop */}
               <div className='absolute inset-0 bg-black/50' onClick={onClose} />
               {/* Sidebar panel */}
               <div className={`absolute inset-y-0 left-0 w-[280px] bg-[#0d0f14] border-r border-white/[0.06] transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
                   {sidebarContent}
               </div>
           </div>

           {/* Desktop: always-visible static sidebar */}
           <div className='hidden lg:flex shrink-0 w-[270px] h-screen bg-[#0d0f14] border-r border-white/[0.06]'>
               {sidebarContent}
           </div>

           <BillingDrawer open={showBilling} onClose={() => setShowBilling(false)} />
       </>
   )
}

export default SideBar
