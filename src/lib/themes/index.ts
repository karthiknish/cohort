/**
 * Centralized theme configuration for the application.
 * This file consolidates all theme-related constants and utilities.
 *
 * Provider themes, color palettes, and UI themes are all defined here
 * to ensure consistency across the application.
 */

// =============================================================================
// PROVIDER IDENTIFIERS
// =============================================================================

export const PROVIDER_IDS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  META: 'meta',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
} as const

export type ProviderId = typeof PROVIDER_IDS[keyof typeof PROVIDER_IDS]

const PROVIDER_ID_ALIASES: Record<string, ProviderId> = {
  google: PROVIDER_IDS.GOOGLE,
  google_ads: PROVIDER_IDS.GOOGLE,
  'google-ads': PROVIDER_IDS.GOOGLE,
  googleads: PROVIDER_IDS.GOOGLE,
  adwords: PROVIDER_IDS.GOOGLE,
  google_analytics: PROVIDER_IDS.GOOGLE,
  'google-analytics': PROVIDER_IDS.GOOGLE,
  googleanalytics: PROVIDER_IDS.GOOGLE,
  ga: PROVIDER_IDS.GOOGLE,
  ga4: PROVIDER_IDS.GOOGLE,
  facebook: PROVIDER_IDS.FACEBOOK,
  facebook_ads: PROVIDER_IDS.FACEBOOK,
  'facebook-ads': PROVIDER_IDS.FACEBOOK,
  meta: PROVIDER_IDS.FACEBOOK,
  meta_ads: PROVIDER_IDS.FACEBOOK,
  'meta-ads': PROVIDER_IDS.FACEBOOK,
  metaads: PROVIDER_IDS.FACEBOOK,
  linkedin: PROVIDER_IDS.LINKEDIN,
  linkedin_ads: PROVIDER_IDS.LINKEDIN,
  'linkedin-ads': PROVIDER_IDS.LINKEDIN,
  tiktok: PROVIDER_IDS.TIKTOK,
  tiktok_ads: PROVIDER_IDS.TIKTOK,
  'tiktok-ads': PROVIDER_IDS.TIKTOK,
}

export function normalizeProviderId(providerId: string): string {
  const normalized = providerId.trim().toLowerCase()
  return PROVIDER_ID_ALIASES[normalized] ?? normalized
}

