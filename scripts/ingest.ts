import { readFileSync } from 'node:fs'
import { buildCorpus, saveCorpus, type Doc } from '../src/corpus'

const docsPath = process.argv[2] ?? 'evals/data/docs.json'
const outPath = process.argv[3] ?? 'evals/data/corpus.json'

const docs: Doc[] = JSON.parse(readFileSync(docsPath, 'utf8'))
const corpus = buildCorpus(docs, { size: 80, overlap: 16 })
saveCorpus(outPath, corpus)
console.log(`ingested ${docs.length} docs → ${corpus.length} chunks → ${outPath}`)
