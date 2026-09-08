'use client'

import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function AssistantClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!prompt.trim()) return

    const nextMessages: Message[] = [...messages, { role: 'user', content: prompt.trim() }]
    setMessages(nextMessages)
    setPrompt('')
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({ role: message.role, content: message.content })),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Request failed')

      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="max-h-96 space-y-2 overflow-auto rounded-md border border-zinc-200 p-3">
        {!messages.length ? <p className="text-sm text-zinc-500">Ask AniLink AI about farm operations or platform steps.</p> : null}
        {messages.map((message, index) => (
          <p key={index} className={`rounded-md p-2 text-sm ${message.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-800'}`}>
            {message.content}
          </p>
        ))}
      </div>
      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <textarea className="min-h-20 flex-1 rounded-md border border-zinc-300 px-3 py-2" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Type your question..." />
        <button type="button" onClick={submit} disabled={loading} className="h-fit rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60">
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