function humanizeProviderId(providerId: string): string {
  return providerId
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

// =============================================================================
// PROVIDER THEMES - TAILWIND CLASSES
// =============================================================================

/**
 * Theme configuration using Tailwind utility classes.
 * Used for components that need styled backgrounds, borders, and text colors.
 */
export const PROVIDER_THEMES: Record<ProviderId, {
  bg: string
  border: string
  accent: string
  iconBg: string
}> = {
  google: {
    bg: 'bg-gradient-to-br from-[rgb(var(--provider-google-rgb)/0.08)] to-[rgb(var(--provider-google-rgb)/0.03)] dark:from-[rgb(var(--provider-google-rgb)/0.18)] dark:to-[rgb(var(--provider-google-rgb)/0.08)]',
    border: 'border-[rgb(var(--provider-google-rgb)/0.2)] dark:border-[rgb(var(--provider-google-rgb)/0.35)]',
    accent: 'text-[rgb(var(--provider-google-rgb))] dark:text-[rgb(var(--provider-google-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--provider-google-rgb)/0.16)] to-[rgb(var(--provider-google-rgb)/0.08)] dark:from-[rgb(var(--provider-google-rgb)/0.25)] dark:to-[rgb(var(--provider-google-rgb)/0.14)]',
  },
  facebook: {
    bg: 'bg-gradient-to-br from-[rgb(var(--provider-facebook-rgb)/0.08)] to-[rgb(var(--provider-facebook-rgb)/0.03)] dark:from-[rgb(var(--provider-facebook-rgb)/0.18)] dark:to-[rgb(var(--provider-facebook-rgb)/0.08)]',
    border: 'border-[rgb(var(--provider-facebook-rgb)/0.2)] dark:border-[rgb(var(--provider-facebook-rgb)/0.35)]',
    accent: 'text-[rgb(var(--provider-facebook-rgb))] dark:text-[rgb(var(--provider-facebook-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--provider-facebook-rgb)/0.16)] to-[rgb(var(--provider-facebook-rgb)/0.08)] dark:from-[rgb(var(--provider-facebook-rgb)/0.25)] dark:to-[rgb(var(--provider-facebook-rgb)/0.14)]',
  },
  meta: {
    bg: 'bg-gradient-to-br from-[rgb(var(--provider-meta-rgb)/0.08)] to-[rgb(var(--provider-meta-rgb)/0.03)] dark:from-[rgb(var(--provider-meta-rgb)/0.18)] dark:to-[rgb(var(--provider-meta-rgb)/0.08)]',
    border: 'border-[rgb(var(--provider-meta-rgb)/0.2)] dark:border-[rgb(var(--provider-meta-rgb)/0.35)]',
    accent: 'text-[rgb(var(--provider-meta-rgb))] dark:text-[rgb(var(--provider-meta-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--provider-meta-rgb)/0.16)] to-[rgb(var(--provider-meta-rgb)/0.08)] dark:from-[rgb(var(--provider-meta-rgb)/0.25)] dark:to-[rgb(var(--provider-meta-rgb)/0.14)]',
  },
  linkedin: {
    bg: 'bg-gradient-to-br from-[rgb(var(--provider-linkedin-rgb)/0.08)] to-[rgb(var(--provider-linkedin-rgb)/0.03)] dark:from-[rgb(var(--provider-linkedin-rgb)/0.18)] dark:to-[rgb(var(--provider-linkedin-rgb)/0.08)]',
    border: 'border-[rgb(var(--provider-linkedin-rgb)/0.2)] dark:border-[rgb(var(--provider-linkedin-rgb)/0.35)]',
    accent: 'text-[rgb(var(--provider-linkedin-rgb))] dark:text-[rgb(var(--provider-linkedin-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--provider-linkedin-rgb)/0.16)] to-[rgb(var(--provider-linkedin-rgb)/0.08)] dark:from-[rgb(var(--provider-linkedin-rgb)/0.25)] dark:to-[rgb(var(--provider-linkedin-rgb)/0.14)]',
  },
  tiktok: {
    bg: 'bg-gradient-to-br from-[rgb(var(--provider-tiktok-rgb)/0.08)] to-[rgb(var(--provider-tiktok-rgb)/0.03)] dark:from-[rgb(var(--provider-tiktok-rgb)/0.18)] dark:to-[rgb(var(--provider-tiktok-rgb)/0.08)]',
    border: 'border-[rgb(var(--provider-tiktok-rgb)/0.2)] dark:border-[rgb(var(--provider-tiktok-rgb)/0.35)]',
    accent: 'text-[rgb(var(--provider-tiktok-rgb))] dark:text-[rgb(var(--provider-tiktok-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--provider-tiktok-rgb)/0.16)] to-[rgb(var(--provider-tiktok-rgb)/0.08)] dark:from-[rgb(var(--provider-tiktok-rgb)/0.25)] dark:to-[rgb(var(--provider-tiktok-rgb)/0.14)]',
  },
} as const

// =============================================================================
// PROVIDER THEMES - RAW COLORS
// =============================================================================

/**
 * Theme configuration using raw color values.
 * Used for charts, icons, and components that need CSS color values.
 */
export const PROVIDER_COLORS: Record<ProviderId, {
  hex: string
  hsl: { h: number; s: number; l: number }
}> = {
  google: {
    hex: 'rgb(var(--provider-google-rgb))',
    hsl: { h: 217, s: 89, l: 60 },
  },
  facebook: {
    hex: 'rgb(var(--provider-facebook-rgb))',
    hsl: { h: 211, s: 92, l: 46 },
  },
  meta: {
    hex: 'rgb(var(--provider-meta-rgb))',
    hsl: { h: 211, s: 92, l: 46 },
  },
  linkedin: {
    hex: 'rgb(var(--provider-linkedin-rgb))',
    hsl: { h: 201, s: 91, l: 40 },
  },
  tiktok: {
    hex: 'rgb(var(--provider-tiktok-rgb))',
    hsl: { h: 349, s: 99, l: 59 },
  },
} as const

// =============================================================================
// PROVIDER INFO (including theme for connection cards)
// =============================================================================

export const PROVIDER_INFO = {
  [PROVIDER_IDS.GOOGLE]: {
    name: 'Google Ads',
    shortName: 'Google',
    description: 'Import campaign performance, budgets, and ROAS insights directly from Google Ads.',
    benefits: [
      'Campaign spend and budget tracking',
      'Conversion and ROAS metrics',
      'Search, Display, and YouTube performance',
    ],
    requirements: [
      'Active Google Ads account',
      'Admin or Standard access to the account',
    ],
    loginMethod: 'popup' as const,
    estimatedSetupTime: '30 seconds',
    theme: {
      color: 'text-[rgb(var(--provider-google-rgb))]',
      bg: 'bg-[rgb(var(--provider-google-rgb)/0.1)]',
      border: 'border-[rgb(var(--provider-google-rgb)/0.2)]',
      indicator: 'bg-[rgb(var(--provider-google-rgb))]',
    },
  },
  [PROVIDER_IDS.FACEBOOK]: {
    name: 'Meta Ads Manager',
    shortName: 'Meta',
    description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
    benefits: [
      'Facebook and Instagram ad performance',
      'Creative-level reporting',
      'Audience and placement insights',
    ],
    requirements: [
      'Meta Business account',
      'Admin access to at least one ad account',
    ],
    loginMethod: 'redirect' as const,
    estimatedSetupTime: '1 minute',
    theme: {
      color: 'text-[rgb(var(--provider-facebook-rgb))]',
      bg: 'bg-[rgb(var(--provider-facebook-rgb)/0.1)]',
      border: 'border-[rgb(var(--provider-facebook-rgb)/0.2)]',
      indicator: 'bg-[rgb(var(--provider-facebook-rgb))]',
    },
  },
  [PROVIDER_IDS.META]: {
    name: 'Meta Ads Manager',
    shortName: 'Meta',
    description: 'Pull spend, results, and creative breakdowns from Meta and Instagram campaigns.',
    benefits: [
      'Facebook and Instagram ad performance',
      'Creative-level reporting',
      'Audience and placement insights',
    ],
    requirements: [
      'Meta Business account',
      'Admin access to at least one ad account',
    ],
    loginMethod: 'redirect' as const,
    estimatedSetupTime: '1 minute',
    theme: {
      color: 'text-[rgb(var(--provider-meta-rgb))]',
      bg: 'bg-[rgb(var(--provider-meta-rgb)/0.1)]',
      border: 'border-[rgb(var(--provider-meta-rgb)/0.2)]',
      indicator: 'bg-[rgb(var(--provider-meta-rgb))]',
    },
  },
  [PROVIDER_IDS.LINKEDIN]: {
    name: 'LinkedIn Ads',
    shortName: 'LinkedIn',
    description: 'Sync lead-gen form results and campaign analytics from LinkedIn.',
    benefits: [
      'Sponsored content performance',
      'Lead generation metrics',
      'B2B audience insights',
    ],
    requirements: [
      'LinkedIn Campaign Manager access',
      'Admin or Account Manager role',
    ],
    loginMethod: 'popup' as const,
    estimatedSetupTime: '30 seconds',
    theme: {
      color: 'text-[rgb(var(--provider-linkedin-rgb))]',
      bg: 'bg-[rgb(var(--provider-linkedin-rgb)/0.1)]',
      border: 'border-[rgb(var(--provider-linkedin-rgb)/0.2)]',
      indicator: 'bg-[rgb(var(--provider-linkedin-rgb))]',
    },
  },
  [PROVIDER_IDS.TIKTOK]: {
    name: 'TikTok Ads',
    shortName: 'TikTok',
    description: 'Bring in spend, engagement, and conversion insights from TikTok campaign flights.',
    benefits: [
      'Campaign and ad group performance',
      'Video engagement metrics',
      'Conversion tracking',
    ],
    requirements: [
      'TikTok Ads Manager account',
      'Advertiser access or higher',
    ],
    loginMethod: 'redirect' as const,
    estimatedSetupTime: '1 minute',
    theme: {
      color: 'text-[rgb(var(--provider-tiktok-rgb))]',
      bg: 'bg-[rgb(var(--provider-tiktok-rgb)/0.1)]',
      border: 'border-[rgb(var(--provider-tiktok-rgb)/0.2)]',
      indicator: 'bg-[rgb(var(--provider-tiktok-rgb))]',
    },
  },
} as const

export type ProviderInfo = typeof PROVIDER_INFO[keyof typeof PROVIDER_INFO]
export type ProviderInfoKey = keyof typeof PROVIDER_INFO

// =============================================================================
// KPI TILE THEMES
// =============================================================================

export type KpiTheme = 'success' | 'info' | 'accent' | 'warning' | 'destructive' | 'secondary'

export const KPI_THEMES: Record<KpiTheme, {
  bg: string
  border: string
  accent: string
  iconBg: string
}> = {
  success: {
    bg: 'bg-gradient-to-br from-[rgb(var(--kpi-emerald-rgb)/0.08)] to-[rgb(var(--kpi-emerald-rgb)/0.03)] dark:from-[rgb(var(--kpi-emerald-rgb)/0.18)] dark:to-[rgb(var(--kpi-emerald-rgb)/0.08)]',
    border: 'border-[rgb(var(--kpi-emerald-rgb)/0.2)] dark:border-[rgb(var(--kpi-emerald-rgb)/0.35)]',
    accent: 'text-[rgb(var(--kpi-emerald-rgb))] dark:text-[rgb(var(--kpi-emerald-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--kpi-emerald-rgb)/0.16)] to-[rgb(var(--kpi-emerald-rgb)/0.08)] dark:from-[rgb(var(--kpi-emerald-rgb)/0.25)] dark:to-[rgb(var(--kpi-emerald-rgb)/0.14)]',
  },
  info: {
    bg: 'bg-gradient-to-br from-[rgb(var(--kpi-blue-rgb)/0.08)] to-[rgb(var(--kpi-blue-rgb)/0.03)] dark:from-[rgb(var(--kpi-blue-rgb)/0.18)] dark:to-[rgb(var(--kpi-blue-rgb)/0.08)]',
    border: 'border-[rgb(var(--kpi-blue-rgb)/0.2)] dark:border-[rgb(var(--kpi-blue-rgb)/0.35)]',
    accent: 'text-[rgb(var(--kpi-blue-rgb))] dark:text-[rgb(var(--kpi-blue-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--kpi-blue-rgb)/0.16)] to-[rgb(var(--kpi-blue-rgb)/0.08)] dark:from-[rgb(var(--kpi-blue-rgb)/0.25)] dark:to-[rgb(var(--kpi-blue-rgb)/0.14)]',
  },
  accent: {
    bg: 'bg-gradient-to-br from-[rgb(var(--kpi-violet-rgb)/0.08)] to-[rgb(var(--kpi-violet-rgb)/0.03)] dark:from-[rgb(var(--kpi-violet-rgb)/0.18)] dark:to-[rgb(var(--kpi-violet-rgb)/0.08)]',
    border: 'border-[rgb(var(--kpi-violet-rgb)/0.2)] dark:border-[rgb(var(--kpi-violet-rgb)/0.35)]',
    accent: 'text-[rgb(var(--kpi-violet-rgb))] dark:text-[rgb(var(--kpi-violet-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--kpi-violet-rgb)/0.16)] to-[rgb(var(--kpi-violet-rgb)/0.08)] dark:from-[rgb(var(--kpi-violet-rgb)/0.25)] dark:to-[rgb(var(--kpi-violet-rgb)/0.14)]',
  },
  warning: {
    bg: 'bg-gradient-to-br from-[rgb(var(--kpi-amber-rgb)/0.08)] to-[rgb(var(--kpi-amber-rgb)/0.03)] dark:from-[rgb(var(--kpi-amber-rgb)/0.18)] dark:to-[rgb(var(--kpi-amber-rgb)/0.08)]',
    border: 'border-[rgb(var(--kpi-amber-rgb)/0.2)] dark:border-[rgb(var(--kpi-amber-rgb)/0.35)]',
    accent: 'text-[rgb(var(--kpi-amber-rgb))] dark:text-[rgb(var(--kpi-amber-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--kpi-amber-rgb)/0.16)] to-[rgb(var(--kpi-amber-rgb)/0.08)] dark:from-[rgb(var(--kpi-amber-rgb)/0.25)] dark:to-[rgb(var(--kpi-amber-rgb)/0.14)]',
  },
  destructive: {
    bg: 'bg-gradient-to-br from-[rgb(var(--kpi-rose-rgb)/0.08)] to-[rgb(var(--kpi-rose-rgb)/0.03)] dark:from-[rgb(var(--kpi-rose-rgb)/0.18)] dark:to-[rgb(var(--kpi-rose-rgb)/0.08)]',
    border: 'border-[rgb(var(--kpi-rose-rgb)/0.2)] dark:border-[rgb(var(--kpi-rose-rgb)/0.35)]',
    accent: 'text-[rgb(var(--kpi-rose-rgb))] dark:text-[rgb(var(--kpi-rose-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--kpi-rose-rgb)/0.16)] to-[rgb(var(--kpi-rose-rgb)/0.08)] dark:from-[rgb(var(--kpi-rose-rgb)/0.25)] dark:to-[rgb(var(--kpi-rose-rgb)/0.14)]',
  },
  secondary: {
    bg: 'bg-gradient-to-br from-[rgb(var(--kpi-cyan-rgb)/0.08)] to-[rgb(var(--kpi-cyan-rgb)/0.03)] dark:from-[rgb(var(--kpi-cyan-rgb)/0.18)] dark:to-[rgb(var(--kpi-cyan-rgb)/0.08)]',
    border: 'border-[rgb(var(--kpi-cyan-rgb)/0.2)] dark:border-[rgb(var(--kpi-cyan-rgb)/0.35)]',
    accent: 'text-[rgb(var(--kpi-cyan-rgb))] dark:text-[rgb(var(--kpi-cyan-rgb)/0.85)]',
    iconBg: 'from-[rgb(var(--kpi-cyan-rgb)/0.16)] to-[rgb(var(--kpi-cyan-rgb)/0.08)] dark:from-[rgb(var(--kpi-cyan-rgb)/0.25)] dark:to-[rgb(var(--kpi-cyan-rgb)/0.14)]',
  },
} as const

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the Tailwind theme for a provider.
 * Falls back to Google theme if provider not found.
 */
export function getProviderTheme(providerId: string): typeof PROVIDER_THEMES[ProviderId] {
  const normalized = normalizeProviderId(providerId)
  return PROVIDER_THEMES[normalized as ProviderId] ?? PROVIDER_THEMES.google
}

/**
 * Get the color info for a provider.
 * Falls back to Google color if provider not found.
 */
export function getProviderColor(providerId: string): typeof PROVIDER_COLORS[ProviderId] {
  const normalized = normalizeProviderId(providerId)
  return PROVIDER_COLORS[normalized as ProviderId] ?? PROVIDER_COLORS.google
}

/**
 * Get provider info by ID.
 * Falls back to Google info if provider not found.
 */
export function getProviderInfo(providerId: string): ProviderInfo {
  const normalized = normalizeProviderId(providerId)
  return PROVIDER_INFO[normalized as ProviderId] ?? PROVIDER_INFO[PROVIDER_IDS.GOOGLE]
}

/**
 * Get the KPI theme by key.
 * Falls back to blue theme if key not found.
 */
export function getKpiTheme(theme: KpiTheme = 'info'): typeof KPI_THEMES[KpiTheme] {
  return KPI_THEMES[theme] ?? KPI_THEMES.info
}

/**
 * Format provider name for display.
 */
export function formatProviderName(providerId: string): string {
  const normalized = normalizeProviderId(providerId)
  if (normalized in PROVIDER_INFO) {
    return PROVIDER_INFO[normalized as ProviderId].shortName
  }
  return humanizeProviderId(providerId)
}
