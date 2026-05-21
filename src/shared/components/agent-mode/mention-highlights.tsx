'use client'

import { Fragment } from 'react'

import type { AgentMentionEntity } from '@/lib/agent-mentions'
import { cn } from '@/lib/utils'

type MentionSegment = {
  text: string
  isMention: boolean
}

const EMPTY_MENTION_LABELS: string[] = []

function isBoundaryCharacter(value: string | undefined): boolean {
  return !value || /[\s.,!?;:()[\]{}'"/\\|-]/.test(value)
}

export function splitAgentTextWithMentions(text: string, mentionLabels: string[] = EMPTY_MENTION_LABELS): MentionSegment[] {
  if (!text) return []

  const normalizedLabels = Array.from(
    new Set(
      mentionLabels
        .flatMap((label) => {
          const normalizedLabel = label.trim()
          return normalizedLabel ? [`@${normalizedLabel}`] : []
        })
    )
  ).sort((a, b) => b.length - a.length)

  const segments: MentionSegment[] = []
  let buffer = ''
  let index = 0

  const flushBuffer = () => {
    if (!buffer) return
    segments.push({ text: buffer, isMention: false })
    buffer = ''
  }

  while (index < text.length) {
    const currentChar = text[index]

    if (currentChar !== '@' || !isBoundaryCharacter(text[index - 1])) {
      buffer += currentChar
      index += 1
      continue
    }

    const markupMatch = text.slice(index).match(/^@\[([^\]]+)\]/)
    if (markupMatch?.[0]) {
      flushBuffer()
      segments.push({ text: `@${markupMatch[1]}`, isMention: true })
      index += markupMatch[0].length
      continue
    }

    const exactLabel = normalizedLabels.find((label) => {
      const candidate = text.slice(index, index + label.length)
      return candidate.toLowerCase() === label.toLowerCase() && isBoundaryCharacter(text[index + label.length])
    })

    if (exactLabel) {
      flushBuffer()
      segments.push({ text: text.slice(index, index + exactLabel.length), isMention: true })
      index += exactLabel.length
      continue
    }

    const tokenMatch = text.slice(index).match(/^@[A-Za-z0-9._-]+/)
    if (tokenMatch?.[0]) {
      flushBuffer()
      segments.push({ text: tokenMatch[0], isMention: true })
      index += tokenMatch[0].length
      continue
    }

    buffer += currentChar
    index += 1
  }

  flushBuffer()
  return segments
}

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