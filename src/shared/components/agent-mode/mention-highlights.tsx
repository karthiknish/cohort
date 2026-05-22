'use client'

import { Fragment } from 'react'

import type { AgentMentionEntity } from '@/lib/agent-mentions'
import { cn } from '@/lib/utils'

import { splitAgentTextWithMentions } from './mention-highlights-utils'

const EMPTY_MENTION_LABELS: string[] = []

type AgentMentionTextProps = {
  text: string
  mentionLabels?: string[]
  className?: string
  mentionClassName?: string
}

export function AgentMentionPills({ mentions }: { mentions: AgentMentionEntity[] }) {
  if (mentions.length === 0) return null

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {mentions.map((mention) => (
        <span
          key={`${mention.type}:${mention.id}`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary"
          title={`${mention.type} · ${mention.id}`}
        >
          <span className="font-medium">@{mention.name}</span>
          {mention.subtitle ? (
            <span className="truncate text-[10px] text-muted-foreground">{mention.subtitle}</span>
          ) : null}
          <span className="rounded bg-background/80 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
            {mention.type}
          </span>
        </span>
      ))}
    </div>
  )
}

export function AgentMentionText({ text, mentionLabels = EMPTY_MENTION_LABELS, className, mentionClassName }: AgentMentionTextProps) {
  const segments = splitAgentTextWithMentions(text, mentionLabels)
  const occurrenceCounts = new Map<string, number>()

  return (
    <span className={className}>
      {segments.map((segment) => {
        const occurrence = (occurrenceCounts.get(segment.text) ?? 0) + 1
        occurrenceCounts.set(segment.text, occurrence)

        return (
        <Fragment key={`${segment.text}-${occurrence}`}>
          {segment.isMention ? (
            <span
              className={cn(
                'inline rounded-md px-1.5 py-0.5 font-medium ring-1 ring-inset',
                'bg-accent/15 text-primary ring-primary/20',
                mentionClassName
              )}
            >
              {segment.text}
            </span>
          ) : (
            segment.text
          )}
        </Fragment>
        )
      })}
    </span>
  )
}
