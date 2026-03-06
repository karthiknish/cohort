import { Clock3, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingRecord } from '../types'
import { formatLocalDateTime, statusVariant } from '../utils'

type UpcomingMeetingsCardProps = {
  meetings: MeetingRecord[]
  canSchedule: boolean
  cancellingMeetingId: string | null
  onOpenInSiteMeeting: (meeting: MeetingRecord) => void
  onRescheduleMeeting: (meeting: MeetingRecord) => void
  onCancelMeeting: (meeting: MeetingRecord) => void
  onMarkCompleted: (legacyId: string) => void
}

export function UpcomingMeetingsCard(props: UpcomingMeetingsCardProps) {
  const {
    meetings,
    canSchedule,
    cancellingMeetingId,
    onOpenInSiteMeeting,
    onRescheduleMeeting,
    onCancelMeeting,
    onMarkCompleted,
  } = props

  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Upcoming Meetings
        </CardTitle>
        <CardDescription>Meetings from the selected workspace/client context.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {meetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming meetings yet.</p>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.legacyId} className="rounded-lg border border-muted/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{meeting.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatLocalDateTime(meeting.startTimeMs, meeting.timezone)} -{' '}
                    {formatLocalDateTime(meeting.endTimeMs, meeting.timezone)}
                  </p>
                  {meeting.description && <p className="text-sm text-muted-foreground">{meeting.description}</p>}
                </div>
                <Badge variant={statusVariant(meeting.status)}>{meeting.status.replace('_', ' ')}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {meeting.meetLink && (
                  <Button asChild size="sm" className={getButtonClasses('primary')}>
                    <a href={meeting.meetLink} target="_blank" rel="noreferrer">
                      <Video className="mr-1 h-3.5 w-3.5" />
                      Open Meet Link
                    </a>
                  </Button>
                )}

                {meeting.status !== 'cancelled' && (
                  <Button size="sm" variant="outline" onClick={() => onOpenInSiteMeeting(meeting)}>
                    Join In-Site
                  </Button>
                )}

                {canSchedule && meeting.status !== 'completed' && meeting.status !== 'cancelled' && (
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
                      {cancellingMeetingId === meeting.legacyId ? 'Cancelling...' : 'Cancel'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onMarkCompleted(meeting.legacyId)}>
                      Mark Completed
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {meeting.transcriptUpdatedAtMs ? (
                  <Badge variant="info">Transcript saved {formatLocalDateTime(meeting.transcriptUpdatedAtMs, meeting.timezone)}</Badge>
                ) : (
                  <Badge variant="outline">Transcript not saved</Badge>
                )}
                {meeting.transcriptSource ? <Badge variant="outline">Source: {meeting.transcriptSource}</Badge> : null}
                {meeting.notesUpdatedAtMs ? (
                  <Badge variant="success">Notes saved {formatLocalDateTime(meeting.notesUpdatedAtMs, meeting.timezone)}</Badge>
                ) : (
                  <Badge variant="outline">Notes pending</Badge>
                )}
                {meeting.notesSummary ? (
                  <Badge variant="outline">{meeting.notesModel ? `AI notes: ${meeting.notesModel}` : 'Manual notes'}</Badge>
                ) : null}
              </div>

              {meeting.notesSummary && (
                <div className="mt-3 rounded-md bg-muted/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {meeting.notesModel ? 'AI Meeting Notes' : 'Meeting Notes'}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{meeting.notesSummary}</p>
                </div>
              )}

              {!meeting.notesSummary && meeting.transcriptText && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Transcript captured. You can generate AI notes from the in-site room or save manual notes there.
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
