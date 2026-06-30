import { describe, it, expect, beforeEach } from 'vitest'
import { getModel } from './provider'

describe('getModel', () => {
  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.OPENAI_COMPATIBLE_BASE_URL
  })

  it('builds a local ollama model with no api key', () => {
    expect(getModel('ollama:llama3.1')).toBeDefined()
  })

  it('builds an openai-compatible model from a base url (qwen, moonshot, groq, ...)', () => {
    process.env.OPENAI_COMPATIBLE_BASE_URL = 'https://example.test/v1'
    expect(getModel('compatible:qwen-max')).toBeDefined()
  })

  it('throws a clear error when a hosted provider key is missing', () => {
    expect(() => getModel('anthropic:claude-sonnet-4')).toThrow(/ANTHROPIC_API_KEY/)
  })

  it('throws on an unknown provider', () => {
    expect(() => getModel('bogus:x')).toThrow(/unknown provider/)
  })
})
