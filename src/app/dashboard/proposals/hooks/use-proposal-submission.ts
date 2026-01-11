import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { useMutation, useQuery } from 'convex/react'
import { proposalsApi } from '@/lib/convex-api'
import { refreshProposalDraft } from '@/services/proposals'
import type { ProposalPresentationDeck } from '@/types/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { formatUserFacingErrorMessage } from '@/lib/user-friendly-error'
import {
    trackProposalSubmitted,
    trackAiGenerationStarted,
    trackAiGenerationCompleted,
    trackAiGenerationFailed,
    trackDeckGenerationStarted,
    trackDeckGenerationCompleted,
    trackDeckGenerationFailed,
} from '@/services/proposal-analytics'
import { createInitialProposalFormState, stepErrorPaths } from '../utils/form-steps'
import type { SubmissionSnapshot } from './use-proposal-drafts'

function getErrorMessage(error: unknown, fallback: string): string {
    return formatUserFacingErrorMessage(error, fallback)
}

export interface UseProposalSubmissionOptions {
    draftId: string | null
    formState: ProposalFormData
    currentStep: number
    ensureDraftId: () => Promise<string | null>
    refreshProposals: () => Promise<unknown>
    setDraftId: (id: string | null) => void
    setFormState: (state: ProposalFormData | ((prev: ProposalFormData) => ProposalFormData)) => void
    setCurrentStep: (step: number) => void
    setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void
    clearErrors: (paths: string | string[]) => void
    steps: Array<{ id: string }>
}

export interface UseProposalSubmissionReturn {
    // State
    isSubmitting: boolean
    submitted: boolean
    isPresentationReady: boolean
    presentationDeck: ProposalPresentationDeck | null
    aiSuggestions: string | null
    lastSubmissionSnapshot: SubmissionSnapshot | null

    // Actions
    setSubmitted: (submitted: boolean) => void
    setPresentationDeck: (deck: ProposalPresentationDeck | null) => void
    setAiSuggestions: (suggestions: string | null) => void
    setLastSubmissionSnapshot: (snapshot: SubmissionSnapshot | null) => void
    submitProposal: () => Promise<void>
    handleContinueEditingFromSnapshot: () => Promise<void>
    handleRecheckDeck: () => Promise<void>

    // Computed
    canResumeSubmission: boolean
    deckDownloadUrl: string | null
    activeProposalIdForDeck: string | null
}

