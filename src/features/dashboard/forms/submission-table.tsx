import { useCallback, useMemo, useRef } from 'react'
import { usePrevious } from '@/shared/hooks/use-previous'

import type { ChecklistSubmission } from '@/types/workforce'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { LiveRegion } from '@/shared/ui/live-region'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { LoaderCircle } from 'lucide-react'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

type SubmissionTableProps = {
  submissions: ChecklistSubmission[]
  canReview?: boolean
  onMarkReady?: (id: string) => void
  onNeedsFollowUp?: (id: string) => void
  pendingId?: string | null
}

export function SubmissionTable({
  submissions,
  canReview = false,
  onMarkReady,
  onNeedsFollowUp,
  pendingId = null,
}: SubmissionTableProps) {
  const colSpan = canReview ? 5 : 4
  const previousPendingId = usePrevious(pendingId)
  const pendingActionRef = useRef<{
    id: string
    action: 'ready' | 'follow-up'
    title: string
  } | null>(null)
  const announcedCompletionKeyRef = useRef<string | null>(null)

  const pendingAction = pendingActionRef.current
  const announcement = useMemo(() => {
    if (!pendingAction || previousPendingId !== pendingAction.id || pendingId !== null) {
      return ''
    }

    return pendingAction.action === 'ready'
      ? `${pendingAction.title} marked ready.`
      : `${pendingAction.title} moved to follow up.`
  }, [pendingAction, pendingId, previousPendingId])

  const completionKey =
    pendingAction && previousPendingId === pendingAction.id && pendingId === null
      ? `${pendingAction.id}:${pendingAction.action}`
      : null

  let liveAnnouncement = ''
  if (completionKey && announcedCompletionKeyRef.current !== completionKey) {
    announcedCompletionKeyRef.current = completionKey
    liveAnnouncement = announcement
    pendingActionRef.current = null
  }

  const handleNeedsFollowUp = useCallback(
    (submission: ChecklistSubmission) => {
      announcedCompletionKeyRef.current = null
      pendingActionRef.current = {
        id: submission.id,
        action: 'follow-up',
        title: submission.templateTitle,
      }
      onNeedsFollowUp?.(submission.id)
    },
    [onNeedsFollowUp]
  )

  const handleMarkReady = useCallback(
    (submission: ChecklistSubmission) => {
      announcedCompletionKeyRef.current = null
      pendingActionRef.current = {
        id: submission.id,
        action: 'ready',
        title: submission.templateTitle,
      }
      onMarkReady?.(submission.id)
    },
    [onMarkReady]
  )

  return (
    <Card>
      <LiveRegion message={liveAnnouncement} />
      <CardHeader>
        <CardTitle className="text-lg">Recent submissions</CardTitle>
        <p className="text-sm text-muted-foreground">Quality and status for each run; reviewers can nudge the queue here.</p>
      </CardHeader>
      <CardContent className="p-0" aria-busy={pendingId !== null}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Submitted by</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
              {canReview ? <TableHead className="w-[200px]">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
                  No submissions yet. Complete a checklist or seed the forms module to populate this table.
                </TableCell>
              </TableRow>
            ) : null}
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{submission.templateTitle}</p>
                    <p className="text-xs text-muted-foreground">{submission.scoreLabel}</p>
                  </div>
                </TableCell>
                <TableCell>{submission.submittedBy}</TableCell>
                <TableCell>{submission.submittedAt}</TableCell>
                <TableCell>
                  <WorkforceStatusBadge
                    tone={submission.status === 'ready' ? 'success' : submission.status === 'in-review' ? 'warning' : 'critical'}
                  >
                    {submission.status.replace('-', ' ')}
                  </WorkforceStatusBadge>
                </TableCell>
                {canReview && onMarkReady && onNeedsFollowUp ? (
                  <SubmissionReviewActions
                    submission={submission}
                    pendingId={pendingId}
                    onNeedsFollowUp={handleNeedsFollowUp}
                    onMarkReady={handleMarkReady}
                  />
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function SubmissionReviewActions({
  submission,
  pendingId,
  onNeedsFollowUp,
  onMarkReady,
}: {
  submission: ChecklistSubmission
  pendingId: string | null
  onNeedsFollowUp: (submission: ChecklistSubmission) => void
  onMarkReady: (submission: ChecklistSubmission) => void
}) {
  const handleNeedsFollowUpClick = useCallback(() => {
    onNeedsFollowUp(submission)
  }, [onNeedsFollowUp, submission])

  const handleMarkReadyClick = useCallback(() => {
    onMarkReady(submission)
  }, [onMarkReady, submission])

  const isPending = pendingId === submission.id

  return (
    <TableCell>
      <div className="flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={isPending}
          onClick={handleNeedsFollowUpClick}
        >
          {isPending ? <LoaderCircle className="size-3 animate-spin" /> : 'Follow up'}
        </Button>
        <Button type="button" size="sm" className="h-7 text-xs" disabled={isPending} onClick={handleMarkReadyClick}>
          {isPending ? <LoaderCircle className="size-3 animate-spin" /> : 'Mark ready'}
        </Button>
      </div>
    </TableCell>
  )
}
