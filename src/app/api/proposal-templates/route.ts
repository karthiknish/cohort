import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { mergeProposalForm, proposalFormSchema, type ProposalFormData } from '@/lib/proposals'
import { adminDb } from '@/lib/firebase-admin'
import type { ProposalTemplate, ProposalTemplateInput } from '@/types/proposal-templates'

const createTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Template name is required').max(100),
  description: z.string().trim().max(500).nullable().optional(),
  formData: z.record(z.string(), z.unknown()).optional().default({}),
  industry: z.string().trim().max(100).nullable().optional(),
  tags: z.array(z.string().trim().max(50)).max(10).optional().default([]),
  isDefault: z.boolean().optional().default(false),
})

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

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const templatesRef = workspace.workspaceRef.collection('proposalTemplates')

    const snapshot = await templatesRef.orderBy('createdAt', 'desc').limit(50).get()

    const templates: ProposalTemplate[] = snapshot.docs.map((doc) =>
      mapTemplateDoc(doc.id, doc.data() as StoredTemplate)
    )

    return NextResponse.json({ templates })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[proposal-templates] GET error', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const json = await request.json().catch(() => null)
    const input = createTemplateSchema.parse(json ?? {})

    const templatesRef = workspace.workspaceRef.collection('proposalTemplates')
    const timestamp = Timestamp.now()

    // If this is being set as default, unset any existing default
    if (input.isDefault) {
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
      name: input.name,
      description: input.description ?? null,
      formData: mergeProposalForm(input.formData as Partial<ProposalFormData>),
      industry: input.industry ?? null,
      tags: input.tags,
      isDefault: input.isDefault,
      createdBy: auth.uid,
      workspaceId: workspace.workspaceId,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const createdDoc = await docRef.get()
    const template = mapTemplateDoc(createdDoc.id, createdDoc.data() as StoredTemplate)

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join(', ') || 'Invalid input' }, { status: 400 })
    }
    console.error('[proposal-templates] POST error', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
