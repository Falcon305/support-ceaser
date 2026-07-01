import type { Doc } from './corpus'

// PostHog serves every docs page as raw Markdown by appending `.md`, and llms.txt lists
// them all. Pull the /docs/ urls out of that index and normalize each to its .md form.
export function docUrlsFromIndex(index: string): string[] {
  const matches = index.match(/https:\/\/posthog\.com\/docs\/[^\s)"'<>]+/g) ?? []
  const seen = new Set<string>()
  const urls: string[] = []
  for (const raw of matches) {
    const path = raw.split('#')[0].split('?')[0].replace(/\/+$/, '')
    if (path === 'https://posthog.com/docs') continue
    const url = path.endsWith('.md') ? path : `${path}.md`
    if (!seen.has(url)) {
      seen.add(url)
      urls.push(url)
    }
  }
  return urls
}

export function docFromMarkdown(url: string, markdown: string): Doc {
  const page = url.replace(/^https:\/\/posthog\.com\/docs\//, '').replace(/\.md$/, '')
  const heading = markdown.match(/^#\s+(.+)$/m)
  return { page, title: heading ? heading[1].trim() : page, text: markdown.trim() }
}
