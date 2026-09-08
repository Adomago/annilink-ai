import { notFound } from 'next/navigation'
import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Listing, Profile } from '@/lib/db/types'
import { placeOrderAction } from '@/app/actions/orders'

export default async function ListingDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params
  const query = await searchParams
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle<Listing>()

  if (!listing) notFound()

  const { data: farmer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', listing.farmer_id)
    .maybeSingle<Profile>()

  return (
    <PageShell title={listing.title} subtitle="Listing details and order form." role="buyer">
      {query.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error}</p> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="space-y-2 rounded-lg border border-zinc-200 bg-white p-4 lg:col-span-2">
          {listing.image_url ? <img src={listing.image_url} alt={listing.title} className="h-72 w-full rounded-md object-cover" /> : null}
          <p className="text-sm text-zinc-600">{listing.description}</p>
          <p className="text-sm text-zinc-700">Produce: {listing.vegetable}</p>
          <p className="text-sm text-zinc-700">Category: {listing.category}</p>
          <p className="text-sm text-zinc-700">Location: {listing.location}</p>
          <p className="text-sm text-zinc-700">Harvest date: {listing.harvest_date}</p>
          <p className="text-sm text-zinc-700">Available quantity: {listing.available_quantity_kg}kg</p>
          <p className="text-lg font-semibold text-zinc-900">₱{listing.price_per_kg}/kg</p>
          <p className="text-xs text-zinc-500">Farmer: {farmer?.farm_name || farmer?.full_name || 'Verified farmer'}</p>
        </article>

        <form action={placeOrderAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
          <input name="listing_id" value={listing.id} readOnly hidden />
          <h2 className="text-lg font-semibold">Place order</h2>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="quantity_kg">Quantity (kg)</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="quantity_kg" name="quantity_kg" type="number" min="1" max={listing.available_quantity_kg} step="0.01" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="delivery_date">Delivery date</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="delivery_date" name="delivery_date" type="date" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="notes">Notes</label>
            <textarea className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2" id="notes" name="notes" placeholder="Delivery instructions, quality specs, etc." />
          </div>
          <button type="submit" className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white">Submit order</button>
        </form>
      </section>
    </PageShell>
  )
}
