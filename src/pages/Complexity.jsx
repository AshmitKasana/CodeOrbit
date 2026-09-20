import { useEffect, useMemo, useState } from 'react'
import Reveal from '../components/Reveal'
import { useAuth } from '../hooks/useAuth'
import { recordActivity } from '../lib/progress'
import { CURVES, DATA_STRUCTURE_NOTES, DATA_STRUCTURE_TABLE, curvePoints, formatOps, humanTime, opsAt } from '../lib/complexity'

const W = 640
const H = 340
const PAD = { top: 16, right: 20, bottom: 34, left: 52 }
const RANGES = [20, 50, 100]
const LOG_CEILING = 12 // plot up to 10^12 operations on the log scale

// Slider position 0–60 → n = 10^(p/10), i.e. 1 … 1,000,000.
const sliderToN = (p) => Math.max(1, Math.round(10 ** (p / 10)))

function Chart({ chartN, log, visible, marker }) {
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const yMax = log ? LOG_CEILING : chartN
  const x = (n) => PAD.left + ((n - 1) / Math.max(1, chartN - 1)) * innerW
  const y = (v) => PAD.top + innerH - (Math.min(v, yMax) / yMax) * innerH

  const yTicks = log ? [0, 3, 6, 9, 12] : [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * yMax))
  const xTicks = [1, ...[0.25, 0.5, 0.75, 1].map((f) => Math.round(f * chartN))]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-slate-400 dark:text-slate-500" role="img" aria-label="Growth of operations against input size for common complexity classes">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity="0.18" />
          <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="currentColor">
            {log ? (t === 0 ? '1' : `10${superscript(t)}`) : formatOps(t)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} x={x(t)} y={H - 12} textAnchor="middle" fontSize="11" fill="currentColor">{t}</text>
      ))}
      <text x={W / 2} y={H - 1} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">input size n</text>

      {CURVES.filter((c) => visible.includes(c.id)).map((curve) => {
        const points = curvePoints(curve.id, chartN, { log, yMax })
        if (points.length < 2) return null
        const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.n).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ')
        return <path key={curve.id} d={d} fill="none" stroke={curve.color} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      })}

      {marker <= chartN && (
        <g>
          <line x1={x(marker)} x2={x(marker)} y1={PAD.top} y2={PAD.top + innerH} stroke="#5b7fff" strokeDasharray="4 4" />
          <text x={x(marker)} y={PAD.top - 4} textAnchor="middle" fontSize="10" fill="#5b7fff">n = {marker}</text>
        </g>
      )}
    </svg>
  )
}

function superscript(n) {
  return String(n).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])
}

export default function Complexity() {
  const { user } = useAuth()
  const [position, setPosition] = useState(30) // n = 1000
  const [chartN, setChartN] = useState(50)
  const [log, setLog] = useState(true)
  const [visible, setVisible] = useState(CURVES.map((c) => c.id))

  const n = sliderToN(position)

  useEffect(() => {
    recordActivity(user?.id, 'complexity')
    // once per visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rows = useMemo(
    () =>
      CURVES.map((curve) => {
        const ops = opsAt(curve.id, n)
        return { curve, ops, time: humanTime(ops) }
      }),
    [n]
  )

  function toggle(id) {
    setVisible((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Reveal className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-surface-border dark:text-slate-400">
          Interactive lab
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Big-O Explorer</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
          Big-O describes how an algorithm slows down as its input grows. Drag the slider to see what each complexity class costs in
          real time — and why O(n²) is fine for 100 items but painful for a million.
        </p>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="card p-4 sm:p-5 lg:col-span-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {CURVES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  aria-pressed={visible.includes(c.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    visible.includes(c.id)
                      ? 'border-slate-300 text-slate-800 dark:border-slate-600 dark:text-slate-100'
                      : 'border-slate-200 text-slate-400 opacity-60 dark:border-surface-border'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-surface-border">
                {[['Log scale', true], ['Linear', false]].map(([label, value]) => (
                  <button
                    key={label}
                    onClick={() => setLog(value)}
                    className={`rounded-md px-2.5 py-1 font-medium transition ${
                      log === value ? 'bg-accent text-accent-fg' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <select
                value={chartN}
                onChange={(e) => setChartN(Number(e.target.value))}
                aria-label="Chart range"
                className="rounded-lg border border-slate-200 bg-transparent px-2 py-1.5 text-xs text-slate-600 dark:border-surface-border dark:bg-surface-card dark:text-slate-300"
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>n up to {r}</option>
                ))}
              </select>
            </div>
          </div>
          <Chart chartN={chartN} log={log} visible={visible} marker={n} />
          <p className="mt-2 text-xs text-slate-400">
            {log
              ? 'Log scale: each gridline is 1,000× more operations than the one below it, so every curve stays visible.'
              : 'Linear scale: watch O(n²), O(2ⁿ) and O(n!) shoot off the top while O(log n) hugs the floor.'}
          </p>
        </div>

        <div className="card p-4 sm:p-5 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Input size</p>
          <p className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white">
            n = <span className="text-signal">{n.toLocaleString('en-US')}</span>
          </p>
          <input
            type="range"
            min="0"
            max="60"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-3 w-full accent-[#5b7fff]"
            aria-label="Input size n"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>1</span><span>1,000</span><span>1,000,000</span>
          </div>

          <div className="mt-5 space-y-1.5">
            {rows.map(({ curve, ops, time }) => (
              <div key={curve.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]">
                <span className="flex items-center gap-2 font-mono font-semibold text-slate-900 dark:text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: curve.color }} />
                  {curve.label}
                </span>
                <span className="text-right text-xs text-slate-500 dark:text-slate-400">
                  <span className="block font-mono text-slate-700 dark:text-slate-200">
                    {Number.isFinite(ops) ? `${formatOps(ops)} ops` : 'astronomically many ops'}
                  </span>
                  {time}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">Time assumes a computer doing one billion simple operations per second.</p>
        </div>
      </div>

      <Reveal className="card mt-5 overflow-x-auto p-4 sm:p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-slate-900 dark:text-white">What each class looks like in real code</h2>
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 pr-4 font-semibold">Complexity</th>
              <th className="pb-2 pr-4 font-semibold">Name</th>
              <th className="pb-2 font-semibold">Typical example</th>
            </tr>
          </thead>
          <tbody>
            {CURVES.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 dark:border-surface-border/60">
                <td className="py-2 pr-4 font-mono font-semibold text-slate-900 dark:text-white">
                  <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: c.color }} />
                  {c.label}
                </td>
                <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{c.name}</td>
                <td className="py-2 text-slate-500 dark:text-slate-400">{c.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal className="card mt-5 overflow-x-auto p-4 sm:p-5">
        <h2 className="mb-1 font-display text-lg font-semibold text-slate-900 dark:text-white">Data-structure cheat sheet</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Typical costs of the core operations — the table interviewers expect you to know.</p>
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              {['Structure', 'Access', 'Search', 'Insert', 'Remove', 'Space'].map((h) => (
                <th key={h} className="pb-2 pr-4 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DATA_STRUCTURE_TABLE.map((row) => (
              <tr key={row.name} className="border-t border-slate-100 dark:border-surface-border/60">
                <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{row.name}</td>
                {['access', 'search', 'insert', 'remove', 'space'].map((k) => (
                  <td key={k} className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-300">{row[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-3 space-y-1 text-xs text-slate-400">
          {DATA_STRUCTURE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Reveal>
    </div>
  )
}
