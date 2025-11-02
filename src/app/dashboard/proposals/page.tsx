'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronLeft, ChevronRight, ClipboardList, Loader2, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createProposalDraft, deleteProposalDraft, listProposals, prepareProposalDeck, submitProposalDraft, updateProposalDraft, type ProposalDraft, type ProposalGammaDeck } from '@/services/proposals'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { ProposalStepContent } from './components/proposal-step-content'
import { ProposalStepIndicator } from './components/proposal-step-indicator'
import { DashboardSkeleton } from '@/app/dashboard/components/dashboard-skeleton'
import { ProposalHistory } from './components/proposal-history'
import { ProposalDeleteDialog } from './components/proposal-delete-dialog'
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

type DeckProgressStage = 'initializing' | 'polling' | 'launching' | 'queued' | 'error'

const deckStageMessages: Record<DeckProgressStage, { title: string; description: string }> = {
  initializing: {
    title: 'Starting deck request...',
    description: 'Collecting your proposal details and preparing the presentation export.',
  },
  polling: {
    title: 'Generating slides & saving...',
    description: 'We are exporting the PPT and saving a copy for you in Firebase.',
  },
  launching: {
    title: 'Deck ready',
    description: 'We saved a copy to Firebase and are opening it for you now.',
  },
  queued: {
    title: 'Still processing',
    description: "The presentation export is still processing. We'll save it automatically as soon as it lands.",
  },
  error: {
    title: 'Deck preparation failed',
    description: 'We could not finish the export. Please retry or regenerate the proposal.',
  },
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

function parseAiSuggestionList(value: string | null): string[] {
  if (!value) {
    return []
  }

  return value
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[\.\)])\s*/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 6)
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

  const suggestionItems = useMemo(() => parseAiSuggestionList(aiSuggestions), [aiSuggestions])

  const hasPersistableData = useMemo(() => hasCompletedAnyStepData(formState), [formState])

  const activeProposalIdForDeck = lastSubmissionSnapshot?.draftId ?? draftId
  const deckDownloadUrl = gammaDeck?.storageUrl ?? gammaDeck?.pptxUrl ?? null

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

  const activeDeckStage: DeckProgressStage = deckProgressStage ?? 'polling'
  const activeDeckCopy = deckStageMessages[activeDeckStage]

  return (
    <div ref={wizardRef} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            Proposal Generator
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Build a tailored proposal in minutes</h1>
          <p className="text-muted-foreground">
            Answer a few questions and we&apos;ll assemble a polished, client-ready proposal packed with data and next steps.
          </p>
        </div>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <ProposalStepIndicator steps={steps} currentStep={currentStep} submitted={submitted} />
        </CardHeader>
        <CardContent className="space-y-6">
          {isBootstrapping ? (
            <DashboardSkeleton showStepIndicator />
          ) : submitted ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 rounded-md border border-primary/40 bg-primary/10 p-4 text-sm text-primary md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-4 w-4" />
                  <div className="space-y-1">
                    <p className="font-semibold">Proposal ready</p>
                    <p className="text-primary/80">Your proposal draft is ready for review. Share with your team or export it for the client.</p>
                  </div>
                </div>
                {lastSubmissionSnapshot && !isSubmitting && lastSubmissionSnapshot.draftId && lastSubmissionSnapshot.clientId === (selectedClientId ?? null) ? (
                  <Button variant="outline" onClick={handleContinueEditingFromSnapshot}>
                    Continue editing
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Client snapshot</CardTitle>
                    <CardDescription>Key context for the engagement.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Company:</strong> {summary.company.name || '—'} ({summary.company.industry || '—'})</p>
                    <p><strong>Budget:</strong> {summary.marketing.budget || '—'}</p>
                    <p><strong>Goals:</strong> {summary.goals.objectives.join(', ') || '—'}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Gemini suggestions</CardTitle>
                    <CardDescription>Actionable follow-ups tailored to this client.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {suggestionItems.length ? (
                      <ul className="space-y-2 pl-5">
                        {suggestionItems.map((item, index) => (
                          <li key={index} className="list-disc marker:text-primary">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground/80">
                        Gemini didn&apos;t provide suggestions this time. Re-run the proposal to try again.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              {gammaDeck ? (
                <Card className="border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Presentation deck</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      {deckDownloadUrl && activeProposalIdForDeck ? (
                        <Button variant="secondary" asChild>
                          <Link href={`/dashboard/proposals/${activeProposalIdForDeck}/deck`}>
                            View PPT
                          </Link>
                        </Button>
                      ) : null}
                      {gammaDeck.storageUrl ? (
                        <Button asChild>
                          <a href={gammaDeck.storageUrl} target="_blank" rel="noreferrer">
                            Download PPT
                          </a>
                        </Button>
                      ) : gammaDeck.pptxUrl ? (
                        <Button asChild>
                          <a href={gammaDeck.pptxUrl} target="_blank" rel="noreferrer">
                            Download PPT
                          </a>
                        </Button>
                      ) : null}
                      {gammaDeck.webUrl ? (
                        <Button variant="outline" asChild>
                          <a href={gammaDeck.webUrl} target="_blank" rel="noreferrer">
                            Open online
                          </a>
                        </Button>
                      ) : null}
                      {gammaDeck.shareUrl && gammaDeck.shareUrl !== gammaDeck.webUrl ? (
                        <Button variant="ghost" asChild>
                          <a href={gammaDeck.shareUrl} target="_blank" rel="noreferrer">
                            Share link
                          </a>
                        </Button>
                      ) : null}
                      <Badge variant="outline" className="uppercase tracking-wide">
                        {gammaDeck.status}
                      </Badge>
                    </div>
                    {gammaDeck.instructions ? (
                      <p className="text-xs leading-relaxed">
                        Slide guidance: {gammaDeck.instructions}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Draft ID: {draftId ?? 'pending...'}</span>
                <span>
                  {autosaveStatus === 'saving' && 'Preparing proposal...'}
                  {autosaveStatus === 'saved' && 'Proposal saved'}
                  {autosaveStatus === 'idle' && 'Awaiting generation'}
                  {autosaveStatus === 'error' && 'Sync failed, retrying...'}
                </span>
              </div>
              {renderStepContent()}
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={isFirstStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Step {currentStep + 1} of {steps.length}</Badge>
                  <Button onClick={handleNext} disabled={isSubmitting}>
                    {isLastStep ? 'Generate proposal' : (
                      <span className="flex items-center">
                        {isSubmitting ? 'Submitting…' : 'Next'}{!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </>
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
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">Generating your proposal…</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                We&apos;re compiling the summary and building the deck. This can take up to a minute.
              </p>
            </div>
          </div>
        </div>
      )}
      {downloadingDeckId && !isSubmitting && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="flex flex-col items-center gap-3 text-center">
            {activeDeckStage === 'launching' ? (
              <Sparkles className="h-10 w-10 text-primary" />
            ) : activeDeckStage === 'error' ? (
              <AlertTriangle className="h-10 w-10 text-destructive" />
            ) : (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            )}
            <div>
              <p className="text-lg font-semibold text-foreground">{activeDeckCopy.title}</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{activeDeckCopy.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
