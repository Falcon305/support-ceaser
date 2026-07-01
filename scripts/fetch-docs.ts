import { writeFileSync } from 'node:fs'
import { docUrlsFromIndex, docFromMarkdown } from '../src/posthog'
import type { Doc } from '../src/corpus'

const INDEX = 'https://posthog.com/llms.txt'
const limit = Number(process.argv[2] ?? 40)
const out = process.argv[3] ?? 'evals/data/docs.fetched.json'

const index = await fetch(INDEX).then((r) => r.text())
const all = docUrlsFromIndex(index)
const urls = all.slice(0, limit)
console.log(`found ${all.length} doc urls, fetching ${urls.length}`)

const docs: Doc[] = []
for (const url of urls) {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.log(`skip ${url} (${res.status})`)
      continue
    }
    docs.push(docFromMarkdown(url, await res.text()))
  } catch (err) {
    console.log(`skip ${url} (${(err as Error).message})`)
  }
}

writeFileSync(out, JSON.stringify(docs, null, 2) + '\n')
console.log(`wrote ${docs.length} docs → ${out}`)
console.log(`next: pnpm ingest ${out} evals/data/corpus.fetched.json`)
