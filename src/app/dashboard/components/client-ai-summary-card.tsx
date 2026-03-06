'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrainCircuit, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import type { ClientRecord } from '@/types/clients'
import type { MetricRecord } from '@/types/dashboard'
import type { ProposalDraft } from '@/types/proposals'

import type { TaskSummary } from '../components'
import type { IntegrationStatusSummary } from '../hooks'
import {
  buildClientSummarySnapshotHash,
  buildClientSummarySnapshot,
  type ClientSummaryResult,
} from '../utils/client-summary'

type ClientAiSummaryCardProps = {
  selectedClient: ClientRecord | null
  metrics: MetricRecord[]
  metricsLoading: boolean
  taskSummary: TaskSummary
  tasksLoading: boolean
  proposals: ProposalDraft[]
  proposalsLoading: boolean
  integrationSummary: IntegrationStatusSummary
  integrationsLoading: boolean
  lastRefreshed: Date
}

type SummaryStatus = 'idle' | 'loading' | 'ready' | 'error'

type PersistedClientSummary = {
  snapshotHash: string
  summary: ClientSummaryResult
}

function getClientSummaryStorageKey(clientId: string): string {
  return `dashboard-client-summary:${clientId}`
}

function readPersistedClientSummary(clientId: string): PersistedClientSummary | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(getClientSummaryStorageKey(clientId))
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as PersistedClientSummary
    if (
      !parsed ||
      typeof parsed.snapshotHash !== 'string' ||
      !parsed.summary ||
      typeof parsed.summary.headline !== 'string' ||
      !Array.isArray(parsed.summary.bullets)
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

function persistClientSummary(clientId: string, payload: PersistedClientSummary): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(getClientSummaryStorageKey(clientId), JSON.stringify(payload))
}

export function ClientAiSummaryCard({
  selectedClient,
  metrics,
  metricsLoading,
  taskSummary,
  tasksLoading,
  proposals,
  proposalsLoading,
  integrationSummary,
  integrationsLoading,
  lastRefreshed,
}: ClientAiSummaryCardProps) {
  const [summaryStatus, setSummaryStatus] = useState<SummaryStatus>('idle')
  const [summary, setSummary] = useState<ClientSummaryResult | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [persistedSnapshotHash, setPersistedSnapshotHash] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const selectedClientId = selectedClient?.id ?? null

  const waitingForData = metricsLoading || tasksLoading || proposalsLoading || integrationsLoading

  const summarySnapshot = useMemo(() => {
    if (!selectedClient || waitingForData) {
      return null
    }

    return buildClientSummarySnapshot({
      selectedClient,
      metrics,
      taskSummary,
      proposals,
      integrationSummary,
      lastRefreshed,
    })
  }, [integrationSummary, lastRefreshed, metrics, proposals, selectedClient, taskSummary, waitingForData])

  const summarySnapshotHash = useMemo(
    () => (summarySnapshot ? buildClientSummarySnapshotHash(summarySnapshot) : null),
    [summarySnapshot]
  )

  useEffect(() => {
    if (!selectedClientId) {
      setSummaryStatus('idle')
      setSummary(null)
      setSummaryError(null)
      setPersistedSnapshotHash(null)
      return
    }

    const persistedSummary = readPersistedClientSummary(selectedClientId)
    if (persistedSummary) {
      setSummary(persistedSummary.summary)
      setPersistedSnapshotHash(persistedSummary.snapshotHash)
      setSummaryStatus('ready')
      setSummaryError(null)
    } else {
      setSummaryStatus('idle')
      setSummary(null)
      setSummaryError(null)
      setPersistedSnapshotHash(null)
    }
  }, [selectedClientId])

  useEffect(() => {
    if (!selectedClient || !summarySnapshotHash) {
      return
    }

    if (persistedSnapshotHash === summarySnapshotHash && summary) {
      setSummaryStatus('ready')
      setSummaryError(null)
      return
    }

    setSummaryStatus('idle')
  }, [persistedSnapshotHash, selectedClient, summary, summarySnapshotHash])

  const generateSummary = useCallback(async () => {
    if (!summarySnapshot || !selectedClient || !summarySnapshotHash) {
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setSummaryStatus('loading')
    setSummaryError(null)

    try {
      const response = await fetch('/api/dashboard/client-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snapshot: summarySnapshot }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
        data?: {
          summary?: ClientSummaryResult
        }
      }

      if (!response.ok || payload.success === false || !payload.data?.summary) {
        throw new Error(payload.error || 'Unable to generate summary')
      }

      if (requestIdRef.current !== requestId) {
        return
      }

      persistClientSummary(selectedClient.id, {
        snapshotHash: summarySnapshotHash,
        summary: payload.data.summary,
      })

      setSummary(payload.data.summary)
      setPersistedSnapshotHash(summarySnapshotHash)
      setSummaryStatus('ready')
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return
      }

      setSummaryStatus('error')
      setSummaryError(error instanceof Error ? error.message : 'Unknown error')
    }
  }, [selectedClient, summarySnapshot, summarySnapshotHash])

  useEffect(() => {
    if (!selectedClient || !summarySnapshot || waitingForData || summaryStatus !== 'idle') {
      return
    }

    void generateSummary()
  }, [generateSummary, selectedClient, summarySnapshot, summaryStatus, waitingForData])

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-background via-background to-primary/5 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <BrainCircuit className="h-4 w-4 text-primary" />
            AI Client Summary
          </CardTitle>
          <CardDescription>
            {selectedClient
              ? `Executive snapshot for ${selectedClient.name}`
              : 'Choose a client to generate a summary.'}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void generateSummary()}
          disabled={!summarySnapshot || waitingForData || summaryStatus === 'loading'}
        >
          {summaryStatus === 'loading' ? (
            <LoaderCircle className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {!selectedClient ? (
          <div className="rounded-lg border border-dashed border-muted/60 bg-muted/10 p-4 text-sm text-muted-foreground">
            Select a client to generate a concise AI summary from the current dashboard snapshot.
          </div>
        ) : waitingForData && !summary ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[88%]" />
          </div>
        ) : summary ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={summary.usedFallback ? 'outline' : 'secondary'}>
                {summary.usedFallback ? 'Fallback summary' : 'Gemini summary'}
              </Badge>
              {summary.model ? <Badge variant="outline">{summary.model}</Badge> : null}
              {persistedSnapshotHash ? <Badge variant="outline">Saved summary</Badge> : null}
              {summaryStatus === 'loading' ? <Badge variant="outline">Refreshing</Badge> : null}
              {summarySnapshot ? (
                <Badge variant="outline">
                  {summarySnapshot.activeChannels} channel{summarySnapshot.activeChannels === 1 ? '' : 's'}
                </Badge>
              ) : null}
            </div>

            <div className="rounded-xl border border-primary/10 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">{summary.headline}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {summary.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Generated from the current dashboard snapshot at {new Date(summary.generatedAt).toLocaleString()}.
            </p>

            {summaryStatus === 'error' && summaryError ? (
              <p className="text-xs text-destructive">Refresh failed: {summaryError}</p>
            ) : null}
          </>
        ) : summaryStatus === 'error' ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {summaryError || 'Unable to generate a summary right now.'}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-muted/60 bg-muted/10 p-4 text-sm text-muted-foreground">
            Summary will appear once the dashboard snapshot is ready.
          </div>
        )}
      </CardContent>
    </Card>
  )
}