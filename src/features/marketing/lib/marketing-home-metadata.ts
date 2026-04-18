import type { Metadata } from 'next'

/**
 * SEO / social metadata for the public marketing home.
 * Wording tracks real product surface: Meta Graph Marketing API integration
 * (`src/services/integrations/meta-ads`), OAuth + token refresh, sync jobs,
 * dashboard ads UX, plus other paid-media connectors—not speculative features.
 */
function metadataBase(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  if (!raw?.trim()) return undefined
  try {
    const normalized = raw.trim().replace(/\/$/, '')
    return new URL(normalized)
  } catch {
    return undefined
  }
}

const SHORT_DESCRIPTION =
  'Agency hub: Meta Marketing API (Facebook & Instagram)—accounts, OAuth, performance sync, campaigns, ad sets, ads, creatives, Pages, audiences, targeting—plus Google Ads, LinkedIn, and TikTok.'

const LONG_DESCRIPTION =
  'Cohorts is an AI-native agency workspace. Paid media includes Meta Marketing API coverage used in production: secure OAuth and token refresh, ad account discovery and selection, insights-backed metric sync, campaign status and budget/bidding updates, ad set and ad lifecycle controls, creative workflows (image/video, CTAs, optional Advantage+ style asset feeds), Facebook Page and Instagram Business actor selection, custom audience creation and listing, campaign-level targeting breakdowns, integration health checks, and derived performance signals (e.g. reach, frequency, CPM, CTR, video thruplays). Google Ads, LinkedIn Ads, and TikTok connectors share the same hub with clients, tasks, collaboration, and analytics.'

const KEYWORDS: string[] = [
  'Cohorts',
  'marketing agency platform',
  'agency operations',
  'Meta Marketing API',
  'Facebook Ads API',
  'Instagram Ads',
  'ad account management',
  'campaign management',
  'ad set management',
  'ad creatives',
  'Marketing API insights',
  'audience targeting',
  'custom audiences',
  'Facebook Page ads',
  'Instagram Business ads',
  'Google Ads',
  'LinkedIn Ads',
  'TikTok Ads',
  'marketing analytics',
  'client workspace',
]

const DEFAULT_TITLE = 'Cohorts | Agency Operations Platform'

export const marketingHomeMetadata: Metadata = {
  metadataBase: metadataBase(),
  title: DEFAULT_TITLE,
  description: SHORT_DESCRIPTION,
  keywords: KEYWORDS,
  openGraph: {
    title: DEFAULT_TITLE,
    description: LONG_DESCRIPTION,
    type: 'website',
    siteName: 'Cohorts',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: LONG_DESCRIPTION,
  },
}
