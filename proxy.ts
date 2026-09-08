import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const roleRoutes = [
  { path: '/farmer', role: 'farmer' },
  { path: '/buyer', role: 'buyer' },
  { path: '/admin', role: 'admin' },
] as const

const authPages = ['/login', '/register']

function isProtectedPath(pathname: string) {
  return roleRoutes.some((entry) => pathname.startsWith(entry.path))
}

function roleForPath(pathname: string) {
  return roleRoutes.find((entry) => pathname.startsWith(entry.path))?.role
}

function roleHome(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'buyer') return '/buyer'
  return '/farmer'
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'Please login to continue')
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role,is_suspended')
      .eq('id', user.id)
      .maybeSingle<{ role: 'farmer' | 'buyer' | 'admin'; is_suspended: boolean }>()

    if (profile?.is_suspended) {
      const logoutUrl = new URL('/auth/logout', request.url)
      return NextResponse.redirect(logoutUrl)
    }

    if (authPages.some((path) => pathname.startsWith(path)) && profile?.role) {
      return NextResponse.redirect(new URL(roleHome(profile.role), request.url))
    }

    const neededRole = roleForPath(pathname)
    if (neededRole && profile?.role && profile.role !== neededRole) {
      return NextResponse.redirect(new URL(roleHome(profile.role), request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
