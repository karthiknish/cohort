'use client'

import { useState } from 'react'
import { LoaderCircle, Sparkles, Video } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { VoiceInputButton } from '@/components/ui/voice-input'
import { useToast } from '@/components/ui/use-toast'
import { getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingRecord } from '../types'
import { formatLocalDateTime } from '../utils'

type InSiteMeetingCardProps = {
  meeting: MeetingRecord
  inSiteUrl: string
  onClose: () => void
  canRecord?: boolean
  onMeetingUpdated?: (meeting: MeetingRecord) => void
}

type TranscriptMode = 'save-transcript' | 'save-transcript-and-generate-notes' | 'save-notes'

type TranscriptActionResult = {
  meeting?: MeetingRecord
  transcriptSaved?: boolean
  notesGenerated?: boolean
  notesSaved?: boolean
  summary?: string | null
  notesReason?: 'ai_not_configured' | 'generation_failed' | null
  transcriptTruncatedForNotes?: boolean
}

function formatSyncLabel(timestamp: number | null, timezone: string, emptyLabel: string): string {
  if (!timestamp) {
    return emptyLabel
  }

  return `Updated ${formatLocalDateTime(timestamp, timezone)}`
}

export function InSiteMeetingCard(props: InSiteMeetingCardProps) {
  const { meeting, inSiteUrl, onClose, canRecord = true, onMeetingUpdated } = props
  const { toast } = useToast()
  const [transcriptDraft, setTranscriptDraft] = useState(meeting.transcriptText ?? '')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [notesDraft, setNotesDraft] = useState(meeting.notesSummary ?? '')
  const [markCompleted, setMarkCompleted] = useState(meeting.status === 'completed')
  const [savingTranscript, setSavingTranscript] = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [transcriptSavedAt, setTranscriptSavedAt] = useState<number | null>(meeting.transcriptUpdatedAtMs ?? null)
  const [transcriptSource, setTranscriptSource] = useState(meeting.transcriptSource ?? null)
  const [notesUpdatedAt, setNotesUpdatedAt] = useState<number | null>(meeting.notesUpdatedAtMs ?? null)
  const [notesModel, setNotesModel] = useState(meeting.notesModel ?? null)

  const canPersist = canRecord
  const normalizedTranscript = transcriptDraft.trim()
  const normalizedNotes = notesDraft.trim()

  const appendTranscriptSnippet = (snippet: string) => {
    const normalized = snippet.trim()
    if (!normalized) {
      return
    }

    setTranscriptDraft((current) => {
      const base = current.trim()
      if (!base) {
        return normalized
      }
      return `${base}\n${normalized}`
    })
  }

  const syncMeetingState = (updatedMeeting: MeetingRecord, options: { syncTranscript: boolean; syncNotes: boolean }) => {
    onMeetingUpdated?.(updatedMeeting)
    setMarkCompleted(updatedMeeting.status === 'completed')

    if (options.syncTranscript) {
      setTranscriptDraft(updatedMeeting.transcriptText ?? '')
    }

    if (options.syncNotes) {
      setNotesDraft(updatedMeeting.notesSummary ?? '')
    }

    setTranscriptSavedAt(updatedMeeting.transcriptUpdatedAtMs ?? null)
    setTranscriptSource(updatedMeeting.transcriptSource ?? null)
    setNotesUpdatedAt(updatedMeeting.notesUpdatedAtMs ?? null)
    setNotesModel(updatedMeeting.notesModel ?? null)
  }

  const submitTranscriptAction = async (mode: TranscriptMode, overrides?: { transcriptText?: string; notesSummary?: string }) => {
    const response = await fetch('/api/meetings/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        legacyId: meeting.legacyId,
        mode,
        markCompleted,
        source: 'in-site-voice',
        transcriptText: overrides?.transcriptText,
        notesSummary: overrides?.notesSummary,
      }),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      success?: boolean
      error?: string
      data?: TranscriptActionResult
    }

    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || 'Meeting update failed')
    }

    return (payload.data ?? {}) as TranscriptActionResult
  }

  const handleSaveTranscript = () => {
    if (normalizedTranscript.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Transcript too short',
        description: 'Record at least a few sentences before saving the transcript.',
      })
      return
    }

    setSavingTranscript(true)

    void submitTranscriptAction('save-transcript', { transcriptText: normalizedTranscript })
      .then((data) => {
        if (data.meeting) {
          syncMeetingState(data.meeting, { syncTranscript: true, syncNotes: false })
        }

        setInterimTranscript('')
        toast({
          title: 'Transcript saved',
          description: markCompleted
            ? 'Transcript stored and meeting marked complete.'
            : 'Transcript stored. Generate AI notes or save manual notes when ready.',
        })
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Unable to save transcript',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
      .finally(() => {
        setSavingTranscript(false)
      })
  }

  const handleGenerateNotes = () => {
    if (normalizedTranscript.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Transcript too short',
        description: 'Record at least a few sentences before generating AI notes.',
      })
      return
    }

    setGeneratingNotes(true)

    void submitTranscriptAction('save-transcript-and-generate-notes', {
      transcriptText: normalizedTranscript,
    })
      .then((data) => {
        if (data.meeting) {
          syncMeetingState(data.meeting, { syncTranscript: true, syncNotes: true })
        }

        setInterimTranscript('')

        const description = data.notesGenerated
          ? data.transcriptTruncatedForNotes
            ? 'Transcript saved. AI notes were generated from a shortened transcript excerpt to keep the summary focused.'
            : 'Transcript saved and AI notes are ready below.'
          : data.notesReason === 'ai_not_configured'
            ? 'Transcript saved. AI note generation is unavailable until Gemini credentials are configured.'
            : 'Transcript saved, but AI note generation did not finish. You can edit and save notes manually below.'

        toast({
          title: data.notesGenerated ? 'AI notes updated' : 'Transcript saved',
          description,
        })
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Unable to generate AI notes',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
      .finally(() => {
        setGeneratingNotes(false)
      })
  }

  const handleSaveNotes = () => {
    if (normalizedNotes.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Notes too short',
        description: 'Add a more complete summary before saving meeting notes.',
      })
      return
    }

    setSavingNotes(true)

    void submitTranscriptAction('save-notes', { notesSummary: normalizedNotes })
      .then((data) => {
        if (data.meeting) {
          syncMeetingState(data.meeting, { syncTranscript: false, syncNotes: true })
        }

        toast({
          title: 'Notes saved',
          description: data.meeting?.status === 'completed'
            ? 'Meeting notes saved and the meeting is now marked complete.'
            : 'Meeting notes saved for this meeting.',
        })
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Unable to save notes',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
      .finally(() => {
        setSavingNotes(false)
      })
  }

  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            In-Site Meeting Room
          </CardTitle>
          <CardDescription>
            {meeting.title} · {formatLocalDateTime(meeting.startTimeMs, meeting.timezone)}
          </CardDescription>
        </div>
        <Button type="button" variant="outline" className={getButtonClasses('outline')} onClick={onClose}>
          Close Room
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {meeting.providerId === 'google-workspace' && (
          <Alert>
            <AlertTitle>Internal room note</AlertTitle>
            <AlertDescription>
              This in-site room is separate from the Google Meet invite. External attendees should use the Google Meet link.
            </AlertDescription>
          </Alert>
        )}

        <div className="aspect-video w-full overflow-hidden rounded-lg border border-muted/70">
          <iframe
            src={inSiteUrl}
            title={`In-site meeting for ${meeting.title}`}
            className="h-full w-full"
            allow="camera; microphone; fullscreen; display-capture; clipboard-read; clipboard-write"
            allowFullScreen
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className={getButtonClasses('outline')}>
            <a href={inSiteUrl} target="_blank" rel="noreferrer">
              Open room in new tab
            </a>
          </Button>
          {meeting.meetLink && !/^https:\/\/meet\.jit\.si\//i.test(meeting.meetLink) && (
            <Button asChild className={getButtonClasses('primary')}>
              <a href={meeting.meetLink} target="_blank" rel="noreferrer">
                Open Google Meet
              </a>
            </Button>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-muted/70 bg-muted/20 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">AI Transcription Recorder</p>
              <p className="text-xs text-muted-foreground">
                Capture speech, save the raw transcript, then generate or edit meeting notes separately.
              </p>
            </div>
            <VoiceInputButton
              variant="inline"
              showWaveform
              disabled={!canPersist || savingTranscript || generatingNotes}
              onTranscript={appendTranscriptSnippet}
              onInterimTranscript={setInterimTranscript}
            />
          </div>

          {interimTranscript && (
            <p className="text-xs text-muted-foreground">
              Listening: {interimTranscript}
            </p>
          )}

          <Textarea
            rows={6}
            value={transcriptDraft}
            onChange={(event) => setTranscriptDraft(event.target.value)}
            disabled={!canPersist || savingTranscript || generatingNotes}
            placeholder="Transcript draft appears here. You can also paste notes from another recorder."
          />

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={transcriptSavedAt ? 'info' : 'outline'}>
              {formatSyncLabel(transcriptSavedAt, meeting.timezone, 'Transcript not saved yet')}
            </Badge>
            {transcriptSource ? <Badge variant="outline">Source: {transcriptSource}</Badge> : null}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              id={`meeting-complete-${meeting.legacyId}`}
              checked={markCompleted}
              onCheckedChange={setMarkCompleted}
              disabled={!canPersist}
            />
            <label htmlFor={`meeting-complete-${meeting.legacyId}`}>
              Mark this meeting as completed when I save transcript or notes.
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className={getButtonClasses('outline')}
              disabled={!canPersist || savingTranscript || generatingNotes || normalizedTranscript.length === 0}
              onClick={handleSaveTranscript}
            >
              {savingTranscript ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Transcript Only
            </Button>
            <Button
              type="button"
              className={getButtonClasses('primary')}
              disabled={!canPersist || savingTranscript || generatingNotes || normalizedTranscript.length === 0}
              onClick={handleGenerateNotes}
            >
              {generatingNotes ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Save Transcript + Generate AI Notes
            </Button>
            <Button
              type="button"
              variant="outline"
              className={getButtonClasses('outline')}
              disabled={!canPersist || savingTranscript || generatingNotes}
              onClick={() => {
                setTranscriptDraft('')
                setInterimTranscript('')
              }}
            >
              Clear Draft
            </Button>
          </div>

          {!canPersist && (
            <p className="text-xs text-muted-foreground">
              Recording controls are limited to admin and team users.
            </p>
          )}

          <div className="space-y-3 rounded-md bg-background/80 p-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meeting Notes</p>
                <p className="text-xs text-muted-foreground">
                  Keep AI-generated notes or replace them with a manual summary before sharing.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant={notesUpdatedAt ? 'success' : 'outline'}>
                  {formatSyncLabel(notesUpdatedAt, meeting.timezone, 'Notes not saved yet')}
                </Badge>
                {notesModel ? <Badge variant="outline">AI model: {notesModel}</Badge> : null}
              </div>
            </div>

            <Textarea
              rows={8}
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              disabled={!canPersist || savingNotes || generatingNotes}
              placeholder="Meeting notes appear here after AI generation, or you can write them manually."
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className={getButtonClasses('primary')}
                disabled={!canPersist || savingNotes || generatingNotes || normalizedNotes.length === 0}
                onClick={handleSaveNotes}
              >
                {savingNotes ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Notes
              </Button>
              <Button
                type="button"
                variant="outline"
                className={getButtonClasses('outline')}
                disabled={!canPersist || savingNotes || generatingNotes || (meeting.notesSummary ?? '') === notesDraft}
                onClick={() => setNotesDraft(meeting.notesSummary ?? '')}
              >
                Reset Notes
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
