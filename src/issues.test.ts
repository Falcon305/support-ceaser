import { describe, it, expect } from 'vitest'
import { looksLikeQuestion, issueToSeed } from './issues'

describe('looksLikeQuestion', () => {
  it('accepts titles that ask something', () => {
    expect(looksLikeQuestion('How do I reset a user?')).toBe(true)
    expect(looksLikeQuestion('Can feature flags target by cohort')).toBe(true)
    expect(looksLikeQuestion('Does autocapture record password fields?')).toBe(true)
  })

  it('rejects titles that are plainly bug reports or tasks', () => {
    expect(looksLikeQuestion('Fix flaky test in ingestion pipeline')).toBe(false)
    expect(looksLikeQuestion('[Bug] dashboard crashes on empty state')).toBe(false)
  })
})

describe('issueToSeed', () => {
  it('turns an issue into an unlabeled dataset seed', () => {
    const seed = issueToSeed({ title: 'How do I identify users?', html_url: 'https://github.com/posthog/posthog/issues/42' })
    expect(seed).toEqual({
      question: 'How do I identify users?',
      gold: 'TODO',
      source: 'https://github.com/posthog/posthog/issues/42',
    })
  })
})
