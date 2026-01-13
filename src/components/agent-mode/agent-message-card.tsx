'use client'

import Link from 'next/link'
import {
    CheckCircle2,
    AlertCircle,
    Sparkles,
    ArrowRight,
    Navigation,
    Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AgentMessage } from '@/hooks/use-agent-mode'

// =============================================================================
// TYPES
// =============================================================================

interface AgentMessageCardProps {
    message: AgentMessage
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getActionLabel(action?: string): string {
    switch (action) {
        case 'navigate':
            return 'Navigation'
        case 'execute':
            return 'Task Executed'
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AgentMessageCard({ message }: AgentMessageCardProps) {
    const { type, content, status, metadata, route } = message

    // User messages - simple bubble
    if (type === 'user') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
            >
                <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-white">
                    {content}
                </div>
            </motion.div>
        )
    }

    // Agent messages - check for task completion status
    const hasTaskStatus = status === 'success' || status === 'error'
    const isSuccess = status === 'success'
    const isError = status === 'error'
    const action = metadata?.action

    // Enhanced task completion card
    if (hasTaskStatus && action) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
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
                            {isSuccess ? 'Task Complete' : 'Task Failed'}
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
                            <span className="ml-1">{getActionLabel(action)}</span>
                        </Badge>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-3">
                        <p className="text-sm leading-relaxed text-white">{content}</p>

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
                        {metadata?.operation && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                Operation: <code className="rounded bg-muted px-1 py-0.5">{metadata.operation}</code>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        )
    }

    // Regular agent message - bubble style
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
        >
            <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-2.5 text-sm text-white">
                {content}
            </div>
        </motion.div>
    )
}
