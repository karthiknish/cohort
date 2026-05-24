import { R2 } from '@convex-dev/r2'

import { components } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import { Errors } from './errors'
import { asR2ObjectRef } from './lib/fileStorage'
import { getAuthenticatedContext } from './lib/functions/auth'

export const r2 = new R2(components.r2)

const UPLOAD_GRANT_TTL_MS = 30 * 60 * 1000

async function assertAuthenticatedUpload(ctx: { auth: { getUserIdentity: () => Promise<unknown | null> } }) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: assertAuthenticatedUpload,
  onUpload: async (ctx, _bucket, key) => {
    const auth = await getAuthenticatedContext(ctx)
    await ctx.db.insert('fileUploadGrants', {
      workspaceId: auth.agencyId,
      storageId: asR2ObjectRef(key),
      createdBy: auth.legacyId,
      expiresAtMs: Date.now() + UPLOAD_GRANT_TTL_MS,
    })
  },
})
