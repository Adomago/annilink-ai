'use client'

import { useState } from 'react'

interface Output {
  title: string
  description: string
  highlights: string[]
}

export function ListingGeneratorClient() {
  const [form, setForm] = useState({ vegetable: '', quantity: '', notes: '' })
  const [output, setOutput] = useState<Output | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/listing-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to generate listing')
      setOutput(data)
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Vegetable" value={form.vegetable} onChange={(event) => setForm((prev) => ({ ...prev, vegetable: event.target.value }))} />
        <input className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Quantity" value={form.quantity} onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))} />
      </div>
      <textarea className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2" placeholder="Notes" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
      <button type="button" onClick={generate} disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Generating...' : 'Generate listing copy'}</button>
      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}

      {output ? (
        <div className="space-y-2 rounded-md border border-zinc-200 p-3">
          <p className="text-sm text-zinc-500">Generated title</p>
          <p className="font-semibold text-zinc-900">{output.title}</p>
          <p className="text-sm text-zinc-500">Description</p>
          <p className="text-sm text-zinc-700">{output.description}</p>
          <p className="text-sm text-zinc-500">Highlights</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {output.highlights?.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
