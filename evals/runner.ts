import type { ScoredItem, Gold } from './scorer'
import type { AgentResult } from '../src/agent'

export interface EvalItem {
  question: string
  gold: Gold
  goldAnswer?: string
  goldPages?: string[]
}

export type Verdict = 'correct' | 'wrong' | 'partial'
export type RunAgent = (question: string) => Promise<AgentResult>
export type JudgeFn = (item: EvalItem, agentAnswer: string) => Promise<Verdict>

export async function runEval(items: EvalItem[], run: RunAgent, judge: JudgeFn): Promise<ScoredItem[]> {
  const scored: ScoredItem[] = []
  for (const item of items) {
    const result = await run(item.question)
    if (result.action === 'escalated') {
      scored.push({ gold: item.gold, action: 'escalated' })
      continue
    }
    const verdict = await judge(item, result.answer ?? '')
    scored.push({ gold: item.gold, action: 'answered', correct: verdict === 'correct' })
  }
  return scored
}
