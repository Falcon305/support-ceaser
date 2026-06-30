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
