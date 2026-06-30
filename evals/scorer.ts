export type Gold = 'answerable' | 'needs_human'
export type Action = 'answered' | 'escalated'

export interface ScoredItem {
  gold: Gold
  action: Action
  correct?: boolean
}

export interface ConfusionMatrix {
  answeredCorrect: number
  answeredWrong: number
  escalated: number
}

export function confusionMatrix(items: ScoredItem[]): ConfusionMatrix {
  const matrix: ConfusionMatrix = { answeredCorrect: 0, answeredWrong: 0, escalated: 0 }
  for (const item of items) {
    if (item.action === 'escalated') matrix.escalated++
    else if (item.correct) matrix.answeredCorrect++
    else matrix.answeredWrong++
  }
  return matrix
}

export interface Rates {
  coverage: number
  wrongAnswerRate: number
}

// coverage = share of items the agent chose to answer; wrong-answer-rate is over
// answers given, not the whole set — a wrong answer is worse than an abstention.
export function rates(items: ScoredItem[]): Rates {
  const { answeredCorrect, answeredWrong } = confusionMatrix(items)
  const answered = answeredCorrect + answeredWrong
  if (answered === 0) return { coverage: 0, wrongAnswerRate: 0 }
  return {
    coverage: answered / items.length,
    wrongAnswerRate: answeredWrong / answered,
  }
}

export interface EscalationMetrics {
  precision: number
  recall: number
}

// Positive class is needs_human: precision = of what we escalated, how much truly
// needed a human; recall = of what truly needed a human, how much we escalated.
export function escalationMetrics(items: ScoredItem[]): EscalationMetrics {
  const escalated = items.filter((i) => i.action === 'escalated')
  const needsHuman = items.filter((i) => i.gold === 'needs_human')
  const truePositives = escalated.filter((i) => i.gold === 'needs_human').length
  return {
    precision: escalated.length === 0 ? 0 : truePositives / escalated.length,
    recall: needsHuman.length === 0 ? 0 : truePositives / needsHuman.length,
  }
}

// A citation counts only if the agent cited something and every cited page is in
// the hand-labeled supporting set. Citing an unrelated page is not "close enough".
export function citationCorrect(citedPages: string[], goldPages: string[]): boolean {
  if (citedPages.length === 0) return false
  return citedPages.every((page) => goldPages.includes(page))
}

export interface ScoreReport {
  n: number
  matrix: ConfusionMatrix
  coverage: number
  wrongAnswerRate: number
  escalation: EscalationMetrics
}

export function score(items: ScoredItem[]): ScoreReport {
  const { coverage, wrongAnswerRate } = rates(items)
  return {
    n: items.length,
    matrix: confusionMatrix(items),
    coverage,
    wrongAnswerRate,
    escalation: escalationMetrics(items),
  }
}
