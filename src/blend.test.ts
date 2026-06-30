import { describe, it, expect } from 'vitest'
import { blend } from './blend'

describe('blend', () => {
  it('answers when both retrieval and self-grade are confident', () => {
    const r = blend(0.9, 0.8)
    expect(r.escalate).toBe(false)
    expect(r.confidence).toBeCloseTo(0.8)
  })

  it('escalates when the self-grade is weak even if retrieval is strong', () => {
    expect(blend(0.9, 0.2).escalate).toBe(true)
  })

  it('escalates when retrieval is weak even if the model is sure', () => {
    expect(blend(0.2, 0.9).escalate).toBe(true)
  })

  it('takes the weakest signal as the confidence (weakest link)', () => {
    expect(blend(0.7, 0.4).confidence).toBeCloseTo(0.4)
  })

  it('respects a custom cutoff', () => {
    expect(blend(0.6, 0.6, { cutoff: 0.7 }).escalate).toBe(true)
    expect(blend(0.6, 0.6, { cutoff: 0.5 }).escalate).toBe(false)
  })
})
