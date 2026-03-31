type PreviewSocialSurface = 'facebook' | 'instagram'

type PreviewSocialOverview = {
  surface: PreviewSocialSurface
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
}

const PREVIEW_SOCIAL_OVERVIEWS: Record<PreviewSocialSurface, PreviewSocialOverview> = {
  facebook: {
    surface: 'facebook',
    impressions: 184200,
    reach: 126400,
    engagedUsers: 8420,
    reactions: 5140,
    comments: 1086,
    shares: 684,
    saves: 0,
    followerCountLatest: 24890,
    followerDeltaTotal: 912,
    rowCount: 28,
  },
  instagram: {
    surface: 'instagram',
    impressions: 236800,
    reach: 154300,
    engagedUsers: 12940,
    reactions: 9018,
    comments: 1474,
    shares: 953,
    saves: 3126,
    followerCountLatest: 31840,
    followerDeltaTotal: 1286,
    rowCount: 28,
  },
}

const PREVIEW_SOCIAL_CONNECTION_STATUS = {
  connected: true,
  accountId: 'preview-meta-account',
  accountName: 'Cohorts Demo Workspace',
  lastSyncStatus: 'success' as const,
  lastSyncedAtMs: Date.UTC(2026, 2, 30, 16, 45, 0),
  linkedAtMs: Date.UTC(2026, 2, 12, 10, 15, 0),
}

export function getPreviewSocialOverview(surface: PreviewSocialSurface): PreviewSocialOverview {
  return PREVIEW_SOCIAL_OVERVIEWS[surface]
}

export function getPreviewSocialConnectionStatus() {
  return PREVIEW_SOCIAL_CONNECTION_STATUS
}