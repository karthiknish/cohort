'use client'

import React, { memo } from 'react'
import Link from 'next/link'
import { FileText, ArrowRight, Clock } from 'lucide-react'
import { ViewTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProposalDraft } from '@/types/proposals'

interface ClientProposalsCardProps {
    proposals: ProposalDraft[]
    loading: boolean
}

function ClientProposalsCardComponent({ proposals, loading }: ClientProposalsCardProps) {
    const stats = React.useMemo(() => {
        const total = proposals.length
        const ready = proposals.filter((p) => p.status === 'ready' || p.status === 'sent').length
        const drafts = total - ready
        return { total, ready, drafts }
    }, [proposals])

    if (loading) {
        return <Skeleton className="h-[300px] w-full rounded-xl" />
    }

    const recentProposals = proposals.slice(0, 3)

    return (
        <Card className="shadow-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Proposals
                        </CardTitle>
                        <CardDescription>Track and review your strategy plans</CardDescription>
                    </div>
                    <Link href="/dashboard/proposals">
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                            View all <ArrowRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/30 rounded-lg p-2 text-center">
                        <p className="text-xs text-muted-foreground font-medium uppercase truncate">Total</p>
                        <p className="text-lg font-bold">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border border-success/20 bg-success/10 p-2 text-center">
                        <p className="truncate text-xs font-medium uppercase text-success">Ready</p>
                        <p className="text-lg font-bold text-success">{stats.ready}</p>
                    </div>
                    <div className="rounded-lg border border-warning/20 bg-warning/10 p-2 text-center">
                        <p className="truncate text-xs font-medium uppercase text-warning">Drafts</p>
                        <p className="text-lg font-bold text-warning">{stats.drafts}</p>
                    </div>
                </div>

                {/* Recent Proposals List */}
                <div className="space-y-3 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Most Recent</p>
                    {proposals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed rounded-lg bg-muted/5">
                            <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">No proposals found</p>
                        </div>
                    ) : (
                        recentProposals.map((proposal) => (
                            <div
                                key={proposal.id}
                                className="group flex flex-col gap-1 p-3 rounded-xl border bg-card hover:border-primary/30 transition-colors shadow-none"
                            >
                                <div className="flex items-center justify-between">
                                    <ViewTransition name={`proposal-title-${proposal.id}`} share="text-morph" default="none">
                                        <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                            {proposal.clientName || 'Strategy Proposal'}
                                        </span>
                                    </ViewTransition>
                                    <ViewTransition name={`proposal-status-${proposal.id}`} share="morph" default="none">
                                        <Badge
                                            variant={proposal.status === 'ready' || proposal.status === 'sent' ? 'default' : 'secondary'}
                                            className={cn(
                                                "text-[9px] h-4 px-1.5 uppercase font-bold tracking-tighter",
                                                proposal.status === 'ready' && "bg-success text-success-foreground hover:bg-success",
                                                proposal.status === 'sent' && "bg-info text-info-foreground hover:bg-info",
                                                proposal.status === 'draft' && "bg-warning/10 text-warning border-none shadow-none"
                                            )}
                                        >
                                            {proposal.status}
                                        </Badge>
                                    </ViewTransition>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {proposal.updatedAt ? new Date(proposal.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                                    </span>
                                    <span className="h-2 w-px bg-muted-foreground/20" />
                                    <Link
                                        href={proposal.status === 'ready' ? `/dashboard/proposals/${proposal.id}/deck` : '/dashboard/proposals'}
                                        transitionTypes={proposal.status === 'ready' ? ['nav-forward'] : undefined}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        {proposal.status === 'ready' ? 'Preview Deck' : 'Resume Editing'}
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export const ClientProposalsCard = memo(ClientProposalsCardComponent)
