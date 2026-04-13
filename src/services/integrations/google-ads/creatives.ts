// =============================================================================
// GOOGLE ADS CREATIVES - Fetch creative assets and ad content
// =============================================================================
// GAQL reference: https://developers.google.com/google-ads/api/fields/v23/ad_group_ad

import { googleAdsSearch } from './client'
import type { GoogleAdsResult, GoogleCreative } from './types'

export type BuildGoogleCreativesGaqlOptions = {
  campaignId?: string
  adGroupId?: string
  statusFilter?: ('ENABLED' | 'PAUSED' | 'REMOVED')[]
}

/** Build GAQL for `fetchGoogleCreatives` (exported for tests / debugging). */
export function buildGoogleCreativesGaql(options: BuildGoogleCreativesGaqlOptions): string {
  const { campaignId, adGroupId, statusFilter = ['ENABLED', 'PAUSED', 'REMOVED'] } = options

  let filters = ''
  if (campaignId) filters += ` AND campaign.id = ${campaignId}`
  if (adGroupId) filters += ` AND ad_group.id = ${adGroupId}`

  const statusClause =
    statusFilter.length > 0
      ? ` AND ad_group_ad.status IN (${statusFilter.map((s) => `'${s}'`).join(', ')})`
      : ` AND ad_group_ad.status != 'REMOVED'`

  const query = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.type,
      ad_group_ad.status,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad.display_url,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group_ad.ad.responsive_display_ad.headlines,
      ad_group_ad.ad.responsive_display_ad.descriptions,
      ad_group_ad.ad.responsive_display_ad.marketing_images,
      ad_group_ad.ad.responsive_display_ad.business_name,
      ad_group_ad.ad.responsive_display_ad.call_to_action_text,
      ad_group_ad.ad.image_ad.image_url,
      ad_group_ad.ad.video_ad.video.id,
      ad_group_ad.ad.video_responsive_ad.headlines,
      ad_group_ad.ad.video_responsive_ad.descriptions,
      ad_group_ad.ad.video_responsive_ad.videos,
      ad_group_ad.ad.call_ad.headlines,
      ad_group_ad.ad.call_ad.descriptions,
      ad_group_ad.ad.call_ad.business_name,
      ad_group_ad.ad.app_ad.headlines,
      ad_group_ad.ad.app_ad.descriptions,
      ad_group_ad.ad.app_ad.youtube_videos,
      ad_group_ad.ad.hotel_ad.hotel_center_id,
      ad_group_ad.ad.demand_gen_multi_asset_ad.headlines,
      ad_group_ad.ad.demand_gen_multi_asset_ad.descriptions,
      ad_group_ad.ad.demand_gen_multi_asset_ad.marketing_images,
      ad_group_ad.ad.demand_gen_multi_asset_ad.business_name,
      ad_group_ad.ad.demand_gen_multi_asset_ad.call_to_action_text,
      ad_group_ad.ad.demand_gen_multi_asset_ad.tall_portrait_marketing_images,
      ad_group_ad.ad.demand_gen_multi_asset_ad.portrait_marketing_images,
      ad_group_ad.ad.demand_gen_multi_asset_ad.square_marketing_images,
      ad_group_ad.ad.demand_gen_video_responsive_ad.headlines,
      ad_group_ad.ad.demand_gen_video_responsive_ad.descriptions,
      ad_group_ad.ad.demand_gen_video_responsive_ad.videos,
      ad_group_ad.ad.demand_gen_carousel_ad.headline,
      ad_group_ad.ad.demand_gen_carousel_ad.description,
      ad_group_ad.ad.demand_gen_carousel_ad.business_name,
      ad_group_ad.ad.demand_gen_carousel_ad.call_to_action_text,
      ad_group_ad.ad.demand_gen_carousel_ad.carousel_cards,
      ad_group_ad.ad.demand_gen_product_ad.headline,
      ad_group_ad.ad.demand_gen_product_ad.description,
      ad_group_ad.ad.demand_gen_product_ad.business_name,
      ad_group_ad.ad.shopping_product_ad,
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name
    FROM ad_group_ad
    WHERE 1=1
    ${statusClause}
    ${filters}
    ORDER BY campaign.name, ad_group.name
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim()

  return query
}

const YOUTUBE_VIDEO_ASSET_GAQL_CHUNK = 40

/**
 * GAQL for resolving `customers/.../assets/...` → `youtube_video_id`
 * (used by `video_responsive_ad`, `demand_gen_video_responsive_ad`, `app_ad` `videos[].asset` / `youtube_videos[].asset`).
 */
