import { readFileSync, writeFileSync } from 'node:fs'

export interface Doc {
  page: string
  title: string
  text: string
}

export interface Chunk {
  page: string
  title: string
  text: string
}

export type Corpus = Chunk[]

export function chunkDoc(doc: Doc, opts: { size?: number; overlap?: number } = {}): Chunk[] {
  const size = opts.size ?? 120
  const overlap = opts.overlap ?? 20
  const step = Math.max(1, size - overlap)
  const words = doc.text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const chunks: Chunk[] = []
  for (let i = 0; ; i += step) {
    const end = Math.min(i + size, words.length)
    chunks.push({ page: doc.page, title: doc.title, text: words.slice(i, end).join(' ') })
    if (end >= words.length) break
  }
  return chunks
}

export function buildCorpus(docs: Doc[], opts?: { size?: number; overlap?: number }): Corpus {
  return docs.flatMap((doc) => chunkDoc(doc, opts))
}

export function loadCorpus(path: string): Corpus {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function saveCorpus(path: string, corpus: Corpus): void {
  writeFileSync(path, JSON.stringify(corpus, null, 2) + '\n')
}
