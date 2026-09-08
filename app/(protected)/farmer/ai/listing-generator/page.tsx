import { PageShell } from '@/components/layout/page-shell'
import { ListingGeneratorClient } from '@/components/ai/listing-generator-client'

export default function ListingGeneratorPage() {
  return (
    <PageShell title="AI Listing Generator" subtitle="Turn rough produce notes into polished listing copy." role="farmer">
      <ListingGeneratorClient />
    </PageShell>
  )
}
