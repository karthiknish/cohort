import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { useQuery, useMutation } from 'convex/react'
import { proposalsApi } from '@/lib/convex-api'
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { trackDraftCreated } from '@/services/proposal-analytics'

import { createInitialProposalFormState } from '../utils/form-steps'

export interface UseProposalDraftsOptions {
    formState: ProposalFormData
    currentStep: number
    hasPersistableData: boolean
    onFormStateChange: (state: ProposalFormData) => void
    onStepChange: (step: number) => void
    onSubmittedChange: (submitted: boolean) => void
    onPresentationDeckChange: (deck: ProposalPresentationDeck | null) => void
    onAiSuggestionsChange: (suggestions: string | null) => void
    onLastSubmissionSnapshotChange: (snapshot: SubmissionSnapshot | null) => void
    steps: Array<{ id: string }>
}

export interface SubmissionSnapshot {
    draftId: string
    form: ProposalFormData
    step: number
    clientId: string | null
    clientName: string | null
}

export interface UseProposalDraftsReturn {
    // State
    draftId: string | null
    proposals: ProposalDraft[]
    isLoadingProposals: boolean
    isCreatingDraft: boolean
    isBootstrapping: boolean
    autosaveStatus: 'idle' | 'saving' | 'saved' | 'error'
    deletingProposalId: string | null
    proposalPendingDelete: ProposalDraft | null
    isDeleteDialogOpen: boolean

    // Actions
    setDraftId: (id: string | null) => void
    setAutosaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void
    refreshProposals: () => Promise<ProposalDraft[]>
    ensureDraftId: () => Promise<string | null>
    handleCreateNewProposal: () => Promise<void>
    handleResumeProposal: (proposal: ProposalDraft, forceEdit?: boolean) => void;
    handleDeleteProposal: (proposal: ProposalDraft) => Promise<void>
    requestDeleteProposal: (proposal: ProposalDraft) => void
    handleDeleteDialogChange: (open: boolean) => void

    // Refs
    draftIdRef: React.MutableRefObject<string | null>
    wizardRef: React.RefObject<HTMLDivElement | null>
}

