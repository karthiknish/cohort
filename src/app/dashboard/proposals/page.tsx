'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createProposalDraft, deleteProposalDraft, listProposals, submitProposalDraft, updateProposalDraft, type ProposalDraft } from '@/services/proposals'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { ProposalStepContent, type ProposalStepId } from './components/proposal-step-content'
import { ProposalStepIndicator, type ProposalStep } from './components/proposal-step-indicator'
import { ProposalHistory } from './components/proposal-history'
import { ProposalDeleteDialog } from './components/proposal-delete-dialog'

const steps: ProposalStep[] = [
  {
    id: 'company',
    title: 'Company Information',
    description: 'Tell us who you are and where you operate.',
  },
  {
    id: 'marketing',
    title: 'Marketing & Advertising',
    description: 'Share how you currently market and advertise.',
  },
  {
    id: 'goals',
    title: 'Business Goals',
    description: 'Help us understand what success looks like.',
  },
  {
    id: 'scope',
    title: 'Scope of Work',
    description: 'Choose the services you need support with.',
  },
  {
    id: 'timelines',
    title: 'Timelines & Priorities',
    description: 'Let us know when you want to get started.',
  },
  {
    id: 'value',
    title: 'Proposal Value',
    description: 'Set expectations around budget and engagement.',
  },
]

