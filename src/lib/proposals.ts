import { serverTimestamp } from 'firebase/firestore'
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

export const proposalDraftSchema = z.object({
  formData: proposalFormSchema.partial().default({}),
  stepProgress: z.number().int().min(0).max(10).default(0),
  status: z.enum(['draft', 'in_progress', 'ready', 'sent']).default('draft'),
})

export type ProposalDraftInput = z.infer<typeof proposalDraftSchema>

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

export function buildProposalDocument(input: ProposalDraftInput, userId: string) {
  const baseData = proposalDraftSchema.parse(input)
  const mergedForm = mergeProposalForm(baseData.formData as Partial<ProposalFormData>)

  return {
    ownerId: userId,
    status: baseData.status,
    stepProgress: baseData.stepProgress,
    formData: mergedForm,
    aiInsights: null,
    pdfUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastAutosaveAt: serverTimestamp(),
  }
}

export function sanitizeProposalUpdate(data: Partial<ProposalDraftInput>) {
  const parsed = proposalDraftSchema.partial().parse(data)
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    lastAutosaveAt: serverTimestamp(),
  }

  if (parsed.status) {
    updates.status = parsed.status
  }

  if (typeof parsed.stepProgress === 'number') {
    updates.stepProgress = parsed.stepProgress
  }

  if (parsed.formData) {
    const current = proposalFormSchema.partial().parse(parsed.formData)

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

export function serializeProposalDoc(doc: any) {
  if (!doc) return null
  const formData = mergeProposalForm(doc.formData)
  return {
    id: doc.id ?? null,
    status: doc.status ?? 'draft',
    stepProgress: doc.stepProgress ?? 0,
    formData,
    aiInsights: doc.aiInsights ?? null,
    pdfUrl: doc.pdfUrl ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    lastAutosaveAt: doc.lastAutosaveAt ?? null,
  }
}
