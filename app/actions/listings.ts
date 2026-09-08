'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listingSchema } from '@/lib/schemas/listing'

function cleanError(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error'
}

async function uploadImageIfProvided(supabase: Awaited<ReturnType<typeof createClient>>, farmerId: string, file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) {
    return { image_path: null as string | null, image_url: null as string | null }
  }

  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${farmerId}/${crypto.randomUUID()}.${extension}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('listing-images')
    .upload(path, arrayBuffer, { contentType: file.type || 'image/jpeg', upsert: false })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path)
  return { image_path: path, image_url: urlData.publicUrl }
}

export async function createListingAction(formData: FormData) {
  const parsed = listingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    vegetable: formData.get('vegetable'),
    quantity_kg: formData.get('quantity_kg'),
    price_per_kg: formData.get('price_per_kg'),
    unit: formData.get('unit'),
    location: formData.get('location'),
    harvest_date: formData.get('harvest_date'),
    status: formData.get('status') || 'active',
  })

  if (!parsed.success) {
    redirect(`/farmer/listings/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Invalid form')}`)
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  try {
    const image = await uploadImageIfProvided(supabase, auth.user.id, formData.get('image'))

    const payload = {
      farmer_id: auth.user.id,
      ...parsed.data,
      available_quantity_kg: parsed.data.quantity_kg,
      ...image,
    }

    const { error } = await supabase.from('listings').insert(payload)
    if (error) throw new Error(error.message)

    revalidatePath('/farmer/listings')
    revalidatePath('/buyer/marketplace')
  } catch (error) {
    redirect(`/farmer/listings/new?error=${encodeURIComponent(cleanError(error))}`)
  }

  redirect('/farmer/listings')
}

export async function updateListingAction(formData: FormData) {
  const listingId = String(formData.get('listing_id') || '')
  const parsed = listingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category'),
    vegetable: formData.get('vegetable'),
    quantity_kg: formData.get('quantity_kg'),
    price_per_kg: formData.get('price_per_kg'),
    unit: formData.get('unit'),
    location: formData.get('location'),
    harvest_date: formData.get('harvest_date'),
    status: formData.get('status') || 'active',
  })

  if (!listingId || !parsed.success) {
    redirect(`/farmer/listings/${listingId}/edit?error=${encodeURIComponent('Invalid form data')}`)
  }

  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect('/login')

  const { data: existing } = await supabase
    .from('listings')
    .select('available_quantity_kg,quantity_kg')
    .eq('id', listingId)
    .maybeSingle<{ available_quantity_kg: number; quantity_kg: number }>()

  const soldAmount = existing ? Math.max(existing.quantity_kg - existing.available_quantity_kg, 0) : 0
  const nextAvailable = Math.max(parsed.data.quantity_kg - soldAmount, 0)

  const imageFile = formData.get('image')
  let imageFields: { image_path?: string | null; image_url?: string | null } = {}
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadImageIfProvided(supabase, auth.user.id, imageFile)
    imageFields = uploaded
  }

  const { error } = await supabase
    .from('listings')
    .update({ ...parsed.data, available_quantity_kg: nextAvailable, ...imageFields })
    .eq('id', listingId)

  if (error) {
    redirect(`/farmer/listings/${listingId}/edit?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/farmer/listings')
  revalidatePath('/buyer/marketplace')
  revalidatePath(`/buyer/marketplace/${listingId}`)
  redirect('/farmer/listings')
}

export async function deleteListingAction(formData: FormData) {
  const listingId = String(formData.get('listing_id') || '')
  if (!listingId) {
    redirect('/farmer/listings?error=Missing listing')
  }

  const supabase = await createClient()
  const { error } = await supabase.from('listings').delete().eq('id', listingId)

  if (error) {
    redirect(`/farmer/listings?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/farmer/listings')
  revalidatePath('/buyer/marketplace')
  redirect('/farmer/listings')
}
