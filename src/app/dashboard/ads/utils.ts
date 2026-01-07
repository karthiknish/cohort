import { formatDistanceToNow } from 'date-fns'

import { DISPLAY_DATE_FORMATTER, FREQUENCY_OPTIONS, TIMEFRAME_OPTIONS } from './constants'
import { getErrorMessage } from '@/lib/error-utils'

export { getErrorMessage }

export function formatRelativeTimestamp(iso?: string | null): string {
    if (!iso) {
        return 'Never synced'
    }
    const parsed = new Date(iso)
    if (Number.isNaN(parsed.getTime())) {
        return 'Unknown'
    }
    return `${formatDistanceToNow(parsed, { addSuffix: true })}`
}

export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'success':
            return 'default'
        case 'pending':
            return 'secondary'
        case 'error':
            return 'destructive'
        default:
            return 'outline'
    }
}

export function getStatusLabel(status: string): string {
    switch (status) {
        case 'success':
            return 'Healthy'
        case 'pending':
            return 'In progress'
        case 'error':
            return 'Failed'
        case 'never':
            return 'Not run yet'
        default:
            return status.charAt(0).toUpperCase() + status.slice(1)
    }
}

export function formatProviderName(providerId: string): string {
    const mapping: Record<string, string> = {
        google: 'Google Ads',
        facebook: 'Meta Ads Manager',
        meta: 'Meta Ads Manager',
        linkedin: 'LinkedIn Ads',
        tiktok: 'TikTok Ads',
    }

    if (mapping[providerId]) {
        return mapping[providerId]
    }

    if (providerId.length === 0) {
        return 'Unknown Provider'
    }

    return providerId.charAt(0).toUpperCase() + providerId.slice(1)
}

export function describeFrequency(minutes: number): string {
    const match = FREQUENCY_OPTIONS.find((option) => option.value === minutes)
    if (match) {
        return match.label
    }

    if (minutes % 1440 === 0) {
        const days = minutes / 1440
        return days === 1 ? 'Once per day' : `Every ${days} days`
    }

    if (minutes % 60 === 0) {
        const hours = minutes / 60
        return hours === 1 ? 'Every hour' : `Every ${hours} hours`
    }

    return `Every ${minutes} minutes`
}

export function describeTimeframe(days: number): string {
    const match = TIMEFRAME_OPTIONS.find((option) => option.value === days)
    if (match) {
        return match.label.replace('Past', 'Last')
    }

    if (days === 1) {
        return 'Last day'
    }

    if (days === 7) {
        return 'Last 7 days'
    }

    return `Last ${days} days`
}

export function formatDisplayDate(value: string): string {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return value
    }
    return DISPLAY_DATE_FORMATTER.format(parsed)
}
