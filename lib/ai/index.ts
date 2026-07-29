import { groqProvider } from './providers/groq'
import type { AIProvider, AIMessage, AICompleteOptions } from './types'

export const ai: AIProvider = groqProvider

export async function completeJSON<T>(
  messages: AIMessage[],
  options: AICompleteOptions = {}
): Promise<T> {
  const raw = await ai.complete(messages, { ...options, json: true })
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned) as T
}

export type { AIProvider, AIMessage, AICompleteOptions }