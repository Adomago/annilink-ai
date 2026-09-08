import Link from 'next/link'
import type { ReactNode } from 'react'

interface PageShellProps {
  title: string
  subtitle?: string
  role: 'farmer' | 'buyer' | 'admin'
  children: ReactNode
}

const roleNav: Record<PageShellProps['role'], { href: string; label: string }[]> = {
  farmer: [
    { href: '/farmer', label: 'Dashboard' },
    { href: '/farmer/listings', label: 'My Listings' },
    { href: '/farmer/orders', label: 'Orders' },
    { href: '/farmer/ai/assistant', label: 'AI Assistant' },
    { href: '/farmer/ai/listing-generator', label: 'Listing Generator' },
    { href: '/farmer/ai/price', label: 'Price Recommendation' },
  ],
  buyer: [
    { href: '/buyer', label: 'Dashboard' },
    { href: '/buyer/marketplace', label: 'Marketplace' },
    { href: '/buyer/orders', label: 'Orders' },
    { href: '/buyer/ai/matching', label: 'Farmer Matching' },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/listings', label: 'Listings' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/analytics', label: 'Analytics' },
  ],
}

export function PageShell({ title, subtitle, role, children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
          <Link href="/" className="text-lg font-semibold">AniLink AI</Link>
          <form action="/auth/logout" method="post">
            <button className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50" type="submit">
              Logout
            </button>
          </form>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-4">
          {roleNav[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md bg-zinc-100 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
          {subtitle ? <p className="text-zinc-600">{subtitle}</p> : null}
        </div>
        {children}
      </main>
    </div>
  )
}
