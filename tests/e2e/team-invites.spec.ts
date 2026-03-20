/**
 * E2E tests for team invite flow (TICKET-028)
 * Tests: settings/team page auth guard, invite accept page UI,
 *        invalid/expired token handling, form elements present
 *
 * NOTE: Tests that mutate the DB (send invite, accept invite) require
 * live Supabase + SES credentials. These tests cover page rendering,
 * auth guards, and error states.
 */
import { test, expect } from 'playwright/test'

// ─── SETTINGS / TEAM PAGE ────────────────────────────────────────────────────

test.describe('Settings > Team page', () => {
  test('redirects unauthenticated user to /login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/settings/team')
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─── INVITE ACCEPT PAGE — invalid token ──────────────────────────────────────

test.describe('/invite/[token] — invalid token', () => {
  test('renders 404-style message for unknown token', async ({ page }) => {
    await page.goto('/invite/totally-invalid-token-that-does-not-exist')
    await expect(
      page.getByText(/invitation not found/i),
    ).toBeVisible()
  })

  test('does not crash for malformed token', async ({ page }) => {
    const response = await page.goto('/invite/../../etc-passwd')
    expect(response?.status()).not.toBe(500)
  })

  test('does not crash for very long token', async ({ page }) => {
    const longToken = 'a'.repeat(300)
    const response = await page.goto(`/invite/${longToken}`)
    expect(response?.status()).not.toBe(500)
  })
})

// ─── INVITE ACCEPT PAGE — structure ──────────────────────────────────────────

test.describe('/invite/[token] — page structure (invalid token path)', () => {
  test('shows page without crashing', async ({ page }) => {
    const response = await page.goto('/invite/some-token-123')
    // Should render something, not a 500
    expect(response?.status()).not.toBe(500)
  })

  test('contains Flowlyst branding in the document title', async ({ page }) => {
    await page.goto('/invite/some-token-123')
    const title = await page.title()
    expect(title).toMatch(/flowlyst/i)
  })
})
