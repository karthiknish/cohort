import {
  zAuthenticatedQuery,
} from './functions'
import { resolveStoredObjectUrl } from './lib/fileStorage'
import { z } from 'zod/v4'

export { generateUploadUrl, syncMetadata } from './r2'

export const getDownloadUrl = zAuthenticatedQuery({
  args: {
    storageId: z.string(),
  },
  handler: async (ctx, args) => {
    const url = await resolveStoredObjectUrl(ctx, args.storageId, {
      expiresIn: 60 * 60,
    })
    return { url: url ?? null }
  },
})

export const getPublicUrl = zAuthenticatedQuery({
  args: {
    storageId: z.string(),
  },
  handler: async (ctx, args) => {
    const url = await resolveStoredObjectUrl(ctx, args.storageId, {
      expiresIn: 60 * 60 * 24,
    })
    return { url: url ?? null }
  },
})
