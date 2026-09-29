import React, { useState } from "react";
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Check, Copy } from 'lucide-react'
import 'highlight.js/styles/atom-one-dark.css'

//highlight hone ke baad code tokens nested <span> ban jate hain, isliye
//pura text recursively nikalna padta hai warna copy adhura hoga
const nodeToText = (n) => {
  if (!n) return ""
  if (n.type === "text") return n.value || ""
  if (Array.isArray(n.children)) return n.children.map(nodeToText).join("")
  return ""
}

//`pre` ke andar hi copy button aur language label dikhate hain
function CodeBlock({ node, children, ...props }) {
  const [copied, setCopied] = useState(false)

  const codeNode = node?.children?.[0]
  const raw = nodeToText(codeNode)
  const language = (codeNode?.properties?.className || [])
    .find((c) => typeof c === "string" && c.startsWith("language-"))
    ?.replace("language-", "")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.log("copy fail hua:", error)
    }
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/[0.09] bg-black/30">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          title={copied ? "Copied" : "Copy code"}
          className="flex cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-1.5 py-1 text-[11px] text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-x-auto p-3 text-[12px] leading-relaxed [&>code]:bg-transparent [&>code]:p-0"
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}

//inline markdown image (jaise vision agent ka ![Generated Image](url)) — apni state chahiye
//taaki har image ka broken-link fallback independently kaam kare
function MarkdownImage({ node, alt, src, ...props }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="my-2 inline-block">
      <img
        {...props}
        src={src}
        alt={alt || ""}
        loading="lazy"
        onError={() => setFailed(true)}
        className="block w-full max-w-[180px] sm:max-w-[220px] rounded-xl border border-white/[0.08]"
      />
    </a>
  )
}

//AI aksar tables/headings/links wapas bhejta hai. Tailwind preflight in sabki default
//styling hata deta hai, isliye har element ko yahan explicitly style karna padta hai.
const markdownComponents = {
  h1: ({node, ...props}) => <h1 className="mt-3 mb-1.5 text-[17px] font-semibold text-slate-100 first:mt-0" {...props} />,
  h2: ({node, ...props}) => <h2 className="mt-3 mb-1.5 text-[15.5px] font-semibold text-slate-100 first:mt-0" {...props} />,
  h3: ({node, ...props}) => <h3 className="mt-2.5 mb-1 text-[14px] font-semibold text-slate-200 first:mt-0" {...props} />,

  p: ({node, ...props}) => <p className="m-0 mb-2 last:mb-0" {...props} />,

  ul: ({node, ...props}) => <ul className="my-1.5 pl-4 list-disc space-y-0.5 marker:text-slate-500" {...props} />,
  ol: ({node, ...props}) => <ol className="my-1.5 pl-4 list-decimal space-y-0.5 marker:text-slate-500" {...props} />,
  li: ({node, ...props}) => <li className="m-0" {...props} />,

  img: MarkdownImage,

  a: ({node, ...props}) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-400 underline underline-offset-2 hover:text-indigo-300"
      {...props}
    />
  ),

  //GFM tables — bubble chhota hai isliye scroll wrapper zaroori hai
  table: ({node, ...props}) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-white/[0.09]">
      <table className="w-full border-collapse text-[12.5px]" {...props} />
    </div>
  ),
  thead: ({node, ...props}) => <thead className="bg-white/[0.05]" {...props} />,
  th: ({node, ...props}) => <th className="border-b border-white/[0.09] px-2.5 py-1.5 text-left font-semibold text-slate-200" {...props} />,
  td: ({node, ...props}) => <td className="border-b border-white/[0.06] px-2.5 py-1.5 align-top" {...props} />,
  tr: ({node, ...props}) => <tr className="last:border-0" {...props} />,

  blockquote: ({node, ...props}) => (
    <blockquote className="my-2 border-l-2 border-indigo-500/40 pl-3 text-slate-400 italic" {...props} />
  ),

  pre: CodeBlock,
  code: ({node, className, ...props}) => {
    //fenced block ka code `pre` ke andar aata hai (highlight classes ke saath),
    //usko dobara inline pill mat banao
    const isBlock = /language-|hljs/.test(className || "")
    return isBlock
      ? <code className={className} {...props} />
      : <code className="rounded bg-black/25 px-1 py-0.5 text-[12px]" {...props} />
  },

  hr: ({node, ...props}) => <hr className="my-3 border-white/[0.09]" {...props} />,
  //GFM strikethrough
  del: ({node, ...props}) => <del className="text-slate-500" {...props} />,
  //GFM task lists
  input: ({node, ...props}) => <input className="mr-1 align-middle accent-indigo-500" disabled {...props} />,
}

function MessageBubble({ role, content, images }) {
  const isUser = role === "user";

  //search se aayi kuch image links toot jaati hain, unhe hide kar do
  const [failed, setFailed] = useState([])
  const visibleImages = (images || []).filter((src) => src && !failed.includes(src))

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] sm:max-w-[72%] min-w-0 overflow-hidden px-3 sm:px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed break-words ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-tr-sm"
            : "bg-white/[0.04] border border-white/[0.07] text-slate-200 rounded-tl-sm"
        }`}
      >
       <Markdown
         remarkPlugins={[remarkGfm]}
         rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
         components={markdownComponents}
       >
        {content}
       </Markdown>

       {visibleImages.length > 0 && (
         <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
           {visibleImages.map((src) => (
             <a
               key={src}
               href={src}
               target="_blank"
               rel="noopener noreferrer"
               className="group relative block aspect-[4/3] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]"
             >
               <img
                 src={src}
                 alt=""
                 loading="lazy"
                 onError={() => setFailed((prev) => [...prev, src])}
                 className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
               />
               <div className="pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-black/20" />
             </a>
           ))}
         </div>
       )}

      </div>
    </div>
  );
}

export default MessageBubble;
