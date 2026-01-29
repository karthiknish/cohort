"use node"

import { api } from './_generated/api'
import { Errors } from './errors'
import { zWorkspaceAction } from './functions'
import { z } from 'zod/v4'

import { GAMMA_PRESENTATION_THEMES } from '../src/lib/gamma-themes'
import { mergeProposalForm } from '../src/lib/proposals'
import { GammaService, createPresentationRequest, getGammaCircuitBreaker } from '../src/services/gamma'
import {
  buildGammaInputText,
  generateGammaInstructions,
  generateProposalSuggestions,
} from '../src/services/gamma-utils'

function getGammaFileUrl(files: Array<{ fileType: string; fileUrl: string }>, type: 'pptx' | 'pdf') {
  return files.find((file) => file.fileType.toLowerCase().includes(type))?.fileUrl ?? null
}

function mergeGeneratedFiles(
  primary: Array<{ fileType: string; fileUrl: string }>,
  fallback: Array<{ fileType: string; fileUrl: string }>,
) {
  if (!fallback.length) return primary
  const existingTypes = new Set(primary.map((file) => file.fileType.toLowerCase()))
  return [
    ...primary,
    ...fallback.filter((file) => !existingTypes.has(file.fileType.toLowerCase())),
  ]
}

function isLegacyThemeName(value: string) {
  return GAMMA_PRESENTATION_THEMES.some((theme) => theme.name === value)
}

// Simple in-memory idempotency tracking (per-process)
const inProgressGenerations = new Map<string, { startedAt: number }>()
const IDEMPOTENCY_TTL_MS = 5 * 60 * 1000 // 5 minutes

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
  const key = `${workspaceId}:${legacyId}`
  return inProgressGenerations.has(key)
}

function markGenerationInProgress(workspaceId: string, legacyId: string): void {
  const key = `${workspaceId}:${legacyId}`
  inProgressGenerations.set(key, { startedAt: Date.now() })
}

function markGenerationComplete(workspaceId: string, legacyId: string): void {
  const key = `${workspaceId}:${legacyId}`
  inProgressGenerations.delete(key)
}

