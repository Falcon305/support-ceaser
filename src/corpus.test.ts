import { describe, it, expect } from 'vitest'
import { chunkDoc } from './corpus'

describe('chunkDoc', () => {
  it('splits text into overlapping word windows', () => {
    const chunks = chunkDoc({ page: 'setup', title: 'Setup', text: 'a b c d e' }, { size: 2, overlap: 1 })
    expect(chunks.map((c) => c.text)).toEqual(['a b', 'b c', 'c d', 'd e'])
    expect(chunks[0]).toMatchObject({ page: 'setup', title: 'Setup' })
  })

  it('keeps the tail window when the step overshoots', () => {
    const chunks = chunkDoc({ page: 'p', title: 'T', text: 'a b c d e f' }, { size: 4, overlap: 1 })
    expect(chunks.map((c) => c.text)).toEqual(['a b c d', 'd e f'])
  })

  it('returns a single chunk when text is shorter than the window', () => {
    expect(chunkDoc({ page: 'p', title: 'T', text: 'a b' }, { size: 5, overlap: 1 })).toHaveLength(1)
  })
})
