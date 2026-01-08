import { useCallback, useMemo } from 'react'
import { driver, Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/contexts/auth-context'

export function useOnboardingTour() {
    const router = useRouter()
    const { user } = useAuth()

    const tourSteps = useMemo(() => [
        {
            popover: {
                title: 'Welcome to Cohorts',
                description: 'Your premium agency workspace for tracking client growth and collaboration. Let\'s take a quick tour of the key features.',
            }
        },
        {
            element: '#tour-workspace-selector',
            popover: {
                title: 'Client Workspaces',
                description: 'Switch between client contexts here. All data on the dashboard will filter to the selected relationship.',
                position: 'bottom' as const,
            }
        },
        {
            element: '#tour-command-menu',
            popover: {
                title: 'Quick Navigation',
                description: 'Press <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">⌘K</kbd> to open the command menu for fast access to any page or action.',
                position: 'bottom' as const,
            }
        },
        {
            element: '#tour-stats-cards',
            popover: {
                title: 'Core KPI Summary',
                description: 'See your top-level metrics at a glance, including revenue, ad spend, and task progress.',
                position: 'bottom' as const,
            }
        },
        {
            element: '#tour-performance-chart',
            popover: {
                title: 'Performance analytics',
                description: 'Deep dive into campaign trends and AI-powered insights across all your connected platforms.',
                position: 'top' as const,
            }
        },
        {
            element: '#tour-sidebar',
            popover: {
                title: 'The Navigation',
                description: 'Access all your tools here: Clients, Ads integrations, Finance tracking, Team chat, and Projects.',
                position: 'right' as const,
            }
        },
        {
            element: '#tour-help-trigger',
            popover: {
                title: 'Need Help?',
                description: 'Access the help guide and keyboard shortcuts anytime from this menu, or press <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-medium">?</kbd>.',
                position: 'left' as const,
            }
        },
        {
            popover: {
                title: 'Full Feature Suite',
                description: 'Cohorts is more than just a dashboard. Explore these sections:<br/>• <b>Ads</b>: Manage integrations<br/>• <b>Finance</b>: Track spend & revenue<br/>• <b>Collaboration</b>: Team chat & threads<br/>• <b>Projects & Tasks</b>: Deliverable tracking',
            }
        },
        {
            popover: {
                title: 'You\'re All Set!',
                description: 'Explore the dashboard or head to the Ads section to connect your first integration. Happy growing!',
            }
        },
    ], [])

    const startTour = useCallback(() => {
        // Custom premium styling for driver.js
        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: tourSteps,
            popoverClass: 'cohorts-tour-popover',
            onHighlightStarted: (element) => {
                // Optional: Add custom animations or glow effects to highlighted element
            },
            onDestroyed: async () => {
                if (user?.id) {
                    try {
                        await setDoc(doc(db, 'userPreferences', user.id), {
                            onboardingTourCompleted: true,
                            onboardingTourCompletedAt: serverTimestamp(),
                        }, { merge: true })
                    } catch (error) {
                        console.error('Failed to save onboarding tour state:', error)
                    }
                }
            }
        })

        driverObj.drive()
    }, [tourSteps, user?.id])

    return { startTour }
}
