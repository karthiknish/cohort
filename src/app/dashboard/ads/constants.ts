import type { LucideIcon } from 'lucide-react'
import { Facebook, Linkedin, Music, Search } from 'lucide-react'

export const METRICS_PAGE_SIZE = 100

export const DEFAULT_SYNC_FREQUENCY_MINUTES = 6 * 60
export const DEFAULT_TIMEFRAME_DAYS = 7

export const FREQUENCY_OPTIONS: Array<{ label: string; value: number }> = [
    { label: 'Every 1 hour', value: 60 },
    { label: 'Every 3 hours', value: 180 },
    { label: 'Every 6 hours', value: 360 },
    { label: 'Every 12 hours', value: 720 },
    { label: 'Once per day', value: 1440 },
]

export const TIMEFRAME_OPTIONS: Array<{ label: string; value: number }> = [
    { label: 'Past day', value: 1 },
    { label: 'Past 3 days', value: 3 },
    { label: 'Past week', value: 7 },
    { label: 'Past 14 days', value: 14 },
    { label: 'Past 30 days', value: 30 },
    { label: 'Past 90 days', value: 90 },
]

export const PROVIDER_ICON_MAP: Record<string, LucideIcon> = {
    google: Search,
    facebook: Facebook,
    meta: Facebook,
    linkedin: Linkedin,
    tiktok: Music,
}

export const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
})

export const ADS_WORKFLOW_STEPS = [
    {
        title: 'Connect your ad accounts',
        description: 'Hook up Google, Meta, LinkedIn, or TikTok so Cohorts can pull spend and performance data.',
    },
    {
        title: 'Enable auto-sync',
        description: 'Turn on automatic syncs to keep campaign metrics and reports fresh without manual exports.',
    },
    {
        title: 'Review cross-channel insights',
        description: 'Use the overview cards and tables below to compare performance and spot optimisation wins.',
    },
] as const
