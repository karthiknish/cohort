'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCw,
    Clock,
    Server,
    ShieldCheck,
    Zap,
    Mail,
    PieChart,
    ChevronDown,
    ChevronUp
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface HealthCheck {
    status: 'ok' | 'error'
    message?: string
    responseTime?: number
    metadata?: any
}

interface HealthData {
    status: 'healthy' | 'degraded' | 'unhealthy'
    timestamp: string
    uptime: number
    responseTime: number
    checks: Record<string, HealthCheck>
    environment: {
        nodeEnv: string
        version: string
    }
}

export function SystemHealthView() {
    const { getIdToken } = useAuth()
    const [data, setData] = useState<HealthData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

    const fetchHealth = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(null)

        try {
            const token = await getIdToken()
            const res = await fetch('/api/admin/health', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store'
            })

            if (!res.ok) throw new Error('Failed to fetch health status')

            const payload = await res.json()
            if (payload.success) {
                setData(payload.data)
            } else {
                throw new Error(payload.error || 'Unknown error')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load system health')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [getIdToken])

    useEffect(() => {
        fetchHealth()
    }, [fetchHealth])

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

    const getServiceIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case 'firebase': return <Server className="h-4 w-4" />
            case 'stripe': return <ShieldCheck className="h-4 w-4" />
            case 'redis': return <Zap className="h-4 w-4" />
            case 'brevo': return <Mail className="h-4 w-4" />
            case 'posthog': return <PieChart className="h-4 w-4" />
            case 'scheduler': return <Activity className="h-4 w-4" />
            default: return <Activity className="h-4 w-4" />
        }
    }

    if (loading && !data) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
            </div>
        )
    }

    if (error && !data) {
        return (
            <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
                    <h3 className="text-lg font-semibold text-destructive">Monitoring Offline</h3>
                    <p className="max-w-xs text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => fetchHealth()}>
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        data?.status === 'healthy' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}>
                        {getStatusIcon(data?.status || 'unhealthy')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold capitalize">System Status: {data?.status}</h2>
                        <p className="text-sm text-muted-foreground">
                            Last checked: {data ? new Date(data.timestamp).toLocaleTimeString() : 'Never'}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHealth(true)}
                    disabled={refreshing}
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
                    Refresh Checks
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Overall Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.responseTime}ms</div>
                        <p className="text-xs text-muted-foreground">Full stack roundtrip</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data ? Math.floor(data.uptime / 3600) : 0}h {data ? Math.floor((data.uptime % 3600) / 60) : 0}m
                        </div>
                        <p className="text-xs text-muted-foreground">Process running duration</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Environment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{data?.environment?.nodeEnv}</div>
                        <p className="text-xs text-muted-foreground">v{data?.environment?.version}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {data && Object.entries(data.checks).map(([name, check]) => {
                    const isExpanded = expandedServices.has(name)
                    return (
                        <Card key={name} className={cn(
                            "overflow-hidden transition-all",
                            check.status === 'error' && "border-destructive/30"
                        )}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "rounded-md p-2",
                                        check.status === 'ok' ? "bg-emerald-50 text-emerald-600" : "bg-destructive/10 text-destructive"
                                    )}>
                                        {getServiceIcon(name)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base capitalize">{name}</CardTitle>
                                        <CardDescription className="text-xs">
                                            {check.status === 'ok' ? 'Connected' : 'Service Issue'}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {check.responseTime && (
                                        <Badge variant="outline" className="text-[10px] font-mono">
                                            {check.responseTime}ms
                                        </Badge>
                                    )}
                                    {getStatusIcon(check.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {check.message && (
                                    <p className="mb-2 text-xs text-destructive font-medium">
                                        {check.message}
                                    </p>
                                )}

                                {check.metadata && (
                                    <div className="mt-2 space-y-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-between h-7 px-2 text-[11px] hover:bg-muted"
                                            onClick={() => toggleExpand(name)}
                                        >
                                            {isExpanded ? 'Hide Details' : 'Show Technical Details'}
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
    )
}
