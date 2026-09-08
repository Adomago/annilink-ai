import Link from 'next/link'
import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/lib/db/types'
import { deleteListingAction } from '@/app/actions/listings'

export default async function FarmerListingsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Listing[]>()

  return (
    <PageShell title="My Listings" subtitle="Create and manage your produce listings." role="farmer">
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      {params.success ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{params.success}</p> : null}

      <div className="flex justify-end">
        <Link href="/farmer/listings/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white">New listing</Link>
      </div>

      {!listings?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No listings yet. Create your first produce listing.</div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <article key={listing.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">{listing.title}</h2>
                  <p className="text-sm text-zinc-600">{listing.vegetable} • {listing.location}</p>
                  <p className="mt-1 text-sm text-zinc-600">{listing.available_quantity_kg}kg available of {listing.quantity_kg}kg • ₱{listing.price_per_kg}/kg</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">Status: {listing.status} • Moderation: {listing.moderation_status}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/farmer/listings/${listing.id}/edit`} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Edit</Link>
                  <form action={deleteListingAction}>
                    <input name="listing_id" value={listing.id} readOnly hidden />
                    <button type="submit" className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700">Delete</button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
