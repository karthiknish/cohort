'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { CalendarDays, CheckCircle2, Plane, ShieldCheck } from 'lucide-react'

import {
  getPreviewTimeOffBalances,
  getPreviewTimeOffRequests,
} from '@/lib/preview-data'
import { workforceApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { WORKFORCE_ROUTE_MAP } from '@/lib/workforce-routes'
import { WorkforcePageShell } from '@/features/dashboard/workforce/workforce-page-shell'
import { EmptyState, ModulePageLoadingPlaceholder } from '@/features/dashboard/home/components/dashboard-page-header'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'

import type { TimeOffBalance } from '@/types/workforce'

import { ApprovalQueue } from './approval-queue'
import { TimeOffBalanceCard } from './time-off-balance-card'
import { TimeOffRequestDialog } from './time-off-request-dialog'

export default function TimeOffPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const route = WORKFORCE_ROUTE_MAP['time-off']
  const workspaceId = user?.agencyId ?? null

  const timeOff = useQuery(
    workforceApi.getTimeOffDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )
  const seedTimeOff = useMutation(workforceApi.seedTimeOffModule)
  const createTimeOffRequest = useMutation(workforceApi.createTimeOffRequest)
  const reviewTimeOffRequest = useMutation(workforceApi.reviewTimeOffRequest)

  const [isSeeding, setIsSeeding] = useState(false)
  const [reviewPendingId, setReviewPendingId] = useState<string | null>(null)

  const balances = isPreviewMode ? getPreviewTimeOffBalances() : (timeOff?.balances ?? [])
  const requests = isPreviewMode ? getPreviewTimeOffRequests() : (timeOff?.requests ?? [])
  const summary = isPreviewMode
    ? { balanceRows: '3', pendingApprovals: '1' }
    : timeOff?.summary

  const isLoading = !isPreviewMode && workspaceId !== null && timeOff === undefined
  const hasLiveData = Boolean(balances.length > 0 || requests.length > 0)
  const canReview = (user?.role === 'admin' || user?.role === 'team') && !isPreviewMode

  const handleSeed = useCallback(async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to seed time off data.', variant: 'destructive' })
      return
    }
    setIsSeeding(true)
    try {
      const result = await seedTimeOff({ workspaceId })
      toast({
        title: result.inserted > 0 ? 'Time off module seeded' : 'Time off already has data',
        description:
          result.inserted > 0 ? 'Sample balances and requests were written to Convex.' : 'This workspace already has time off records.',
      })
    } catch (error) {
      logError(error, 'time-off:seed')
      toast({ title: 'Unable to seed', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsSeeding(false)
    }
  }, [seedTimeOff, toast, workspaceId])

  const handleSubmitRequest = useCallback(
    async (args: { type: string; windowLabel: string }) => {
      if (!workspaceId) return
      await createTimeOffRequest({ workspaceId, type: args.type, windowLabel: args.windowLabel })
    },
    [createTimeOffRequest, workspaceId],
  )

  const runReview = useCallback(
    async (requestLegacyId: string, decision: 'approved' | 'declined') => {
      if (!workspaceId) return
      setReviewPendingId(requestLegacyId)
      try {
        await reviewTimeOffRequest({ workspaceId, requestLegacyId, decision })
        toast({ title: decision === 'approved' ? 'Request approved' : 'Request declined' })
      } catch (error) {
        logError(error, 'time-off:review')
        toast({ title: 'Unable to update request', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setReviewPendingId(null)
      }
    },
    [reviewTimeOffRequest, toast, workspaceId],
  )

  return (
    <WorkforcePageShell
      routeId={route.id}
      title={route.title}
      description={route.description}
      icon={route.icon}
      badgeLabel="Live"
      stats={[
        {
          label: 'Balance rows',
          value: summary?.balanceRows ?? '0',
          description: 'Leave buckets in this workspace',
          icon: CalendarDays,
        },
        {
          label: 'Pending approvals',
          value: summary?.pendingApprovals ?? '0',
          description: 'Waiting on a decision',
          icon: ShieldCheck,
          variant: 'warning',
        },
        {
          label: 'In queue',
          value: String(requests.length),
          description: 'Recent and active requests',
          icon: CheckCircle2,
        },
        {
          label: 'Request types',
          value: 'Ad hoc',
          description: 'Configure policies as you scale',
          icon: Plane,
        },
      ]}
      ctaHref="/dashboard/scheduling"
      ctaLabel="See coverage when people are away"
    >
      {!isPreviewMode && !workspaceId ? (
        <EmptyState
          icon={route.icon}
          title="Workspace sign-in required"
          description="Time off is stored per agency workspace. Sign in to load balances and requests."
        />
      ) : null}

      {isLoading ? (
        <ModulePageLoadingPlaceholder message="Loading time off data from your workspace…" />
      ) : null}

      {!isPreviewMode && workspaceId && !isLoading && !hasLiveData ? (
        <EmptyState
          icon={route.icon}
          title="No time off data yet"
          description="Seed sample leave balances and requests, or add your first request after a teammate configures policies."
          onAction={handleSeed}
          actionLabel={isSeeding ? 'Seeding…' : 'Seed time off module'}
          actionDisabled={isSeeding}
        />
      ) : null}

      {((isPreviewMode && hasLiveData) || (!isPreviewMode && workspaceId && hasLiveData && !isLoading)) && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {balances.map((balance: TimeOffBalance) => (
              <TimeOffBalanceCard key={balance.id} balance={balance} />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <ApprovalQueue
              requests={requests}
              canReview={canReview}
              pendingActionId={reviewPendingId}
              onApprove={(id) => void runReview(id, 'approved')}
              onDecline={(id) => void runReview(id, 'declined')}
            />
            <TimeOffRequestDialog
              workspaceId={workspaceId}
              isPreviewMode={isPreviewMode}
              onSubmit={handleSubmitRequest}
            />
          </div>
        </>
      )}
    </WorkforcePageShell>
  )
}
