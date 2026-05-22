import type { DriveStep } from 'driver.js'

export const TOUR_IDS = {
  workspace: 'tour-workspace-selector',
  commandMenuDesktop: 'tour-command-menu',
  commandMenuMobile: 'tour-command-menu-mobile',
  stats: 'tour-stats-cards',
  performance: 'tour-performance-chart',
  quickActions: 'tour-quick-actions',
  sidebar: 'tour-sidebar',
  mobileNav: 'tour-mobile-nav',
  help: 'tour-help-trigger',
} as const

export type TourStepDefinition = Omit<DriveStep, 'element'> & {
  element?: string | Element | (() => Element | undefined)
  /** When set, step is omitted if none of these selectors match a visible element. */
  requiresAny?: string[]
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

export function queryVisibleTourElement(selector: string): Element | undefined {
  const nodes = document.querySelectorAll(selector)
  for (const node of nodes) {
    if (node instanceof HTMLElement && isVisible(node)) {
      return node
    }
  }
  return undefined
}

export function resolveCommandMenuElement(): Element | undefined {
  return (
    queryVisibleTourElement(`#${TOUR_IDS.commandMenuDesktop}`) ??
    queryVisibleTourElement(`#${TOUR_IDS.commandMenuMobile}`)
  )
}

export function resolveNavigationElement(): Element | undefined {
  return (
    queryVisibleTourElement(`#${TOUR_IDS.sidebar}`) ??
    queryVisibleTourElement(`#${TOUR_IDS.mobileNav}`)
  )
}

export function stepHasVisibleTarget(step: TourStepDefinition): boolean {
  if (!step.requiresAny?.length) return true

  return step.requiresAny.some((selector) => Boolean(queryVisibleTourElement(selector)))
}

export function materializeTourSteps(definitions: TourStepDefinition[]): DriveStep[] {
  return definitions
    .filter(stepHasVisibleTarget)
    .map((step) => {
      const { requiresAny: _requiresAny, element, ...rest } = step

      if (typeof element === 'function') {
        const resolved = element()
        return resolved ? { ...rest, element: resolved } : { ...rest }
      }

      if (typeof element === 'string') {
        const resolved = queryVisibleTourElement(element)
        return resolved ? { ...rest, element: resolved } : { ...rest }
      }

      return { ...rest, element }
    })
}

export const DASHBOARD_TOUR_ROUTE = '/dashboard'

export function isDashboardPath(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith(DASHBOARD_TOUR_ROUTE))
}

export function waitForTourTargets(
  selectors: string[],
  { timeoutMs = 2400, intervalMs = 80 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  return new Promise((resolve) => {
    const started = Date.now()

    const tick = () => {
      const ready = selectors.some((selector) => Boolean(queryVisibleTourElement(selector)))
      if (ready || Date.now() - started >= timeoutMs) {
        resolve()
        return
      }
      window.setTimeout(tick, intervalMs)
    }

    tick()
  })
}
