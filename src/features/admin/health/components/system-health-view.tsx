'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Globe,
  Mail,
  Package,
  PieChart,
  RefreshCw,
  Server,
  Settings,
  XCircle,
  Zap,
} from 'lucide-react'

import { getPreviewAdminHealthData } from '@/lib/preview-data'
import { cn } from '@/lib/utils'
import { usePreview } from '@/shared/contexts/preview-context'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

interface HealthCheck {
  status: 'ok' | 'warning' | 'error'
  message?: string
  responseTime?: number
  metadata?: Record<string, unknown>
}

const SERVICE_META: Record<string, { label: string; description: string }> = {
  convex: { label: 'Convex', description: 'Realtime database and backend functions' },
  betterauth: { label: 'Better Auth', description: 'Authentication and session plumbing' },
  gemini: { label: 'Gemini', description: 'AI summaries and admin intelligence' },
  posthog: { label: 'PostHog', description: 'Product analytics and event tracking' },
  brevo: { label: 'Brevo', description: 'Transactional email delivery' },
  googleads: { label: 'Google Ads', description: 'Ads OAuth and sync configuration' },
  googleanalytics: { label: 'Google Analytics', description: 'Analytics OAuth and property sync configuration' },
  metaads: { label: 'Meta Ads', description: 'Meta OAuth and ads sync configuration' },
  linkedinads: { label: 'LinkedIn Ads', description: 'LinkedIn OAuth and ads sync configuration' },
  tiktokads: { label: 'TikTok Ads', description: 'TikTok OAuth and ads sync configuration' },
  googleworkspace: { label: 'Google Workspace', description: 'Calendar and Meet integration' },
  livekit: { label: 'LiveKit', description: 'Meeting room and token infrastructure' },
  environment: { label: 'Environment', description: 'Base runtime configuration' },
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  responseTime: number
  checks: Record<string, HealthCheck>
  version: string
}

async function fetchHealthData(): Promise<HealthData> {
  const response = await fetch('/api/health', {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  })

  const json = await response.json()

  if (json.data) {
    return json.data
  }
  if (json.status) {
    return json
  }
  throw new Error('Invalid health response format')
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'ok':
    case 'healthy':
      return <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
    case 'warning':
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-warning" aria-hidden />
    default:
      return <XCircle className="h-5 w-5 text-destructive" aria-hidden />
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'ok':
    case 'healthy':
      return 'bg-success/10 text-success'
    case 'warning':
    case 'degraded':
      return 'bg-warning/10 text-warning'
    default:
      return 'bg-destructive/10 text-destructive'
  }
}

function getServiceIcon(name: string) {
  const key = name.toLowerCase()
  switch (key) {
    case 'convex':
      return <Database className="h-4 w-4" aria-hidden />
    case 'betterauth':
      return <Server className="h-4 w-4" aria-hidden />
    case 'gemini':
      return <Zap className="h-4 w-4" aria-hidden />
    case 'brevo':
      return <Mail className="h-4 w-4" aria-hidden />
    case 'posthog':
      return <PieChart className="h-4 w-4" aria-hidden />
    case 'googleworkspace':
      return <Activity className="h-4 w-4" aria-hidden />
    case 'livekit':
      return <Server className="h-4 w-4" aria-hidden />
    case 'environment':
      return <Settings className="h-4 w-4" aria-hidden />
    default:
      return <Globe className="h-4 w-4" aria-hidden />
  }
}

function getServiceDescription(name: string, check: HealthCheck) {
  const key = name.toLowerCase()
  if (check.status === 'warning' && check.message) return check.message
  return SERVICE_META[key]?.description ?? (check.status === 'ok' ? 'Connected' : 'Service issue')
}

interface ServiceHealthCardProps {
  name: string
  check: HealthCheck
  isExpanded: boolean
  onToggleExpand: (service: string) => void
}

