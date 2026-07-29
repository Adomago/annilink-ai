export type AIRole = 'system' | 'user' | 'assistant'

export interface AIMessage {
  role: AIRole
  content: string
}

export interface AICompleteOptions {
  temperature?: number
  maxTokens?: number
  json?: boolean
}

export interface AIProvider {
  name: string
  complete(messages: AIMessage[], options?: AICompleteOptions): Promise<string>
}