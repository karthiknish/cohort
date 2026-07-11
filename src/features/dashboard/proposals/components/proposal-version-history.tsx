'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { useCallback, useMemo, useReducer } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Dialog } from '@/shared/ui/dialog';
import { DropdownMenu } from '@/shared/ui/dropdown-menu';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { proposalVersionsApi } from '@/lib/convex-api';
import type { ProposalFormData } from '@/lib/proposals';
import { isPreviewModeEnabled } from '@/lib/preview-data';
import type { ProposalVersion } from '@/types/proposal-versions';
import { ProposalVersionHistoryMenuContent, ProposalVersionHistoryTrigger, ProposalVersionPreviewDialog, ProposalVersionRestoreDialog, } from './proposal-version-history-sections';
interface ProposalVersionHistoryProps {
    proposalId: string | null;
    currentFormData: ProposalFormData;
    onVersionRestored: (formData: ProposalFormData) => void;
    disabled?: boolean;
}
type VersionRow = {
    legacyId: string;
    proposalLegacyId?: string;
    versionNumber?: number;
    formData?: unknown;
    status?: string;
    stepProgress?: number;
    changeDescription?: string | null;
    createdBy?: string;
    createdByName?: string | null;
    createdAtMs?: number;
};
type ProposalVersionHistoryState = {
    open: boolean;
    saving: boolean;
    restoring: boolean;
    previewVersion: ProposalVersion | null;
    restoreConfirmVersion: ProposalVersion | null;
};
type ProposalVersionHistoryAction = {
    type: 'setOpen';
    open: boolean;
} | {
    type: 'setSaving';
    saving: boolean;
} | {
    type: 'setRestoring';
    restoring: boolean;
} | {
    type: 'setPreviewVersion';
    version: ProposalVersion | null;
} | {
    type: 'setRestoreConfirmVersion';
    version: ProposalVersion | null;
};
const INITIAL_PROPOSAL_VERSION_HISTORY_STATE: ProposalVersionHistoryState = {
    open: false,
    saving: false,
    restoring: false,
    previewVersion: null,
    restoreConfirmVersion: null,
};
function proposalVersionHistoryReducer(state: ProposalVersionHistoryState, action: ProposalVersionHistoryAction): ProposalVersionHistoryState {
    switch (action.type) {
        case 'setOpen':
            return { ...state, open: action.open };
        case 'setSaving':
            return { ...state, saving: action.saving };
        case 'setRestoring':
            return { ...state, restoring: action.restoring };
        case 'setPreviewVersion':
            return { ...state, previewVersion: action.version };
        case 'setRestoreConfirmVersion':
            return { ...state, restoreConfirmVersion: action.version };
        default:
            return state;
    }
}
export function ProposalVersionHistory({ proposalId, currentFormData, onVersionRestored, disabled = false, }: ProposalVersionHistoryProps) {
    const { user } = useAuth();
    const { selectedClient } = useClientContext();
    const workspaceId = selectedClient?.workspaceId ?? user?.agencyId ?? null;
    const rows = useQuery(proposalVersionsApi.list, workspaceId && proposalId ? { workspaceId, proposalLegacyId: proposalId, limit: 50 } : 'skip');
    const versionsQueryError = useConvexQueryError({
        data: rows,
        skipped: !workspaceId || !proposalId,
        fallbackMessage: 'Unable to load version history.',
    });
    const createSnapshot = useMutation(proposalVersionsApi.createSnapshot);
    const restoreToVersion = useMutation(proposalVersionsApi.restoreToVersion);
    const versions: ProposalVersion[] = (() => {
        if (!rows)
            return [];
        if (!Array.isArray(rows))
            return [];
        return rows.map((row) => {
            const typedRow = row as VersionRow;
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
            };
        });
    })();
    const loading = rows === undefined;
    const [{ open, saving, restoring, previewVersion, restoreConfirmVersion }, dispatch] = useReducer(proposalVersionHistoryReducer, INITIAL_PROPOSAL_VERSION_HISTORY_STATE);
    const handleOpenChange = (isOpen: boolean) => {
        dispatch({ type: 'setOpen', open: isOpen });
    };
    const setPreviewVersion = (version: ProposalVersion | null) => {
        dispatch({ type: 'setPreviewVersion', version });
    };
    const setRestoreConfirmVersion = (version: ProposalVersion | null) => {
        dispatch({ type: 'setRestoreConfirmVersion', version });
    };
    const handleSaveVersion = async () => {
        if (!proposalId) {
            notifyFailure({
                title: 'Cannot save version',
                message: 'Please save the proposal first before creating a version.',
            });
            return;
        }
        if (typeof window !== 'undefined' && isPreviewModeEnabled()) {
            notifyInfo({
                title: 'Not available in preview mode',
                message: 'Version history is disabled for preview/demo proposals.',
            });
            return;
        }
        dispatch({ type: 'setSaving', saving: true });
        if (!workspaceId) {
            notifyFailure({
                title: 'Failed to save version',
                message: 'Workspace context missing',
            });
            dispatch({ type: 'setSaving', saving: false });
            return;
        }
        await createSnapshot({
            workspaceId,
            proposalLegacyId: proposalId,
            changeDescription: 'Manual save point',
            createdBy: user?.id ?? '',
            createdByName: user?.email ?? null,
        })
            .then((res) => {
            const created = res?.version;
            if (!created) {
                throw new Error('Failed to create version');
            }
            notifySuccess({
                title: 'Version saved',
                message: `Version ${created.versionNumber} has been saved.`,
            });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'ProposalVersionHistory:saveVersion',
                title: 'Failed to save version',
                fallbackMessage: 'Failed to save version',
            });
        })
            .finally(() => {
            dispatch({ type: 'setSaving', saving: false });
        });
    };
    const handlePreviewOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setPreviewVersion(null);
        }
    };
    const handleRestoreOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setRestoreConfirmVersion(null);
        }
    };
    const handleRestoreVersion = async () => {
        if (!proposalId || !restoreConfirmVersion)
            return;
        if (typeof window !== 'undefined' && isPreviewModeEnabled()) {
            notifyInfo({
                title: 'Not available in preview mode',
                message: 'Restoring versions is disabled for preview/demo proposals.',
            });
            setRestoreConfirmVersion(null);
            return;
        }
        dispatch({ type: 'setRestoring', restoring: true });
        if (!workspaceId) {
            notifyFailure({
                title: 'Failed to restore version',
                message: 'Workspace context missing',
            });
            dispatch({ type: 'setRestoring', restoring: false });
            return;
        }
        await restoreToVersion({
            workspaceId,
            proposalLegacyId: proposalId,
            versionLegacyId: restoreConfirmVersion.id,
            createdBy: user?.id ?? '',
            createdByName: user?.email ?? null,
        })
            .then((result) => {
            onVersionRestored(restoreConfirmVersion.formData);
            notifySuccess({
                title: 'Version restored',
                message: `Restored to version ${result.restoredFromVersion}. Your previous state was saved as version ${result.newVersion - 1}.`,
            });
            setRestoreConfirmVersion(null);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'ProposalVersionHistory:restoreVersion',
                title: 'Failed to restore version',
                fallbackMessage: 'Failed to restore version',
            });
        })
            .finally(() => {
            dispatch({ type: 'setRestoring', restoring: false });
        });
    };
    const versionSummary = (() => {
        if (versions.length === 0)
            return null;
        return `${versions.length} version${versions.length === 1 ? '' : 's'}`;
    })();
    const latestVersion = versions[0];
    return (<>
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <ProposalVersionHistoryTrigger disabled={disabled} open={open} proposalId={proposalId} versionCount={versions.length} versionSummary={versionSummary}/>
        <ProposalVersionHistoryMenuContent handleSaveVersion={handleSaveVersion} latestVersion={latestVersion} loading={loading} proposalId={proposalId} queryError={versionsQueryError} restoring={restoring} saving={saving} setPreviewVersion={setPreviewVersion} setRestoreConfirmVersion={setRestoreConfirmVersion} versions={versions}/>
      </DropdownMenu>

      <Dialog open={Boolean(previewVersion)} onOpenChange={handlePreviewOpenChange}>
        <ProposalVersionPreviewDialog currentFormData={currentFormData} previewVersion={previewVersion} setPreviewVersion={setPreviewVersion}/>
      </Dialog>

      <ProposalVersionRestoreDialog open={Boolean(restoreConfirmVersion)} onOpenChange={handleRestoreOpenChange} handleRestoreVersion={handleRestoreVersion} restoreConfirmVersion={restoreConfirmVersion} restoring={restoring}/>
    </>);
}
