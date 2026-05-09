"use client"

import { ClipboardList, Sparkles } from "lucide-react"

export function ProposalWizardHeader() {
  return (
    <div className="flex max-w-3xl flex-col gap-4 lg:flex-row lg:items-start">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8 text-primary shadow-sm">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary/80" aria-hidden />
            Proposal generator
          </div>
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Build a tailored proposal in minutes
        </h1>
        <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-base">
          Walk through six short sections: company, goals, scope, and value. Your answers autosave as you go, then we
          assemble a client-ready deck you can refine and send.
        </p>
      </div>
    </div>
  )
}
