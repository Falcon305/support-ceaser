import { generateObject } from 'ai'
import { z } from 'zod'
import { getModel } from './provider'
import type { Drafter } from './agent'

const draftSchema = z.object({
  answer: z.string(),
  citations: z.array(z.string()),
  selfGrade: z.number().min(0).max(1),
})

const system = [
  'You are a support agent. Answer ONLY from the provided context.',
  'Put the page ids you actually used in `citations`.',
  'Set `selfGrade` to your honest confidence in [0,1] that the context fully answers the question.',
  'If the context does not answer it, say so plainly and set selfGrade low.',
].join(' ')

export function modelDrafter(spec: string): Drafter {
  const model = getModel(spec)
  return async (question, chunks) => {
    const context = chunks.map((c) => `[${c.page}] ${c.title}\n${c.text}`).join('\n\n')
    const { object } = await generateObject({
      model,
      schema: draftSchema,
      system,
      prompt: `Context:\n${context}\n\nQuestion: ${question}`,
    })
    return object
  }
}
