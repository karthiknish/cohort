'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle, ChevronLeft, ChevronRight, ClipboardList, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createProposalDraft, listProposals, submitProposalDraft, updateProposalDraft, type ProposalDraft } from '@/services/proposals'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { useToast } from '@/components/ui/use-toast'

type ProposalStep = {
  id: string
  title: string
  description: string
}

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

const marketingPlatforms = ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'TikTok Ads', 'Other']
const socialHandles = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'X / Twitter', 'YouTube']
const goalOptions = ['Lead generation', 'Sales', 'Brand awareness', 'Recruitment', 'Other']
const challenges = ['Low leads', 'High cost per lead', 'Lack of brand awareness', 'Scaling issues', 'Other']
const scopeOptions = [
  'PPC (Google Ads)',
  'Paid Social (Meta/TikTok/LinkedIn)',
  'SEO & Content Marketing',
  'Email Marketing',
  'Creative & Design',
  'Strategy & Consulting',
  'Other',
]
const startTimelineOptions = ['ASAP', 'Within 1 month', 'Within 3 months', 'Flexible']
const proposalValueOptions = ['£2,000 – £5,000', '£5,000 – £10,000', '£10,000+']

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [proposals, setProposals] = useState<ProposalDraft[]>([])
  const [isLoadingProposals, setIsLoadingProposals] = useState(false)
  const hydrationRef = useRef(false)
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wizardRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

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

  const summary = useMemo(() => {
    return {
      ...formState,
    }
  }, [formState])

  const mapAiSummary = useCallback((proposal: ProposalDraft | null | undefined) => {
    if (!proposal || !proposal.aiInsights) return null
    if (typeof proposal.aiInsights === 'string') return proposal.aiInsights
    if (typeof proposal.aiInsights === 'object' && 'content' in proposal.aiInsights) {
      const maybeContent = (proposal.aiInsights as { content?: string }).content
      return maybeContent ?? null
    }
    return null
  }, [])

  const refreshProposals = useCallback(async () => {
    setIsLoadingProposals(true)
    try {
      const result = await listProposals()
      setProposals(result)
      return result
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to load proposals')
      toast({ title: 'Unable to load proposals', description: message, variant: 'destructive' })
      return []
    } finally {
      setIsLoadingProposals(false)
    }
  }, [toast])

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
      const response = await submitProposalDraft(draftId)
      setAiSummary(response.aiInsights ?? null)
      const isReady = response.status === 'ready'
      setSubmitted(isReady)

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
    const bootstrapDraft = async () => {
      setIsBootstrapping(true)
      try {
        const allProposals = await refreshProposals()
        const draft = allProposals.find((proposal) => proposal.status === 'draft') ?? allProposals[0]

        if (draft) {
          setDraftId(draft.id)
          setFormState(mergeProposalForm(draft.formData as Partial<ProposalFormData>))
          setCurrentStep(Math.min(draft.stepProgress ?? 0, steps.length - 1))
          setSubmitted(draft.status === 'ready')
          setAiSummary(mapAiSummary(draft))
        } else {
          const id = await createProposalDraft({ formData: initialFormState, stepProgress: currentStep })
          setDraftId(id)
          await refreshProposals()
        }
      } catch (err: unknown) {
        console.error('[ProposalWizard] bootstrap failed', err)
        toast({ title: 'Unable to start proposal wizard', description: getErrorMessage(err, 'Unable to start proposal wizard'), variant: 'destructive' })
      } finally {
        hydrationRef.current = true
        setIsBootstrapping(false)
      }
    }

    void bootstrapDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!draftId || !hydrationRef.current || submitted) {
      return
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current)
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
      }
    }
  }, [formState, currentStep, draftId, submitted, toast])

  const renderStepContent = () => {
    switch (step.id) {
      case 'company':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Corporation"
                  value={formState.company.name}
                  onChange={(e) => updateField(['company', 'name'], e.target.value)}
                />
                {validationErrors['company.name'] && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors['company.name']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://acme.com"
                  value={formState.company.website}
                  onChange={(e) => updateField(['company', 'website'], e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="industry">Industry / Sector</Label>
                <Input
                  id="industry"
                  placeholder="e.g. SaaS, Retail, Healthcare"
                  value={formState.company.industry}
                  onChange={(e) => updateField(['company', 'industry'], e.target.value)}
                />
                {validationErrors['company.industry'] && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors['company.industry']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Input
                  id="companySize"
                  placeholder="e.g. 25 employees"
                  value={formState.company.size}
                  onChange={(e) => updateField(['company', 'size'], e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="locations">Locations</Label>
              <Textarea
                id="locations"
                placeholder="List primary offices or regions served"
                value={formState.company.locations}
                onChange={(e) => updateField(['company', 'locations'], e.target.value)}
              />
            </div>
          </div>
        )

      case 'marketing':
        return (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="budget">Monthly marketing budget</Label>
                <Input
                  id="budget"
                  placeholder="e.g. £7,500"
                  value={formState.marketing.budget}
                  onChange={(e) => updateField(['marketing', 'budget'], e.target.value)}
                />
                {validationErrors['marketing.budget'] && (
                  <p className="mt-1 text-xs text-destructive">{validationErrors['marketing.budget']}</p>
                )}
              </div>
              <div>
                <Label htmlFor="adAccounts">Existing ad accounts?</Label>
                <Select
                  value={formState.marketing.adAccounts}
                  onValueChange={(value) => updateField(['marketing', 'adAccounts'], value)}
                >
                  <SelectTrigger id="adAccounts">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Current advertising platforms</Label>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {marketingPlatforms.map((platform) => (
                  <label key={platform} className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2">
                    <Checkbox
                      checked={formState.marketing.platforms.includes(platform)}
                      onChange={() => toggleArrayValue(['marketing', 'platforms'], platform)}
                    />
                    <span className="text-sm">{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Social handles</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {socialHandles.map((handle) => (
                  <div key={handle}>
                    <Label className="text-xs font-medium text-muted-foreground">{handle}</Label>
                    <Input
                      placeholder={`https://.../${handle.toLowerCase().split(' ')[0]}`}
                      value={formState.marketing.socialHandles[handle] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
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
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'goals':
        return (
          <div className="space-y-5">
            <div>
              <Label>Primary goals</Label>
              <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {goalOptions.map((goal) => (
                  <label key={goal} className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2">
                    <Checkbox
                      checked={formState.goals.objectives.includes(goal)}
                      onChange={() => toggleArrayValue(['goals', 'objectives'], goal)}
                    />
                    <span className="text-sm">{goal}</span>
                  </label>
                ))}
              </div>
              {validationErrors['goals.objectives'] && (
                <p className="mt-2 text-xs text-destructive">{validationErrors['goals.objectives']}</p>
              )}
            </div>

            <div>
              <Label htmlFor="audience">Target audience</Label>
              <Textarea
                id="audience"
                placeholder="Describe the demographics, regions, or personas you want to reach."
                value={formState.goals.audience}
                onChange={(e) => updateField(['goals', 'audience'], e.target.value)}
              />
            </div>

            <div>
              <Label>Current challenges</Label>
              <p className="mt-1 text-sm text-muted-foreground">Select the obstacles you are facing.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {challenges.map((challenge) => (
                  <label key={challenge} className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2">
                    <Checkbox
                      checked={formState.goals.challenges.includes(challenge)}
                      onChange={() => toggleArrayValue(['goals', 'challenges'], challenge)}
                    />
                    <span className="text-sm">{challenge}</span>
                  </label>
                ))}
              </div>
              {formState.goals.challenges.includes('Other') && (
                <Input
                  className="mt-3"
                  placeholder="Describe other challenges"
                  value={formState.goals.customChallenge}
                  onChange={(e) => updateField(['goals', 'customChallenge'], e.target.value)}
                />
              )}
            </div>
          </div>
        )

      case 'scope':
        return (
          <div className="space-y-5">
            <div>
              <Label>Services required</Label>
              <p className="mt-1 text-sm text-muted-foreground">Pick the specific areas where you need support.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {scopeOptions.map((service) => (
                  <label key={service} className="flex items-center space-x-2 rounded-md border border-muted bg-background px-3 py-2">
                    <Checkbox
                      checked={formState.scope.services.includes(service)}
                      onChange={() => toggleArrayValue(['scope', 'services'], service)}
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
              {validationErrors['scope.services'] && (
                <p className="mt-2 text-xs text-destructive">{validationErrors['scope.services']}</p>
              )}
            </div>
            {formState.scope.services.includes('Other') && (
              <div>
                <Label htmlFor="otherService">Other services</Label>
                <Input
                  id="otherService"
                  placeholder="Describe any other support you need"
                  value={formState.scope.otherService}
                  onChange={(e) => updateField(['scope', 'otherService'], e.target.value)}
                />
              </div>
            )}
          </div>
        )

      case 'timelines':
        return (
          <div className="space-y-5">
            <div>
              <Label>Preferred start timeline</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {startTimelineOptions.map((option) => {
                  const isActive = formState.timelines.startTime === option
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => updateField(['timelines', 'startTime'], option)}
                    >
                      {option}
                    </Button>
                  )
                })}
              </div>
              {validationErrors['timelines.startTime'] && (
                <p className="mt-2 text-xs text-destructive">{validationErrors['timelines.startTime']}</p>
              )}
            </div>

            <div>
              <Label htmlFor="upcomingEvents">Upcoming campaigns or events</Label>
              <Textarea
                id="upcomingEvents"
                placeholder="Share launches, seasonality, or milestones we should plan for."
                value={formState.timelines.upcomingEvents}
                onChange={(e) => updateField(['timelines', 'upcomingEvents'], e.target.value)}
              />
            </div>
          </div>
        )

      case 'value':
        return (
          <div className="space-y-6">
            <div>
              <Label>Expected proposal value</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {proposalValueOptions.map((option) => {
                  const isActive = formState.value.proposalSize === option
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => updateField(['value', 'proposalSize'], option)}
                    >
                      {option}
                    </Button>
                  )
                })}
              </div>
              {validationErrors['value.proposalSize'] && (
                <p className="mt-2 text-xs text-destructive">{validationErrors['value.proposalSize']}</p>
              )}
            </div>

            <div>
              <Label>Engagement preference</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {['One-off project', 'Ongoing monthly support'].map((option) => {
                  const isActive = formState.value.engagementType === option
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      onClick={() => updateField(['value', 'engagementType'], option)}
                    >
                      {option}
                    </Button>
                  )
                })}
              </div>
              {validationErrors['value.engagementType'] && (
                <p className="mt-2 text-xs text-destructive">{validationErrors['value.engagementType']}</p>
              )}
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional notes</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Anything else we should know before drafting your proposal?"
                value={formState.value.additionalNotes}
                onChange={(e) => updateField(['value', 'additionalNotes'], e.target.value)}
              />
            </div>

            <Card className="border-dashed border-muted-foreground/40">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Proposal summary</CardTitle>
                <CardDescription>Review the information before submitting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground">Company</h4>
                  <p className="text-muted-foreground">
                    {summary.company.name || '—'} · {summary.company.industry || '—'} · {summary.company.size || 'Size not provided'}
                  </p>
                  <p className="text-muted-foreground">Website: {summary.company.website || '—'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Marketing</h4>
                  <p className="text-muted-foreground">Budget: {summary.marketing.budget || '—'}</p>
                  <p className="text-muted-foreground">
                    Platforms: {summary.marketing.platforms.length ? summary.marketing.platforms.join(', ') : 'None selected'}
                  </p>
                  <p className="text-muted-foreground">Ad accounts: {summary.marketing.adAccounts}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Goals & Challenges</h4>
                  <p className="text-muted-foreground">
                    Goals: {summary.goals.objectives.length ? summary.goals.objectives.join(', ') : 'Not specified'}
                  </p>
                  <p className="text-muted-foreground">
                    Challenges: {summary.goals.challenges.length ? summary.goals.challenges.join(', ') : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Scope & Timeline</h4>
                  <p className="text-muted-foreground">
                    Services: {summary.scope.services.length ? summary.scope.services.join(', ') : 'Not selected'}
                  </p>
                  <p className="text-muted-foreground">Start: {summary.timelines.startTime || 'No preference'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Value & Engagement</h4>
                  <p className="text-muted-foreground">
                    Expected value: {summary.value.proposalSize || 'Not specified'}
                  </p>
                  <p className="text-muted-foreground">
                    Engagement: {summary.value.engagementType || 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

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
          <div className="flex flex-wrap items-center gap-3">
            {steps.map((item, index) => {
              const isCurrent = index === currentStep
              const isComplete = index < currentStep || submitted
              return (
                <div key={item.id} className="flex items-center gap-2">
                  {index > 0 && <div className="h-px w-6 bg-muted" />}
                  <div className={cn('flex items-center gap-2 rounded-full border px-3 py-1 text-xs',
                    isCurrent ? 'border-primary bg-primary/10 text-primary' : 'border-muted bg-muted text-muted-foreground')
                  }>
                    {isComplete ? <CheckCircle className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    <span>{index + 1}</span>
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
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

      <Card className="border-muted/60 bg-background">
        <CardHeader>
          <CardTitle className="text-lg">Proposal history</CardTitle>
          <CardDescription>Access draft, ready, and sent proposals in one place.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{isLoadingProposals ? 'Refreshing proposals…' : `${proposals.length} total proposals`}</span>
            <Button variant="outline" size="sm" onClick={() => void refreshProposals()} disabled={isLoadingProposals}>
              Refresh
            </Button>
          </div>
          <div className="space-y-3">
            {proposals.length === 0 && !isLoadingProposals ? (
              <div className="rounded-md border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
                No proposals yet. Start by completing the wizard above.
              </div>
            ) : (
              proposals.map((proposal) => {
                const isActiveDraft = proposal.id === draftId
                const resumeDisabled = isActiveDraft && !submitted
                const summary = mapAiSummary(proposal)

                return (
                  <div key={proposal.id} className={cn('rounded-lg border bg-card p-4 transition hover:bg-muted/40', isActiveDraft && 'border-primary')}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {proposal.id}
                          <Badge variant={proposal.status === 'ready' ? 'default' : 'outline'}>{proposal.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Updated {proposal.updatedAt ? new Date(proposal.updatedAt).toLocaleString() : 'recently'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={resumeDisabled}
                          onClick={() => {
                            setDraftId(proposal.id)
                            setFormState(mergeProposalForm(proposal.formData as Partial<ProposalFormData>))
                            setCurrentStep(Math.min(proposal.stepProgress ?? 0, steps.length - 1))
                            setSubmitted(proposal.status === 'ready')
                            setAiSummary(mapAiSummary(proposal))
                            wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                        >
                          {proposal.status === 'ready' ? 'View summary' : 'Resume editing'}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={!proposal.pdfUrl}>
                          Download PDF
                        </Button>
                      </div>
                    </div>
                    {summary && (
                      <div className="mt-3 rounded-md bg-muted/70 p-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">AI summary preview</p>
                        <p className="mt-1 line-clamp-2">{summary}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
