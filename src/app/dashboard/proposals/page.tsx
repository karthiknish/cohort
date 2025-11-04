'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { createProposalDraft, deleteProposalDraft, listProposals, prepareProposalDeck, submitProposalDraft, updateProposalDraft, type ProposalDraft, type ProposalGammaDeck } from '@/services/proposals'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { ProposalStepContent } from './components/proposal-step-content'
import { ProposalStepIndicator } from './components/proposal-step-indicator'
import { DashboardSkeleton } from '@/app/dashboard/components/dashboard-skeleton'
import { ProposalHistory } from './components/proposal-history'
import { ProposalDeleteDialog } from './components/proposal-delete-dialog'
import { ProposalWizardHeader } from './components/proposal-wizard-header'
import { ProposalSubmittedPanel } from './components/proposal-submitted-panel'
import { ProposalDraftPanel } from './components/proposal-draft-panel'
import { ProposalGenerationOverlay, DeckProgressOverlay, type DeckProgressStage } from './components/deck-progress-overlays'
import {
  proposalSteps,
  createInitialProposalFormState,
  stepErrorPaths,
  validateProposalStep,
  collectStepValidationErrors,
  hasCompletedAnyStepData,
} from './utils/form-steps'

type SubmissionSnapshot = {
  draftId: string
  form: ProposalFormData
  step: number
  clientId: string | null
  clientName: string | null
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }
  return fallback
}

