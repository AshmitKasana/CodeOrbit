import { motion } from 'framer-motion'

const stepIn = {
  hidden: { opacity: 0, y: 6 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.35, ease: 'easeOut' } }),
}

function ArrayDiagram({ values = [10, 20, 30, 40] }) {
  return (
    <div className="flex flex-col items-center gap-1 overflow-x-auto py-2">
      <div className="flex">
        {values.map((v, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stepIn}
            className="flex h-14 w-16 items-center justify-center border border-slate-300 font-mono text-sm text-slate-800 dark:border-surface-border dark:text-slate-100"
          >
            {v}
          </motion.div>
        ))}
      </div>
      <div className="flex">
        {values.map((_, i) => (
          <div key={i} className="w-16 text-center font-mono text-xs text-slate-400">
            {i}
          </div>
        ))}
      </div>
    </div>
  )
}

function LinkedListDiagram({ values = [10, 20, 30] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {values.map((v, i) => (
        <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stepIn} className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-surface-border">
            <div className="flex h-12 w-12 items-center justify-center bg-slate-100 font-mono text-sm text-slate-800 dark:bg-white/[0.06] dark:text-slate-100">{v}</div>
            <div className="flex h-12 w-9 items-center justify-center border-l border-slate-300 text-slate-400 dark:border-surface-border">•</div>
          </div>
          <span className="text-slate-400">{i === values.length - 1 ? '→ null' : '→'}</span>
        </motion.div>
      ))}
    </div>
  )
}

function StackDiagram() {
  const items = ['30', '20', '10']
  return (
    <div className="flex flex-col items-center py-2">
      <span className="mb-1 text-xs text-slate-400">← top</span>
      {items.map((v, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stepIn}
          className="flex h-11 w-28 items-center justify-center border border-slate-300 font-mono text-sm text-slate-800 dark:border-surface-border dark:text-slate-100"
        >
          {v}
        </motion.div>
      ))}
      <span className="mt-1 text-xs text-slate-400">bottom</span>
    </div>
  )
}

function QueueDiagram() {
  const items = ['10', '20', '30', '40']
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <div className="flex">
        {items.map((v, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stepIn}
            className="flex h-12 w-16 items-center justify-center border border-slate-300 font-mono text-sm text-slate-800 dark:border-surface-border dark:text-slate-100"
          >
            {v}
          </motion.div>
        ))}
      </div>
      <div className="flex w-full justify-between px-2 text-xs text-slate-400">
        <span>front (dequeue)</span>
        <span>rear (enqueue)</span>
      </div>
    </div>
  )
}

function TreeDiagram() {
  const nodes = [
    { x: 200, y: 30, v: 10 }, { x: 100, y: 100, v: 5 }, { x: 300, y: 100, v: 15 },
    { x: 50, y: 170, v: 2 }, { x: 150, y: 170, v: 7 }, { x: 250, y: 170, v: 12 }, { x: 350, y: 170, v: 20 },
  ]
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]
  return (
    <div className="overflow-x-auto py-2">
      <svg viewBox="0 0 400 200" className="mx-auto h-52 min-w-[360px]">
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke="currentColor" className="text-slate-300 dark:text-surface-border" strokeWidth="1.5"
          />
        ))}
        {nodes.map((n, i) => (
          <motion.g key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stepIn}>
            <circle cx={n.x} cy={n.y} r="18" className="fill-white stroke-slate-400 dark:fill-surface-card dark:stroke-slate-500" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-800 dark:fill-slate-100" fontSize="12" fontFamily="monospace">
              {n.v}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  )
}

function GraphDiagram() {
  const nodes = [
    { id: 'A', x: 60, y: 40 }, { id: 'B', x: 200, y: 20 }, { id: 'C', x: 320, y: 70 },
    { id: 'D', x: 120, y: 140 }, { id: 'E', x: 260, y: 160 },
  ]
  const edges = [['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['D', 'E'], ['C', 'E']]
  const find = (id) => nodes.find((n) => n.id === id)
  return (
    <div className="overflow-x-auto py-2">
      <svg viewBox="0 0 380 200" className="mx-auto h-52 min-w-[340px]">
        {edges.map(([a, b], i) => {
          const na = find(a), nb = find(b)
          return (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke="currentColor" className="text-slate-300 dark:text-surface-border" strokeWidth="1.5"
            />
          )
        })}
        {nodes.map((n, i) => (
          <motion.g key={n.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stepIn}>
            <circle cx={n.x} cy={n.y} r="16" className="fill-white stroke-slate-400 dark:fill-surface-card dark:stroke-slate-500" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-800 dark:fill-slate-100" fontSize="12" fontFamily="monospace">
              {n.id}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  )
}

function PointerDiagram() {
  return (
    <div className="flex flex-col items-center gap-4 py-2 sm:flex-row sm:justify-center">
      <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-slate-300 p-4 text-center dark:border-surface-border">
        <div className="font-mono text-xs text-slate-400">variable `p`</div>
        <div className="mt-1 rounded-lg bg-slate-100 px-4 py-2 font-mono text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">0x7ffee...a4</div>
      </motion.div>
      <div className="text-2xl text-slate-400">→</div>
      <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="rounded-xl border border-slate-300 p-4 text-center dark:border-surface-border">
        <div className="font-mono text-xs text-slate-400">memory @ 0x7ffee...a4</div>
        <div className="mt-1 rounded-lg bg-slate-900 px-4 py-2 font-mono text-sm text-white dark:bg-white dark:text-slate-900">value: 20</div>
      </motion.div>
    </div>
  )
}

export default function Diagram({ visual }) {
  if (!visual || visual.type === 'none') return null
  const data = visual.data || {}

  switch (visual.type) {
    case 'array':
      return <ArrayDiagram values={data.values} />
    case 'linked-list':
      return <LinkedListDiagram values={data.values} />
    case 'stack':
      return <StackDiagram />
    case 'queue':
      return <QueueDiagram />
    case 'tree':
      return <TreeDiagram />
    case 'graph':
      return <GraphDiagram />
    case 'pointer-diagram':
      return <PointerDiagram />
    default:
      return null
  }
}
