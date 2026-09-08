import { toggleSuspendUserAction } from '@/app/actions/admin'
import { PageShell } from '@/components/layout/page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/db/types'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Profile[]>()

  return (
    <PageShell title="User Management" subtitle="Role visibility and suspension controls." role="admin">
      {params.error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{params.error}</p> : null}
      {params.success ? <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">{params.success}</p> : null}

      {!profiles?.length ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">No users yet.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">{profile.full_name}</td>
                  <td className="px-4 py-3 capitalize">{profile.role}</td>
                  <td className="px-4 py-3">{profile.location || '-'}</td>
                  <td className="px-4 py-3">{profile.is_suspended ? 'Suspended' : 'Active'}</td>
                  <td className="px-4 py-3">
                    <form action={toggleSuspendUserAction}>
                      <input name="id" value={profile.id} readOnly hidden />
                      <input name="is_suspended" value={String(profile.is_suspended)} readOnly hidden />
                      <button type="submit" className="rounded-md border border-zinc-300 px-3 py-1 text-xs">
                        {profile.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}
