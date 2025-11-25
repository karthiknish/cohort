'use client'

import { useState, useCallback, useMemo } from 'react'
import { History, RotateCcw, Eye, ChevronDown, Clock, User, Loader2, Save, AlertCircle } from 'lucide-react'

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
import type { ProposalVersion } from '@/types/proposal-versions'
import type { ProposalFormData } from '@/lib/proposals'
import {
  fetchProposalVersions,
  createProposalVersion,
  restoreProposalVersion,
} from '@/services/proposal-versions'

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
  const { getIdToken } = useAuth()
  const { toast } = useToast()

  const [versions, setVersions] = useState<ProposalVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<ProposalVersion | null>(null)
  const [restoreConfirmVersion, setRestoreConfirmVersion] = useState<ProposalVersion | null>(null)

  const loadVersions = useCallback(async () => {
    if (!proposalId) return

    try {
      setLoading(true)
      await getIdToken()
      const data = await fetchProposalVersions(proposalId)
      setVersions(data)
    } catch (error) {
      console.error('Failed to load versions:', error)
      toast({
        title: 'Failed to load versions',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [proposalId, getIdToken, toast])

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && proposalId) {
      loadVersions()
    }
  }, [proposalId, loadVersions])

  const handleSaveVersion = useCallback(async () => {
    if (!proposalId) {
      toast({
        title: 'Cannot save version',
        description: 'Please save the proposal first before creating a version.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      await getIdToken()
      const version = await createProposalVersion({
        proposalId,
        changeDescription: 'Manual save point',
      })
      setVersions((prev) => [version, ...prev])
      toast({
        title: 'Version saved',
        description: `Version ${version.versionNumber} has been saved.`,
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
  }, [proposalId, getIdToken, toast])

  const handleRestoreVersion = useCallback(async () => {
    if (!proposalId || !restoreConfirmVersion) return

    try {
      setRestoring(true)
      await getIdToken()
      const result = await restoreProposalVersion(proposalId, restoreConfirmVersion.id)
      
      // Update local state with restored form data
      onVersionRestored(restoreConfirmVersion.formData)
      
      toast({
        title: 'Version restored',
        description: `Restored to version ${result.restoredFromVersion}. Your previous state was saved as version ${result.newVersion - 1}.`,
      })
      
      setRestoreConfirmVersion(null)
      await loadVersions()
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
  }, [proposalId, restoreConfirmVersion, getIdToken, onVersionRestored, toast, loadVersions])

  const versionSummary = useMemo(() => {
    if (versions.length === 0) return null
    return `${versions.length} version${versions.length === 1 ? '' : 's'}`
  }, [versions.length])

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || !proposalId}
            className="gap-2"
          >
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
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save Point
            </Button>
          </div>
          <DropdownMenuSeparator />
          
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No versions yet. Click "Save Point" to create one.
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
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(version.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setPreviewVersion(version)}
                        title="Preview version"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setRestoreConfirmVersion(version)}
                        title="Restore version"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {version.changeDescription && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {version.changeDescription}
                    </p>
                  )}
                  {version.createdByName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {version.createdByName}
                    </div>
                  )}
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Preview Dialog */}
      <Dialog open={Boolean(previewVersion)} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Version {previewVersion?.versionNumber} Preview
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatFullDate(previewVersion?.createdAt ?? null)}
              </span>
              {previewVersion?.createdByName && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {previewVersion.createdByName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-96">
            <div className="space-y-4 pr-4">
              {previewVersion && (
                <>
                  <PreviewSection title="Company" data={previewVersion.formData.company} />
                  <PreviewSection title="Marketing" data={previewVersion.formData.marketing} />
                  <PreviewSection title="Goals" data={previewVersion.formData.goals} />
                  <PreviewSection title="Scope" data={previewVersion.formData.scope} />
                  <PreviewSection title="Timelines" data={previewVersion.formData.timelines} />
                  <PreviewSection title="Value" data={previewVersion.formData.value} />
                </>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewVersion(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (previewVersion) {
                  setRestoreConfirmVersion(previewVersion)
                  setPreviewVersion(null)
                }
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={Boolean(restoreConfirmVersion)} onOpenChange={() => setRestoreConfirmVersion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Restore Version {restoreConfirmVersion?.versionNumber}?
            </DialogTitle>
            <DialogDescription>
              This will replace your current proposal content with the content from version {restoreConfirmVersion?.versionNumber}.
              Your current state will be automatically saved as a new version before restoring.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreConfirmVersion(null)}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button onClick={handleRestoreVersion} disabled={restoring}>
              {restoring ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore Version
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface PreviewSectionProps {
  title: string
  data: Record<string, unknown>
}

function PreviewSection({ title, data }: PreviewSectionProps) {
  const entries = Object.entries(data).filter(([, value]) => {
    if (value === '' || value === null || value === undefined) return false
    if (Array.isArray(value) && value.length === 0) return false
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value as object).length === 0) return false
    return true
  })

  if (entries.length === 0) return null

  return (
    <div className="rounded-md border border-muted/50 p-3">
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      <dl className="space-y-1 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <dt className="min-w-24 capitalize text-muted-foreground">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </dt>
            <dd className="text-foreground">
              {Array.isArray(value)
                ? value.join(', ')
                : typeof value === 'object'
                ? JSON.stringify(value)
                : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
