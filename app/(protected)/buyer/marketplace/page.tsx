import Link from 'next/link'
import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/lib/db/types'

interface Query {
  q?: string
  category?: string
  location?: string
  min?: string
  max?: string
}

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams
  const supabase = await createClient()

  let request = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })

  if (query.q) request = request.ilike('title', `%${query.q}%`)
  if (query.category) request = request.ilike('category', `%${query.category}%`)
  if (query.location) request = request.ilike('location', `%${query.location}%`)
  if (query.min) request = request.gte('price_per_kg', Number(query.min))
  if (query.max) request = request.lte('price_per_kg', Number(query.max))

  const { data: listings } = await request.returns<Listing[]>()

  return (
    <PageShell title="Marketplace" subtitle="Browse and filter active produce listings." role="buyer">
      <form className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className="rounded-md border border-zinc-300 px-3 py-2" name="q" placeholder="Search title" defaultValue={query.q} />
        <input className="rounded-md border border-zinc-300 px-3 py-2" name="category" placeholder="Category" defaultValue={query.category} />
        <input className="rounded-md border border-zinc-300 px-3 py-2" name="location" placeholder="Location" defaultValue={query.location} />
        <input className="rounded-md border border-zinc-300 px-3 py-2" name="min" type="number" min="0" placeholder="Min price" defaultValue={query.min} />
        <input className="rounded-md border border-zinc-300 px-3 py-2" name="max" type="number" min="0" placeholder="Max price" defaultValue={query.max} />
        <button className="rounded-md bg-zinc-900 px-4 py-2 text-white sm:col-span-2 lg:col-span-5" type="submit">Apply filters</button>
      </form>

      {!listings?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No listings match your filters.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <article key={listing.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">{listing.category}</p>
              <h2 className="text-lg font-semibold text-zinc-900">{listing.title}</h2>
              <p className="text-sm text-zinc-600">{listing.location} • {listing.vegetable}</p>
              <p className="mt-2 text-sm text-zinc-700">Available: {listing.available_quantity_kg}kg</p>
              <p className="text-sm font-medium text-zinc-900">₱{listing.price_per_kg}/kg</p>
              <Link href={`/buyer/marketplace/${listing.id}`} className="mt-3 inline-block rounded-md border border-zinc-300 px-3 py-2 text-sm">View listing</Link>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
