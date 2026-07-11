import type { R2 } from '@convex-dev/r2'

import type { ActionCtx } from '../_generated/server'
import { asR2ObjectRef } from './fileStorage'

const PRIVATE_CACHE = 'private, max-age=31536000'

/** @convex-dev/r2 types runQuery like QueryCtx; ActionCtx is compatible at runtime. */
type R2StoreCtx = Parameters<R2['store']>[0]

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
  const maxAttempts = 3
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await r2.store(ctx as unknown as R2StoreCtx, blob, {
        key,
        type: contentType,
        disposition: `attachment; filename="${downloadFilename}"`,
        cacheControl: PRIVATE_CACHE,
      })
      return asR2ObjectRef(key)
    } catch (err) {
      lastError = err
      if (attempt < maxAttempts - 1) {
        const delayMs = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }
  throw lastError
}
