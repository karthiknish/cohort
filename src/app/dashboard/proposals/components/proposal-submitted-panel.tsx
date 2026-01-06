"use client"

import Link from "next/link"
import { Copy, Sparkles, RefreshCw, LoaderCircle, CircleCheck, FileText, Layout, Download, ExternalLink, Presentation } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ProposalFormData } from "@/lib/proposals"
import { ProposalPresentationDeck } from "@/services/proposals"
import { cn } from "@/lib/utils"

import { motion, AnimatePresence } from "framer-motion"

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

  return (
    <div className="space-y-8">
      {/* Premium Hero Section with Mesh Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-background p-10 shadow-2xl shadow-primary/5"
      >
        {/* Animated Mesh Gradient Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[5%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" 
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background)/0.75)_100%)]" />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="relative shrink-0">
            {/* Pulsing Ring Background */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-primary rounded-3xl"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary shadow-2xl shadow-primary/30">
              <CircleCheck className="h-12 w-12 text-primary-foreground stroke-[2.5px]" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
                Your Proposal is Ready!
              </h2>
            </div>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl break-words">
              Success! We&apos;ve synthesized your inputs into a strategic brief and an AI-powered presentation deck, ready for your next big pitch.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              {deckDownloadUrl && activeProposalIdForDeck && (
                <Button size="lg" className="h-14 rounded-2xl shadow-xl shadow-primary/25 px-8 text-base font-bold bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95" asChild>
                  <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`}>
                    <Presentation className="mr-3 h-6 w-6" />
                    View Presentation
                  </Link>
                </Button>
              )}
              {canResumeSubmission && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-2xl border-muted/60 px-8 text-base font-bold backdrop-blur-sm transition-all hover:bg-muted/10"
                  onClick={onResumeSubmission}
                  disabled={isSubmitting}
                >
                  <RefreshCw className="mr-3 h-5 w-5" />
                  Apply Edits
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full border-muted/60 shadow-sm overflow-hidden flex flex-col bg-background/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b border-muted/40 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Strategy Brief</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={handleCopySummary}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
              <div className="grid gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Target Client</label>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-muted text-foreground ring-1 ring-muted-foreground/10">
                      <Layout className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{summary.company.name || "Unnamed Client"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{summary.company.industry || "Industry focus"}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Value Proposition</label>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.goals.objectives.length ? summary.goals.objectives.map(objective => (
                      <Badge key={objective} variant="secondary" className="text-[10px] font-semibold bg-primary/5 text-primary border-primary/10 px-2 py-0.5">
                        {objective}
                      </Badge>
                    )) : <span className="text-xs text-muted-foreground italic">—</span>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Project Scope</label>
                  <div className="p-3 rounded-xl bg-muted/30 border border-muted/50">
                    <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                      {summary.scope.services.join(", ") || "No services selected"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Proposed Timeline</label>
                  <p className="text-xs font-bold text-foreground flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 text-primary" />
                    {summary.timelines.startTime || "Not scheduled"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-full border-muted/60 shadow-sm overflow-hidden flex flex-col bg-background/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 border-b border-muted/40 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Presentation className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Asset Delivery</CardTitle>
                </div>
                {presentationDeck && (
                  <Badge variant="outline" className={cn(
                    "uppercase tracking-[0.1em] text-[10px] font-bold h-6 rounded-lg px-2.5",
                    presentationDeck.status === 'ready' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-primary/5 text-primary border-primary/20"
                  )}>
                    {presentationDeck.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {presentationDeck ? (
                <div className="flex flex-col h-full gap-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Visual Preview Placeholder */}
                    <div className="group relative aspect-[16/10] rounded-2xl bg-muted/40 overflow-hidden ring-1 ring-muted transition-all hover:ring-primary/40 hover:shadow-xl hover:shadow-primary/5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary),0.05)_0%,transparent_70%)]" />
                      
                      {/* Fake Slide Elements */}
                      <div className="absolute inset-4 space-y-3">
                        <div className="h-2 w-1/3 bg-primary/20 rounded-full" />
                        <div className="h-3 w-3/4 bg-primary/10 rounded-full" />
                        <div className="grid grid-cols-2 gap-2 pt-4">
                          <div className="aspect-video bg-muted-foreground/10 rounded-lg" />
                          <div className="aspect-video bg-muted-foreground/10 rounded-lg" />
                        </div>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-4 rounded-full bg-primary shadow-2xl shadow-primary/40 scale-0 group-hover:scale-100 transition-transform duration-300">
                          <Presentation className="h-8 w-8 text-primary-foreground" />
                        </div>
                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-foreground">Launch Interactive Viewer</p>
                      </div>

                      {activeProposalIdForDeck && (
                        <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`} className="absolute inset-0 z-10" />
                      )}
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">Export & Share</label>
                      <div className="space-y-3">
                        {(presentationDeck.storageUrl || presentationDeck.pptxUrl) && (
                          <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-muted/60 hover:bg-primary/[0.03] hover:border-primary/30 group transition-all" asChild>
                            <a href={presentationDeck.storageUrl || presentationDeck.pptxUrl || '#'} target="_blank" rel="noreferrer">
                              <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors mr-4">
                                <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="text-left">
                                <p className="text-[13px] font-bold tracking-tight">PowerPoint (PPTX)</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Download for offline use</p>
                              </div>
                            </a>
                          </Button>
                        )}
                        
                        {viewerHref && (
                          <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-muted/60 hover:bg-primary/[0.03] hover:border-primary/30 group transition-all" asChild>
                            <Link href={viewerHref}>
                              <div className="p-2 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors mr-4">
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="text-left">
                                <p className="text-[13px] font-bold tracking-tight">Microsoft Online</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Open in Cloud Editor</p>
                              </div>
                            </Link>
                          </Button>
                        )}

                        <Button 
                          variant="ghost" 
                          className="w-full justify-center h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                          onClick={() => {
                            if (activeProposalIdForDeck) {
                              const shareLink = `${window.location.origin}/dashboard/proposals/${activeProposalIdForDeck}/deck`
                              navigator.clipboard.writeText(shareLink)
                              toast({ title: "Share link copied!" })
                            }
                          }}
                        >
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy Share Link
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-muted/40">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      AUTHENTICATED & VERIFIED
                    </div>
                    {onRecheckDeck && (presentationDeck.status === 'pending' || presentationDeck.status === 'processing') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRecheckDeck}
                        disabled={isRecheckingDeck}
                        className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl border border-primary/10"
                      >
                        {isRecheckingDeck ? <LoaderCircle className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                        Sync
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                  <div className="relative mb-6">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                    />
                    <div className="relative p-6 rounded-[2rem] bg-muted/40 border border-muted ring-1 ring-muted-foreground/10">
                      <Sparkles className="h-12 w-12 text-primary/40" />
                    </div>
                  </div>
                  <h4 className="font-extrabold text-xl mb-2 tracking-tight">Architecting Your Deck</h4>
                  <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
                    Our AI engine is currently structuring your presentation slides. It usually takes less than 60 seconds.
                  </p>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 60, ease: "linear" }}
                    className="h-1 bg-primary/30 rounded-full mt-8 max-w-[200px] w-full relative overflow-hidden"
                  >
                    <motion.div 
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-primary w-1/3"
                    />
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
