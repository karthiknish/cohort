import { Video } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingRecord } from '../types'
import { formatLocalDateTime } from '../utils'

type InSiteMeetingCardProps = {
  meeting: MeetingRecord
  inSiteUrl: string
  onClose: () => void
}

export function InSiteMeetingCard(props: InSiteMeetingCardProps) {
  const { meeting, inSiteUrl, onClose } = props

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
      </CardContent>
    </Card>
  )
}
