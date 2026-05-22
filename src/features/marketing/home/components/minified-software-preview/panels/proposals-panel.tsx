'use client'

import { FileText, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

import { BOUNCE_DOT_STYLES, TONE_BADGE } from '../constants'
import { PROPOSALS, PROPOSAL_STAGES } from '../preview-data'
import { BouncingStatusDot } from '../ui/bouncing-status-dot'

export function ProposalsPanel() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {PROPOSAL_STAGES.map((stage) => (
          <div key={stage.id} className={cn('rounded-xl border px-2.5 py-2 text-center', TONE_BADGE[stage.tone])}>
            <p className="text-[10px] font-semibold tracking-wide uppercase">{stage.label}</p>
            <p className="mt-0.5 text-xl font-bold">{stage.count}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {PROPOSALS.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-3.5 shrink-0 text-primary/40" />
              <span className="truncate text-[11px] font-medium text-foreground/80">{p.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-semibold text-foreground/60">{p.value}</span>
              <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', TONE_BADGE[p.tone])}>
                {p.stage}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2.5">
        <Sparkles className="size-3.5 shrink-0 text-accent" />
        <span className="flex-1 text-[11px] font-medium text-foreground/70">
          AI generating: NovaTech Digital proposal…
        </span>
        <div className="flex items-center gap-[3px]">
          {BOUNCE_DOT_STYLES.map((dot) => (
            <BouncingStatusDot key={dot.id} style={dot.style} />
          ))}
        </div>
      </div>
    </div>
  )
}
