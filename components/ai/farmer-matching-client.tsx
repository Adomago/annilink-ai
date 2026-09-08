'use client'

import { useState } from 'react'

interface Match {
  listing_id: string
  farmer: string
  location: string
  vegetable: string
  available_quantity_kg: number
  price_per_kg: number
  score: number
  reason: string
}

export function FarmerMatchingClient() {
  const [requestText, setRequestText] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function matchFarmers() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/farmer-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: requestText }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Matching failed')
      setMatches(data.matches || [])
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
      <textarea className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2" placeholder="Describe your produce requirement (item, quantity, location, budget)." value={requestText} onChange={(event) => setRequestText(event.target.value)} />
      <button type="button" onClick={matchFarmers} disabled={loading} className="rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-60">{loading ? 'Matching...' : 'Find matching farmers'}</button>
      {error ? <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      {!loading && !matches.length ? <p className="text-sm text-zinc-500">No matches yet. Submit a request to get ranked farmers.</p> : null}
      <div className="space-y-2">
        {matches.map((match) => (
          <article key={match.listing_id} className="rounded-md border border-zinc-200 p-3">
            <p className="font-semibold text-zinc-900">{match.farmer} • {match.vegetable}</p>
            <p className="text-sm text-zinc-700">{match.location} • {match.available_quantity_kg}kg • ₱{match.price_per_kg}/kg</p>
            <p className="text-sm text-zinc-700">Score: {match.score}</p>
            <p className="text-sm text-zinc-600">{match.reason}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
