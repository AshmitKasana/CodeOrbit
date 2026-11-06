import { useState } from 'react'
import { motion } from 'framer-motion'

const stepIn = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' } }),
}

function ArrayDiagram({ values = [10, 20, 30, 40], activeStep = 0 }) {
  const [selectedIdx, setSelectedIdx] = useState(null)
  const highlighted = selectedIdx !== null ? selectedIdx : activeStep % values.length

  return (
    <div className="flex flex-col items-center gap-2 overflow-x-auto py-2">
      <div className="flex">
        {values.map((v, i) => {
          const isActive = i === highlighted
          return (
            <motion.button
              type="button"
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stepIn}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
              className={`flex h-14 w-16 items-center justify-center border font-mono text-sm transition-all duration-200 ${
                isActive
                  ? 'z-10 border-signal bg-signal/15 font-bold text-signal shadow-signal'
                  : 'border-slate-300 text-slate-800 hover:border-slate-400 dark:border-surface-border dark:text-slate-100'
              }`}
            >
              {v}
            </motion.button>
          )
        })}
      </div>
      <div className="flex">
        {values.map((_, i) => (
          <div
            key={i}
            className={`w-16 text-center font-mono text-xs transition-colors ${
              i === highlighted ? 'font-semibold text-signal' : 'text-slate-400'
            }`}
          >
            [{i}]
          </div>
        ))}
      </div>
      <p className="mt-1 font-mono text-[11px] text-slate-400">
        arr[{highlighted}] = {values[highlighted]} · addr: 0x{(0x1000 + highlighted * 4).toString(16)}
      </p>
    </div>
  )
}

function LinkedListDiagram({ values = [10, 20, 30], activeStep = 0 }) {
  const [selectedIdx, setSelectedIdx] = useState(null)
  const highlighted = selectedIdx !== null ? selectedIdx : activeStep % values.length

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex items-center justify-center gap-2 overflow-x-auto">
        {values.map((v, i) => {
          const isActive = i === highlighted
          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stepIn}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
                className={`flex overflow-hidden rounded-lg border transition-all duration-200 ${
                  isActive
                    ? 'border-signal shadow-signal'
                    : 'border-slate-300 hover:border-slate-400 dark:border-surface-border'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center font-mono text-sm ${
                    isActive
                      ? 'bg-signal/15 font-bold text-signal'
                      : 'bg-slate-100 text-slate-800 dark:bg-white/[0.06] dark:text-slate-100'
                  }`}
                >
                  {v}
                </div>
                <div className="flex h-12 w-9 items-center justify-center border-l border-slate-300 text-xs text-slate-400 dark:border-surface-border">
                  next
                </div>
              </button>
              <span className={`font-mono text-xs ${isActive ? 'font-bold text-signal' : 'text-slate-400'}`}>
                {i === values.length - 1 ? '→ null' : '→'}
              </span>
            </motion.div>
          )
        })}
      </div>
      <p className="font-mono text-[11px] text-slate-400">
        Node #{highlighted} (val: {values[highlighted]}) → {highlighted === values.length - 1 ? 'null' : `Node #${highlighted + 1}`}
      </p>
    </div>
  )
}

function StackDiagram({ activeStep = 0 }) {
  const items = [30, 20, 10]
  const highlighted = activeStep % items.length
  return (
    <div className="flex flex-col items-center py-2">
      <span className="mb-1 font-mono text-xs text-signal">← top (push / pop O(1))</span>
      {items.map((v, i) => {
        const isActive = i === highlighted
        return (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stepIn}
            className={`flex h-11 w-28 items-center justify-center border font-mono text-sm transition-colors ${
              isActive
                ? 'border-signal bg-signal/15 font-bold text-signal'
                : 'border-slate-300 text-slate-800 dark:border-surface-border dark:text-slate-100'
            }`}
          >
            {v}
          </motion.div>
        )
      })}
      <span className="mt-1 font-mono text-xs text-slate-400">bottom</span>
    </div>
  )
}

function QueueDiagram({ activeStep = 0 }) {
  const items = [10, 20, 30, 40]
  const highlighted = activeStep % items.length
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex">
        {items.map((v, i) => {
          const isActive = i === highlighted
          return (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stepIn}
              className={`flex h-12 w-16 items-center justify-center border font-mono text-sm transition-colors ${
                isActive
                  ? 'border-signal bg-signal/15 font-bold text-signal'
                  : 'border-slate-300 text-slate-800 dark:border-surface-border dark:text-slate-100'
              }`}
            >
              {v}
            </motion.div>
          )
        })}
      </div>
      <div className="flex w-full max-w-xs justify-between px-2 font-mono text-xs text-slate-400">
        <span className="text-signal">↑ front (dequeue)</span>
        <span>rear (enqueue) ↑</span>
      </div>
    </div>
  )
}

