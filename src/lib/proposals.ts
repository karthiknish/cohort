const serverTimestamp = () => new Date().toISOString()
import { z } from 'zod'

export const proposalFormSchema = z.object({
  company: z.object({
    name: z.string().default(''),
    website: z.string().default(''),
    industry: z.string().default(''),
    size: z.string().default(''),
    locations: z.string().default(''),
  }),
  marketing: z.object({
    budget: z.string().default(''),
    platforms: z.array(z.string()).default([]),
    adAccounts: z.enum(['Yes', 'No']).default('No'),
    socialHandles: z.record(z.string(), z.string()).default({}),
  }),
  goals: z.object({
    objectives: z.array(z.string()).default([]),
    audience: z.string().default(''),
    challenges: z.array(z.string()).default([]),
    customChallenge: z.string().default(''),
  }),
  scope: z.object({
    services: z.array(z.string()).default([]),
    otherService: z.string().default(''),
  }),
  timelines: z.object({
    startTime: z.string().default(''),
    upcomingEvents: z.string().default(''),
  }),
  value: z.object({
    proposalSize: z.string().default(''),
    engagementType: z.string().default(''),
    additionalNotes: z.string().default(''),
    presentationTheme: z.string().default(''),
  }),
})

export type ProposalFormData = z.infer<typeof proposalFormSchema>

const proposalFormInputSchema: z.ZodType<Partial<ProposalFormData>> = z
  .object({})
  .passthrough()
  .transform((value) => value as Partial<ProposalFormData>)
  .catch({})

const DEFAULT_PROPOSAL_FORM: ProposalFormData = {
  company: {
    name: '',
    website: '',
    industry: '',
    size: '',
    locations: '',
  },
  marketing: {
    budget: '',
    platforms: [],
    adAccounts: 'No',
    socialHandles: {},
  },
  goals: {
    objectives: [],
    audience: '',
    challenges: [],
    customChallenge: '',
  },
  scope: {
    services: [],
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
    presentationTheme: '',
  },
}

export const proposalDraftSchema = z.object({
  formData: proposalFormInputSchema.optional().default({}),
  stepProgress: z.number().int().min(0).max(10).default(0),
  status: z.enum(['draft', 'in_progress', 'ready', 'sent']).default('draft'),
  clientId: z.string().trim().min(1).max(120).optional(),
  clientName: z.string().trim().min(1).max(200).optional(),
})

export type ProposalDraftInput = z.infer<typeof proposalDraftSchema>

export const proposalDraftUpdateSchema = z.object({
  formData: proposalFormInputSchema.optional(),
  stepProgress: z.number().int().min(0).max(10).optional(),
  status: z.enum(['draft', 'in_progress', 'ready', 'sent']).optional(),
  clientId: z.string().trim().min(1).max(120).optional(),
  clientName: z.string().trim().min(1).max(200).optional(),
})

export type ProposalDraftUpdateInput = z.infer<typeof proposalDraftUpdateSchema>

export function createDefaultProposalForm(): ProposalFormData {
  return {
    company: { ...DEFAULT_PROPOSAL_FORM.company },
    marketing: {
      ...DEFAULT_PROPOSAL_FORM.marketing,
      platforms: [...DEFAULT_PROPOSAL_FORM.marketing.platforms],
      socialHandles: { ...DEFAULT_PROPOSAL_FORM.marketing.socialHandles },
    },
    goals: {
      ...DEFAULT_PROPOSAL_FORM.goals,
      objectives: [...DEFAULT_PROPOSAL_FORM.goals.objectives],
      challenges: [...DEFAULT_PROPOSAL_FORM.goals.challenges],
    },
    scope: {
      ...DEFAULT_PROPOSAL_FORM.scope,
      services: [...DEFAULT_PROPOSAL_FORM.scope.services],
    },
    timelines: { ...DEFAULT_PROPOSAL_FORM.timelines },
    value: { ...DEFAULT_PROPOSAL_FORM.value },
  }
}

export function mergeProposalForm(partial?: Partial<ProposalFormData> | null): ProposalFormData {
  const defaults = createDefaultProposalForm()
  if (!partial) {
    return defaults
  }

  return {
    company: { ...defaults.company, ...partial.company },
    marketing: {
      ...defaults.marketing,
      ...partial.marketing,
      socialHandles: {
        ...defaults.marketing.socialHandles,
        ...(partial.marketing?.socialHandles ?? {}),
      },
    },
    goals: { ...defaults.goals, ...partial.goals },
    scope: { ...defaults.scope, ...partial.scope },
    timelines: { ...defaults.timelines, ...partial.timelines },
    value: { ...defaults.value, ...partial.value },
  }
}

