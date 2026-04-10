import { renderToStaticMarkup } from 'react-dom/server'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ProjectsSchedulingPanel } from './projects-scheduling-panel'

const replace = vi.fn()
const getSearchParam = vi.fn<(key: string) => string | null>()
const useWorkforceOverview = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/projects',
  useRouter: () => ({ replace }),
  useSearchParams: () => ({
    get: getSearchParam,
    toString: () => 'operations=scheduling',
  }),
}))

vi.mock('@/features/dashboard/workforce/use-workforce-overview', () => ({
  useWorkforceOverview: () => useWorkforceOverview(),
}))

describe('projects scheduling panel', () => {
  beforeEach(() => {
    replace.mockReset()
    getSearchParam.mockReset()
    useWorkforceOverview.mockReset()

    getSearchParam.mockImplementation((key) => (key === 'operations' ? 'scheduling' : null))
    useWorkforceOverview.mockReturnValue({
      isLoading: false,
      isPreviewMode: false,
      workspaceId: 'workspace_123',
      snapshot: {
        schedulingSummary: {
          shiftsThisWeek: '4',
          openCoverageGaps: '1',
          swapRequests: '2',
          averageBlockHours: '4.5',
        },
        schedulingAlerts: [
          {
            id: 'alert_1',
            title: 'Coverage alert',
            message: 'One shift still needs coverage.',
            severity: 'warning',
          },
        ],
        schedulingShifts: [
          {
            id: 'shift_1',
            title: 'Client escalation desk',
            assignee: 'Open shift',
            team: 'Client success',
            dayLabel: 'Tue',
            timeLabel: '14:00 - 18:00',
            coverageLabel: 'Needs backup',
            status: 'open',
          },
        ],
        schedulingSwaps: [
          {
            id: 'swap_1',
            shiftTitle: 'Creative QA handoff',
            requestedBy: 'James Liu',
            requestedTo: 'Dan Wright',
            windowLabel: 'Thu · 16:00 - 20:00',
            status: 'pending',
          },
        ],
        hasAnyData: true,
      },
      isSeeding: false,
      isCreatingShift: false,
      seedAllModules: vi.fn(),
      addCoverageShift: vi.fn(),
    })
  })

  it('renders the embedded scheduling content when the operations query is scheduling', () => {
    const markup = renderToStaticMarkup(<ProjectsSchedulingPanel />)

    expect(markup).toContain('Scheduling and coverage')
    expect(markup).toContain('Review staffing gaps and swaps without leaving the projects workspace.')
    expect(markup).toContain('Client escalation desk')
    expect(markup).toContain('Creative QA handoff')
    expect(markup).toContain('Hide scheduling')
  })

  it('renders nothing when scheduling is not the active operations view', () => {
    getSearchParam.mockImplementation(() => null)

    const markup = renderToStaticMarkup(<ProjectsSchedulingPanel />)

    expect(markup).toBe('')
  })
})
