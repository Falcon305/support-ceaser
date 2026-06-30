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
