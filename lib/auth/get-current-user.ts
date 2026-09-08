import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/lib/db/types'

export interface CurrentUserContext {
  userId: string
  email: string | undefined
  profile: Profile | null
  role: UserRole | null
}

export async function getCurrentUserContext(): Promise<CurrentUserContext | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle<Profile>()

  return {
    userId: data.user.id,
    email: data.user.email,
    profile: profile ?? null,
    role: profile?.role ?? null,
  }
}

export function roleHome(role: UserRole) {
  if (role === 'admin') return '/admin'
  if (role === 'buyer') return '/buyer'
  return '/farmer'
}
