import { describe, it, expect } from 'vitest'
import { confusionMatrix } from './scorer'

describe('confusionMatrix', () => {
  it('buckets scored items into answered-correct, answered-wrong, escalated', () => {
    const matrix = confusionMatrix([
      { gold: 'answerable', action: 'answered', correct: true },
      { gold: 'answerable', action: 'answered', correct: false },
      { gold: 'needs_human', action: 'escalated' },
    ])
    expect(matrix).toEqual({ answeredCorrect: 1, answeredWrong: 1, escalated: 1 })
  })
})
