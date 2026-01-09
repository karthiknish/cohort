export type Creative = {
  providerId: string
  creativeId: string
  adGroupId?: string
  campaignId: string
  campaignName?: string
  name?: string
  type: string
  status: string
  headlines?: string[]
  descriptions?: string[]
  imageUrl?: string
  videoUrl?: string
  landingPageUrl?: string
  callToAction?: string
  thumbnailUrl?: string
  pageName?: string
  pageProfileImageUrl?: string
  metrics?: {
    impressions?: number
    clicks?: number
    spend?: number
    conversions?: number
  }
}

export type NormalizedAdMetric = {
  providerId: string
  adId: string
  adGroupId?: string
  campaignId: string
  name?: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  ctr?: number
  cpc?: number
  roas?: number
}
