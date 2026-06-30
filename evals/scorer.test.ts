import { describe, it, expect } from 'vitest'
import { confusionMatrix, rates, escalationMetrics, citationCorrect, score } from './scorer'

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

describe('escalationMetrics', () => {
  it('treats needs-human as the positive class', () => {
    const m = escalationMetrics([
      { gold: 'needs_human', action: 'escalated' },
      { gold: 'needs_human', action: 'answered', correct: false },
      { gold: 'answerable', action: 'escalated' },
      { gold: 'answerable', action: 'answered', correct: true },
    ])
    expect(m.precision).toBeCloseTo(0.5)
    expect(m.recall).toBeCloseTo(0.5)
  })

  it('returns zero precision with no escalations and zero recall with no needs-human', () => {
    const m = escalationMetrics([{ gold: 'answerable', action: 'answered', correct: true }])
    expect(m.precision).toBe(0)
    expect(m.recall).toBe(0)
  })
})

describe('citationCorrect', () => {
  it('is true only when every cited page is a gold supporting page', () => {
    expect(citationCorrect(['intro', 'setup'], ['intro', 'setup', 'api'])).toBe(true)
    expect(citationCorrect(['intro', 'billing'], ['intro', 'setup'])).toBe(false)
  })

  it('is false when nothing was cited', () => {
    expect(citationCorrect([], ['intro'])).toBe(false)
  })
})

describe('score', () => {
  it('combines the matrix, rates, and escalation metrics into one report', () => {
    const report = score([
      { gold: 'answerable', action: 'answered', correct: true },
      { gold: 'answerable', action: 'answered', correct: false },
      { gold: 'needs_human', action: 'escalated' },
      { gold: 'needs_human', action: 'answered', correct: false },
    ])
    expect(report.n).toBe(4)
    expect(report.matrix).toEqual({ answeredCorrect: 1, answeredWrong: 2, escalated: 1 })
    expect(report.coverage).toBeCloseTo(0.75)
    expect(report.escalation.recall).toBeCloseTo(0.5)
  })
})
