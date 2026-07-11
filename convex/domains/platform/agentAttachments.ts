'use node'

import { v } from 'convex/values'
import { extractText, getDocumentProxy } from 'unpdf'
import { action } from '../../_generated/server'
import { Errors, withErrorHandling } from '../../errors'
import { requireIdentity } from '../../lib/functions/auth'

// Convex v.string() args are capped at 1 MiB UTF-8; base64 adds ~33% overhead.
export const MAX_PDF_BYTES = 750 * 1024
const MAX_EXTRACTED_CHARS = 12_000

function looksLikePdf(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-'
}

function toUserFacingPdfError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unable to extract PDF text.'
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid pdf') || normalized.includes('invalid number')) {
    return 'This file could not be read as a PDF. Try re-exporting it or upload a .docx instead.'
  }

  return message
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
          errorMessage: 'PDF is too large for import. Try a file under 750 KB or save as .docx.',
        }
      }

      if (!looksLikePdf(buffer)) {
        return {
          extractionStatus: 'failed' as const,
          errorMessage:
            'This file does not look like a PDF. If it is a Word document, save it as .docx and try again.',
        }
      }

      try {
        const pdf = await getDocumentProxy(new Uint8Array(buffer))
        const { text } = await extractText(pdf, { mergePages: true })
        const normalized = text.replace(/\s+/g, ' ').trim()

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
        return {
          extractionStatus: 'failed' as const,
          errorMessage: toUserFacingPdfError(error),
        }
      }
    }, 'agentAttachments:extractPdfText'),
})
