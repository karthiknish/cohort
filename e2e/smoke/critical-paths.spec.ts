import { expect, test } from '@playwright/test'

/**
 * Cross-slice smoke tests. Run with dev server (default) or PLAYWRIGHT_BASE_URL.
 * Authenticated flows are skipped unless PLAYWRIGHT_E2E_EMAIL is set.
 */

const hasAuthCreds = Boolean(process.env.PLAYWRIGHT_E2E_EMAIL?.trim())

test.describe('Public routes', () => {
  test('sign-in page loads', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page).toHaveURL(/sign-in/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('unauthenticated dashboard redirects to sign-in', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/sign-in/)
  })
})

test.describe('Authenticated flows', () => {
  test.skip(!hasAuthCreds, 'Set PLAYWRIGHT_E2E_EMAIL (and password via env) for authenticated smoke.')

  test.beforeEach(async ({ page }) => {
    const email = process.env.PLAYWRIGHT_E2E_EMAIL!.trim()
    const password = process.env.PLAYWRIGHT_E2E_PASSWORD ?? ''

    await page.goto('/sign-in')
    await page.getByLabel(/email/i).fill(email)
    if (password) {
      await page.getByLabel(/password/i).fill(password)
    }
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 })
  })

  test('proposals route is reachable', async ({ page }) => {
    await page.goto('/dashboard/proposals')
    await expect(page).toHaveURL(/proposals/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('collaboration route is reachable', async ({ page }) => {
    await page.goto('/dashboard/collaboration')
    await expect(page).toHaveURL(/collaboration/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('ads route is reachable', async ({ page }) => {
    await page.goto('/dashboard/ads')
    await expect(page).toHaveURL(/ads/)
    await expect(page.locator('body')).toBeVisible()
  })
})
