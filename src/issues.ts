export interface IssueSeed {
  question: string
  gold: 'TODO'
  source: string
}

const ASK_PREFIX = /^(how|can|does|do|is|are|why|what|where|when|should|could|would)\b/i

// A cheap filter to keep support-style questions and drop bug reports / tasks. It is a
// seed, not a label — every kept issue still needs a human-blind gold label.
export function looksLikeQuestion(title: string): boolean {
  if (/^\s*\[?(bug|fix|chore|feat|refactor|task)\b/i.test(title)) return false
  return title.includes('?') || ASK_PREFIX.test(title.trim())
}

export function issueToSeed(issue: { title: string; html_url: string }): IssueSeed {
  return { question: issue.title.trim(), gold: 'TODO', source: issue.html_url }
}
