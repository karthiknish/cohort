'use client'

import { useToast } from '@/components/ui/use-toast'
import type { ProposalFormData } from '@/lib/proposals'
import type { ProposalPresentationDeck } from '@/types/proposals'
import {
  ProposalSubmittedPanelLayout,
} from './proposal-submitted-panel-sections'

interface ProposalSubmittedPanelProps {
  summary: ProposalFormData
  presentationDeck: ProposalPresentationDeck | null
  deckDownloadUrl: string | null
  activeProposalIdForDeck: string | null
  canResumeSubmission: boolean
  onResumeSubmission: () => void
  onRecheckDeck?: () => Promise<void>
  isRecheckingDeck?: boolean
  isSubmitting: boolean
}

export function ProposalSubmittedPanel({
  summary,
  presentationDeck,
  deckDownloadUrl,
  activeProposalIdForDeck,
  canResumeSubmission,
  onResumeSubmission,
  onRecheckDeck,
  isRecheckingDeck = false,
  isSubmitting,
}: ProposalSubmittedPanelProps) {
  const { toast } = useToast()
  const viewerHref = deckDownloadUrl ? `/dashboard/proposals/viewer?src=${encodeURIComponent(deckDownloadUrl)}` : null

  const handleCopySummary = () => {
    const text = `
Company: ${summary.company.name}
Industry: ${summary.company.industry}
Website: ${summary.company.website}

Marketing Budget: ${summary.marketing.budget}
Platforms: ${summary.marketing.platforms.join(', ')}

Goals: ${summary.goals.objectives.join(', ')}
Challenges: ${summary.goals.challenges.join(', ')}

Scope: ${summary.scope.services.join(', ')}
Timeline: ${summary.timelines.startTime}
    `.trim()

    navigator.clipboard.writeText(text)
    toast({ title: "Summary copied to clipboard" })
  }

  const handleCopyShareLink = () => {
    if (activeProposalIdForDeck) {
      const shareLink = `${window.location.origin}/dashboard/proposals/${activeProposalIdForDeck}/deck`
      navigator.clipboard.writeText(shareLink)
      toast({ title: 'Share link copied!' })
    }
  }

  return (
    <ProposalSubmittedPanelLayout
      activeProposalIdForDeck={activeProposalIdForDeck}
      canResumeSubmission={canResumeSubmission}
      deckDownloadUrl={deckDownloadUrl}
      isRecheckingDeck={isRecheckingDeck}
      isSubmitting={isSubmitting}
      onCopyShareLink={handleCopyShareLink}
      onCopySummary={handleCopySummary}
      onRecheckDeck={onRecheckDeck}
      onResumeSubmission={onResumeSubmission}
      presentationDeck={presentationDeck}
      summary={summary}
      viewerHref={viewerHref}
    />
  )
}
