import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { useAction, useMutation, useQuery } from 'convex/react'
import { proposalGenerationApi, proposalsApi } from '@/lib/convex-api'
import { refreshProposalDraft } from '@/services/proposals'
import type { ProposalPresentationDeck } from '@/types/proposals'
import type { ProposalFormData } from '@/lib/proposals'
import { asErrorMessage, logError } from '@/lib/convex-errors'
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
    const { user, getIdToken, isSyncing, authError } = useAuth()
    const { selectedClient, selectedClientId } = useClientContext()

    const workspaceId = user?.agencyId ?? null
    const convexUpdateProposal = useMutation(proposalsApi.update)
    const generateProposalDeck = useAction(proposalGenerationApi.generateFromProposal)

    const canQuery = Boolean(workspaceId && draftId && !isSyncing && !authError)
    const activeConvexProposal = useQuery(
        proposalsApi.getByLegacyId,
        !canQuery
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
                logError(updateError, 'useProposalSubmission:submitProposal:saveDraft')
                toast({
                    title: 'Unable to save proposal',
                    description: asErrorMessage(updateError),
                    variant: 'destructive',
                })
                setIsSubmitting(false)
                return
            }

            setLastSubmissionSnapshot(null)

            // Trigger server-side AI + deck generation.
            if (workspaceId) {
                generateProposalDeck({ workspaceId, legacyId: activeDraftId }).catch((error) => {
                    logError(error, 'useProposalSubmission:submitProposal:generate')
                    console.error('[ProposalWizard] generation failed', error)
                })
            }

            // Track AI generation start for analytics
            const aiStartTime = Date.now()
            if (workspaceId) {
                trackAiGenerationStarted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch(console.error)
            }

            // AI generation happens server-side (Convex + integrations).
            // Here we just poll Convex for status changes.
            let response = activeConvexProposal
            const aiDuration = Date.now() - aiStartTime

            // Increased polling timeout to match server-side timeout (5 minutes)
            const maxAttempts = 75 // 75 attempts × 4 seconds = 5 minutes
            const pollIntervalMs = 4000

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const latest = await refreshProposalDraft(activeDraftId, {
                    workspaceId: workspaceId ?? '',
                            convexToken: (await getIdToken()) ?? '',

                })
                response = latest as any

                // Accept ready, partial_success, or failed as terminal states
                if (latest.status === 'ready' || latest.status === 'partial_success' || latest.status === 'failed') {
                    break
                }

                await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
            }

            const isReady = response?.status === 'ready' || response?.status === 'partial_success'
            const isFailed = response?.status === 'failed'

            // Track AI generation completion or failure
            if (isReady || isFailed) {
                if (workspaceId) {
                    if (isReady) {
                        trackAiGenerationCompleted(workspaceId, activeDraftId, aiDuration, selectedClientId, selectedClient?.name).catch(console.error)
                        trackProposalSubmitted(workspaceId, activeDraftId, selectedClientId, selectedClient?.name).catch(console.error)
                    } else {
                        trackAiGenerationFailed(workspaceId, activeDraftId, 'Generation failed', selectedClientId, selectedClient?.name).catch(console.error)
                    }
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
                // Poll for the presentation deck (it generates it asynchronously)
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

            // Collect warnings from the response
            const deckWarnings = (response.presentationDeck as any)?.warnings as string[] | undefined
            const hasPdfWarning = deckWarnings?.some(w => w.toLowerCase().includes('pdf'))
            const isPartialSuccess = response?.status === 'partial_success'

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
                if (isPartialSuccess || hasPdfWarning) {
                    toast({
                        title: 'Presentation ready (PPTX only)',
                        description: 'The PowerPoint presentation is ready for download. PDF generation encountered an issue, but you can still download the PPTX file.',
                        variant: 'default',
                    })
                } else {
                    toast({
                        title: 'Presentation ready',
                        description: 'We saved the presentation for instant download.',
                    })
                }
            } else if (isFailed) {
                toast({
                    title: 'Generation failed',
                    description: 'The presentation could not be generated. Please try again or contact support if the issue persists.',
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: 'Presentation still generating',
                    description: 'The presentation is taking longer than expected. You can download it from the proposal history once ready.',
                })
            }

            if (!isReady && !isFailed) {
                toast({
                    title: 'AI plan pending',
                    description: 'We could not finish the AI proposal yet. Please try again in a few minutes.',
                })
            } else if (!isFailed) {
                toast({
                    title: 'Proposal ready',
                    description: 'Your AI-generated recommendations are ready for review.',
                })
            }

            await refreshProposals()
        } catch (err: unknown) {
            logError(err, 'useProposalSubmission:submitProposal')
            console.error('[ProposalWizard] submit failed', err)
            const message = asErrorMessage(err)

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
    }, [draftId, formState, currentStep, ensureDraftId, refreshProposals, selectedClientId, selectedClient, toast, clearErrors, setAutosaveStatus, setDraftId, setFormState, setCurrentStep, workspaceId, convexUpdateProposal, generateProposalDeck])

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
            logError(error, 'useProposalSubmission:handleContinueEditingFromSnapshot')
            console.error('[ProposalWizard] resume snapshot failed', error)
            const message = asErrorMessage(error)
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
            const proposalStatus = activeConvexProposal?.status ?? 'unknown'

            // Handle already ready proposals (including partial_success)
            if (convexDeckUrl && (proposalStatus === 'ready' || proposalStatus === 'partial_success')) {
                setPresentationDeck(
                    activeConvexProposal?.presentationDeck
                        ? {
                            ...(activeConvexProposal.presentationDeck as any),
                            storageUrl: (activeConvexProposal.presentationDeck as any)?.storageUrl ?? convexDeckUrl,
                        }
                        : presentationDeck
                            ? { ...presentationDeck, storageUrl: convexDeckUrl, status: proposalStatus }
                            : null
                )
                setIsPresentationReady(true)
                setSubmitted(true)
                await refreshProposals()

                const deckWarnings = (activeConvexProposal?.presentationDeck as any)?.warnings as string[] | undefined
                if (deckWarnings?.length) {
                    toast({
                        title: 'Presentation ready with warnings',
                        description: deckWarnings.join('. '),
                        variant: 'default',
                    })
                } else {
                    toast({
                        title: 'Presentation ready!',
                        description: 'Your slide deck has been generated and is ready for download.',
                    })
                }
                return
            }

            // Handle failed proposals
            if (proposalStatus === 'failed') {
                const deckError = (activeConvexProposal?.presentationDeck as any)?.error as string | undefined
                toast({
                    title: 'Generation failed',
                    description: deckError || 'The presentation generation failed. Please try again.',
                    variant: 'destructive',
                })
                return
            }

            // If still in progress, poll for completion
            const maxPollAttempts = 30
            const pollInterval = 3000

            for (let attempt = 0; attempt < maxPollAttempts; attempt++) {
                // Check current state
                const currentProposal = await refreshProposalDraft(proposalId, {
                    workspaceId: workspaceId ?? '',
                    convexToken: (await getIdToken()) ?? '',
                })

                const newDeckUrl = currentProposal.pptUrl ?? currentProposal.presentationDeck?.storageUrl ?? null
                const newStatus = currentProposal.status

                // Check for terminal states
                if (newDeckUrl && (newStatus === 'ready' || newStatus === 'partial_success')) {
                    setPresentationDeck(
                        currentProposal.presentationDeck
                            ? { ...currentProposal.presentationDeck, storageUrl: newDeckUrl }
                            : presentationDeck
                                ? { ...presentationDeck, storageUrl: newDeckUrl, status: newStatus }
                                : null
                    )
                    setIsPresentationReady(true)
                    setSubmitted(true)
                    await refreshProposals()

                    const deckWarnings = (currentProposal.presentationDeck as any)?.warnings as string[] | undefined
                    if (deckWarnings?.length) {
                        toast({
                            title: 'Presentation ready with warnings',
                            description: deckWarnings.join('. '),
                            variant: 'default',
                        })
                    } else {
                        toast({
                            title: 'Presentation ready!',
                            description: 'Your slide deck has been generated and is ready for download.',
                        })
                    }
                    return
                }

                if (newStatus === 'failed') {
                    const deckError = (currentProposal.presentationDeck as any)?.error as string | undefined
                    toast({
                        title: 'Generation failed',
                        description: deckError || 'The presentation generation failed. Please try again.',
                        variant: 'destructive',
                    })
                    return
                }

                // If not done yet, wait before next poll (skip waiting on last iteration)
                if (attempt < maxPollAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval))
                }
            }

            // Still pending after all polls
            toast({
                title: 'Still processing',
                description: 'The presentation is still being generated. Please try again in a few moments.',
            })
        } catch (error: unknown) {
            logError(error, 'useProposalSubmission:handleRecheckDeck')
            console.error('[ProposalWizard] recheck deck failed', error)
            const message = asErrorMessage(error)
            toast({ title: 'Unable to check status', description: message, variant: 'destructive' })
        } finally {
            setIsRecheckingDeck(false)
        }
    }, [draftId, lastSubmissionSnapshot, presentationDeck, refreshProposals, toast, activeConvexProposal, workspaceId, getIdToken])

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
