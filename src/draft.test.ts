import { describe, it, expect } from 'vitest'
import { modelDrafter } from './draft'

describe('modelDrafter', () => {
  it('builds a drafter function for a provider spec', () => {
    expect(typeof modelDrafter('ollama:llama3.1')).toBe('function')
  })
})