export default function ProposalsPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState<ProposalFormData>(() => createInitialProposalFormState())
  const [submitted, setSubmitted] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [gammaDeck, setGammaDeck] = useState<ProposalGammaDeck | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalDraft[]>([])
  const [isLoadingProposals, setIsLoadingProposals] = useState(false)
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null)
  const [downloadingDeckId, setDownloadingDeckId] = useState<string | null>(null)
  const [deckProgressStage, setDeckProgressStage] = useState<DeckProgressStage | null>(null)
  const [proposalPendingDelete, setProposalPendingDelete] = useState<ProposalDraft | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [lastSubmissionSnapshot, setLastSubmissionSnapshot] = useState<SubmissionSnapshot | null>(null)
  const hydrationRef = useRef(false)
  const draftIdRef = useRef<string | null>(draftId)
  const submittedRef = useRef(submitted)
  const wizardRef = useRef<HTMLDivElement | null>(null)
  const pendingDeckWindowRef = useRef<Window | null>(null)
  const { toast } = useToast()
  const { selectedClient, selectedClientId } = useClientContext()

  const steps = proposalSteps
  const step = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const toggleArrayValue = (path: string[], value: string) => {
    setFormState((prev) => {
      const updated = structuredClone(prev) as typeof prev
      let target: Record<string, unknown> = updated as unknown as Record<string, unknown>
      path.slice(0, -1).forEach((key) => {
        const next = target[key]
        if (next && typeof next === 'object') {
          target = next as Record<string, unknown>
        }
      })
      const field = path[path.length - 1]
      const array = Array.isArray(target[field]) ? (target[field] as string[]) : []
      target[field] = array.includes(value) ? array.filter((item) => item !== value) : [...array, value]
      return updated
    })
    const fieldPath = path.join('.')
    if (path[path.length - 1] === 'objectives' || path[path.length - 1] === 'services') {
      const hasValues = path[path.length - 1] === 'objectives'
        ? formState.goals.objectives.includes(value)
        : formState.scope.services.includes(value)
      if (!hasValues) {
        clearErrors(fieldPath)
      }
    } else {
      clearErrors(fieldPath)
    }
  }

  const updateField = (path: string[], value: string) => {
    setFormState((prev) => {
      const updated = structuredClone(prev) as typeof prev
      let target: Record<string, unknown> = updated as unknown as Record<string, unknown>
      path.slice(0, -1).forEach((key) => {
        const next = target[key]
        if (next && typeof next === 'object') {
          target = next as Record<string, unknown>
        }
      })
      target[path[path.length - 1]] = value
      return updated
    })
    clearErrors(path.join('.'))
  }

  const handleSocialHandleChange = useCallback((handle: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      marketing: {
        ...prev.marketing,
        socialHandles: {
          ...prev.marketing.socialHandles,
          [handle]: value,
        },
      },
    }))
  }, [])

  const handleDeleteProposal = useCallback(async (proposal: ProposalDraft) => {
    if (deletingProposalId && deletingProposalId !== proposal.id) {
      return
    }

    try {
      setDeletingProposalId(proposal.id)
      await deleteProposalDraft(proposal.id)

      setProposals((prev) => prev.filter((candidate) => candidate.id !== proposal.id))

      if (draftId === proposal.id) {
        setDraftId(null)
        setFormState(createInitialProposalFormState())
        setCurrentStep(0)
        setSubmitted(false)
        setGammaDeck(null)
        setAiSuggestions(null)
        setLastSubmissionSnapshot(null)
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
  }, [deletingProposalId, draftId, toast])

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

  const clearErrors = (paths: string | string[]) => {
    const keys = Array.isArray(paths) ? paths : [paths]
    setValidationErrors((prev) => {
      const next = { ...prev }
      keys.forEach((key) => {
        delete next[key]
      })
      return next
    })
  }

  const handleNext = () => {
    if (!validateProposalStep(step.id, formState)) {
      const message = 'Please complete the required fields before continuing.'
      toast({ title: 'Complete required fields', description: message, variant: 'destructive' })
      const stepErrors = collectStepValidationErrors(step.id, formState)
      setValidationErrors((prev) => ({ ...prev, ...stepErrors }))
      return
    }
    clearErrors(stepErrorPaths[step.id])
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1)
    } else {
      void submitProposal()
    }
  }

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleResumeProposal = useCallback((proposal: ProposalDraft) => {
    const mergedForm = mergeProposalForm(proposal.formData as Partial<ProposalFormData>)
    const targetStep = Math.min(proposal.stepProgress ?? 0, steps.length - 1)

    setDraftId(proposal.id)
    setFormState(mergedForm)
    setCurrentStep(targetStep)
    setSubmitted(proposal.status === 'ready')
    setGammaDeck(proposal.gammaDeck ? { ...proposal.gammaDeck, storageUrl: proposal.gammaDeck.storageUrl ?? proposal.pptUrl ?? null } : null)
    setAiSuggestions(proposal.aiSuggestions ?? null)

    if (proposal.status === 'ready') {
      setLastSubmissionSnapshot({
        draftId: proposal.id,
        form: structuredClone(mergedForm) as ProposalFormData,
        step: targetStep,
        clientId: proposal.clientId ?? null,
        clientName: proposal.clientName ?? null,
      })
    } else {
      setLastSubmissionSnapshot(null)
    }

    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [steps])

  useEffect(() => {
    draftIdRef.current = draftId
  }, [draftId])

  useEffect(() => {
    submittedRef.current = submitted
  }, [submitted])

  const summary = useMemo(() => {
    if (submitted && lastSubmissionSnapshot) {
      return structuredClone(lastSubmissionSnapshot.form) as ProposalFormData
    }

    return structuredClone(formState) as ProposalFormData
  }, [formState, lastSubmissionSnapshot, submitted])

  const hasPersistableData = useMemo(() => hasCompletedAnyStepData(formState), [formState])

  const activeProposalIdForDeck = lastSubmissionSnapshot?.draftId ?? draftId
  const deckDownloadUrl = gammaDeck?.storageUrl ?? gammaDeck?.pptxUrl ?? null
  const activeDeckStage: DeckProgressStage = deckProgressStage ?? 'polling'
  const canResumeSubmission = Boolean(
    lastSubmissionSnapshot &&
    !isSubmitting &&
    lastSubmissionSnapshot.draftId &&
    lastSubmissionSnapshot.clientId === (selectedClientId ?? null)
  )

  const refreshProposals = useCallback(async () => {
    if (!selectedClientId) {
      setProposals([])
      setIsLoadingProposals(false)
      setAiSuggestions(null)
      return []
    }

    setIsLoadingProposals(true)
    try {
      const result = await listProposals({ clientId: selectedClientId })
      setProposals(result)

      const activeId = draftIdRef.current
      if (activeId) {
        const active = result.find((proposal) => proposal.id === activeId)
        if (active) {
          setAiSuggestions(active.aiSuggestions ?? null)
        }
      } else if (!submittedRef.current) {
        setAiSuggestions(null)
      }

      return result
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to load proposals')
      toast({ title: 'Unable to load proposals', description: message, variant: 'destructive' })
      return []
    } finally {
      setIsLoadingProposals(false)
    }
  }, [selectedClientId, toast])

  const openDeckUrl = useCallback((url: string, pendingWindow?: Window | null) => {
    if (typeof window === 'undefined') {
      return
    }

    if (pendingWindow && !pendingWindow.closed) {
      pendingWindow.location.href = url
      return
    }

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.target = '_blank'
    anchor.rel = 'noopener'
    anchor.style.display = 'none'

    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }, [])

  const handleDownloadDeck = useCallback(async (proposal: ProposalDraft) => {
    
    const localDeckUrl = proposal.pptUrl ?? proposal.gammaDeck?.storageUrl ?? proposal.gammaDeck?.pptxUrl ?? null
    console.log('[ProposalDownload] URL priority check:', {
      pptUrl: proposal.pptUrl,
      storageUrl: proposal.gammaDeck?.storageUrl,
      pptxUrl: proposal.gammaDeck?.pptxUrl,
      selectedUrl: localDeckUrl
    })

    if (localDeckUrl) {
      console.log('[ProposalDownload] Using existing URL:', localDeckUrl)
      openDeckUrl(localDeckUrl)
      return
    }

    if (downloadingDeckId) {
      console.log('[ProposalDownload] Download already in progress for:', downloadingDeckId)
      toast({
        title: 'Deck already preparing',
        description: 'Please wait for the current deck request to finish.',
      })
      return
    }

    setDeckProgressStage('initializing')

    if (pendingDeckWindowRef.current && !pendingDeckWindowRef.current.closed) {
      pendingDeckWindowRef.current.close()
    }
    pendingDeckWindowRef.current = null

    try {
      console.log('[ProposalDownload] Starting deck preparation for proposal:', proposal.id)
      if (typeof window !== 'undefined') {
        const popup = window.open('about:blank', '_blank')
        if (popup) {
          pendingDeckWindowRef.current = popup
          try {
            popup.document.open()
            popup.document.write(`<!doctype html><title>Preparing presentation...</title><style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; display: flex; min-height: 100vh; align-items: center; justify-content: center; background: #0f172a; color: white; }
              .container { text-align: center; max-width: 360px; padding: 24px; }
              .spinner { width: 48px; height: 48px; border-radius: 9999px; border: 4px solid rgba(255,255,255,0.2); border-top-color: white; animation: spin 1s linear infinite; margin: 0 auto 16px; }
              @keyframes spin { to { transform: rotate(360deg); } }
            </style><body><div class="container"><div class="spinner" aria-hidden="true"></div><h1 style="font-size: 20px; margin-bottom: 12px;">Preparing your deck...</h1><p style="font-size: 14px; line-height: 1.5; opacity: 0.85;">We're generating your presentation and saving a copy to your workspace. Keep this tab open &mdash; the download launches automatically once it's ready.</p></div></body>`)
            popup.document.close()
          } catch (popupError) {
            console.warn('[ProposalDownload] Unable to render popup content', popupError)
          }
        }
      }
      setDeckProgressStage('polling')
      setDownloadingDeckId(proposal.id)
      const result = await prepareProposalDeck(proposal.id)
      console.log('[ProposalDownload] Deck preparation result:', {
        storageUrl: result.storageUrl,
        gammaDeckStorageUrl: result.gammaDeck?.storageUrl,
        gammaDeckPptxUrl: result.gammaDeck?.pptxUrl,
        gammaDeckShareUrl: result.gammaDeck?.shareUrl
      })
      
      const deckUrl = result.storageUrl
        ?? result.gammaDeck?.storageUrl
        ?? result.gammaDeck?.pptxUrl
        ?? result.gammaDeck?.shareUrl
        ?? null

      console.log('[ProposalDownload] Final selected deck URL:', deckUrl)

      if (deckUrl) {
        setDeckProgressStage('launching')
        console.log('[ProposalDownload] Opening deck URL:', deckUrl)
        openDeckUrl(deckUrl, pendingDeckWindowRef.current ?? undefined)
        pendingDeckWindowRef.current = null
      } else {
        setDeckProgressStage('queued')
        if (pendingDeckWindowRef.current && !pendingDeckWindowRef.current.closed) {
          pendingDeckWindowRef.current.close()
        }
        pendingDeckWindowRef.current = null
      }

      if (deckUrl) {
        console.log('[ProposalDownload] Updating proposal state with deck URL:', deckUrl)
        setProposals((prev) =>
          prev.map((item) => {
            if (item.id !== proposal.id) {
              return item
            }
            const nextGammaDeck = result.gammaDeck
              ? { ...result.gammaDeck, storageUrl: deckUrl }
              : item.gammaDeck
                ? { ...item.gammaDeck, storageUrl: deckUrl }
                : null
            return {
              ...item,
              pptUrl: deckUrl,
              gammaDeck: nextGammaDeck,
            }
          })
        )
      }

      console.log('[ProposalDownload] Refreshing proposals list')
      const refreshed = await refreshProposals()
      if (proposal.id === draftId && Array.isArray(refreshed)) {
        const latest = refreshed.find((candidate) => candidate.id === proposal.id)
        if (latest) {
          console.log('[ProposalDownload] Updating gamma deck for active draft')
          setGammaDeck(
            latest.gammaDeck
              ? { ...latest.gammaDeck, storageUrl: latest.pptUrl ?? latest.gammaDeck?.storageUrl ?? null }
              : null
          )
          setAiSuggestions(latest.aiSuggestions ?? null)
        }
      }

      toast({
        title: deckUrl ? 'Deck ready' : 'Deck still generating',
        description: deckUrl
          ? 'We saved the PPT in Firebase storage and opened it in a new tab.'
          : 'The presentation export is still processing. We will save it automatically once it finishes.',
      })
    } catch (error: unknown) {
      setDeckProgressStage('error')
      console.error('[ProposalDownload] Deck preparation failed for proposal:', proposal.id, error)
      const message = getErrorMessage(error, 'Failed to prepare the presentation deck')
      toast({ title: 'Unable to prepare deck', description: message, variant: 'destructive' })
      if (pendingDeckWindowRef.current && !pendingDeckWindowRef.current.closed) {
        pendingDeckWindowRef.current.close()
      }
      pendingDeckWindowRef.current = null
    } finally {
      console.log('[ProposalDownload] Clearing downloading state for proposal:', proposal.id)
      setDownloadingDeckId(null)
      setDeckProgressStage(null)
    }
  }, [downloadingDeckId, draftId, openDeckUrl, refreshProposals, toast])

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
    setGammaDeck(null)
    setAiSuggestions(null)
    setDraftId(lastSubmissionSnapshot.draftId)
    setLastSubmissionSnapshot(null)
    setAutosaveStatus('idle')

    try {
      await updateProposalDraft(lastSubmissionSnapshot.draftId, {
        formData: restoredForm,
        stepProgress: restoredStep,
        status: 'draft',
      })
      await refreshProposals()
      toast({ title: 'Editing restored', description: 'Your previous responses have been reloaded.' })
      wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (error: unknown) {
      console.error('[ProposalWizard] resume snapshot failed', error)
      const message = getErrorMessage(error, 'Failed to reopen proposal for editing')
      toast({ title: 'Unable to resume editing', description: message, variant: 'destructive' })
    }
  }, [lastSubmissionSnapshot, refreshProposals, selectedClientId, steps, toast])

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
      const newDraftId = await createProposalDraft({
        formData: formState,
        stepProgress: currentStep,
        clientId: selectedClientId ?? undefined,
        clientName: selectedClient?.name ?? undefined,
      })
      setDraftId(newDraftId)
      setAutosaveStatus('saved')
      await refreshProposals()
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
  }, [draftId, hasPersistableData, isCreatingDraft, formState, currentStep, selectedClientId, selectedClient, refreshProposals, toast])

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
      const newDraftId = await createProposalDraft({
        formData: initialForm,
        stepProgress: 0,
        status: 'draft',
        clientId: selectedClientId ?? undefined,
        clientName: selectedClient?.name ?? undefined,
      })

      setDraftId(newDraftId)
      setFormState(initialForm)
      setCurrentStep(0)
      setSubmitted(false)
      setGammaDeck(null)
      setAiSuggestions(null)
      setLastSubmissionSnapshot(null)
      setAutosaveStatus('saved')

      await refreshProposals()

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
  }, [isCreatingDraft, refreshProposals, selectedClient, selectedClientId, toast])

  const submitProposal = async () => {
    try {
      setIsSubmitting(true)
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
        await updateProposalDraft(activeDraftId, {
          formData: formState,
          stepProgress: currentStep,
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

      const response = await submitProposalDraft(activeDraftId, 'summary')
      const isReady = response.status === 'ready'
      setSubmitted(isReady)
      setGammaDeck(response.gammaDeck ? { ...response.gammaDeck, storageUrl: response.pptUrl ?? response.gammaDeck.storageUrl ?? null } : null)
      setAiSuggestions(response.aiSuggestions ?? null)
      const storedPptUrl = response.pptUrl ?? response.gammaDeck?.storageUrl ?? null

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

      if (storedPptUrl) {
        toast({
          title: 'Presentation ready',
          description: 'We saved the presentation in Firebase storage for instant download.',
        })
      } else {
        toast({
          title: 'Presentation queued',
          description: 'We are generating the Gamma deck in the background. Check back in a few moments.',
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
      setSubmitted(false)
      setGammaDeck(null)
      setAiSuggestions(null)
      setLastSubmissionSnapshot(null)
      toast({ title: 'Failed to submit proposal', description: message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    hydrationRef.current = false
    let cancelled = false

    const bootstrapDraft = async () => {
      setIsBootstrapping(true)
      try {
        if (!selectedClientId) {
          setDraftId(null)
          setFormState(createInitialProposalFormState())
          setCurrentStep(0)
          setSubmitted(false)
          setGammaDeck(null)
          setAiSuggestions(null)
          setProposals([])
          setLastSubmissionSnapshot(null)
          return
        }

        const allProposals = await refreshProposals()
        if (cancelled) {
          return
        }

        const draft = allProposals.find((proposal) => proposal.status === 'draft') ?? allProposals[0]

        if (draft) {
          setDraftId(draft.id)
          setFormState(mergeProposalForm(draft.formData as Partial<ProposalFormData>))
          setCurrentStep(Math.min(draft.stepProgress ?? 0, steps.length - 1))
          setSubmitted(draft.status === 'ready')
          setGammaDeck(draft.gammaDeck ? { ...draft.gammaDeck, storageUrl: draft.gammaDeck.storageUrl ?? draft.pptUrl ?? null } : null)
          setAiSuggestions(draft.aiSuggestions ?? null)
          setLastSubmissionSnapshot(null)
        } else {
          setDraftId(null)
          setFormState(createInitialProposalFormState())
          setCurrentStep(0)
          setSubmitted(false)
          setGammaDeck(null)
          setAiSuggestions(null)
          setLastSubmissionSnapshot(null)
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
  }, [refreshProposals, selectedClientId, steps, toast])

  useEffect(() => {
    if (!hydrationRef.current || submitted) {
      return
    }

    if (!selectedClientId) {
      return
    }

    if (!draftId && !hasPersistableData) {
      setAutosaveStatus('idle')
    }
  }, [draftId, submitted, selectedClientId, hasPersistableData])

  const renderStepContent = () => (
    <ProposalStepContent
      stepId={step.id}
      formState={formState}
      summary={summary}
      validationErrors={validationErrors}
      onUpdateField={updateField}
      onToggleArrayValue={toggleArrayValue}
      onChangeSocialHandle={handleSocialHandleChange}
    />
  )

  return (
    <div ref={wizardRef} className="space-y-6">
      <ProposalWizardHeader />

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted} />
        </CardHeader>
        <CardContent className="space-y-6">
          {isBootstrapping ? (
            <DashboardSkeleton showStepIndicator />
          ) : submitted ? (
            <ProposalSubmittedPanel
              summary={summary}
              gammaDeck={gammaDeck}
              deckDownloadUrl={deckDownloadUrl}
              activeProposalIdForDeck={activeProposalIdForDeck}
              canResumeSubmission={canResumeSubmission}
              onResumeSubmission={handleContinueEditingFromSnapshot}
              isSubmitting={isSubmitting}
            />
          ) : (
            <ProposalDraftPanel
              draftId={draftId}
              autosaveStatus={autosaveStatus}
              stepContent={renderStepContent()}
              onBack={handleBack}
              onNext={handleNext}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              currentStep={currentStep}
              totalSteps={steps.length}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>

      <ProposalHistory
        proposals={proposals}
        draftId={draftId}
        isLoading={isLoadingProposals}
        deletingProposalId={deletingProposalId}
        onRefresh={() => void refreshProposals()}
        onResume={handleResumeProposal}
        onRequestDelete={requestDeleteProposal}
        isGenerating={isSubmitting}
        downloadingDeckId={downloadingDeckId}
        onDownloadDeck={handleDownloadDeck}
        onCreateNew={handleCreateNewProposal}
        canCreate={Boolean(selectedClientId)}
        isCreating={isCreatingDraft}
      />
      <ProposalDeleteDialog
        open={isDeleteDialogOpen}
        isDeleting={Boolean(deletingProposalId)}
        proposalName={proposalPendingDelete?.clientName ?? proposalPendingDelete?.id ?? null}
        onOpenChange={handleDeleteDialogChange}
        onConfirm={() => {
          if (proposalPendingDelete) {
            void handleDeleteProposal(proposalPendingDelete)
          }
        }}
      />
      <ProposalGenerationOverlay isSubmitting={isSubmitting} />
      <DeckProgressOverlay stage={activeDeckStage} isVisible={Boolean(downloadingDeckId && !isSubmitting)} />
    </div>
  )
}