const initialFormState: ProposalFormData = {
  company: {
    name: '',
    website: '',
    industry: '',
    size: '',
    locations: '',
  },
  marketing: {
    budget: '',
    platforms: [] as string[],
    adAccounts: 'No',
    socialHandles: {} as Record<string, string>,
  },
  goals: {
    objectives: [] as string[],
    audience: '',
    challenges: [] as string[],
    customChallenge: '',
  },
  scope: {
    services: [] as string[],
    otherService: '',
  },
  timelines: {
    startTime: '',
    upcomingEvents: '',
  },
  value: {
    proposalSize: '',
    engagementType: '',
    additionalNotes: '',
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

export default function ProposalsPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formState, setFormState] = useState(initialFormState)
  const [submitted, setSubmitted] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [isCreatingDraft, setIsCreatingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalDraft[]>([])
  const [isLoadingProposals, setIsLoadingProposals] = useState(false)
  const [proposalPdfCache, setProposalPdfCache] = useState<Record<string, string>>({})
  const [deletingProposalId, setDeletingProposalId] = useState<string | null>(null)
  const [proposalPendingDelete, setProposalPendingDelete] = useState<ProposalDraft | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const hydrationRef = useRef(false)
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wizardRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()
  const { selectedClient, selectedClientId } = useClientContext()

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
      setProposalPdfCache((prev) => {
        const next = { ...prev }
        delete next[proposal.id]
        return next
      })

      if (draftId === proposal.id) {
        setDraftId(null)
        setFormState(initialFormState)
        setCurrentStep(0)
        setSubmitted(false)
        setAiSummary(null)
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

  const validateStep = () => {
    switch (step.id) {
      case 'company':
        return formState.company.name.trim().length > 0 && formState.company.industry.trim().length > 0
      case 'marketing':
        return formState.marketing.budget.trim().length > 0
      case 'goals':
        return formState.goals.objectives.length > 0
      case 'scope':
        return formState.scope.services.length > 0
      case 'timelines':
        return formState.timelines.startTime.trim().length > 0
      case 'value':
        return formState.value.proposalSize.trim().length > 0 && formState.value.engagementType.trim().length > 0
      default:
        return true
    }
  }

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

  const collectStepErrors = (stepId: ProposalStep['id']) => {
    const errors: Record<string, string> = {}
    switch (stepId) {
      case 'company':
        if (!formState.company.name.trim()) {
          errors['company.name'] = 'Company name is required.'
        }
        if (!formState.company.industry.trim()) {
          errors['company.industry'] = 'Industry is required.'
        }
        break
      case 'marketing':
        if (!formState.marketing.budget.trim()) {
          errors['marketing.budget'] = 'Please provide your monthly marketing budget.'
        }
        break
      case 'goals':
        if (formState.goals.objectives.length === 0) {
          errors['goals.objectives'] = 'Select at least one primary goal.'
        }
        break
      case 'scope':
        if (formState.scope.services.length === 0) {
          errors['scope.services'] = 'Select at least one service.'
        }
        break
      case 'timelines':
        if (!formState.timelines.startTime.trim()) {
          errors['timelines.startTime'] = 'Choose a preferred start timeline.'
        }
        break
      case 'value':
        if (!formState.value.proposalSize.trim()) {
          errors['value.proposalSize'] = 'Select an expected proposal value.'
        }
        if (!formState.value.engagementType.trim()) {
          errors['value.engagementType'] = 'Select an engagement preference.'
        }
        break
      default:
        break
    }
    return errors
  }

  const stepErrorPaths: Record<ProposalStep['id'], string[]> = {
    company: ['company.name', 'company.industry'],
    marketing: ['marketing.budget'],
    goals: ['goals.objectives'],
    scope: ['scope.services'],
    timelines: ['timelines.startTime'],
    value: ['value.proposalSize', 'value.engagementType'],
  }

  const handleNext = () => {
    if (!validateStep()) {
      const message = 'Please complete the required fields before continuing.'
      toast({ title: 'Complete required fields', description: message, variant: 'destructive' })
      const stepErrors = collectStepErrors(step.id)
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

  const mapAiSummary = useCallback((proposal: ProposalDraft | null | undefined) => {
    if (!proposal || !proposal.aiInsights) return null
    if (typeof proposal.aiInsights === 'string') return proposal.aiInsights
    if (typeof proposal.aiInsights === 'object' && 'content' in proposal.aiInsights) {
      const maybeContent = (proposal.aiInsights as { content?: string }).content
      return maybeContent ?? null
    }
    return null
  }, [])

  const handleResumeProposal = useCallback((proposal: ProposalDraft) => {
    setDraftId(proposal.id)
    setFormState(mergeProposalForm(proposal.formData as Partial<ProposalFormData>))
    setCurrentStep(Math.min(proposal.stepProgress ?? 0, steps.length - 1))
    setSubmitted(proposal.status === 'ready')
    setAiSummary(mapAiSummary(proposal))
    wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [mapAiSummary])

  const summary = useMemo(() => {
    return {
      ...formState,
    }
  }, [formState])

  const hasPersistableData = useMemo(() => hasCompletedAnyStepData(formState), [formState])

  const refreshProposals = useCallback(async () => {
    if (!selectedClientId) {
      setProposals([])
      setIsLoadingProposals(false)
      return []
    }

    setIsLoadingProposals(true)
    try {
      const result = await listProposals({ clientId: selectedClientId })
      setProposals(result)
      setProposalPdfCache((prev) => {
        const next = { ...prev }
        result.forEach((proposal) => {
          const pdfUrl = proposal.pdfUrl
          if (typeof pdfUrl === 'string') {
            next[proposal.id] = pdfUrl
          }
        })
        return next
      })
      return result
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to load proposals')
      toast({ title: 'Unable to load proposals', description: message, variant: 'destructive' })
      return []
    } finally {
      setIsLoadingProposals(false)
    }
  }, [selectedClientId, toast])

  const submitProposal = async () => {
    if (!draftId) {
      toast({
        title: 'Draft not ready',
        description: 'Please wait for autosave to finish before submitting.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      clearErrors(stepErrorPaths.value)
      const activeDraftId = draftId
      const response = await submitProposalDraft(draftId, 'summary_and_pdf')
      setAiSummary(response.aiInsights ?? null)
      const isReady = response.status === 'ready'
      setSubmitted(isReady)

      const pdfUrl = response.pdfUrl
      if (activeDraftId && typeof pdfUrl === 'string') {
        setProposalPdfCache((prev) => ({ ...prev, [activeDraftId]: pdfUrl }))
      }

      if (isReady) {
        setFormState(initialFormState)
        setCurrentStep(0)
        setDraftId(null)
      }

      if (response.pdfUrl) {
        toast({
          title: 'PDF ready',
          description: 'A downloadable proposal PDF has been generated.',
        })
      }

      if (!isReady) {
        toast({
          title: 'Summary pending',
          description: 'We could not generate an AI summary yet. Please try again in a few minutes.',
        })
      } else {
        toast({
          title: 'Proposal ready',
          description: 'Your AI summary is ready for review.',
        })
      }

      await refreshProposals()
    } catch (err: unknown) {
      console.error('[ProposalWizard] submit failed', err)
      const message = getErrorMessage(err, 'Failed to submit proposal')
      setSubmitted(false)
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
          setFormState(initialFormState)
          setCurrentStep(0)
          setSubmitted(false)
          setAiSummary(null)
          setProposals([])
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
          setAiSummary(mapAiSummary(draft))
        } else {
          setDraftId(null)
          setFormState(initialFormState)
          setCurrentStep(0)
          setSubmitted(false)
          setAiSummary(null)
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
  }, [mapAiSummary, refreshProposals, selectedClientId, toast])

  useEffect(() => {
    if (!hydrationRef.current || submitted) {
      return
    }

    if (!selectedClientId) {
      return
    }

    if (!draftId) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
        autosaveTimeoutRef.current = null
      }

      if (!hasPersistableData || isCreatingDraft) {
        setAutosaveStatus((prev) => (prev === 'idle' ? prev : 'idle'))
        return
      }

      let cancelled = false
      setIsCreatingDraft(true)
      setAutosaveStatus('saving')

      void (async () => {
        try {
          const id = await createProposalDraft({
            formData: formState,
            stepProgress: currentStep,
            clientId: selectedClientId,
            clientName: selectedClient?.name ?? undefined,
          })

          if (cancelled) {
            return
          }

          setDraftId(id)
          setAutosaveStatus('saved')
          await refreshProposals()
        } catch (err: unknown) {
          if (cancelled) {
            return
          }
          console.error('[ProposalWizard] draft creation failed', err)
          setAutosaveStatus('error')
          toast({
            title: 'Unable to start draft',
            description: getErrorMessage(err, 'Failed to create proposal draft'),
            variant: 'destructive',
          })
        } finally {
          if (!cancelled) {
            setIsCreatingDraft(false)
          }
        }
      })()

      return () => {
        cancelled = true
      }
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
      autosaveTimeoutRef.current = null
    }

    setAutosaveStatus('saving')

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateProposalDraft(draftId, {
          formData: formState,
          stepProgress: currentStep,
        })
        setAutosaveStatus('saved')
      } catch (err: unknown) {
        console.error('[ProposalWizard] autosave failed', err)
        setAutosaveStatus('error')
        toast({
          title: 'Autosave failed',
          description: getErrorMessage(err, 'Failed to autosave proposal'),
          variant: 'destructive',
        })
      }
    }, 1500)

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
        autosaveTimeoutRef.current = null
      }
    }
  }, [formState, currentStep, draftId, submitted, toast, hasPersistableData, isCreatingDraft, refreshProposals, selectedClientId, selectedClient])

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
    <div className="space-y-6">
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
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Setting up your proposal workspace...</p>
            </div>
          ) : submitted ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 rounded-md border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
                <Sparkles className="mt-1 h-4 w-4" />
                <div className="space-y-1">
                  <p className="font-semibold">Proposal ready</p>
                  <p className="text-primary/80">Your proposal draft is ready for review. Share with your team or export it for the client.</p>
                </div>
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
                    <CardTitle className="text-base">Next steps</CardTitle>
                    <CardDescription>Use these actions to finalize the proposal.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button>Export summary</Button>
                    <Button variant="outline">Share with client</Button>
                  </CardContent>
                </Card>
              </div>
              {aiSummary && (
                <Card className="border-muted">
                  <CardHeader>
                    <CardTitle className="text-base">AI generated summary</CardTitle>
                    <CardDescription>Ready-to-send executive overview.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                      {aiSummary}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Draft ID: {draftId ?? 'pending...'}</span>
                <span>
                  {autosaveStatus === 'saving' && 'Saving...'}
                  {autosaveStatus === 'saved' && 'All changes saved'}
                  {autosaveStatus === 'idle' && 'Idle'}
                  {autosaveStatus === 'error' && 'Retrying save'}
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
        proposalPdfCache={proposalPdfCache}
        deletingProposalId={deletingProposalId}
        mapAiSummary={mapAiSummary}
        onRefresh={() => void refreshProposals()}
        onResume={handleResumeProposal}
        onRequestDelete={requestDeleteProposal}
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
    </div>
  )
}

function hasCompletedAnyStepData(form: ProposalFormData): boolean {
  if (form.company.name.trim() && form.company.industry.trim()) {
    return true
  }

  if (form.marketing.budget.trim().length > 0) {
    return true
  }

  if (form.goals.objectives.length > 0) {
    return true
  }

  if (form.scope.services.length > 0) {
    return true
  }

  if (form.timelines.startTime.trim().length > 0) {
    return true
  }

  if (form.value.proposalSize.trim().length > 0 && form.value.engagementType.trim().length > 0) {
    return true
  }

  return false
}
