import { writeFileSync } from 'node:fs'
import { looksLikeQuestion, issueToSeed, type IssueSeed } from '../src/issues'

const repo = process.argv[2] ?? 'posthog/posthog'
const out = process.argv[3] ?? 'evals/data/dataset.seed.json'
const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN

const headers: Record<string, string> = { accept: 'application/vnd.github+json' }
if (token) headers.authorization = `Bearer ${token}`

const seeds: IssueSeed[] = []
for (let page = 1; page <= 3; page++) {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=closed&per_page=100&page=${page}`, { headers })
  if (!res.ok) {
    console.log(`github api returned ${res.status}${res.status === 403 ? ' (rate limited — set GITHUB_TOKEN)' : ''}`)
    break
  }
  const issues = await res.json()
  if (!Array.isArray(issues) || issues.length === 0) break
  for (const issue of issues) {
    if (issue.pull_request || !looksLikeQuestion(issue.title)) continue
    seeds.push(issueToSeed(issue))
  }
}

writeFileSync(out, JSON.stringify(seeds, null, 2) + '\n')
console.log(`wrote ${seeds.length} question seeds → ${out}`)
console.log('next: label each seed human-blind (answerable | needs_human) and move the good ones into dataset.json')
