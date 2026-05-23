import { asNonEmptyString, asRecord } from './shared'
import type { CreateAdCreativeOptions } from './types'

export function normalizeMetaObjectTypeForCreate(
  objectType?: string,
): CreateAdCreativeOptions['objectType'] {
  switch (objectType) {
    case 'VIDEO':
      return 'VIDEO'
    case 'CAROUSEL_VIDEO':
      return 'CAROUSEL_VIDEO'
    case 'CAROUSEL_IMAGE':
    case 'CAROUSEL':
      return 'CAROUSEL_IMAGE'
    case 'DYNAMIC_CAROUSEL':
    case 'DYNAMIC':
      return 'DYNAMIC_CAROUSEL'
    default:
      return 'IMAGE'
  }
}

export function parseAssetFeedSpecForApi(
  assetFeedSpec?: string | unknown[],
): Record<string, unknown> | undefined {
  if (typeof assetFeedSpec === 'string' && assetFeedSpec.trim().length > 0) {
    try {
      const parsed = JSON.parse(assetFeedSpec) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      return undefined
    }
  }

  if (assetFeedSpec && typeof assetFeedSpec === 'object' && !Array.isArray(assetFeedSpec)) {
    return assetFeedSpec as Record<string, unknown>
  }

  return undefined
}

function assetFeedSpecHasCopyVariants(spec: Record<string, unknown>): boolean {
  const bodies = spec.bodies
  const titles = spec.titles
  return (Array.isArray(bodies) && bodies.length > 0) || (Array.isArray(titles) && titles.length > 0)
}

export function extractVideoThumbnailFromAssetFeed(
  assetFeedSpec?: string | unknown[],
): { imageUrl?: string; imageHash?: string } {
  const spec = parseAssetFeedSpecForApi(assetFeedSpec)
  if (!spec) return {}

  const videos = spec.videos
  if (!Array.isArray(videos) || videos.length === 0) return {}

  const firstVideo = asRecord(videos[0])
  return {
    imageUrl: asNonEmptyString(firstVideo?.thumbnail_url),
    imageHash: asNonEmptyString(firstVideo?.thumbnail_hash) ?? asNonEmptyString(firstVideo?.image_hash),
  }
}

export function parseCarouselChildAttachmentsOption(options: {
  carouselChildAttachments?: unknown[]
  assetFeedSpec?: string | unknown[]
}): unknown[] | undefined {
  if (Array.isArray(options.carouselChildAttachments) && options.carouselChildAttachments.length > 0) {
    return options.carouselChildAttachments
  }
  const raw = options.assetFeedSpec
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
  }
  if (typeof raw === 'string' && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    } catch {
      return undefined
    }
  }
  return undefined
}

export function assetFeedSpecUsesCopyVariants(assetFeedSpec?: string | unknown[]): boolean {
  const apiAssetFeedSpec = parseAssetFeedSpecForApi(assetFeedSpec)
  return apiAssetFeedSpec ? assetFeedSpecHasCopyVariants(apiAssetFeedSpec) : false
}

export function applyInstagramPlacement(
  objectStorySpec: Record<string, unknown>,
  options: { instagramActorId?: string; instagramUserId?: string },
): void {
  const actorId = asNonEmptyString(options.instagramActorId)
  const userId = asNonEmptyString(options.instagramUserId)

  if (actorId) {
    objectStorySpec.instagram_actor_id = actorId
    return
  }

  if (userId) {
    objectStorySpec.instagram_user_id = userId
  }
}
