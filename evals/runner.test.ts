import { describe, it, expect } from 'vitest'
import { runEval } from './runner'

describe('runEval', () => {
  it('records an escalation as an escalated item', async () => {
    const run = async () => ({ action: 'escalated' as const, confidence: 0.1 })
    const judge = async () => 'correct' as const
    const scored = await runEval([{ question: 'q', gold: 'needs_human' }], run, judge)
    expect(scored[0]).toEqual({ gold: 'needs_human', action: 'escalated' })
  })

  it('judges an answered question for correctness', async () => {
    const run = async () => ({ action: 'answered' as const, answer: 'a', confidence: 0.9 })
    const judge = async () => 'correct' as const
    const scored = await runEval([{ question: 'q', gold: 'answerable', goldAnswer: 'a' }], run, judge)
    expect(scored[0]).toEqual({ gold: 'answerable', action: 'answered', correct: true })
  })

  it('treats a partial verdict as not correct', async () => {
    const run = async () => ({ action: 'answered' as const, answer: 'a', confidence: 0.9 })
    const judge = async () => 'partial' as const
    const scored = await runEval([{ question: 'q', gold: 'answerable' }], run, judge)
    expect(scored[0].correct).toBe(false)
  })
})
