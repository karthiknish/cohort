'use client'

import { CalendarClock, CheckCircle2, Clock, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

import { ATTENDEE_COLORS, TONE_BADGE } from '../constants'
import { MEETING_ITEMS } from '../preview-data'

export function MeetingsPanel() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
        <CalendarClock className="size-3.5 text-primary/50" />
        <span className="text-[11px] font-semibold text-foreground/70">Today, 3 meetings scheduled</span>
        <span className="ml-auto rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[9px] font-semibold text-info">
          Wed
        </span>
      </div>

      {MEETING_ITEMS.map((meeting) => (
        <div key={meeting.id} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
          <div className="flex items-start gap-3">
            <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border/40 bg-background/60 py-1.5">
              <span className="text-[10px] font-bold leading-none text-foreground/80">{meeting.timeHour}</span>
              <span className="text-[8px] font-medium text-muted-foreground/60">{meeting.timeAmPm}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold text-foreground">{meeting.title}</span>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold',
                    TONE_BADGE[meeting.tone],
                  )}
                >
                  {meeting.type}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {meeting.attendees.slice(0, 3).map((att) => (
                    <div
                      key={att}
                      className={cn(
                        'flex size-4 items-center justify-center rounded-full border border-background text-[7px] font-bold text-viewer-chrome',
                        ATTENDEE_COLORS[att] ?? 'bg-muted-foreground',
                      )}
                    >
                      {att[0]}
                    </div>
                  ))}
                  {meeting.attendees.length > 3 ? (
                    <div className="flex size-4 items-center justify-center rounded-full border border-background bg-muted text-[7px] font-bold text-muted-foreground">
                      +{meeting.attendees.length - 3}
                    </div>
                  ) : null}
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 text-[9px] font-medium',
                    meeting.noteStatus === 'ready'
                      ? 'text-success'
                      : meeting.noteStatus === 'active'
                        ? 'text-accent'
                        : 'text-muted-foreground/50',
                  )}
                >
                  {meeting.noteStatus === 'ready' ? <CheckCircle2 className="size-2.5" /> : null}
                  {meeting.noteStatus === 'active' ? <Sparkles className="size-2.5" /> : null}
                  {meeting.noteStatus === 'upcoming' ? <Clock className="size-2.5" /> : null}
                  {meeting.note}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
