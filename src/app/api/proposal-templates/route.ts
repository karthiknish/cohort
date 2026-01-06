import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { mergeProposalForm, type ProposalFormData } from '@/lib/proposals'
import { adminDb } from '@/lib/firebase-admin'
import type { ProposalTemplate } from '@/types/proposal-templates'
import type { StoredTemplate } from '@/types/stored-types'
import { toISO } from '@/lib/utils'

const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required').max(100),
  description: z.string().trim().max(500).nullable().optional(),
  formData: z.record(z.string(), z.unknown()).optional().default({}),
  industry: z.string().trim().max(100).nullable().optional(),
  tags: z.array(z.string().trim().max(50)).max(10).optional().default([]),
  isDefault: z.boolean().optional().default(false),
})



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

export const GET = createApiHandler({ workspace: 'required', rateLimit: 'standard' }, async (req, { workspace }) => {
  const templatesRef = workspace!.workspaceRef.collection('proposalTemplates')

  const snapshot = await templatesRef.orderBy('createdAt', 'desc').limit(50).get()

  const templates: ProposalTemplate[] = snapshot.docs.map((doc) =>
    mapTemplateDoc(doc.id, doc.data() as StoredTemplate)
  )

  return { templates }
})

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createTemplateSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    const templatesRef = workspace!.workspaceRef.collection('proposalTemplates')
    const timestamp = Timestamp.now()

    // If this is being set as default, unset any existing default
    if (body.isDefault) {
      const existingDefaults = await templatesRef.where('isDefault', '==', true).get()
      const batch = adminDb.batch()
      existingDefaults.docs.forEach((doc) => {
        batch.update(doc.ref, { isDefault: false, updatedAt: timestamp })
      })
      if (!existingDefaults.empty) {
        await batch.commit()
      }
    }

    const docRef = await templatesRef.add({
      name: body.name,
      description: body.description ?? null,
      formData: mergeProposalForm(body.formData as Partial<ProposalFormData>),
      industry: body.industry ?? null,
      tags: body.tags,
      isDefault: body.isDefault,
      createdBy: auth.uid,
      workspaceId: workspace!.workspaceId,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const createdDoc = await docRef.get()
    const template = mapTemplateDoc(createdDoc.id, createdDoc.data() as StoredTemplate)

    return { template, status: 201 }
  }
)
