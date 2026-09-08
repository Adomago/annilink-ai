import { PageShell } from '@/components/layout/page-shell'
import { getCurrentUserContext } from '@/lib/auth/get-current-user'

export default async function FarmerPage() {
  const current = await getCurrentUserContext()

  return (
    <PageShell title="Farmer Dashboard" subtitle={`Welcome back${current?.profile?.full_name ? `, ${current.profile.full_name}` : ''}.`} role="farmer">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Create and manage listings with inventory visibility.</article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Review incoming orders and update statuses.</article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Use AI tools for pricing, listing copy, and support.</article>
      </div>
    </PageShell>
  )
}
