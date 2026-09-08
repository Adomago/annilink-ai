import Link from 'next/link'
import { registerAction } from '@/app/actions/auth'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">Create your AniLink AI account</h1>
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      <form action={registerAction} className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="full_name">Full Name</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="full_name" name="full_name" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="location">Location</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="location" name="location" required />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="role">Role</label>
          <select className="w-full rounded-md border border-zinc-300 px-3 py-2" id="role" name="role" defaultValue="farmer">
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="farm_name">Farm Name (farmers)</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="farm_name" name="farm_name" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="business_name">Business Name (buyers)</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="business_name" name="business_name" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="email" name="email" type="email" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
            <input className="w-full rounded-md border border-zinc-300 px-3 py-2" id="password" name="password" type="password" required />
          </div>
        </div>

        <button className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white" type="submit">Create account</button>
      </form>
      <p className="text-sm text-zinc-600">Already have an account? <Link className="text-zinc-900 underline" href="/login">Login</Link></p>
    </main>
  )
}
