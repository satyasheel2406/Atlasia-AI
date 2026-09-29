import { Menu, MessageSquare } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

const Nav = ({ onMenuClick }) => {
    const { selectedConversation } = useSelector(state => state.conversation)
    const { messages } = useSelector(state => state.message)

    return (
        <div className="h-14 flex items-center gap-2.5 px-4 md:px-5 border-b border-white/[0.06] bg-[#0d0f14] shrink-0 overflow-hidden">
            {/* Hamburger - visible on mobile only */}
            <button
                onClick={onMenuClick}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400
                    hover:text-slate-200 hover:bg-white/[0.05] border-none bg-transparent cursor-pointer shrink-0"
            >
                <Menu size={18} />
            </button>

            {selectedConversation ? (
                <>
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                        <MessageSquare size={13} className="text-indigo-400" />
                    </div>
                    <div className="text-[14px] font-semibold text-slate-100 tracking-tight truncate">
                        {selectedConversation?.title || "New Chat"}
                    </div>
                    <div className="hidden sm:block text-[10px] font-medium text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full shrink-0">
                        {messages?.length} Messages
                    </div>
                </>
            ) : (
                <div className="text-[14px] font-semibold text-slate-100 tracking-tight">
                    AtlasiaAI
                </div>
            )}
        </div>
    );
}

export default Nav
