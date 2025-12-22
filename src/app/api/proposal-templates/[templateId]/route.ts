import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { adminDb } from '@/lib/firebase-admin'
import type { ProposalTemplate } from '@/types/proposal-templates'

const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  formData: z.record(z.string(), z.unknown()).optional(),
  industry: z.string().trim().max(100).nullable().optional(),
  tags: z.array(z.string().trim().max(50)).max(10).optional(),
  isDefault: z.boolean().optional(),
})

type StoredTemplate = {
  name?: unknown
  description?: unknown
  formData?: unknown
  industry?: unknown
  tags?: unknown
  isDefault?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

function toISO(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString()
  }
  if (typeof value === 'string') {
    return value
  }
  return null
}

function mapTemplateDoc(docId: string, data: StoredTemplate): ProposalTemplate {
  const rawFormData = data.formData && typeof data.formData === 'object' ? data.formData as Partial<ProposalFormData> : {}
  const formData = mergeProposalForm(rawFormData)

  return {
    id: docId,
    name: typeof data.name === 'string' ? data.name : 'Untitled Template',
    description: typeof data.description === 'string' ? data.description : null,
    formData,
    industry: typeof data.industry === 'string' ? data.industry : null,
    tags: Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === 'string') : [],
    isDefault: data.isDefault === true,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export const GET = createApiHandler({ workspace: 'required' }, async (req, { workspace, params }) => {
  const { templateId } = params as { templateId: string }
  if (!templateId) {
    return { error: 'Template ID required', status: 400 }
  }

  const templatesRef = workspace!.workspaceRef.collection('proposalTemplates')
  const docRef = templatesRef.doc(templateId)

  const doc = await docRef.get()
  if (!doc.exists) {
    return { error: 'Template not found', status: 404 }
  }

  const template = mapTemplateDoc(doc.id, doc.data() as StoredTemplate)
  return { template }
})

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: updateTemplateSchema,
  },
  async (req, { workspace, body, params }) => {
    const { templateId } = params as { templateId: string }
    if (!templateId) {
      return { error: 'Template ID required', status: 400 }
    }

    const templatesRef = workspace!.workspaceRef.collection('proposalTemplates')
    const docRef = templatesRef.doc(templateId)

    const doc = await docRef.get()
    if (!doc.exists) {
      return { error: 'Template not found', status: 404 }
    }

    const timestamp = Timestamp.now()
    const updates: Record<string, unknown> = {
      updatedAt: timestamp,
    }

    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.industry !== undefined) updates.industry = body.industry
    if (body.tags !== undefined) updates.tags = body.tags

    if (body.formData !== undefined) {
      const existingData = doc.data() as StoredTemplate
      const existingFormData = existingData.formData && typeof existingData.formData === 'object'
        ? existingData.formData as Partial<ProposalFormData>
        : {}
      const mergedFormData = mergeProposalForm({
        ...existingFormData,
        ...body.formData as Partial<ProposalFormData>,
      })
      updates.formData = mergedFormData
    }

    // Handle isDefault toggle
    if (body.isDefault !== undefined) {
      if (body.isDefault) {
        // Unset any existing defaults
        const existingDefaults = await templatesRef.where('isDefault', '==', true).get()
        const batch = adminDb.batch()
        existingDefaults.docs.forEach((existingDoc) => {
          if (existingDoc.id !== templateId) {
            batch.update(existingDoc.ref, { isDefault: false, updatedAt: timestamp })
          }
        })
        if (!existingDefaults.empty) {
          await batch.commit()
        }
      }
      updates.isDefault = body.isDefault
    }

    await docRef.update(updates)

    const updatedDoc = await docRef.get()
    const template = mapTemplateDoc(updatedDoc.id, updatedDoc.data() as StoredTemplate)

    return { template }
  }
)

export const DELETE = createApiHandler({ workspace: 'required' }, async (req, { workspace, params }) => {
  const { templateId } = params as { templateId: string }
  if (!templateId) {
    return { error: 'Template ID required', status: 400 }
  }

  const templatesRef = workspace!.workspaceRef.collection('proposalTemplates')
  const docRef = templatesRef.doc(templateId)

  const doc = await docRef.get()
  if (!doc.exists) {
    return { error: 'Template not found', status: 404 }
  }

  await docRef.delete()

  return { success: true }
})
