import { PageShell } from '@/components/layout/page-shell'
import { AnalyticsCharts } from '@/components/admin/analytics-charts'
import { createClient } from '@/lib/supabase/server'
import type { Listing, Order } from '@/lib/db/types'

function dateKey(input: string) {
  return new Date(input).toISOString().slice(0, 10)
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const [{ data: orders }, { data: listings }] = await Promise.all([
    supabase.from('orders').select('*').returns<Order[]>(),
    supabase.from('listings').select('*').returns<Listing[]>(),
  ])

  const orderRows = orders ?? []
  const listingRows = listings ?? []

  const ordersOverTimeMap = new Map<string, { orders: number; gmv: number }>()
  for (const order of orderRows) {
    const key = dateKey(order.created_at)
    const current = ordersOverTimeMap.get(key) ?? { orders: 0, gmv: 0 }
    current.orders += 1
    current.gmv += Number(order.total_price)
    ordersOverTimeMap.set(key, current)
  }

  const ordersOverTime = [...ordersOverTimeMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }))

  const categoryMap = new Map<string, number>()
  for (const listing of listingRows) {
    categoryMap.set(listing.category, (categoryMap.get(listing.category) ?? 0) + 1)
  }

  const listingsByCategory = [...categoryMap.entries()].map(([category, count]) => ({ category, count }))

  const totalGmv = orderRows.reduce((sum, order) => sum + Number(order.total_price), 0)

  return (
    <PageShell title="Analytics" subtitle="Orders, GMV, and category insights." role="admin">
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Total Orders</p>
          <p className="text-2xl font-semibold">{orderRows.length}</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">GMV</p>
          <p className="text-2xl font-semibold">₱{totalGmv.toFixed(2)}</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Total Listings</p>
          <p className="text-2xl font-semibold">{listingRows.length}</p>
        </article>
      </div>
      <AnalyticsCharts ordersOverTime={ordersOverTime} listingsByCategory={listingsByCategory} />
    </PageShell>
  )
}
