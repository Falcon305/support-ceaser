import type { ScoredItem, Gold, Action } from './scorer'

const GOLD: Gold[] = ['answerable', 'needs_human']
const ACTION: Action[] = ['answered', 'escalated']

export function parseScoredItems(raw: string): ScoredItem[] {
  const data = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('expected a JSON array of scored items')
  return data.map((item, i) => {
    if (!GOLD.includes(item?.gold)) throw new Error(`item ${i}: unknown gold label "${item?.gold}"`)
    if (!ACTION.includes(item?.action)) throw new Error(`item ${i}: unknown action "${item?.action}"`)
    return { gold: item.gold, action: item.action, correct: item.correct }
  })
}
