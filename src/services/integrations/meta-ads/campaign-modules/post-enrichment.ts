import { appendMetaAuthParams, META_API_BASE } from '../client'
import { optimizeMetaImageUrl } from '../utils'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import type { MetaCreative } from '../types'

export type MetaObjectStoryMedia = {
  imageUrl?: string
  thumbnailUrl?: string
  videoUrl?: string
  message?: string
  permalinkUrl?: string
}

const POST_FIELDS = [
  'id',
  'message',
  'full_picture',
  'picture',
  'permalink_url',
  'attachments{media_type,media{image{src},video{source}}}',
].join(',')

function pickPostAttachmentMedia(
  attachments?: Array<{
    media_type?: string
    media?: { image?: { src?: string }; video?: { source?: string } }
  }>,
): { imageUrl?: string; videoUrl?: string } {
  if (!Array.isArray(attachments)) return {}

  for (const attachment of attachments) {
    const type = attachment.media_type
    const media = attachment.media
    if (type === 'photo' && media?.image?.src) {
      return { imageUrl: media.image.src }
    }
    if (type === 'video' && media?.video?.source) {
      return { videoUrl: media.video.source }
    }
  }

  return {}
}

/**
 * Fetches media for a boosted / existing page post referenced by `object_story_id`
 * (`{pageId}_{postId}` composite id accepted by the Graph API).
 */
export async function fetchMetaObjectStoryMedia(options: {
  accessToken: string
  objectStoryId: string
  maxRetries?: number
}): Promise<MetaObjectStoryMedia | null> {
  const trimmed = options.objectStoryId.trim()
  if (!trimmed) return null

  const params = new URLSearchParams({ fields: POST_FIELDS })
  await appendMetaAuthParams({
    params,
    accessToken: options.accessToken,
    appSecret: process.env.META_APP_SECRET,
  })

  const url = `${META_API_BASE}/${trimmed}?${params.toString()}`

  type PostGraphPayload = {
    id?: string
    message?: string
    full_picture?: string
    picture?: string
    permalink_url?: string
    attachments?: {
      data?: Array<{
        media_type?: string
        media?: { image?: { src?: string }; video?: { source?: string } }
      }>
    }
  }

  try {
    const { payload } = await metaAdsClient.executeRequest<PostGraphPayload>({
      url,
      operation: 'fetchMetaObjectStoryMedia',
      maxRetries: options.maxRetries ?? 2,
    })

    if (!payload?.id) return null

    const fromAttachments = pickPostAttachmentMedia(payload.attachments?.data)
    const imageUrl = payload.full_picture || payload.picture || fromAttachments.imageUrl
    const videoUrl = fromAttachments.videoUrl

    return {
      imageUrl: imageUrl ? optimizeMetaImageUrl(imageUrl) : undefined,
      thumbnailUrl: imageUrl ? optimizeMetaImageUrl(imageUrl) : undefined,
      videoUrl: videoUrl || undefined,
      message: payload.message?.trim() || undefined,
      permalinkUrl: payload.permalink_url?.trim() || undefined,
    }
  } catch {
    return null
  }
}

export function needsObjectStoryMediaEnrichment(creative: MetaCreative): boolean {
  const effectiveObjectStoryId =
    typeof creative.effectiveObjectStoryId === 'string' ? creative.effectiveObjectStoryId.trim() : ''
  const objectStoryId =
    typeof creative.objectStoryId === 'string' ? creative.objectStoryId.trim() : ''
  const storyId = effectiveObjectStoryId || objectStoryId

  if (!storyId) return false

  const hasImage = Boolean(creative.imageUrl?.trim())
  const hasVideo = Boolean(creative.videoId?.trim())

  if (!storyId) return false
  if (hasImage) return false

  // Boosted posts: fetch page post media even when the underlying post is a video.
  if (creative.type === 'boosted_post') {
    return true
  }

  if (hasVideo) return false

  return true
}

/**
 * Resolves thumbnails and copy for boosted page posts that Meta omits from `adcreatives`.
 */
export async function enrichMetaCreativesWithObjectStoryMedia(
  accessToken: string,
  creatives: MetaCreative[],
  options?: { maxConcurrent?: number; maxRetries?: number },
): Promise<MetaCreative[]> {
  const maxConcurrent = Math.max(1, Math.min(20, options?.maxConcurrent ?? 8))
  const maxRetries = options?.maxRetries ?? 2

  const indices = creatives.flatMap((creative, index) =>
    needsObjectStoryMediaEnrichment(creative) ? [{ creative, index }] : [],
  )

  if (indices.length === 0) return creatives

  const enriched = [...creatives]

  async function processBatch(batchIndex: number): Promise<void> {
    if (batchIndex * maxConcurrent >= indices.length) return

    const batch = indices.slice(batchIndex * maxConcurrent, (batchIndex + 1) * maxConcurrent)
    const results = await Promise.all(
      batch.map(async ({ creative, index }) => {
        const storyId =
          (typeof creative.effectiveObjectStoryId === 'string' && creative.effectiveObjectStoryId.trim()) ||
          (typeof creative.objectStoryId === 'string' && creative.objectStoryId.trim()) ||
          ''

        const media = await fetchMetaObjectStoryMedia({
          accessToken,
          objectStoryId: storyId,
          maxRetries,
        })

        if (!media) return { index, creative }

        const imageUrl = media.imageUrl ?? creative.imageUrl
        const thumbnailUrl = media.thumbnailUrl ?? creative.thumbnailUrl ?? imageUrl
        const message =
          creative.message ||
          (media.message && !creative.descriptions?.length ? media.message : undefined)

        const descriptions = creative.descriptions?.length
          ? creative.descriptions
          : message
            ? [message]
            : undefined

        const videoUrl = media.videoUrl ?? creative.videoSourceUrl

        return {
          index,
          creative: {
            ...creative,
            imageUrl,
            thumbnailUrl,
            videoSourceUrl: videoUrl,
            message,
            descriptions,
            landingPageUrl:
              creative.landingPageUrl || media.permalinkUrl || creative.landingPageUrl,
            instagramPermalinkUrl:
              creative.instagramPermalinkUrl || media.permalinkUrl || creative.instagramPermalinkUrl,
          },
        }
      }),
    )

    for (const { index, creative } of results) {
      if (creative) enriched[index] = creative
    }

    await processBatch(batchIndex + 1)
  }

  await processBatch(0)

  return enriched
}