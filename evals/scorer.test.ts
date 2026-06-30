import { describe, it, expect } from 'vitest'
import { confusionMatrix, rates } from './scorer'

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

describe('rates', () => {
  it('reports coverage as answered/total and wrong-answer-rate as wrong/answered', () => {
    const r = rates([
      { gold: 'answerable', action: 'answered', correct: true },
      { gold: 'answerable', action: 'answered', correct: false },
      { gold: 'answerable', action: 'answered', correct: true },
      { gold: 'needs_human', action: 'escalated' },
    ])
    expect(r.coverage).toBeCloseTo(0.75)
    expect(r.wrongAnswerRate).toBeCloseTo(1 / 3)
  })

  it('returns zero rates when nothing was answered', () => {
    const r = rates([{ gold: 'needs_human', action: 'escalated' }])
    expect(r.coverage).toBe(0)
    expect(r.wrongAnswerRate).toBe(0)
  })
})
