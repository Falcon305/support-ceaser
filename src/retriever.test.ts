import { describe, it, expect } from 'vitest'
import { lexicalRetriever } from './retriever'
import type { Corpus } from './corpus'

const corpus: Corpus = [
  { page: 'install', title: 'Install', text: 'install posthog with npm' },
  { page: 'events', title: 'Events', text: 'capture custom events with the api' },
]

describe('lexicalRetriever', () => {
  it('ranks the chunk that shares the most query terms first', () => {
    const hits = lexicalRetriever(corpus).retrieve('how do i install posthog', 1)
    expect(hits[0].chunk.page).toBe('install')
    expect(hits[0].score).toBeGreaterThan(0)
  })

  it('scores a query with no overlap as zero', () => {
    const hits = lexicalRetriever(corpus).retrieve('kubernetes helm chart', 2)
    expect(hits.every((h) => h.score === 0)).toBe(true)
  })

  it('returns at most k hits, highest score first', () => {
    const hits = lexicalRetriever(corpus).retrieve('events api', 2)
    expect(hits).toHaveLength(2)
    expect(hits[0].score).toBeGreaterThanOrEqual(hits[1].score)
    expect(hits[0].chunk.page).toBe('events')
  })
})
