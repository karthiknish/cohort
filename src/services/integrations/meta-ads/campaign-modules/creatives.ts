// =============================================================================
// CREATIVES - Ad creative fetching and processing
// =============================================================================

import { logger } from '@/lib/logger'
import {
  appendMetaAuthParams,
  META_API_BASE,
} from '../client'
import { optimizeMetaImageUrl, isSignedMetaThumbnail, metaPageIdFromObjectStoryId } from '../utils'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import type { MetaCreative, MetaAdsListResponse, MetaAdData, MetaAdCreative } from '../types'
import { extractLeadGenFormId } from './objectives/leads'

function collectUniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = typeof value === 'string' ? value.trim() : ''
    if (!normalized) continue

    const key = normalized.toLowerCase()
    if (seen.has(key)) continue

    seen.add(key)
    result.push(normalized)
  }

  return result
}

function collectAssetText(entries?: Array<{ text?: string }>): string[] {
  return collectUniqueStrings((entries ?? []).map((entry) => entry.text))
}

function formatMetaCallToAction(callToAction?: {
  type?: string
  name?: string
} | null, fallbackType?: string): string | undefined {
  const type = callToAction?.type ?? fallbackType
  const name = callToAction?.name

  if (type && name) return `${name} (${type})`
  return type || name || undefined
}

export function extractMetaCreativeContent(creative?: MetaAdCreative) {
  const storySpec = creative?.object_story_spec
  const assetFeedSpec = creative?.asset_feed_spec
  const childAttachments = storySpec?.link_data?.child_attachments ?? []

  const primaryTexts = collectUniqueStrings([
    creative?.body,
    storySpec?.link_data?.message,
    storySpec?.video_data?.message,
    storySpec?.photo_data?.message,
    storySpec?.text_data?.message,
    storySpec?.template_data?.message,
    ...childAttachments.flatMap((c) => [c.message]),
    ...collectAssetText(assetFeedSpec?.bodies),
  ])

  const headlines = collectUniqueStrings([
    creative?.title,
    storySpec?.link_data?.name,
    storySpec?.video_data?.title,
    storySpec?.template_data?.name,
    ...childAttachments.flatMap((c) => [c.name]),
    ...collectAssetText(assetFeedSpec?.titles),
  ])

  const supportingDescriptions = collectUniqueStrings([
    storySpec?.link_data?.description,
    storySpec?.template_data?.description,
    ...childAttachments.flatMap((c) => [c.description]),
    ...collectAssetText(assetFeedSpec?.descriptions),
  ])

  const landingPageUrl = collectUniqueStrings([
    creative?.link_url,
    storySpec?.link_data?.link,
    storySpec?.template_data?.link,
    storySpec?.link_data?.call_to_action?.value?.link,
    storySpec?.video_data?.call_to_action?.value?.link,
    storySpec?.template_data?.call_to_action?.value?.link,
    ...childAttachments.flatMap((c) => [
      c.link,
      c.call_to_action?.value?.link,
    ]),
    assetFeedSpec?.link_urls?.[0]?.website_url,
    creative?.destination_spec?.url,
    creative?.destination_spec?.fallback_url,
  ])[0]

  const callToAction = formatMetaCallToAction(
    storySpec?.link_data?.call_to_action
      ?? storySpec?.video_data?.call_to_action
      ?? storySpec?.template_data?.call_to_action
      ?? childAttachments[0]?.call_to_action,
    creative?.call_to_action_type
  )

  return {
    primaryTexts,
    primaryText: primaryTexts[0],
    headlines,
    supportingDescriptions,
    landingPageUrl,
    callToAction,
  }
}

