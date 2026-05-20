'use client'

import { ClipboardList, Sparkles } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'

type ProposalWizardHeaderProps = {
  clientName?: string | null
}

export function ProposalWizardHeader({ clientName }: ProposalWizardHeaderProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/15 bg-accent/8 text-primary shadow-sm">
          <ClipboardList className="h-5 w-5" aria-hidden />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary/80" aria-hidden />
            Proposal generator
          </span>
          {clientName ? (
            <Badge variant="secondary" className="font-normal">
              {clientName}
            </Badge>
          ) : null}
        </div>
      </div>
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Build a tailored proposal in minutes
      </h1>
      <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        Six guided sections with autosave. When you finish, we generate a client-ready deck you can open, download, or
        refine.
      </p>
    </div>
  )
}
