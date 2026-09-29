import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";

const MessageList = () => {
  const { selectedConversation } = useSelector(
    (state) => state.conversation
  );
  const { messages, isLoading } = useSelector((state) => state.message);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {messages.length === 0 || !selectedConversation ? (
        <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[18px] sm:text-[20px] font-semibold text-slate-200 tracking-tight">
              AtlasiaAI
            </h1>

            <p className="text-[13px] sm:text-[15px] font-semibold text-slate-400 tracking-tight">
              How can I help you?
            </p>

            <p className="text-[13px] text-slate-600 max-w-[260px] leading-relaxed px-4">
              Ask me anything — code, ideas, explanations, or just a quick
              question.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-1 px-4">
            {[
              "Write a Netflix clone",
              "Explain Redis",
              "Build a dashboard",
            ].map((s) => (
              <button
                key={s}
                className="text-[11px] sm:text-[12px] text-slate-400 bg-white/[0.04] border border-white/[0.07] px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-white/[0.08] hover:text-slate-200 transition-colors duration-150 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg._id || i}
              role={msg.role}
              content={msg.content}
              images={msg.images}
            />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
