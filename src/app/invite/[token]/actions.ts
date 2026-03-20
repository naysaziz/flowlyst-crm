'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { isInviteValid } from '@/lib/invite-utils'

export type AcceptActionResult = {
  error?: string
  success?: boolean
}

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function acceptInviteAction(token: string): Promise<AcceptActionResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to accept an invitation' }

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    select: {
      id: true,
      workspaceId: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      invitedBy: true,
    },
  })

  if (!invite) return { error: 'Invitation not found' }
  if (!isInviteValid(invite.acceptedAt, invite.expiresAt)) {
    return { error: 'This invitation has expired or has already been accepted' }
  }

  // Check if user is already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invite.workspaceId,
        userId: user.id,
      },
    },
  })
  if (existingMember) return { error: 'You are already a member of this workspace' }

  // Create membership and mark invite accepted in a transaction
  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId: user.id,
        role: invite.role,
        invitedBy: invite.invitedBy,
      },
    }),
    prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ])

  redirect('/settings/team')
}

export async function signupAndAcceptInviteAction(
  token: string,
  formData: FormData,
): Promise<AcceptActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? 'Validation failed',
    }
  }

  // Validate invite first
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    select: {
      id: true,
      workspaceId: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      invitedBy: true,
      email: true,
    },
  })

  if (!invite) return { error: 'Invitation not found' }
  if (!isInviteValid(invite.acceptedAt, invite.expiresAt)) {
    return { error: 'This invitation has expired or has already been accepted' }
  }

  const supabase = await createServerSupabase()

  // Sign up the user via Supabase Auth
  const { data: authData, error: signupError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (signupError) return { error: signupError.message }
  if (!authData.user) return { error: 'Failed to create account. Please try again.' }

  // Create membership and mark invite accepted
  await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId: authData.user.id,
        role: invite.role,
        invitedBy: invite.invitedBy,
      },
    }),
    prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ])

  return { success: true }
}
