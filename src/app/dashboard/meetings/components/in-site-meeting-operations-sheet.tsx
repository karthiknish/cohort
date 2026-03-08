'use client'

import { Users } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import type { MeetingProcessingState } from '../types'
import { formatLocalDateTime } from '../utils'
import type { CaptureStatus, LiveKitJoinPayload } from './in-site-meeting-card.shared'

type MeetingOperationsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  joinConfig: LiveKitJoinPayload | null
  captureStatus: CaptureStatus
  meetingAttendeeEmails: string[]
  meetingRoomName: string
  meetingTimezone: string
  transcriptSource: string | null
  transcriptSavedAt: number | null
  transcriptProcessingState: MeetingProcessingState
  transcriptProcessingError: string | null
  notesUpdatedAt: number | null
  notesModel: string | null
  notesProcessingState: MeetingProcessingState
  notesProcessingError: string | null
  markCompleted: boolean
  autoSyncing: boolean
  finalizingSession: boolean
  interimTranscript: string
  summaryPreview: string | null
  notesReason: 'ai_not_configured' | 'generation_failed' | null
  transcriptTruncatedForNotes: boolean
  transcriptLength: number
  canGenerateNotes: boolean
  generatingNotes: boolean
  onGenerateNotes: () => void
}

function formatSyncLabel(timestamp: number | null, timezone: string, emptyLabel: string): string {
  if (!timestamp) {
    return emptyLabel
  }

  return `Updated ${formatLocalDateTime(timestamp, timezone)}`
}

