import { readFileSync } from 'node:fs'
import { loadCorpus, type Chunk } from '../src/corpus'
import { lexicalRetriever } from '../src/retriever'
import { answer } from '../src/agent'
import { runEval, type EvalItem, type Verdict } from './runner'
import { score } from './scorer'
import { formatReport } from './report'

// A no-model run of the whole chain over the real sample data. The drafter and judge are
// deterministic stand-ins (the drafter answers from the top chunk; the judge checks
// lexical overlap with the gold answer) so you can see the pipeline work end-to-end with
// zero API cost. For real answer quality, use `pnpm eval:live` with a model.
const corpus = loadCorpus('evals/data/corpus.json')
const dataset: EvalItem[] = JSON.parse(readFileSync('evals/data/dataset.json', 'utf8'))
const retriever = lexicalRetriever(corpus)

const draft = async (_q: string, chunks: Chunk[]) => {
  const top = chunks[0]
  return { answer: top?.text ?? '', citations: top ? [top.page] : [], selfGrade: top ? 0.9 : 0 }
}

const terms = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
const judge = async (item: EvalItem, agentAnswer: string): Promise<Verdict> => {
  if (!item.goldAnswer) return 'wrong'
  const gold = [...terms(item.goldAnswer)]
  const got = terms(agentAnswer)
  const overlap = gold.filter((t) => got.has(t)).length / gold.length
  return overlap >= 0.5 ? 'correct' : 'wrong'
}

const scored = await runEval(dataset, (q) => answer(q, retriever, draft), judge)
console.log(formatReport(score(scored)))
