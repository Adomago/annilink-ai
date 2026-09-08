import { updateModerationStatusAction } from '@/app/actions/admin'
import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/lib/db/types'

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Listing[]>()

  return (
    <PageShell title="Listing Moderation" subtitle="Review and update listing moderation statuses." role="admin">
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      {params.success ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{params.success}</p> : null}

      {!listings?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No listings yet.</div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <article key={listing.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-zinc-900">{listing.title}</h2>
                  <p className="text-sm text-zinc-600">{listing.vegetable} • {listing.location}</p>
                  <p className="text-sm text-zinc-600">Status: {listing.status} • Moderation: {listing.moderation_status}</p>
                </div>
                <form action={updateModerationStatusAction} className="flex items-center gap-2">
                  <input name="listing_id" value={listing.id} readOnly hidden />
                  <select name="moderation_status" defaultValue={listing.moderation_status} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                  </select>
                  <button className="rounded-md border border-zinc-300 px-3 py-2 text-sm" type="submit">Update</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  )
}
