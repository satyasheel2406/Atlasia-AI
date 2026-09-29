import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { Check, Code2, Copy, Eye, FileCode2, PanelRight, PanelRightClose } from 'lucide-react'

//extension se hljs language nikalne ke liye
const LANGUAGE_BY_EXT = {
  html: 'xml', htm: 'xml',
  css: 'css',
  js: 'javascript', jsx: 'javascript', mjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  json: 'json',
  py: 'python',
  md: 'markdown',
}

const languageForFile = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase()
  return LANGUAGE_BY_EXT[ext] || 'plaintext'
}

//index.html + style.css + script.js ko ek hi document me pighla do taaki iframe me chal sake
//(alag files ke <link>/<script src> iframe ke andar resolve nahi honge)
const buildPreviewHtml = (files) => {
  const html = files.find((f) => /\.html?$/i.test(f.name))
  if (!html) return null

  const css = files.filter((f) => f.name.endsWith('.css')).map((f) => f.content).join('\n')
  const js = files.filter((f) => f.name.endsWith('.js')).map((f) => f.content).join('\n')

  let doc = html.content || ''
  if (css) {
    doc = /<\/head>/i.test(doc)
      ? doc.replace(/<\/head>/i, `<style>${css}</style></head>`)
      : `<style>${css}</style>${doc}`
  }
  if (js) {
    doc = /<\/body>/i.test(doc)
      ? doc.replace(/<\/body>/i, `<script>${js}<\/script></body>`)
      : `${doc}<script>${js}<\/script>`
  }
  return doc
}

function CodePane({ file }) {
  const [copied, setCopied] = useState(false)

  const highlighted = useMemo(() => {
    const language = languageForFile(file?.name)
    try {
      return language === 'plaintext'
        ? hljs.highlightAuto(file?.content || '').value
        : hljs.highlight(file?.content || '', { language }).value
    } catch (error) {
      return file?.content || ''
    }
  }, [file])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file?.content || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.log('copy fail hua:', error)
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-end px-3 py-1.5 border-b border-white/[0.06]">
        <button
          onClick={handleCopy}
          title={copied ? 'Copied' : 'Copy code'}
          className="flex cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-1.5 py-1 text-[11px] text-slate-500 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-200"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="flex-1 min-h-0 overflow-auto p-3 text-[12px] leading-relaxed [scrollbar-width:thin]">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  )
}

const Artifact = () => {
  const { artifacts } = useSelector((state) => state.message)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeFile, setActiveFile] = useState(0)
  const [view, setView] = useState('code')
  const [collapsed, setCollapsed] = useState(false)

  const artifact = artifacts?.[artifacts.length - 1 - activeIndex]
  const files = artifact?.files || []
  const file = files[activeFile] || files[0]
  const previewHtml = useMemo(() => (files.length ? buildPreviewHtml(files) : null), [files])

  //naya artifact aaya to hamesha uski latest file/view dikhao aur panel reopen kar do
  const artifactKey = artifacts?.length ? artifacts[artifacts.length - 1].id : null
  const [lastKey, setLastKey] = useState(null)
  if (artifactKey !== lastKey) {
    setLastKey(artifactKey)
    setActiveIndex(0)
    setActiveFile(0)
    setView('code')
    setCollapsed(false)
  }

  //abhi tak koi artifact bana hi nahi, to panel ki jagah hi mat lo
  if (!artifacts?.length) return null

  //sidebar jaisi hi collapsed rail — thodi jagah leti hai, ek click me wapas khul jaati hai
  if (collapsed) {
    return (
      <div className="hidden lg:flex h-full border-l border-white/[0.06] flex-col items-center py-3 gap-3 overflow-hidden shrink-0 w-[48px] bg-[#0d0f14]">
        <button
          onClick={() => setCollapsed(false)}
          title={artifact?.title ? `Show artifact — ${artifact.title}` : 'Show artifact'}
          className="flex items-center justify-center w-7 h-7 rounded-lg border-none bg-transparent text-slate-500 cursor-pointer hover:bg-white/[0.05] hover:text-slate-200 transition-colors duration-150"
        >
          <PanelRight size={16} />
        </button>
        <FileCode2 size={14} className="text-indigo-400/70" />
      </div>
    )
  }

  return (
    <div className="hidden lg:flex h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0 w-[320px] bg-[#0d0f14]">

      <div className="flex flex-col gap-1.5 px-3 py-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileCode2 size={15} className="text-indigo-400 shrink-0" />
          <span
            title={artifact?.title}
            className="text-[12.5px] font-semibold text-slate-200 truncate flex-1"
          >
            {artifact?.title || artifact?.type || 'Artifact'}
          </span>

          <button
            onClick={() => setCollapsed(true)}
            title="Collapse artifact panel"
            className="flex items-center justify-center w-6 h-6 rounded-md border-none bg-transparent text-slate-600 cursor-pointer hover:bg-white/[0.06] hover:text-slate-300 shrink-0"
          >
            <PanelRightClose size={14} />
          </button>
        </div>

        {(artifact?.type || artifacts.length > 1) && (
          <div className="flex items-center justify-between gap-2 pl-[23px]">
            {artifact?.type && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 truncate">
                {artifact.type}
              </span>
            )}

            {artifacts.length > 1 && (
              <select
                value={activeIndex}
                onChange={(e) => { setActiveIndex(Number(e.target.value)); setActiveFile(0) }}
                className="bg-white/[0.05] border border-white/[0.08] rounded-md text-[11px] text-slate-400 px-1.5 py-0.5 outline-none cursor-pointer shrink-0"
              >
                {artifacts.slice().reverse().map((a, i) => (
                  <option key={a.id} value={i} className="bg-[#13151c]">
                    {i === 0 ? 'Latest' : (a.title ? a.title.slice(0, 24) : `Version ${artifacts.length - i}`)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {previewHtml && (
        <div className="flex gap-1 px-3 pt-2">
          <button
            onClick={() => setView('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer border-none transition-colors duration-150 ${
              view === 'code' ? 'bg-white/[0.08] text-white' : 'bg-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Code2 size={12} /> Code
          </button>
          <button
            onClick={() => setView('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer border-none transition-colors duration-150 ${
              view === 'preview' ? 'bg-white/[0.08] text-white' : 'bg-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      )}

      {view === 'code' && files.length > 1 && (
        <div className="flex gap-1 px-3 pt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {files.map((f, i) => (
            <button
              key={f.name + i}
              onClick={() => setActiveFile(i)}
              className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer border-none transition-colors duration-150 ${
                i === activeFile ? 'bg-indigo-500/15 text-indigo-300' : 'bg-white/[0.03] text-slate-500 hover:text-slate-300'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {view === 'preview' ? (
        <iframe
          title="artifact-preview"
          sandbox="allow-scripts"
          srcDoc={previewHtml}
          className="flex-1 min-h-0 w-full border-none bg-white"
        />
      ) : (
        <CodePane file={file} />
      )}
    </div>
  )
}

export default Artifact
