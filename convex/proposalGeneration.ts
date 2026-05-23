"use node"

import { api, internal } from '/_generated/api'
import { internalAction } from './_generated/server'
import { runProposalDeckArchive } from './lib/artifactArchiveSchedule'
import { Errors } from './errors'
import { zWorkspaceAction } from './functions'
import { enforceGeminiActionRateLimit } from './geminiRateLimit'
import { v } from 'convex/values'
import { z } from 'zod/v4'

import { FALLBACK_PRESENTATION_THEMES } from '../src/lib/presentation-themes'
import {
  createProposalDeckRequest,
  createProposalTemplateDeckRequest,
  getMasterTemplateDeckId,
  parseDeckGenerationCredits,
  PRESENTATION_ENGINE_LABEL,
  resolveDeckGenerationMode,
  sanitizeDeckProviderWarnings,
} from '../src/lib/proposal-deck-generation'
import { mergeProposalForm } from '../src/lib/proposals'
import { GammaService } from '../src/services/gamma/api'
import { getGammaCircuitBreaker } from '../src/services/gamma/circuit-breaker'
import { generateDeckInstructions, generateProposalSuggestions } from '../src/lib/proposal-deck-ai'

const POLL_INTERVAL_MS = 5000
const MAX_POLL_ATTEMPTS = 60
const FAILURE_STATUSES = new Set(['failed', 'error', 'cancelled', 'canceled', 'timeout'])
const SUCCESS_STATUSES = new Set(['completed', 'succeeded', 'ready', 'finished'])

function getDeckFileUrl(files: Array<{ fileType: string; fileUrl: string }>, type: 'pptx' | 'pdf') {
  return files.find((file) => file.fileType.toLowerCase().includes(type))?.fileUrl ?? null
}

function isLegacyThemeName(value: string) {
  return FALLBACK_PRESENTATION_THEMES.some((theme) => theme.name === value || theme.id === value)
}

function isLikelyThemeId(value: string) {
  return value.length >= 8 && !value.startsWith('fallback-')
}

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

async function resolveThemeId(
  gammaService: GammaService,
  rawThemeId: string,
): Promise<string | undefined> {
  if (!rawThemeId) return undefined
  if (isLikelyThemeId(rawThemeId)) return rawThemeId
  if (isLegacyThemeName(rawThemeId)) {
    const resolved = await gammaService.findTheme(rawThemeId)
    return resolved?.id
  }
  const resolved = await gammaService.findTheme(rawThemeId)
  return resolved?.id ?? rawThemeId
}

function buildDeckPayload(args: {
  generationId: string
  status: Awaited<ReturnType<GammaService['getGeneration']>>
  instructions: string
  warnings: string[]
}) {
  const { generationId, status, instructions, warnings } = args
  const generatedFiles = status.generatedFiles ?? []
  const pptxUrl = getDeckFileUrl(generatedFiles, 'pptx')
  const pdfUrl = getDeckFileUrl(generatedFiles, 'pdf')
  const credits = parseDeckGenerationCredits(status.raw)

  let finalStatus: 'ready' | 'partial_success' | 'failed' = 'failed'
  if (pptxUrl && pdfUrl) {
    finalStatus = 'ready'
  } else if (pptxUrl) {
    finalStatus = 'partial_success'
  }

  const normalized = typeof status.status === 'string' ? status.status.toLowerCase() : ''
  if (FAILURE_STATUSES.has(normalized) && !pptxUrl) {
    finalStatus = 'failed'
  }

  const deckPayload = {
    generationId,
    status: status.status ?? 'unknown',
    instructions,
    webUrl: status.webAppUrl ?? null,
    shareUrl: status.shareUrl ?? null,
    pptxUrl,
    pdfUrl,
    generatedFiles: generatedFiles.map((file) => ({
      fileType: file.fileType,
      fileUrl: file.fileUrl,
    })),
    storageUrl: pptxUrl,
    pdfStorageUrl: pdfUrl,
    warnings: warnings.length > 0 ? warnings : null,
    error: finalStatus === 'failed' ? 'Deck generation failed' : null,
    creditsDeducted: credits.deducted,
    creditsRemaining: credits.remaining,
    externalDeckId: status.externalDeckId ?? null,
  }

  return {
    finalStatus,
    deckPayload,
    pptxUrl,
    pdfUrl,
  }
}

