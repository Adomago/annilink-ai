import { PageShell } from '@/components/layout/page-shell'

export default function BuyerPage() {
  return (
    <PageShell title="Buyer Dashboard" subtitle="Discover produce directly from farmers and place orders." role="buyer">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Browse active produce listings with filters.</article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Place and track orders with clear statuses.</article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Use AI farmer matching for supply requests.</article>
      </div>
    </PageShell>
  )
}
