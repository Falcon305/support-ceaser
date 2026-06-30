import { describe, it, expect } from 'vitest'
import { score } from './scorer'
import { compareToBaseline } from './baseline'
import type { ScoredItem } from './scorer'

const reportWith = (wrong: number, total: number) => {
  const items: ScoredItem[] = [
    ...Array(wrong).fill({ gold: 'answerable', action: 'answered', correct: false }),
    ...Array(total - wrong).fill({ gold: 'answerable', action: 'answered', correct: true }),
  ]
  return score(items)
}

describe('compareToBaseline', () => {
  it('passes when the wrong-answer rate is within the tolerance band', () => {
    const r = compareToBaseline(reportWith(1, 10), { wrongAnswerRate: 0.08 }, 0.05)
    expect(r.pass).toBe(true)
  })

  it('fails when the wrong-answer rate exceeds baseline plus tolerance', () => {
    const r = compareToBaseline(reportWith(1, 10), { wrongAnswerRate: 0.02 }, 0.05)
    expect(r.pass).toBe(false)
  })

  it('passes when the agent improved', () => {
    const r = compareToBaseline(reportWith(0, 10), { wrongAnswerRate: 0.1 }, 0.05)
    expect(r.pass).toBe(true)
  })
})
