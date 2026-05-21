'use node'

import { v } from 'convex/values'
import { action } from './_generated/server'
import { Errors, withErrorHandling } from './errors'

const MAX_PDF_BYTES = 5 * 1024 * 1024
const MAX_EXTRACTED_CHARS = 12_000

function requireIdentity(identity: { subject: string } | null): asserts identity is { subject: string } {
  if (!identity?.subject) {
    throw Errors.auth.unauthorized()
  }
}

export const extractPdfText = action({
  args: {
    workspaceId: v.string(),
    fileName: v.string(),
    dataBase64: v.string(),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      if (!args.workspaceId.trim()) {
        throw Errors.validation.invalidInput('Workspace is required')
      }

      const buffer = Buffer.from(args.dataBase64, 'base64')
      if (!Number.isFinite(buffer.length) || buffer.length <= 0) {
        return {
          extractionStatus: 'failed' as const,
          errorMessage: 'The PDF file could not be read.',
        }
      }

      if (buffer.length > MAX_PDF_BYTES) {
        return {
          extractionStatus: 'failed' as const,
          errorMessage: 'PDF is too large. Try a file under 5 MB.',
        }
      }

      try {
        const pdfParse = (await import('pdf-parse')).default as (
          data: Buffer,
        ) => Promise<{ text?: string }>
        const parsed = await pdfParse(buffer)
        const normalized = (parsed.text ?? '').replace(/\s+/g, ' ').trim()

        if (!normalized) {
          return {
            extractionStatus: 'limited' as const,
            errorMessage:
              'This PDF did not expose readable text. Add a short note about the important fields.',
          }
        }

        const extractedText =
          normalized.length > MAX_EXTRACTED_CHARS
            ? `${normalized.slice(0, MAX_EXTRACTED_CHARS - 1).trimEnd()}…`
            : normalized

        return {
          extractionStatus: 'ready' as const,
          extractedText,
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to extract PDF text.'
        return {
          extractionStatus: 'failed' as const,
          errorMessage: message,
        }
      }
    }, 'agentAttachments:extractPdfText'),
})
