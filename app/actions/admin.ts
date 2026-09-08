'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function toggleSuspendUserAction(formData: FormData) {
  const id = String(formData.get('id') || '')
  const isSuspended = String(formData.get('is_suspended') || '') === 'true'
  if (!id) redirect('/admin/users?error=Missing user id')

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({ is_suspended: !isSuspended }).eq('id', id)

  if (error) redirect(`/admin/users?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/admin/users')
  redirect('/admin/users?success=User updated')
}

export async function updateModerationStatusAction(formData: FormData) {
  const listingId = String(formData.get('listing_id') || '')
  const moderationStatus = String(formData.get('moderation_status') || '')

  if (!listingId || !['pending', 'approved', 'rejected'].includes(moderationStatus)) {
    redirect('/admin/listings?error=Invalid moderation update')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('listings')
    .update({ moderation_status: moderationStatus })
    .eq('id', listingId)

  if (error) redirect(`/admin/listings?error=${encodeURIComponent(error.message)}`)

  revalidatePath('/admin/listings')
  revalidatePath('/buyer/marketplace')
  redirect('/admin/listings?success=Listing moderation updated')
}