function TreeDiagram({ activeStep = 0 }) {
  const nodes = [
    { x: 200, y: 30, v: 10 },
    { x: 100, y: 100, v: 5 },
    { x: 300, y: 100, v: 15 },
    { x: 50, y: 170, v: 2 },
    { x: 150, y: 170, v: 7 },
    { x: 250, y: 170, v: 12 },
    { x: 350, y: 170, v: 20 },
  ]
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6],
  ]
  const [selectedIdx, setSelectedIdx] = useState(null)
  const highlighted = selectedIdx !== null ? selectedIdx : activeStep % nodes.length

  return (
    <svg viewBox="0 0 400 200" className="mx-auto h-52">
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="currentColor"
          className={b === highlighted ? 'text-signal' : 'text-slate-300 dark:text-surface-border'}
          strokeWidth={b === highlighted ? '2.2' : '1.5'}
        />
      ))}
      {nodes.map((n, i) => {
        const isActive = i === highlighted
        return (
          <motion.g
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stepIn}
            onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
            className="cursor-pointer"
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="18"
              className={
                isActive
                  ? 'fill-signal/20 stroke-signal'
                  : 'fill-white stroke-slate-400 dark:fill-surface-card dark:stroke-slate-500'
              }
              strokeWidth={isActive ? '2.2' : '1.5'}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              className={isActive ? 'fill-signal font-bold' : 'fill-slate-800 dark:fill-slate-100'}
              fontSize="12"
              fontFamily="monospace"
            >
              {n.v}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function GraphDiagram({ activeStep = 0 }) {
  const nodes = [
    { id: 'A', x: 60, y: 40 },
    { id: 'B', x: 200, y: 20 },
    { id: 'C', x: 320, y: 70 },
    { id: 'D', x: 120, y: 140 },
    { id: 'E', x: 260, y: 160 },
  ]
  const edges = [
    ['A', 'B'],
    ['A', 'D'],
    ['B', 'C'],
    ['B', 'D'],
    ['D', 'E'],
    ['C', 'E'],
  ]
  const [selectedIdx, setSelectedIdx] = useState(null)
  const highlighted = selectedIdx !== null ? selectedIdx : activeStep % nodes.length
  const activeId = nodes[highlighted]?.id
  const find = (id) => nodes.find((n) => n.id === id)

  return (
    <svg viewBox="0 0 380 200" className="mx-auto h-52">
      {edges.map(([a, b], i) => {
        const na = find(a)
        const nb = find(b)
        const touched = a === activeId || b === activeId
        return (
          <motion.line
            key={i}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
            x1={na.x}
            y1={na.y}
            x2={nb.x}
            y2={nb.y}
            stroke="currentColor"
            className={touched ? 'text-signal' : 'text-slate-300 dark:text-surface-border'}
            strokeWidth={touched ? '2.2' : '1.5'}
          />
        )
      })}
      {nodes.map((n, i) => {
        const isActive = i === highlighted
        return (
          <motion.g
            key={n.id}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stepIn}
            onClick={() => setSelectedIdx(i === selectedIdx ? null : i)}
            className="cursor-pointer"
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="17"
              className={
                isActive
                  ? 'fill-signal/20 stroke-signal'
                  : 'fill-white stroke-slate-400 dark:fill-surface-card dark:stroke-slate-500'
              }
              strokeWidth={isActive ? '2.2' : '1.5'}
            />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              className={isActive ? 'fill-signal font-bold' : 'fill-slate-800 dark:fill-slate-100'}
              fontSize="12"
              fontFamily="monospace"
            >
              {n.id}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function PointerDiagram({ activeStep = 0 }) {
  return (
    <div className="flex flex-col items-center gap-4 py-2 sm:flex-row sm:justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`rounded-xl border p-4 text-center transition-colors ${
          activeStep % 2 === 0 ? 'border-signal bg-signal/5' : 'border-slate-300 dark:border-surface-border'
        }`}
      >
        <div className="font-mono text-xs text-slate-400">pointer `p` (stack @ 0x7ffee...10)</div>
        <div className="mt-1 rounded-lg bg-slate-100 px-4 py-2 font-mono text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">
          0x7ffee...a4
        </div>
      </motion.div>
      <div className="text-2xl text-signal">→</div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.12 }}
        className={`rounded-xl border p-4 text-center transition-colors ${
          activeStep % 2 === 1 ? 'border-signal bg-signal/5' : 'border-slate-900 dark:border-white'
        }`}
      >
        <div className="font-mono text-xs text-slate-400">target `x` (memory @ 0x7ffee...a4)</div>
        <div className="mt-1 rounded-lg bg-slate-900 px-4 py-2 font-mono text-sm text-white dark:bg-white dark:text-slate-900">
          value: 20
        </div>
      </motion.div>
    </div>
  )
}

export default function Diagram({ visual, activeStep = 0 }) {
  if (!visual || visual.type === 'none') return null
  const data = visual.data || {}

  switch (visual.type) {
    case 'array':
      return <ArrayDiagram values={data.values} activeStep={activeStep} />
    case 'linked-list':
      return <LinkedListDiagram values={data.values} activeStep={activeStep} />
    case 'stack':
      return <StackDiagram activeStep={activeStep} />
    case 'queue':
      return <QueueDiagram activeStep={activeStep} />
    case 'tree':
      return <TreeDiagram activeStep={activeStep} />
    case 'graph':
      return <GraphDiagram activeStep={activeStep} />
    case 'pointer-diagram':
      return <PointerDiagram activeStep={activeStep} />
    default:
      return null
  }
}
