'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCw,
    Server,
    ShieldCheck,
    Zap,
    Mail,
    PieChart,
    ChevronDown,
    ChevronUp,
    Settings,
    Database,
    Globe,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HealthCheck {
    status: 'ok' | 'error'
    message?: string
    responseTime?: number
    metadata?: Record<string, unknown>
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
    } else if (json.status) {
        return json
    }
    throw new Error('Invalid health response format')
}

export function SystemHealthView() {
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

    const { data, isLoading: loading, error, isFetching: refreshing, refetch } = useQuery({
        queryKey: ['system-health'],
        queryFn: fetchHealthData,
        refetchInterval: 30000,
        staleTime: 10000,
    })

    const toggleExpand = (service: string) => {
        setExpandedServices(prev => {
            const next = new Set(prev)
            if (next.has(service)) next.delete(service)
            else next.add(service)
            return next
        })
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ok':
            case 'healthy':
                return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            case 'warning':
            case 'degraded':
                return <AlertCircle className="h-5 w-5 text-amber-500" />
            default:
                return <XCircle className="h-5 w-5 text-destructive" />
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ok':
            case 'healthy':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            case 'warning':
            case 'degraded':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            default:
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }
    }

    const getServiceIcon = (name: string) => {
        const key = name.toLowerCase()
        switch (key) {
            case 'convex':
                return <Database className="h-4 w-4" />
            case 'stripe':
                return <ShieldCheck className="h-4 w-4" />
            case 'redis':
                return <Zap className="h-4 w-4" />
            case 'brevo':
                return <Mail className="h-4 w-4" />
            case 'posthog':
                return <PieChart className="h-4 w-4" />
            case 'environment':
                return <Settings className="h-4 w-4" />
            case 'scheduler':
                return <Activity className="h-4 w-4" />
            default:
                return <Globe className="h-4 w-4" />
        }
    }

    const getServiceDescription = (name: string, check: HealthCheck) => {
        const key = name.toLowerCase()
        if (check.message === 'Not configured') {
            return 'Not configured'
        }
        switch (key) {
            case 'convex':
                return 'Real-time database'
            case 'stripe':
                return 'Payment processing'
            case 'brevo':
                return 'Email delivery'
            case 'posthog':
                return 'Product analytics'
            case 'environment':
                return 'Environment variables'
            default:
                return check.status === 'ok' ? 'Connected' : 'Service issue'
        }
    }

    const formatUptime = (seconds: number) => {
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

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-9 w-32" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (error && !data) {
        return (
            <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">Monitoring Offline</h3>
                    <p className="max-w-xs text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Failed to fetch health status'}</p>
                    <Button variant="outline" className="mt-4" onClick={() => void refetch()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const okCount = data ? Object.values(data.checks).filter(c => c.status === 'ok').length : 0
    const totalCount = data ? Object.keys(data.checks).length : 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        data?.status === 'healthy'
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : data?.status === 'degraded'
                                ? "bg-amber-100 dark:bg-amber-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                    )}>
                        {getStatusIcon(data?.status || 'unhealthy')}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">System Status</h2>
                            <Badge className={cn("text-xs", getStatusBadgeColor(data?.status || 'unhealthy'))}>
                                {data?.status?.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {okCount}/{totalCount} services operational · Last checked: {data ? new Date(data.timestamp).toLocaleTimeString() : 'Never'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                    disabled={refreshing}
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
                    {refreshing ? 'Checking...' : 'Refresh'}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-muted/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.responseTime ?? 0}ms</div>
                        <p className="text-xs text-muted-foreground">Full health check roundtrip</p>
                    </CardContent>
                </Card>
                <Card className="border-muted/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data ? formatUptime(data.uptime) : '0m'}
                        </div>
                        <p className="text-xs text-muted-foreground">Server process duration</p>
                    </CardContent>
                </Card>
                <Card className="border-muted/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Version</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">v{data?.version ?? '0.0.0'}</div>
                        <p className="text-xs text-muted-foreground">
                            {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold">Service Health</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data && Object.entries(data.checks).map(([name, check]) => {
                        const isExpanded = expandedServices.has(name)
                        const isNotConfigured = check.message === 'Not configured'

                        return (
                            <Card key={name} className={cn(
                                "overflow-hidden transition-all border-muted/60",
                                check.status === 'error' && !isNotConfigured && "border-destructive/30 bg-destructive/5"
                            )}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "rounded-lg p-2",
                                            check.status === 'ok'
                                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : isNotConfigured
                                                    ? "bg-muted text-muted-foreground"
                                                    : "bg-destructive/10 text-destructive"
                                        )}>
                                            {getServiceIcon(name)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base capitalize">{name}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {getServiceDescription(name, check)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {check.responseTime !== undefined && (
                                            <Badge variant="outline" className="text-[10px] font-mono">
                                                {check.responseTime}ms
                                            </Badge>
                                        )}
                                        {isNotConfigured ? (
                                            <Badge variant="secondary" className="text-[10px]">
                                                N/A
                                            </Badge>
                                        ) : (
                                            getStatusIcon(check.status)
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {check.message && !isNotConfigured && (
                                        <p className={cn(
                                            "mb-2 text-xs font-medium",
                                            check.status === 'error' ? "text-destructive" : "text-muted-foreground"
                                        )}>
                                            {check.message}
                                        </p>
                                    )}

                                    {check.metadata && Object.keys(check.metadata).length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-between h-7 px-2 text-[11px] hover:bg-muted"
                                                onClick={() => toggleExpand(name)}
                                            >
                                                {isExpanded ? 'Hide Details' : 'Show Details'}
                                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </Button>

                                            {isExpanded && (
                                                <div className="rounded-md bg-muted/40 p-2 text-[10px] font-mono overflow-auto max-h-40">
                                                    <pre>{JSON.stringify(check.metadata, null, 2)}</pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {error && data && (
                <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                    <CardContent className="flex items-center gap-3 py-3">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            Last refresh failed: {error instanceof Error ? error.message : 'Unknown error'}. Showing cached data.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
