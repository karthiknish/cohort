'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import { AgentMentionText } from './mention-highlights'

type ParsedBlock =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'metrics'; pairs: Array<{ label: string; value: string }> }

function parsePlainAgentContent(text: string): ParsedBlock[] {
  const lines = text.split('\n').map((line) => line.trimEnd())
  const blocks: ParsedBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? ''

    if (!line) {
      index += 1
      continue
    }

    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = []
      while (index < lines.length) {
        const current = lines[index]?.trim() ?? ''
        if (!current) break
        const match = current.match(/^[-*•]\s+(.+)$/)
        if (!match) break
        items.push(match[1] ?? '')
        index += 1
      }
      blocks.push({ type: 'list', items })
      continue
    }

    const metricMatch = line.match(/^([A-Za-z][A-Za-z0-9\s/&]+):\s+(.+)$/)
    if (metricMatch) {
      const pairs: Array<{ label: string; value: string }> = []
      while (index < lines.length) {
        const current = lines[index]?.trim() ?? ''
        const match = current.match(/^([A-Za-z][A-Za-z0-9\s/&]+):\s+(.+)$/)
        if (!match) break
        pairs.push({ label: match[1] ?? '', value: match[2] ?? '' })
        index += 1
      }
      if (pairs.length >= 2) {
        blocks.push({ type: 'metrics', pairs })
        continue
      }
    }

    const paragraphLines: string[] = [line]
    index += 1
    while (index < lines.length) {
      const next = lines[index]?.trim() ?? ''
      if (!next || /^[-*•]\s+/.test(next) || /^[A-Za-z][A-Za-z0-9\s/&]+:\s+/.test(next)) break
      paragraphLines.push(next)
      index += 1
    }
    blocks.push({ type: 'paragraph', lines: paragraphLines })
  }

  return blocks
}

type AgentPlainTextProps = {
  text: string
  mentionLabels: string[]
  mentionClassName: string
}

export function AgentPlainText({ text, mentionLabels, mentionClassName }: AgentPlainTextProps) {
  const blocks = useMemo(() => parsePlainAgentContent(text), [text])

  if (blocks.length <= 1 && blocks[0]?.type === 'paragraph') {
    return (
      <AgentMentionText text={text} mentionLabels={mentionLabels} mentionClassName={mentionClassName} />
    )
  }

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground">
      {blocks.map((block) => {
        if (block.type === 'list') {
          const listKey = `list-${block.items.join('\u0000')}`
          return (
            <ul key={listKey} className="ml-1 list-disc space-y-1 pl-4 text-foreground/95">
              {block.items.map((item) => (
                <li key={item}>
                  <AgentMentionText text={item} mentionLabels={mentionLabels} mentionClassName={mentionClassName} />
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === 'metrics') {
          const metricsKey = `metrics-${block.pairs.map((pair) => `${pair.label}:${pair.value}`).join('\u0000')}`
          return (
            <div key={metricsKey} className="grid gap-2 sm:grid-cols-2">
              {block.pairs.map((pair) => (
                <div
                  key={pair.label}
                  className="rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{pair.label}</p>
                  <p className="mt-0.5 font-medium tabular-nums text-foreground">{pair.value}</p>
                </div>
              ))}
            </div>
          )
        }

        const paragraphKey = `p-${block.lines.join('\u0000')}`
        return (
          <p key={paragraphKey} className="text-pretty">
            <AgentMentionText
              text={block.lines.join(' ')}
              mentionLabels={mentionLabels}
              mentionClassName={mentionClassName}
            />
          </p>
        )
      })}
    </div>
  )
}
