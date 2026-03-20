/**
 * Unit tests for invite utility functions (TICKET-028)
 * Tests: getInviteStatus, isInviteValid, ROLE_LABELS
 */
import { describe, it, expect } from 'vitest'
import { getInviteStatus, isInviteValid, ROLE_LABELS } from '@/lib/invite-utils'

// ─── getInviteStatus ─────────────────────────────────────────────────────────

describe('getInviteStatus', () => {
  it('returns "accepted" when acceptedAt is set (regardless of expiry)', () => {
    expect(
      getInviteStatus(new Date(), new Date(Date.now() + 10_000)),
    ).toBe('accepted')
  })

  it('returns "accepted" even when expiresAt is in the past, if acceptedAt is set', () => {
    expect(
      getInviteStatus(new Date(), new Date(Date.now() - 10_000)),
    ).toBe('accepted')
  })

  it('returns "expired" when expiresAt is in the past and acceptedAt is null', () => {
    expect(
      getInviteStatus(null, new Date(Date.now() - 10_000)),
    ).toBe('expired')
  })

  it('returns "pending" when expiresAt is in the future and acceptedAt is null', () => {
    expect(
      getInviteStatus(null, new Date(Date.now() + 86_400_000)),
    ).toBe('pending')
  })

  it('returns "expired" for exactly-now expiresAt', () => {
    // Date.now() - 1ms to ensure we're in the past
    expect(
      getInviteStatus(null, new Date(Date.now() - 1)),
    ).toBe('expired')
  })
})

// ─── isInviteValid ────────────────────────────────────────────────────────────

describe('isInviteValid', () => {
  it('returns true for a pending invite within expiry', () => {
    expect(isInviteValid(null, new Date(Date.now() + 86_400_000))).toBe(true)
  })

  it('returns false when invite is already accepted', () => {
    expect(isInviteValid(new Date(), new Date(Date.now() + 86_400_000))).toBe(false)
  })

  it('returns false when invite is expired', () => {
    expect(isInviteValid(null, new Date(Date.now() - 1))).toBe(false)
  })

  it('returns false when invite is both expired and accepted', () => {
    expect(isInviteValid(new Date(), new Date(Date.now() - 1))).toBe(false)
  })
})

// ─── ROLE_LABELS ─────────────────────────────────────────────────────────────

describe('ROLE_LABELS', () => {
  it('has a label for every MemberRole', () => {
    const roles = ['owner', 'admin', 'member', 'viewer'] as const
    for (const role of roles) {
      expect(ROLE_LABELS[role]).toBeTruthy()
    }
  })

  it('renders human-readable labels', () => {
    expect(ROLE_LABELS.owner).toBe('Owner')
    expect(ROLE_LABELS.admin).toBe('Admin')
    expect(ROLE_LABELS.member).toBe('Member')
    expect(ROLE_LABELS.viewer).toBe('Viewer')
  })
})
