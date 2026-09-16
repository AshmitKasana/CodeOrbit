import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronsDownUp, ChevronsUpDown, Copy } from 'lucide-react'

const PRISM_LANG = {
  Java: 'java', C: 'c', 'C++': 'cpp', Python: 'python', JavaScript: 'javascript',
  TypeScript: 'typescript', 'C#': 'csharp', Go: 'go', Rust: 'rust', Kotlin: 'kotlin', Swift: 'swift',
}

export default function CodeBlock({ code, language = 'JavaScript', collapsible = false, maxLines = 14 }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(!collapsible)
  const lines = code.split('\n')
  const isLong = collapsible && lines.length > maxLines
  const shown = expanded || !isLong ? code : lines.slice(0, maxLines).join('\n') + '\n// ...'

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-[#0d0d0f]">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-3 py-1.5">
        <span className="font-mono text-xs text-slate-400">{language}</span>
        <div className="flex items-center gap-1">
          {isLong && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {expanded ? <ChevronsDownUp size={13} /> : <ChevronsUpDown size={13} />}
              {expanded ? 'Collapse' : 'Expand'}
            </button>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1">
                  <Check size={13} className="text-white" /> Copied
                </motion.span>
              ) : (
                <motion.span key="copy" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} className="flex items-center gap-1">
                  <Copy size={13} /> Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={PRISM_LANG[language] || 'text'}
          style={oneDark}
          customStyle={{ margin: 0, background: 'transparent', padding: '14px 16px', fontSize: '13px' }}
          wrapLongLines={false}
        >
          {shown}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
