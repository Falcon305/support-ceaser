import { describe, it, expect } from 'vitest'
import { parseScoredItems } from './dataset'

describe('parseScoredItems', () => {
  it('parses a json array of scored items', () => {
    const items = parseScoredItems(
      JSON.stringify([
        { gold: 'answerable', action: 'answered', correct: true },
        { gold: 'needs_human', action: 'escalated' },
      ]),
    )
    expect(items).toHaveLength(2)
    expect(items[0].gold).toBe('answerable')
  })

  it('rejects an unknown gold label', () => {
    expect(() => parseScoredItems(JSON.stringify([{ gold: 'maybe', action: 'answered' }]))).toThrow()
  })

  it('rejects a non-array payload', () => {
    expect(() => parseScoredItems(JSON.stringify({ gold: 'answerable' }))).toThrow()
  })
})
