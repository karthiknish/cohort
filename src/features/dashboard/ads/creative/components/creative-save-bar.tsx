'use client'

import { RefreshCw, Save, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

export function CreativeSaveBar(props: {
  isDirty: boolean
  isSaving: boolean
  onSave: () => void
  onDiscard: () => void
  className?: string
}) {
  const { isDirty, isSaving, onSave, onDiscard, className } = props

  if (!isDirty && !isSaving) return null

  return (
    <section
      className={cn(
        'sticky bottom-0 z-30 mt-4 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur-md supports-backdrop-filter:bg-background/80',
        className,
      )}
      aria-label="Save creative changes"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {isSaving ? 'Saving to Meta…' : 'Unsaved changes'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isSaving
              ? 'Publishing your copy updates to the ad platform.'
              : 'Press ⌘S to save, or use the buttons below.'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="h-9"
          >
            <X className="mr-1.5 size-3.5" />
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="h-9 min-w-[140px] shadow-md shadow-primary/15"
          >
            {isSaving ? (
              <RefreshCw className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-3.5" />
            )}
            {isSaving ? 'Saving…' : 'Save to Meta'}
          </Button>
        </div>
      </div>
    </section>
  )
}
