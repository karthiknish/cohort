'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'
import {
  CircleCheck,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Layout,
  LoaderCircle,
  Pencil,
  Presentation,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { motionEasing, motionLoopSeconds } from '@/lib/animation-system'
import {
  blobVariants,
  blobVariantsSlow,
  fadeInUpVariants,
  slideInLeftVariants,
  slideInRightVariants,
  subtlePulseVariants,
  transitions,
} from '@/lib/dashboard-animations'
import type { ProposalFormData } from '@/lib/proposals'
import { cn } from '@/lib/utils'
import type { ProposalPresentationDeck } from '@/types/proposals'

const deckTrackDurationSeconds = motionLoopSeconds.trackLong

export function ProposalSubmittedHero({
  activeProposalIdForDeck,
  canResumeSubmission,
  deckDownloadUrl,
  isSubmitting,
  onResumeSubmission,
}: {
  activeProposalIdForDeck: string | null
  canResumeSubmission: boolean
  deckDownloadUrl: string | null
  isSubmitting: boolean
  onResumeSubmission: () => void
}) {
  return (
    <m.div initial="hidden" animate="visible" variants={fadeInUpVariants} className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-background p-10 shadow-2xl shadow-primary/5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <m.div animate="animate" variants={blobVariants} className="absolute -right-[10%] -top-[20%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />
        <m.div animate="animate" variants={blobVariantsSlow} className="absolute -bottom-[20%] -left-[5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background)/0.75)_100%)]" />
      </div>

      <div className="relative flex flex-col items-center gap-10 md:flex-row">
        <div className="relative shrink-0">
          <m.div initial="initial" animate="animate" variants={subtlePulseVariants} className="absolute inset-0 rounded-3xl bg-primary" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/30">
            <CircleCheck className="h-12 w-12 stroke-[2.5px] text-primary-foreground" />
          </div>
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">Your Proposal is Ready!</h2>
          </div>
          <p className="max-w-xl break-words text-lg font-medium leading-relaxed text-muted-foreground">
            Success! We&apos;ve synthesized your inputs into a strategic brief and an AI-powered presentation deck, ready for your next big pitch.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4 md:justify-start">
            {deckDownloadUrl && activeProposalIdForDeck ? (
              <Button size="lg" className="h-14 rounded-2xl bg-primary px-8 text-base font-bold shadow-xl shadow-primary/25 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:scale-105 hover:bg-primary/90 active:scale-95" asChild>
                <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`}>
                  <Presentation className="mr-3 h-6 w-6" />
                  View Presentation
                </Link>
              </Button>
            ) : null}
            {canResumeSubmission ? (
              <Button size="lg" variant="outline" className="h-14 rounded-2xl border-muted/60 px-8 text-base font-bold backdrop-blur-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/10" onClick={onResumeSubmission} disabled={isSubmitting}>
                <Pencil className="mr-3 h-5 w-5" />
                Edit Responses
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </m.div>
  )
}

export function ProposalStrategyBriefCard({ onCopySummary, summary }: { onCopySummary: () => void; summary: ProposalFormData }) {
  return (
    <m.div initial="hidden" animate="visible" variants={slideInLeftVariants} transition={{ ...transitions.slow, delay: 0.2 }}>
      <Card className="flex h-full flex-col overflow-hidden border-muted/60 bg-background/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="border-b border-muted/40 bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Strategy Brief</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full transition-colors hover:bg-primary/10 hover:text-primary" onClick={onCopySummary} aria-label="Copy strategy brief">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-6 pt-6">
          <div className="grid gap-5">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Target Client</p>
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-muted p-2 text-foreground ring-1 ring-muted-foreground/10">
                  <Layout className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{summary.company.name || 'Unnamed Client'}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">{summary.company.industry || 'Industry focus'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Value Proposition</p>
              <div className="flex flex-wrap gap-1.5">
                {summary.goals.objectives.length ? summary.goals.objectives.map((objective) => (
                  <Badge key={objective} variant="secondary" className="border-primary/10 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {objective}
                  </Badge>
                )) : <span className="text-xs italic text-muted-foreground">—</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Project Scope</p>
              <div className="rounded-xl border border-muted/50 bg-muted/30 p-3">
                <p className="text-xs font-medium leading-relaxed text-muted-foreground">{summary.scope.services.join(', ') || 'No services selected'}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Proposed Timeline</p>
              <p className="flex items-center gap-2 text-xs font-bold text-foreground">
                <RefreshCw className="h-3 w-3 text-primary" />
                {summary.timelines.startTime || 'Not scheduled'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  )
}

function ProposalDeckReadyState({
  activeProposalIdForDeck,
  isRecheckingDeck,
  onCopyShareLink,
  onRecheckDeck,
  presentationDeck,
  viewerHref,
}: {
  activeProposalIdForDeck: string | null
  isRecheckingDeck: boolean
  onCopyShareLink: () => void
  onRecheckDeck?: () => Promise<void>
  presentationDeck: ProposalPresentationDeck
  viewerHref: string | null
}) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-muted transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:shadow-xl hover:shadow-primary/5 hover:ring-primary/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary),0.05)_0%,transparent_70%)]" />
          <div className="absolute inset-4 space-y-3">
            <div className="h-2 w-1/3 rounded-full bg-primary/20" />
            <div className="h-3 w-3/4 rounded-full bg-primary/10" />
            <div className="grid grid-cols-2 gap-2 pt-4">
              <div className="aspect-video rounded-lg bg-muted-foreground/10" />
              <div className="aspect-video rounded-lg bg-muted-foreground/10" />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 p-4 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
            <div className="scale-0 rounded-full bg-primary p-4 shadow-2xl shadow-primary/40 transition-transform duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:scale-100">
              <Presentation className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="mt-4 text-xs font-black uppercase tracking-widest text-foreground">Launch Interactive Viewer</p>
          </div>
          {activeProposalIdForDeck ? <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`} className="absolute inset-0 z-10" /> : null}
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Export & Share</p>
          <div className="space-y-3">
            {presentationDeck.storageUrl || presentationDeck.pptxUrl ? (
              <Button variant="outline" className="group h-14 w-full justify-start rounded-2xl border-muted/60 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:border-primary/30 hover:bg-primary/[0.03]" asChild>
                <a href={presentationDeck.storageUrl || presentationDeck.pptxUrl || '#'} target="_blank" rel="noreferrer">
                  <div className="mr-4 rounded-xl bg-muted p-2 transition-colors group-hover:bg-primary/10">
                    <Download className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold tracking-tight">PowerPoint (PPTX)</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Download for offline use</p>
                  </div>
                </a>
              </Button>
            ) : null}

            {viewerHref ? (
              <Button variant="outline" className="group h-14 w-full justify-start rounded-2xl border-muted/60 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:border-primary/30 hover:bg-primary/[0.03]" asChild>
                <Link href={viewerHref}>
                  <div className="mr-4 rounded-xl bg-muted p-2 transition-colors group-hover:bg-primary/10">
                    <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold tracking-tight">Microsoft Online</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Open in Cloud Editor</p>
                  </div>
                </Link>
              </Button>
            ) : null}

            <Button variant="ghost" className="h-10 w-full justify-center rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-primary/5 hover:text-primary" onClick={onCopyShareLink}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy Share Link
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-muted/40 pt-6">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          AUTHENTICATED & VERIFIED
        </div>
        {onRecheckDeck && (presentationDeck.status === 'pending' || presentationDeck.status === 'processing') ? (
          <Button variant="ghost" size="sm" onClick={onRecheckDeck} disabled={isRecheckingDeck} className="h-8 rounded-xl border border-primary/10 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
            {isRecheckingDeck ? <LoaderCircle className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
            Sync
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function ProposalDeckGeneratingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <m.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: motionLoopSeconds.pulse, repeat: Infinity, ease: motionEasing.inOut }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
        />
        <div className="relative rounded-[2rem] border border-muted bg-muted/40 p-6 ring-1 ring-muted-foreground/10">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary/40" />
        </div>
      </div>
      <h4 className="mb-2 text-xl font-extrabold tracking-tight">Architecting Your Deck</h4>
      <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">
        Our AI engine is currently structuring your presentation slides. It usually takes less than 60 seconds.
      </p>
      <m.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: deckTrackDurationSeconds, ease: 'linear' }} className="relative mt-8 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-primary/30">
        <m.div animate={{ x: ['-100%', '100%'] }} transition={transitions.shimmer} className="absolute inset-0 w-1/3 bg-primary" />
      </m.div>
    </div>
  )
}

export function ProposalAssetDeliveryCard({
  activeProposalIdForDeck,
  isRecheckingDeck,
  onCopyShareLink,
  onRecheckDeck,
  presentationDeck,
  viewerHref,
}: {
  activeProposalIdForDeck: string | null
  isRecheckingDeck: boolean
  onCopyShareLink: () => void
  onRecheckDeck?: () => Promise<void>
  presentationDeck: ProposalPresentationDeck | null
  viewerHref: string | null
}) {
  return (
    <m.div initial="hidden" animate="visible" variants={slideInRightVariants} transition={{ ...transitions.slow, delay: 0.3 }} className="lg:col-span-2">
      <Card className="flex h-full flex-col overflow-hidden border-muted/60 bg-background/50 shadow-sm backdrop-blur-sm">
        <CardHeader className="border-b border-muted/40 bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Presentation className="h-4 w-4" />
              </div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Asset Delivery</CardTitle>
            </div>
            {presentationDeck ? (
              <Badge
                variant="outline"
                className={cn(
                  'h-6 rounded-lg px-2.5 text-[10px] font-bold uppercase tracking-[0.1em]',
                  presentationDeck.status === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-primary/20 bg-primary/5 text-primary',
                )}
              >
                {presentationDeck.status}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-6">
          {presentationDeck ? (
            <ProposalDeckReadyState
              activeProposalIdForDeck={activeProposalIdForDeck}
              isRecheckingDeck={isRecheckingDeck}
              onCopyShareLink={onCopyShareLink}
              onRecheckDeck={onRecheckDeck}
              presentationDeck={presentationDeck}
              viewerHref={viewerHref}
            />
          ) : (
            <ProposalDeckGeneratingState />
          )}
        </CardContent>
      </Card>
    </m.div>
  )
}

export function ProposalSubmittedPanelLayout({
  activeProposalIdForDeck,
  canResumeSubmission,
  deckDownloadUrl,
  isRecheckingDeck,
  isSubmitting,
  onCopyShareLink,
  onCopySummary,
  onRecheckDeck,
  onResumeSubmission,
  presentationDeck,
  summary,
  viewerHref,
}: {
  activeProposalIdForDeck: string | null
  canResumeSubmission: boolean
  deckDownloadUrl: string | null
  isRecheckingDeck: boolean
  isSubmitting: boolean
  onCopyShareLink: () => void
  onCopySummary: () => void
  onRecheckDeck?: () => Promise<void>
  onResumeSubmission: () => void
  presentationDeck: ProposalPresentationDeck | null
  summary: ProposalFormData
  viewerHref: string | null
}) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-8">
        <ProposalSubmittedHero
          activeProposalIdForDeck={activeProposalIdForDeck}
          canResumeSubmission={canResumeSubmission}
          deckDownloadUrl={deckDownloadUrl}
          isSubmitting={isSubmitting}
          onResumeSubmission={onResumeSubmission}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <ProposalStrategyBriefCard onCopySummary={onCopySummary} summary={summary} />
          <ProposalAssetDeliveryCard
            activeProposalIdForDeck={activeProposalIdForDeck}
            isRecheckingDeck={isRecheckingDeck}
            onCopyShareLink={onCopyShareLink}
            onRecheckDeck={onRecheckDeck}
            presentationDeck={presentationDeck}
            viewerHref={viewerHref}
          />
        </div>
      </div>
    </LazyMotion>
  )
}