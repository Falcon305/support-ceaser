import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`missing ${name} — set it in .env.local`)
  return value
}

// spec is "provider:model":
//   anthropic:claude-sonnet-4   openai:gpt-4o   deepseek:deepseek-chat
//   compatible:qwen-max         — Qwen/Moonshot/Zhipu/Groq via OPENAI_COMPATIBLE_BASE_URL
//   ollama:llama3.1             — local, free, no key
export function getModel(spec: string): LanguageModel {
  const [provider, ...rest] = spec.split(':')
  const model = rest.join(':')
  switch (provider) {
    case 'anthropic':
      return createAnthropic({ apiKey: requireEnv('ANTHROPIC_API_KEY') })(model)
    case 'openai':
      return createOpenAI({ apiKey: requireEnv('OPENAI_API_KEY') })(model)
    case 'deepseek':
      return createDeepSeek({ apiKey: requireEnv('DEEPSEEK_API_KEY') })(model)
    case 'compatible':
      return createOpenAICompatible({
        name: 'compatible',
        baseURL: requireEnv('OPENAI_COMPATIBLE_BASE_URL'),
        apiKey: process.env.OPENAI_COMPATIBLE_API_KEY ?? '',
      })(model)
    case 'ollama':
      return createOpenAICompatible({
        name: 'ollama',
        baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
        apiKey: 'ollama',
      })(model)
    default:
      throw new Error(`unknown provider "${provider}" in "${spec}"`)
  }
}
