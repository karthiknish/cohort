"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProposalFormData } from "@/lib/proposals"
import { ProposalGammaDeck } from "@/services/proposals"

interface ProposalSubmittedPanelProps {
  summary: ProposalFormData
  gammaDeck: ProposalGammaDeck | null
  deckDownloadUrl: string | null
  activeProposalIdForDeck: string | null
  canResumeSubmission: boolean
  onResumeSubmission: () => void
  isSubmitting: boolean
}

export function ProposalSubmittedPanel({
  summary,
  gammaDeck,
  deckDownloadUrl,
  activeProposalIdForDeck,
  canResumeSubmission,
  onResumeSubmission,
  isSubmitting,
}: ProposalSubmittedPanelProps) {
  const viewerHref = deckDownloadUrl ? `/dashboard/proposals/viewer?src=${encodeURIComponent(deckDownloadUrl)}` : null

  return (
    <div className="space-y-6">
      <Alert className="border-primary/40 bg-primary/10 text-primary">
        <Sparkles className="h-4 w-4" />
        <AlertTitle>Proposal ready</AlertTitle>
        <AlertDescription>
          Your proposal draft is ready for review. Share with your team or export it for the client.
        </AlertDescription>
        {canResumeSubmission ? (
          <Button
            variant="outline"
            className="mt-4"
            onClick={onResumeSubmission}
            disabled={!canResumeSubmission || isSubmitting}
          >
            Continue editing
          </Button>
        ) : null}
      </Alert>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Client snapshot</CardTitle>
            <CardDescription>Key context for the engagement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Company:</strong> {summary.company.name || "—"} ({summary.company.industry || "—"})
            </p>
            <p>
              <strong>Budget:</strong> {summary.marketing.budget || "—"}
            </p>
            <p>
              <strong>Goals:</strong> {summary.goals.objectives.join(", ") || "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {gammaDeck ? (
        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Presentation deck</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              {deckDownloadUrl && activeProposalIdForDeck ? (
                <Button variant="secondary" asChild>
                  <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`}>
                    View PPT
                  </Link>
                </Button>
              ) : null}
              {gammaDeck.storageUrl ? (
                <Button asChild>
                  <a href={gammaDeck.storageUrl} target="_blank" rel="noreferrer">
                    Download PPT
                  </a>
                </Button>
              ) : gammaDeck.pptxUrl ? (
                <Button asChild>
                  <a href={gammaDeck.pptxUrl} target="_blank" rel="noreferrer">
                    Download PPT
                  </a>
                </Button>
              ) : null}
              {viewerHref ? (
                <Button variant="outline" asChild>
                  <Link href={viewerHref}>
                    Open online
                  </Link>
                </Button>
              ) : null}
              {gammaDeck.shareUrl && gammaDeck.shareUrl !== gammaDeck.webUrl ? (
                <Button variant="ghost" asChild>
                  <a href={gammaDeck.shareUrl} target="_blank" rel="noreferrer">
                    Share link
                  </a>
                </Button>
              ) : null}
              <Badge variant="outline" className="uppercase tracking-wide">
                {gammaDeck.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
