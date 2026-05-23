'use client'

import { useCallback, useState, type ReactNode } from 'react'
import { ChevronDown, Loader2, type LucideIcon } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'

export type MetaPixelRow = { id: string; name: string }

export type MetaPixelsState = {
  rows: MetaPixelRow[]
  loading: boolean
}

export function MetaToolsPanelShell({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className={cn(ADS_PAGE_THEME.controlFormPanel, 'space-y-4')}>
      <div className="flex items-start gap-3">
        <div className={ADS_PAGE_THEME.controlHeaderIcon}>
          <Icon className="size-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function MetaToolsFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="space-y-0.5">
        <p className={ADS_PAGE_THEME.controlSectionLabel}>{title}</p>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function MetaPixelPicker({
  pixelId,
  pixels,
  onPixelIdChange,
}: {
  pixelId: string
  pixels: MetaPixelsState
  onPixelIdChange: (value: string) => void
}) {
  const [manualOpen, setManualOpen] = useState(false)
  const selected = pixels.rows.find((row) => row.id === pixelId)
  const hasList = pixels.rows.length > 0

  const handlePixelIdInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onPixelIdChange(event.target.value),
    [onPixelIdChange],
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="meta-pixel-select" className="text-xs font-medium text-foreground">
          Meta pixel
        </Label>
        {pixels.loading ? (
          <div className="space-y-2" aria-busy="true" aria-label="Loading pixels">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : hasList ? (
          <Select value={pixelId || undefined} onValueChange={onPixelIdChange}>
            <SelectTrigger id="meta-pixel-select" className="h-10">
              <SelectValue placeholder="Choose a pixel from this ad account" />
            </SelectTrigger>
            <SelectContent>
              {pixels.rows.map((row) => (
                <SelectItem key={row.id} value={row.id}>
                  {row.name}
                  <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">({row.id})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Alert className="border-border/60 bg-muted/20">
            <AlertDescription className="text-xs leading-relaxed">
              No pixels were returned for this connection. Paste a pixel ID from{' '}
              <span className="font-medium text-foreground">Events Manager → Data sources</span>.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {selected && !pixels.loading ? (
        <div className={ADS_PAGE_THEME.controlStatChip}>
          <span className={ADS_PAGE_THEME.controlStatChipLabel}>Selected</span>
          <span className={ADS_PAGE_THEME.controlStatChipValue}>{selected.name}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{selected.id}</span>
        </div>
      ) : null}

      {hasList && !pixels.loading ? (
        <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-0 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={cn('size-3.5 transition-transform', manualOpen && 'rotate-180')}
                aria-hidden
              />
              {manualOpen ? 'Hide manual pixel ID' : 'Use a different pixel ID'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="meta-pixel-manual" className="text-xs text-muted-foreground">
                Pixel ID
              </Label>
              <Input
                id="meta-pixel-manual"
                value={pixelId}
                onChange={handlePixelIdInputChange}
                placeholder="e.g. 123456789012345"
                className="h-10 font-mono text-sm"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : !hasList && !pixels.loading ? (
        <div className="space-y-1.5">
          <Label htmlFor="meta-pixel-manual" className="text-xs text-muted-foreground">
            Pixel ID
          </Label>
          <Input
            id="meta-pixel-manual"
            value={pixelId}
            onChange={handlePixelIdInputChange}
            placeholder="e.g. 123456789012345"
            className="h-10 font-mono text-sm"
          />
        </div>
      ) : null}
    </div>
  )
}

export function MetaToolsActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">{children}</div>
  )
}

export function MetaJsonResultBlock({
  title,
  content,
  emptyLabel = 'No data yet.',
}: {
  title: string
  content: string
  emptyLabel?: string
}) {
  if (!content.trim()) {
    return (
      <div className={cn(ADS_PAGE_THEME.emptyState, 'py-6')}>
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <p className={ADS_PAGE_THEME.controlSectionLabel}>{title}</p>
      <pre className="max-h-40 overflow-auto rounded-xl border border-border/50 bg-muted/20 p-3 font-mono text-[11px] leading-relaxed text-foreground/90">
        {content}
      </pre>
    </div>
  )
}

export function MetaToolsLoadingHint({ label }: { label: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" aria-hidden />
      {label}
    </p>
  )
}
