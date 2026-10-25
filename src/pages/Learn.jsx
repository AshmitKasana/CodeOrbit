import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  AlertOctagon, BookOpen, Boxes, Braces, Cpu, GitCompareArrows,
  ListChecks, MessageCircleQuestion, Network, PenTool, Workflow,
} from 'lucide-react'

import TopicSidebar, { MobileTopicNav } from '../components/TopicSidebar'
import TopicHeader from '../components/TopicHeader'
import ExplanationSection from '../components/ExplanationSection'
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

export default function Learn() {
  const { topic: slug } = useParams()
  const location = useLocation()
  const rawQuery = location.state?.rawQuery || unslugify(slug)
  const { user } = useAuth()

  const [level, setLevel] = useState('Beginner')
  const { status, stageIndex, result, error, limit, retry, conversation, askFollowUp, followUpLoading } = useTopic(rawQuery, level)
  const [bookmarked, setBookmarked] = useState(false)
  const [exampleLang, setExampleLang] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MobileTopicNav />
      <div className="flex gap-10">
        <TopicSidebar />
        <div className="min-w-0 flex-1">
          <TopicHeader
            result={result}
            level={level}
            onLevelChange={setLevel}
            bookmarked={bookmarked}
            onToggleBookmark={handleBookmark}
          />

          <ExplanationSection id="overview" icon={BookOpen} title="Overview">
            <Markdown text={result.overview?.[level.toLowerCase()] || result.overview?.beginner} />
          </ExplanationSection>

          <ExplanationSection id="core-concept" icon={Cpu} title="Core Concept">
            <Markdown text={result.coreConcept?.[level.toLowerCase()] || result.coreConcept?.beginner} />
          </ExplanationSection>

          {result.syntax && Object.keys(result.syntax).length > 0 && (
            <ExplanationSection id="syntax" icon={Braces} title="Syntax">
              <div className="space-y-4">
                {Object.entries(result.syntax).map(([lang, lines]) => (
                  <div key={lang}>
                    <p className="mb-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">{lang}</p>
                    <CodeBlock code={Array.isArray(lines) ? lines.join('\n') : String(lines)} language={lang} />
                  </div>
                ))}
              </div>
            </ExplanationSection>
          )}

          <ExplanationSection id="how-it-works" icon={Workflow} title="How It Works">
            <Markdown text={result.howItWorks} />
          </ExplanationSection>

          <ExplanationSection id="memory" icon={Boxes} title="Memory / Internal Working">
            <Markdown text={result.memoryConcept} />
          </ExplanationSection>

          {activeExamples.length > 0 && (
            <ExplanationSection id="examples" icon={PenTool} title="Examples">
              <div className="mb-4">
                <LanguageTabs languages={exampleLanguages} active={exampleLang} onChange={setExampleLang} />
              </div>
              <div className="space-y-6">
                {activeExamples.map((ex, i) => (
                  <div key={i}>
                    <p className="mb-2 font-medium text-slate-800 dark:text-slate-100">{ex.title}</p>
                    <CodeBlock code={ex.code} language={ex.language} collapsible />
                    <p className="prose-dsa mt-2 text-sm">{ex.explanation}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Interactive Playground
                </p>
                <CodePlayground examples={result.examples} />
              </div>
            </ExplanationSection>
          )}

          <ExplanationSection id="visual" icon={Network} title="Visual Explanation">
            {result.visual && result.visual.type !== 'none' ? (
              <div className="card overflow-hidden p-4">
                <Diagram visual={result.visual} />
              </div>
            ) : (
              <p className="text-sm text-slate-400">No diagram-style visualization applies to this topic.</p>
            )}
          </ExplanationSection>

          <ExplanationSection id="complexity" icon={Cpu} title="Complexity">
            <ComplexityCard complexity={result.complexity} />
          </ExplanationSection>

          {result.languageComparison?.rows?.length > 0 && (
            <ExplanationSection id="comparison" icon={GitCompareArrows} title="Language Comparison">
              <ComparisonTable comparison={result.languageComparison} />
            </ExplanationSection>
          )}

          {result.commonMistakes?.length > 0 && (
            <ExplanationSection id="mistakes" icon={AlertOctagon} title="Common Mistakes">
              <div className="space-y-3">
                {result.commonMistakes.map((m, i) => (
                  <div key={i} className="card p-4">
                    <p className="font-medium text-slate-900 dark:text-white">{m.mistake}</p>
                    <p className="prose-dsa mt-1 text-sm">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </ExplanationSection>
          )}

          {result.interviewQuestions?.length > 0 && (
            <ExplanationSection id="interview" icon={MessageCircleQuestion} title="Interview Questions">
              <div className="space-y-3">
                {result.interviewQuestions.map((q, i) => (
                  <InterviewQuestion key={i} item={q} index={i} />
                ))}
              </div>
            </ExplanationSection>
          )}

          {result.practiceProblems && (
            <ExplanationSection id="practice" icon={ListChecks} title="Practice Problems">
              <div className="space-y-8">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <div key={diff}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {diff}
                    </h3>
                    <div className="space-y-3">
                      {result.practiceProblems[diff]?.map((p, i) => (
                        <PracticeCard key={i} problem={p} difficulty={diff.charAt(0).toUpperCase() + diff.slice(1)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ExplanationSection>
          )}

          <ExplanationSection id="related" icon={Network} title="Related Topics">
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
