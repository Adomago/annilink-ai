import Link from 'next/link'
import { getCurrentUserContext, roleHome } from '@/lib/auth/get-current-user'
import { redirect } from 'next/navigation'

export default async function Home() {
  const current = await getCurrentUserContext()

  if (current?.role) {
    redirect(roleHome(current.role))
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-start justify-center gap-6 px-4">
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-600">AniLink AI MVP</span>
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Direct farmer-to-buyer marketplace with AI assistance</h1>
      <p className="max-w-2xl text-zinc-600">
        AniLink AI helps farmers list produce, buyers place orders, and admins oversee operations with secure role-based access and server-side AI features.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className="rounded-md bg-zinc-900 px-4 py-2 text-white">Create account</Link>
        <Link href="/login" className="rounded-md border border-zinc-300 px-4 py-2">Login</Link>
      </div>
    </main>
  )
}
