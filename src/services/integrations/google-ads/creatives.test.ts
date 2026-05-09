import { describe, expect, it } from 'vitest'

import {
  buildGoogleCreativesGaql,
  buildGooglePmaxAssetGroupsGaql,
  buildGoogleYoutubeVideoAssetsGaql,
} from './creatives'

describe('buildGoogleCreativesGaql', () => {
  it('does not use invalid asset_group join on ad id', () => {
    const q = buildGoogleCreativesGaql({})
    expect(q.toLowerCase()).not.toContain('join asset_group')
    expect(q.toLowerCase()).not.toContain('asset_group.')
  })

  it('uses status IN when filter includes REMOVED', () => {
    const q = buildGoogleCreativesGaql({ statusFilter: ['ENABLED', 'PAUSED', 'REMOVED'] })
    expect(q).toContain("ad_group_ad.status IN ('ENABLED', 'PAUSED', 'REMOVED')")
    expect(q).not.toMatch(/status\s*!=\s*'REMOVED'/)
  })

  it('excludes removed by default when status filter empty', () => {
    const q = buildGoogleCreativesGaql({ statusFilter: [] })
    expect(q).toContain("ad_group_ad.status != 'REMOVED'")
  })

  it('selects video_responsive and current demand gen fields', () => {
    const q = buildGoogleCreativesGaql({})
    expect(q).toContain('video_responsive_ad.headlines')
    expect(q).toContain('demand_gen_video_responsive_ad.logo_images')
    expect(q).toContain('demand_gen_carousel_ad.headline')
    expect(q).toContain('shopping_product_ad')
    expect(q).toContain('app_ad.youtube_videos')
  })
})

describe('buildGooglePmaxAssetGroupsGaql', () => {
  it('queries asset_group for a campaign', () => {
    const q = buildGooglePmaxAssetGroupsGaql({ campaignId: '12345' })
    expect(q.toLowerCase()).toContain('from asset_group')
    expect(q).toContain('campaign.id = 12345')
    expect(q).toContain('asset_group.final_urls')
  })
})

describe('buildGoogleYoutubeVideoAssetsGaql', () => {
  it('returns empty string for no resource names', () => {
    expect(buildGoogleYoutubeVideoAssetsGaql([])).toBe('')
  })

  it('queries asset with IN list and youtube_video fields', () => {
    const q = buildGoogleYoutubeVideoAssetsGaql([
      "customers/1/assets/2",
      "customers/1/assets/3",
    ])
    expect(q.toLowerCase()).toContain('from asset')
    expect(q).toContain("customers/1/assets/2")
    expect(q).toContain("customers/1/assets/3")
    expect(q).toContain('asset.youtube_video_asset.youtube_video_id')
    expect(q).toContain("asset.type = 'YOUTUBE_VIDEO'")
  })

  it('escapes single quotes in resource names', () => {
    const q = buildGoogleYoutubeVideoAssetsGaql(["customers/1/assets/x'y"])
    expect(q).toContain("x''y")
  })
})