export function buildGoogleYoutubeVideoAssetsGaql(resourceNames: string[]): string {
  const names = resourceNames.map((n) => n.trim()).filter(Boolean)
  if (names.length === 0) {
    return ''
  }
  const inList = names.map((n) => `'${n.replace(/'/g, "''")}'`).join(', ')
  return `
    SELECT
      asset.resource_name,
      asset.youtube_video_asset.youtube_video_id
    FROM asset
    WHERE asset.resource_name IN (${inList})
      AND asset.type = 'YOUTUBE_VIDEO'
  `.replace(/\s+/g, ' ').trim()
}

function firstVideoAssetResourceFromRow(row: GoogleAdsResult): string | undefined {
  const ad = (row.adGroupAd as {
    ad?: {
      videoResponsiveAd?: { videos?: Array<{ asset?: string }> }
      video_responsive_ad?: { videos?: Array<{ asset?: string }> }
      demandGenVideoResponsiveAd?: { videos?: Array<{ asset?: string }> }
      demand_gen_video_responsive_ad?: { videos?: Array<{ asset?: string }> }
      appAd?: { youtubeVideos?: Array<{ asset?: string }> }
      app_ad?: { youtube_videos?: Array<{ asset?: string }> }
    }
  } | undefined)?.ad
  const vra = ad?.videoResponsiveAd ?? ad?.video_responsive_ad
  const dgv = ad?.demandGenVideoResponsiveAd ?? ad?.demand_gen_video_responsive_ad
  const app = ad?.appAd ?? ad?.app_ad
  const fromVra = vra?.videos?.map((v) => v.asset?.trim()).find(Boolean)
  const fromDg = dgv?.videos?.map((v) => v.asset?.trim()).find(Boolean)
  const fromApp =
    app?.youtubeVideos?.map((v) => v.asset?.trim()).find(Boolean)
    ?? app?.youtube_videos?.map((v) => v.asset?.trim()).find(Boolean)
  return fromVra ?? fromDg ?? fromApp
}

function videoAssetResourceByAdId(rows: GoogleAdsResult[]): Map<string, string> {
  const m = new Map<string, string>()
  for (const row of rows) {
    const adId = (row.adGroupAd as { ad?: { id?: string } } | undefined)?.ad?.id?.trim()
    const ref = firstVideoAssetResourceFromRow(row)
    if (adId && ref) {
      m.set(adId, ref)
    }
  }
  return m
}

async function resolveYoutubeVideoIdsFromAssetResources(options: {
  accessToken: string
  developerToken: string
  customerId: string
  loginCustomerId?: string | null
  resourceNames: string[]
  maxRetries: number
  /** Batched `googleAds:search` calls (40 assets per chunk). Default 5 chunks. */
  maxChunks?: number
}): Promise<Map<string, string>> {
  const unique = [...new Set(options.resourceNames.map((n) => n.trim()).filter(Boolean))]
  const out = new Map<string, string>()
  const maxChunks = options.maxChunks ?? 5
  const { accessToken, developerToken, customerId, loginCustomerId, maxRetries } = options

  for (let i = 0, chunkIndex = 0; i < unique.length && chunkIndex < maxChunks; i += YOUTUBE_VIDEO_ASSET_GAQL_CHUNK) {
    chunkIndex += 1
    const chunk = unique.slice(i, i + YOUTUBE_VIDEO_ASSET_GAQL_CHUNK)
    const query = buildGoogleYoutubeVideoAssetsGaql(chunk)
    if (!query) continue

    const assetRows = await googleAdsSearch({
      accessToken,
      developerToken,
      customerId,
      loginCustomerId,
      query,
      pageSize: YOUTUBE_VIDEO_ASSET_GAQL_CHUNK,
      maxPages: 1,
      maxRetries,
    })

    for (const row of assetRows) {
      const asset = row.asset as
        | {
            resourceName?: string
            resource_name?: string
            youtubeVideoAsset?: { youtubeVideoId?: string }
            youtube_video_asset?: { youtube_video_id?: string }
          }
        | undefined
      const rn = (asset?.resourceName ?? asset?.resource_name)?.trim()
      const yid = (
        asset?.youtubeVideoAsset?.youtubeVideoId
        ?? asset?.youtube_video_asset?.youtube_video_id
      )?.trim()
      if (rn && yid) {
        out.set(rn, yid)
      }
    }
  }

  return out
}