export const pollDeckGeneration = internalAction({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    generationId: v.string(),
    instructions: v.string(),
    suggestions: v.union(v.string(), v.null()),
    attempt: v.number(),
  },
  handler: async (ctx, args) => {
    const gammaService = new GammaService()
    const circuitBreaker = getGammaCircuitBreaker()

    try {
      const result = await circuitBreaker.execute(() => gammaService.getGeneration(args.generationId))
      const generatedFiles = result.generatedFiles ?? []
      const hasPptx = Boolean(getDeckFileUrl(generatedFiles, 'pptx'))
      const hasPdf = Boolean(getDeckFileUrl(generatedFiles, 'pdf'))
      const normalized = typeof result.status === 'string' ? result.status.toLowerCase() : ''
      const providerWarnings = sanitizeDeckProviderWarnings(result.warnings)
      const warnings = [...providerWarnings]

      if (hasPptx && !hasPdf) {
        warnings.push('PDF export is still processing or unavailable — PowerPoint is ready.')
      }

      const exportsReady = hasPptx && hasPdf
      const terminalFailure = FAILURE_STATUSES.has(normalized) && !hasPptx
      const terminalSuccess = exportsReady || (SUCCESS_STATUSES.has(normalized) && hasPptx)

      if (terminalSuccess || terminalFailure) {
        const { finalStatus, deckPayload, pptxUrl, pdfUrl } = buildDeckPayload({
          generationId: args.generationId,
          status: result,
          instructions: args.instructions,
          warnings,
        })

        await ctx.runMutation(api.proposals.update, {
          workspaceId: args.workspaceId,
          legacyId: args.legacyId,
          status: finalStatus,
          aiInsights: { summary: args.instructions, instructions: args.instructions },
          aiSuggestions: args.suggestions,
          presentationDeck: deckPayload,
          pptUrl: pptxUrl,
          pdfUrl: pdfUrl,
          updatedAtMs: Date.now(),
          lastAutosaveAtMs: Date.now(),
        })

        await runProposalDeckArchive(ctx, {
          workspaceId: args.workspaceId,
          legacyId: args.legacyId,
          pptxUrl,
          pdfUrl,
        })

        markGenerationComplete(args.workspaceId, args.legacyId)
        return { done: true, status: finalStatus }
      }

      if (args.attempt >= MAX_POLL_ATTEMPTS) {
        const { finalStatus, deckPayload, pptxUrl, pdfUrl } = buildDeckPayload({
          generationId: args.generationId,
          status: result,
          instructions: args.instructions,
          warnings: [...warnings, 'Deck generation timed out — check again from proposal history.'],
        })

        await ctx.runMutation(api.proposals.update, {
          workspaceId: args.workspaceId,
          legacyId: args.legacyId,
          status: hasPptx ? 'partial_success' : finalStatus,
          aiInsights: { summary: args.instructions, instructions: args.instructions },
          aiSuggestions: args.suggestions,
          presentationDeck: deckPayload,
          pptUrl: pptxUrl,
          pdfUrl: pdfUrl,
          updatedAtMs: Date.now(),
          lastAutosaveAtMs: Date.now(),
        })

        await runProposalDeckArchive(ctx, {
          workspaceId: args.workspaceId,
          legacyId: args.legacyId,
          pptxUrl,
          pdfUrl,
        })

        markGenerationComplete(args.workspaceId, args.legacyId)
        return { done: true, status: hasPptx ? 'partial_success' : 'failed' }
      }

      await ctx.scheduler.runAfter(POLL_INTERVAL_MS, internal.proposalGeneration.pollDeckGeneration, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        generationId: args.generationId,
        instructions: args.instructions,
        suggestions: args.suggestions,
        attempt: args.attempt + 1,
      })

      return { done: false, status: result.status }
    } catch (error) {
      console.error('[ProposalGeneration] poll failed', error)

      if (args.attempt < MAX_POLL_ATTEMPTS) {
        await ctx.scheduler.runAfter(POLL_INTERVAL_MS, internal.proposalGeneration.pollDeckGeneration, {
          workspaceId: args.workspaceId,
          legacyId: args.legacyId,
          generationId: args.generationId,
          instructions: args.instructions,
          suggestions: args.suggestions,
          attempt: args.attempt + 1,
        })
        return { done: false, status: 'polling' }
      }

      await ctx.runMutation(api.proposals.update, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        status: 'failed',
        presentationDeck: {
          generationId: args.generationId,
          status: 'failed',
          instructions: args.instructions,
          webUrl: null,
          shareUrl: null,
          pptxUrl: null,
          pdfUrl: null,
          generatedFiles: [],
          storageUrl: null,
          pdfStorageUrl: null,
          warnings: ['Deck status could not be confirmed. Try rechecking from the builder.'],
          error: String(error),
          creditsDeducted: null,
          creditsRemaining: null,
          externalDeckId: null,
        },
        updatedAtMs: Date.now(),
        lastAutosaveAtMs: Date.now(),
      })

      markGenerationComplete(args.workspaceId, args.legacyId)
      return { done: true, status: 'failed' }
    }
  },
})

