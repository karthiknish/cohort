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
    statusFilter?: ('ENABLED' | 'PAUSED')[]
    maxRetries?: number
}): Promise<GoogleCreative[]> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        adGroupId,
        loginCustomerId,
        statusFilter = ['ENABLED', 'PAUSED'],
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
      ad_group.id,
      ad_group.name,
      campaign.id,
      campaign.name
    FROM ad_group_ad
    WHERE ad_group_ad.status != 'REMOVED'
    ${filters}
    ORDER BY campaign.name, ad_group.name
    LIMIT 500
  `.replace(/\s+/g, ' ').trim()

    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 500,
        maxPages: 1,
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
            }
            status?: string
        } | undefined

        const adGroup = row.adGroup as { id?: string; name?: string } | undefined
        const campaign = row.campaign as { id?: string; name?: string } | undefined
        const ad = adGroupAd?.ad

        // Determine ad type
        let type: GoogleCreative['type'] = 'OTHER'
        if (ad?.type === 'RESPONSIVE_SEARCH_AD' || ad?.responsiveSearchAd) {
            type = 'RESPONSIVE_SEARCH_AD'
        } else if (ad?.type === 'RESPONSIVE_DISPLAY_AD' || ad?.responsiveDisplayAd) {
            type = 'RESPONSIVE_DISPLAY_AD'
        } else if (ad?.type === 'IMAGE_AD' || ad?.imageAd) {
            type = 'IMAGE_AD'
        } else if (ad?.type === 'VIDEO_AD' || ad?.videoAd) {
            type = 'VIDEO_AD'
        }

        // Extract headlines and descriptions based on ad type
        let headlines: string[] = []
        let descriptions: string[] = []

        if (type === 'RESPONSIVE_SEARCH_AD' && ad?.responsiveSearchAd) {
            headlines = ad.responsiveSearchAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
            descriptions = ad.responsiveSearchAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
        } else if (type === 'RESPONSIVE_DISPLAY_AD' && ad?.responsiveDisplayAd) {
            headlines = ad.responsiveDisplayAd.headlines?.map(h => h.text ?? '').filter(Boolean) ?? []
            descriptions = ad.responsiveDisplayAd.descriptions?.map(d => d.text ?? '').filter(Boolean) ?? []
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
            imageUrl: ad?.imageAd?.imageUrl,
            videoId: ad?.videoAd?.video?.id,
            businessName: ad?.responsiveDisplayAd?.businessName,
            callToAction: ad?.responsiveDisplayAd?.callToActionText,
        }
    })
}
