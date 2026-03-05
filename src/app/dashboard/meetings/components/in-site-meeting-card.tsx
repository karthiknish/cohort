'use client'

import { useState } from 'react'
import { LoaderCircle, Video } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
}

export function InSiteMeetingCard(props: InSiteMeetingCardProps) {
  const { meeting, inSiteUrl, onClose, canRecord = true } = props
  const { toast } = useToast()
  const [transcriptDraft, setTranscriptDraft] = useState(meeting.transcriptText ?? '')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [notesSummary, setNotesSummary] = useState(meeting.notesSummary)
  const [savingTranscript, setSavingTranscript] = useState(false)

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

  const handleSaveTranscript = () => {
    const normalizedTranscript = transcriptDraft.trim()
    if (normalizedTranscript.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Transcript too short',
        description: 'Record at least a few sentences before generating AI notes.',
      })
      return
    }

    setSavingTranscript(true)

    void fetch('/api/meetings/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        legacyId: meeting.legacyId,
        transcriptText: normalizedTranscript,
        source: 'in-site-voice',
      }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
          data?: {
            summary?: string | null
            notesGenerated?: boolean
          }
        }

        if (!response.ok || payload.success === false) {
          toast({
            variant: 'destructive',
            title: 'Unable to save transcript',
            description: payload.error || 'Transcript save failed',
          })
          return
        }

        const summary = payload.data?.summary
        if (typeof summary === 'string' && summary.trim().length > 0) {
          setNotesSummary(summary)
        }

        setInterimTranscript('')
        toast({
          title: 'Transcript saved',
          description:
            payload.data?.notesGenerated
              ? 'AI notes are ready below.'
              : 'Transcript stored. AI notes can be generated when AI credentials are configured.',
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
                Capture speech, save transcript, and generate AI notes for this meeting.
              </p>
            </div>
            <VoiceInputButton
              variant="inline"
              showWaveform
              disabled={!canRecord || savingTranscript}
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
            disabled={!canRecord || savingTranscript}
            placeholder="Transcript draft appears here. You can also paste notes from another recorder."
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className={getButtonClasses('primary')}
              disabled={!canRecord || savingTranscript || transcriptDraft.trim().length === 0}
              onClick={handleSaveTranscript}
            >
              {savingTranscript ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Transcript + Generate AI Notes
            </Button>
            <Button
              type="button"
              variant="outline"
              className={getButtonClasses('outline')}
              disabled={!canRecord || savingTranscript}
              onClick={() => {
                setTranscriptDraft('')
                setInterimTranscript('')
              }}
            >
              Clear Draft
            </Button>
          </div>

          {!canRecord && (
            <p className="text-xs text-muted-foreground">
              Recording controls are limited to admin and team users.
            </p>
          )}

          {notesSummary && (
            <div className="rounded-md bg-background/80 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Meeting Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{notesSummary}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
