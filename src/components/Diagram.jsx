import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Play, RotateCcw, Trash2 } from 'lucide-react'

const stepIn = {
  hidden: { opacity: 0, y: 6 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.2, ease: [0.22, 1, 0.36, 1] } }),
}

function ArrayDiagram({ values: initialValues = [10, 20, 30, 40] }) {
  const [items, setItems] = useState(initialValues)
  const [activeIdx, setActiveIdx] = useState(0)
  const [statusText, setStatusText] = useState('Click any cell to inspect O(1) index address calculation, or append/pop elements.')

  function appendItem() {
    if (items.length >= 8) return
    const nextVal = (items[items.length - 1] || 0) + 10
    const next = [...items, nextVal]
    setItems(next)
    setActiveIdx(next.length - 1)
    setStatusText(`Appended ${nextVal} at index ${next.length - 1} — amortized O(1) time.`)
  }

  function popItem() {
    if (items.length <= 1) return
    const removed = items[items.length - 1]
    const next = items.slice(0, -1)
    setItems(next)
    setActiveIdx(Math.min(activeIdx, next.length - 1))
    setStatusText(`Popped ${removed} from end — O(1) time.`)
  }

  function insertAtZero() {
    if (items.length >= 8) return
    const nextVal = Math.floor(Math.random() * 89) + 10
    setItems([nextVal, ...items])
    setActiveIdx(0)
    setStatusText(`Inserted ${nextVal} at index 0 — O(n) time (shifted ${items.length} elements right).`)
  }

  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto py-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={appendItem} className="chip px-2.5 py-1 text-xs">
          <Plus size={12} className="mr-1 inline" /> Append O(1)
        </button>
        <button type="button" onClick={insertAtZero} className="chip px-2.5 py-1 text-xs">
          <Plus size={12} className="mr-1 inline" /> Insert @ 0 O(n)
        </button>
        <button type="button" onClick={popItem} className="chip px-2.5 py-1 text-xs">
          <Trash2 size={12} className="mr-1 inline" /> Pop End O(1)
        </button>
        <button
          type="button"
          onClick={() => {
            setItems(initialValues)
            setActiveIdx(0)
            setStatusText('Reset array to initial values.')
          }}
          className="chip px-2.5 py-1 text-xs"
        >
          <RotateCcw size={12} className="mr-1 inline" /> Reset
        </button>
      </div>

      <div className="flex">
        <AnimatePresence initial={false}>
          {items.map((v, i) => {
            const isSelected = i === activeIdx
            return (
              <motion.button
                key={`${i}-${v}`}
                type="button"
                onClick={() => {
                  setActiveIdx(i)
                  setStatusText(`arr[${i}] = ${v} → Address = base + ${i} × 4 bytes = 0x${(0x1000 + i * 4).toString(16)} (O(1) random access)`)
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.16 }}
                className={`flex h-14 w-16 flex-col items-center justify-center border font-mono text-sm transition ${
                  isSelected
                    ? 'border-signal bg-signal/15 font-bold text-signal'
                    : 'border-slate-300 text-slate-800 hover:bg-slate-50 dark:border-surface-border dark:text-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <span>{v}</span>
                <span className="text-[10px] font-normal text-slate-400">[{i}]</span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
      <p className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">{statusText}</p>
    </div>
  )
}

function LinkedListDiagram({ values: initialValues = [10, 20, 30] }) {
  const [nodes, setNodes] = useState(initialValues)
  const [highlightIdx, setHighlightIdx] = useState(null)
  const [note, setNote] = useState('Click a node or operation below to see pointer updates.')

  function prependHead() {
    if (nodes.length >= 6) return
    const val = (nodes[0] || 10) - 5
    setNodes([val, ...nodes])
    setHighlightIdx(0)
    setNote(`Prepended ${val} at head: newNode.next = head; head = newNode — O(1) time.`)
  }

  function appendTail() {
    if (nodes.length >= 6) return
    const val = (nodes[nodes.length - 1] || 10) + 10
    const next = [...nodes, val]
    setNodes(next)
    setHighlightIdx(next.length - 1)
    setNote(`Appended ${val} at tail: traversed ${nodes.length} nodes to link tail.next — O(n) without tail pointer.`)
  }

  function removeHead() {
    if (nodes.length <= 1) return
    const removed = nodes[0]
    setNodes(nodes.slice(1))
    setHighlightIdx(0)
    setNote(`Deleted head (${removed}): head = head.next — O(1) time.`)
  }

  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto py-2">
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={prependHead} className="chip px-2.5 py-1 text-xs">
          <Plus size={12} className="mr-1 inline" /> Prepend Head O(1)
        </button>
        <button type="button" onClick={appendTail} className="chip px-2.5 py-1 text-xs">
          <Plus size={12} className="mr-1 inline" /> Append Tail O(n)
        </button>
        <button type="button" onClick={removeHead} className="chip px-2.5 py-1 text-xs">
          <Trash2 size={12} className="mr-1 inline" /> Delete Head O(1)
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {nodes.map((v, i) => (
          <motion.div
            key={`${i}-${v}`}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stepIn}
            onClick={() => {
              setHighlightIdx(i)
              setNote(`Node #${i} (val=${v}): reached by following ${i} .next pointer${i === 1 ? '' : 's'} from head — O(n) lookup.`)
            }}
            className="flex cursor-pointer items-center gap-2"
          >
            <div
              className={`flex overflow-hidden rounded-lg border transition ${
                highlightIdx === i
                  ? 'border-signal ring-2 ring-signal/20'
                  : 'border-slate-300 dark:border-surface-border'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center bg-slate-100 font-mono text-sm text-slate-800 dark:bg-white/[0.06] dark:text-slate-100">
                {v}
              </div>
              <div className="flex h-12 w-9 items-center justify-center border-l border-slate-300 text-xs text-slate-400 dark:border-surface-border">
                next
              </div>
            </div>
            <span className="font-mono text-xs text-slate-400">{i === nodes.length - 1 ? '→ null' : '→'}</span>
          </motion.div>
        ))}
      </div>
      <p className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

function StackDiagram() {
  const [items, setItems] = useState([30, 20, 10])
  const [note, setNote] = useState('LIFO (Last-In, First-Out): Push and Pop operate strictly at the top in O(1) time.')

  function push() {
    if (items.length >= 6) return
    const nextVal = (items[0] || 0) + 10
    setItems([nextVal, ...items])
    setNote(`push(${nextVal}) → new top of stack in O(1) time.`)
  }

  function pop() {
    if (items.length <= 1) return
    const [top, ...rest] = items
    setItems(rest)
    setNote(`pop() → returned ${top} from top of stack in O(1) time.`)
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex gap-2">
        <button type="button" onClick={push} className="chip px-2.5 py-1 text-xs">
          <Plus size={12} className="mr-1 inline" /> Push O(1)
        </button>
        <button type="button" onClick={pop} className="chip px-2.5 py-1 text-xs">
          <Trash2 size={12} className="mr-1 inline" /> Pop O(1)
        </button>
      </div>
      <div className="flex flex-col items-center">
        <span className="mb-1 font-mono text-xs text-signal">← top (peek = {items[0]})</span>
        <AnimatePresence initial={false}>
          {items.map((v, i) => (
            <motion.div
              key={`${v}-${items.length - i}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.16 }}
              className={`flex h-11 w-32 items-center justify-center border font-mono text-sm ${
                i === 0
                  ? 'border-signal bg-signal/10 font-semibold text-signal'
                  : 'border-slate-300 text-slate-800 dark:border-surface-border dark:text-slate-100'
              }`}
            >
              {v}
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="mt-1 font-mono text-xs text-slate-400">bottom</span>
      </div>
      <p className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

function QueueDiagram() {
  const [items, setItems] = useState([10, 20, 30, 40])
  const [note, setNote] = useState('FIFO (First-In, First-Out): Enqueue at rear, Dequeue from front in O(1) time.')

  function enqueue() {
    if (items.length >= 7) return
    const nextVal = (items[items.length - 1] || 0) + 10
    setItems([...items, nextVal])
    setNote(`enqueue(${nextVal}) at rear — O(1) time.`)
  }

  function dequeue() {
    if (items.length <= 1) return
    const [front, ...rest] = items
    setItems(rest)
    setNote(`dequeue() removed ${front} from front — O(1) time.`)
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex gap-2">
        <button type="button" onClick={enqueue} className="chip px-2.5 py-1 text-xs">
          <Plus size={12} className="mr-1 inline" /> Enqueue Rear O(1)
        </button>
        <button type="button" onClick={dequeue} className="chip px-2.5 py-1 text-xs">
          <Trash2 size={12} className="mr-1 inline" /> Dequeue Front O(1)
        </button>
      </div>
      <div className="flex">
        <AnimatePresence initial={false}>
          {items.map((v, i) => (
            <motion.div
              key={`${i}-${v}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16 }}
              className={`flex h-12 w-16 items-center justify-center border font-mono text-sm ${
                i === 0
                  ? 'border-signal bg-signal/10 font-semibold text-signal'
                  : 'border-slate-300 text-slate-800 dark:border-surface-border dark:text-slate-100'
              }`}
            >
              {v}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex w-full max-w-xs justify-between px-2 font-mono text-xs text-slate-400">
        <span>↑ front (dequeue)</span>
        <span>rear (enqueue) ↑</span>
      </div>
      <p className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">{note}</p>
    </div>
  )
}

function TreeDiagram() {
  const nodes = [
    { x: 200, y: 30, v: 10 }, { x: 100, y: 100, v: 5 }, { x: 300, y: 100, v: 15 },
    { x: 50, y: 170, v: 2 }, { x: 150, y: 170, v: 7 }, { x: 250, y: 170, v: 12 }, { x: 350, y: 170, v: 20 },
  ]
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]

  const TRAVERSALS = {
    'Inorder (L-N-R)': [3, 1, 4, 0, 5, 2, 6],
    'Preorder (N-L-R)': [0, 1, 3, 4, 2, 5, 6],
    'Postorder (L-R-N)': [3, 4, 1, 5, 6, 2, 0],
    'Level-Order (BFS)': [0, 1, 2, 3, 4, 5, 6],
  }

  const [mode, setMode] = useState('Inorder (L-N-R)')
  const [step, setStep] = useState(-1)

  const order = TRAVERSALS[mode]
  const visitedSet = new Set(step >= 0 ? order.slice(0, step + 1) : [])
  const activeNodeIdx = step >= 0 ? order[step] : null

  function playTraversal(selectedMode) {
    setMode(selectedMode)
    setStep(0)
    const seq = TRAVERSALS[selectedMode]
    seq.forEach((_, idx) => {
      if (idx === 0) return
      setTimeout(() => setStep(idx), idx * 240)
    })
  }

  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto py-2">
      <div className="flex flex-wrap justify-center gap-1.5">
        {Object.keys(TRAVERSALS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => playTraversal(name)}
            className={`chip px-2.5 py-1 text-xs ${
              mode === name && step >= 0 ? 'border-signal bg-signal/10 text-signal' : ''
            }`}
          >
            <Play size={11} className="mr-1 inline" /> {name}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 400 200" className="mx-auto h-52 min-w-[360px]">
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke="currentColor" className="text-slate-300 dark:text-surface-border" strokeWidth="1.5"
          />
        ))}
        {nodes.map((n, i) => {
          const isCurrent = activeNodeIdx === i
          const isVisited = visitedSet.has(i)
          return (
            <motion.g key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stepIn}>
              <circle
                cx={n.x}
                cy={n.y}
                r="18"
                className={
                  isCurrent
                    ? 'fill-signal stroke-signal'
                    : isVisited
                    ? 'fill-signal/20 stroke-signal'
                    : 'fill-white stroke-slate-400 dark:fill-surface-card dark:stroke-slate-500'
                }
                strokeWidth="1.5"
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                className={isCurrent ? 'fill-white font-bold' : 'fill-slate-800 dark:fill-slate-100'}
                fontSize="12"
                fontFamily="monospace"
              >
                {n.v}
              </text>
            </motion.g>
          )
        })}
      </svg>
      <p className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">
        {mode}: [{order.map((idx, s) => (s <= step || step === -1 ? nodes[idx].v : '…')).join(' → ')}]
      </p>
    </div>
  )
}

function GraphDiagram() {
  const nodes = [
    { id: 'A', x: 60, y: 40 }, { id: 'B', x: 200, y: 20 }, { id: 'C', x: 320, y: 70 },
    { id: 'D', x: 120, y: 140 }, { id: 'E', x: 260, y: 160 },
  ]
  const edges = [['A', 'B'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['D', 'E'], ['C', 'E']]
  const adj = {
    A: ['B', 'D'],
    B: ['A', 'C', 'D'],
    C: ['B', 'E'],
    D: ['A', 'B', 'E'],
    E: ['D', 'C'],
  }

  const [startNode, setStartNode] = useState('A')
  const [algo, setAlgo] = useState('BFS')
  const find = (id) => nodes.find((n) => n.id === id)

  function computeOrder(start, type) {
    const visited = []
    const seen = new Set()
    if (type === 'BFS') {
      const q = [start]
      seen.add(start)
      while (q.length) {
        const u = q.shift()
        visited.push(u)
        for (const v of adj[u] || []) {
          if (!seen.has(v)) {
            seen.add(v)
            q.push(v)
          }
        }
      }
    } else {
      function dfs(u) {
        seen.add(u)
        visited.push(u)
        for (const v of adj[u] || []) {
          if (!seen.has(v)) dfs(v)
        }
      }
      dfs(start)
    }
    return visited
  }

  const order = computeOrder(startNode, algo)

  return (
    <div className="flex flex-col items-center gap-3 overflow-x-auto py-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {['BFS', 'DFS'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setAlgo(t)}
            className={`chip px-3 py-1 text-xs ${algo === t ? 'border-signal bg-signal/10 text-signal' : ''}`}
          >
            {t}
          </button>
        ))}
        <span className="text-xs text-slate-400">Click any vertex (A–E) to change start node:</span>
      </div>
      <svg viewBox="0 0 380 200" className="mx-auto h-52 min-w-[340px]">
        {edges.map(([a, b], i) => {
          const na = find(a), nb = find(b)
          return (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke="currentColor" className="text-slate-300 dark:text-surface-border" strokeWidth="1.5"
            />
          )
        })}
        {nodes.map((n, i) => {
          const isStart = n.id === startNode
          const visitRank = order.indexOf(n.id) + 1
          return (
            <motion.g
              key={n.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stepIn}
              onClick={() => setStartNode(n.id)}
              className="cursor-pointer"
            >
              <circle
                cx={n.x}
                cy={n.y}
                r="17"
                className={
                  isStart
                    ? 'fill-signal stroke-signal'
                    : 'fill-white stroke-slate-400 dark:fill-surface-card dark:stroke-slate-500'
                }
                strokeWidth="1.5"
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                className={isStart ? 'fill-white font-bold' : 'fill-slate-800 dark:fill-slate-100'}
                fontSize="12"
                fontFamily="monospace"
              >
                {n.id}
              </text>
              <text x={n.x + 22} y={n.y - 10} className="fill-signal" fontSize="10" fontFamily="monospace">
                #{visitRank}
              </text>
            </motion.g>
          )
        })}
      </svg>
      <p className="text-center font-mono text-xs text-slate-500 dark:text-slate-400">
        {algo} from {startNode}: {order.join(' → ')} (Time: O(V + E), Space: O(V))
      </p>
    </div>
  )
}

function PointerDiagram() {
  const [val, setVal] = useState(20)
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-slate-300 p-4 text-center dark:border-surface-border">
          <div className="font-mono text-xs text-slate-400">pointer `p` (stack @ 0x7ffee...10)</div>
          <div className="mt-1 rounded-lg bg-slate-100 px-4 py-2 font-mono text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200">0x7ffee...a4</div>
        </motion.div>
        <div className="text-2xl text-signal">→</div>
        <motion.div initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }} className="rounded-xl border border-signal/40 p-4 text-center">
          <div className="font-mono text-xs text-slate-400">target `*p` (memory @ 0x7ffee...a4)</div>
          <div className="mt-1 rounded-lg bg-slate-900 px-4 py-2 font-mono text-sm text-white dark:bg-white dark:text-slate-900">value: {val}</div>
        </motion.div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setVal((v) => v + 5)} className="chip px-2.5 py-1 font-mono text-xs">
          *p += 5 (dereference &amp; mutate)
        </button>
        <button type="button" onClick={() => setVal(20)} className="chip px-2.5 py-1 font-mono text-xs">
          *p = 20
        </button>
      </div>
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
