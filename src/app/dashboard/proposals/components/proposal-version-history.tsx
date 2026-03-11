'use client'

import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { Dialog } from '@/components/ui/dialog'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { proposalVersionsApi } from '@/lib/convex-api'
import type { ProposalFormData } from '@/lib/proposals'
import { isPreviewModeEnabled } from '@/lib/preview-data'
import type { ProposalVersion } from '@/types/proposal-versions'
import {
  ProposalVersionHistoryMenuContent,
  ProposalVersionHistoryTrigger,
  ProposalVersionPreviewDialog,
  ProposalVersionRestoreDialog,
} from './proposal-version-history-sections'

interface ProposalVersionHistoryProps {
  proposalId: string | null
  currentFormData: ProposalFormData
  onVersionRestored: (formData: ProposalFormData) => void
  disabled?: boolean
}

type VersionRow = {
  legacyId: string
  proposalLegacyId?: string
  versionNumber?: number
  formData?: unknown
  status?: string
  stepProgress?: number
  changeDescription?: string | null
  createdBy?: string
  createdByName?: string | null
  createdAtMs?: number
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
    if (!Array.isArray(rows)) return []
    return rows.map((row) => {
      const typedRow = row as VersionRow
      return {
      id: String(row.legacyId),
      proposalId: String(typedRow.proposalLegacyId ?? ''),
      versionNumber: typeof typedRow.versionNumber === 'number' ? typedRow.versionNumber : 1,
      formData: typedRow.formData as ProposalFormData,
      status: typeof typedRow.status === 'string' ? typedRow.status : 'draft',
      stepProgress: typeof typedRow.stepProgress === 'number' ? typedRow.stepProgress : 0,
      changeDescription: typeof typedRow.changeDescription === 'string' ? typedRow.changeDescription : null,
      createdBy: typeof typedRow.createdBy === 'string' ? typedRow.createdBy : '',
      createdByName: typeof typedRow.createdByName === 'string' ? typedRow.createdByName : null,
      createdAt: typeof typedRow.createdAtMs === 'number' ? new Date(typedRow.createdAtMs).toISOString() : null,
    }})
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

    setSaving(true)

    if (!workspaceId) {
      toast({
        title: 'Failed to save version',
        description: 'Workspace context missing',
        variant: 'destructive',
      })
      setSaving(false)
      return
    }

    await createSnapshot({
      workspaceId,
      proposalLegacyId: proposalId,
      changeDescription: 'Manual save point',
      createdBy: user?.id ?? '',
      createdByName: user?.email ?? null,
    })
      .then((res) => {
        const created = res?.version
        if (!created) {
          throw new Error('Failed to create version')
        }

        toast({
          title: 'Version saved',
          description: `Version ${created.versionNumber} has been saved.`,
        })
      })
      .catch((error) => {
        console.error('Failed to save version:', error)
        toast({
          title: 'Failed to save version',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setSaving(false)
      })
  }, [createSnapshot, proposalId, toast, user?.email, user?.id, workspaceId])

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

    setRestoring(true)

    if (!workspaceId) {
      toast({
        title: 'Failed to restore version',
        description: 'Workspace context missing',
        variant: 'destructive',
      })
      setRestoring(false)
      return
    }

    await restoreToVersion({
      workspaceId,
      proposalLegacyId: proposalId,
      versionLegacyId: restoreConfirmVersion.id,
      createdBy: user?.id ?? '',
      createdByName: user?.email ?? null,
    })
      .then((result) => {
        onVersionRestored(restoreConfirmVersion.formData)

        toast({
          title: 'Version restored',
          description: `Restored to version ${result.restoredFromVersion}. Your previous state was saved as version ${result.newVersion - 1}.`,
        })

        setRestoreConfirmVersion(null)
      })
      .catch((error) => {
        console.error('Failed to restore version:', error)
        toast({
          title: 'Failed to restore version',
          description: error instanceof Error ? error.message : 'An error occurred',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setRestoring(false)
      })
  }, [proposalId, restoreConfirmVersion, onVersionRestored, toast, restoreToVersion, user?.email, user?.id, workspaceId])

  const versionSummary = useMemo(() => {
    if (versions.length === 0) return null
    return `${versions.length} version${versions.length === 1 ? '' : 's'}`
  }, [versions.length])

  const latestVersion = versions[0]

  return (
    <>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <ProposalVersionHistoryTrigger
          disabled={disabled}
          open={open}
          proposalId={proposalId}
          versionCount={versions.length}
          versionSummary={versionSummary}
        />
        <ProposalVersionHistoryMenuContent
          handleSaveVersion={() => void handleSaveVersion()}
          latestVersion={latestVersion}
          loading={loading}
          proposalId={proposalId}
          restoring={restoring}
          saving={saving}
          setPreviewVersion={setPreviewVersion}
          setRestoreConfirmVersion={setRestoreConfirmVersion}
          versions={versions}
        />
      </DropdownMenu>

      <Dialog open={Boolean(previewVersion)} onOpenChange={(v) => !v && setPreviewVersion(null)}>
        <ProposalVersionPreviewDialog currentFormData={currentFormData} previewVersion={previewVersion} setPreviewVersion={setPreviewVersion} />
      </Dialog>

      <Dialog open={Boolean(restoreConfirmVersion)} onOpenChange={(v) => !v && setRestoreConfirmVersion(null)}>
        <ProposalVersionRestoreDialog
          handleRestoreVersion={() => void handleRestoreVersion()}
          restoreConfirmVersion={restoreConfirmVersion}
          restoring={restoring}
          setRestoreConfirmVersion={setRestoreConfirmVersion}
        />
      </Dialog>
    </>
  )
}
