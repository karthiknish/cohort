"use node"

import { api, internal } from '/_generated/api'
import { internalAction } from '../../_generated/server'
import { Errors } from '../../errors'
import { zWorkspaceAction } from '../../functions'
import { enforceDeepSeekActionRateLimit } from '../../deepseekRateLimit'
import { v } from 'convex/values'
import { z } from 'zod/v4'

import { mergeProposalForm } from '../../../src/lib/proposals'
import { generateDeckInstructions, generateProposalSuggestions } from '../../../src/lib/proposal-deck-ai'
import { generateProposalPptx } from '../../../src/services/pptx-generator'
import { storeR2Artifact } from '../../lib/r2ArtifactStore'
import { r2 } from '../../r2'
import { toR2ObjectKey } from '../../lib/fileStorage'
import { slugifyProposalLabel } from '@/lib/slugify'

// Simple in-memory idempotency tracking (per-process)
const inProgressGenerations = new Map<string, { startedAt: number }>()
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000

function cleanExpiredIdempotencyEntries() {
  const now = Date.now()
  for (const [key, value] of inProgressGenerations.entries()) {
    if (now - value.startedAt > IDEMPOTENCY_TTL_MS) {
      inProgressGenerations.delete(key)
    }
  }
}

function isGenerationInProgress(workspaceId: string, legacyId: string): boolean {
  cleanExpiredIdempotencyEntries()
  return inProgressGenerations.has(`${workspaceId}:${legacyId}`)
}

function markGenerationInProgress(workspaceId: string, legacyId: string): void {
  inProgressGenerations.set(`${workspaceId}:${legacyId}`, { startedAt: Date.now() })
}

function markGenerationComplete(workspaceId: string, legacyId: string): void {
  inProgressGenerations.delete(`${workspaceId}:${legacyId}`)
}

function buildPptObjectKey(workspaceId: string, legacyId: string): string {
  return `workspaces/${workspaceId}/proposals/${legacyId}/deck.pptx`
}

export const archiveProposalDeck = internalAction({
  args: {
    externalDeckId: v.union(v.string(), v.null()),
  },
  handler: async (_ctx, _args) => {
    // No external deck to archive with pptxgenjs — decks are stored directly in R2.
    return { ok: true, skipped: true }
  },
})

export const generateFromProposal = zWorkspaceAction({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
  },
  handler: async (ctx, args) => {
    if (isGenerationInProgress(args.workspaceId, args.legacyId)) {
      return { ok: true, status: 'in_progress', idempotent: true }
    }

    const proposal = await ctx.runQuery(api.proposals.getByLegacyId, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
    })

    if (!proposal) {
      throw Errors.resource.notFound('Proposal', args.legacyId)
    }

    if (proposal.status === 'in_progress') {
      const updatedAt = proposal.updatedAtMs || 0
      if (Date.now() - updatedAt < IDEMPOTENCY_TTL_MS) {
        return { ok: true, status: 'in_progress', idempotent: true }
      }
    }

    markGenerationInProgress(args.workspaceId, args.legacyId)

    try {
      await enforceDeepSeekActionRateLimit(ctx, {
        name: 'proposalGeneration',
        userId: ctx.legacyId,
        workspaceId: args.workspaceId,
        resourceId: args.legacyId,
        count: 2,
      })

      const formData = mergeProposalForm(proposal.formData ?? null)
      const instructions = await generateDeckInstructions(formData, null)
      const suggestions = await generateProposalSuggestions(formData, instructions)
      const now = Date.now()

      // Update status to in_progress
      await ctx.runMutation(api.proposals.update, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        status: 'in_progress',
        aiInsights: { summary: instructions, instructions },
        aiSuggestions: suggestions ?? null,
        presentationDeck: {
          generationId: null,
          status: 'processing',
          instructions,
          webUrl: null,
          shareUrl: null,
          pptxUrl: null,
          pdfUrl: null,
          generatedFiles: [],
          storageUrl: null,
          pdfStorageUrl: null,
          warnings: [],
          creditsDeducted: null,
          creditsRemaining: null,
          externalDeckId: null,
        },
        updatedAtMs: now,
        lastAutosaveAtMs: now,
      })

      // Generate PPTX directly using pptxgenjs
      const pptxArrayBuffer = await generateProposalPptx(formData, instructions)

      // Store the PPTX in R2
      const label = slugifyProposalLabel(proposal.clientName ?? proposal.legacyId)
      const objectKey = buildPptObjectKey(args.workspaceId, args.legacyId)
      const pptStorageId = await storeR2Artifact({
        r2,
        ctx,
        key: objectKey,
        body: pptxArrayBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        downloadFilename: `${label}-proposal.pptx`,
      })

      // Get the R2 URL for the stored file
      const pptxUrl = await r2.getUrl(toR2ObjectKey(pptStorageId))

      // Update proposal with the generated deck
      const deckPayload = {
        generationId: pptStorageId,
        status: 'completed',
        instructions,
        webUrl: null,
        shareUrl: null,
        pptxUrl,
        pdfUrl: null,
        generatedFiles: [{
          fileType: 'pptx',
          fileUrl: pptxUrl,
        }],
        storageUrl: pptxUrl,
        pdfStorageUrl: null,
        warnings: null,
        error: null,
        creditsDeducted: null,
        creditsRemaining: null,
        externalDeckId: null,
      }

      await ctx.runMutation(api.proposals.update, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        status: 'ready',
        aiInsights: { summary: instructions, instructions },
        aiSuggestions: suggestions ?? null,
        presentationDeck: deckPayload,
        pptUrl: pptxUrl,
        pptStorageId,
        pdfUrl: null,
        updatedAtMs: Date.now(),
        lastAutosaveAtMs: Date.now(),
      })

      // Create in-app notification for the proposal deck being ready
      await ctx.runMutation(internal.notifications.createInternal, {
        workspaceId: args.workspaceId,
        legacyId: `proposal_deck_ready_${args.legacyId}_${Date.now()}`,
        kind: 'proposal.deck.ready',
        title: 'Proposal deck ready',
        body: `Your presentation for ${proposal.clientName ?? 'your client'} is ready to download.`,
        actorId: ctx.legacyId,
        actorName: null,
        resourceType: 'proposal',
        resourceId: args.legacyId,
        recipientRoles: ['admin', 'team'],
        recipientClientId: proposal.clientId ?? null,
        recipientClientIds: proposal.clientId ? [proposal.clientId] : undefined,
        recipientUserIds: [ctx.legacyId],
        metadata: {
          proposalLegacyId: args.legacyId,
        },
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      }).catch((notificationError) => {
        // Don't fail the generation if notification creation fails
        console.error('[proposalGeneration] Failed to create deck ready notification:', notificationError)
      })

      markGenerationComplete(args.workspaceId, args.legacyId)
      return { ok: true, status: 'ready', pptxUrl }
    } catch (error) {
      markGenerationComplete(args.workspaceId, args.legacyId)

      // Update proposal with failure status
      await ctx.runMutation(api.proposals.update, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        status: 'failed',
        presentationDeck: {
          generationId: null,
          status: 'failed',
          instructions: '',
          webUrl: null,
          shareUrl: null,
          pptxUrl: null,
          pdfUrl: null,
          generatedFiles: [],
          storageUrl: null,
          pdfStorageUrl: null,
          warnings: ['Deck generation failed. Please try again.'],
          error: String(error),
          creditsDeducted: null,
          creditsRemaining: null,
          externalDeckId: null,
        },
        updatedAtMs: Date.now(),
        lastAutosaveAtMs: Date.now(),
      }).catch(() => {})

      throw error
    }
  },
})
