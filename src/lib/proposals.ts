import { Timestamp, serverTimestamp } from 'firebase/firestore'
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
  }),
})

export type ProposalFormData = z.infer<typeof proposalFormSchema>

const proposalFormPartialSchema = z
  .object({
    company: proposalFormSchema.shape.company.partial().optional(),
    marketing: proposalFormSchema.shape.marketing.partial().optional(),
    goals: proposalFormSchema.shape.goals.partial().optional(),
    scope: proposalFormSchema.shape.scope.partial().optional(),
    timelines: proposalFormSchema.shape.timelines.partial().optional(),
    value: proposalFormSchema.shape.value.partial().optional(),
  })
  .default({})

export const proposalDraftSchema = z.object({
  formData: proposalFormPartialSchema.default({}),
  stepProgress: z.number().int().min(0).max(10).default(0),
  status: z.enum(['draft', 'in_progress', 'ready', 'sent']).default('draft'),
})

export type ProposalDraftInput = z.infer<typeof proposalDraftSchema>

export const proposalDraftUpdateSchema = z.object({
  formData: proposalFormPartialSchema.optional(),
  stepProgress: z.number().int().min(0).max(10).optional(),
  status: z.enum(['draft', 'in_progress', 'ready', 'sent']).optional(),
})

export type ProposalDraftUpdateInput = z.infer<typeof proposalDraftUpdateSchema>

export function createDefaultProposalForm(): ProposalFormData {
  return proposalFormSchema.parse({})
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
  const mergedForm = mergeProposalForm(baseData.formData as Partial<ProposalFormData>)

  return {
    ownerId: userId,
    status: baseData.status,
    stepProgress: baseData.stepProgress,
    formData: mergedForm,
    aiInsights: null,
    pdfUrl: null,
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

  if (parsed.formData) {
    const current = proposalFormPartialSchema.parse(parsed.formData)

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

    Object.entries(current).forEach(([key, value]) => {
      const path = `formData.${key}`
      walk(value, path)
    })
  }

  return updates
}

type TimestampLike = Timestamp | Date | { toDate: () => Date } | string | null | undefined

interface FirestoreProposalDoc {
  id?: string | null
  status?: string | null
  stepProgress?: number | null
  formData?: Partial<ProposalFormData> | null
  aiInsights?: unknown
  pdfUrl?: string | null
  createdAt?: TimestampLike
  updatedAt?: TimestampLike
  lastAutosaveAt?: TimestampLike
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
    createdAt: serializeTimestamp(doc.createdAt),
    updatedAt: serializeTimestamp(doc.updatedAt),
    lastAutosaveAt: serializeTimestamp(doc.lastAutosaveAt),
  }
}

function serializeTimestamp(value: TimestampLike): string | null {
  if (value === null || value === undefined) {
    return null
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const date = value.toDate()
    return date instanceof Date ? date.toISOString() : null
  }

  return null
}
