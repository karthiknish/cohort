'use client'

import { Fragment } from 'react'

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
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) => `@${label}`)
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

export function AgentMentionText({ text, mentionLabels = EMPTY_MENTION_LABELS, className, mentionClassName }: AgentMentionTextProps) {
  const segments = splitAgentTextWithMentions(text, mentionLabels)

  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <Fragment key={`${segment.text}-${index}`}>
          {segment.isMention ? (
            <span
              className={cn(
                'inline rounded-md px-1.5 py-0.5 font-medium ring-1 ring-inset',
                'bg-primary/15 text-primary ring-primary/20',
                mentionClassName
              )}
            >
              {segment.text}
            </span>
          ) : (
            segment.text
          )}
        </Fragment>
      ))}
    </span>
  )
}