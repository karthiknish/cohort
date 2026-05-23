import type { R2 } from '@convex-dev/r2'

import type { ActionCtx } from '../_generated/server'
import { asR2ObjectRef } from './fileStorage'

const PRIVATE_CACHE = 'private, max-age=31536000'

export type StoreR2ArtifactArgs = {
  r2: R2
  ctx: ActionCtx
  key: string
  body: Blob | ArrayBuffer
  contentType: string
  downloadFilename: string
}

/**
 * Upload a blob to R2 with consistent cache/disposition headers. Returns `r2:<key>` ref.
 */
export async function storeR2Artifact({
  r2,
  ctx,
  key,
  body,
  contentType,
  downloadFilename,
}: StoreR2ArtifactArgs): Promise<string> {
  const blob = body instanceof Blob ? body : new Blob([body], { type: contentType })

  await r2.store(ctx, blob, {
    key,
    type: contentType,
    disposition: `attachment; filename="${downloadFilename}"`,
    cacheControl: PRIVATE_CACHE,
  })

  return asR2ObjectRef(key)
}
