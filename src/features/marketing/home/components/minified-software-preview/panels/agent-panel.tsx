'use client'

import { Bot } from 'lucide-react'

import { cn } from '@/lib/utils'

import { TONE_BADGE } from '../constants'
import { AGENT_FLOWS, AGENT_RECENT } from '../preview-data'

export function AgentTabPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
        <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
          Active flows
        </p>
        <div className="space-y-1.5">
          {AGENT_FLOWS.map((flow) => (
            <div
              key={flow.id}
              className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-2.5 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    flow.tone === 'success'
                      ? 'animate-pulse bg-success'
                      : flow.tone === 'accent'
                        ? 'bg-accent'
                        : 'bg-info',
                  )}
                />
                <span className="text-[11px] font-medium text-foreground/80">{flow.label}</span>
              </div>
              <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', TONE_BADGE[flow.tone])}>
                {flow.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
        <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
          Recent actions
        </p>
        <div className="space-y-1.5">
          {AGENT_RECENT.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 rounded-lg border border-border/30 bg-background/60 px-2.5 py-2"
            >
              <Bot className="mt-0.5 h-3 w-3 shrink-0 text-accent/70" />
              <span className="flex-1 text-[11px] font-medium text-foreground/80">{item.text}</span>
              <span className="shrink-0 text-[9px] text-muted-foreground/50">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
