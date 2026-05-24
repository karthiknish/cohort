# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/critical-paths.spec.ts >> Public routes >> sign-in page loads
- Location: e2e/smoke/critical-paths.spec.ts:11:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/sign-in
Call log:
  - navigating to "http://127.0.0.1:3000/sign-in", waiting until "load"

```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | /**
  4  |  * Cross-slice smoke tests. Run with dev server (default) or PLAYWRIGHT_BASE_URL.
  5  |  * Authenticated flows are skipped unless PLAYWRIGHT_E2E_EMAIL is set.
  6  |  */
  7  | 
  8  | const hasAuthCreds = Boolean(process.env.PLAYWRIGHT_E2E_EMAIL?.trim())
  9  | 
  10 | test.describe('Public routes', () => {
  11 |   test('sign-in page loads', async ({ page }) => {
> 12 |     await page.goto('/sign-in')
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:3000/sign-in
  13 |     await expect(page).toHaveURL(/sign-in/)
  14 |     await expect(page.locator('body')).toBeVisible()
  15 |   })
  16 | 
  17 |   test('unauthenticated dashboard redirects to sign-in', async ({ page }) => {
  18 |     await page.goto('/dashboard')
  19 |     await expect(page).toHaveURL(/sign-in/)
  20 |   })
  21 | })
  22 | 
  23 | test.describe('Authenticated flows', () => {
  24 |   test.skip(!hasAuthCreds, 'Set PLAYWRIGHT_E2E_EMAIL (and password via env) for authenticated smoke.')
  25 | 
  26 |   test.beforeEach(async ({ page }) => {
  27 |     const email = process.env.PLAYWRIGHT_E2E_EMAIL!.trim()
  28 |     const password = process.env.PLAYWRIGHT_E2E_PASSWORD ?? ''
  29 | 
  30 |     await page.goto('/sign-in')
  31 |     await page.getByLabel(/email/i).fill(email)
  32 |     if (password) {
  33 |       await page.getByLabel(/password/i).fill(password)
  34 |     }
  35 |     await page.getByRole('button', { name: /sign in/i }).click()
  36 |     await page.waitForURL(/\/dashboard/, { timeout: 30_000 })
  37 |   })
  38 | 
  39 |   test('proposals route is reachable', async ({ page }) => {
  40 |     await page.goto('/dashboard/proposals')
  41 |     await expect(page).toHaveURL(/proposals/)
  42 |     await expect(page.locator('body')).toBeVisible()
  43 |   })
  44 | 
  45 |   test('collaboration route is reachable', async ({ page }) => {
  46 |     await page.goto('/dashboard/collaboration')
  47 |     await expect(page).toHaveURL(/collaboration/)
  48 |     await expect(page.locator('body')).toBeVisible()
  49 |   })
  50 | 
  51 |   test('ads route is reachable', async ({ page }) => {
  52 |     await page.goto('/dashboard/ads')
  53 |     await expect(page).toHaveURL(/ads/)
  54 |     await expect(page.locator('body')).toBeVisible()
  55 |   })
  56 | })
  57 | 
```