export function buildProposalDocument(input: ProposalDraftInput, userId: string, timestampValue: unknown = serverTimestamp()) {
  const baseData = proposalDraftSchema.parse(input)
  const mergedForm = mergeProposalForm(baseData.formData)

  return {
    ownerId: userId,
    status: baseData.status,
    stepProgress: baseData.stepProgress,
    formData: mergedForm,
    clientId: baseData.clientId ?? null,
    clientName: baseData.clientName ?? null,
    aiInsights: null,
    aiSuggestions: null,
    pdfUrl: null,
    pptUrl: null,
    gammaDeck: null,
    createdAt: timestampValue,
    updatedAt: timestampValue,
    lastAutosaveAt: timestampValue,
  }
}

export function sanitizeProposalUpdate(data: ProposalDraftUpdateInput, timestampValue: unknown = serverTimestamp()) {
  const parsed = proposalDraftUpdateSchema.parse(data)
  const updates: Record<string, unknown> = {
    updatedAt: timestampValue,
    lastAutosaveAt: timestampValue,
  }

  if (parsed.status) {
    updates.status = parsed.status
  }

  if (typeof parsed.stepProgress === 'number') {
    updates.stepProgress = parsed.stepProgress
  }

  if (parsed.formData && typeof parsed.formData === 'object' && !Array.isArray(parsed.formData)) {
    const assignUpdates = (value: unknown, path: string) => {
      if (value === undefined) return
      updates[path] = value
    }

    const walk = (value: unknown, path: string) => {
      if (value === undefined) return
      if (Array.isArray(value) || value === null || typeof value !== 'object') {
        assignUpdates(value, path)
        return
      }

      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) {
        assignUpdates(value, path)
        return
      }

      entries.forEach(([childKey, childValue]) => {
        walk(childValue, `${path}.${childKey}`)
      })
    }

    Object.entries(parsed.formData as Record<string, unknown>).forEach(([key, value]) => {
      const path = `formData.${key}`
      walk(value, path)
    })
  }

  if (typeof parsed.clientId === 'string') {
    updates.clientId = parsed.clientId
  }

  if (typeof parsed.clientName === 'string') {
    updates.clientName = parsed.clientName
  }

  return updates
}

type TimestampLike = Date | { toDate: () => Date } | { toMillis: () => number } | string | number | null | undefined

interface FirestoreProposalDoc {
  id?: string | null
  status?: string | null
  stepProgress?: number | null
  formData?: Partial<ProposalFormData> | null
  aiInsights?: unknown
  pdfUrl?: string | null
  pptUrl?: string | null
  createdAt?: TimestampLike
  updatedAt?: TimestampLike
  lastAutosaveAt?: TimestampLike
  gammaDeck?: unknown
}

export function serializeProposalDoc(doc: FirestoreProposalDoc | null | undefined) {
  if (!doc) return null
  const formData = mergeProposalForm(doc.formData ?? undefined)
  return {
    id: doc.id ?? null,
    status: doc.status ?? 'draft',
    stepProgress: typeof doc.stepProgress === 'number' ? doc.stepProgress : 0,
    formData,
    aiInsights: doc.aiInsights ?? null,
    pdfUrl: doc.pdfUrl ?? null,
    pptUrl: doc.pptUrl ?? null,
    createdAt: serializeTimestamp(doc.createdAt),
    updatedAt: serializeTimestamp(doc.updatedAt),
    lastAutosaveAt: serializeTimestamp(doc.lastAutosaveAt),
    gammaDeck: doc.gammaDeck ?? null,
  }
}

function serializeTimestamp(value: TimestampLike): string | null {
  if (value === null || value === undefined) {
    return null
  }


  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && value !== null) {
    if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
      const date = (value as { toDate: () => Date }).toDate()
      return date instanceof Date ? date.toISOString() : null
    }
    if (typeof (value as { toMillis?: () => number }).toMillis === 'function') {
      const millis = (value as { toMillis: () => number }).toMillis()
      return Number.isFinite(millis) ? new Date(millis).toISOString() : null
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const millis = value < 1_000_000_000_000 ? value * 1000 : value
    return new Date(millis).toISOString()
  }

  return null
}
