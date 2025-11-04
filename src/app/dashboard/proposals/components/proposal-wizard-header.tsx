"use client"

import { ClipboardList } from 'lucide-react'

export function ProposalWizardHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          Proposal Generator
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Build a tailored proposal in minutes</h1>
        <p className="text-muted-foreground">
          Answer a few questions and we&apos;ll assemble a polished, client-ready proposal packed with data and next steps.
        </p>
      </div>
    </div>
  )
}
