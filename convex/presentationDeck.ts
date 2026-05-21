"use node"

import { action } from './_generated/server'
import { Errors, withErrorHandling } from './errors'
import { v } from 'convex/values'

import { GammaService, GAMMA_IMAGE_MODEL_CREDITS, GAMMA_RECOMMENDED_MODELS } from '../src/services/gamma'
import { PRESENTATION_ENGINE_LABEL } from '../src/lib/proposal-deck-generation'

/**
 * Presentation deck provider status (admin / diagnostics only).
 */
export const getStatus = action({
  args: {},
  returns: v.object({
    configured: v.boolean(),
    valid: v.boolean(),
    error: v.optional(v.string()),
    imageModels: v.optional(v.record(v.string(), v.number())),
    recommendedModels: v.optional(
      v.object({
        fast: v.array(v.string()),
        balanced: v.array(v.string()),
        premium: v.array(v.string()),
        vector: v.array(v.string()),
      }),
    ),
    formats: v.optional(v.array(v.string())),
    exportFormats: v.optional(v.array(v.string())),
    textModes: v.optional(v.array(v.string())),
    textAmounts: v.optional(v.array(v.string())),
    imageSources: v.optional(v.array(v.string())),
    presentationDimensions: v.optional(v.array(v.string())),
    documentDimensions: v.optional(v.array(v.string())),
    socialDimensions: v.optional(v.array(v.string())),
  }),
  handler: async () =>
    withErrorHandling(async () => {
      const gammaService = new GammaService()
      const isConfigured = gammaService.isConfigured()

      if (!isConfigured) {
        return {
          configured: false,
          valid: false,
          error: 'Presentation engine API key is not configured',
        }
      }

      const isValid = await gammaService.validateApiKey()

      return {
        configured: true,
        valid: isValid,
        imageModels: GAMMA_IMAGE_MODEL_CREDITS,
        recommendedModels: GAMMA_RECOMMENDED_MODELS,
        formats: ['presentation', 'document', 'social', 'webpage'],
        exportFormats: ['pdf', 'pptx'],
        textModes: ['generate', 'condense', 'preserve'],
        textAmounts: ['brief', 'medium', 'detailed', 'extensive'],
        imageSources: [
          'aiGenerated',
          'pictographic',
          'unsplash',
          'giphy',
          'webAllImages',
          'webFreeToUse',
          'webFreeToUseCommercially',
          'placeholder',
          'noImages',
        ],
        presentationDimensions: ['fluid', '16x9', '4x3'],
        documentDimensions: ['fluid', 'pageless', 'letter', 'a4'],
        socialDimensions: ['1x1', '4x5', '9x16'],
      }
    }, 'presentationDeck:getStatus'),
})

export const listFolders = action({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    after: v.optional(v.string()),
  },
  returns: v.object({
    data: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
      }),
    ),
    hasMore: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (_, args) =>
    withErrorHandling(async () => {
      const gammaService = new GammaService()

      if (!gammaService.isConfigured()) {
        throw Errors.integration.notConfigured(PRESENTATION_ENGINE_LABEL, 'Presentation engine is not configured')
      }

      return await gammaService.listFolders({
        query: args.query,
        limit: args.limit,
        after: args.after,
      })
    }, 'presentationDeck:listFolders'),
})

export const listThemes = action({
  args: {
    query: v.optional(v.string()),
    limit: v.optional(v.number()),
    after: v.optional(v.string()),
  },
  returns: v.object({
    data: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        type: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
      }),
    ),
    hasMore: v.boolean(),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (_, args) =>
    withErrorHandling(async () => {
      const gammaService = new GammaService()

      if (!gammaService.isConfigured()) {
        throw Errors.integration.notConfigured(PRESENTATION_ENGINE_LABEL, 'Presentation engine is not configured')
      }

      const result = await gammaService.listThemes({
        query: args.query,
        limit: args.limit,
        after: args.after,
      })

      return {
        data: result.data.map((theme) => ({
          id: theme.id,
          name: theme.name,
          type: theme.type,
          thumbnailUrl: undefined,
        })),
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      }
    }, 'presentationDeck:listThemes'),
})
