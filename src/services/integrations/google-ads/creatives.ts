// =============================================================================
// GOOGLE ADS CREATIVES - Fetch creative assets and ad content
// =============================================================================

import { googleAdsSearch } from './client'
import { GoogleCreative } from './types'

export async function fetchGoogleCreatives(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId?: string
    adGroupId?: string
    loginCustomerId?: string | null
    statusFilter?: ('ENABLED' | 'PAUSED' | 'REMOVED')[]
    maxRetries?: number
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
    } = options

    let filters = ''
    if (campaignId) filters += ` AND campaign.id = ${campaignId}`
    if (adGroupId) filters += ` AND ad_group.id = ${adGroupId}`
    if (statusFilter.length > 0) {
        filters += ` AND ad_group_ad.status IN (${statusFilter.map(s => `'${s}'`).join(', ')})`
    }

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
      ad_group_ad.ad.call_ad.headlines,
      ad_group_ad.ad.call_ad.descriptions,
      ad_group_ad.ad.call_ad.business_name,
      ad_group_ad.ad.app_ad.headlines,
      ad_group_ad.ad.app_ad.descriptions,
      ad_group_ad.ad.hotel_ad.hotel_center_id,
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name
    FROM ad_group_ad
    WHERE ad_group_ad.status != 'REMOVED'
    ${filters}
    ORDER BY campaign.name, ad_group.name
    LIMIT 1000
`.replace(/\s+/g, ' ').trim()

    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 1000,
        maxPages: 10,
        maxRetries,
    })

    return rows.map((row) => {
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
                callAd?: {
                    headlines?: Array<{ text?: string }>
                    descriptions?: Array<{ text?: string }>
                    businessName?: string
                }
                appAd?: {
                    headlines?: Array<{ text?: string }>
                    descriptions?: Array<{ text?: string }>
                }
            }
            status?: string
        } | undefined

        const adGroup = row.adGroup as { id?: string; name?: string } | undefined
        const campaign = row.campaign as { id?: string; name?: string } | undefined
        const ad = adGroupAd?.ad

        // Determine ad type
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
        } else if (adTypeStr === 'CALL_ONLY_AD' || ad?.callAd) {
            type = 'CALL_ONLY_AD'
        } else if (adTypeStr === 'APP_AD' || ad?.appAd) {
            type = 'APP_AD'
        } else if (adTypeStr === 'HOTEL_AD') {
            type = 'HOTEL_AD'
        } else if (adTypeStr.includes('PERFORMANCE_MAX')) {
            type = 'PERFORMANCE_MAX_AD'
        } else if (adTypeStr.includes('SMART_DISPLAY')) {
            type = 'SMART_DISPLAY_AD'
        } else {
            type = (adTypeStr as any) || 'OTHER'
        }

        // Extract headlines and descriptions
        let headlines: string[] = []
        let descriptions: string[] = []

        if (ad?.responsiveSearchAd) {
            headlines = ad.responsiveSearchAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
            descriptions = ad.responsiveSearchAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
        } else if (ad?.responsiveDisplayAd) {
            headlines = ad.responsiveDisplayAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
            descriptions = ad.responsiveDisplayAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
        } else if (ad?.callAd) {
            headlines = ad.callAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
            descriptions = ad.callAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
        } else if (ad?.appAd) {
            headlines = ad.appAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
            descriptions = ad.appAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
        }

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
            imageUrl: ad?.imageAd?.imageUrl || ad?.responsiveDisplayAd?.marketingImages?.[0]?.asset,
            videoId: ad?.videoAd?.video?.id,
            businessName: ad?.responsiveDisplayAd?.businessName || ad?.callAd?.businessName,
            callToAction: ad?.responsiveDisplayAd?.callToActionText,
        }
    })
}
