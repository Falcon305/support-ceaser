import { describe, it, expect } from 'vitest'
import { judgeAgreement, modelJudge } from './judge'

describe('judgeAgreement', () => {
  it('reports the fraction of verdicts that match the human labels', () => {
    expect(judgeAgreement(['correct', 'wrong', 'partial'], ['correct', 'correct', 'partial'])).toBeCloseTo(2 / 3)
  })

  it('is 1 when every verdict matches', () => {
    expect(judgeAgreement(['correct', 'wrong'], ['correct', 'wrong'])).toBe(1)
  })

  it('throws when the two label lists differ in length', () => {
    expect(() => judgeAgreement(['correct'], ['correct', 'wrong'])).toThrow()
  })
})

describe('modelJudge', () => {
  it('builds a judge function for a provider spec', () => {
    expect(typeof modelJudge('ollama:llama3.1')).toBe('function')
  })
})
