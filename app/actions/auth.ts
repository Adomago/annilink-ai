'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { roleHome } from '@/lib/auth/get-current-user'
import type { UserRole } from '@/lib/db/types'

const loginSchema = z.object({
  email: z.email('Enter a valid email').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = loginSchema.extend({
  role: z.enum(['farmer', 'buyer']),
  full_name: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  location: z.string().min(2, 'Location is required').trim(),
  farm_name: z.string().trim().optional(),
  business_name: z.string().trim().optional(),
})

async function redirectAfterLogin() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login?error=Unable to resolve session')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle<{ role: UserRole }>()

  if (!profile?.role) {
    redirect('/login?error=Profile is missing')
  }

  redirect(roleHome(profile.role))
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Invalid form')}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  await redirectAfterLogin()
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    full_name: formData.get('full_name'),
    location: formData.get('location'),
    farm_name: formData.get('farm_name'),
    business_name: formData.get('business_name'),
  })

  if (!parsed.success) {
    redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? 'Invalid form')}`)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    redirect(`/register?error=${encodeURIComponent(error?.message ?? 'Signup failed')}`)
  }

  const payload = {
    id: data.user.id,
    role: parsed.data.role,
    full_name: parsed.data.full_name,
    location: parsed.data.location,
    farm_name: parsed.data.role === 'farmer' ? parsed.data.farm_name || null : null,
    business_name: parsed.data.role === 'buyer' ? parsed.data.business_name || null : null,
  }

  const { error: profileError } = await supabase.from('profiles').upsert(payload)
  if (profileError) {
    redirect(`/register?error=${encodeURIComponent(profileError.message)}`)
  }

  await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  redirect(parsed.data.role === 'farmer' ? '/farmer' : '/buyer')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
