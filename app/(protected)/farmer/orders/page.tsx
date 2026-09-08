import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Order, Listing, Profile } from '@/lib/db/types'
import { updateOrderStatusAction } from '@/app/actions/orders'

const statusActions: Record<Order['status'], string[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['completed', 'cancelled'],
  rejected: [],
  completed: [],
  cancelled: [],
}

export default async function FarmerOrdersPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Order[]>()

  const listingIds = [...new Set((orders ?? []).map((order) => order.listing_id))]
  const buyerIds = [...new Set((orders ?? []).map((order) => order.buyer_id))]

  const { data: listings } = listingIds.length
    ? await supabase.from('listings').select('id,title,vegetable').in('id', listingIds).returns<Pick<Listing, 'id' | 'title' | 'vegetable'>[]>()
    : { data: [] as Pick<Listing, 'id' | 'title' | 'vegetable'>[] }

  const { data: buyers } = buyerIds.length
    ? await supabase.from('profiles').select('id,full_name,business_name').in('id', buyerIds).returns<Pick<Profile, 'id' | 'full_name' | 'business_name'>[]>()
    : { data: [] as Pick<Profile, 'id' | 'full_name' | 'business_name'>[] }

  const listingMap = new Map((listings ?? []).map((item) => [item.id, item]))
  const buyerMap = new Map((buyers ?? []).map((item) => [item.id, item]))

  return (
    <PageShell title="Incoming Orders" subtitle="Accept or reject buyer orders and complete fulfilled ones." role="farmer">
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      {params.success ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{params.success}</p> : null}

      {!orders?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No incoming orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const listing = listingMap.get(order.listing_id)
            const buyer = buyerMap.get(order.buyer_id)
            const actions = statusActions[order.status] ?? []

            return (
              <article key={order.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <h2 className="font-semibold text-zinc-900">{listing?.title ?? 'Listing unavailable'}</h2>
                <p className="text-sm text-zinc-600">Buyer: {buyer?.business_name || buyer?.full_name || 'Verified buyer'}</p>
                <p className="text-sm text-zinc-700">{order.quantity_kg}kg • ₱{order.total_price} • Delivery {order.delivery_date}</p>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Status: {order.status}</p>

                {actions.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {actions.map((nextStatus) => (
                      <form key={nextStatus} action={updateOrderStatusAction}>
                        <input name="order_id" value={order.id} readOnly hidden />
                        <input name="status" value={nextStatus} readOnly hidden />
                        <button className="rounded-md border border-zinc-300 px-3 py-2 text-sm capitalize" type="submit">{nextStatus}</button>
                      </form>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
