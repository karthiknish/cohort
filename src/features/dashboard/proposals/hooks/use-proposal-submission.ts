import { notifyFailure, notifyInfo, notifySuccess, notifyWarning } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useClientContext } from '@/shared/contexts/client-context';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { useAction, useMutation, useQuery } from 'convex/react';
import { proposalGenerationApi, proposalsApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { getPreviewProposals } from '@/lib/preview-data';
import type { ProposalFormData } from '@/lib/proposals';
import { trackAiGenerationCompleted, trackAiGenerationFailed, trackAiGenerationStarted, trackProposalSubmitted, } from '@/services/proposal-analytics';
import { refreshProposalDraft } from '@/services/proposals';
import type { ProposalPresentationDeck } from '@/types/proposals';
import { createInitialProposalFormState, stepErrorPaths } from '../utils/form-steps';
import type { SubmissionSnapshot } from './use-proposal-drafts';
import type { FormStateUpdateOptions } from './use-proposal-wizard';
import { resolveProposalDeckUrls, useProposalArtifactUrls, } from './use-proposal-artifact-urls';
type ProposalDeckState = {
    status: string;
    pptUrl: string | null;
    presentationDeck: ProposalPresentationDeck | null;
    aiSuggestions: string | null;
};
function toProposalDeckState(value: unknown): ProposalDeckState {
    const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
    return {
        status: typeof record?.status === 'string' ? record.status : 'draft',
        pptUrl: typeof record?.pptUrl === 'string'
            ? record.pptUrl
            : record?.pptUrl === null
                ? null
                : null,
        presentationDeck: record?.presentationDeck && typeof record.presentationDeck === 'object'
            ? (record.presentationDeck as ProposalPresentationDeck)
            : null,
        aiSuggestions: typeof record?.aiSuggestions === 'string'
            ? record.aiSuggestions
            : record?.aiSuggestions === null
                ? null
                : null,
    };
}
function getDeckWarnings(deck: ProposalPresentationDeck | null | undefined): string[] | undefined {
    if (!Array.isArray(deck?.warnings))
        return undefined;
    return deck.warnings.filter((warning): warning is string => typeof warning === 'string');
}
function getDeckError(deck: ProposalPresentationDeck | null | undefined): string | undefined {
    return typeof deck?.error === 'string' ? deck.error : undefined;
}
export function getPreviewProposalSimulation(clientId: string | null) {
    const scopedProposals = getPreviewProposals(clientId);
    const fallbackProposals = getPreviewProposals(null).filter((proposal) => proposal.clientId !== clientId);
    const previewProposal = [...scopedProposals, ...fallbackProposals].find((proposal) => proposal.presentationDeck);
    if (!previewProposal?.presentationDeck) {
        return null;
    }
    return {
        aiSuggestions: previewProposal.aiSuggestions ?? null,
        draftId: previewProposal.id,
        presentationDeck: {
            ...previewProposal.presentationDeck,
            storageUrl: previewProposal.presentationDeck.storageUrl
                ?? previewProposal.pptUrl
                ?? previewProposal.presentationDeck.pptxUrl
                ?? null,
        },
    };
}
export interface UseProposalSubmissionOptions {
    draftId: string | null;
    formState: ProposalFormData;
    currentStep: number;
    ensureDraftId: () => Promise<string | null>;
    refreshProposals: () => Promise<unknown>;
    setDraftId: (id: string | null) => void;
    setFormState: (state: ProposalFormData | ((prev: ProposalFormData) => ProposalFormData), options?: FormStateUpdateOptions) => void;
    setCurrentStep: (step: number) => void;
    setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
    clearErrors: (paths: string | string[]) => void;
    steps: Array<{
        id: string;
    }>;
}
export interface UseProposalSubmissionReturn {
    // State
    isSubmitting: boolean;
    isRecheckingDeck: boolean;
    submitted: boolean;
    isPresentationReady: boolean;
    presentationDeck: ProposalPresentationDeck | null;
    aiSuggestions: string | null;
    lastSubmissionSnapshot: SubmissionSnapshot | null;
    // Actions
    setSubmitted: (submitted: boolean) => void;
    setPresentationDeck: (deck: ProposalPresentationDeck | null) => void;
    setAiSuggestions: (suggestions: string | null) => void;
    setLastSubmissionSnapshot: (snapshot: SubmissionSnapshot | null) => void;
    submitProposal: () => Promise<void>;
    handleContinueEditingFromSnapshot: () => Promise<void>;
    handleRecheckDeck: () => Promise<void>;
    // Computed
    canResumeSubmission: boolean;
    deckDownloadUrl: string | null;
    activeProposalIdForDeck: string | null;
}
export function useProposalSubmission(options: UseProposalSubmissionOptions): UseProposalSubmissionReturn {
    const { draftId, formState, currentStep, ensureDraftId, refreshProposals, setDraftId, setFormState, setCurrentStep, setAutosaveStatus, clearErrors, steps, } = options;
    const { user, getIdToken, isSyncing, authError } = useAuth();
    const { selectedClient, selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const workspaceId = user?.agencyId ?? null;
    const convexUpdateProposal = useMutation(proposalsApi.update);
    const generateProposalDeck = useAction(proposalGenerationApi.generateFromProposal);
    const canQuery = Boolean(workspaceId && draftId && !isSyncing && !authError);
    const activeConvexProposal = useQuery(proposalsApi.getByLegacyId, !canQuery
        ? 'skip'
        : {
            workspaceId: workspaceId!,
            legacyId: draftId!,
        });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isPresentationReady, setIsPresentationReady] = useState(false);
    const [presentationDeck, setPresentationDeck] = useState<ProposalPresentationDeck | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
    const [lastSubmissionSnapshot, setLastSubmissionSnapshot] = useState<SubmissionSnapshot | null>(null);
    const [isRecheckingDeck, setIsRecheckingDeck] = useState(false);
    const submittedRef = useRef(submitted);
    useEffect(() => {
        submittedRef.current = submitted;
    }, [submitted]);
    const activeProposalIdForDeck = lastSubmissionSnapshot?.draftId ?? draftId;
    const artifactUrls = useProposalArtifactUrls(!isPreviewMode ? workspaceId : null, activeProposalIdForDeck ?? null);
    const { pptUrl: deckDownloadUrl } = resolveProposalDeckUrls({
        artifactUrls,
        presentationDeck,
    });
    const canResumeSubmission = Boolean(lastSubmissionSnapshot &&
        !isSubmitting &&
        lastSubmissionSnapshot.draftId &&
        lastSubmissionSnapshot.clientId === (selectedClientId ?? null));
    const submitProposal = async () => {
        try {
            setIsSubmitting(true);
            setIsPresentationReady(false);
            clearErrors(stepErrorPaths.value);
            setAiSuggestions(null);
            if (isPreviewMode) {
                const previewSimulation = getPreviewProposalSimulation(selectedClientId ?? null);
                if (!previewSimulation) {
                    notifyFailure({
                        title: 'Preview result unavailable',
                        message: 'Sample proposal output is not available right now.',
                    });
                    return;
                }
                const formSnapshot = structuredClone(formState) as ProposalFormData;
                setLastSubmissionSnapshot({
                    draftId: previewSimulation.draftId,
                    form: formSnapshot,
                    step: currentStep,
                    clientId: selectedClientId ?? null,
                    clientName: selectedClient?.name ?? null,
                });
                setSubmitted(true);
                setPresentationDeck(previewSimulation.presentationDeck);
                setAiSuggestions(previewSimulation.aiSuggestions);
                setIsPresentationReady(true);
                setFormState(createInitialProposalFormState(), { resetHistory: true });
                setCurrentStep(0);
                setDraftId(null);
                setAutosaveStatus('idle');
                notifyInfo({
                    title: 'Preview proposal ready',
                    message: 'Showing a simulated proposal result using sample deck output.',
                });
                return;
            }
            let activeDraftId = draftId;
            if (!activeDraftId) {
                activeDraftId = await ensureDraftId();
                if (!activeDraftId) {
                    setIsSubmitting(false);
                    return;
                }
            }
            try {
                setAutosaveStatus('saving');
                if (!workspaceId) {
                    throw new Error('Workspace is required to save a proposal');
                }
                const timestamp = Date.now();
                await convexUpdateProposal({
                    workspaceId,
                    legacyId: activeDraftId,
                    formData: formState,
                    stepProgress: currentStep,
                    updatedAtMs: timestamp,
                    lastAutosaveAtMs: timestamp,
                });
                setAutosaveStatus('saved');
            }
            catch (updateError: unknown) {
                setAutosaveStatus('error');
                reportConvexFailure({
                    error: updateError,
                    context: 'useProposalSubmission:submitProposal:saveDraft',
                    title: 'Unable to save proposal',
                    fallbackMessage: 'Unable to save proposal',
                });
                setIsSubmitting(false);
                return;
            }
            setLastSubmissionSnapshot(null);
            // Trigger server-side AI + deck generation.
            if (workspaceId) {
                generateProposalDeck({ workspaceId, legacyId: activeDraftId }).catch((error: unknown) => {
                    reportConvexFailure({
                        error: error,
                        context: 'useProposalSubmission:submitProposal:generate',
                        title: 'Deck generation failed to start',
                        fallbackMessage: 'Deck generation failed to start',
                    });
                });
            }
            // Track AI generation start for analytics
            const aiStartTime = Date.now();
            if (workspaceId) {
                trackAiGenerationStarted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch((e: unknown) => logError(e, 'useProposalSubmission:trackAiGenerationStarted'));
            }
            // AI generation happens server-side (Convex + integrations).
            // Here we just poll Convex for status changes.
            let response = toProposalDeckState(activeConvexProposal);
            const aiDuration = Date.now() - aiStartTime;
            // Increased polling timeout to match server-side timeout (5 minutes)
            const maxAttempts = 75; // 75 attempts × 4 seconds = 5 minutes
            const pollIntervalMs = 4000;
            const pollAiStatus = async (attempt: number): Promise<void> => {
                const latest = await refreshProposalDraft(activeDraftId, {
                    workspaceId: workspaceId ?? '',
                    convexToken: (await getIdToken()) ?? '',
                });
                response = toProposalDeckState(latest);
                // Accept ready, partial_success, or failed as terminal states
                if (latest.status === 'ready' || latest.status === 'partial_success' || latest.status === 'failed') {
                    return;
                }
                if (attempt < maxAttempts - 1) {
                    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
                    return pollAiStatus(attempt + 1);
                }
            };
            await pollAiStatus(0);
            const isReady = response?.status === 'ready' || response?.status === 'partial_success';
            const isFailed = response?.status === 'failed';
            // Track AI generation completion or failure
            if (isReady || isFailed) {
                if (workspaceId) {
                    if (isReady) {
                        trackAiGenerationCompleted(workspaceId, activeDraftId, aiDuration, selectedClientId, selectedClient?.name).catch((e: unknown) => logError(e, 'useProposalSubmission:trackAiGenerationCompleted'));
                        trackProposalSubmitted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch((e: unknown) => logError(e, 'useProposalSubmission:trackProposalSubmitted'));
                    }
                    else {
                        trackAiGenerationFailed(workspaceId, activeDraftId, 'Generation failed', selectedClientId, selectedClient?.name).catch((e: unknown) => logError(e, 'useProposalSubmission:trackAiGenerationFailed'));
                    }
                }
            }
            else {
                if (workspaceId) {
                    trackAiGenerationFailed(workspaceId, activeDraftId, 'AI generation incomplete', selectedClientId, selectedClient?.name).catch((e: unknown) => logError(e, 'useProposalSubmission:trackAiGenerationIncomplete'));
                }
            }
            // Poll for presentation deck if AI summary is ready but deck isn't
            let finalPptUrl = response.pptUrl ?? response.presentationDeck?.storageUrl ?? null;
            let finalDeck = response.presentationDeck ?? null;
            if (isReady && !finalPptUrl) {
                // Poll for the presentation deck (it generates it asynchronously)
                const maxAttempts = 30; // Poll for up to ~60 seconds
                const pollInterval = 2000; // 2 seconds between attempts
                const pollDeckUrl = async (attempt: number): Promise<void> => {
                    if (attempt > 0) {
                        await new Promise((resolve) => setTimeout(resolve, pollInterval));
                    }
                    try {
                        const refreshedProposal = await refreshProposalDraft(activeDraftId, {
                            workspaceId: workspaceId ?? '',
                            convexToken: (await getIdToken()) ?? '',
                        });
                        const deckUrl = refreshedProposal.pptUrl ?? refreshedProposal.presentationDeck?.storageUrl ?? null;
                        if (deckUrl) {
                            finalPptUrl = deckUrl;
                            finalDeck = refreshedProposal.presentationDeck ?? null;
                            console.log('[ProposalWizard] Presentation deck ready after polling:', deckUrl);
                            return;
                        }
                    }
                    catch (pollError) {
                        logError(pollError, 'useProposalSubmission:pollDeckUrl');
                        // Continue polling even if one request fails
                    }
                    if (attempt < maxAttempts - 1) {
                        return pollDeckUrl(attempt + 1);
                    }
                };
                await pollDeckUrl(0);
            }
            // Mark presentation as ready (either we have it or we've polled enough)
            setIsPresentationReady(true);
            setSubmitted(isReady);
            setPresentationDeck(finalDeck ? { ...finalDeck, storageUrl: finalPptUrl ?? finalDeck.storageUrl ?? null } : null);
            setAiSuggestions(response.aiSuggestions ?? null);
            // Collect warnings from the response
            const deckWarnings = getDeckWarnings(response.presentationDeck);
            const hasPdfWarning = deckWarnings?.some(w => w.toLowerCase().includes('pdf'));
            const isPartialSuccess = response?.status === 'partial_success';
            if (isReady) {
                const formSnapshot = structuredClone(formState) as ProposalFormData;
                setLastSubmissionSnapshot({
                    draftId: activeDraftId,
                    form: formSnapshot,
                    step: currentStep,
                    clientId: selectedClientId ?? null,
                    clientName: selectedClient?.name ?? null,
                });
            }
            if (isReady) {
                // Keep form state, draftId, and currentStep intact so users can
                // edit, regenerate, or browse version history without losing context.
                // The submitted panel shows because `submitted` is true, not because
                // the form was reset. Form state is only cleared when the user
                // explicitly starts a new proposal.
                setAutosaveStatus('saved');
            }
            // Consolidated single toast: combine PPT + AI plan status into one notification
            // to avoid showing multiple toasts for the same submission.
            if (isFailed) {
                notifyFailure({
                    title: 'Generation failed',
                    message: 'The presentation could not be generated. Please try again or contact support if the issue persists.',
                });
            }
            else if (finalPptUrl && (isPartialSuccess || hasPdfWarning)) {
                notifyWarning({
                    title: 'Presentation ready (PPTX only)',
                    message: isReady
                        ? 'The PowerPoint and AI recommendations are ready. PDF generation had an issue, but you can download the PPTX.'
                        : 'The PowerPoint is ready for download (PDF had an issue). AI recommendations are still processing — check back shortly.',
                });
            }
            else if (finalPptUrl && isReady) {
                notifySuccess({
                    title: 'Proposal ready',
                    message: 'Your AI-generated recommendations and presentation are ready for download.',
                });
            }
            else if (finalPptUrl && !isReady) {
                notifySuccess({
                    title: 'Presentation ready',
                    message: 'The presentation is ready for download. AI recommendations are still processing — check back shortly.',
                });
            }
            else if (!isReady) {
                notifySuccess({
                    title: 'AI plan pending',
                    message: 'We could not finish the AI proposal yet. Please try again in a few minutes.',
                });
            }
            else {
                notifySuccess({
                    title: 'Proposal ready',
                    message: 'Your AI-generated recommendations are ready for review.',
                });
            }
            await refreshProposals();
        }
        catch (err: unknown) {
            logError(err, 'useProposalSubmission:submitProposal');
            const message = asErrorMessage(err);
            // Track AI generation failure
            if (draftId) {
                if (workspaceId) {
                    trackAiGenerationFailed(workspaceId, draftId, message, selectedClientId, selectedClient?.name).catch((e: unknown) => logError(e, 'useProposalSubmission:trackAiGenerationFailedOnSubmit'));
                }
            }
            setSubmitted(false);
            setPresentationDeck(null);
            setAiSuggestions(null);
            setLastSubmissionSnapshot(null);
            notifyFailure({
                title: 'Failed to submit proposal',
                message: message,
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleContinueEditingFromSnapshot = async () => {
        if (!lastSubmissionSnapshot) {
            return;
        }
        if (lastSubmissionSnapshot.clientId && lastSubmissionSnapshot.clientId !== selectedClientId) {
            notifyFailure({
                title: 'Switch back to original client',
                message: 'Return to the client associated with this proposal to continue editing.',
            });
            return;
        }
        const restoredForm = structuredClone(lastSubmissionSnapshot.form) as ProposalFormData;
        const restoredStep = Math.min(lastSubmissionSnapshot.step, steps.length - 1);
        setFormState(restoredForm, { resetHistory: true });
        setCurrentStep(restoredStep);
        setSubmitted(false);
        setPresentationDeck(null);
        setAiSuggestions(null);
        setDraftId(isPreviewMode ? null : lastSubmissionSnapshot.draftId);
        setLastSubmissionSnapshot(null);
        setAutosaveStatus('idle');
        if (isPreviewMode) {
            notifyInfo({ title: 'Editing restored', message: 'Your preview responses have been reloaded.' });
            return;
        }
        try {
            if (!workspaceId) {
                throw new Error('Workspace is required to save a proposal');
            }
            const timestamp = Date.now();
            await convexUpdateProposal({
                workspaceId,
                legacyId: lastSubmissionSnapshot.draftId,
                formData: restoredForm,
                stepProgress: restoredStep,
                status: 'draft',
                updatedAtMs: timestamp,
                lastAutosaveAtMs: timestamp,
            });
            await refreshProposals();
            notifySuccess({ title: 'Editing restored', message: 'Your previous responses have been reloaded.' });
        }
        catch (error: unknown) {
            logError(error, 'useProposalSubmission:handleContinueEditingFromSnapshot');
            const message = asErrorMessage(error);
            notifyFailure({
                title: 'Unable to resume editing',
                message: message,
            });
        }
    };
    const handleRecheckDeck = async () => {
        const proposalId = lastSubmissionSnapshot?.draftId ?? draftId;
        if (!proposalId) {
            notifyFailure({
                title: 'No proposal selected',
                message: 'Cannot check deck status without an active proposal.',
            });
            return;
        }
        setIsRecheckingDeck(true);
        try {
            const activeProposal = toProposalDeckState(activeConvexProposal);
            const convexDeckUrl = activeProposal.pptUrl ?? null;
            const proposalStatus = activeProposal.status ?? 'unknown';
            // Handle already ready proposals (including partial_success)
            if (convexDeckUrl && (proposalStatus === 'ready' || proposalStatus === 'partial_success')) {
                setPresentationDeck(activeProposal.presentationDeck
                    ? {
                        ...activeProposal.presentationDeck,
                        storageUrl: activeProposal.presentationDeck.storageUrl ?? convexDeckUrl,
                    }
                    : presentationDeck
                        ? { ...presentationDeck, storageUrl: convexDeckUrl, status: proposalStatus }
                        : null);
                setIsPresentationReady(true);
                setSubmitted(true);
                await refreshProposals();
                const deckWarnings = getDeckWarnings(activeProposal.presentationDeck);
                if (deckWarnings?.length) {
                    notifyWarning({
                        title: 'Presentation ready with warnings',
                        message: deckWarnings.join('. '),
                    });
                }
                else {
                    notifySuccess({
                        title: 'Presentation ready!',
                        message: 'Your slide deck has been generated and is ready for download.',
                    });
                }
                return;
            }
            // Handle failed proposals
            if (proposalStatus === 'failed') {
                const deckError = getDeckError(activeProposal.presentationDeck);
                notifyFailure({
                    title: 'Generation failed',
                    message: deckError,
                });
                return;
            }
            // If still in progress, poll for completion
            const maxPollAttempts = 30;
            const pollInterval = 3000;
            const pollRecheckDeck = async (attempt: number): Promise<void> => {
                const currentProposal = await refreshProposalDraft(proposalId, {
                    workspaceId: workspaceId ?? '',
                    convexToken: (await getIdToken()) ?? '',
                });
                const newDeckUrl = currentProposal.pptUrl ?? currentProposal.presentationDeck?.storageUrl ?? null;
                const newStatus = currentProposal.status;
                if (newDeckUrl && (newStatus === 'ready' || newStatus === 'partial_success')) {
                    setPresentationDeck(currentProposal.presentationDeck
                        ? { ...currentProposal.presentationDeck, storageUrl: newDeckUrl }
                        : presentationDeck
                            ? { ...presentationDeck, storageUrl: newDeckUrl, status: newStatus }
                            : null);
                    setIsPresentationReady(true);
                    setSubmitted(true);
                    await refreshProposals();
                    const deckWarnings = getDeckWarnings(currentProposal.presentationDeck);
                    if (deckWarnings?.length) {
                        notifyWarning({
                            title: 'Presentation ready with warnings',
                            message: deckWarnings.join('. '),
                        });
                    }
                    else {
                        notifySuccess({
                            title: 'Presentation ready!',
                            message: 'Your slide deck has been generated and is ready for download.',
                        });
                    }
                    return;
                }
                if (newStatus === 'failed') {
                    const deckError = getDeckError(currentProposal.presentationDeck);
                    notifyFailure({
                        title: 'Generation failed',
                        message: deckError,
                    });
                    return;
                }
                if (attempt < maxPollAttempts - 1) {
                    await new Promise((resolve) => setTimeout(resolve, pollInterval));
                    return pollRecheckDeck(attempt + 1);
                }
                notifySuccess({
                    title: 'Still processing',
                    message: 'The presentation is still being generated. Please try again in a few moments.',
                });
            };
            await pollRecheckDeck(0);
        }
        catch (error: unknown) {
            logError(error, 'useProposalSubmission:handleRecheckDeck');
            const message = asErrorMessage(error);
            notifyFailure({
                title: 'Unable to check status',
                message: message,
            });
        }
        finally {
            setIsRecheckingDeck(false);
        }
    };
    return {
        isSubmitting,
        isRecheckingDeck,
        submitted,
        isPresentationReady,
        presentationDeck,
        aiSuggestions,
        lastSubmissionSnapshot,
        setSubmitted,
        setPresentationDeck,
        setAiSuggestions,
        setLastSubmissionSnapshot,
        submitProposal,
        handleContinueEditingFromSnapshot,
        handleRecheckDeck,
        canResumeSubmission,
        deckDownloadUrl,
        activeProposalIdForDeck,
    };
}
