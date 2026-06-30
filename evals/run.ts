import { readFileSync } from 'node:fs'
import { parseScoredItems } from './dataset'
import { score } from './scorer'
import { formatReport } from './report'

const path = process.argv[2] ?? 'evals/fixtures/example.json'
const items = parseScoredItems(readFileSync(path, 'utf8'))
console.log(formatReport(score(items)))
