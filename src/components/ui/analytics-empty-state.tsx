import { ReactNode } from 'react'
import { FileX, BarChart3, TrendingUp, Image, Users, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

type EmptyStateVariant = 'no-data' | 'no-filters' | 'no-integration' | 'no-metrics' | 'error'

type Props = {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const variantConfig = {
  'no-data': {
    defaultIcon: <FileX className="h-10 w-10" />,
    defaultTitle: 'No Data Available',
    defaultDescription: 'There is no data to display for the current selection.',
  },
  'no-filters': {
    defaultIcon: <BarChart3 className="h-10 w-10" />,
    defaultTitle: 'No Matching Data',
    defaultDescription: 'Try adjusting your filters to see results.',
  },
  'no-integration': {
    defaultIcon: <TrendingUp className="h-10 w-10" />,
    defaultTitle: 'Connect Your Account',
    defaultDescription: 'Connect your ad platform to start seeing analytics data.',
  },
  'no-metrics': {
    defaultIcon: <AlertCircle className="h-10 w-10" />,
    defaultTitle: 'Metrics Not Available',
    defaultDescription: 'The requested metrics are not available for this platform.',
  },
  'error': {
    defaultIcon: <AlertCircle className="h-10 w-10" />,
    defaultTitle: 'Unable to Load Data',
    defaultDescription: 'There was a problem loading the analytics data.',
  },
}

export function AnalyticsEmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}: Props) {
  const config = variantConfig[variant]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground">
        {icon || config.defaultIcon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title || config.defaultTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">
        {description || config.defaultDescription}
      </p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specialized empty state components for common analytics scenarios

export function NoPerformanceData({ className }: { className?: string }) {
  return (
    <AnalyticsEmptyState
      variant="no-data"
      title="No Performance Data"
      description="There is no performance data available for the selected filters and time period."
      className={className}
    />
  )
}

export function NoCreativeData({ platform = 'Meta' }: { platform?: string }) {
  return (
    <AnalyticsEmptyState
      variant="no-metrics"
      title={`No ${platform} Creative Data`}
      description={`Creative-level insights are not available. Ensure ${platform} syncs are configured with active creative data.`}
    />
  )
}

export function NoInsightsData({ className }: { className?: string }) {
  return (
    <AnalyticsEmptyState
      variant="no-filters"
      title="No Insights Available"
      description="No specific optimizations identified for the current data set. Try adjusting your filters or time period."
      className={className}
    />
  )
}

export function NoIntegrationConnected({
  onConnect,
  platform,
  className,
}: {
  onConnect?: () => void
  platform?: string
  className?: string
}) {
  return (
    <AnalyticsEmptyState
      variant="no-integration"
      title={`Connect Your ${platform || 'Ad'} Account`}
      description={`Connect your ${platform || 'ad platform'} account to start seeing performance data and insights.`}
      action={
        onConnect
          ? { label: `Connect ${platform || 'Account'}`, onClick: onConnect }
          : undefined
      }
      className={className}
    />
  )
}

export function AnalyticsError({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <AnalyticsEmptyState
      variant="error"
      title="Unable to Load Analytics"
      description={message || 'There was a problem loading the analytics data. Please try again.'}
      action={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  )
}
