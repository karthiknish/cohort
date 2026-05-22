'use client'

import type { ReactNode } from 'react'

import { ProposalStepFeedback } from './proposal-step-feedback'

export function ProposalDraftContentShell({
  stepContent,
  validationMessages,
}: {
  stepContent: ReactNode
  validationMessages: string[]
}) {
  return (
    <div className="relative min-h-[280px] rounded-2xl border border-border/50 bg-background p-4 shadow-sm sm:p-6">
      <div className="space-y-5">
        <ProposalStepFeedback validationMessages={validationMessages} />
        {stepContent}
      </div>
    </div>
  )
}
