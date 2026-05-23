'use node'

import { Errors } from '../errors'
import { optimizeMetaImageUrl } from '../../src/services/integrations/meta-ads/utils'
import type { GoogleCreative } from '../../src/services/integrations/google-ads'
import type { TikTokCreative } from '../../src/services/integrations/tiktok-ads'
import type { LinkedInAd, LinkedInCreative } from '../../src/services/integrations/linkedin-ads'
import type { MetaCreative } from '../../src/services/integrations/meta-ads'

export function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export function normalizeClientId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function isTokenExpiringSoon(expiresAtMs: number | null | undefined): boolean {
  if (typeof expiresAtMs !== 'number' || !Number.isFinite(expiresAtMs)) return false
  const fiveMinutes = 5 * 60 * 1000
  return expiresAtMs - Date.now() <= fiveMinutes
}

export function sanitizeIdempotencyToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_')
}

export function buildCreateCreativeIdempotencyKey(args: {
  workspaceId: string
  providerId: string
  idempotencyKey?: string
}): string | null {
  if (typeof args.idempotencyKey !== 'string') return null

  const trimmed = args.idempotencyKey.trim()
  if (trimmed.length === 0) return null

  const safeKey = sanitizeIdempotencyToken(trimmed).slice(0, 128)
  if (safeKey.length === 0) return null

  const safeWorkspaceId = sanitizeIdempotencyToken(args.workspaceId).slice(0, 64)
  const safeProviderId = sanitizeIdempotencyToken(args.providerId).slice(0, 32)

  return `adsCreative_${safeWorkspaceId}_${safeProviderId}_${safeKey}`
}

export type NormalizedCreative = {
  providerId: string
  creativeId: string
  adId?: string
  platformCreativeId?: string
  adGroupId?: string
  campaignId: string
  campaignName?: string
  name?: string
  type: string
  status: string
  headlines?: string[]
  descriptions?: string[]
  imageUrl?: string
  thumbnailUrl?: string
  videoUrl?: string
  videoId?: string
  imageHash?: string
  landingPageUrl?: string
  callToAction?: string
  pageName?: string
  pageProfileImageUrl?: string
  objectType?: string
  pageId?: string
  instagramActorId?: string
  assetFeedSpec?: string
  destinationSpec?: {
    url?: string
    fallback_url?: string
    additional_urls?: string[]
    website?: {
      optimization?: {
        status?: string
        type?: string
      }
    }
  }
  // Lead gen and additional fields
  isLeadGen?: boolean
  leadgenFormId?: string
  instagramPermalinkUrl?: string
  objectStoryId?: string
  effectiveObjectStoryId?: string
  brandedContentSponsorPageId?: string
  facebookBrandedSponsorPageId?: string
  instagramBrandedSponsorId?: string
}

export type CreateCreativeResult = {
  success: boolean
  creativeId: string
  adId?: string
  status?: 'ACTIVE' | 'PAUSED'
}

export type IdempotencyClaimResult =
  | { type: 'new' }
  | { type: 'pending' }
  | { type: 'completed'; response: unknown; httpStatus: number | null }

export function normalizeGoogleCreatives(creatives: GoogleCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'google',
    creativeId: c.adId,
    adGroupId: c.adGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adGroupName,
    type: c.type,
    status: c.status,
    headlines: c.headlines,
    descriptions: c.descriptions,
    imageUrl: c.imageUrl,
    videoId: c.videoId,
    videoUrl: c.videoId ? `https://www.youtube.com/watch?v=${c.videoId}` : undefined,
    landingPageUrl: c.finalUrls?.[0],
    callToAction: c.callToAction,
  }))
}

export function normalizeTikTokCreatives(creatives: TikTokCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'tiktok',
    creativeId: c.adId,
    adGroupId: c.adGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adName,
    type: c.format ?? 'video',
    status: c.status,
    headlines: c.title ? [c.title] : undefined,
    descriptions: c.description ? [c.description] : undefined,
    imageUrl: c.thumbnailUrl,
    videoUrl: c.videoUrl,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
  }))
}

export function normalizeLinkedInCreatives(creatives: LinkedInCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'linkedin',
    creativeId: c.creativeId,
    adGroupId: c.campaignGroupId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.title || c.headline || `LinkedIn Creative ${c.creativeId}`,
    type: c.type,
    status: c.status,
    headlines: c.headline ? [c.headline] : undefined,
    descriptions: c.description ? [c.description] : undefined,
    imageUrl: c.imageUrl,
    videoUrl: c.videoUrl,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
  }))
}

export function normalizeLinkedInAds(ads: LinkedInAd[]): NormalizedCreative[] {
  return ads.map((a) => ({
    providerId: 'linkedin',
    creativeId: a.creativeId,
    adGroupId: a.campaignGroupId,
    campaignId: a.campaignId,
    name: a.name || `LinkedIn Ad ${a.id}`,
    type: a.type || 'ad',
    status: a.status,
  }))
}

export function normalizeMetaCreatives(creatives: MetaCreative[]): NormalizedCreative[] {
  return creatives.map((c) => ({
    providerId: 'facebook',
    creativeId: c.adId,
    adId: c.adId,
    platformCreativeId: c.creativeId,
    adGroupId: c.adSetId,
    campaignId: c.campaignId,
    campaignName: c.campaignName,
    name: c.adName ?? c.creativeName,
    type: c.type ?? 'sponsored_content',
    status: c.status,
    headlines: c.headlines,
    descriptions: c.descriptions ?? (c.message ? [c.message] : undefined),
    message: c.message,
    // Try to get best quality image, fallback to thumbnail
    imageUrl: optimizeMetaImageUrl(c.imageUrl) ?? optimizeMetaImageUrl(c.videoThumbnailUrl) ?? optimizeMetaImageUrl(c.thumbnailUrl),
    // Keep original thumbnail for fallback if optimized fails
    thumbnailUrl: c.thumbnailUrl,
    videoUrl: c.videoSourceUrl ?? (c.videoId ? `https://www.facebook.com/video.php?v=${c.videoId}` : undefined),
    videoId: c.videoId,
    imageHash: c.imageHash,
    landingPageUrl: c.landingPageUrl,
    callToAction: c.callToAction,
    pageName: c.pageName,
    pageProfileImageUrl: optimizeMetaImageUrl(c.pageProfileImageUrl),
    objectType: c.objectType,
    pageId: c.pageId,
    instagramActorId: c.instagramActorId,
    assetFeedSpec: c.assetFeedSpec,
    destinationSpec: c.destinationSpec,
    // Lead gen specific fields
    isLeadGen: c.isLeadGen,
    leadgenFormId: c.leadgenFormId,
    instagramPermalinkUrl: c.instagramPermalinkUrl,
    objectStoryId: c.objectStoryId,
    effectiveObjectStoryId: c.effectiveObjectStoryId,
    brandedContentSponsorPageId: c.brandedContentSponsorPageId,
    facebookBrandedSponsorPageId: c.facebookBrandedSponsorPageId,
    instagramBrandedSponsorId: c.instagramBrandedSponsorId,
  }))
}
