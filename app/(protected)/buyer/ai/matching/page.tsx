import { PageShell } from '@/components/layout/page-shell'
import { FarmerMatchingClient } from '@/components/ai/farmer-matching-client'

export default function FarmerMatchingPage() {
  return (
    <PageShell title="AI Farmer Matching" subtitle="Find ranked farmer matches for your supply requests." role="buyer">
      <FarmerMatchingClient />
    </PageShell>
  )
}
