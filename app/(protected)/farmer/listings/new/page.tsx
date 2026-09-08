import { ListingForm } from '@/components/listings/listing-form'
import { PageShell } from '@/components/layout/page-shell'

export default async function NewListingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <PageShell title="Create Listing" subtitle="Post fresh produce for institutional buyers." role="farmer">
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      <ListingForm mode="create" />
    </PageShell>
  )
}
