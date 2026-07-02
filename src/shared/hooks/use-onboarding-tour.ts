'use client';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { driver, type DriveStep, type PopoverDOM } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useMutation } from 'convex/react';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { logError } from '@/lib/convex-errors';
import { onboardingApi } from '@/lib/convex-api';
import { DASHBOARD_TOUR_ROUTE, isDashboardPath, materializeTourSteps, resolveCommandMenuElement, resolveNavigationElement, TOUR_IDS, waitForTourTargets, type TourStepDefinition, } from '@/shared/lib/onboarding-tour';
import { useAuth } from '@/shared/contexts/auth-context';

export type StartTourOptions = {
    /** Navigate to the dashboard home before highlighting UI (default: true). */
    ensureDashboard?: boolean;
    /** Start from a specific step index instead of 0. */
    startStep?: number;
};

const TOUR_PROGRESS_KEY = 'cohorts_tour_step';
const TOUR_DISMISSED_KEY = 'cohorts_tour_dismissed';

function scrollTourTargetIntoView(element: Element | undefined) {
    if (!(element instanceof HTMLElement))
        return;
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

function saveTourStep(index: number) {
    try {
        window.localStorage.setItem(TOUR_PROGRESS_KEY, String(index));
    }
    catch {
        // Ignore localStorage failures.
    }
}

function clearTourStep() {
    try {
        window.localStorage.removeItem(TOUR_PROGRESS_KEY);
    }
    catch {
        // Ignore localStorage failures.
    }
}

export function getSavedTourStep(): number | null {
    try {
        const raw = window.localStorage.getItem(TOUR_PROGRESS_KEY);
        if (raw === null)
            return null;
        const idx = Number.parseInt(raw, 10);
        return Number.isNaN(idx) ? null : idx;
    }
    catch {
        return null;
    }
}

export function isTourDismissed(): boolean {
    try {
        return window.localStorage.getItem(TOUR_DISMISSED_KEY) === '1';
    }
    catch {
        return false;
    }
}

export function useOnboardingTour() {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const upsertOnboarding = useMutation(onboardingApi.upsert);
    const tourStepDefinitions: TourStepDefinition[] = [
        {
            popover: {
                title: 'Welcome to Cohorts',
                description: 'A quick walkthrough of the dashboard — workspace switching, navigation, metrics, and where to get help. Press <kbd>Esc</kbd> anytime to exit.',
                side: 'over',
            },
        },
        {
            element: `#${TOUR_IDS.workspace}`,
            requiresAny: [`#${TOUR_IDS.workspace}`],
            popover: {
                title: 'Client workspaces',
                description: 'Switch the active client here. Metrics, tasks, and proposals on the dashboard follow this selection.',
                side: 'bottom',
            },
        },
        {
            element: () => resolveCommandMenuElement(),
            requiresAny: [`#${TOUR_IDS.commandMenuDesktop}`, `#${TOUR_IDS.commandMenuMobile}`],
            popover: {
                title: 'Quick navigation',
                description: 'Open search from here or press ⌘K (Ctrl+K on Windows) to jump to pages, clients, and actions.',
                side: 'bottom',
            },
        },
        {
            element: `#${TOUR_IDS.stats}`,
            requiresAny: [`#${TOUR_IDS.stats}`],
            popover: {
                title: 'Today\'s workload',
                description: 'See open tasks, active projects, and live proposals for the workspace you have selected.',
                side: 'bottom',
            },
        },
        {
            element: `#${TOUR_IDS.performance}`,
            requiresAny: [`#${TOUR_IDS.performance}`],
            popover: {
                title: 'Spend & revenue',
                description: 'Track daily ad spend and revenue once platforms are connected. Trends update as data syncs.',
                side: 'top',
            },
        },
        {
            element: `#${TOUR_IDS.quickActions}`,
            requiresAny: [`#${TOUR_IDS.quickActions}`],
            popover: {
                title: 'Quick actions',
                description: 'Shortcuts to ads, analytics, collaboration, tasks, and proposals — the workflows you use most.',
                side: 'top',
            },
        },
        {
            element: () => resolveNavigationElement(),
            requiresAny: [`#${TOUR_IDS.sidebar}`, `#${TOUR_IDS.mobileNav}`],
            popover: {
                title: 'Main navigation',
                description: '<strong>Workspace:</strong> For You, Projects, Tasks, Collaboration, Meetings, Notifications. <strong>Agency tools:</strong> Analytics, Ads, Socials, Proposals.',
                side: 'right',
            },
        },
        {
            element: `#${TOUR_IDS.help}`,
            requiresAny: [`#${TOUR_IDS.help}`],
            popover: {
                title: 'Help & tour',
                description: 'Reopen this guided tour anytime from the rocket icon, or open the help panel for shortcuts and tips.',
                side: 'left',
            },
        },
        {
            popover: {
                title: 'You\'re all set',
                description: 'Connect ad platforms under Ads when you are ready, then assign tasks so your team can execute. Happy growing.',
                side: 'over',
            },
        },
    ];
    const persistTourCompleted = async () => {
        if (!user?.id)
            return;
        try {
            await upsertOnboarding({
                userId: user.id,
                onboardingTourCompleted: true,
                onboardingTourCompletedAtMs: Date.now(),
            });
        }
        catch (error: unknown) {
            logError(error, 'useOnboardingTour:persistTourCompleted');
            reportConvexFailure({
                error,
                context: 'use-onboarding-tour.ts:persistTourCompleted',
                title: 'Could not save tour progress',
                fallbackMessage: 'Could not save tour progress',
            });
        }
    };
    const startTour = async (options?: StartTourOptions) => {
        const ensureDashboard = options?.ensureDashboard ?? true;
        const resumeStep = options?.startStep ?? getSavedTourStep() ?? 0;
        if (ensureDashboard && !isDashboardPath(pathname)) {
            router.push(DASHBOARD_TOUR_ROUTE);
            await waitForTourTargets([
                `#${TOUR_IDS.workspace}`,
                `#${TOUR_IDS.stats}`,
                `#${TOUR_IDS.quickActions}`,
            ]);
        }
        else {
            await waitForTourTargets([`#${TOUR_IDS.workspace}`], { timeoutMs: 1200 });
        }
        const steps = materializeTourSteps(tourStepDefinitions);
        if (steps.length === 0) {
            return;
        }
        const driverObj = driver({
            showProgress: true,
            animate: true,
            smoothScroll: true,
            allowClose: true,
            allowKeyboardControl: true,
            overlayClickBehavior: 'close',
            overlayColor: 'hsl(var(--foreground, 0 0% 3.9%) / 0.65)',
            stagePadding: 8,
            stageRadius: 12,
            popoverClass: 'cohorts-tour-popover',
            progressText: '{{current}} of {{total}}',
            nextBtnText: 'Next',
            prevBtnText: 'Back',
            doneBtnText: 'Done',
            steps: steps as DriveStep[],
            onHighlightStarted: (element) => {
                scrollTourTargetIntoView(element);
            },
            onHighlighted: (_element, _step, opts) => {
                const currentIndex = opts.state.activeIndex ?? 0;
                saveTourStep(currentIndex);
            },
            onPopoverRender: (popover: PopoverDOM, opts) => {
                // Inject "Don't show again" link into the footer
                const existing = popover.footer.querySelector('.tour-dont-show-again');
                if (existing)
                    return;
                const isLastStep = (opts.state.activeIndex ?? 0) >= steps.length - 1;
                if (!isLastStep)
                    return;
                const dontShow = document.createElement('button');
                dontShow.className = 'tour-dont-show-again';
                dontShow.type = 'button';
                dontShow.textContent = "Don't show again";
                dontShow.setAttribute('aria-label', 'Dismiss tour permanently');
                dontShow.addEventListener('click', () => {
                    try {
                        window.localStorage.setItem(TOUR_DISMISSED_KEY, '1');
                    }
                    catch {
                        // Ignore localStorage failures.
                    }
                    clearTourStep();
                    opts.driver.destroy();
                });
                popover.footer.appendChild(dontShow);
            },
            onDestroyed: () => {
                void persistTourCompleted();
                clearTourStep();
            },
        });
        driverObj.drive(resumeStep > 0 && resumeStep < steps.length ? resumeStep : 0);
    };
    return { startTour };
}
