'use client'

import { ClipboardList, Sparkles } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { FadeIn } from '@/shared/ui/animate-in'

type ProposalWizardHeaderProps = {
  clientName?: string | null
}

export function ProposalWizardHeader({ clientName }: ProposalWizardHeaderProps) {
  return (
    <FadeIn>
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className={cn(DASHBOARD_THEME.icons.container, 'h-11 w-11 shrink-0')}>
            <ClipboardList className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" aria-hidden />
              Proposal studio
            </span>
            {clientName ? (
              <Badge variant="secondary" className="max-w-[200px] truncate font-normal">
                {clientName}
              </Badge>
            ) : (
              <Badge variant="outline" className="font-normal text-muted-foreground">
                No client selected
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Build a tailored proposal in minutes
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Six guided sections with autosave. When you finish, we generate a client-ready deck you can preview,
            download, or refine.
          </p>
        </div>
      </div>
    </FadeIn>
  )
}
