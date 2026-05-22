'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'

export function WidgetSizeButton({
  size,
  currentSize,
  disabled,
  onSizeChange,
}: {
  size: { value: 'small' | 'medium' | 'large'; label: string; width: string }
  currentSize: 'small' | 'medium' | 'large'
  disabled?: boolean
  onSizeChange: (size: 'small' | 'medium' | 'large') => void
}) {
  const onSelectWidgetSize = useCallback(() => {
    onSizeChange(size.value)
  }, [onSizeChange, size.value])

  return (
    <button
      type="button"
      onClick={onSelectWidgetSize}
      disabled={disabled}
      aria-pressed={currentSize === size.value}
      aria-label={`${size.label} width${currentSize === size.value ? ', selected' : ''}. ${size.width}`}
      className={cn(
        'flex size-6 items-center justify-center rounded text-xs font-medium transition-colors',
        currentSize === size.value
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/70',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      title={`${size.label}: ${size.width}`}
    >
      {size.label}
    </button>
  )
}
