import { zWorkspaceQuery } from './functions'
import { assertWorkspaceStorageAccess } from './lib/storageAccess'
import { resolveStoredObjectUrl } from './lib/fileStorage'
import { z } from 'zod/v4'

export { generateUploadUrl, syncMetadata } from './r2'

export const getDownloadUrl = zWorkspaceQuery({
  args: {
    storageId: z.string(),
  },
  handler: async (ctx, args) => {
    await assertWorkspaceStorageAccess(ctx, args.workspaceId, args.storageId)

    const url = await resolveStoredObjectUrl(ctx, args.storageId, {
      expiresIn: 60 * 60,
    })
    return { url: url ?? null }
  },
})

export const getPublicUrl = zWorkspaceQuery({
  args: {
    storageId: z.string(),
  },
  handler: async (ctx, args) => {
    await assertWorkspaceStorageAccess(ctx, args.workspaceId, args.storageId)

    const url = await resolveStoredObjectUrl(ctx, args.storageId, {
      expiresIn: 60 * 60 * 24,
    })
    return { url: url ?? null }
  },
})