export function useProposalSubmission(options: UseProposalSubmissionOptions): UseProposalSubmissionReturn {
    const {
        draftId,
        formState,
        currentStep,
        ensureDraftId,
        refreshProposals,
        setDraftId,
        setFormState,
        setCurrentStep,
        setAutosaveStatus,
        clearErrors,
        steps,
    } = options

    const { toast } = useToast()
    const { user, getIdToken } = useAuth()
    const { selectedClient, selectedClientId } = useClientContext()

    const workspaceId = user?.agencyId ?? null
    const convexUpdateProposal = useMutation(proposalsApi.update)

    const activeConvexProposal = useQuery(
        proposalsApi.getByLegacyId,
        !workspaceId || !draftId
            ? 'skip'
            : {
                workspaceId,
                legacyId: draftId,
            }
    )

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [isPresentationReady, setIsPresentationReady] = useState(false)
    const [presentationDeck, setPresentationDeck] = useState<ProposalPresentationDeck | null>(null)
    const [aiSuggestions, setAiSuggestions] = useState<string | null>(null)
    const [lastSubmissionSnapshot, setLastSubmissionSnapshot] = useState<SubmissionSnapshot | null>(null)
    const [isRecheckingDeck, setIsRecheckingDeck] = useState(false)

    const submittedRef = useRef(submitted)
    submittedRef.current = submitted

    const activeProposalIdForDeck = lastSubmissionSnapshot?.draftId ?? draftId
    const deckDownloadUrl = presentationDeck?.storageUrl ?? presentationDeck?.pptxUrl ?? null
    const canResumeSubmission = Boolean(
        lastSubmissionSnapshot &&
        !isSubmitting &&
        lastSubmissionSnapshot.draftId &&
        lastSubmissionSnapshot.clientId === (selectedClientId ?? null)
    )

    const submitProposal = useCallback(async () => {
        try {
            setIsSubmitting(true)
            setIsPresentationReady(false)
            clearErrors(stepErrorPaths.value)
            setAiSuggestions(null)
            let activeDraftId = draftId
            if (!activeDraftId) {
                activeDraftId = await ensureDraftId()
                if (!activeDraftId) {
                    setIsSubmitting(false)
                    return
                }
            }

            try {
                setAutosaveStatus('saving')
                if (!workspaceId) {
                    throw new Error('Workspace is required to save a proposal')
                }

                const timestamp = Date.now()
                await convexUpdateProposal({
                    workspaceId,
                    legacyId: activeDraftId,
                    formData: formState,
                    stepProgress: currentStep,
                    updatedAtMs: timestamp,
                    lastAutosaveAtMs: timestamp,
                })
                setAutosaveStatus('saved')
            } catch (updateError: unknown) {
                console.error('[ProposalWizard] submit sync failed', updateError)
                setAutosaveStatus('error')
                toast({
                    title: 'Unable to save proposal',
                    description: getErrorMessage(updateError, 'Failed to sync latest changes before generation'),
                    variant: 'destructive',
                })
                setIsSubmitting(false)
                return
            }

            setLastSubmissionSnapshot(null)

            // Track AI generation start for analytics
            const aiStartTime = Date.now()
            if (workspaceId) {
                trackAiGenerationStarted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch(console.error)
            }

            // AI generation happens server-side (Convex + integrations).
            // Here we just poll Convex for status changes.
            let response = activeConvexProposal
            const aiDuration = Date.now() - aiStartTime

            const maxAttempts = 30
            const pollIntervalMs = 2000

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const latest = await refreshProposalDraft(activeDraftId, {
                    workspaceId: workspaceId ?? '',
                            convexToken: (await getIdToken()) ?? '',

                })
                response = latest as any

                if (latest.status === 'ready' || latest.status === 'in_progress') {
                    break
                }

                await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
            }

            const isReady = response?.status === 'ready'

            // Track AI generation completion or failure
            if (isReady) {
                if (workspaceId) {
                    trackAiGenerationCompleted(workspaceId, activeDraftId, aiDuration, selectedClientId, selectedClient?.name).catch(console.error)
                    trackProposalSubmitted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch(console.error)
                }
            } else {
                if (workspaceId) {
                    trackAiGenerationFailed(workspaceId, activeDraftId, 'AI generation incomplete', selectedClientId, selectedClient?.name).catch(console.error)
                }
            }

            // Poll for presentation deck if AI summary is ready but deck isn't
            let finalPptUrl = response.pptUrl ?? response.presentationDeck?.storageUrl ?? null
            let finalDeck = response.presentationDeck ?? null

            if (isReady && !finalPptUrl) {
                // Poll for the presentation deck (Gamma generates it asynchronously)
                const maxAttempts = 30 // Poll for up to ~60 seconds
                const pollInterval = 2000 // 2 seconds between attempts

                for (let attempt = 0; attempt < maxAttempts; attempt++) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval))

                    try {
                        const refreshedProposal = await refreshProposalDraft(activeDraftId, {
                            workspaceId: workspaceId ?? '',
                    convexToken: (await getIdToken()) ?? '',

                        })
                        const deckUrl = refreshedProposal.pptUrl ?? refreshedProposal.presentationDeck?.storageUrl ?? null

                        if (deckUrl) {
                            finalPptUrl = deckUrl
                            finalDeck = refreshedProposal.presentationDeck ?? null
                            console.log('[ProposalWizard] Presentation deck ready after polling:', deckUrl)
                            break
                        }
                    } catch (pollError) {
                        console.warn('[ProposalWizard] Polling for deck failed:', pollError)
                        // Continue polling even if one request fails
                    }
                }
            }

            // Mark presentation as ready (either we have it or we've polled enough)
            setIsPresentationReady(true)

            setSubmitted(isReady)
            setPresentationDeck(finalDeck ? { ...finalDeck, storageUrl: finalPptUrl ?? finalDeck.storageUrl ?? null } : null)
            setAiSuggestions(response.aiSuggestions ?? null)

            if (isReady) {
                const formSnapshot = structuredClone(formState) as ProposalFormData
                setLastSubmissionSnapshot({
                    draftId: activeDraftId,
                    form: formSnapshot,
                    step: currentStep,
                    clientId: selectedClientId ?? null,
                    clientName: selectedClient?.name ?? null,
                })
            }

            if (isReady) {
                setFormState(createInitialProposalFormState())
                setCurrentStep(0)
                setDraftId(null)
                setAutosaveStatus('idle')
            }

            if (finalPptUrl) {
                toast({
                    title: 'Presentation ready',
                    description: 'We saved the presentation for instant download.',
                })
            } else {
                toast({
                    title: 'Presentation still generating',
                    description: 'The presentation is taking longer than expected. You can download it from the proposal history once ready.',
                })
            }

            if (!isReady) {
                toast({
                    title: 'AI plan pending',
                    description: 'We could not finish the AI proposal yet. Please try again in a few minutes.',
                })
            } else {
                toast({
                    title: 'Proposal ready',
                    description: 'Your AI-generated recommendations are ready for review.',
                })
            }

            await refreshProposals()
        } catch (err: unknown) {
            console.error('[ProposalWizard] submit failed', err)
            const message = getErrorMessage(err, 'Failed to submit proposal')

            // Track AI generation failure
            if (draftId) {
                if (workspaceId) {
                    trackAiGenerationFailed(workspaceId, draftId, message, selectedClientId, selectedClient?.name).catch(console.error)
                }
            }

            setSubmitted(false)
            setPresentationDeck(null)
            setAiSuggestions(null)
            setLastSubmissionSnapshot(null)
            toast({ title: 'Failed to submit proposal', description: message, variant: 'destructive' })
        } finally {
            setIsSubmitting(false)
        }
    }, [draftId, formState, currentStep, ensureDraftId, refreshProposals, selectedClientId, selectedClient, toast, clearErrors, setAutosaveStatus, setDraftId, setFormState, setCurrentStep, workspaceId, convexUpdateProposal])

    const handleContinueEditingFromSnapshot = useCallback(async () => {
        if (!lastSubmissionSnapshot) {
            return
        }

        if (lastSubmissionSnapshot.clientId && lastSubmissionSnapshot.clientId !== selectedClientId) {
            toast({
                title: 'Switch back to original client',
                description: 'Return to the client associated with this proposal to continue editing.',
                variant: 'destructive',
            })
            return
        }

        const restoredForm = structuredClone(lastSubmissionSnapshot.form) as ProposalFormData
        const restoredStep = Math.min(lastSubmissionSnapshot.step, steps.length - 1)

        setFormState(restoredForm)
        setCurrentStep(restoredStep)
        setSubmitted(false)
        setPresentationDeck(null)
        setAiSuggestions(null)
        setDraftId(lastSubmissionSnapshot.draftId)
        setLastSubmissionSnapshot(null)
        setAutosaveStatus('idle')

        try {
            if (!workspaceId) {
                throw new Error('Workspace is required to save a proposal')
            }

            const timestamp = Date.now()
            await convexUpdateProposal({
                workspaceId,
                legacyId: lastSubmissionSnapshot.draftId,
                formData: restoredForm,
                stepProgress: restoredStep,
                status: 'draft',
                updatedAtMs: timestamp,
                lastAutosaveAtMs: timestamp,
            })
            await refreshProposals()
            toast({ title: 'Editing restored', description: 'Your previous responses have been reloaded.' })
        } catch (error: unknown) {
            console.error('[ProposalWizard] resume snapshot failed', error)
            const message = getErrorMessage(error, 'Failed to reopen proposal for editing')
            toast({ title: 'Unable to resume editing', description: message, variant: 'destructive' })
        }
    }, [lastSubmissionSnapshot, refreshProposals, selectedClientId, steps, toast, setFormState, setCurrentStep, setDraftId, setAutosaveStatus, workspaceId, convexUpdateProposal])

    const handleRecheckDeck = useCallback(async () => {
        const proposalId = lastSubmissionSnapshot?.draftId ?? draftId
        if (!proposalId) {
            toast({
                title: 'No proposal selected',
                description: 'Cannot check deck status without an active proposal.',
                variant: 'destructive',
            })
            return
        }

        setIsRecheckingDeck(true)
        try {
            const convexDeckUrl = activeConvexProposal?.pptUrl ?? null

            if (convexDeckUrl) {
                setPresentationDeck(
                    activeConvexProposal?.presentationDeck
                        ? {
                            ...(activeConvexProposal.presentationDeck as any),
                            storageUrl: (activeConvexProposal.presentationDeck as any)?.storageUrl ?? convexDeckUrl,
                        }
                        : presentationDeck
                            ? { ...presentationDeck, storageUrl: convexDeckUrl, status: 'ready' }
                            : null
                )
                await refreshProposals()
                toast({
                    title: 'Presentation ready!',
                    description: 'Your slide deck has been generated and is ready for download.',
                })
                return
            }

            // If not in Firebase yet, try to trigger Gamma to check/generate
            const result = await refreshProposalDraft(proposalId, {
                workspaceId: workspaceId ?? '',
                convexToken: (await getIdToken()) ?? '',
            })
            const newDeckUrl = result.pptUrl ?? result.presentationDeck?.storageUrl ?? null

            if (newDeckUrl) {
                setPresentationDeck(
                    result.presentationDeck
                        ? { ...result.presentationDeck, storageUrl: newDeckUrl }
                        : presentationDeck
                            ? { ...presentationDeck, storageUrl: newDeckUrl, status: 'ready' }
                            : null
                )
                await refreshProposals()
                toast({
                    title: 'Presentation ready!',
                    description: 'Your slide deck has been generated and saved.',
                })
            } else {
                // Still pending
                toast({
                    title: 'Still processing',
                    description: 'The presentation is still being generated. Please try again in a few moments.',
                })
            }
        } catch (error: unknown) {
            console.error('[ProposalWizard] recheck deck failed', error)
            const message = getErrorMessage(error, 'Failed to check presentation status')
            toast({ title: 'Unable to check status', description: message, variant: 'destructive' })
        } finally {
            setIsRecheckingDeck(false)
        }
    }, [draftId, lastSubmissionSnapshot, presentationDeck, refreshProposals, toast, activeConvexProposal])

    return {
        isSubmitting,
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
    }
}
