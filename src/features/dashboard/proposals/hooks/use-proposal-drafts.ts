import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { useState, useCallback, useRef, useEffect, useEffectEvent, useReducer } from 'react';
import { useClientContext } from '@/shared/contexts/client-context';
import { useAuth } from '@/shared/contexts/auth-context';
import { useQuery, useMutation } from 'convex/react';
import { proposalsApi } from '@/lib/convex-api';
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals';
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { trackDraftCreated } from '@/services/proposal-analytics';
import type { FormStateUpdateOptions } from './use-proposal-wizard';
import { createInitialProposalFormState } from '../utils/form-steps';
function buildSnapshotKey(snapshot: {
    form: ProposalFormData;
    step: number;
    clientId: string | null;
}) {
    return JSON.stringify({
        clientId: snapshot.clientId,
        step: snapshot.step,
        form: snapshot.form,
    });
}
export interface UseProposalDraftsOptions {
    isPreviewMode: boolean;
    formState: ProposalFormData;
    currentStep: number;
    hasPersistableData: boolean;
    onFormStateChange: (state: ProposalFormData | ((prev: ProposalFormData) => ProposalFormData), options?: FormStateUpdateOptions) => void;
    onStepChange: (step: number) => void;
    onSubmittedChange: (submitted: boolean) => void;
    onPresentationDeckChange: (deck: ProposalPresentationDeck | null) => void;
    onAiSuggestionsChange: (suggestions: string | null) => void;
    onLastSubmissionSnapshotChange: (snapshot: SubmissionSnapshot | null) => void;
    steps: Array<{
        id: string;
    }>;
}
export interface SubmissionSnapshot {
    draftId: string;
    form: ProposalFormData;
    step: number;
    clientId: string | null;
    clientName: string | null;
}
export interface UseProposalDraftsReturn {
    // State
    draftId: string | null;
    proposals: ProposalDraft[];
    isLoadingProposals: boolean;
    isCreatingDraft: boolean;
    isBootstrapping: boolean;
    proposalsQueryError: string | null;
    autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
    deletingProposalId: string | null;
    proposalPendingDelete: ProposalDraft | null;
    isDeleteDialogOpen: boolean;
    // Actions
    setDraftId: (id: string | null) => void;
    setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
    refreshProposals: () => Promise<ProposalDraft[]>;
    ensureDraftId: () => Promise<string | null>;
    saveDraftNow: (options?: {
        showToast?: boolean;
    }) => Promise<void>;
    handleCreateNewProposal: () => Promise<void>;
    handleResumeProposal: (proposal: ProposalDraft, forceEdit?: boolean) => void;
    handleDeleteProposal: (proposal: ProposalDraft) => Promise<void>;
    requestDeleteProposal: (proposal: ProposalDraft) => void;
    handleDeleteDialogChange: (open: boolean) => void;
    // Refs
    draftIdRef: React.MutableRefObject<string | null>;
    wizardRef: React.RefObject<HTMLDivElement | null>;
}
type ProposalBootstrapState = {
    draftId: string | null;
    isBootstrapping: boolean;
};
type ProposalBootstrapAction = {
    type: 'setDraftId';
    value: string | null;
} | {
    type: 'bootstrapStart';
} | {
    type: 'bootstrapFinish';
    draftId: string | null;
};
function proposalBootstrapReducer(state: ProposalBootstrapState, action: ProposalBootstrapAction): ProposalBootstrapState {
    switch (action.type) {
        case 'setDraftId':
            return { ...state, draftId: action.value };
        case 'bootstrapStart':
            return { ...state, isBootstrapping: true };
        case 'bootstrapFinish':
            return { draftId: action.draftId, isBootstrapping: false };
        default:
            return state;
    }
}
type ProposalRow = {
    legacyId: string;
    status?: ProposalDraft['status'];
    stepProgress?: number;
    formData?: unknown;
    aiInsights?: unknown;
    aiSuggestions?: string | null;
    pdfUrl?: string | null;
    pptUrl?: string | null;
    createdAtMs?: number;
    updatedAtMs?: number;
    lastAutosaveAtMs?: number;
    clientId?: string | null;
    clientName?: string | null;
    presentationDeck?: ProposalPresentationDeck | null;
};
export function useProposalDrafts(options: UseProposalDraftsOptions): UseProposalDraftsReturn {
    const { isPreviewMode, formState, currentStep, hasPersistableData, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange, steps, } = options;
    const { user, isSyncing, authError } = useAuth();
    const { selectedClient, selectedClientId } = useClientContext();
    const workspaceId = selectedClient?.workspaceId ?? user?.agencyId ?? null;
    const canQuery = Boolean(workspaceId && selectedClientId && !isSyncing && !authError);
    const convexProposals = useQuery(proposalsApi.list, isPreviewMode || !canQuery
        ? 'skip'
        : {
            workspaceId: workspaceId!,
            clientId: selectedClientId ?? undefined,
            limit: 100,
        });
    const proposalsQueryError = useConvexQueryError({
        data: convexProposals,
        skipped: isPreviewMode || !canQuery,
        fallbackMessage: 'Unable to load proposals.',
    });
    const convexCreateProposal = useMutation(proposalsApi.create);
    const convexUpdateProposal = useMutation(proposalsApi.update);
    const convexRemoveProposal = useMutation(proposalsApi.remove);
    const proposals: ProposalDraft[] = (() => {
        if (!workspaceId || !selectedClientId)
            return [];
        const rows = Array.isArray(convexProposals) ? (convexProposals as ProposalRow[]) : [];
        return rows.map((row) => ({
            id: String(row.legacyId),
            status: (row.status ?? 'draft') as ProposalDraft['status'],
            stepProgress: typeof row.stepProgress === 'number' ? row.stepProgress : 0,
            formData: mergeProposalForm(row.formData ?? null),
            aiInsights: row.aiInsights ?? null,
            aiSuggestions: row.aiSuggestions ?? null,
            pdfUrl: row.pdfUrl ?? null,
            pptUrl: row.pptUrl ?? null,
            createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
            lastAutosaveAt: typeof row.lastAutosaveAtMs === 'number' ? new Date(row.lastAutosaveAtMs).toISOString() : null,
            clientId: row.clientId ?? null,
            clientName: row.clientName ?? null,
            presentationDeck: row.presentationDeck
                ? {
                    ...row.presentationDeck,
                    storageUrl: row.presentationDeck.storageUrl ?? row.pptUrl ?? null,
                }
                : null,
        }));
    })();
    const [bootstrapState, dispatchBootstrap] = useReducer(proposalBootstrapReducer, {
        draftId: null,
        isBootstrapping: true,
    });
    const { draftId, isBootstrapping } = bootstrapState;
    const setDraftId = (value: string | null) => dispatchBootstrap({ type: 'setDraftId', value });
    const [isCreatingDraft, setIsCreatingDraft] = useState(false);
    const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null);
    const [proposalPendingDelete, setProposalPendingDelete] = useState<ProposalDraft | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const draftIdRef = useRef<string | null>(draftId);
    const wizardRef = useRef<HTMLDivElement | null>(null);
    const lastBootstrapKeyRef = useRef<string | null>(null);
    const lastSavedSnapshotRef = useRef<string | null>(null);
    const [lastSavedSnapshotKey, setLastSavedSnapshotKey] = useState<string | null>(null);
    const onFormStateChangeRef = useRef(onFormStateChange);
    const onStepChangeRef = useRef(onStepChange);
    const onSubmittedChangeRef = useRef(onSubmittedChange);
    const onPresentationDeckChangeRef = useRef(onPresentationDeckChange);
    const onAiSuggestionsChangeRef = useRef(onAiSuggestionsChange);
    const onLastSubmissionSnapshotChangeRef = useRef(onLastSubmissionSnapshotChange);
    const formStateRef = useRef(formState);
    const currentStepRef = useRef(currentStep);
    useEffect(() => {
        draftIdRef.current = draftId;
    }, [draftId]);
    useEffect(() => {
        formStateRef.current = formState;
    }, [formState]);
    useEffect(() => {
        currentStepRef.current = currentStep;
    }, [currentStep]);
    useEffect(() => {
        onFormStateChangeRef.current = onFormStateChange;
        onStepChangeRef.current = onStepChange;
        onSubmittedChangeRef.current = onSubmittedChange;
        onPresentationDeckChangeRef.current = onPresentationDeckChange;
        onAiSuggestionsChangeRef.current = onAiSuggestionsChange;
        onLastSubmissionSnapshotChangeRef.current = onLastSubmissionSnapshotChange;
    }, [
        onAiSuggestionsChange,
        onFormStateChange,
        onLastSubmissionSnapshotChange,
        onPresentationDeckChange,
        onStepChange,
        onSubmittedChange,
    ]);
    const markSnapshotSaved = (snapshotKey: string) => {
        lastSavedSnapshotRef.current = snapshotKey;
        setLastSavedSnapshotKey(snapshotKey);
    };
    const isLoadingProposals = Boolean(selectedClientId && workspaceId && convexProposals === undefined);
    const currentSnapshotKey = buildSnapshotKey({
        form: formState,
        step: currentStep,
        clientId: selectedClientId,
    });
    const refreshProposals = async () => {
        // Proposals are realtime via Convex; keep this for callers.
        return proposals;
    };
    const ensureDraftId = async () => {
        if (draftId) {
            return draftId;
        }
        if (!hasPersistableData) {
            notifyFailure({
                title: 'Draft not ready',
                message: 'Fill in the proposal form before generating.',
            });
            return null;
        }
        if (isCreatingDraft) {
            notifySuccess({
                title: 'Preparing proposal',
                message: 'Please wait while we prepare your proposal for generation.',
            });
            return null;
        }
        try {
            setIsCreatingDraft(true);
            setAutosaveStatus('saving');
            if (!workspaceId) {
                throw new Error('Workspace is required to create a proposal draft');
            }
            const res = await convexCreateProposal({
                workspaceId,
                ownerId: user?.id ?? null,
                status: 'draft',
                stepProgress: currentStep,
                formData: formState,
                clientId: selectedClientId ?? null,
                clientName: selectedClient?.name ?? null,
            });
            const newDraftId = res.legacyId;
            setDraftId(newDraftId);
            markSnapshotSaved(currentSnapshotKey);
            setAutosaveStatus('saved');
            return newDraftId;
        }
        catch (error: unknown) {
            logError(error, 'useProposalDrafts:ensureDraftId');
            setAutosaveStatus('error');
            reportConvexFailure({
                error: error,
                context: 'use-proposal-drafts.ts:catch',
                title: 'Unable to create draft',
                fallbackMessage: 'Unable to create draft',
            });
            return null;
        }
        finally {
            setIsCreatingDraft(false);
        }
    };
    const saveDraftNow = useEffectEvent(async (saveOptions?: {
        showToast?: boolean;
    }) => {
        if (isPreviewMode || !hasPersistableData || !selectedClientId) {
            return;
        }
        let activeDraftId = draftIdRef.current;
        if (!activeDraftId) {
            activeDraftId = await ensureDraftId();
            if (!activeDraftId) {
                return;
            }
        }
        try {
            setAutosaveStatus('saving');
            if (!workspaceId) {
                throw new Error('Workspace is required to save a proposal draft');
            }
            const timestamp = Date.now();
            await convexUpdateProposal({
                workspaceId,
                legacyId: activeDraftId,
                formData: formState,
                stepProgress: currentStep,
                status: 'draft',
                clientId: selectedClientId,
                clientName: selectedClient?.name ?? null,
                updatedAtMs: timestamp,
                lastAutosaveAtMs: timestamp,
            });
            markSnapshotSaved(currentSnapshotKey);
            setAutosaveStatus('saved');
            if (saveOptions?.showToast) {
                notifySuccess({
                    title: 'Draft saved',
                    message: 'Your proposal changes are saved.',
                });
            }
        }
        catch (error: unknown) {
            logError(error, 'useProposalDrafts:saveDraftNow');
            setAutosaveStatus('error');
            const message = asErrorMessage(error);
            if (saveOptions?.showToast) {
                notifyFailure({
                    title: 'Unable to save draft',
                    message: message,
                });
            }
        }
    });
    const handleCreateNewProposal = async () => {
        if (!selectedClientId) {
            notifyFailure({
                title: 'Select a client',
                message: 'Choose a client from the sidebar before starting a proposal.',
            });
            return;
        }
        if (isCreatingDraft) {
            notifySuccess({
                title: 'Preparing proposal',
                message: 'Please wait for the current draft to finish initializing.',
            });
            return;
        }
        try {
            setIsCreatingDraft(true);
            setAutosaveStatus('saving');
            const initialForm = createInitialProposalFormState();
            if (!workspaceId) {
                throw new Error('Workspace is required to create a proposal draft');
            }
            const res = await convexCreateProposal({
                workspaceId,
                ownerId: user?.id ?? null,
                status: 'draft',
                stepProgress: 0,
                formData: initialForm,
                clientId: selectedClientId ?? null,
                clientName: selectedClient?.name ?? null,
            });
            const newDraftId = res.legacyId;
            setDraftId(newDraftId);
            onFormStateChange(initialForm);
            onStepChange(0);
            onSubmittedChange(false);
            onPresentationDeckChange(null);
            onAiSuggestionsChange(null);
            onLastSubmissionSnapshotChange(null);
            markSnapshotSaved(buildSnapshotKey({
                form: initialForm,
                step: 0,
                clientId: selectedClientId,
            }));
            setAutosaveStatus('saved');
            // Track draft creation for analytics
            if (workspaceId) {
                trackDraftCreated(workspaceId, newDraftId, selectedClientId, selectedClient?.name).catch((err) => logError(err, 'useProposalDrafts:trackDraftCreated'));
            }
            notifySuccess({
                title: 'New proposal started',
                message: selectedClient?.name
                    ? `Working on a fresh plan for ${selectedClient.name}.`
                    : 'You can begin filling out the proposal steps.',
            });
        }
        catch (error: unknown) {
            logError(error, 'useProposalDrafts:handleCreateNewProposal');
            setAutosaveStatus('error');
            reportConvexFailure({
                error: error,
                context: 'use-proposal-drafts.ts:catch',
                title: 'Unable to create draft',
                fallbackMessage: 'Unable to create draft',
            });
        }
        finally {
            setIsCreatingDraft(false);
        }
    };
    const handleResumeProposal = (proposal: ProposalDraft, forceEdit?: boolean) => {
        const mergedForm = mergeProposalForm(proposal.formData as Partial<ProposalFormData>);
        const targetStep = Math.min(proposal.stepProgress ?? 0, steps.length - 1);
        setDraftId(proposal.id);
        onFormStateChange(mergedForm, { resetHistory: true });
        onStepChange(targetStep);
        onSubmittedChange(forceEdit ? false : proposal.status === 'ready');
        onPresentationDeckChange(proposal.presentationDeck ? { ...proposal.presentationDeck, storageUrl: proposal.presentationDeck.storageUrl ?? proposal.pptUrl ?? null } : null);
        onAiSuggestionsChange(proposal.aiSuggestions ?? null);
        if (proposal.status === 'ready' && !forceEdit) {
            onLastSubmissionSnapshotChange({
                draftId: proposal.id,
                form: structuredClone(mergedForm) as ProposalFormData,
                step: targetStep,
                clientId: proposal.clientId ?? null,
                clientName: proposal.clientName ?? null,
            });
        }
        else {
            onLastSubmissionSnapshotChange(null);
        }
        markSnapshotSaved(buildSnapshotKey({
            form: mergedForm,
            step: targetStep,
            clientId: proposal.clientId ?? selectedClientId,
        }));
        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const handleDeleteProposal = async (proposal: ProposalDraft) => {
        if (deletingProposalId && deletingProposalId !== proposal.id) {
            return;
        }
        try {
            setDeletingProposalId(proposal.id);
            if (!workspaceId) {
                throw new Error('Workspace is required to delete a proposal');
            }
            await convexRemoveProposal({ workspaceId, legacyId: proposal.id });
            if (draftId === proposal.id) {
                setDraftId(null);
                onFormStateChange(createInitialProposalFormState(), { resetHistory: true });
                onStepChange(0);
                onSubmittedChange(false);
                onPresentationDeckChange(null);
                onAiSuggestionsChange(null);
                onLastSubmissionSnapshotChange(null);
                markSnapshotSaved(buildSnapshotKey({
                    form: createInitialProposalFormState(),
                    step: 0,
                    clientId: selectedClientId,
                }));
            }
            notifySuccess({ title: 'Proposal deleted', message: 'The proposal has been removed.' });
        }
        catch (err: unknown) {
            logError(err, 'useProposalDrafts:handleDeleteProposal');
            const message = asErrorMessage(err);
            notifyFailure({
                title: 'Unable to delete proposal',
                message: message,
            });
        }
        finally {
            setDeletingProposalId(null);
            setProposalPendingDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };
    const requestDeleteProposal = (proposal: ProposalDraft) => {
        setProposalPendingDelete(proposal);
        setIsDeleteDialogOpen(true);
    };
    const handleDeleteDialogChange = (open: boolean) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
            setProposalPendingDelete(null);
        }
    };
    const lastBootstrappedRef = useRef<{ clientKey: string; hadProposals: boolean } | null>(null);
    // Bootstrap once per client, plus one more time when proposals first arrive.
    // Do not re-run on later list updates — that wiped in-progress wizard edits
    // (e.g. platform chips) after autosave refreshed the proposals query.
    useEffect(() => {
        if (!isPreviewMode && isLoadingProposals) {
            return;
        }
        const clientKey = selectedClientId ?? 'none';
        const hadProposals = proposals.length > 0;
        const previous = lastBootstrappedRef.current;
        if (previous?.clientKey === clientKey) {
            if (previous.hadProposals || !hadProposals) {
                return;
            }
        }
        lastBootstrappedRef.current = { clientKey, hadProposals };
        lastBootstrapKeyRef.current = `${clientKey}:${steps.length}`;
        setIsHydrated(false);
        let cancelled = false;
        const bootstrapDraft = async () => {
            dispatchBootstrap({ type: 'bootstrapStart' });
            let resolvedDraftId: string | null = null;
            try {
                if (!selectedClientId) {
                    const initialForm = createInitialProposalFormState();
                    onFormStateChangeRef.current(initialForm, { resetHistory: true });
                    onStepChangeRef.current(0);
                    onSubmittedChangeRef.current(false);
                    onPresentationDeckChangeRef.current(null);
                    onAiSuggestionsChangeRef.current(null);
                    onLastSubmissionSnapshotChangeRef.current(null);
                    markSnapshotSaved(buildSnapshotKey({ form: initialForm, step: 0, clientId: null }));
                }
                else {
                    const allProposals = proposals;
                    if (cancelled) {
                        return;
                    }
                    const draft = allProposals.find((proposal) => proposal.status === 'draft') ?? allProposals[0];
                    const localSnapshotKey = buildSnapshotKey({
                        form: formStateRef.current,
                        step: currentStepRef.current,
                        clientId: selectedClientId,
                    });
                    const hasUnsavedLocalEdits = lastSavedSnapshotRef.current !== null &&
                        localSnapshotKey !== lastSavedSnapshotRef.current;
                    const activeDraftId = draftIdRef.current;
                    if (draft) {
                        resolvedDraftId = draft.id;
                        const shouldPreserveLocalForm = hasUnsavedLocalEdits || Boolean(activeDraftId);
                        if (!shouldPreserveLocalForm) {
                            const mergedForm = mergeProposalForm(draft.formData as Partial<ProposalFormData>);
                            const targetStep = Math.min(draft.stepProgress ?? 0, steps.length - 1);
                            onFormStateChangeRef.current(mergedForm, { resetHistory: true });
                            onStepChangeRef.current(targetStep);
                            onSubmittedChangeRef.current(draft.status === 'ready');
                            onPresentationDeckChangeRef.current(draft.presentationDeck ? { ...draft.presentationDeck, storageUrl: draft.presentationDeck.storageUrl ?? draft.pptUrl ?? null } : null);
                            onAiSuggestionsChangeRef.current(draft.aiSuggestions ?? null);
                            onLastSubmissionSnapshotChangeRef.current(null);
                            markSnapshotSaved(buildSnapshotKey({
                                form: mergedForm,
                                step: targetStep,
                                clientId: draft.clientId ?? selectedClientId,
                            }));
                        }
                    }
                    else {
                        const initialForm = createInitialProposalFormState();
                        onFormStateChangeRef.current(initialForm, { resetHistory: true });
                        onStepChangeRef.current(0);
                        onSubmittedChangeRef.current(false);
                        onPresentationDeckChangeRef.current(null);
                        onAiSuggestionsChangeRef.current(null);
                        onLastSubmissionSnapshotChangeRef.current(null);
                        markSnapshotSaved(buildSnapshotKey({
                            form: initialForm,
                            step: 0,
                            clientId: selectedClientId,
                        }));
                    }
                }
            }
            catch (err: unknown) {
                if (cancelled) {
                    return;
                }
                reportConvexFailure({
                    error: err,
                    context: 'useProposalDrafts:bootstrapDraft',
                    title: 'Unable to start proposal wizard',
                    fallbackMessage: 'Unable to start proposal wizard.',
                });
            }
            finally {
                if (!cancelled) {
                    setIsHydrated(true);
                    dispatchBootstrap({ type: 'bootstrapFinish', draftId: resolvedDraftId });
                }
            }
        };
        void bootstrapDraft();
        return () => {
            cancelled = true;
        };
    }, [isLoadingProposals, isPreviewMode, proposals, selectedClientId, steps.length]);
    const shouldScheduleAutosave = !isPreviewMode &&
        !isBootstrapping &&
        isHydrated &&
        hasPersistableData &&
        Boolean(selectedClientId) &&
        lastSavedSnapshotKey !== currentSnapshotKey;
    const resolvedAutosaveStatus = (() => {
        if (shouldScheduleAutosave && autosaveStatus === 'idle') {
            return 'saving' as const;
        }
        return autosaveStatus;
    })();
    useEffect(() => {
        if (!shouldScheduleAutosave) {
            return;
        }
        const timeoutId = window.setTimeout(() => {
            void saveDraftNow();
        }, 900);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [currentSnapshotKey, shouldScheduleAutosave]);
    return {
        draftId,
        proposals,
        isLoadingProposals,
        isCreatingDraft,
        isBootstrapping,
        proposalsQueryError,
        autosaveStatus: resolvedAutosaveStatus,
        deletingProposalId,
        proposalPendingDelete,
        isDeleteDialogOpen,
        setDraftId,
        setAutosaveStatus,
        refreshProposals,
        ensureDraftId,
        saveDraftNow,
        handleCreateNewProposal,
        handleResumeProposal,
        handleDeleteProposal,
        requestDeleteProposal,
        handleDeleteDialogChange,
        draftIdRef,
        wizardRef,
    };
}
