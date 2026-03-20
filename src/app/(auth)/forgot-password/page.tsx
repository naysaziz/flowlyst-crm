'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ForgotPassword() {
  return (
    <>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter your email below and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="m@example.com" className="w-full p-2 border rounded" />
              </div>
              <Button type="submit" className="w-full">Send reset link</Button>
            </div>
          </form>
          <Button asChild variant="link" className="w-full mt-4">
            <Link href="/login">Back to login</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Password reset functionality coming soon.
          </p>
        </CardContent>
      </Card>
    </>
  )
}