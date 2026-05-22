'use client'

import Link from 'next/link'
import { CheckCircle2, ExternalLink, LoaderCircle, Sparkles } from 'lucide-react'

import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

type ProposalBuilderJourneyBarProps = {
  isSubmitting: boolean
  isRecheckingDeck: boolean
  submitted: boolean
  isPresentationReady: boolean
  activeProposalIdForDeck: string | null
  deckDownloadUrl: string | null
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
}

export function ProposalBuilderJourneyBar({
  isSubmitting,
  isRecheckingDeck,
  submitted,
  isPresentationReady,
  activeProposalIdForDeck,
  deckDownloadUrl,
  autosaveStatus,
}: ProposalBuilderJourneyBarProps) {
  const deckHref = activeProposalIdForDeck
    ? withPreviewModeSearchParamIfEnabled(
        `/dashboard/proposals/${activeProposalIdForDeck}/deck`,
        isPreviewModeEnabled(),
      )
    : null

  if (isSubmitting || isRecheckingDeck) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <div className="flex min-w-0 items-center gap-3">
          <LoaderCircle className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {isRecheckingDeck ? 'Checking deck status…' : 'Generating your proposal deck'}
            </p>
            <p className="text-xs text-muted-foreground">
              This usually takes a few minutes. You can keep this panel open—we&apos;ll update when it&apos;s ready.
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">Step 5 of 5</span>
      </div>
    )
  }

  if (submitted && isPresentationReady) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/5 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">Deck is ready</p>
            <p className="text-xs text-muted-foreground">Open the presentation or download a copy.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {deckHref ? (
            <Button size="sm" asChild>
              <Link href={deckHref}>
                <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
                View deck
              </Link>
            </Button>
          ) : null}
          {deckDownloadUrl ? (
            <Button size="sm" variant="outline" asChild>
              <a href={deckDownloadUrl} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border border-muted/50 bg-muted/20 px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <Sparkles className="size-5 shrink-0 text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Submission received. We&apos;re finishing your deck—check back here or in proposal history.
        </p>
      </div>
    )
  }

  const autosaveTone =
    autosaveStatus === 'error'
      ? 'text-destructive'
      : autosaveStatus === 'saving'
        ? 'text-primary'
        : 'text-muted-foreground'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-xs">
      <span className={cn('font-medium', autosaveTone)}>
        {autosaveStatus === 'saving'
          ? 'Saving…'
          : autosaveStatus === 'error'
            ? 'Autosave issue—retry with ⌘S'
            : autosaveStatus === 'saved'
              ? 'All changes saved'
              : 'Autosave on'}
      </span>
      <span className="text-muted-foreground">⌘S save · ⌘Z undo · Esc close</span>
    </div>
  )
}
