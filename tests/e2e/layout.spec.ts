import { test, expect } from '@playwright/test'

test.describe('Core Layout', () => {
  test('sidebar nav renders correctly on desktop', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page.getByText('Flowlyst')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Contacts')).toBeVisible()
    // etc.
  })

  test('mobile sidebar toggles with hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/app/dashboard')
    const hamburger = page.getByRole('button').filter({ hasText: /Menu/ })
    await expect(hamburger).toBeVisible()
    await hamburger.click()
    await expect(page.getByRole('dialog')).toBeVisible() // Sheet
    // Close
    await page.getByRole('button', { name: 'Close' }).click()
  })

  test('top bar workspace switcher and user menu', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page.getByText('Default Workspace')).toBeVisible()
    await page.getByRole('button', { name: 'Default Workspace' }).click()
    await expect(page.getByRole('menu')).toBeVisible()

    await page.getByRole('button', { name: 'John Doe' }).click()
    await expect(page.locator('text=Profile')).toBeVisible()
  })

  test('responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/app/dashboard')
    await expect(page.locator('aside')).toBeVisible({ timeout: 5000 })
  })
})