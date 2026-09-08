import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Order, Listing } from '@/lib/db/types'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Order[]>()

  const listingIds = [...new Set((orders ?? []).map((order) => order.listing_id))]
  const { data: listings } = listingIds.length
    ? await supabase.from('listings').select('id,title').in('id', listingIds).returns<Pick<Listing, 'id' | 'title'>[]>()
    : { data: [] as Pick<Listing, 'id' | 'title'>[] }

  const listingMap = new Map((listings ?? []).map((item) => [item.id, item]))

  return (
    <PageShell title="All Orders" subtitle="Platform-wide order visibility for administrators." role="admin">
      {!orders?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No orders yet.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{listingMap.get(order.listing_id)?.title || 'Removed listing'}</td>
                  <td className="px-4 py-3">{order.quantity_kg}kg</td>
                  <td className="px-4 py-3">₱{order.total_price}</td>
                  <td className="px-4 py-3 capitalize">{order.status}</td>
                  <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
