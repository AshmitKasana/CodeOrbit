import { useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, RotateCcw, Terminal } from 'lucide-react'
import LanguageTabs from './LanguageTabs'

const MONACO_LANG = {
  Java: 'java', C: 'c', 'C++': 'cpp', Python: 'python', JavaScript: 'javascript',
  TypeScript: 'typescript', 'C#': 'csharp', Go: 'go', Rust: 'rust', Kotlin: 'kotlin', Swift: 'swift',
}

export default function CodePlayground({ examples = [] }) {
  const languages = useMemo(() => [...new Set(examples.map((e) => e.language))], [examples])
  const [activeLang, setActiveLang] = useState(languages[0])
  const initialCode = examples.find((e) => e.language === activeLang)?.code || ''
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    setCode(examples.find((e) => e.language === activeLang)?.code || '')
    setOutput(null)
  }, [activeLang]) // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setCode(examples.find((e) => e.language === activeLang)?.code || '')
    setOutput(null)
  }

  function run() {
    setRunning(true)
    setOutput(null)
    setTimeout(() => {
      if (activeLang === 'JavaScript' || activeLang === 'TypeScript') {
        const logs = []
        const fakeConsole = { log: (...args) => logs.push(args.map(String).join(' ')) }
        try {
          // Executes only the user's own locally-edited snippet in this browser tab —
          // never sent anywhere. Non-JS languages need a real backend sandbox (see below).
          // eslint-disable-next-line no-new-func
          const fn = new Function('console', code)
          fn(fakeConsole)
          setOutput({ ok: true, text: logs.length ? logs.join('\n') : '(no console output — try adding console.log(...))' })
        } catch (err) {
          setOutput({ ok: false, text: String(err) })
        }
      } else {
        setOutput({
          ok: null,
          text: `Live execution for ${activeLang} requires a secure backend sandbox (e.g. a containerized code-execution service) which isn't connected in this demo. JavaScript/TypeScript run directly in your browser above.`,
        })
      }
      setRunning(false)
    }, 400)
  }

  if (!languages.length) return null

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-200 px-4 pt-3 dark:border-surface-border">
        <LanguageTabs languages={languages} active={activeLang} onChange={setActiveLang} />
      </div>
      <div className="h-72 border-b border-slate-200 dark:border-surface-border">
        <Editor
          height="100%"
          language={MONACO_LANG[activeLang] || 'plaintext'}
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme="vs-dark"
          options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 } }}
        />
      </div>
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={run} disabled={running} className="btn-primary py-1.5">
          <Play size={14} /> {running ? 'Running...' : 'Run'}
        </button>
        <button onClick={reset} className="btn-secondary py-1.5">
          <RotateCcw size={14} /> Reset
        </button>
      </div>
      {output && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-surface-border">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Terminal size={13} /> OUTPUT
          </div>
          <pre
            className={`whitespace-pre-wrap rounded-lg px-3 py-2 font-mono text-xs ${
              output.ok === false
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : output.ok === true
                ? 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                : 'bg-slate-100 text-slate-500 dark:bg-white/5'
            }`}
          >
            {output.text}
          </pre>
        </div>
      )}
    </div>
  )
}
