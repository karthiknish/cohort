import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const fixtureHtml = readFileSync(
  join(process.cwd(), 'e2e/fixtures/agent-mode-shell.html'),
  'utf8',
)

test.describe('Agent mode accessibility', () => {
  test('fixture shell has no serious or critical axe violations', async ({ page }) => {
    await page.setContent(fixtureHtml, { waitUntil: 'domcontentloaded' })

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze()

    const blocking = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )

    expect(blocking).toEqual([])
  })

  test('composer exposes combobox and listbox relationships', async ({ page }) => {
    await page.setContent(fixtureHtml, { waitUntil: 'domcontentloaded' })

    const combobox = page.getByRole('combobox', { name: 'Agent message' })
    await expect(combobox).toHaveAttribute('aria-expanded', 'true')
    await expect(combobox).toHaveAttribute('aria-controls', 'agent-mention-listbox')

    const listbox = page.getByRole('listbox', { name: 'Mention suggestions' })
    await expect(listbox).toBeVisible()
    await expect(page.getByRole('option', { selected: true })).toHaveCount(1)
  })
})

test.describe('Agent mode live app', () => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL, 'Set PLAYWRIGHT_BASE_URL to run against a running app.')

  test('dashboard agent launcher is keyboard reachable', async ({ page }) => {
    await page.goto('/dashboard')
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+Shift+A' : 'Control+Shift+A')
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 })
  })
})
