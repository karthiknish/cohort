import { R2 } from '@convex-dev/r2'

import { components } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import { Errors } from './errors'

export const r2 = new R2(components.r2)

async function assertAuthenticatedUpload(ctx: { auth: { getUserIdentity: () => Promise<unknown | null> } }) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: assertAuthenticatedUpload,
})
