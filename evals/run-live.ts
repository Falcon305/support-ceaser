import { readFileSync } from 'node:fs'
import { loadCorpus } from '../src/corpus'
import { lexicalRetriever } from '../src/retriever'
import { modelDrafter } from '../src/draft'
import { answer } from '../src/agent'
import { runEval, type EvalItem } from './runner'
import { modelJudge } from './judge'
import { score } from './scorer'
import { formatReport } from './report'
import { compareToBaseline, loadBaseline } from './baseline'
import { existsSync } from 'node:fs'

try {
  process.loadEnvFile('.env.local')
} catch {
  // no .env.local; rely on the ambient environment
}

const MODEL = process.env.MODEL ?? 'ollama:llama3.2'
const JUDGE_MODEL = process.env.JUDGE_MODEL ?? MODEL

const corpus = loadCorpus('evals/data/corpus.json')
const dataset: EvalItem[] = JSON.parse(readFileSync('evals/data/dataset.json', 'utf8'))

const retriever = lexicalRetriever(corpus)
const draft = modelDrafter(MODEL)
const judge = modelJudge(JUDGE_MODEL)

const scored = await runEval(dataset, (q) => answer(q, retriever, draft), judge)
const report = score(scored)
console.log(formatReport(report))

if (existsSync('evals/baseline.json')) {
  const gate = compareToBaseline(report, loadBaseline('evals/baseline.json'))
  console.log(`\nregression gate: ${gate.pass ? 'PASS' : 'FAIL'} (observed ${(gate.observed * 100).toFixed(1)}%, bound ${((gate.baseline + gate.tolerance) * 100).toFixed(1)}%)`)
  if (!gate.pass) process.exit(1)
}
