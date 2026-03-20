import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createServerSupabase } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getInviteStatus, ROLE_LABELS, type MemberRoleType } from '@/lib/invite-utils'
import { AcceptInviteForm } from './AcceptInviteForm'

export const metadata = { title: 'Accept Invitation | Flowlyst' }

type Props = {
  params: Promise<{ token: string }>
}

export default async function InviteAcceptPage({ params }: Props) {
  const { token } = await params

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      workspace: { select: { name: true, logoUrl: true } },
    },
  })

  if (!invite) {
    return (
      <main className="container flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  const status = getInviteStatus(invite.acceptedAt, invite.expiresAt)

  if (status !== 'pending') {
    return (
      <main className="container flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>
              {status === 'accepted' ? 'Already accepted' : 'Invitation expired'}
            </CardTitle>
            <CardDescription>
              {status === 'accepted'
                ? 'This invitation has already been accepted.'
                : 'This invitation has expired. Ask the workspace admin to send a new one.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const roleLabel = ROLE_LABELS[invite.role as MemberRoleType] ?? invite.role

  return (
    <main className="container flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {invite.workspace.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invite.workspace.logoUrl}
                alt={`${invite.workspace.name} logo`}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                {invite.workspace.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{invite.workspace.name}</CardTitle>
              <CardDescription>You&apos;ve been invited to join this workspace</CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Role:</span>
            <Badge variant="outline">{roleLabel}</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <AcceptInviteForm
            token={token}
            isLoggedIn={isLoggedIn}
            invitedEmail={invite.email}
          />
        </CardContent>
      </Card>
    </main>
  )
}
