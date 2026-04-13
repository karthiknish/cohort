'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

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

type ClientSummarySnapshot = NonNullable<ReturnType<typeof buildClientSummarySnapshot>>

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

type SummaryState = {
  summaryStatus: SummaryStatus
  summary: ClientSummaryResult | null
  summaryError: string | null
  persistedSnapshotHash: string | null
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

function getInitialSummaryState(clientId: string): SummaryState {
  const persistedSummary = readPersistedClientSummary(clientId)
  if (!persistedSummary) {
    return {
      summaryStatus: 'idle',
      summary: null,
      summaryError: null,
      persistedSnapshotHash: null,
    }
  }

  return {
    summaryStatus: 'ready',
    summary: persistedSummary.summary,
    summaryError: null,
    persistedSnapshotHash: persistedSummary.snapshotHash,
  }
}

function ClientAiSummaryCardBody({
  selectedClient,
  summarySnapshot,
  summarySnapshotHash,
  waitingForData,
  manualRefreshToken,
}: {
  selectedClient: ClientRecord
  summarySnapshot: ClientSummarySnapshot | null
  summarySnapshotHash: string | null
  waitingForData: boolean
  manualRefreshToken: number
}) {
  const [state, setState] = useState<SummaryState>(() => getInitialSummaryState(selectedClient.id))
  const requestIdRef = useRef(0)
  const hasCurrentSummary = Boolean(
    state.summary && summarySnapshotHash && state.persistedSnapshotHash === summarySnapshotHash,
  )
  const effectiveStatus: SummaryStatus =
    state.summaryStatus === 'loading' || state.summaryStatus === 'error'
      ? state.summaryStatus
      : hasCurrentSummary
        ? 'ready'
        : 'idle'

  const generateSummary = useCallback(() => {
    if (!summarySnapshot || !summarySnapshotHash) {
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setState((prev) => ({
      ...prev,
      summaryStatus: 'loading',
      summaryError: null,
    }))

    return fetch('/api/dashboard/client-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ snapshot: summarySnapshot }),
    })
      .then(async (response) => {
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

        setState({
          summaryStatus: 'ready',
          summary: payload.data.summary,
          summaryError: null,
          persistedSnapshotHash: summarySnapshotHash,
        })
      })
      .catch((error) => {
        if (requestIdRef.current !== requestId) {
          return
        }

        setState((prev) => ({
          ...prev,
          summaryStatus: 'error',
          summaryError: error instanceof Error ? error.message : 'Unknown error',
        }))
      })
  }, [selectedClient.id, summarySnapshot, summarySnapshotHash])

  useEffect(() => {
    if (!summarySnapshot || waitingForData || effectiveStatus !== 'idle') {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void generateSummary()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [effectiveStatus, generateSummary, summarySnapshot, waitingForData])

  useEffect(() => {
    if (!summarySnapshot || waitingForData || manualRefreshToken === 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void generateSummary()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [generateSummary, manualRefreshToken, summarySnapshot, waitingForData])

  return (
      waitingForData && !state.summary ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[88%]" />
        </div>
      ) : state.summary ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={state.summary.usedFallback ? 'outline' : 'secondary'}>
              {state.summary.usedFallback ? 'Fallback summary' : 'Gemini summary'}
            </Badge>
            {state.summary.model ? <Badge variant="outline">{state.summary.model}</Badge> : null}
            {state.persistedSnapshotHash ? <Badge variant="outline">Saved summary</Badge> : null}
            {effectiveStatus === 'loading' ? <Badge variant="outline">Refreshing</Badge> : null}
            {summarySnapshot ? (
              <Badge variant="outline">
                {summarySnapshot.activeChannels} channel{summarySnapshot.activeChannels === 1 ? '' : 's'}
              </Badge>
            ) : null}
          </div>

          <div className="rounded-xl border border-primary/10 bg-background/80 p-4">
            <p className="text-sm font-semibold text-foreground">{state.summary.headline}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {state.summary.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Generated from the current dashboard snapshot at {new Date(state.summary.generatedAt).toLocaleString()}.
          </p>

          {effectiveStatus === 'error' && state.summaryError ? (
            <p className="text-xs text-destructive">Refresh failed: {state.summaryError}</p>
          ) : null}
        </>
      ) : effectiveStatus === 'error' ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {state.summaryError || 'Unable to generate a summary right now.'}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-muted/60 bg-muted/10 p-4 text-sm text-muted-foreground">
          Summary will appear once the dashboard snapshot is ready.
        </div>
      )
  )
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
  const [manualRefreshToken, setManualRefreshToken] = useState(0)
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

  const handleManualRefresh = useCallback(() => {
    setManualRefreshToken((token) => token + 1)
  }, [])

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
          onClick={handleManualRefresh}
          disabled={!summarySnapshot || waitingForData}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {!selectedClient ? (
          <div className="rounded-lg border border-dashed border-muted/60 bg-muted/10 p-4 text-sm text-muted-foreground">
            Select a client to generate a concise AI summary from the current dashboard snapshot.
          </div>
        ) : (
          <ClientAiSummaryCardBody
            key={selectedClient.id}
            selectedClient={selectedClient}
            summarySnapshot={summarySnapshot}
            summarySnapshotHash={summarySnapshotHash}
            waitingForData={waitingForData}
            manualRefreshToken={manualRefreshToken}
          />
        )}
      </CardContent>
    </Card>
  )
}