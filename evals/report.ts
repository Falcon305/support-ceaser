import type { ScoreReport } from './scorer'

const pct = (x: number) => `${(x * 100).toFixed(1)}%`

export function formatReport(report: ScoreReport): string {
  const { n, matrix, coverage, wrongAnswerRate, escalation } = report
  return [
    `support-ceaser eval — ${n} items`,
    ``,
    `  answered ✓   ${matrix.answeredCorrect}`,
    `  answered ✗   ${matrix.answeredWrong}`,
    `  escalated    ${matrix.escalated}`,
    ``,
    `  coverage             ${pct(coverage)}`,
    `  wrong-answer rate    ${pct(wrongAnswerRate)}`,
    `  escalation           precision ${escalation.precision.toFixed(2)}  recall ${escalation.recall.toFixed(2)}`,
  ].join('\n')
}
