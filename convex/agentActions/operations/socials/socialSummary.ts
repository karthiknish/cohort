import { formatWholeNumber } from '../../helpers'

export type SocialSurface = 'facebook' | 'instagram'

export type SocialOverviewSnapshot = {
  surface: SocialSurface
  impressions: number
  reach: number
  engagedUsers: number
  reactions: number
  comments: number
  shares: number
  saves: number
  followerCountLatest: number | null
  followerDeltaTotal: number
  rowCount: number
  engagementRate: number
}

export type SocialTopContent = {
  contentId: string
  message: string | null
  impressions: number
  reach: number
  engagedUsers: number
  publishedAt: string | null
}

export function formatSocialCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return formatWholeNumber(value)
}

export function formatSocialRate(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`
}

export function toSocialOverviewSnapshot(
  surface: SocialSurface,
  raw: Record<string, unknown> | null,
): SocialOverviewSnapshot | null {
  if (!raw) return null

  const reach = typeof raw.reach === 'number' ? raw.reach : 0
  const engagedUsers = typeof raw.engagedUsers === 'number' ? raw.engagedUsers : 0

  return {
    surface,
    impressions: typeof raw.impressions === 'number' ? raw.impressions : 0,
    reach,
    engagedUsers,
    reactions: typeof raw.reactions === 'number' ? raw.reactions : 0,
    comments: typeof raw.comments === 'number' ? raw.comments : 0,
    shares: typeof raw.shares === 'number' ? raw.shares : 0,
    saves: typeof raw.saves === 'number' ? raw.saves : 0,
    followerCountLatest: typeof raw.followerCountLatest === 'number' ? raw.followerCountLatest : null,
    followerDeltaTotal: typeof raw.followerDeltaTotal === 'number' ? raw.followerDeltaTotal : 0,
    rowCount: typeof raw.rowCount === 'number' ? raw.rowCount : 0,
    engagementRate: reach > 0 ? (engagedUsers / reach) * 100 : 0,
  }
}

export function formatSurfaceHeadline(surface: SocialSurface, overview: SocialOverviewSnapshot): string {
  const label = surface === 'facebook' ? 'Facebook' : 'Instagram'
  if (overview.rowCount === 0) {
    return `${label}: no synced metrics in this window.`
  }

  const followerPart =
    overview.followerDeltaTotal !== 0
      ? `, ${overview.followerDeltaTotal > 0 ? '+' : ''}${formatSocialCount(overview.followerDeltaTotal)} followers`
      : ''

  return `${label}: ${formatSocialCount(overview.reach)} reach · ${formatSocialCount(overview.engagedUsers)} engaged users · ${formatSocialRate(overview.engagementRate)} engagement${followerPart}.`
}
