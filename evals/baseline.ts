import { readFileSync } from 'node:fs'
import type { ScoreReport } from './scorer'

export interface Baseline {
  wrongAnswerRate: number
}

export interface GateResult {
  pass: boolean
  observed: number
  baseline: number
  tolerance: number
}

// The gate fails only when the wrong-answer rate rises past the baseline by more than
// the tolerance band. The band absorbs judge/sampling noise on a small set, so the gate
// fires on real regressions, not jitter.
export function compareToBaseline(report: ScoreReport, baseline: Baseline, tolerance = 0.05): GateResult {
  return {
    pass: report.wrongAnswerRate <= baseline.wrongAnswerRate + tolerance,
    observed: report.wrongAnswerRate,
    baseline: baseline.wrongAnswerRate,
    tolerance,
  }
}

export function loadBaseline(path: string): Baseline {
  return JSON.parse(readFileSync(path, 'utf8'))
}
