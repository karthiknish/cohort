'use client'

import { ArrowDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'

type MessageListJumpToLatestProps = {
  visible: boolean
  onClick: () => void
}

export function MessageListJumpToLatest({ visible, onClick }: MessageListJumpToLatestProps) {
  if (!visible) {
    return null
  }

  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="pointer-events-auto gap-1.5 shadow-md ring-1 ring-border/60"
        onClick={onClick}
      >
        <ArrowDown className="size-3.5" />
        Latest
      </Button>
    </div>
  )
}
