export interface BlendResult {
  confidence: number
  escalate: boolean
}

// Two signals guard each other: the retrieval score (are the docs relevant?) and the
// model's self-grade (can it actually answer from them?). Confidence is the weaker of
// the two, so a low score on either forces an escalation.
export function blend(retrievalScore: number, selfGrade: number, opts: { cutoff?: number } = {}): BlendResult {
  const cutoff = opts.cutoff ?? 0.5
  const confidence = Math.min(retrievalScore, selfGrade)
  return { confidence, escalate: confidence < cutoff }
}
