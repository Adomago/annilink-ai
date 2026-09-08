'use client'

import { useState } from 'react'

interface Output {
  suggested_min: number
  suggested_max: number
  confidence: string
  reasoning: string
}

export function PriceRecommendationClient() {
  const [form, setForm] = useState({ vegetable: '', quantity: '', location: '', season: '' })
  const [output, setOutput] = useState<Output | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function recommend() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/price-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to estimate price')
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
        <input className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Location" value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} />
        <input className="rounded-md border border-zinc-300 px-3 py-2" placeholder="Season" value={form.season} onChange={(event) => setForm((prev) => ({ ...prev, season: event.target.value }))} />
      </div>
      <button type="button" onClick={recommend} disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Calculating...' : 'Recommend price'}</button>
      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-800">AI-assisted estimate — verify against local market rates.</p>

      {output ? (
        <div className="space-y-2 rounded-md border border-zinc-200 p-3">
          <p className="text-lg font-semibold text-zinc-900">₱{output.suggested_min} - ₱{output.suggested_max} / kg</p>
          <p className="text-sm text-zinc-700">Confidence: <span className="font-medium capitalize">{output.confidence}</span></p>
          <p className="text-sm text-zinc-700">{output.reasoning}</p>
        </div>
      ) : null}
    </div>
  )
}
