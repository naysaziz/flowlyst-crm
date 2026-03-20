'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendInviteEmail } from '@/lib/ses'
import { INVITE_EXPIRY_DAYS } from '@/lib/invite-utils'

export type ActionResult = {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
})

export async function sendInviteAction(formData: FormData): Promise<ActionResult> {
  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    select: {
      workspaceId: true,
      role: true,
      workspace: { select: { id: true, name: true } },
    },
  })
  if (!member) return { error: 'No workspace found' }

  // Only owners and admins can invite
  if (member.role !== 'owner' && member.role !== 'admin') {
    return { error: 'You do not have permission to invite members' }
  }

  // Check for existing pending/accepted invite for this email in the workspace
  const existing = await prisma.workspaceInvite.findFirst({
    where: {
      workspaceId: member.workspaceId,
      email: parsed.data.email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
  if (existing) {
    return { error: 'A pending invite already exists for this email' }
  }

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
  const token = crypto.randomUUID()

  await prisma.workspaceInvite.create({
    data: {
      workspaceId: member.workspaceId,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      invitedBy: user.id,
      expiresAt,
    },
  })

  try {
    await sendInviteEmail({
      to: parsed.data.email,
      workspaceName: member.workspace.name,
      inviterEmail: user.email ?? 'your team',
      role: parsed.data.role,
      inviteToken: token,
    })
  } catch (err) {
    console.error('SES send failed:', err)
    // Don't fail the action — invite is created, email can be resent
  }

  revalidatePath('/settings/team')
  return { success: true }
}

export async function revokeInviteAction(inviteId: string): Promise<ActionResult> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    select: { workspaceId: true, role: true },
  })
  if (!member) return { error: 'No workspace found' }

  if (member.role !== 'owner' && member.role !== 'admin') {
    return { error: 'You do not have permission to revoke invites' }
  }

  // Verify the invite belongs to this workspace before deleting
  const invite = await prisma.workspaceInvite.findFirst({
    where: { id: inviteId, workspaceId: member.workspaceId },
  })
  if (!invite) return { error: 'Invite not found' }

  await prisma.workspaceInvite.delete({ where: { id: inviteId } })

  revalidatePath('/settings/team')
  return { success: true }
}
