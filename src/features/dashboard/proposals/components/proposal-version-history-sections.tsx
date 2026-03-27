'use client'

import { useCallback } from 'react'
import { ChevronDown, CircleAlert, Clock, Eye, History, LoaderCircle, RotateCcw, Save, User } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ScrollArea } from '@/shared/ui/scroll-area'
import type { ProposalFormData } from '@/lib/proposals'
import type { ProposalVersion } from '@/types/proposal-versions'

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Unknown'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatFullDate(dateString: string | null): string {
  if (!dateString) return 'Unknown date'

  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ProposalVersionHistoryTrigger({
  disabled,
  open,
  proposalId,
  versionCount,
  versionSummary,
}: {
  disabled: boolean
  open: boolean
  proposalId: string | null
  versionCount: number
  versionSummary: string | null
}) {
  return (
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" disabled={disabled || !proposalId} className="gap-2">
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
        {versionSummary && open ? (
          <Badge variant="secondary" className="ml-1 text-xs">
            {versionCount}
          </Badge>
        ) : null}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
  )
}

function ProposalVersionHistoryRow({
  onPreview,
  onRestore,
  restoring,
  version,
}: {
  onPreview: (version: ProposalVersion) => void
  onRestore: (version: ProposalVersion) => void
  restoring: boolean
  version: ProposalVersion
}) {
  const handlePreview = useCallback(() => {
    onPreview(version)
  }, [onPreview, version])

  const handleRestore = useCallback(() => {
    onRestore(version)
  }, [onRestore, version])

  const handleSelect = useCallback((event: Event) => {
    event.preventDefault()
  }, [])

  return (
    <DropdownMenuItem className="flex cursor-default flex-col items-start gap-1 px-2 py-2" onSelect={handleSelect}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">v{version.versionNumber}</Badge>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(version.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePreview} aria-label={`Preview version ${version.versionNumber}`}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={restoring} onClick={handleRestore} aria-label={`Restore version ${version.versionNumber}`}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatFullDate(version.createdAt)}</span>
        {version.createdBy ? (
          <>
            <span className="text-muted-foreground/40">·</span>
            <User className="h-3 w-3" />
            <span>{version.createdBy}</span>
          </>
        ) : null}
      </div>
    </DropdownMenuItem>
  )
}

export function ProposalVersionHistoryMenuContent({
  handleSaveVersion,
  latestVersion,
  loading,
  proposalId,
  restoring,
  saving,
  setPreviewVersion,
  setRestoreConfirmVersion,
  versions,
}: {
  handleSaveVersion: () => void
  latestVersion: ProposalVersion | undefined
  loading: boolean
  proposalId: string | null
  restoring: boolean
  saving: boolean
  setPreviewVersion: (version: ProposalVersion) => void
  setRestoreConfirmVersion: (version: ProposalVersion) => void
  versions: ProposalVersion[]
}) {
  return (
    <DropdownMenuContent align="end" className="w-80">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-sm font-medium">Version History</span>
        <Button variant="ghost" size="sm" onClick={handleSaveVersion} disabled={saving || !proposalId} className="h-7 gap-1 text-xs">
          {saving ? <LoaderCircle className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save Point
        </Button>
      </div>
      <DropdownMenuSeparator />

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : versions.length === 0 ? (
        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
          No versions yet. Click &quot;Save Point&quot; to create one.
        </div>
      ) : (
        <ScrollArea className="max-h-64">
          {versions.map((version) => (
            <ProposalVersionHistoryRow
              key={version.id}
              onPreview={setPreviewVersion}
              onRestore={setRestoreConfirmVersion}
              restoring={restoring}
              version={version}
            />
          ))}
        </ScrollArea>
      )}

      {latestVersion?.createdAt ? (
        <div className="mt-2 px-2 pb-1 text-xs text-muted-foreground">Latest: {formatFullDate(latestVersion.createdAt)}</div>
      ) : null}
    </DropdownMenuContent>
  )
}

export function ProposalVersionPreviewDialog({
  currentFormData,
  previewVersion,
  setPreviewVersion,
}: {
  currentFormData: ProposalFormData
  previewVersion: ProposalVersion | null
  setPreviewVersion: (version: ProposalVersion | null) => void
}) {
  const handleClose = useCallback(() => {
    setPreviewVersion(null)
  }, [setPreviewVersion])

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" /> Version {previewVersion?.versionNumber}
        </DialogTitle>
        <DialogDescription>Saved {formatFullDate(previewVersion?.createdAt ?? null)}</DialogDescription>
      </DialogHeader>
      <div className="rounded-md border bg-muted/30 p-4">
        <pre className="max-h-[50vh] overflow-auto text-xs">{JSON.stringify(previewVersion?.formData ?? currentFormData, null, 2)}</pre>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>Close</Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function ProposalVersionRestoreDialog({
  handleRestoreVersion,
  restoreConfirmVersion,
  restoring,
  setRestoreConfirmVersion,
}: {
  handleRestoreVersion: () => void
  restoreConfirmVersion: ProposalVersion | null
  restoring: boolean
  setRestoreConfirmVersion: (version: ProposalVersion | null) => void
}) {
  const handleCancel = useCallback(() => {
    setRestoreConfirmVersion(null)
  }, [setRestoreConfirmVersion])

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4 text-destructive" /> Restore version?
        </DialogTitle>
        <DialogDescription>
          This will replace the current proposal form with version {restoreConfirmVersion?.versionNumber}. Your current state will be saved as a new version.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={handleCancel} disabled={restoring}>Cancel</Button>
        <Button onClick={handleRestoreVersion} disabled={restoring}>
          {restoring ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Restore
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}