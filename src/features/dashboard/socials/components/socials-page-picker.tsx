'use client'

import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

type SocialsPagePickerProps = {
  pages: Array<{ id: string; name: string; instagramBusinessName: string | null }>
  selectedPageId: string
  loading: boolean
  confirming: boolean
  error: string | null
  setupComplete: boolean
  onSelectPage: (pageId: string) => void
  onConfirm: () => void
  onReload: () => void
}

export function SocialsPagePicker({
  pages,
  selectedPageId,
  loading,
  confirming,
  error,
  setupComplete,
  onSelectPage,
  onConfirm,
  onReload,
}: SocialsPagePickerProps) {
  const selected = pages.find((p) => p.id === selectedPageId)

  return (
    <div className="rounded-2xl border border-dashed border-accent/25 bg-accent/[0.03] p-5">
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">Facebook Page</h4>
        <p className="text-sm text-muted-foreground">
          {setupComplete
            ? `Reporting from ${selected?.name ?? 'selected Page'}. Change Page below if needed.`
            : 'Pick the Page for this workspace. Linked Instagram loads automatically when available.'}
        </p>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedPageId} onValueChange={onSelectPage} disabled={loading || pages.length === 0}>
          <SelectTrigger className={cn(DASHBOARD_THEME.inputs.base, 'w-full sm:max-w-md')}>
            <SelectValue placeholder={loading ? 'Loading Pages…' : 'Choose a Facebook Page'} />
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (
              <SelectItem key={page.id} value={page.id}>
                {page.name}
                {page.instagramBusinessName ? ` · @${page.instagramBusinessName}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={confirming || !selectedPageId || loading}
        >
          {confirming ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          {setupComplete ? 'Update Page' : 'Confirm Page'}
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={onReload} disabled={loading}>
          Reload Pages
        </Button>
      </div>
    </div>
  )
}
