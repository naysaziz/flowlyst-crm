export type MemberRoleType = 'owner' | 'admin' | 'member' | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'expired'

export function getInviteStatus(
  acceptedAt: Date | null,
  expiresAt: Date,
): InviteStatus {
  if (acceptedAt) return 'accepted'
  if (expiresAt < new Date()) return 'expired'
  return 'pending'
}

export function isInviteValid(
  acceptedAt: Date | null,
  expiresAt: Date,
): boolean {
  return !acceptedAt && expiresAt > new Date()
}

export const ROLE_LABELS: Record<MemberRoleType, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}

export const INVITE_EXPIRY_DAYS = 7
