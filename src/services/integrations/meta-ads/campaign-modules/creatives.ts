// =============================================================================
// CREATIVES - Ad creative fetching and processing
// =============================================================================

import { logger } from '@/lib/logger'
import {
  appendMetaAuthParams,
  META_API_BASE,
} from '../client'
import { optimizeMetaImageUrl, isSignedMetaThumbnail } from '../utils'
import { metaAdsClient } from '@/services/integrations/shared/base-client'
import { MetaCreative, MetaAdsListResponse, MetaAdData, MetaAdCreative } from '../types'

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

  const primaryTexts = collectUniqueStrings([
    creative?.body,
    storySpec?.link_data?.message,
    storySpec?.video_data?.message,
    storySpec?.photo_data?.message,
    storySpec?.text_data?.message,
    storySpec?.template_data?.message,
    ...collectAssetText(assetFeedSpec?.bodies),
  ])

  const headlines = collectUniqueStrings([
    creative?.title,
    storySpec?.link_data?.name,
    storySpec?.video_data?.title,
    storySpec?.template_data?.name,
    ...collectAssetText(assetFeedSpec?.titles),
  ])

  const supportingDescriptions = collectUniqueStrings([
    storySpec?.link_data?.description,
    storySpec?.template_data?.description,
    ...collectAssetText(assetFeedSpec?.descriptions),
  ])

  const landingPageUrl = collectUniqueStrings([
    creative?.link_url,
    storySpec?.link_data?.link,
    storySpec?.template_data?.link,
    storySpec?.link_data?.call_to_action?.value?.link,
    storySpec?.video_data?.call_to_action?.value?.link,
    storySpec?.template_data?.call_to_action?.value?.link,
    assetFeedSpec?.link_urls?.[0]?.website_url,
    creative?.destination_spec?.url,
    creative?.destination_spec?.fallback_url,
  ])[0]

  const callToAction = formatMetaCallToAction(
    storySpec?.link_data?.call_to_action
      ?? storySpec?.video_data?.call_to_action
      ?? storySpec?.template_data?.call_to_action,
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
  } = options

  logger.info('[Meta Ads] Fetching creatives', { 
    adAccountId, 
    campaignId, 
    adSetId, 
    statusFilter,
    includeVideoMedia,
    maxRetries 
  })

  // Ensure adAccountId has act_ prefix if it's just a number
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

  const params = new URLSearchParams({
    fields: [
      'id',
      'name',
      'status',
      'effective_status',
      'adset_id',
      'campaign_id',
      'creative',
      // Include leadgen_form_id at ad level for lead gen detection
      'leadgen_form_id',
      // Include asset_feed_spec for lead gen and dynamic creative ads
      'adcreatives{id,name,body,title,link_url,thumbnail_url,image_url,full_picture,images,image_hash,url_tags,platform_customizations,source_instagram_media_id,instagram_permalink_url,effective_instagram_media_id,portrait_customizations,call_to_action_type,object_type,destination_spec,asset_feed_spec,object_story_spec{page_id,instagram_actor_id,link_data{link,message,picture,image_hash,call_to_action{type,value},name,caption,description},video_data{video_id,message,title,call_to_action{type,value}},photo_data{message},text_data{message},template_data{link,message,name,caption,description,call_to_action{type,value}}}}',
    ].join(','),
    limit: '100',
  })

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

  if (filtering.length > 0) {
    params.set('filtering', JSON.stringify(filtering))
  }

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${formattedAccountId}/ads?${params.toString()}`

  // Debug: log the request URL (sanitized)
  const sanitizedUrl = url.replace(/access_token=[^&]+/, 'access_token=***')
  console.log('[Meta Ads] fetchCreatives request:', sanitizedUrl)

  const { payload } = await metaAdsClient.executeRequest<MetaAdsListResponse>({
    url,
    operation: 'fetchCreatives',
    maxRetries,
  })

  console.log('[Meta Ads] fetchCreatives response keys:', payload ? Object.keys(payload) : 'null')

  const ads: MetaAdData[] = Array.isArray(payload?.data) ? (payload.data as MetaAdData[]) : []

  // Collect unique Page and Instagram Actor IDs
  const accountIds = Array.from(
    new Set(
      ads.flatMap((ad) => {
        const creative = ad.adcreatives?.data?.[0]
        const spec = creative?.object_story_spec
        return [spec?.page_id, spec?.instagram_actor_id].filter((id): id is string => typeof id === 'string' && id.length > 0)
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

      // Check if this is a lead generation ad (look for form ID in story spec)
      const storySpecCtaValue = storySpec?.link_data?.call_to_action?.value || storySpec?.video_data?.call_to_action?.value
      const creativeLeadgenFormId = (creative as (MetaAdCreative & { leadgen_form_id?: string }) | undefined)?.leadgen_form_id
      const leadgenFormId = storySpecCtaValue?.leadgen_form_id || ad.leadgen_form_id || creativeLeadgenFormId
      const isLeadGenAd = !!leadgenFormId

      // For lead gen ads without traditional creatives, provide minimal info
      if (!creative && isLeadGenAd) {
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
      // Get image from asset feed - used by lead gen and dynamic creative ads
      const assetFeedImageUrl = assetFeedSpec?.images?.[0]?.url
      const serializedAssetFeedSpec = assetFeedSpec ? JSON.stringify(assetFeedSpec) : undefined

      // Determine if this is an Instagram-focused creative (has Instagram actor or platform customization)
      const isInstagramCreative = !!(storySpec?.instagram_actor_id || creative?.platform_customizations?.instagram)

      // Prefer high-quality image sources in this order:
      // 1. full_picture - Highest quality image from Meta (per API docs, this is the best quality)
      // 2. images.data[0].url - Native image URL from Meta's images array
      // 3. asset_feed_spec images - For lead gen and dynamic creative ads
      // 4. platform_customizations.instagram.image_url - Instagram-specific high quality image
      // 5. platform_customizations.facebook.image_url - Facebook-specific high quality image
      // 6. object_story_spec.link_data.picture - Original uploaded image URL
      // 7. image_url - Standard quality image
      // 8. thumbnail_url (unsigned) - Preview image if not signed
      // 9. thumbnail_url (signed) - LAST RESORT: signed thumbnails often fail or are blurry
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
        || (isInstagramCreative ? instagramCustomImageUrl : null)
        || facebookCustomImageUrl
        || storySpecPicture
        || creativeImageUrl
        || (!isThumbnailSigned ? creativeThumbnailUrl : null)
        || creativeThumbnailUrl // Last resort: signed thumbnail even if it might fail
        
      const imageUrl = rawImageUrl ? optimizeMetaImageUrl(rawImageUrl) : undefined

      // Extract call to action with both type and name (name is the button text)
      const callToAction = content.callToAction

      // Determine ad type from object_type, creative structure, or lead gen
      const objectType = creative?.object_type
      let adType = 'sponsored_content'
      if (isLeadGenAd) adType = 'lead_generation'
      else if (objectType === 'VIDEO') adType = 'video'
      else if (storySpec?.video_data?.video_id) adType = 'video'
      else if (objectType === 'PHOTO') adType = 'image'

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
          || creative?.images?.data?.[0]?.hash
          || creative?.platform_customizations?.instagram?.image_hash
          || creative?.platform_customizations?.facebook?.image_hash,
        callToAction: isLeadGenAd ? 'Sign Up' : callToAction,
        landingPageUrl: content.landingPageUrl,
        videoId: storySpec?.video_data?.video_id,
        message: content.primaryText,
        descriptions: content.primaryTexts,
        pageName: account?.name,
        pageProfileImageUrl: optimizeMetaImageUrl(account?.picture),
        instagramPermalinkUrl: creative?.instagram_permalink_url,
        sourceInstagramMediaId: creative?.source_instagram_media_id,
        effectiveInstagramMediaId: creative?.effective_instagram_media_id,
        objectType,
        pageId: storySpec?.page_id,
        instagramActorId: storySpec?.instagram_actor_id,
        assetFeedSpec: serializedAssetFeedSpec,
        destinationSpec: creative?.destination_spec,
        headlines: content.headlines,
        // Lead gen specific fields
        isLeadGen: isLeadGenAd,
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
