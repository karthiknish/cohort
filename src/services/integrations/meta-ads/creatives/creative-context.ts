import { appendMetaAuthParams, META_API_BASE } from '../client'
import { metaAdsClient } from '@/services/integrations/shared/base-client'

import { asNonEmptyString, asRecord } from './shared'

export type MetaCreativeStoryContext = {
  pageId?: string
  instagramActorId?: string
  instagramUserId?: string
  videoId?: string
  videoImageUrl?: string
  videoImageHash?: string
}

async function readMetaCreativeStoryContext(options: {
  accessToken: string
  creativeId: string
  maxRetries?: number
}): Promise<MetaCreativeStoryContext> {
  const { accessToken, creativeId, maxRetries } = options
  const params = new URLSearchParams({ fields: 'object_story_spec' })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const { payload } = await metaAdsClient.executeRequest<{
    object_story_spec?: Record<string, unknown>
  }>({
    url: `${META_API_BASE}/${creativeId}?${params.toString()}`,
    operation: 'readMetaCreativeForUpdate',
    maxRetries,
  })

  const storySpec = asRecord(payload?.object_story_spec)
  const videoData = asRecord(storySpec?.video_data)

  return {
    pageId: asNonEmptyString(storySpec?.page_id),
    instagramActorId: asNonEmptyString(storySpec?.instagram_actor_id),
    instagramUserId: asNonEmptyString(storySpec?.instagram_user_id),
    videoId: asNonEmptyString(videoData?.video_id),
    videoImageUrl: asNonEmptyString(videoData?.image_url),
    videoImageHash: asNonEmptyString(videoData?.image_hash),
  }
}

export async function resolveMetaCreativeContextForEdit(options: {
  accessToken: string
  adId: string
  creativeId?: string
  pageId?: string
  instagramActorId?: string
  maxRetries?: number
}): Promise<MetaCreativeStoryContext> {
  const { accessToken, adId, creativeId, pageId, instagramActorId, maxRetries } = options

  const clientPageId = asNonEmptyString(pageId)
  const clientInstagramActorId = asNonEmptyString(instagramActorId)
  const context: MetaCreativeStoryContext = {}

  const mergeStoryContext = (storyContext: MetaCreativeStoryContext) => {
    context.pageId ??= storyContext.pageId
    context.instagramActorId ??= storyContext.instagramActorId
    context.instagramUserId ??= storyContext.instagramUserId
    context.videoId ??= storyContext.videoId
    context.videoImageUrl ??= storyContext.videoImageUrl
    context.videoImageHash ??= storyContext.videoImageHash
  }

  const tryReadCreative = async (currentCreativeId?: string) => {
    const normalizedCreativeId = asNonEmptyString(currentCreativeId)
    if (!normalizedCreativeId) return

    try {
      mergeStoryContext(
        await readMetaCreativeStoryContext({
          accessToken,
          creativeId: normalizedCreativeId,
          maxRetries,
        }),
      )
    } catch {
      // Keep the original error path if fallback lookup fails.
    }
  }

  await tryReadCreative(creativeId)

  context.pageId ??= clientPageId
  if (!context.instagramActorId && !context.instagramUserId && clientInstagramActorId) {
    context.instagramActorId = clientInstagramActorId
  }

  if (context.pageId && (context.instagramActorId || context.instagramUserId)) {
    return context
  }

  try {
    const params = new URLSearchParams({ fields: 'creative{id}' })
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

    const { payload } = await metaAdsClient.executeRequest<{
      creative?: Record<string, unknown>
    }>({
      url: `${META_API_BASE}/${adId}?${params.toString()}`,
      operation: 'readMetaAdForCreativeLookup',
      maxRetries,
    })

    const currentCreativeId = asNonEmptyString(asRecord(payload?.creative)?.id)

    if (currentCreativeId && currentCreativeId !== asNonEmptyString(creativeId)) {
      await tryReadCreative(currentCreativeId)
    }
  } catch {
    // Keep the original error path if fallback lookup fails.
  }

  return context
}
