'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { acceptInviteAction, signupAndAcceptInviteAction } from './actions'

type Props = {
  token: string
  isLoggedIn: boolean
  invitedEmail: string
}

export function AcceptInviteForm({ token, isLoggedIn, invitedEmail }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showSignup, setShowSignup] = useState(!isLoggedIn)

  // Logged-in: one-click accept
  if (isLoggedIn) {
    function handleAccept() {
      startTransition(async () => {
        const res = await acceptInviteAction(token)
        if (res?.error) {
          setError(res.error)
        }
        // On success, acceptInviteAction redirects to /settings/team
      })
    }

    return (
      <div className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleAccept} disabled={isPending} className="w-full">
          {isPending ? 'Accepting…' : 'Accept invitation'}
        </Button>
      </div>
    )
  }

  // Not logged in: signup form
  function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await signupAndAcceptInviteAction(token, formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        router.push('/login?message=Account created — please check your email to confirm, then log in.')
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      {showSignup ? (
        <>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accept-email">Email</Label>
              <Input
                id="accept-email"
                name="email"
                type="email"
                defaultValue={invitedEmail}
                placeholder="you@example.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accept-password">Password</Label>
              <Input
                id="accept-password"
                name="password"
                type="password"
                placeholder="Create a password (min 8 chars)"
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account…' : 'Create account & accept'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setShowSignup(false)}
              className="underline hover:text-foreground"
            >
              Sign in instead
            </button>
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Sign in to your existing account to accept the invitation.
          </p>
          <Button
            asChild
            className="w-full"
            variant="outline"
          >
            <a href={`/login?next=/invite/${token}`}>Sign in to accept</a>
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="underline hover:text-foreground"
            >
              Create one
            </button>
          </p>
        </>
      )}
    </div>
  )
}
