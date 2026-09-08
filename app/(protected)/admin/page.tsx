import { PageShell } from '@/components/layout/page-shell'

export default function AdminPage() {
  return (
    <PageShell title="Admin Dashboard" subtitle="Platform-wide oversight for users, listings, and orders." role="admin">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Manage user roles and suspension flags.</article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Moderate listing statuses and quality.</article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">Monitor orders and analytics charts.</article>
      </div>
    </PageShell>
  )
}
