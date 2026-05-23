'use client'

import ReactMarkdown, { type Components } from 'react-markdown'

import { cn } from '@/lib/utils'
import { stripMarkdownFence } from '@/lib/meeting-notes-gemini'

const meetingNotesMarkdownComponents: Components = {
  h2: ({ children }) => (
    <h3 className="mt-4 text-sm font-semibold tracking-tight text-foreground first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-foreground">{children}</ul>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  p: ({ children }) => <p className="mt-2 text-sm leading-relaxed text-foreground">{children}</p>,
}

export function MeetingNotesMarkdown({ content, className }: { content: string; className?: string }) {
  const normalized = stripMarkdownFence(content)

  if (!normalized) {
    return null
  }

  return (
    <div className={cn('prose-meeting-notes', className)}>
      <ReactMarkdown components={meetingNotesMarkdownComponents}>{normalized}</ReactMarkdown>
    </div>
  )
}
