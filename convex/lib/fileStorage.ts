import type { Id } from '../_generated/dataModel'
import type { ActionCtx, MutationCtx, QueryCtx } from '../_generated/server'

import { r2 } from '../r2'

const R2_OBJECT_PREFIX = 'r2:'

export function isR2ObjectRef(storageId: string): boolean {
  return storageId.startsWith(R2_OBJECT_PREFIX)
}

export function toR2ObjectKey(storageId: string): string {
  return isR2ObjectRef(storageId) ? storageId.slice(R2_OBJECT_PREFIX.length) : storageId
}

export function asR2ObjectRef(key: string): string {
  return `${R2_OBJECT_PREFIX}${key}`
}

type StorageReaderCtx = {
  storage: Pick<QueryCtx['storage'], 'getUrl'>
}

export async function resolveStoredObjectUrl(
  ctx: StorageReaderCtx,
  storageId: string,
  options?: { expiresIn?: number },
): Promise<string | null> {
  if (isR2ObjectRef(storageId)) {
    return r2.getUrl(toR2ObjectKey(storageId), options)
  }

  return ctx.storage.getUrl(storageId as Id<'_storage'>)
}

export async function loadStoredObjectBlob(
  ctx: Pick<ActionCtx, 'storage'>,
  storageId: string,
): Promise<Blob | null> {
  if (isR2ObjectRef(storageId)) {
    const url = await r2.getUrl(toR2ObjectKey(storageId))
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    return response.blob()
  }

  return ctx.storage.get(storageId as Id<'_storage'>)
}

export async function deleteStoredObject(ctx: MutationCtx, storageId: string): Promise<void> {
  if (isR2ObjectRef(storageId)) {
    await r2.deleteObject(ctx, toR2ObjectKey(storageId))
    return
  }

  await ctx.storage.delete(storageId as Id<'_storage'>)
}
