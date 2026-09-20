// Guard: Code Orbit is free. This fails if paid-plan code (Stripe, a pricing
// page, subscription checks) is accidentally reintroduced.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '..')

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

// Test files are excluded: they legitimately name the things they assert are absent.
const sources = [...walk(join(root, 'src')), ...walk(join(root, 'server'))].filter(
  (file) => /\.(js|jsx)$/.test(file) && !/\.test\.(js|jsx)$/.test(file)
)

describe('no paid-plan code', () => {
  it('finds source files to scan', () => {
    expect(sources.length).toBeGreaterThan(30)
  })

  it.each([
    ['Stripe', /stripe/i],
    ['a pricing route', /['"`]\/pricing['"`]/],
    ['subscription/plan checks', /useSubscription|isPro\b|PRICING_PLANS/],
  ])('does not reference %s', (_label, pattern) => {
    const offenders = sources.filter((file) => pattern.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })

  it('does not depend on the stripe package', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })).not.toContain('stripe')
  })
})
