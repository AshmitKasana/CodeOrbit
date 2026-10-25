import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BookOpen, Code2, Cpu, Footprints, Layers, Network, Play } from 'lucide-react'

import TopicSidebar, { MobileTopicNav } from '../components/TopicSidebar'
import TopicHeader from '../components/TopicHeader'
import ExplanationSection from '../components/ExplanationSection'
import BigIdea from '../components/BigIdea'
import StepWalkthrough from '../components/StepWalkthrough'
import DeeperTabs from '../components/DeeperTabs'
import CodeBlock from '../components/CodeBlock'
import LanguageTabs from '../components/LanguageTabs'
import ComplexityCard from '../components/ComplexityCard'
import ComparisonTable from '../components/ComparisonTable'
import Diagram from '../components/Diagram'
import PracticeCard from '../components/PracticeCard'
import InterviewQuestion from '../components/InterviewQuestion'
import RelatedTopics from '../components/RelatedTopics'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import CodePlayground from '../components/CodePlayground'
import FollowUpChat from '../components/FollowUpChat'
import LimitReached from '../components/LimitReached'

import { useTopic } from '../hooks/useTopic'
import { useAuth } from '../hooks/useAuth'
import { refreshQuota } from '../services/aiService'
import { unslugify, isBookmarked, toggleBookmark } from '../utils/helpers'
import { getLessonExtras } from '../utils/lessonExtras'

