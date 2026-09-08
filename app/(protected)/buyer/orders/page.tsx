import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Order, Listing } from '@/lib/db/types'

export default async function BuyerOrdersPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Order[]>()

  const listingIds = [...new Set((orders ?? []).map((order) => order.listing_id))]
  const { data: listings } = listingIds.length
    ? await supabase.from('listings').select('id,title,vegetable').in('id', listingIds).returns<Pick<Listing, 'id' | 'title' | 'vegetable'>[]>()
    : { data: [] as Pick<Listing, 'id' | 'title' | 'vegetable'>[] }

  const listingMap = new Map((listings ?? []).map((item) => [item.id, item]))

  return (
    <PageShell title="My Orders" subtitle="Track your order lifecycle in one view." role="buyer">
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      {params.success ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{params.success}</p> : null}

      {!orders?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No orders yet. Place your first order from the marketplace.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const listing = listingMap.get(order.listing_id)
            return (
              <article key={order.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <h2 className="font-semibold text-zinc-900">{listing?.title ?? 'Listing unavailable'}</h2>
                <p className="text-sm text-zinc-600">{listing?.vegetable ?? ''}</p>
                <p className="text-sm text-zinc-700">{order.quantity_kg}kg • ₱{order.total_price} total</p>
                <p className="text-sm text-zinc-700">Delivery date: {order.delivery_date}</p>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Status: {order.status}</p>
              </article>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