/** PMax listing — `asset_group` is correct resource (not `ad_group_ad`). */
export function buildGooglePmaxAssetGroupsGaql(options: { campaignId: string }): string {
  const { campaignId } = options
  return `
    SELECT
      asset_group.id,
      asset_group.name,
      asset_group.status,
      asset_group.final_urls,
      campaign.id,
      campaign.name
    FROM asset_group
    WHERE campaign.id = ${campaignId}
      AND asset_group.status != 'REMOVED'
    ORDER BY asset_group.name
    LIMIT 500
  `.replace(/\s+/g, ' ').trim()
}

function mapPmaxAssetGroupRow(row: GoogleAdsResult): GoogleCreative {
  const assetGroup = row.assetGroup as {
    id?: string
    name?: string
    status?: string
    finalUrls?: string[]
  } | undefined
  const campaign = row.campaign as { id?: string; name?: string } | undefined
  const id = assetGroup?.id?.trim()
  return {
    adId: id ? `pmax_ag_${id}` : '',
    adGroupId: '',
    campaignId: campaign?.id ?? '',
    adGroupName: undefined,
    campaignName: campaign?.name,
    type: 'PERFORMANCE_MAX_AD',
    status: (assetGroup?.status === 'REMOVED' ? 'REMOVED' : (assetGroup?.status ?? 'ENABLED')) as
      'ENABLED' | 'PAUSED' | 'REMOVED',
    headlines: [assetGroup?.name?.trim() || 'Performance Max asset group'],
    descriptions: [],
    finalUrls: Array.isArray(assetGroup?.finalUrls) ? assetGroup.finalUrls : [],
    displayUrl: undefined,
    imageUrl: undefined,
    videoId: undefined,
    businessName: undefined,
    callToAction: undefined,
    tallPortraitMarketingImages: undefined,
  }
}

