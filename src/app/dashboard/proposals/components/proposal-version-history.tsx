'use client'

import { useState, useCallback, useMemo } from 'react'
import { History, RotateCcw, Eye, ChevronDown, Clock, User, LoaderCircle, Save, CircleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useMutation, useQuery } from 'convex/react'
import { proposalVersionsApi } from '@/lib/convex-api'
import type { ProposalVersion } from '@/types/proposal-versions'
import type { ProposalFormData } from '@/lib/proposals'
import { isPreviewModeEnabled } from '@/lib/preview-data'

interface ProposalVersionHistoryProps {
  proposalId: string | null
  currentFormData: ProposalFormData
  onVersionRestored: (formData: ProposalFormData) => void
  disabled?: boolean
}

function formatRelativeTime(dateString: string | null): string {
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

function formatFullDate(dateString: string | null): string {
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

export function ProposalVersionHistory({
  proposalId,
  currentFormData,
  onVersionRestored,
  disabled = false,
}: ProposalVersionHistoryProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const rows = useQuery(
    proposalVersionsApi.list,
    workspaceId && proposalId ? { workspaceId, proposalLegacyId: proposalId, limit: 50 } : 'skip',
  )

  const createSnapshot = useMutation(proposalVersionsApi.createSnapshot)
  const restoreToVersion = useMutation(proposalVersionsApi.restoreToVersion)

  const versions: ProposalVersion[] = useMemo(() => {
    if (!rows) return []
    return rows.map((row: any) => ({
      id: String(row.legacyId),
      proposalId: String(row.proposalLegacyId ?? ''),
      versionNumber: typeof row.versionNumber === 'number' ? row.versionNumber : 1,
      formData: row.formData as ProposalFormData,
      status: typeof row.status === 'string' ? row.status : 'draft',
      stepProgress: typeof row.stepProgress === 'number' ? row.stepProgress : 0,
      changeDescription: typeof row.changeDescription === 'string' ? row.changeDescription : null,
      createdBy: typeof row.createdBy === 'string' ? row.createdBy : '',
      createdByName: typeof row.createdByName === 'string' ? row.createdByName : null,
      createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
    }))
  }, [rows])

  const loading = rows === undefined

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<ProposalVersion | null>(null)
  const [restoreConfirmVersion, setRestoreConfirmVersion] = useState<ProposalVersion | null>(null)

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
  }, [])

  const handleSaveVersion = useCallback(async () => {
    if (!proposalId) {
      toast({
        title: 'Cannot save version',
        description: 'Please save the proposal first before creating a version.',
        variant: 'destructive',
      })
      return
    }

    if (typeof window !== 'undefined' && isPreviewModeEnabled()) {
      toast({
        title: 'Not available in preview mode',
        description: 'Version history is disabled for preview/demo proposals.',
      })
      return
    }

    try {
      setSaving(true)
      if (!workspaceId) {
        throw new Error('Workspace context missing')
      }

      const res = await createSnapshot({
        workspaceId,
        proposalLegacyId: proposalId,
        changeDescription: 'Manual save point',
        createdBy: user?.id ?? '',
        createdByName: user?.email ?? null,
      })

      const created = res?.version
      if (!created) {
        throw new Error('Failed to create version')
      }

      toast({
        title: 'Version saved',
        description: `Version ${created.versionNumber} has been saved.`,
      })
    } catch (error) {
      console.error('Failed to save version:', error)
      toast({
        title: 'Failed to save version',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [proposalId, toast])

  const handleRestoreVersion = useCallback(async () => {
    if (!proposalId || !restoreConfirmVersion) return

    if (typeof window !== 'undefined' && isPreviewModeEnabled()) {
      toast({
        title: 'Not available in preview mode',
        description: 'Restoring versions is disabled for preview/demo proposals.',
      })
      setRestoreConfirmVersion(null)
      return
    }

    try {
      setRestoring(true)
      if (!workspaceId) {
        throw new Error('Workspace context missing')
      }

      const result = await restoreToVersion({
        workspaceId,
        proposalLegacyId: proposalId,
        versionLegacyId: restoreConfirmVersion.id,
        createdBy: user?.id ?? '',
        createdByName: user?.email ?? null,
      })

      onVersionRestored(restoreConfirmVersion.formData)

      toast({
        title: 'Version restored',
        description: `Restored to version ${result.restoredFromVersion}. Your previous state was saved as version ${result.newVersion - 1}.`,
      })

      setRestoreConfirmVersion(null)
    } catch (error) {
      console.error('Failed to restore version:', error)
      toast({
        title: 'Failed to restore version',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setRestoring(false)
    }
  }, [proposalId, restoreConfirmVersion, onVersionRestored, toast, restoreToVersion, user?.email, user?.id, workspaceId])

  const versionSummary = useMemo(() => {
    if (versions.length === 0) return null
    return `${versions.length} version${versions.length === 1 ? '' : 's'}`
  }, [versions.length])

  const latestVersion = versions[0]

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || !proposalId} className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            {versionSummary && open && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {versions.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-medium">Version History</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveVersion}
              disabled={saving || !proposalId}
              className="h-7 gap-1 text-xs"
            >
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
                <DropdownMenuItem
                  key={version.id}
                  className="flex cursor-default flex-col items-start gap-1 px-2 py-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        v{version.versionNumber}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(version.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setPreviewVersion(version)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={restoring}
                        onClick={() => setRestoreConfirmVersion(version)}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatFullDate(version.createdAt)}</span>
                    {version.createdBy && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <User className="h-3 w-3" />
                        <span>{version.createdBy}</span>
                      </>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}

          {latestVersion?.createdAt && (
            <div className="mt-2 px-2 pb-1 text-xs text-muted-foreground">
              Latest: {formatFullDate(latestVersion.createdAt)}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={Boolean(previewVersion)} onOpenChange={(v) => !v && setPreviewVersion(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Version {previewVersion?.versionNumber}
            </DialogTitle>
            <DialogDescription>
              Saved {formatFullDate(previewVersion?.createdAt ?? null)}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-4">
            <pre className="max-h-[50vh] overflow-auto text-xs">
              {JSON.stringify(previewVersion?.formData ?? currentFormData, null, 2)}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(restoreConfirmVersion)} onOpenChange={(v) => !v && setRestoreConfirmVersion(null)}>
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
            <Button variant="outline" onClick={() => setRestoreConfirmVersion(null)} disabled={restoring}>
              Cancel
            </Button>
            <Button onClick={() => void handleRestoreVersion()} disabled={restoring}>
              {restoring ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
