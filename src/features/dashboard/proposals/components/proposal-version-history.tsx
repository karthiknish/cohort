'use client'

import { useCallback, useMemo, useReducer } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { Dialog } from '@/shared/ui/dialog'
import { DropdownMenu } from '@/shared/ui/dropdown-menu'
import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
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

type ProposalVersionHistoryState = {
  open: boolean
  saving: boolean
  restoring: boolean
  previewVersion: ProposalVersion | null
  restoreConfirmVersion: ProposalVersion | null
}

type ProposalVersionHistoryAction =
  | { type: 'setOpen'; open: boolean }
  | { type: 'setSaving'; saving: boolean }
  | { type: 'setRestoring'; restoring: boolean }
  | { type: 'setPreviewVersion'; version: ProposalVersion | null }
  | { type: 'setRestoreConfirmVersion'; version: ProposalVersion | null }

const INITIAL_PROPOSAL_VERSION_HISTORY_STATE: ProposalVersionHistoryState = {
  open: false,
  saving: false,
  restoring: false,
  previewVersion: null,
  restoreConfirmVersion: null,
}

function proposalVersionHistoryReducer(
  state: ProposalVersionHistoryState,
  action: ProposalVersionHistoryAction,
): ProposalVersionHistoryState {
  switch (action.type) {
    case 'setOpen':
      return { ...state, open: action.open }
    case 'setSaving':
      return { ...state, saving: action.saving }
    case 'setRestoring':
      return { ...state, restoring: action.restoring }
    case 'setPreviewVersion':
      return { ...state, previewVersion: action.version }
    case 'setRestoreConfirmVersion':
      return { ...state, restoreConfirmVersion: action.version }
    default:
      return state
  }
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

  const [{ open, saving, restoring, previewVersion, restoreConfirmVersion }, dispatch] = useReducer(
    proposalVersionHistoryReducer,
    INITIAL_PROPOSAL_VERSION_HISTORY_STATE,
  )

  const handleOpenChange = useCallback((isOpen: boolean) => {
    dispatch({ type: 'setOpen', open: isOpen })
  }, [])

  const setPreviewVersion = useCallback((version: ProposalVersion | null) => {
    dispatch({ type: 'setPreviewVersion', version })
  }, [])

  const setRestoreConfirmVersion = useCallback((version: ProposalVersion | null) => {
    dispatch({ type: 'setRestoreConfirmVersion', version })
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

    dispatch({ type: 'setSaving', saving: true })

    if (!workspaceId) {
      toast({
        title: 'Failed to save version',
        description: 'Workspace context missing',
        variant: 'destructive',
      })
      dispatch({ type: 'setSaving', saving: false })
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
        logError(error, 'ProposalVersionHistory:saveVersion')
        toast({
          title: 'Failed to save version',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        dispatch({ type: 'setSaving', saving: false })
      })
  }, [createSnapshot, proposalId, toast, user?.email, user?.id, workspaceId])

  const handlePreviewOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setPreviewVersion(null)
    }
  }, [])

  const handleRestoreOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setRestoreConfirmVersion(null)
    }
  }, [setRestoreConfirmVersion])

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

    dispatch({ type: 'setRestoring', restoring: true })

    if (!workspaceId) {
      toast({
        title: 'Failed to restore version',
        description: 'Workspace context missing',
        variant: 'destructive',
      })
      dispatch({ type: 'setRestoring', restoring: false })
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
        logError(error, 'ProposalVersionHistory:restoreVersion')
        toast({
          title: 'Failed to restore version',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        dispatch({ type: 'setRestoring', restoring: false })
      })
  }, [proposalId, restoreConfirmVersion, onVersionRestored, setRestoreConfirmVersion, toast, restoreToVersion, user?.email, user?.id, workspaceId])

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
          handleSaveVersion={handleSaveVersion}
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

      <Dialog open={Boolean(previewVersion)} onOpenChange={handlePreviewOpenChange}>
        <ProposalVersionPreviewDialog currentFormData={currentFormData} previewVersion={previewVersion} setPreviewVersion={setPreviewVersion} />
      </Dialog>

      <ProposalVersionRestoreDialog
        open={Boolean(restoreConfirmVersion)}
        onOpenChange={handleRestoreOpenChange}
        handleRestoreVersion={handleRestoreVersion}
        restoreConfirmVersion={restoreConfirmVersion}
        restoring={restoring}
      />
    </>
  )
}
