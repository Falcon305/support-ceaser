import { describe, it, expect } from 'vitest'
import { docUrlsFromIndex, docFromMarkdown } from './posthog'

describe('docUrlsFromIndex', () => {
  it('pulls posthog docs urls and normalizes them to .md', () => {
    const index = `
      see [Libraries](https://posthog.com/docs/libraries.md) and
      [Flags](https://posthog.com/docs/feature-flags/adding-feature-flag-code.md) and
      [API](https://posthog.com/docs/api) and [Pricing](https://posthog.com/pricing)
    `
    expect(docUrlsFromIndex(index)).toEqual([
      'https://posthog.com/docs/libraries.md',
      'https://posthog.com/docs/feature-flags/adding-feature-flag-code.md',
      'https://posthog.com/docs/api.md',
    ])
  })

  it('drops fragments and dedupes', () => {
    const index = '[a](https://posthog.com/docs/api#auth) [b](https://posthog.com/docs/api.md)'
    expect(docUrlsFromIndex(index)).toEqual(['https://posthog.com/docs/api.md'])
  })
})

describe('docFromMarkdown', () => {
  it('derives the page id from the url and the title from the first heading', () => {
    const doc = docFromMarkdown('https://posthog.com/docs/feature-flags/adding.md', '# Add a flag\n\nCall isFeatureEnabled.')
    expect(doc).toEqual({
      page: 'feature-flags/adding',
      title: 'Add a flag',
      text: '# Add a flag\n\nCall isFeatureEnabled.',
    })
  })

  it('falls back to the page id when there is no heading', () => {
    const doc = docFromMarkdown('https://posthog.com/docs/api.md', 'no heading here')
    expect(doc.title).toBe('api')
  })
})
