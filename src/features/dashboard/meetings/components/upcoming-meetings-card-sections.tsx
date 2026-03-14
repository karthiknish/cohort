import { Link2, LoaderCircle, Video } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingRecord } from '../types'
import { formatLocalDateTime, normalizeMeetingProcessingState, statusVariant } from '../utils'

export function UpcomingMeetingsEmptyState() {
  return <p className="text-sm text-muted-foreground">No upcoming meetings yet.</p>
}

export function UpcomingMeetingsLoadingState() {
  return <div className="space-y-3">{[0, 1, 2].map((slot) => <Skeleton key={slot} className="h-24 w-full rounded-lg" />)}</div>
}

export function UpcomingMeetingItemCard({
  meeting,
  canSchedule,
  cancellingMeetingId,
  onOpenInSiteMeeting,
  onRescheduleMeeting,
  onCancelMeeting,
  onMarkCompleted,
}: {
  meeting: MeetingRecord
  canSchedule: boolean
  cancellingMeetingId: string | null
  onOpenInSiteMeeting: (meeting: MeetingRecord) => void
  onRescheduleMeeting: (meeting: MeetingRecord) => void
  onCancelMeeting: (meeting: MeetingRecord) => void
  onMarkCompleted: (legacyId: string) => void
}) {
  const transcriptProcessingState = normalizeMeetingProcessingState(meeting.transcriptProcessingState)
  const notesProcessingState = normalizeMeetingProcessingState(meeting.notesProcessingState)
  const postCallProcessing = transcriptProcessingState === 'processing' || notesProcessingState === 'processing'

  return (
    <div className="rounded-lg border border-muted/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{meeting.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatLocalDateTime(meeting.startTimeMs, meeting.timezone)} - {formatLocalDateTime(meeting.endTimeMs, meeting.timezone)}
          </p>
          {meeting.description ? <p className="text-sm text-muted-foreground">{meeting.description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {postCallProcessing ? (
            <Badge variant="info">
              <LoaderCircle className="mr-1 h-3 w-3 animate-spin" />
              Post-call processing
            </Badge>
          ) : null}
          <Badge variant={statusVariant(meeting.status)}>{meeting.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {meeting.status !== 'cancelled' ? (
          <Button size="sm" className={getButtonClasses('primary')} onClick={() => onOpenInSiteMeeting(meeting)}>
            <Video className="mr-1 h-3.5 w-3.5" />
            Join Room
          </Button>
        ) : null}

        {meeting.meetLink ? (
          <Button asChild size="sm" variant="outline">
            <a href={meeting.meetLink} target="_blank" rel="noreferrer">
              <Link2 className="mr-1 h-3.5 w-3.5" />
              Open Share Link
            </a>
          </Button>
        ) : null}

        {canSchedule && meeting.status !== 'completed' && meeting.status !== 'cancelled' ? (
          <>
            <Button size="sm" variant="outline" onClick={() => onRescheduleMeeting(meeting)}>
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancelMeeting(meeting)}
              disabled={cancellingMeetingId === meeting.legacyId}
            >
              {cancellingMeetingId === meeting.legacyId ? 'Cancelling…' : 'Cancel'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onMarkCompleted(meeting.legacyId)}>
              Mark Completed
            </Button>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {transcriptProcessingState === 'processing' ? (
          <Badge variant="info">
            <LoaderCircle className="mr-1 h-3 w-3 animate-spin" />
            Finalizing transcript
          </Badge>
        ) : transcriptProcessingState === 'failed' ? (
          <Badge variant="destructive">Transcript finalization failed</Badge>
        ) : meeting.transcriptUpdatedAtMs ? (
          <Badge variant="info">Transcript saved {formatLocalDateTime(meeting.transcriptUpdatedAtMs, meeting.timezone)}</Badge>
        ) : (
          <Badge variant="outline">Transcript not saved</Badge>
        )}

        {meeting.transcriptSource ? <Badge variant="outline">Source: {meeting.transcriptSource}</Badge> : null}

        {notesProcessingState === 'processing' ? (
          <Badge variant="info">
            <LoaderCircle className="mr-1 h-3 w-3 animate-spin" />
            Generating AI notes
          </Badge>
        ) : notesProcessingState === 'failed' ? (
          <Badge variant="destructive">AI notes generation failed</Badge>
        ) : meeting.notesUpdatedAtMs ? (
          <Badge variant="success">Notes saved {formatLocalDateTime(meeting.notesUpdatedAtMs, meeting.timezone)}</Badge>
        ) : (
          <Badge variant="outline">Notes pending</Badge>
        )}

        {meeting.notesSummary ? <Badge variant="outline">{meeting.notesModel ? `AI notes: ${meeting.notesModel}` : 'Manual notes'}</Badge> : null}
      </div>

      {meeting.transcriptProcessingError ? <p className="mt-3 text-xs text-destructive">{meeting.transcriptProcessingError}</p> : null}
      {meeting.notesProcessingError ? <p className="mt-1 text-xs text-destructive">{meeting.notesProcessingError}</p> : null}

      {meeting.notesSummary ? (
        <div className="mt-3 rounded-md bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {meeting.notesModel ? 'AI Meeting Notes' : 'Meeting Notes'}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{meeting.notesSummary}</p>
        </div>
      ) : null}

      {!meeting.notesSummary && notesProcessingState === 'processing' ? (
        <p className="mt-3 text-xs text-muted-foreground">
          The meeting ended. Transcript finalization and AI notes generation started automatically.
        </p>
      ) : null}

      {!meeting.notesSummary && notesProcessingState === 'idle' && meeting.transcriptText ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Transcript captured. You can generate AI notes from the in-site room or save manual notes there.
        </p>
      ) : null}
    </div>
  )
}