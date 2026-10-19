// Render smoke tests: every new or changed page/component renders on the server
// (react-dom/server) without throwing and contains its key content. They catch
// broken imports, undefined variables and bad props that unit tests on pure
// logic can't.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const auth = vi.hoisted(() => ({ user: null }))
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: auth.user, loading: false, signOut: async () => {}, resetPasswordForEmail: async () => ({}) }),
}))
vi.mock('../lib/supabase', () => ({ supabase: null, isSupabaseConfigured: false }))

import Home from './Home'
import Topics from './Topics'
import Interview from './Interview'
import Dashboard from './Dashboard'
import Settings from './Settings'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LimitReached from '../components/LimitReached'
import QuotaBadge from '../components/QuotaBadge'
import TopicHeader from '../components/TopicHeader'
import { resetQuotaState, setQuota } from '../services/quotaStore'
import { recordActivity } from '../lib/progress'

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>)

afterEach(() => {
  auth.user = null
  resetQuotaState()
  localStorage.clear()
})

describe('Home', () => {
  it('advertises the pattern guides and question bank and no longer mentions pricing', () => {
    const html = render(<Home />)
    expect(html).toContain('Topic Guides')
    expect(html).toContain('Interview Question Bank')
    expect(html).toContain('href="/topics"')
    expect(html).toContain('href="/interview"')
    expect(html).not.toMatch(/pricing/i)
  })
})

describe('navigation', () => {
  it('links to core pages and has no pricing link in the header or footer', () => {
    const html = render(<><Header theme="dark" onToggleTheme={() => {}} onOpenSearch={() => {}} /><Footer /></>)
    expect(html).toContain('href="/topics"')
    expect(html).toContain('href="/roadmap"')
    expect(html).toContain('href="/practice"')
    expect(html).toContain('href="/interview"')
    expect(html).not.toContain('/pricing')
  })
})

describe('Topics', () => {
  it('renders all categories and marks topics with built-in guides', () => {
    const html = render(<Topics />)
    expect(html).toContain('Topic Explorer')
    expect(html).toContain('Built-in guides')
    expect(html).toContain('Two Pointers')
    expect(html).toContain('Guide')
  })
})

describe('Interview (Question Bank)', () => {
  it('renders the curated question bank, category filters and quiz mode trigger', () => {
    const html = render(<Interview />)
    expect(html).toContain('Interview Question Bank')
    expect(html).toContain('Quiz Me')
    expect(html).toContain('Unreviewed only')
    expect(html).toContain('What is Big-O notation')
  })
})

describe('Dashboard', () => {
  it('shows the streak, XP and badges for a signed-in learner', () => {
    auth.user = { id: 'u1', email: 'ashmit@example.com', user_metadata: { name: 'Ashmit' } }
    recordActivity('u1', 'lesson', { slug: 'heaps' })
    recordActivity('u1', 'question')

    const html = render(<Dashboard />)

    expect(html).toContain('Welcome back, Ashmit')
    expect(html).toContain('Your Orbit')
    expect(html).toContain('day streak')
    expect(html).toContain('Lift-off') // first-lesson badge
    expect(html).toContain('13 XP') // 10 (lesson) + 3 (question)
    expect(html).toContain('Badges')
  })

  it('renders cleanly for a brand-new learner', () => {
    auth.user = { id: 'new', email: 'new@example.com', user_metadata: {} }
    const html = render(<Dashboard />)
    expect(html).toContain('0')
    expect(html).toContain('Level 1')
  })
})

describe('Settings', () => {
  it('explains the daily AI allowance and has no billing controls', () => {
    auth.user = { id: 'u1', email: 'a@b.c', user_metadata: {} }
    const html = render(<Settings />)
    expect(html).toContain('AI lessons')
    expect(html).toContain('a@b.c')
    expect(html).not.toMatch(/billing|upgrade|\bpro\b/i)
  })
})

describe('LimitReached', () => {
  const resetsAt = new Date(Date.now() + 5 * 3_600_000).toISOString()

  it('explains the limit and points at things that need no AI — without any upsell', () => {
    const html = render(<LimitReached quota={{ limit: 5, resetsAt }} signedIn={false} />)
    expect(html).toContain('AI lessons')
    expect(html).toContain('href="/interview"')
    expect(html).toContain('href="/topics"')
    expect(html).toContain('Create a free account')
    expect(html).not.toMatch(/upgrade|pricing|\bpro\b/i)
  })

  it('does not ask a signed-in user to sign up', () => {
    expect(render(<LimitReached quota={{ limit: 25, resetsAt }} signedIn />)).not.toContain('Create a free account')
  })
})

describe('QuotaBadge', () => {
  it('renders nothing until the backend reports a quota', () => {
    expect(render(<QuotaBadge />)).toBe('')
  })

  it('shows what is left once known', () => {
    setQuota('generate', { used: 2, limit: 5, remaining: 3, resetsAt: 'x' })
    expect(render(<QuotaBadge />)).toContain('AI lessons left today: 3/5')
  })
})

describe('TopicHeader source badge', () => {
  const base = { title: 'Heaps', summary: 's', language: null }
  const props = { level: 'Beginner', onLevelChange: () => {}, bookmarked: false, onToggleBookmark: () => {} }

  it('labels AI-generated lessons', () => {
    expect(render(<TopicHeader result={{ ...base, source: 'ai' }} {...props} />)).toContain('AI-generated')
  })

  it('is honest about the built-in demo content', () => {
    expect(render(<TopicHeader result={{ ...base, source: 'local' }} {...props} />)).toContain('Built-in demo content')
  })
})
