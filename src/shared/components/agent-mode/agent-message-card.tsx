'use client'

import { domAnimation, LazyMotion, m } from 'framer-motion'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Navigation,
    Sparkles,
    Zap,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { AgentMessage } from '@/shared/hooks/use-agent-mode'
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import { cn } from '@/lib/utils'
import { buildAgentDataSections } from './agent-message-data'
import { AgentMentionText } from './mention-highlights'

// =============================================================================
// TYPES
// =============================================================================

interface AgentMessageCardProps {
    message: AgentMessage
    mentionLabels?: string[]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getActionLabel(action?: string, operation?: string): string {
    if (operation === 'summarizeAdsPerformance') {
        return 'Ads Snapshot'
    }

    if (operation === 'generatePerformanceReport') {
        return 'Report'
    }

    if (operation === 'createProject' || operation === 'updateProject') {
        return 'Project Action'
    }

    switch (action) {
        case 'navigate':
            return 'Navigation'
        case 'execute':
            return 'Action Executed'
        default:
            return 'Response'
    }
}

function getActionIcon(action?: string) {
    switch (action) {
        case 'navigate':
            return <Navigation className="h-4 w-4" />
        case 'execute':
            return <Zap className="h-4 w-4" />
        default:
            return <Sparkles className="h-4 w-4" />
    }
}

function getStatusTitle(isSuccess: boolean, action?: string, operation?: string): string {
    if (action === 'navigate') {
        return isSuccess ? 'Navigation Ready' : 'Navigation Failed'
    }

    if (operation === 'summarizeAdsPerformance') {
        return isSuccess ? 'Snapshot Ready' : 'Snapshot Failed'
    }

    if (operation === 'generatePerformanceReport') {
        return isSuccess ? 'Report Ready' : 'Report Failed'
    }

    if (operation === 'createProject') {
        return isSuccess ? 'Project Created' : 'Project Action Failed'
    }

    if (operation === 'updateProject') {
        return isSuccess ? 'Project Updated' : 'Project Action Failed'
    }

    return isSuccess ? 'Action Complete' : 'Action Failed'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgentMessageCard({ message, mentionLabels = [] }: AgentMessageCardProps) {
    const { type, content, status, metadata, route } = message

    // User messages - simple bubble
    if (type === 'user') {
        return (
            <LazyMotion features={domAnimation}>
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                >
                    <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-white">
                        <AgentMentionText
                          text={content}
                          mentionLabels={mentionLabels}
                          mentionClassName="bg-white/18 text-white ring-white/20"
                        />
                    </div>
                </m.div>
            </LazyMotion>
        )
    }

    // Agent messages - check for task completion status
    const hasTaskStatus = status === 'success' || status === 'error'
    const isSuccess = status === 'success'
    const isError = status === 'error'
    const action = metadata?.action
    const operation = metadata?.operation
    const dataSections = buildAgentDataSections(operation, metadata?.data)

    // Enhanced task completion card
    if (hasTaskStatus && action) {
        return (
      <LazyMotion features={domAnimation}>
        <m.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: motionDurationSeconds.normal, ease: motionEasing.out }}
          className="flex justify-start"
        >
                <div
                    className={cn(
                        'max-w-[90%] overflow-hidden rounded-xl border shadow-sm',
                        isSuccess && 'border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950',
                        isError && 'border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-950'
                    )}
                >
                    {/* Header */}
                    <div
                        className={cn(
                            'flex items-center gap-2 border-b px-4 py-2.5',
                            isSuccess && 'border-emerald-200 bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900',
                            isError && 'border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-900'
                        )}
                    >
                        {isSuccess ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <span
                            className={cn(
                                'text-sm font-medium text-white',
                                isSuccess && 'text-emerald-700 dark:text-emerald-300',
                                isError && 'text-red-700 dark:text-red-300'
                            )}
                        >
                            {getStatusTitle(isSuccess, action, operation)}
                        </span>
                        <Badge
                            variant="secondary"
                            className={cn(
                                'ml-auto text-xs',
                                isSuccess && 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300',
                                isError && 'bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300'
                            )}
                        >
                            {getActionIcon(action)}
                            <span className="ml-1">{getActionLabel(action, operation)}</span>
                        </Badge>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-3">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                          <AgentMentionText
                            text={content}
                            mentionLabels={mentionLabels}
                            mentionClassName={cn(
                              isSuccess && 'bg-emerald-200/70 text-emerald-950 ring-emerald-300/80',
                              isError && 'bg-red-200/70 text-red-950 ring-red-300/80'
                            )}
                          />
                        </p>

                        {dataSections.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {dataSections.map((section) => (
                                    <div
                                        key={section.title}
                                        className={cn(
                                            'rounded-lg border px-3 py-2.5',
                                            isSuccess && 'border-emerald-300/80 bg-white/60 dark:bg-emerald-950/30',
                                            isError && 'border-red-300/80 bg-white/60 dark:bg-red-950/30'
                                        )}
                                    >
                                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {section.title}
                                        </div>

                                        {section.type === 'metrics' ? (
                                            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                                {section.items.map((item) => (
                                                    <div key={item.label} className="rounded-md bg-background/80 px-2.5 py-2 shadow-sm">
                                                        <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                                            <span>{item.label}</span>
                                                            {item.delta ? (
                                                                <span
                                                                    className={cn(
                                                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold normal-case',
                                                                        item.deltaTone === 'positive' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                                                                        item.deltaTone === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                                                                        item.deltaTone === 'neutral' && 'bg-muted text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {item.delta}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="mt-1 text-sm font-semibold text-foreground">{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {section.items.map((item) => (
                                                    item.href ? (
                                                        <Link
                                                            key={`${item.primary}-${item.secondary ?? ''}`}
                                                            href={item.href}
                                                            className="block rounded-md bg-background/80 px-2.5 py-2 shadow-sm transition-colors hover:bg-background"
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <div className="text-sm font-medium text-foreground">{item.primary}</div>
                                                                    {item.secondary ? (
                                                                        <div className="mt-0.5 text-xs text-muted-foreground">{item.secondary}</div>
                                                                    ) : null}
                                                                </div>
                                                                <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                                            </div>
                                                            {item.delta ? (
                                                                <div
                                                                    className={cn(
                                                                        'mt-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                                                        item.deltaTone === 'positive' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                                                                        item.deltaTone === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                                                                        item.deltaTone === 'neutral' && 'bg-muted text-muted-foreground'
                                                                    )}
                                                                >
                                                                    {item.delta}
                                                                </div>
                                                            ) : null}
                                                        </Link>
                                                    ) : (
                                                        <div key={`${item.primary}-${item.secondary ?? ''}`} className="rounded-md bg-background/80 px-2.5 py-2 shadow-sm">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <div className="text-sm font-medium text-foreground">{item.primary}</div>
                                                                    {item.secondary ? (
                                                                        <div className="mt-0.5 text-xs text-muted-foreground">{item.secondary}</div>
                                                                    ) : null}
                                                                </div>
                                                                {item.delta ? (
                                                                    <span
                                                                        className={cn(
                                                                            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                                                            item.deltaTone === 'positive' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                                                                            item.deltaTone === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                                                                            item.deltaTone === 'neutral' && 'bg-muted text-muted-foreground'
                                                                        )}
                                                                    >
                                                                        {item.delta}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Route link for navigation actions */}
                        {route && isSuccess && (
                            <div className="mt-3">
                                <Button asChild size="sm" variant="outline" className="gap-2">
                                    <Link href={route}>
                                        Go to page
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        )}

                        {/* Operation info */}
                        {operation && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                Operation: <code className="rounded bg-muted px-1 py-0.5">{operation}</code>
                            </div>
                        )}
                    </div>
                </div>
        </m.div>
      </LazyMotion>
        )
    }

    // Regular agent message - bubble style
    return (
            <LazyMotion features={domAnimation}>
                <m.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                >
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-secondary px-4 py-2.5 text-sm text-white">
                        <AgentMentionText
                          text={content}
                          mentionLabels={mentionLabels}
                          mentionClassName="bg-white/15 text-white ring-white/20"
                        />
                    </div>
                </m.div>
            </LazyMotion>
    )
}
