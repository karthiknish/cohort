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
    bg: 'bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/30 dark:to-cyan-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    accent: 'text-blue-600 dark:text-blue-400',
    iconBg: 'from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50',
  },
  facebook: {
    bg: 'bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-indigo-950/30 dark:to-violet-950/20',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    accent: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50',
  },
  meta: {
    bg: 'bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-indigo-950/30 dark:to-violet-950/20',
    border: 'border-indigo-200/60 dark:border-indigo-800/40',
    accent: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'from-indigo-100 to-violet-100 dark:from-indigo-900/50 dark:to-violet-900/50',
  },
  linkedin: {
    bg: 'bg-gradient-to-br from-sky-50/50 to-blue-50/30 dark:from-sky-950/30 dark:to-blue-950/20',
    border: 'border-sky-200/60 dark:border-sky-800/40',
    accent: 'text-sky-600 dark:text-sky-400',
    iconBg: 'from-sky-100 to-blue-100 dark:from-sky-900/50 dark:to-blue-900/50',
  },
  tiktok: {
    bg: 'bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-rose-950/30 dark:to-pink-950/20',
    border: 'border-rose-200/60 dark:border-rose-800/40',
    accent: 'text-rose-600 dark:text-rose-400',
    iconBg: 'from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50',
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
    hex: '#4285F4',
    hsl: { h: 217, s: 89, l: 60 },
  },
  facebook: {
    hex: '#0668E1',
    hsl: { h: 211, s: 92, l: 46 },
  },
  meta: {
    hex: '#0668E1',
    hsl: { h: 211, s: 92, l: 46 },
  },
  linkedin: {
    hex: '#0A66C2',
    hsl: { h: 201, s: 91, l: 40 },
  },
  tiktok: {
    hex: '#FE2C55',
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
      color: 'text-[#4285F4]',
      bg: 'bg-[#4285F4]/10',
      border: 'border-[#4285F4]/20',
      indicator: 'bg-[#4285F4]',
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
      color: 'text-[#0668E1]',
      bg: 'bg-[#0668E1]/10',
      border: 'border-[#0668E1]/20',
      indicator: 'bg-[#0668E1]',
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
      color: 'text-[#0668E1]',
      bg: 'bg-[#0668E1]/10',
      border: 'border-[#0668E1]/20',
      indicator: 'bg-[#0668E1]',
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
      color: 'text-[#0A66C2]',
      bg: 'bg-[#0A66C2]/10',
      border: 'border-[#0A66C2]/20',
      indicator: 'bg-[#0A66C2]',
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
      color: 'text-[#FE2C55]',
      bg: 'bg-[#FE2C55]/10',
      border: 'border-[#FE2C55]/20',
      indicator: 'bg-[#FE2C55]',
    },
  },
} as const

export type ProviderInfo = typeof PROVIDER_INFO[keyof typeof PROVIDER_INFO]
export type ProviderInfoKey = keyof typeof PROVIDER_INFO

// =============================================================================
// KPI TILE THEMES
// =============================================================================

export type KpiTheme = 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'cyan'

export const KPI_THEMES: Record<KpiTheme, {
  bg: string
  border: string
  accent: string
  iconBg: string
}> = {
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/30 dark:to-teal-950/20',
    border: 'border-emerald-200/60 dark:border-emerald-800/40',
    accent: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/30 dark:to-cyan-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/40',
    accent: 'text-blue-600 dark:text-blue-400',
    iconBg: 'from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50',
  },
  violet: {
    bg: 'bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-950/30 dark:to-purple-950/20',
    border: 'border-violet-200/60 dark:border-violet-800/40',
    accent: 'text-violet-600 dark:text-violet-400',
    iconBg: 'from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/30 dark:to-yellow-950/20',
    border: 'border-amber-200/60 dark:border-amber-800/40',
    accent: 'text-amber-600 dark:text-amber-400',
    iconBg: 'from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50/50 to-pink-50/30 dark:from-rose-950/30 dark:to-pink-950/20',
    border: 'border-rose-200/60 dark:border-rose-800/40',
    accent: 'text-rose-600 dark:text-rose-400',
    iconBg: 'from-rose-100 to-pink-100 dark:from-rose-900/50 dark:to-pink-900/50',
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-50/50 to-sky-50/30 dark:from-cyan-950/30 dark:to-sky-950/20',
    border: 'border-cyan-200/60 dark:border-cyan-800/40',
    accent: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'from-cyan-100 to-sky-100 dark:from-cyan-900/50 dark:to-sky-900/50',
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
  return PROVIDER_THEMES[providerId as ProviderId] ?? PROVIDER_THEMES.google
}

/**
 * Get the color info for a provider.
 * Falls back to Google color if provider not found.
 */
export function getProviderColor(providerId: string): typeof PROVIDER_COLORS[ProviderId] {
  return PROVIDER_COLORS[providerId as ProviderId] ?? PROVIDER_COLORS.google
}

/**
 * Get provider info by ID.
 * Falls back to Google info if provider not found.
 */
export function getProviderInfo(providerId: string): ProviderInfo {
  return PROVIDER_INFO[providerId as ProviderId] ?? PROVIDER_INFO[PROVIDER_IDS.GOOGLE]
}

/**
 * Get the KPI theme by key.
 * Falls back to blue theme if key not found.
 */
export function getKpiTheme(theme: KpiTheme = 'blue'): typeof KPI_THEMES[KpiTheme] {
  return KPI_THEMES[theme] ?? KPI_THEMES.blue
}

/**
 * Format provider name for display.
 */
export function formatProviderName(providerId: string): string {
  return getProviderInfo(providerId).shortName
}