export default function Learn() {
  const { topic: slug } = useParams()
  const location = useLocation()
  const rawQuery = location.state?.rawQuery || unslugify(slug)
  const { user } = useAuth()

  const [level, setLevel] = useState('Beginner')
  const { status, stageIndex, result, error, limit, retry, conversation, askFollowUp, followUpLoading } = useTopic(rawQuery, level)
  const [bookmarked, setBookmarked] = useState(false)
  const [exampleLang, setExampleLang] = useState(null)
  const [showPlayground, setShowPlayground] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setShowPlayground(false)
  }, [slug])

  // Show the "AI lessons left today" badge as soon as the page opens (no quota is consumed).
  useEffect(() => {
    refreshQuota()
  }, [user?.id])

  useEffect(() => {
    if (result) {
      setBookmarked(isBookmarked(result.slug, user?.id))
      setExampleLang(result.examples?.[0]?.language || null)
    }
  }, [result, user?.id])

  const extras = useMemo(() => getLessonExtras(result), [result])
  const exampleLanguages = useMemo(() => [...new Set((result?.examples || []).map((e) => e.language))], [result])
  const activeExamples = useMemo(() => (result?.examples || []).filter((e) => e.language === exampleLang), [result, exampleLang])

  function handleBookmark() {
    if (!result) return
    toggleBookmark({ slug: result.slug, title: result.title, language: result.language }, user?.id)
    setBookmarked((b) => !b)
  }

  if (status === 'loading' || status === 'idle') return <LoadingState stageIndex={stageIndex} />
  if (status === 'error') return <ErrorState error={error} onRetry={retry} />
  if (status === 'limit') return <LimitReached quota={limit?.quota} signedIn={Boolean(user) || Boolean(limit?.signedIn)} />
  if (!result) return null

  const lvl = level.toLowerCase()
  const hasVisual = result.visual && result.visual.type !== 'none'
  const diagram = hasVisual ? <Diagram visual={result.visual} /> : null

  const deeperTabs = [
    {
      id: 'mistakes',
      label: 'Common mistakes',
      content: result.commonMistakes?.length > 0 && (
        <div className="space-y-3">
          {result.commonMistakes.map((m, i) => (
            <div key={i} className="card p-4">
              <p className="font-medium text-slate-900 dark:text-white">{m.mistake}</p>
              <p className="prose-dsa mt-1 text-sm">{m.explanation}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'interview',
      label: 'Interview questions',
      content: result.interviewQuestions?.length > 0 && (
        <div className="space-y-3">
          {result.interviewQuestions.map((q, i) => (
            <InterviewQuestion key={i} item={q} index={i} />
          ))}
        </div>
      ),
    },
    {
      id: 'practice',
      label: 'Practice problems',
      content: result.practiceProblems && (
        <div className="space-y-8">
          {['easy', 'medium', 'hard'].map((diff) =>
            result.practiceProblems[diff]?.length ? (
              <div key={diff}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{diff}</h3>
                <div className="space-y-3">
                  {result.practiceProblems[diff].map((p, i) => (
                    <PracticeCard key={i} problem={p} difficulty={diff.charAt(0).toUpperCase() + diff.slice(1)} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      ),
    },
    {
      id: 'syntax',
      label: 'Syntax',
      content: result.syntax && Object.keys(result.syntax).length > 0 && (
        <div className="space-y-4">
          {Object.entries(result.syntax).map(([lang, lines]) => (
            <div key={lang}>
              <p className="mb-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">{lang}</p>
              <CodeBlock code={Array.isArray(lines) ? lines.join('\n') : String(lines)} language={lang} />
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'memory',
      label: 'Under the hood',
      content: result.memoryConcept && <Markdown text={result.memoryConcept} />,
    },
    {
      id: 'comparison',
      label: 'Across languages',
      content: result.languageComparison?.rows?.length > 0 && <ComparisonTable comparison={result.languageComparison} />,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MobileTopicNav />
      <div className="flex gap-10">
        <TopicSidebar />
        <div className="min-w-0 max-w-3xl flex-1">
          <TopicHeader result={result} level={level} onLevelChange={setLevel} bookmarked={bookmarked} onToggleBookmark={handleBookmark} />

          <BigIdea analogy={extras.analogy} takeaways={extras.takeaways} />

          <ExplanationSection id="explanation" icon={BookOpen} title="The concept">
            <Markdown text={result.overview?.[lvl] || result.overview?.beginner} />
            {(result.coreConcept?.[lvl] || result.coreConcept?.beginner) && (
              <div className="mt-5 rounded-xl border-l-2 border-signal/60 bg-slate-50 py-3 pl-4 pr-3 dark:bg-white/[0.03]">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Why it matters</p>
                <Markdown text={result.coreConcept?.[lvl] || result.coreConcept?.beginner} />
              </div>
            )}
          </ExplanationSection>

          <ExplanationSection id="walkthrough" icon={Footprints} title="Step by step">
            {extras.walkthrough.length > 0 ? (
              <StepWalkthrough steps={extras.walkthrough} aside={diagram} />
            ) : (
              <>
                <Markdown text={result.howItWorks} />
                {diagram && <div className="card mt-5 overflow-hidden p-4">{diagram}</div>}
              </>
            )}
          </ExplanationSection>

          {activeExamples.length > 0 && (
            <ExplanationSection id="code" icon={Code2} title="See it in code">
              {exampleLanguages.length > 1 && (
                <div className="mb-4">
                  <LanguageTabs languages={exampleLanguages} active={exampleLang} onChange={setExampleLang} />
                </div>
              )}
              <div className="space-y-6">
                {activeExamples.map((ex, i) => (
                  <div key={i}>
                    <p className="mb-2 font-medium text-slate-800 dark:text-slate-100">{ex.title}</p>
                    <CodeBlock code={ex.code} language={ex.language} collapsible />
                    {ex.explanation && <p className="prose-dsa mt-2 text-sm">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                {showPlayground ? (
                  <CodePlayground examples={result.examples} />
                ) : (
                  <button type="button" onClick={() => setShowPlayground(true)} className="btn-secondary">
                    <Play size={14} /> Try it yourself in the playground
                  </button>
                )}
              </div>
            </ExplanationSection>
          )}

          <ExplanationSection id="complexity" icon={Cpu} title="How fast is it?">
            <ComplexityCard complexity={result.complexity} />
          </ExplanationSection>

          <ExplanationSection id="deeper" icon={Layers} title="Go deeper">
            <DeeperTabs tabs={deeperTabs} />
          </ExplanationSection>

          <ExplanationSection id="related" icon={Network} title="Where to go next">
            <RelatedTopics topics={result.relatedTopics} />
          </ExplanationSection>

          <div className="pb-12 pt-4">
            <FollowUpChat conversation={conversation} loading={followUpLoading} onAsk={askFollowUp} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Markdown({ text }) {
  if (!text) return null
  return (
    <div className="prose-dsa">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}
