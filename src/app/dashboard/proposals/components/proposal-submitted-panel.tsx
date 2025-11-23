"use client"

import Link from "next/link"
import { Copy, Sparkles } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
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
            className="mt-4 border-primary/20 bg-background hover:bg-background/80"
            onClick={onResumeSubmission}
            disabled={!canResumeSubmission || isSubmitting}
          >
            Continue editing
          </Button>
        ) : null}
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base">Client snapshot</CardTitle>
              <CardDescription>Key context for the engagement.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCopySummary} title="Copy summary">
              <Copy className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-foreground">Company</p>
                <p className="text-muted-foreground">{summary.company.name || "—"}</p>
                <p className="text-xs text-muted-foreground">{summary.company.industry}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Budget</p>
                <p className="text-muted-foreground">{summary.marketing.budget || "—"}</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-foreground">Goals</p>
              <p className="text-muted-foreground">{summary.goals.objectives.join(", ") || "—"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Scope</p>
              <p className="text-muted-foreground">{summary.scope.services.join(", ") || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {gammaDeck ? (
          <Card className="h-full border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Presentation deck</CardTitle>
              <CardDescription>AI-generated slide deck.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                {deckDownloadUrl && activeProposalIdForDeck ? (
                  <Button variant="secondary" className="w-full justify-start" asChild>
                    <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      View Presentation
                    </Link>
                  </Button>
                ) : null}
                
                <div className="flex gap-2">
                  {gammaDeck.storageUrl || gammaDeck.pptxUrl ? (
                    <Button variant="outline" className="flex-1" asChild>
                      <a 
                        href={gammaDeck.storageUrl || gammaDeck.pptxUrl || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        Download PPT
                      </a>
                    </Button>
                  ) : null}
                  
                  {viewerHref ? (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={viewerHref}>
                        Open online
                      </Link>
                    </Button>
                  ) : null}
                </div>

                {gammaDeck.shareUrl && gammaDeck.shareUrl !== gammaDeck.webUrl ? (
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
                    <a href={gammaDeck.shareUrl} target="_blank" rel="noreferrer">
                      Open Gamma link
                    </a>
                  </Button>
                ) : null}
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant="outline" className="uppercase tracking-wide">
                  {gammaDeck.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col items-center justify-center border-dashed p-6 text-center text-muted-foreground">
            <p>No presentation generated yet.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
