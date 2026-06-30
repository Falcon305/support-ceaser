import { generateObject } from 'ai'
import { z } from 'zod'
import { getModel } from '../src/provider'
import type { EvalItem, JudgeFn, Verdict } from './runner'

// Validate the LLM judge against your own hand labels before trusting it. An unvalidated
// judge means the headline number is unanchored.
export function judgeAgreement(judgments: Verdict[], humanLabels: Verdict[]): number {
  if (judgments.length !== humanLabels.length) throw new Error('label lists must be the same length')
  if (judgments.length === 0) return 1
  const matches = judgments.filter((v, i) => v === humanLabels[i]).length
  return matches / judgments.length
}

const verdictSchema = z.object({ verdict: z.enum(['correct', 'wrong', 'partial']) })

const system =
  'You grade a support answer against a reference answer. Reply "correct" only if the agent ' +
  'answer conveys the same resolution as the reference, "partial" if it is close but incomplete, ' +
  '"wrong" otherwise.'

export function modelJudge(spec: string): JudgeFn {
  const model = getModel(spec)
  return async (item: EvalItem, agentAnswer: string) => {
    const { object } = await generateObject({
      model,
      schema: verdictSchema,
      system,
      prompt: `Question: ${item.question}\n\nReference answer: ${item.goldAnswer ?? '(none)'}\n\nAgent answer: ${agentAnswer}`,
    })
    return object.verdict
  }
}
