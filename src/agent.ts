import type { Chunk } from './corpus'
import type { Retriever } from './retriever'
import { blend } from './blend'

export interface Draft {
  answer: string
  citations: string[]
  selfGrade: number
}

export type Drafter = (question: string, chunks: Chunk[]) => Promise<Draft>

export interface AgentResult {
  action: 'answered' | 'escalated'
  answer?: string
  citations?: string[]
  confidence: number
}

export interface AgentOptions {
  k?: number
  cutoff?: number
}

// The trust loop: retrieve, let the model draft an answer with a self-grade, then gate
// on the weaker of retrieval relevance and self-grade. Below the cutoff we escalate
// instead of returning a guess.
export async function answer(
  question: string,
  retriever: Retriever,
  draft: Drafter,
  opts: AgentOptions = {},
): Promise<AgentResult> {
  const hits = retriever.retrieve(question, opts.k ?? 4)
  const retrievalScore = hits[0]?.score ?? 0
  const drafted = await draft(question, hits.map((h) => h.chunk))
  const { confidence, escalate } = blend(retrievalScore, drafted.selfGrade, { cutoff: opts.cutoff })
  if (escalate) return { action: 'escalated', confidence }
  return { action: 'answered', answer: drafted.answer, citations: drafted.citations, confidence }
}