export function useProposalDrafts(options: UseProposalDraftsOptions): UseProposalDraftsReturn {
    const {
        formState,
        currentStep,
        hasPersistableData,
        onFormStateChange,
        onStepChange,
        onSubmittedChange,
        onPresentationDeckChange,
        onAiSuggestionsChange,
        onLastSubmissionSnapshotChange,
        steps,
    } = options

    const { toast } = useToast()
    const { user } = useAuth()
    const { selectedClient, selectedClientId } = useClientContext()

    const workspaceId = user?.agencyId ?? null

    const convexProposals = useQuery(
        proposalsApi.list,
        !workspaceId || !selectedClientId
            ? 'skip'
            : {
                workspaceId,
                clientId: selectedClientId,
                limit: 100,
            }
    )

    const convexCreateProposal = useMutation(proposalsApi.create)
    const convexRemoveProposal = useMutation(proposalsApi.remove)

    const proposals: ProposalDraft[] = useMemo(() => {
        if (!workspaceId || !selectedClientId) return []
        const rows = convexProposals ?? []

        return rows.map((row: any) => ({
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
        }))
    }, [workspaceId, selectedClientId, convexProposals])

    const [draftId, setDraftId] = useState<string | null>(null)
    const [isCreatingDraft, setIsCreatingDraft] = useState(false)
    const [isBootstrapping, setIsBootstrapping] = useState(true)
    const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null)
    const [proposalPendingDelete, setProposalPendingDelete] = useState<ProposalDraft | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const hydrationRef = useRef(false)
    const draftIdRef = useRef<string | null>(draftId)
    const submittedRef = useRef(false)
    const wizardRef = useRef<HTMLDivElement | null>(null)
    const lastBootstrapKeyRef = useRef<string | null>(null)
    const toastRef = useRef(toast)
    const onFormStateChangeRef = useRef(onFormStateChange)
    const onStepChangeRef = useRef(onStepChange)
    const onSubmittedChangeRef = useRef(onSubmittedChange)
    const onPresentationDeckChangeRef = useRef(onPresentationDeckChange)
    const onAiSuggestionsChangeRef = useRef(onAiSuggestionsChange)
    const onLastSubmissionSnapshotChangeRef = useRef(onLastSubmissionSnapshotChange)

    useEffect(() => {
        draftIdRef.current = draftId
    }, [draftId])

    toastRef.current = toast
    onFormStateChangeRef.current = onFormStateChange
    onStepChangeRef.current = onStepChange
    onSubmittedChangeRef.current = onSubmittedChange
    onPresentationDeckChangeRef.current = onPresentationDeckChange
    onAiSuggestionsChangeRef.current = onAiSuggestionsChange
    onLastSubmissionSnapshotChangeRef.current = onLastSubmissionSnapshotChange

    const isLoadingProposals = Boolean(selectedClientId && workspaceId && convexProposals === undefined)

    const refreshProposals = useCallback(async () => {
        // Proposals are realtime via Convex; keep this for callers.
        return proposals
    }, [proposals])

    const ensureDraftId = useCallback(async () => {
        if (draftId) {
            return draftId
        }

        if (!hasPersistableData) {
            toast({
                title: 'Draft not ready',
                description: 'Fill in the proposal form before generating.',
                variant: 'destructive',
            })
            return null
        }

        if (isCreatingDraft) {
            toast({
                title: 'Preparing proposal',
                description: 'Please wait while we prepare your proposal for generation.',
            })
            return null
        }

        try {
            setIsCreatingDraft(true)
            setAutosaveStatus('saving')
            if (!workspaceId) {
                throw new Error('Workspace is required to create a proposal draft')
            }

            const res = await convexCreateProposal({
                workspaceId,
                ownerId: user?.id ?? null,
                status: 'draft',
                stepProgress: currentStep,
                formData: formState,
                clientId: selectedClientId ?? null,
                clientName: selectedClient?.name ?? null,
            })
            const newDraftId = res.legacyId
            setDraftId(newDraftId)
            setAutosaveStatus('saved')
            return newDraftId
        } catch (error: unknown) {
            logError(error, 'useProposalDrafts:ensureDraftId')
            setAutosaveStatus('error')
            toast({
                title: 'Unable to create draft',
                description: asErrorMessage(error),
                variant: 'destructive',
            })
            return null
        } finally {
            setIsCreatingDraft(false)
        }
    }, [draftId, hasPersistableData, isCreatingDraft, formState, currentStep, selectedClientId, selectedClient, toast, workspaceId, convexCreateProposal, user?.id])

    const handleCreateNewProposal = useCallback(async () => {
        if (!selectedClientId) {
            toast({
                title: 'Select a client',
                description: 'Choose a client from the sidebar before starting a proposal.',
                variant: 'destructive',
            })
            return
        }

        if (isCreatingDraft) {
            toast({
                title: 'Preparing proposal',
                description: 'Please wait for the current draft to finish initializing.',
            })
            return
        }

        try {
            setIsCreatingDraft(true)
            setAutosaveStatus('saving')
            const initialForm = createInitialProposalFormState()
            if (!workspaceId) {
                throw new Error('Workspace is required to create a proposal draft')
            }

            const res = await convexCreateProposal({
                workspaceId,
                ownerId: user?.id ?? null,
                status: 'draft',
                stepProgress: 0,
                formData: initialForm,
                clientId: selectedClientId ?? null,
                clientName: selectedClient?.name ?? null,
            })
            const newDraftId = res.legacyId

            setDraftId(newDraftId)
            onFormStateChange(initialForm)
            onStepChange(0)
            onSubmittedChange(false)
            onPresentationDeckChange(null)
            onAiSuggestionsChange(null)
            onLastSubmissionSnapshotChange(null)
            setAutosaveStatus('saved')

            // Track draft creation for analytics
            if (workspaceId) {
                trackDraftCreated(workspaceId, newDraftId, selectedClientId, selectedClient?.name).catch(console.error)
            }


            toast({
                title: 'New proposal started',
                description: selectedClient?.name
                    ? `Working on a fresh plan for ${selectedClient.name}.`
                    : 'You can begin filling out the proposal steps.',
            })
        } catch (error: unknown) {
            logError(error, 'useProposalDrafts:handleCreateNewProposal')
            setAutosaveStatus('error')
            toast({
                title: 'Unable to create draft',
                description: asErrorMessage(error),
                variant: 'destructive',
            })
        } finally {
            setIsCreatingDraft(false)
        }
    }, [isCreatingDraft, selectedClient, selectedClientId, toast, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange, workspaceId, convexCreateProposal, user?.id])

    const handleResumeProposal = useCallback((proposal: ProposalDraft, forceEdit?: boolean) => {
        const mergedForm = mergeProposalForm(proposal.formData as Partial<ProposalFormData>)
        const targetStep = Math.min(proposal.stepProgress ?? 0, steps.length - 1)

        setDraftId(proposal.id)
        onFormStateChange(mergedForm)
        onStepChange(targetStep)
        onSubmittedChange(forceEdit ? false : proposal.status === 'ready')
        onPresentationDeckChange(proposal.presentationDeck ? { ...proposal.presentationDeck, storageUrl: proposal.presentationDeck.storageUrl ?? proposal.pptUrl ?? null } : null)
        onAiSuggestionsChange(proposal.aiSuggestions ?? null)

        if (proposal.status === 'ready' && !forceEdit) {
            onLastSubmissionSnapshotChange({
                draftId: proposal.id,
                form: structuredClone(mergedForm) as ProposalFormData,
                step: targetStep,
                clientId: proposal.clientId ?? null,
                clientName: proposal.clientName ?? null,
            })
        } else {
            onLastSubmissionSnapshotChange(null)
        }

        wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [steps, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange])

    const handleDeleteProposal = useCallback(async (proposal: ProposalDraft) => {
        if (deletingProposalId && deletingProposalId !== proposal.id) {
            return
        }

        try {
            setDeletingProposalId(proposal.id)
            if (!workspaceId) {
                throw new Error('Workspace is required to delete a proposal')
            }

            await convexRemoveProposal({ workspaceId, legacyId: proposal.id })

            if (draftId === proposal.id) {
                setDraftId(null)
                onFormStateChange(createInitialProposalFormState())
                onStepChange(0)
                onSubmittedChange(false)
                onPresentationDeckChange(null)
                onAiSuggestionsChange(null)
                onLastSubmissionSnapshotChange(null)
            }

            toast({ title: 'Proposal deleted', description: 'The proposal has been removed.' })
        } catch (err: unknown) {
            logError(err, 'useProposalDrafts:handleDeleteProposal')
            const message = asErrorMessage(err)
            toast({ title: 'Unable to delete proposal', description: message, variant: 'destructive' })
        } finally {
            setDeletingProposalId(null)
            setProposalPendingDelete(null)
            setIsDeleteDialogOpen(false)
        }
    }, [deletingProposalId, draftId, toast, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange, workspaceId, convexRemoveProposal])

    const requestDeleteProposal = useCallback((proposal: ProposalDraft) => {
        setProposalPendingDelete(proposal)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleDeleteDialogChange = useCallback((open: boolean) => {
        setIsDeleteDialogOpen(open)
        if (!open) {
            setProposalPendingDelete(null)
        }
    }, [])

    const proposalsKey = useMemo(() => {
        if (!proposals.length) {
            return 'none'
        }
        return proposals
            .map((proposal) => `${proposal.id}:${proposal.updatedAt ?? ''}:${proposal.status ?? ''}`)
            .join('|')
    }, [proposals])

    // Bootstrap effect
    useEffect(() => {
        const bootstrapKey = `${selectedClientId ?? 'none'}:${proposalsKey}:${steps.length}`
        if (bootstrapKey === lastBootstrapKeyRef.current) {
            return
        }
        lastBootstrapKeyRef.current = bootstrapKey
        hydrationRef.current = false
        let cancelled = false

        const bootstrapDraft = async () => {
            setIsBootstrapping(true)
            try {
                if (!selectedClientId) {
                    setDraftId(null)
                    onFormStateChangeRef.current(createInitialProposalFormState())
                    onStepChangeRef.current(0)
                    onSubmittedChangeRef.current(false)
                    onPresentationDeckChangeRef.current(null)
                    onAiSuggestionsChangeRef.current(null)
                    onLastSubmissionSnapshotChangeRef.current(null)
                    return
                }

                const allProposals = proposals
                if (cancelled) {
                    return
                }

                const draft = allProposals.find((proposal) => proposal.status === 'draft') ?? allProposals[0]

                if (draft) {
                    setDraftId(draft.id)
                    onFormStateChangeRef.current(mergeProposalForm(draft.formData as Partial<ProposalFormData>))
                    onStepChangeRef.current(Math.min(draft.stepProgress ?? 0, steps.length - 1))
                    onSubmittedChangeRef.current(draft.status === 'ready')
                    onPresentationDeckChangeRef.current(draft.presentationDeck ? { ...draft.presentationDeck, storageUrl: draft.presentationDeck.storageUrl ?? draft.pptUrl ?? null } : null)
                    onAiSuggestionsChangeRef.current(draft.aiSuggestions ?? null)
                    onLastSubmissionSnapshotChangeRef.current(null)
                } else {
                    setDraftId(null)
                    onFormStateChangeRef.current(createInitialProposalFormState())
                    onStepChangeRef.current(0)
                    onSubmittedChangeRef.current(false)
                    onPresentationDeckChangeRef.current(null)
                    onAiSuggestionsChangeRef.current(null)
                    onLastSubmissionSnapshotChangeRef.current(null)
                }
            } catch (err: unknown) {
                if (cancelled) {
                    return
                }
                logError(err, 'useProposalDrafts:bootstrapDraft')
                console.error('[ProposalWizard] bootstrap failed', err)
                toastRef.current({ title: 'Unable to start proposal wizard', description: asErrorMessage(err), variant: 'destructive' })
            } finally {
                if (!cancelled) {
                    hydrationRef.current = true
                    setIsBootstrapping(false)
                }
            }
        }

        void bootstrapDraft()

        return () => {
            cancelled = true
        }
    }, [proposalsKey, selectedClientId, steps.length])

    return {
        draftId,
        proposals,
        isLoadingProposals,
        isCreatingDraft,
        isBootstrapping,
        autosaveStatus,
        deletingProposalId,
        proposalPendingDelete,
        isDeleteDialogOpen,
        setDraftId,
        setAutosaveStatus,
        refreshProposals,
        ensureDraftId,
        handleCreateNewProposal,
        handleResumeProposal,
        handleDeleteProposal,
        requestDeleteProposal,
        handleDeleteDialogChange,
        draftIdRef,
        wizardRef,
    }
}
