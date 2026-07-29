import Groq from 'groq-sdk'
import type { AIProvider, AIMessage, AICompleteOptions } from '../types'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile'

export const groqProvider: AIProvider = {
  name: 'groq',

  async complete(messages: AIMessage[], options: AICompleteOptions = {}) {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
    })

    return completion.choices[0]?.message?.content ?? ''
  },
}