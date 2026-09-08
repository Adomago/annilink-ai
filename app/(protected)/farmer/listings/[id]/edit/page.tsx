import { notFound } from 'next/navigation'
import { ListingForm } from '@/components/listings/listing-form'
import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/lib/db/types'

export default async function EditListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params
  const query = await searchParams
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .maybeSingle<Listing>()

  if (!listing) {
    notFound()
  }

  return (
    <PageShell title="Edit Listing" subtitle="Update listing details, inventory, and status." role="farmer">
      {query.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{query.error}</p> : null}
      <ListingForm mode="edit" listing={listing} />
    </PageShell>
  )
}
