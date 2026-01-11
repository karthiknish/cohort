import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { useQuery, useMutation } from 'convex/react'
import { proposalsApi } from '@/lib/convex-api'
import type { ProposalDraft, ProposalPresentationDeck } from '@/types/proposals'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { formatUserFacingErrorMessage } from '@/lib/user-friendly-error'
import { trackDraftCreated } from '@/services/proposal-analytics'

import { createInitialProposalFormState } from '../utils/form-steps'

function getErrorMessage(error: unknown, fallback: string): string {
    return formatUserFacingErrorMessage(error, fallback)
}

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
    handleResumeProposal: (proposal: ProposalDraft) => void
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

    useEffect(() => {
        draftIdRef.current = draftId
    }, [draftId])

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
            setAutosaveStatus('error')
            toast({
                title: 'Unable to create draft',
                description: getErrorMessage(error, 'Failed to create proposal draft'),
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
            setAutosaveStatus('error')
            toast({
                title: 'Unable to create draft',
                description: getErrorMessage(error, 'Failed to create proposal draft'),
                variant: 'destructive',
            })
        } finally {
            setIsCreatingDraft(false)
        }
    }, [isCreatingDraft, selectedClient, selectedClientId, toast, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange, workspaceId, convexCreateProposal, user?.id])

    const handleResumeProposal = useCallback((proposal: ProposalDraft) => {
        const mergedForm = mergeProposalForm(proposal.formData as Partial<ProposalFormData>)
        const targetStep = Math.min(proposal.stepProgress ?? 0, steps.length - 1)

        setDraftId(proposal.id)
        onFormStateChange(mergedForm)
        onStepChange(targetStep)
        onSubmittedChange(proposal.status === 'ready')
        onPresentationDeckChange(proposal.presentationDeck ? { ...proposal.presentationDeck, storageUrl: proposal.presentationDeck.storageUrl ?? proposal.pptUrl ?? null } : null)
        onAiSuggestionsChange(proposal.aiSuggestions ?? null)

        if (proposal.status === 'ready') {
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
            const message = getErrorMessage(err, 'Failed to delete proposal')
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

    // Bootstrap effect
    useEffect(() => {
        hydrationRef.current = false
        let cancelled = false

        const bootstrapDraft = async () => {
            setIsBootstrapping(true)
            try {
                if (!selectedClientId) {
                    setDraftId(null)
                    onFormStateChange(createInitialProposalFormState())
                    onStepChange(0)
                    onSubmittedChange(false)
                    onPresentationDeckChange(null)
                    onAiSuggestionsChange(null)
                    onLastSubmissionSnapshotChange(null)
                    return
                }

                const allProposals = proposals
                if (cancelled) {
                    return
                }

                const draft = allProposals.find((proposal) => proposal.status === 'draft') ?? allProposals[0]

                if (draft) {
                    setDraftId(draft.id)
                    onFormStateChange(mergeProposalForm(draft.formData as Partial<ProposalFormData>))
                    onStepChange(Math.min(draft.stepProgress ?? 0, steps.length - 1))
                    onSubmittedChange(draft.status === 'ready')
                    onPresentationDeckChange(draft.presentationDeck ? { ...draft.presentationDeck, storageUrl: draft.presentationDeck.storageUrl ?? draft.pptUrl ?? null } : null)
                    onAiSuggestionsChange(draft.aiSuggestions ?? null)
                    onLastSubmissionSnapshotChange(null)
                } else {
                    setDraftId(null)
                    onFormStateChange(createInitialProposalFormState())
                    onStepChange(0)
                    onSubmittedChange(false)
                    onPresentationDeckChange(null)
                    onAiSuggestionsChange(null)
                    onLastSubmissionSnapshotChange(null)
                }
            } catch (err: unknown) {
                if (cancelled) {
                    return
                }
                console.error('[ProposalWizard] bootstrap failed', err)
                toast({ title: 'Unable to start proposal wizard', description: getErrorMessage(err, 'Unable to start proposal wizard'), variant: 'destructive' })
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
    }, [proposals, selectedClientId, steps, toast, onFormStateChange, onStepChange, onSubmittedChange, onPresentationDeckChange, onAiSuggestionsChange, onLastSubmissionSnapshotChange])

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
