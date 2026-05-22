'use client'

import { useCallback } from 'react'

import { cn } from '@/lib/utils'

export function CreativeSocialPreviewVariantButton({
  index,
  selected,
  onSelect,
}: {
  index: number
  selected: boolean
  onSelect: (index: number) => void
}) {
  const onSelectPreview = useCallback(() => onSelect(index), [index, onSelect])

  return (
    <button
      type="button"
      onClick={onSelectPreview}
      className={cn(
        'h-6 min-w-6 rounded-md px-1.5 text-[10px] font-bold transition-colors',
        selected
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted',
      )}
    >
      {index + 1}
    </button>
  )
}
