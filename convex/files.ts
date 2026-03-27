import type { Id } from '/_generated/dataModel'
import {
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'

export const generateUploadUrl = zAuthenticatedMutation({
  args: {},
  returns: z.object({ url: z.string() }),
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl()
    return { url }
  },
})

export const getDownloadUrl = zAuthenticatedQuery({
  args: {
    storageId: z.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
    return { url: url ?? null }
  },
})

export const getPublicUrl = zAuthenticatedQuery({
  args: {
    storageId: z.string(),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId as Id<'_storage'>)
    return { url: url ?? null }
  },
})
