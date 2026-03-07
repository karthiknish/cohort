import { resolveGeminiApiKey } from '@/services/gemini'
import {
  resolveGoogleAdsOAuthCredentials,
  resolveGoogleAdsOAuthRedirectUri,
  resolveGoogleAnalyticsOAuthCredentials,
  resolveGoogleAnalyticsOAuthRedirectUri,
} from '@/services/google-oauth'
import { resolveGoogleWorkspaceOAuthCredentials, resolveGoogleWorkspaceOAuthRedirectUri } from '@/services/google-workspace'
import { resolveLiveKitCredentials } from '@/services/livekit'

export type ServiceCheckStatus = 'ok' | 'warning' | 'error'

export type ServiceCheck = {
  status: ServiceCheckStatus
  message?: string
  responseTime?: number
  metadata?: Record<string, unknown>
}

function readEnv(name: string) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function configuredCheck(isConfigured: boolean, message: string, metadata?: Record<string, unknown>): ServiceCheck {
  return isConfigured
    ? { status: 'ok', metadata }
    : { status: 'warning', message, metadata }
}

export function buildConfiguredServiceChecks(): Record<string, ServiceCheck> {
  const appUrl = readEnv('NEXT_PUBLIC_APP_URL')
  const googleAdsCredentials = resolveGoogleAdsOAuthCredentials()
  const googleAnalyticsCredentials = resolveGoogleAnalyticsOAuthCredentials()
  const googleWorkspaceCredentials = resolveGoogleWorkspaceOAuthCredentials()
  const livekit = resolveLiveKitCredentials()

  return {
    betterAuth: configuredCheck(
      Boolean(readEnv('BETTER_AUTH_SECRET') && (readEnv('NEXT_PUBLIC_CONVEX_SITE_URL') || readEnv('NEXT_PUBLIC_CONVEX_HTTP_URL'))),
      'Missing Better Auth secret or Convex site URL',
      {
        hasSecret: Boolean(readEnv('BETTER_AUTH_SECRET')),
        hasConvexSiteUrl: Boolean(readEnv('NEXT_PUBLIC_CONVEX_SITE_URL') || readEnv('NEXT_PUBLIC_CONVEX_HTTP_URL')),
      }
    ),
    gemini: configuredCheck(Boolean(resolveGeminiApiKey()), 'Missing GEMINI_API_KEY or GOOGLE_API_KEY'),
    posthog: configuredCheck(
      Boolean(readEnv('NEXT_PUBLIC_POSTHOG_KEY') && readEnv('NEXT_PUBLIC_POSTHOG_HOST')),
      'Missing NEXT_PUBLIC_POSTHOG_KEY or NEXT_PUBLIC_POSTHOG_HOST'
    ),
    brevo: configuredCheck(Boolean(readEnv('BREVO_API_KEY')), 'BREVO_API_KEY is not configured'),
    googleAds: configuredCheck(
      Boolean(googleAdsCredentials.clientId && googleAdsCredentials.clientSecret && resolveGoogleAdsOAuthRedirectUri(appUrl) && readEnv('GOOGLE_ADS_DEVELOPER_TOKEN')),
      'Missing Google Ads OAuth credentials, redirect URI, or GOOGLE_ADS_DEVELOPER_TOKEN',
      { hasDeveloperToken: Boolean(readEnv('GOOGLE_ADS_DEVELOPER_TOKEN')) }
    ),
    googleAnalytics: configuredCheck(
      Boolean(googleAnalyticsCredentials.clientId && googleAnalyticsCredentials.clientSecret && resolveGoogleAnalyticsOAuthRedirectUri(appUrl)),
      'Missing Google Analytics OAuth credentials or redirect URI'
    ),
    metaAds: configuredCheck(
      Boolean(readEnv('META_APP_ID') && readEnv('META_APP_SECRET')),
      'Missing META_APP_ID or META_APP_SECRET'
    ),
    linkedInAds: configuredCheck(
      Boolean(readEnv('LINKEDIN_CLIENT_ID') && readEnv('LINKEDIN_CLIENT_SECRET')),
      'Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET'
    ),
    tikTokAds: configuredCheck(
      Boolean(readEnv('TIKTOK_CLIENT_KEY') && readEnv('TIKTOK_CLIENT_SECRET')),
      'Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET'
    ),
    googleWorkspace: configuredCheck(
      Boolean(googleWorkspaceCredentials.clientId && googleWorkspaceCredentials.clientSecret && resolveGoogleWorkspaceOAuthRedirectUri(appUrl)),
      'Missing Google Workspace OAuth credentials or redirect URI'
    ),
    livekit: configuredCheck(
      Boolean(livekit.apiKey && livekit.apiSecret && livekit.serverUrl),
      'Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or LIVEKIT_URL'
    ),
    environment: configuredCheck(Boolean(readEnv('NEXT_PUBLIC_CONVEX_URL')), 'Missing NEXT_PUBLIC_CONVEX_URL'),
  }
}