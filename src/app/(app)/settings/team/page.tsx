import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InviteForm } from './InviteForm'
import { PendingInvites, type PendingInvite } from './PendingInvites'

export const metadata = { title: 'Team — Settings | Flowlyst' }

export default async function TeamSettingsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the user's workspace (first membership — TICKET-005 will add proper workspace switching)
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    select: {
      role: true,
      workspace: { select: { id: true, name: true } },
    },
  })

  if (!membership) {
    return (
      <main className="container max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-semibold mb-2">Team Settings</h1>
        <p className="text-muted-foreground">You are not a member of any workspace.</p>
      </main>
    )
  }

  const canInvite = membership.role === 'owner' || membership.role === 'admin'

  // Fetch all invites for this workspace — no N+1: single query with workspace filter
  const rawInvites = await prisma.workspaceInvite.findMany({
    where: { workspaceId: membership.workspace.id },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const invites: PendingInvite[] = rawInvites.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    expiresAt: inv.expiresAt,
    acceptedAt: inv.acceptedAt,
    createdAt: inv.createdAt,
  }))

  return (
    <main className="container max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Team Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage team members and invitations for{' '}
          <span className="font-medium text-foreground">{membership.workspace.name}</span>
        </p>
      </div>

      {canInvite && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite a team member</CardTitle>
            <CardDescription>
              Send an email invitation with a role assignment. The link expires in 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteForm />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>
            Invitations sent to people who haven't yet joined the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingInvites invites={invites} />
        </CardContent>
      </Card>
    </main>
  )
}
