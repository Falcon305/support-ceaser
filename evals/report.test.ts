import { describe, it, expect } from 'vitest'
import { formatReport } from './report'
import { score } from './scorer'

describe('formatReport', () => {
  it('renders the item count, the three buckets, and the headline rates', () => {
    const report = score([
      { gold: 'answerable', action: 'answered', correct: true },
      { gold: 'answerable', action: 'answered', correct: false },
      { gold: 'needs_human', action: 'escalated' },
    ])
    const out = formatReport(report)
    expect(out).toContain('3 items')
    expect(out).toContain('answered ✓')
    expect(out).toContain('answered ✗')
    expect(out).toContain('escalated')
    expect(out).toContain('coverage')
    expect(out).toContain('wrong-answer rate')
    expect(out).toContain('escalation')
  })
})
