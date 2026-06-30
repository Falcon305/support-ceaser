import { describe, it, expect } from 'vitest'
import { answer } from './agent'
import { lexicalRetriever } from './retriever'
import type { Chunk } from './corpus'

const retriever = lexicalRetriever([
  { page: 'install', title: 'Install', text: 'install posthog with npm' },
])

describe('answer', () => {
  it('answers when retrieval and self-grade are both confident', async () => {
    const draft = async () => ({ answer: 'run npm i posthog-js', citations: ['install'], selfGrade: 0.9 })
    const res = await answer('how do i install posthog', retriever, draft)
    expect(res.action).toBe('answered')
    expect(res.answer).toContain('posthog-js')
    expect(res.citations).toEqual(['install'])
  })

  it('escalates when retrieval finds nothing relevant', async () => {
    const draft = async () => ({ answer: 'guess', citations: [], selfGrade: 0.9 })
    const res = await answer('how do i configure kubernetes ingress', retriever, draft)
    expect(res.action).toBe('escalated')
  })

  it('escalates when the model self-grades low despite good retrieval', async () => {
    const draft = async () => ({ answer: 'not sure', citations: [], selfGrade: 0.1 })
    const res = await answer('install posthog', retriever, draft)
    expect(res.action).toBe('escalated')
  })

  it('passes the retrieved chunks to the drafter', async () => {
    let seen: Chunk[] = []
    const draft = async (_q: string, chunks: Chunk[]) => {
      seen = chunks
      return { answer: 'x', citations: [], selfGrade: 0.9 }
    }
    await answer('install posthog', retriever, draft, { k: 1 })
    expect(seen[0].page).toBe('install')
  })
})
