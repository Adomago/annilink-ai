'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { orderCreateSchema, orderStatusSchema } from '@/lib/schemas/listing'

export async function placeOrderAction(formData: FormData) {
  const listingId = String(formData.get('listing_id') || '')
  const parsed = orderCreateSchema.safeParse({
    quantity_kg: formData.get('quantity_kg'),
    delivery_date: formData.get('delivery_date'),
    notes: formData.get('notes'),
  })

  if (!listingId || !parsed.success) {
    redirect(`/buyer/marketplace/${listingId}?error=${encodeURIComponent('Invalid order input')}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id,farmer_id,price_per_kg,available_quantity_kg,status,title')
    .eq('id', listingId)
    .eq('status', 'active')
    .maybeSingle<{ id: string; farmer_id: string; price_per_kg: number; available_quantity_kg: number; status: string; title: string }>()

  if (listingError || !listing) {
    redirect(`/buyer/marketplace/${listingId}?error=${encodeURIComponent(listingError?.message ?? 'Listing not available')}`)
  }

  if (parsed.data.quantity_kg > listing.available_quantity_kg) {
    redirect(`/buyer/marketplace/${listingId}?error=${encodeURIComponent('Requested quantity exceeds available stock')}`)
  }

  const totalPrice = Number((parsed.data.quantity_kg * listing.price_per_kg).toFixed(2))

  const { error } = await supabase.from('orders').insert({
    listing_id: listing.id,
    buyer_id: user.id,
    farmer_id: listing.farmer_id,
    quantity_kg: parsed.data.quantity_kg,
    price_per_kg: listing.price_per_kg,
    total_price: totalPrice,
    delivery_date: parsed.data.delivery_date,
    notes: parsed.data.notes || null,
    status: 'pending',
  })

  if (error) {
    redirect(`/buyer/marketplace/${listingId}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/buyer/orders')
  revalidatePath('/farmer/orders')
  redirect('/buyer/orders?success=Order placed')
}

export async function updateOrderStatusAction(formData: FormData) {
  const parsed = orderStatusSchema.safeParse({
    order_id: formData.get('order_id'),
    status: formData.get('status'),
  })

  if (!parsed.success) {
    redirect('/farmer/orders?error=Invalid order action')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.rpc('process_order_status_change', {
    p_order_id: parsed.data.order_id,
    p_new_status: parsed.data.status,
    p_actor_id: user.id,
  })

  if (error) {
    redirect(`/farmer/orders?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/farmer/orders')
  revalidatePath('/buyer/orders')
  revalidatePath('/buyer/marketplace')
  redirect('/farmer/orders?success=Order updated')
}
