'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { revokeInviteAction } from './actions'
import { getInviteStatus, ROLE_LABELS, type MemberRoleType } from '@/lib/invite-utils'

export type PendingInvite = {
  id: string
  email: string
  role: string
  expiresAt: Date
  acceptedAt: Date | null
  createdAt: Date
}

function StatusBadge({ acceptedAt, expiresAt }: { acceptedAt: Date | null; expiresAt: Date }) {
  const status = getInviteStatus(acceptedAt, expiresAt)
  if (status === 'accepted') return <Badge variant="success">Accepted</Badge>
  if (status === 'expired') return <Badge variant="secondary">Expired</Badge>
  return <Badge variant="outline">Pending</Badge>
}

function RevokeButton({ inviteId }: { inviteId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRevoke() {
    startTransition(async () => {
      const res = await revokeInviteAction(inviteId)
      if (res.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div>
      {error && <p className="text-xs text-destructive mb-1">{error}</p>}
      <Button
        variant="destructive"
        onClick={handleRevoke}
        disabled={isPending}
        className="text-xs px-3 py-1 h-auto"
      >
        {isPending ? 'Revoking…' : 'Revoke'}
      </Button>
    </div>
  )
}

export function PendingInvites({ invites }: { invites: PendingInvite[] }) {
  if (invites.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No pending invitations.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Email</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Role</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground hidden sm:table-cell">Expires</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
            <th className="pb-3 font-medium text-muted-foreground"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invites.map((invite) => {
            const status = getInviteStatus(invite.acceptedAt, invite.expiresAt)
            return (
              <tr key={invite.id} className="py-3">
                <td className="py-3 pr-4">{invite.email}</td>
                <td className="py-3 pr-4">
                  {ROLE_LABELS[invite.role as MemberRoleType] ?? invite.role}
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell text-muted-foreground">
                  {invite.expiresAt.toLocaleDateString()}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge acceptedAt={invite.acceptedAt} expiresAt={invite.expiresAt} />
                </td>
                <td className="py-3">
                  {status === 'pending' && <RevokeButton inviteId={invite.id} />}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
