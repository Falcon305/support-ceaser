import type { Chunk, Corpus } from './corpus'

export interface Retrieved {
  chunk: Chunk
  score: number
}

export interface Retriever {
  retrieve(query: string, k: number): Retrieved[]
}

const STOPWORDS = new Set(
  'a an the how do does i me my you your to of in on for with and or is are be can what why this that it'.split(' '),
)

const tokenize = (text: string): Set<string> =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t && !STOPWORDS.has(t)),
  )

// Offline default: score a chunk by the fraction of distinct query terms it contains.
// Good enough as a relevance signal for the trust gate, and a real embedding retriever
// can replace it behind the Retriever interface without touching the agent.
export function lexicalRetriever(corpus: Corpus): Retriever {
  const indexed = corpus.map((chunk) => ({ chunk, terms: tokenize(chunk.text) }))
  return {
    retrieve(query, k) {
      const queryTerms = [...tokenize(query)]
      const scored = indexed.map(({ chunk, terms }) => {
        if (queryTerms.length === 0) return { chunk, score: 0 }
        const hits = queryTerms.filter((t) => terms.has(t)).length
        return { chunk, score: hits / queryTerms.length }
      })
      return scored.sort((a, b) => b.score - a.score).slice(0, k)
    },
  }
}
