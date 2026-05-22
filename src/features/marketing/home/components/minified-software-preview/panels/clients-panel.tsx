'use client'

import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

import { TONE_BADGE } from '../constants'
import { CLIENT_ACCOUNTS } from '../preview-data'
import { ClientHealthMeter } from '../ui/client-health-meter'

export function ClientsPanel() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
        <Search className="size-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/40">Search clients…</span>
        <span className="ml-auto rounded border border-border/40 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/50">
          12 accounts
        </span>
      </div>

      {CLIENT_ACCOUNTS.map((client) => (
        <div key={client.id} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-viewer-chrome',
                client.color,
              )}
            >
              {client.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold text-foreground">{client.name}</span>
                <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{client.revenue}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/50">
                  <ClientHealthMeter health={client.health} />
                </div>
                <span
                  className={cn(
                    'text-[9px] font-bold',
                    client.health >= 80 ? 'text-success' : client.health >= 60 ? 'text-accent' : 'text-warning',
                  )}
                >
                  {client.health}%
                </span>
                <span
                  className={cn(
                    'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold',
                    TONE_BADGE[client.tone],
                  )}
                >
                  {client.tag}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