/** UI / storage label from Meta creative shape (not same as API `object_type`). */
export function inferMetaDisplayAdType(options: {
  leadgenFormId?: string
  objectType?: string
  storySpec?: MetaAdCreative['object_story_spec']
  assetFeedSpec?: MetaAdCreative['asset_feed_spec']
  objectStoryId?: string
  effectiveObjectStoryId?: string
}): string {
  const { leadgenFormId, objectType, storySpec, assetFeedSpec, objectStoryId, effectiveObjectStoryId } = options
  if (leadgenFormId) return 'lead_generation'

  const hasPostReference = Boolean(
    (typeof objectStoryId === 'string' && objectStoryId.trim().length > 0)
    || (typeof effectiveObjectStoryId === 'string' && effectiveObjectStoryId.trim().length > 0)
  )
  const hasMeaningfulStorySpec = Boolean(
    storySpec?.link_data
    || storySpec?.video_data
    || storySpec?.template_data
    || storySpec?.photo_data
    || storySpec?.text_data
  )
  if (hasPostReference && !hasMeaningfulStorySpec) {
    return 'boosted_post'
  }

  const attachments = storySpec?.link_data?.child_attachments ?? []
  const childCount = attachments.length
  const childHasVideo = attachments.some((a) => a?.video_id)

  if (childCount >= 2) return 'carousel'

  const hasStoryVideo =
    Boolean(storySpec?.video_data?.video_id)
    || objectType === 'VIDEO'
    || (childCount === 1 && childHasVideo)

  if (hasStoryVideo) return 'video'

  const afVideoCount = assetFeedSpec?.videos?.filter((v) => v?.video_id)?.length ?? 0
  if (afVideoCount > 0 && !storySpec?.template_data) return 'video'

  const template = storySpec?.template_data
  const hasTemplate = Boolean(template && (template.message || template.name || template.link))
  if (hasTemplate) return 'dynamic_product'

  const bodies = assetFeedSpec?.bodies?.length ?? 0
  const titles = assetFeedSpec?.titles?.length ?? 0
  const images = assetFeedSpec?.images?.length ?? 0
  const videos = assetFeedSpec?.videos?.length ?? 0
  const isMultiAssetFeed =
    bodies > 1
    || titles > 1
    || images > 1
    || videos > 1
    || (bodies >= 1 && titles >= 1 && bodies + titles + images + videos > 2)

  if (isMultiAssetFeed) return 'dynamic_creative'

  if (objectType === 'PHOTO') return 'image'

  return 'sponsored_content'
}

// =============================================================================
// FETCH CREATIVES
// =============================================================================