export function InSiteMeetingOperationsSheet(props: MeetingOperationsSheetProps) {
  const {
    open,
    onOpenChange,
    joinConfig,
    captureStatus,
    meetingAttendeeEmails,
    meetingRoomName,
    meetingTimezone,
    transcriptSource,
    transcriptSavedAt,
    transcriptProcessingState,
    transcriptProcessingError,
    notesUpdatedAt,
    notesModel,
    notesProcessingState,
    notesProcessingError,
    markCompleted,
    autoSyncing,
    finalizingSession,
    interimTranscript,
    summaryPreview,
    notesReason,
    transcriptTruncatedForNotes,
    transcriptLength,
    canGenerateNotes,
    generatingNotes,
    onGenerateNotes,
  } = props

  const transcriptStatus = transcriptProcessingState === 'processing'
    ? 'Finalizing transcript now'
    : transcriptProcessingState === 'failed'
      ? 'Transcript finalization needs attention'
      : formatSyncLabel(transcriptSavedAt, meetingTimezone, 'Waiting for first capture sync')

  const summaryStatus = notesProcessingState === 'processing' || generatingNotes
    ? 'Generating summary now'
    : notesProcessingState === 'failed'
      ? 'AI notes generation needs attention'
      : notesReason === 'ai_not_configured'
        ? 'AI note generation is unavailable in this environment'
        : notesReason === 'generation_failed'
          ? 'Last summary generation attempt failed'
          : formatSyncLabel(notesUpdatedAt, meetingTimezone, 'Waiting for transcript before summary')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Room sidebar</SheetTitle>
          <SheetDescription>
            Capture state, attendees, automation, and AI notes for this room.
          </SheetDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">{meetingRoomName}</Badge>
            <Badge variant={joinConfig ? 'secondary' : 'outline'}>
              {joinConfig ? 'Room live' : 'Waiting to join'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Capture status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={joinConfig ? 'secondary' : 'outline'}>{joinConfig ? 'In room' : 'Ready to join'}</Badge>
              <Badge variant={captureStatus.listening ? 'secondary' : 'outline'}>
                {captureStatus.listening ? 'Listening' : 'Not listening'}
              </Badge>
              {transcriptSource ? <Badge variant="outline">{transcriptSource}</Badge> : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {captureStatus.supported
                ? 'Browser speech capture is available for automatic transcript collection.'
                : 'Browser speech capture is unavailable in this browser. Transcript sync will stay idle until capture is available.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">People invited</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              {meetingAttendeeEmails.length} attendee{meetingAttendeeEmails.length === 1 ? '' : 's'}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {meetingAttendeeEmails.length > 0 ? (
                meetingAttendeeEmails.slice(0, 8).map((email) => (
                  <Badge key={email} variant="outline" className="max-w-full break-all whitespace-normal text-left">
                    {email}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No attendees listed on this meeting yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Automation</p>
            <p className="mt-3 text-sm text-foreground">
              {finalizingSession || transcriptProcessingState === 'processing' || notesProcessingState === 'processing'
                ? 'The meeting has ended. Final transcript and AI notes are being wrapped up now.'
                : 'Capture and meeting summary stay in the background while the room is running.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={joinConfig ? 'secondary' : 'outline'}>
                {joinConfig ? 'Room live' : 'Waiting to join'}
              </Badge>
              {autoSyncing ? <Badge variant="outline">Syncing now</Badge> : null}
              {transcriptProcessingState === 'processing' ? <Badge variant="info">Transcript finalizing</Badge> : null}
              {notesProcessingState === 'processing' ? <Badge variant="info">AI notes generating</Badge> : null}
              {markCompleted ? <Badge variant="outline">Marked completed</Badge> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Speech sync</p>
              <p className="mt-2 text-sm text-foreground">{transcriptStatus}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{transcriptLength} chars</Badge>
                {transcriptSource ? <Badge variant="outline">{transcriptSource}</Badge> : null}
                {transcriptProcessingState === 'processing' ? <Badge variant="info">Finalizing</Badge> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Summary sync</p>
              <p className="mt-2 text-sm text-foreground">{summaryStatus}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {notesModel ? <Badge variant="outline">{notesModel}</Badge> : null}
                {transcriptTruncatedForNotes ? <Badge variant="outline">Transcript truncated</Badge> : null}
              </div>
            </div>
          </div>

          {captureStatus.error ? (
            <Alert>
              <AlertTitle>Capture warning</AlertTitle>
              <AlertDescription>{captureStatus.error}</AlertDescription>
            </Alert>
          ) : null}

          {transcriptProcessingError ? (
            <Alert className="border-destructive/40 bg-destructive/5">
              <AlertTitle>Transcript finalization failed</AlertTitle>
              <AlertDescription>{transcriptProcessingError}</AlertDescription>
            </Alert>
          ) : null}

          {notesReason === 'generation_failed' ? (
            <Alert className="border-destructive/40 bg-destructive/5">
              <AlertTitle>AI summary failed</AlertTitle>
              <AlertDescription>
                The last notes generation request failed. Try again after a little more transcript is captured.
              </AlertDescription>
            </Alert>
          ) : null}

          {notesProcessingError ? (
            <Alert className="border-destructive/40 bg-destructive/5">
              <AlertTitle>AI notes generation failed</AlertTitle>
              <AlertDescription>{notesProcessingError}</AlertDescription>
            </Alert>
          ) : null}

          {notesReason === 'ai_not_configured' ? (
            <Alert>
              <AlertTitle>AI summary unavailable</AlertTitle>
              <AlertDescription>
                Gemini is not configured for meeting notes in this environment.
              </AlertDescription>
            </Alert>
          ) : null}

          {summaryPreview ? (
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Latest AI summary</p>
                {canGenerateNotes ? (
                  <Button type="button" size="sm" variant="outline" onClick={onGenerateNotes} disabled={generatingNotes || notesProcessingState === 'processing'}>
                    {generatingNotes || notesProcessingState === 'processing' ? 'Refreshing...' : 'Refresh summary'}
                  </Button>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{summaryPreview}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">AI summary</p>
                  <p className="mt-2 text-sm text-foreground">
                    {notesProcessingState === 'processing'
                      ? 'The meeting ended and AI notes generation is already running.'
                      : transcriptLength >= 20
                        ? 'Generate a meeting summary now, or let it generate automatically when the room ends.'
                        : 'Speak for a bit first so the transcript has enough content for AI notes.'}
                  </p>
                </div>
                {canGenerateNotes ? (
                  <Button type="button" size="sm" variant="outline" onClick={onGenerateNotes} disabled={generatingNotes || notesProcessingState === 'processing'}>
                    {generatingNotes || notesProcessingState === 'processing' ? 'Generating...' : 'Generate notes'}
                  </Button>
                ) : null}
              </div>
            </div>
          )}

          {interimTranscript ? (
            <div className="rounded-2xl border border-border bg-muted/30 px-3 py-3 text-xs text-foreground">
              Live capture: {interimTranscript}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}