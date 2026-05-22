'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useMutation } from 'convex/react'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import { onboardingApi } from '@/lib/convex-api'
import {
  DASHBOARD_TOUR_ROUTE,
  isDashboardPath,
  materializeTourSteps,
  resolveCommandMenuElement,
  resolveNavigationElement,
  TOUR_IDS,
  waitForTourTargets,
  type TourStepDefinition,
} from '@/shared/lib/onboarding-tour'
import { useAuth } from '@/shared/contexts/auth-context'

export type StartTourOptions = {
  /** Navigate to the dashboard home before highlighting UI (default: true). */
  ensureDashboard?: boolean
}

function scrollTourTargetIntoView(element: Element | undefined) {
  if (!(element instanceof HTMLElement)) return
  element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
}

export function useOnboardingTour() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const upsertOnboarding = useMutation(onboardingApi.upsert)

  const tourStepDefinitions = useMemo((): TourStepDefinition[] => {
    return [
      {
        popover: {
          title: 'Welcome to Cohorts',
          description:
            'A quick walkthrough of the dashboard — workspace switching, navigation, metrics, and where to get help.',
          side: 'over',
        },
      },
      {
        element: `#${TOUR_IDS.workspace}`,
        requiresAny: [`#${TOUR_IDS.workspace}`],
        popover: {
          title: 'Client workspaces',
          description:
            'Switch the active client here. Metrics, tasks, and proposals on the dashboard follow this selection.',
          side: 'bottom',
        },
      },
      {
        element: () => resolveCommandMenuElement(),
        requiresAny: [`#${TOUR_IDS.commandMenuDesktop}`, `#${TOUR_IDS.commandMenuMobile}`],
        popover: {
          title: 'Quick navigation',
          description:
            'Open search from here or press ⌘K (Ctrl+K on Windows) to jump to pages, clients, and actions.',
          side: 'bottom',
        },
      },
      {
        element: `#${TOUR_IDS.stats}`,
        requiresAny: [`#${TOUR_IDS.stats}`],
        popover: {
          title: 'Today\'s workload',
          description:
            'See open tasks, active projects, and live proposals for the workspace you have selected.',
          side: 'bottom',
        },
      },
      {
        element: `#${TOUR_IDS.performance}`,
        requiresAny: [`#${TOUR_IDS.performance}`],
        popover: {
          title: 'Spend & revenue',
          description:
            'Track daily ad spend and revenue once platforms are connected. Trends update as data syncs.',
          side: 'top',
        },
      },
      {
        element: `#${TOUR_IDS.quickActions}`,
        requiresAny: [`#${TOUR_IDS.quickActions}`],
        popover: {
          title: 'Quick actions',
          description:
            'Shortcuts to ads, analytics, collaboration, tasks, and proposals — the workflows you use most.',
          side: 'top',
        },
      },
      {
        element: () => resolveNavigationElement(),
        requiresAny: [`#${TOUR_IDS.sidebar}`, `#${TOUR_IDS.mobileNav}`],
        popover: {
          title: 'Main navigation',
          description:
            'Move between Clients, Ads, Analytics, Meetings, Tasks, Proposals, Collaboration, and Projects.',
          side: 'right',
        },
      },
      {
        element: `#${TOUR_IDS.help}`,
        requiresAny: [`#${TOUR_IDS.help}`],
        popover: {
          title: 'Help & tour',
          description:
            'Reopen this guided tour anytime from the rocket icon, or open the help panel for shortcuts and tips.',
          side: 'left',
        },
      },
      {
        popover: {
          title: 'You\'re all set',
          description:
            'Connect ad platforms under Ads when you are ready, then assign tasks so your team can execute. Happy growing.',
          side: 'over',
        },
      },
    ]
  }, [])

  const persistTourCompleted = useCallback(async () => {
    if (!user?.id) return

    try {
      await upsertOnboarding({
        userId: user.id,
        onboardingTourCompleted: true,
        onboardingTourCompletedAtMs: Date.now(),
      })
    } catch (error: unknown) {
      console.error('Failed to save onboarding tour state:', error)
      reportConvexFailure({
        error,
        context: 'use-onboarding-tour.ts:persistTourCompleted',
        title: 'Could not save tour progress',
        fallbackMessage: 'Could not save tour progress',
      })
    }
  }, [upsertOnboarding, user?.id])

  const startTour = useCallback(
    async (options?: StartTourOptions) => {
      const ensureDashboard = options?.ensureDashboard ?? true

      if (ensureDashboard && !isDashboardPath(pathname)) {
        router.push(DASHBOARD_TOUR_ROUTE)
        await waitForTourTargets([
          `#${TOUR_IDS.workspace}`,
          `#${TOUR_IDS.stats}`,
          `#${TOUR_IDS.quickActions}`,
        ])
      } else {
        await waitForTourTargets([`#${TOUR_IDS.workspace}`], { timeoutMs: 1200 })
      }

      const steps = materializeTourSteps(tourStepDefinitions)
      if (steps.length === 0) {
        return
      }

      const driverObj = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayClickBehavior: 'close',
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: 'cohorts-tour-popover',
        progressText: '{{current}} of {{total}}',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Done',
        steps: steps as DriveStep[],
        onHighlightStarted: (element) => {
          scrollTourTargetIntoView(element)
        },
        onDestroyed: () => {
          void persistTourCompleted()
        },
      })

      driverObj.drive()
    },
    [pathname, persistTourCompleted, router, tourStepDefinitions],
  )

  return { startTour }
}