function ServiceHealthCard({ name, check, isExpanded, onToggleExpand }: ServiceHealthCardProps) {
  const serviceMeta = SERVICE_META[name.toLowerCase()]

  const handleToggleExpand = useCallback(() => {
    onToggleExpand(name)
  }, [name, onToggleExpand])

  const isWarning = check.status === 'warning'

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/80 bg-card shadow-sm transition-[border-color,box-shadow]',
        check.status === 'error' && 'border-destructive/40 bg-destructive/3',
        isWarning && 'border-warning/35 bg-warning/6',
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
              check.status === 'ok'
                ? 'bg-success/10 text-success'
                : isWarning
                  ? 'bg-warning/10 text-warning'
                  : 'bg-destructive/10 text-destructive',
            )}
          >
            {getServiceIcon(name)}
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold leading-tight tracking-tight">
              {serviceMeta?.label ?? name}
            </CardTitle>
            <CardDescription className="text-pretty text-xs leading-relaxed">
              {getServiceDescription(name, check)}
            </CardDescription>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
          {check.responseTime !== undefined ? (
            <Badge variant="outline" className="font-mono text-[10px] tabular-nums">
              {check.responseTime}ms
            </Badge>
          ) : null}
          {getStatusIcon(check.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {check.message ? (
          <p
            className={cn(
              'text-xs font-medium leading-relaxed',
              check.status === 'error'
                ? 'text-destructive'
                : check.status === 'warning'
                  ? 'text-warning'
                  : 'text-muted-foreground',
            )}
          >
            {check.message}
          </p>
        ) : null}

        {check.metadata && Object.keys(check.metadata).length > 0 ? (
          <div className="space-y-2 border-t border-border/50 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-between px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleToggleExpand}
              aria-expanded={isExpanded}
            >
              <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
              )}
            </Button>

            {isExpanded ? (
              <div className="max-h-48 overflow-auto rounded-md border border-border/60 bg-muted/30 p-3 text-[11px] leading-relaxed">
                <pre className="whitespace-pre-wrap break-all font-mono text-muted-foreground">
                  {JSON.stringify(check.metadata, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{children}</p>
  )
}

export function SystemHealthView() {
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const { isPreviewMode } = usePreview()
  const previewData = useMemo(() => getPreviewAdminHealthData(), [])

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchHealthData,
    enabled: !isPreviewMode,
    refetchInterval: 30000,
    staleTime: 10000,
  })

  const resolvedData = isPreviewMode ? previewData : data
  const loading = !isPreviewMode && isLoading
  const refreshing = !isPreviewMode && isFetching
  const resolvedError = isPreviewMode ? null : error

  const toggleExpand = useCallback((service: string) => {
    setExpandedServices((prev) => {
      const next = new Set(prev)
      if (next.has(service)) next.delete(service)
      else next.add(service)
      return next
    })
  }, [])

  const handleRefetch = useCallback(() => {
    if (isPreviewMode) return
    void refetch()
  }, [isPreviewMode, refetch])

  const lastCheckedLabel = useMemo(() => {
    if (!resolvedData?.timestamp) return null
    try {
      return formatDistanceToNow(new Date(resolvedData.timestamp), { addSuffix: true })
    } catch {
      return null
    }
  }, [resolvedData?.timestamp])

  const okCount = resolvedData ? Object.values(resolvedData.checks).filter((c) => c.status === 'ok').length : 0
  const warningCount = resolvedData
    ? Object.values(resolvedData.checks).filter((c) => c.status === 'warning').length
    : 0
  const totalCount = resolvedData ? Object.keys(resolvedData.checks).length : 0

  if (loading && !resolvedData) {
    return (
      <div className="space-y-8">
        <div className="space-y-4 border-b border-border/60 pb-8">
          <Skeleton className="h-3 w-28" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 shrink-0" />
          </div>
        </div>
        <div>
          <Skeleton className="mb-4 h-3 w-24" />
          <div className="grid gap-4 sm:grid-cols-3">
            {['m-a', 'm-b', 'm-c'].map((key) => (
              <div key={key} className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="mb-4 h-3 w-32" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {['c-a', 'c-b', 'c-c', 'c-d', 'c-e', 'c-f'].map((key) => (
              <Skeleton key={key} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (resolvedError && !resolvedData) {
    return (
      <Card className="border-destructive/30 bg-destructive/4 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
          </div>
          <div className="max-w-sm space-y-2">
            <h3 className="text-lg font-semibold tracking-tight text-destructive">Monitoring unavailable</h3>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {resolvedError instanceof Error ? resolvedError.message : 'Failed to fetch health status.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefetch}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-10">
      {isPreviewMode ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          Preview mode uses sample health data. Deployed checks load automatically when preview is off.
        </div>
      ) : null}

      <div className="space-y-4 border-b border-border/60 pb-8">
        <SectionLabel>Live monitor</SectionLabel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                resolvedData?.status === 'healthy'
                  ? 'bg-success/10'
                  : resolvedData?.status === 'degraded'
                    ? 'bg-warning/10'
                    : 'bg-destructive/10',
              )}
            >
              {getStatusIcon(resolvedData?.status || 'unhealthy')}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold tracking-tight text-foreground">Aggregate status</span>
                <Badge className={cn('text-[10px] font-semibold uppercase tracking-wide', getStatusBadgeColor(resolvedData?.status || 'unhealthy'))}>
                  {(resolvedData?.status ?? 'unknown').replace(/-/g, ' ')}
                </Badge>
              </div>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {okCount} of {totalCount} checks passing
                {warningCount > 0 ? ` · ${warningCount} need attention` : ''}
                {lastCheckedLabel ? ` · Updated ${lastCheckedLabel}` : ''}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 self-start sm:self-center"
            onClick={handleRefetch}
            disabled={refreshing || isPreviewMode}
            title={isPreviewMode ? 'Disabled in preview mode' : 'Runs a fresh health request'}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden />
            {refreshing ? 'Checking…' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <SectionLabel>Overview</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Response time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">{resolvedData?.responseTime ?? 0}ms</div>
              <p className="text-xs leading-relaxed text-muted-foreground">Full health check roundtrip</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{resolvedData ? formatUptime(resolvedData.uptime) : '0m'}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">Server process duration</p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Version</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">v{resolvedData?.version ?? '0.0.0'}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {process.env.NODE_ENV === 'production' ? 'Production build' : 'Development build'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <SectionLabel>Integrations</SectionLabel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resolvedData
            ? Object.entries(resolvedData.checks).map(([name, check]) => (
                <ServiceHealthCard
                  key={name}
                  name={name}
                  check={check}
                  isExpanded={expandedServices.has(name)}
                  onToggleExpand={toggleExpand}
                />
              ))
            : null}
        </div>
      </div>

      {resolvedError && resolvedData ? (
        <Card className="border-warning/35 bg-warning/6 shadow-sm">
          <CardContent className="flex gap-3 py-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
            <p className="text-pretty text-sm leading-relaxed text-warning">
              Last refresh failed: {resolvedError instanceof Error ? resolvedError.message : 'Unknown error'}. Showing
              cached data.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