export async function fetchMetaCreatives(options: {
  accessToken: string
  adAccountId: string
  campaignId?: string
  adSetId?: string
  statusFilter?: ('ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED')[]
  maxRetries?: number
  includeVideoMedia?: boolean
  videoLookupLimit?: number
  /** Max Graph API pages (100 ads each) when paging `after` cursor. */
  maxPages?: number
}): Promise<MetaCreative[]> {
  const {
    accessToken,
    adAccountId,
    campaignId,
    adSetId,
    statusFilter = ['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED'],
    maxRetries = 3,
    includeVideoMedia = false,
    videoLookupLimit = 20,
    maxPages = 25,
  } = options

  logger.info('[Meta Ads] Fetching creatives', { 
    adAccountId, 
    campaignId, 
    adSetId, 
    statusFilter,
    includeVideoMedia,
    maxRetries,
    maxPages,
  })

  // Ensure adAccountId has act_ prefix if it's just a number
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const adFields = [
    'id',
    'name',
    'status',
    'effective_status',
    'adset_id',
    'campaign_id',
    'creative',
    'leadgen_form_id',
    'adcreatives{id,name,body,title,link_url,thumbnail_url,image_url,full_picture,images,image_hash,url_tags,platform_customizations,source_instagram_media_id,instagram_permalink_url,effective_instagram_media_id,portrait_customizations,call_to_action_type,object_type,destination_spec,asset_feed_spec,object_story_id,effective_object_story_id,branded_content_sponsor_page_id,facebook_branded_content{sponsor_page_id,shared_to_sponsor_status},instagram_branded_content{sponsor_id,sponsor_asset_id},object_story_spec{page_id,instagram_actor_id,link_data{link,message,picture,image_hash,call_to_action{type,value},name,caption,description,child_attachments{link,message,picture,image_hash,name,caption,description,video_id,call_to_action{type,value}}},video_data{video_id,message,title,call_to_action{type,value}},photo_data{message},text_data{message},template_data{link,message,name,caption,description,call_to_action{type,value}}}}',
  ].join(',')

  const filtering: Array<{ field: string; operator: string; value: string | string[] }> = []

  if (statusFilter.length > 0) {
    filtering.push({
      field: 'effective_status',
      operator: 'IN',
      value: statusFilter,
    })
  }

  if (campaignId) {
    filtering.push({
      field: 'campaign.id',
      operator: 'EQUAL',
      value: campaignId!,
    })
  }

  if (adSetId) {
    filtering.push({
      field: 'adset.id',
      operator: 'EQUAL',
      value: adSetId!,
    })
  }

  const ads: MetaAdData[] = []
  let after: string | undefined
  let pendingNextUrl: string | undefined

  for (let page = 0; page < maxPages; page += 1) {
    let url: string

    if (pendingNextUrl) {
      url = pendingNextUrl
      pendingNextUrl = undefined
    } else {
      const params = new URLSearchParams({
        fields: adFields,
        limit: '100',
      })

      if (after) {
        params.set('after', after)
      }

      if (filtering.length > 0) {
        params.set('filtering', JSON.stringify(filtering))
      }

      await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

      url = `${META_API_BASE}/${formattedAccountId}/ads?${params.toString()}`
    }

    const { payload } = await metaAdsClient.executeRequest<MetaAdsListResponse>({
      url,
      operation: `fetchCreatives:page${page}`,
      maxRetries,
    })

    const chunk = Array.isArray(payload?.data) ? (payload.data as MetaAdData[]) : []
    ads.push(...chunk)

    if (chunk.length === 0) {
      break
    }

    const nextAfter = payload?.paging?.cursors?.after
    const resolvedAfter = typeof nextAfter === 'string' && nextAfter.length > 0 ? nextAfter : undefined
    const rawNext =
      typeof payload?.paging?.next === 'string' && payload.paging.next.trim().length > 0
        ? payload.paging.next.trim()
        : undefined

    if (resolvedAfter) {
      after = resolvedAfter
      continue
    }

    after = undefined
    if (rawNext) {
      pendingNextUrl = rawNext
      continue
    }

    break
  }

  // Collect unique Page and Instagram Actor IDs
  const accountIds = Array.from(
    new Set(
      ads.flatMap((ad) => {
        const creative = ad.adcreatives?.data?.[0]
        const spec = creative?.object_story_spec
        const pageFromBoost =
          metaPageIdFromObjectStoryId(creative?.object_story_id)
          || metaPageIdFromObjectStoryId(creative?.effective_object_story_id)
        const sponsorPageId =
          creative?.branded_content_sponsor_page_id
          || creative?.facebook_branded_content?.sponsor_page_id
        return [
          spec?.page_id,
          spec?.instagram_actor_id,
          pageFromBoost,
          sponsorPageId,
        ].filter((id): id is string => typeof id === 'string' && id.length > 0)
      })
    )
  )

  let accountDetails: Record<string, { name: string; picture?: string }> = {}
  if (accountIds.length > 0) {
    const accountParams = new URLSearchParams({
      ids: accountIds.join(','),
      fields: 'name,picture.type(large)',
    })
    await appendMetaAuthParams({ params: accountParams, accessToken, appSecret: process.env.META_APP_SECRET })
    const accountUrl = `${META_API_BASE}/?${accountParams.toString()}`

    const { payload: accountPayload } = await metaAdsClient.executeRequest<Record<string, { name?: string; picture?: { data?: { url?: string } } }>>({
      url: accountUrl,
      operation: 'fetchAccountDetails',
      maxRetries,
    })

    if (accountPayload) {
      accountDetails = Object.fromEntries(
        Object.entries(accountPayload).map(([id, data]) => [
          id,
          {
            name: data.name ?? 'Unknown Account',
            picture: data.picture?.data?.url,
          },
        ])
      )
    }
  }

  // Base mapping first
  const baseCreatives = ads
    .map((ad) => {
      const creative = Array.isArray(ad.adcreatives?.data) && ad.adcreatives.data.length > 0 ? ad.adcreatives.data[0] : undefined
      const storySpec = creative?.object_story_spec

      // Determine which account to use (prefer Instagram if available, fallback to Page)
      const accountId = storySpec?.instagram_actor_id || storySpec?.page_id
      const account = accountId ? accountDetails[accountId] : undefined

      const leadgenFormId = extractLeadGenFormId(ad, creative)
      const isLeadGenFlag = !!leadgenFormId

      // For lead gen ads without traditional creatives, provide minimal info
      if (!creative && isLeadGenFlag) {
        return {
          adId: ad.id ?? '',
          adSetId: ad.adset_id ?? '',
          campaignId: ad.campaign_id ?? '',
          adName: ad.name,
          status: (ad.effective_status ?? ad.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
          creativeId: ad.creative?.id,
          creativeName: undefined,
          type: 'lead_generation',
          callToAction: 'Sign Up',
          // Mark as lead gen for UI handling
          isLeadGen: true,
          leadgenFormId,
        }
      }

      // Skip ads with no creative data and not lead gen
      if (!creative) {
        return null
      }

      // Extract image from asset_feed_spec for lead gen and dynamic creative ads
      // asset_feed_spec contains image/video references for ads using dynamic creative or lead gen
      const assetFeedSpec = creative?.asset_feed_spec
      const content = extractMetaCreativeContent(creative)
      const assetFeedImageUrl = assetFeedSpec?.images?.[0]?.url
      const assetFeedVideoThumbnail = assetFeedSpec?.videos?.[0]?.thumbnail_url
      const firstCarouselPicture = storySpec?.link_data?.child_attachments?.[0]?.picture
      const serializedAssetFeedSpec = assetFeedSpec ? JSON.stringify(assetFeedSpec) : undefined

      // Determine if this is an Instagram-focused creative (has Instagram actor or platform customization)
      const isInstagramCreative = !!(storySpec?.instagram_actor_id || creative?.platform_customizations?.instagram)

      // Prefer high-quality image sources in this order:
      // 1. full_picture - Highest quality image from Meta (per API docs, this is the best quality)
      // 2. images.data[0].url - Native image URL from Meta's images array
      // 3. asset_feed_spec images / video thumbnails - DCO and video-first feeds
      // 4. platform_customizations.instagram.image_url - Instagram-specific high quality image
      // 5. platform_customizations.facebook.image_url - Facebook-specific high quality image
      // 6. first carousel card picture
      // 7. object_story_spec.link_data.picture - Original uploaded image URL
      // 8. image_url - Standard quality image
      // 9. thumbnail_url (unsigned) - Preview image if not signed
      // 10. thumbnail_url (signed) - LAST RESORT: signed thumbnails often fail or are blurry
      const creativeFullPicture = creative?.full_picture
      const nativeImageUrl = creative?.images?.data?.[0]?.url
      const instagramCustomImageUrl = creative?.platform_customizations?.instagram?.image_url
      const facebookCustomImageUrl = creative?.platform_customizations?.facebook?.image_url
      const storySpecPicture = storySpec?.link_data?.picture
      const creativeImageUrl = creative?.image_url
      const creativeThumbnailUrl = creative?.thumbnail_url
      
      // Check if thumbnail is signed (these often fail or return blurry images)
      const isThumbnailSigned = isSignedMetaThumbnail(creativeThumbnailUrl)

      // Use the best available image source, optimized for Meta CDN quality
      // For Instagram creatives, prefer Instagram-specific images, otherwise fall back to general images
      const rawImageUrl = creativeFullPicture
        || nativeImageUrl
        || assetFeedImageUrl
        || assetFeedVideoThumbnail
        || (isInstagramCreative ? instagramCustomImageUrl : null)
        || facebookCustomImageUrl
        || firstCarouselPicture
        || storySpecPicture
        || creativeImageUrl
        || (!isThumbnailSigned ? creativeThumbnailUrl : null)
        || creativeThumbnailUrl // Last resort: signed thumbnail even if it might fail
        
      const imageUrl = rawImageUrl ? optimizeMetaImageUrl(rawImageUrl) : undefined

      // Extract call to action with both type and name (name is the button text)
      const callToAction = content.callToAction

      const objectType = creative?.object_type
      const firstChildVideoId = storySpec?.link_data?.child_attachments?.find((c) => c?.video_id)?.video_id
      const assetFeedVideoId = assetFeedSpec?.videos?.[0]?.video_id
      const videoId =
        storySpec?.video_data?.video_id
        || firstChildVideoId
        || assetFeedVideoId

      const adType = inferMetaDisplayAdType({
        leadgenFormId,
        objectType,
        storySpec,
        assetFeedSpec,
        objectStoryId: creative?.object_story_id,
        effectiveObjectStoryId: creative?.effective_object_story_id,
      })

      const resolvedPageId =
        storySpec?.page_id
        || metaPageIdFromObjectStoryId(creative?.object_story_id)
        || metaPageIdFromObjectStoryId(creative?.effective_object_story_id)

      return {
        adId: ad.id ?? '',
        adSetId: ad.adset_id ?? '',
        campaignId: ad.campaign_id ?? '',
        adName: ad.name,
        status: (ad.effective_status ?? ad.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
        creativeId: creative?.id || ad.creative?.id,
        creativeName: creative?.name || ad.creative?.name,
        type: adType,
        thumbnailUrl: optimizeMetaImageUrl(creativeThumbnailUrl) || imageUrl,
        imageUrl,
        imageHash:
          creative?.image_hash
          || storySpec?.link_data?.image_hash
          || storySpec?.link_data?.child_attachments?.[0]?.image_hash
          || creative?.images?.data?.[0]?.hash
          || creative?.platform_customizations?.instagram?.image_hash
          || creative?.platform_customizations?.facebook?.image_hash,
        callToAction: isLeadGenFlag ? 'Sign Up' : callToAction,
        landingPageUrl: content.landingPageUrl,
        videoId,
        message: content.primaryText,
        descriptions: content.primaryTexts,
        pageName: account?.name,
        pageProfileImageUrl: optimizeMetaImageUrl(account?.picture),
        instagramPermalinkUrl: creative?.instagram_permalink_url,
        sourceInstagramMediaId: creative?.source_instagram_media_id,
        effectiveInstagramMediaId: creative?.effective_instagram_media_id,
        objectStoryId: creative?.object_story_id,
        effectiveObjectStoryId: creative?.effective_object_story_id,
        brandedContentSponsorPageId: creative?.branded_content_sponsor_page_id,
        facebookBrandedSponsorPageId: creative?.facebook_branded_content?.sponsor_page_id,
        instagramBrandedSponsorId: creative?.instagram_branded_content?.sponsor_id,
        objectType,
        pageId: resolvedPageId,
        instagramActorId: storySpec?.instagram_actor_id,
        assetFeedSpec: serializedAssetFeedSpec,
        destinationSpec: creative?.destination_spec,
        headlines: content.headlines,
        // Lead gen specific fields
        isLeadGen: isLeadGenFlag,
        leadgenFormId,
      }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  if (!includeVideoMedia) {
    return baseCreatives
  }

  const videoIds = Array.from(
    new Set(
      baseCreatives
        .map((c) => c.videoId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    )
  ).slice(0, Math.max(0, videoLookupLimit))

  if (videoIds.length === 0) {
    return baseCreatives
  }

  const videoInfoEntries = await Promise.all(
    videoIds.map(async (videoId) => {
      try {
        const videoParams = new URLSearchParams({
          fields: 'source,picture,thumbnails{uri,width,height}',
        })
        await appendMetaAuthParams({ params: videoParams, accessToken, appSecret: process.env.META_APP_SECRET })
        const videoUrl = `${META_API_BASE}/${videoId}?${videoParams.toString()}`

        const { payload: videoPayload } = await metaAdsClient.executeRequest<{
          source?: string
          picture?: string
          thumbnails?: { data?: Array<{ uri?: string; width?: number; height?: number }> }
        }>({
          url: videoUrl,
          operation: 'fetchVideoMedia',
          maxRetries,
        })

        // Select the largest thumbnail if available
        let picture = videoPayload?.picture
        const thumbnails = videoPayload?.thumbnails?.data
        if (Array.isArray(thumbnails) && thumbnails.length > 0) {
          const sorted = [...thumbnails].sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)))
          if (sorted[0]?.uri) {
            picture = sorted[0].uri
          }
        }

        // Use thumbnails if picture is not available (thumbnails are higher quality)
        const finalPicture = picture || (thumbnails?.[0]?.uri)

        return [videoId, {
          source: videoPayload?.source,
          picture: optimizeMetaImageUrl(finalPicture),
        }] as const
      } catch (err) {
        console.warn(`[Meta Ads] Failed to fetch video info for ${videoId}:`, err instanceof Error ? err.message : err)
        return [videoId, {}] as const
      }
    })
  )

  const videoInfoById = Object.fromEntries(videoInfoEntries) as Record<string, { source?: string; picture?: string }>

  return baseCreatives.map((creative) => {
    const id = creative.videoId
    if (!id) return creative

    const info = videoInfoById[id]
    if (!info) return creative

    return {
      ...creative,
      videoSourceUrl: info.source,
      videoThumbnailUrl: info.picture,
      // If the creative is a video, prefer the high-quality video thumbnail for the image preview.
      imageUrl: optimizeMetaImageUrl(info.picture) || creative.imageUrl,
    }
  })
}
