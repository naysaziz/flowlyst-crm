'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { sendInviteAction, type ActionResult } from './actions'

export function InviteForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const form = e.currentTarget

    startTransition(async () => {
      const res = await sendInviteAction(formData)
      setResult(res)
      if (res.success) {
        form.reset()
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
      {result?.success && (
        <p className="text-sm text-green-600">Invitation sent successfully!</p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            name="email"
            type="email"
            placeholder="colleague@company.com"
            required
            disabled={isPending}
          />
          {result?.fieldErrors?.email && (
            <p className="text-sm text-destructive">{result.fieldErrors.email[0]}</p>
          )}
        </div>

        <div className="w-full sm:w-40 space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <Select id="invite-role" name="role" defaultValue="member" disabled={isPending}>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </Select>
          {result?.fieldErrors?.role && (
            <p className="text-sm text-destructive">{result.fieldErrors.role[0]}</p>
          )}
        </div>

        <Button type="submit" disabled={isPending} className="sm:self-end">
          {isPending ? 'Sending…' : 'Send invite'}
        </Button>
      </div>
    </form>
  )
}