export const generateFromProposal = zWorkspaceAction({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
  },
  handler: async (ctx, args) => {
    // Simple idempotency check - prevent duplicate generations
    if (isGenerationInProgress(args.workspaceId, args.legacyId)) {
      console.log('[ProposalGeneration] Generation already in progress, returning early')
      return { ok: true, status: 'in_progress', idempotent: true }
    }

    const proposal = await ctx.runQuery(api.proposals.getByLegacyId, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
    })

    if (!proposal) {
      throw Errors.resource.notFound('Proposal', args.legacyId)
    }

    // Also check if proposal is already being processed
    if (proposal.status === 'in_progress') {
      const updatedAt = proposal.updatedAtMs || 0
      const timeSinceUpdate = Date.now() - updatedAt
      // If updated less than 5 minutes ago, consider it still in progress
      if (timeSinceUpdate < 5 * 60 * 1000) {
        console.log('[ProposalGeneration] Proposal already marked as in_progress, skipping')
        return { ok: true, status: 'in_progress', idempotent: true }
      }
    }

    // Mark as in-progress
    markGenerationInProgress(args.workspaceId, args.legacyId)

    const circuitBreaker = getGammaCircuitBreaker()

    // Check circuit breaker before starting
    if (!circuitBreaker.canExecute()) {
      const state = circuitBreaker.getState()
      markGenerationComplete(args.workspaceId, args.legacyId)
      throw new Error(
        `Gamma API is temporarily unavailable due to too many recent failures. Circuit breaker state: ${state.state}. Please try again in a minute.`
      )
    }

    const gammaService = new GammaService()
    if (!gammaService.isConfigured()) {
      markGenerationComplete(args.workspaceId, args.legacyId)
      throw Errors.integration.notConfigured('Gamma', 'Gamma API not configured')
    }

    let instructions: string
    let suggestions: string | null
    let inputText: string

    try {
      const formData = mergeProposalForm(proposal.formData ?? null)
      instructions = await generateGammaInstructions(formData, null)
      suggestions = await generateProposalSuggestions(formData, instructions)
      inputText = buildGammaInputText(formData, instructions)
    } catch (error) {
      markGenerationComplete(args.workspaceId, args.legacyId)
      throw error
    }

    const now = Date.now()
    const warnings: string[] = []

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
      },
      updatedAtMs: now,
      lastAutosaveAtMs: now,
    })

    const rawThemeId = proposal.formData?.presentationTheme?.trim()
    let themeId: string | undefined

    if (rawThemeId) {
      if (isLegacyThemeName(rawThemeId)) {
        const resolvedTheme = await gammaService.findTheme(rawThemeId)
        themeId = resolvedTheme?.id
      } else {
        themeId = rawThemeId
      }
    }

    let pptGeneration: Awaited<ReturnType<typeof gammaService.generatePresentation>>
    let pptxUrl: string | null = null
    let pdfUrl: string | null = null
    let generatedFiles: Array<{ fileType: string; fileUrl: string }> = []

    // Generate PPTX with circuit breaker protection
    try {
      pptGeneration = await circuitBreaker.execute(() =>
        gammaService.generatePresentation(
          createPresentationRequest(inputText, {
            themeId: themeId || undefined,
            additionalInstructions: instructions,
            exportAs: 'pptx',
          })
        )
      )
      generatedFiles = pptGeneration.generatedFiles ?? []
      pptxUrl = getGammaFileUrl(generatedFiles, 'pptx')
    } catch (error) {
      console.error('[ProposalGeneration] PPTX generation failed', error)

      // Update proposal to failed state
      await ctx.runMutation(api.proposals.update, {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        status: 'failed',
        presentationDeck: {
          generationId: null,
          status: 'failed',
          instructions,
          webUrl: null,
          shareUrl: null,
          pptxUrl: null,
          pdfUrl: null,
          generatedFiles: [],
          storageUrl: null,
          pdfStorageUrl: null,
          warnings: ['PPTX generation failed'],
          error: String(error),
        },
        updatedAtMs: Date.now(),
        lastAutosaveAtMs: Date.now(),
      })

      markGenerationComplete(args.workspaceId, args.legacyId)
      throw error
    }

    // Try to generate PDF
    pdfUrl = getGammaFileUrl(generatedFiles, 'pdf')
    let pdfStorageUrl = pdfUrl

    if (!pdfUrl) {
      try {
        const pdfGeneration = await circuitBreaker.execute(() =>
          gammaService.generatePresentation(
            createPresentationRequest(inputText, {
              themeId: themeId || undefined,
              additionalInstructions: instructions,
              exportAs: 'pdf',
            })
          )
        )
        const pdfFiles = pdfGeneration.generatedFiles ?? []
        generatedFiles = mergeGeneratedFiles(generatedFiles, pdfFiles)
        pdfUrl = getGammaFileUrl(pdfFiles, 'pdf') ?? pdfUrl
        pdfStorageUrl = pdfUrl ?? pdfStorageUrl
      } catch (error) {
        console.warn('[ProposalGeneration] PDF generation failed', error)
        warnings.push('PDF generation failed - PPTX is available')
      }
    }

    // Determine final status based on what succeeded
    let finalStatus: 'ready' | 'partial_success' | 'failed' = 'failed'
    if (pptxUrl && pdfUrl) {
      finalStatus = 'ready'
    } else if (pptxUrl) {
      finalStatus = 'partial_success'
    }

    const deckPayload = {
      generationId: pptGeneration.generationId,
      status: pptGeneration.status ?? 'unknown',
      instructions,
      webUrl: pptGeneration.webAppUrl ?? null,
      shareUrl: pptGeneration.shareUrl ?? null,
      pptxUrl,
      pdfUrl,
      generatedFiles,
      storageUrl: pptxUrl,
      pdfStorageUrl,
      warnings: warnings.length > 0 ? warnings : null,
      error: finalStatus === 'failed' ? 'Generation failed' : null,
    }

    await ctx.runMutation(api.proposals.update, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      status: finalStatus,
      aiInsights: { summary: instructions, instructions },
      aiSuggestions: suggestions ?? null,
      presentationDeck: deckPayload,
      pptUrl: pptxUrl,
      pdfUrl: pdfUrl,
      updatedAtMs: Date.now(),
      lastAutosaveAtMs: Date.now(),
    })

    // Mark generation as complete
    markGenerationComplete(args.workspaceId, args.legacyId)

    return { ok: true, status: finalStatus, warnings }
  },
})