export async function fetchGoogleCreatives(options: {
  accessToken: string
  developerToken: string
  customerId: string
  campaignId?: string
  adGroupId?: string
  loginCustomerId?: string | null
  statusFilter?: ('ENABLED' | 'PAUSED' | 'REMOVED')[]
  maxRetries?: number
  /** Passed to `googleAdsSearch` (each page up to pageSize rows). Default 10. */
  maxSearchPages?: number
  /**
   * When `campaignId` set, run a second `asset_group` search for Performance Max asset groups
   * (synthetic rows, `adId` prefix `pmax_ag_`). Default true. Set false to skip.
   */
  includePerformanceMaxAssetGroups?: boolean
  /**
   * Extra `asset` GAQL searches to map `video_responsive_ad` / `demand_gen_video_responsive_ad`
   * `videos[].asset` → YouTube id (fills `videoId`, then Convex `videoUrl`). Default true.
   */
  resolveYoutubeVideoAssets?: boolean
  /** Max batched `asset` queries for YouTube resolution (40 resource names each). Default 5. */
  maxYoutubeAssetLookupChunks?: number
}): Promise<GoogleCreative[]> {
  const {
    accessToken,
    developerToken,
    customerId,
    campaignId,
    adGroupId,
    loginCustomerId,
    statusFilter = ['ENABLED', 'PAUSED', 'REMOVED'],
    maxRetries = 3,
    maxSearchPages = 10,
    includePerformanceMaxAssetGroups = true,
    resolveYoutubeVideoAssets = true,
    maxYoutubeAssetLookupChunks = 5,
  } = options

  const query = buildGoogleCreativesGaql({ campaignId, adGroupId, statusFilter })

  const rows = await googleAdsSearch({
    accessToken,
    developerToken,
    customerId,
    loginCustomerId,
    query,
    pageSize: 1000,
    maxPages: maxSearchPages,
    maxRetries,
  })

  const fromAds = rows.map((row) => {
    const adGroupAd = row.adGroupAd as {
      ad?: {
        id?: string
        type?: string
        finalUrls?: string[]
        displayUrl?: string
        responsiveSearchAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
        }
        responsiveDisplayAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          marketingImages?: Array<{ asset?: string }>
          businessName?: string
          callToActionText?: string
        }
        imageAd?: {
          imageUrl?: string
        }
        videoAd?: {
          video?: { id?: string }
        }
        videoResponsiveAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          videos?: Array<{ asset?: string }>
        }
        callAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          businessName?: string
        }
        appAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          youtubeVideos?: Array<{ asset?: string }>
        }
        demandGenMultiAssetAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          marketingImages?: Array<{ asset?: string }>
          businessName?: string
          callToActionText?: string
          tallPortraitMarketingImages?: Array<{ asset?: string }>
          portraitMarketingImages?: Array<{ asset?: string }>
          squareMarketingImages?: Array<{ asset?: string }>
        }
        demandGenVideoResponsiveAd?: {
          headlines?: Array<{ text?: string }>
          descriptions?: Array<{ text?: string }>
          videos?: Array<{ asset?: string }>
        }
        demandGenCarouselAd?: {
          headline?: string
          description?: string
          businessName?: string
          callToActionText?: string
          carouselCards?: Array<{ asset?: string }>
        }
        demandGenProductAd?: {
          headline?: string
          description?: string
          businessName?: string
        }
        shoppingProductAd?: Record<string, never> | object
      }
      status?: string
    } | undefined

    const adGroup = row.adGroup as { id?: string; name?: string } | undefined
    const campaign = row.campaign as { id?: string; name?: string } | undefined
    const ad = adGroupAd?.ad

    let type: GoogleCreative['type'] = 'OTHER'
    const adTypeStr = ad?.type ?? ''

    if (adTypeStr === 'RESPONSIVE_SEARCH_AD' || ad?.responsiveSearchAd) {
      type = 'RESPONSIVE_SEARCH_AD'
    } else if (adTypeStr === 'RESPONSIVE_DISPLAY_AD' || ad?.responsiveDisplayAd) {
      type = 'RESPONSIVE_DISPLAY_AD'
    } else if (adTypeStr === 'IMAGE_AD' || ad?.imageAd) {
      type = 'IMAGE_AD'
    } else if (adTypeStr === 'VIDEO_AD' || ad?.videoAd) {
      type = 'VIDEO_AD'
    } else if (adTypeStr === 'VIDEO_RESPONSIVE_AD' || ad?.videoResponsiveAd) {
      type = 'VIDEO_RESPONSIVE_AD'
    } else if (adTypeStr === 'CALL_ONLY_AD' || ad?.callAd) {
      type = 'CALL_ONLY_AD'
    } else if (adTypeStr === 'APP_AD' || ad?.appAd) {
      type = 'APP_AD'
    } else if (adTypeStr === 'HOTEL_AD') {
      type = 'HOTEL_AD'
    } else if (adTypeStr === 'DEMAND_GEN_MULTI_ASSET_AD' || ad?.demandGenMultiAssetAd) {
      type = 'DEMAND_GEN_MULTI_ASSET_AD'
    } else if (adTypeStr === 'DEMAND_GEN_VIDEO_RESPONSIVE_AD' || ad?.demandGenVideoResponsiveAd) {
      type = 'DEMAND_GEN_VIDEO_RESPONSIVE_AD'
    } else if (adTypeStr === 'DEMAND_GEN_CAROUSEL_AD' || ad?.demandGenCarouselAd) {
      type = 'DEMAND_GEN_CAROUSEL_AD'
    } else if (adTypeStr === 'DEMAND_GEN_PRODUCT_AD' || ad?.demandGenProductAd) {
      type = 'DEMAND_GEN_PRODUCT_AD'
    } else if (adTypeStr === 'SHOPPING_PRODUCT_AD' || ad?.shoppingProductAd) {
      type = 'SHOPPING_PRODUCT_AD'
    } else if (adTypeStr.includes('PERFORMANCE_MAX')) {
      type = 'PERFORMANCE_MAX_AD'
    } else if (adTypeStr.includes('SMART_DISPLAY')) {
      type = 'SMART_DISPLAY_AD'
    } else {
      type = 'OTHER'
    }

    let headlines: string[] = []
    let descriptions: string[] = []

    if (ad?.responsiveSearchAd) {
      headlines = ad.responsiveSearchAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.responsiveSearchAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.responsiveDisplayAd) {
      headlines = ad.responsiveDisplayAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.responsiveDisplayAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.videoResponsiveAd) {
      headlines = ad.videoResponsiveAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.videoResponsiveAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.callAd) {
      headlines = ad.callAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.callAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.appAd) {
      headlines = ad.appAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.appAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.demandGenMultiAssetAd) {
      headlines = ad.demandGenMultiAssetAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.demandGenMultiAssetAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.demandGenVideoResponsiveAd) {
      headlines = ad.demandGenVideoResponsiveAd.headlines?.map((h) => h.text ?? '').filter(Boolean) ?? []
      descriptions = ad.demandGenVideoResponsiveAd.descriptions?.map((d) => d.text ?? '').filter(Boolean) ?? []
    } else if (ad?.demandGenCarouselAd) {
      const h = ad.demandGenCarouselAd.headline?.trim()
      const d = ad.demandGenCarouselAd.description?.trim()
      headlines = h ? [h] : []
      descriptions = d ? [d] : []
    } else if (ad?.demandGenProductAd) {
      const h = ad.demandGenProductAd.headline?.trim()
      const d = ad.demandGenProductAd.description?.trim()
      headlines = h ? [h] : []
      descriptions = d ? [d] : []
    } else if (ad?.shoppingProductAd) {
      headlines = [adGroup?.name?.trim() || 'Shopping product ad']
      descriptions = []
    }

    const tallPortraitImages =
      ad?.demandGenMultiAssetAd?.tallPortraitMarketingImages?.map((img) => img.asset ?? '').filter(Boolean) ?? []

    const portraitImages =
      ad?.demandGenMultiAssetAd?.portraitMarketingImages?.map((img) => img.asset ?? '').filter(Boolean) ?? []

    const squareImages =
      ad?.demandGenMultiAssetAd?.squareMarketingImages?.map((img) => img.asset ?? '').filter(Boolean) ?? []

    const carouselCardAssets =
      ad?.demandGenCarouselAd?.carouselCards?.map((c) => c.asset ?? '').filter(Boolean) ?? []

    const videoId = ad?.videoAd?.video?.id

    const imageUrl =
      ad?.imageAd?.imageUrl
      || ad?.responsiveDisplayAd?.marketingImages?.[0]?.asset
      || ad?.demandGenMultiAssetAd?.marketingImages?.[0]?.asset
      || portraitImages[0]
      || squareImages[0]
      || carouselCardAssets[0]

    return {
      adId: ad?.id ?? '',
      adGroupId: adGroup?.id ?? '',
      campaignId: campaign?.id ?? '',
      adGroupName: adGroup?.name,
      campaignName: campaign?.name,
      type,
      status: (adGroupAd?.status ?? 'PAUSED') as 'ENABLED' | 'PAUSED' | 'REMOVED',
      headlines,
      descriptions,
      finalUrls: ad?.finalUrls ?? [],
      displayUrl: ad?.displayUrl,
      imageUrl,
      videoId,
      businessName:
        ad?.responsiveDisplayAd?.businessName
        || ad?.callAd?.businessName
        || ad?.demandGenMultiAssetAd?.businessName
        || ad?.demandGenCarouselAd?.businessName
        || ad?.demandGenProductAd?.businessName,
      callToAction:
        ad?.responsiveDisplayAd?.callToActionText
        || ad?.demandGenMultiAssetAd?.callToActionText
        || ad?.demandGenCarouselAd?.callToActionText,
      tallPortraitMarketingImages: tallPortraitImages.length > 0 ? tallPortraitImages : undefined,
    }
  })

  let creatives = fromAds
  if (resolveYoutubeVideoAssets) {
    const refByAdId = videoAssetResourceByAdId(rows)
    if (refByAdId.size > 0) {
      try {
        const assetToYoutubeId = await resolveYoutubeVideoIdsFromAssetResources({
          accessToken,
          developerToken,
          customerId,
          loginCustomerId,
          resourceNames: [...refByAdId.values()],
          maxRetries,
          maxChunks: maxYoutubeAssetLookupChunks,
        })
        creatives = fromAds.map((c) => {
          if (c.videoId?.trim()) return c
          const ref = refByAdId.get(c.adId)
          if (!ref) return c
          const yid = assetToYoutubeId.get(ref)
          return yid ? { ...c, videoId: yid } : c
        })
      } catch {
        creatives = fromAds
      }
    }
  }

  const shouldFetchPmax =
    Boolean(campaignId?.trim())
    && includePerformanceMaxAssetGroups !== false

  if (!shouldFetchPmax) {
    return creatives
  }

  try {
    const pmaxQuery = buildGooglePmaxAssetGroupsGaql({ campaignId: campaignId!.trim() })
    const pmaxRows = await googleAdsSearch({
      accessToken,
      developerToken,
      customerId,
      loginCustomerId,
      query: pmaxQuery,
      pageSize: 500,
      maxPages: Math.min(maxSearchPages, 5),
      maxRetries,
    })
    return [...creatives, ...pmaxRows.map(mapPmaxAssetGroupRow)]
  } catch {
    return creatives
  }
}
