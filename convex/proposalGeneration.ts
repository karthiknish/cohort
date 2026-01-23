"use node"

import { api } from './_generated/api'
import { Errors } from './errors'
import { zWorkspaceAction } from './functions'
import { z } from 'zod/v4'

import { GAMMA_PRESENTATION_THEMES } from '../src/lib/gamma-themes'
import { mergeProposalForm } from '../src/lib/proposals'
import { GammaService, createPresentationRequest } from '../src/services/gamma'
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

export const generateFromProposal = zWorkspaceAction({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.runQuery(api.proposals.getByLegacyId, {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
    })

    if (!proposal) {
      throw Errors.resource.notFound('Proposal', args.legacyId)
    }

    const gammaService = new GammaService()
    if (!gammaService.isConfigured()) {
      throw Errors.integration.notConfigured('Gamma', 'Gamma API not configured')
    }

    const formData = mergeProposalForm(proposal.formData ?? null)
    const instructions = await generateGammaInstructions(formData, null)
    const suggestions = await generateProposalSuggestions(formData, instructions)
    const inputText = buildGammaInputText(formData, instructions)

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
      },
      updatedAtMs: now,
      lastAutosaveAtMs: now,
    })

    const rawThemeId = formData.value?.presentationTheme?.trim()
    let themeId: string | undefined

    if (rawThemeId) {
      if (isLegacyThemeName(rawThemeId)) {
        const resolvedTheme = await gammaService.findTheme(rawThemeId)
        themeId = resolvedTheme?.id
      } else {
        themeId = rawThemeId
      }
    }
    const pptGeneration = await gammaService.generatePresentation(
      createPresentationRequest(inputText, {
        themeId: themeId || undefined,
        additionalInstructions: instructions,
        exportAs: 'pptx',
      }),
    )

    let generatedFiles = pptGeneration.generatedFiles ?? []
    const pptxUrl = getGammaFileUrl(generatedFiles, 'pptx')
    let pdfUrl = getGammaFileUrl(generatedFiles, 'pdf')
    let pdfStorageUrl = pdfUrl

    if (!pdfUrl) {
      try {
        const pdfGeneration = await gammaService.generatePresentation(
          createPresentationRequest(inputText, {
            themeId: themeId || undefined,
            additionalInstructions: instructions,
            exportAs: 'pdf',
          }),
        )
        const pdfFiles = pdfGeneration.generatedFiles ?? []
        generatedFiles = mergeGeneratedFiles(generatedFiles, pdfFiles)
        pdfUrl = getGammaFileUrl(pdfFiles, 'pdf') ?? pdfUrl
        pdfStorageUrl = pdfUrl ?? pdfStorageUrl
      } catch (error) {
        console.warn('Gamma PDF generation failed', error)
      }
    }

    const finalStatus = pptxUrl ? 'ready' : 'in_progress'

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

    return { ok: true, status: finalStatus }
  },
})
