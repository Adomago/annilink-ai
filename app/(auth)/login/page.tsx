import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Login to AniLink AI</h1>
      <p className="text-zinc-600">Direct farmer-to-buyer marketplace with AI assistance.</p>
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      <form action={loginAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
          <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="password" name="password" type="password" required />
        </div>
        <button className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white" type="submit">Login</button>
      </form>
      <p className="text-sm text-zinc-600">No account yet? <Link className="text-zinc-900 underline" href="/register">Register</Link></p>
    </main>
  )
}