export const archiveProposalDeck = internalAction({
  args: {
    externalDeckId: v.union(v.string(), v.null()),
  },
  handler: async (_ctx, args) => {
    if (!args.externalDeckId) {
      return { ok: true, skipped: true }
    }

    const gammaService = new GammaService()
    if (!gammaService.isConfigured()) {
      return { ok: false, skipped: true }
    }

    try {
      await gammaService.archiveDeck(args.externalDeckId)
      return { ok: true, skipped: false }
    } catch (error) {
      console.warn('[ProposalGeneration] archive deck failed', error)
      return { ok: false, skipped: false }
    }
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
      const circuitBreaker = getGammaCircuitBreaker()
      if (!circuitBreaker.canExecute()) {
        throw Errors.integration.error(
          PRESENTATION_ENGINE_LABEL,
          'The presentation engine is temporarily unavailable. Please try again in a minute.',
        )
      }

      const gammaService = new GammaService()
      if (!gammaService.isConfigured()) {
        throw Errors.integration.notConfigured(
          PRESENTATION_ENGINE_LABEL,
          'Presentation engine is not configured',
        )
      }

      await enforceGeminiActionRateLimit(ctx, {
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

      const rawThemeValue = proposal.formData?.presentationTheme
      const rawThemeId = typeof rawThemeValue === 'string' ? rawThemeValue.trim() : ''
      const themeId = await resolveThemeId(gammaService, rawThemeId)

      const masterTemplateId = getMasterTemplateDeckId()
      const useTemplate = resolveDeckGenerationMode() === 'template' && Boolean(masterTemplateId)

      const creation = await circuitBreaker.execute(async () => {
        if (useTemplate && masterTemplateId) {
          return gammaService.createFromTemplate(
            createProposalTemplateDeckRequest(formData, instructions, masterTemplateId, { themeId }),
          )
        }
        return gammaService.createGeneration(createProposalDeckRequest(formData, instructions, { themeId }))
      })

      const generationId = creation.generationId

      await ctx.runMutation(api.proposals.update, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        presentationDeck: {
          generationId,
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
        updatedAtMs: Date.now(),
        lastAutosaveAtMs: Date.now(),
      })

      await ctx.scheduler.runAfter(POLL_INTERVAL_MS, internal.proposalGeneration.pollDeckGeneration, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        generationId,
        instructions,
        suggestions: suggestions ?? null,
        attempt: 0,
      })

      return { ok: true, status: 'in_progress', generationId }
    } catch (error) {
      markGenerationComplete(args.workspaceId, args.legacyId)
      throw error
    }
  },
})
