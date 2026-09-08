import Groq from 'groq-sdk'
import type { AIProvider, AIMessage, AICompleteOptions } from '../types'

const MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

let client: Groq | null = null

function getClient() {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing')
  }

  if (!client) {
    client = new Groq({ apiKey })
  }

  return client
}

export const groqProvider: AIProvider = {
  name: 'groq',

  async complete(messages: AIMessage[], options: AICompleteOptions = {}) {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
    })

    return completion.choices[0]?.message?.content ?? ''
  },
}
