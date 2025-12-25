import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { gammaService } from '@/services/gamma'
import { ApiError } from '@/lib/api-errors'

const querySchema = z.object({
  query: z.string().optional(),
  limit: z.string().transform((v) => parseInt(v, 10)).optional(),
  after: z.string().optional(),
})

/**
 * GET /api/gamma/folders
 * List available Gamma folders
 * Query params: query (search), limit, after (pagination cursor)
 */
export const GET = createApiHandler(
  {
    querySchema,
    auth: 'none',
    rateLimit: 'standard',
  },
  async (req, { query }) => {
    try {
      const result = await gammaService.listFolders({
        query: query.query,
        limit: query.limit,
        after: query.after,
      })

      return result
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('GAMMA_API_KEY')) {
        throw new ApiError('Gamma API not configured', 503, 'GAMMA_NOT_CONFIGURED')
      }
      throw error
    }
  }
)
