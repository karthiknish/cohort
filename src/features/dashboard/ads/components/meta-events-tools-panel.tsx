'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { Loader2, Send, Zap } from 'lucide-react'

import { adsMetaEventsApi, adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import {
  META_CAPI_ACTION_SOURCES,
  META_CAPI_STANDARD_EVENTS,
  META_OFFLINE_ACTION_SOURCE,
} from '@/lib/meta-capi-events'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { MotionTabsContent, Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'
import { toast } from '@/shared/ui/use-toast'
import {
  hasMetaEventsTools,
  resolveMetaCampaignUiVisibility,
} from '@/lib/meta-campaign-ui'

type PixelRow = { id: string; name: string }

type MetaEventsToolsPanelProps = {
  workspaceId: string
  clientId?: string | null
  adAccountId?: string | null
  campaignObjective?: string | null
  /** Account-level surfaces hide CAPI/offline without a campaign objective. */
  scope?: 'campaign' | 'account'
}

export function MetaEventsToolsPanel({
  workspaceId,
  clientId,
  adAccountId,
  campaignObjective,
  scope,
}: MetaEventsToolsPanelProps) {
  const visibility = useMemo(
    () => resolveMetaCampaignUiVisibility({ campaignObjective, scope }),
    [campaignObjective, scope],
  )

  const eventTabs = useMemo(() => {
    const tabs: Array<'capi' | 'offline' | 'batch'> = []
    if (visibility.showCapi) tabs.push('capi')
    if (visibility.showOfflineEvents) tabs.push('offline')
    if (visibility.showBatchApi) tabs.push('batch')
    return tabs
  }, [visibility])

  const [activeTab, setActiveTab] = useState<string>('batch')

  const listAdPixels = useAction(adsMetaToolsApi.listAdPixels)
  const sendCapiEvents = useAction(adsMetaEventsApi.sendCapiEvents)
  const sendOfflineEvents = useAction(adsMetaEventsApi.sendOfflineEvents)
  const executeBatch = useAction(adsMetaEventsApi.executeBatch)

  const [pixels, dispatchPixels] = useReducer(
    (_: { rows: PixelRow[]; loading: boolean }, value: { rows: PixelRow[]; loading: boolean }) => value,
    { rows: [], loading: false },
  )

  const [pixelId, setPixelId] = useState('')
  const [eventName, setEventName] = useState('Purchase')
  const [actionSource, setActionSource] = useState('website')
  const [email, setEmail] = useState('')
  const [value, setValue] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [orderId, setOrderId] = useState('')
  const [testEventCode, setTestEventCode] = useState('')
  const [sendingCapi, setSendingCapi] = useState(false)
  const [sendingOffline, setSendingOffline] = useState(false)
  const [batchJson, setBatchJson] = useState('')
  const [runningBatch, setRunningBatch] = useState(false)
  const [batchResult, setBatchResult] = useState('')

  const needsPixelList = visibility.showCapi || visibility.showOfflineEvents

  useEffect(() => {
    if (eventTabs.length > 0 && !eventTabs.includes(activeTab as 'capi' | 'offline' | 'batch')) {
      setActiveTab(eventTabs[0]!)
    }
  }, [activeTab, eventTabs])

  useEffect(() => {
    setEventName(visibility.defaultCapiEventName)
  }, [visibility.defaultCapiEventName])

  useEffect(() => {
    if (!needsPixelList) {
      dispatchPixels({ rows: [], loading: false })
      return
    }

    let cancelled = false
    dispatchPixels({ rows: [], loading: true })
    void listAdPixels({ workspaceId, clientId: clientId ?? null })
      .then((rows) => {
        if (cancelled) return
        const mapped = Array.isArray(rows)
          ? rows.map((row) => ({ id: String(row.id), name: String(row.name) }))
          : []
        dispatchPixels({ rows: mapped, loading: false })
        const onlyPixel = mapped.length === 1 ? mapped[0] : undefined
        if (onlyPixel) setPixelId(onlyPixel.id)
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'MetaEventsToolsPanel:listAdPixels',
          title: 'Could not load pixels',
          fallbackMessage: 'Could not load pixels',
        })
        dispatchPixels({ rows: [], loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [clientId, listAdPixels, needsPixelList, workspaceId])

  const buildEventPayload = useCallback(() => {
    const parsedValue = value.trim() ? Number(value) : undefined
    return {
      eventName,
      actionSource,
      email: email.trim() || undefined,
      value: Number.isFinite(parsedValue) ? parsedValue : undefined,
      currency: currency.trim() || undefined,
      orderId: orderId.trim() || undefined,
    }
  }, [actionSource, currency, email, eventName, orderId, value])

  const handleSendCapi = useCallback(() => {
    if (!pixelId.trim()) {
      toast({ title: 'Select a pixel', variant: 'destructive' })
      return
    }
    setSendingCapi(true)
    void sendCapiEvents({
      workspaceId,
      clientId: clientId ?? null,
      pixelId: pixelId.trim(),
      events: [buildEventPayload()],
      testEventCode: testEventCode.trim() || undefined,
    })
      .then((result) => {
        toast({
          title: 'CAPI events sent',
          description: `Meta received ${result.eventsReceived ?? 1} event(s).`,
        })
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaEventsToolsPanel:sendCapi',
          title: 'CAPI send failed',
          fallbackMessage: 'Check pixel permissions and event payload.',
        })
      })
      .finally(() => setSendingCapi(false))
  }, [buildEventPayload, clientId, pixelId, sendCapiEvents, testEventCode, workspaceId])

  const handleSendOffline = useCallback(() => {
    if (!pixelId.trim()) {
      toast({ title: 'Select a pixel', variant: 'destructive' })
      return
    }
    setSendingOffline(true)
    void sendOfflineEvents({
      workspaceId,
      clientId: clientId ?? null,
      pixelId: pixelId.trim(),
      events: [{ ...buildEventPayload(), actionSource: META_OFFLINE_ACTION_SOURCE }],
      testEventCode: testEventCode.trim() || undefined,
    })
      .then((result) => {
        toast({
          title: 'Offline events sent',
          description: `Meta received ${result.eventsReceived ?? 1} store event(s).`,
        })
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaEventsToolsPanel:sendOffline',
          title: 'Offline send failed',
          fallbackMessage: 'Check pixel and offline event setup in Events Manager.',
        })
      })
      .finally(() => setSendingOffline(false))
  }, [buildEventPayload, clientId, pixelId, sendOfflineEvents, testEventCode, workspaceId])

  const handlePresetBatch = useCallback(() => {
    if (!adAccountId?.trim()) return
    const account = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
    setBatchJson(
      JSON.stringify(
        [
          { method: 'GET', relativeUrl: `${account}/campaigns?fields=id,name,status&limit=5`, name: 'campaigns' },
          { method: 'GET', relativeUrl: `${account}/adsets?fields=id,name,status&limit=5`, name: 'adsets' },
        ],
        null,
        2,
      ),
    )
  }, [adAccountId])

  const handleRunBatch = useCallback(() => {
    let requests: Array<{ method: 'GET' | 'POST' | 'DELETE'; relativeUrl: string; body?: string; name?: string }>
    try {
      const parsed = JSON.parse(batchJson) as unknown
      if (!Array.isArray(parsed)) throw new Error('Batch payload must be a JSON array')
      requests = parsed as typeof requests
    } catch {
      toast({
        title: 'Invalid batch JSON',
        description: 'Provide an array of { method, relativeUrl, body?, name? }.',
        variant: 'destructive',
      })
      return
    }

    setRunningBatch(true)
    setBatchResult('')
    void executeBatch({ workspaceId, clientId: clientId ?? null, requests })
      .then((result) => {
        setBatchResult(JSON.stringify(result, null, 2))
        toast({
          title: result.success ? 'Batch completed' : 'Batch finished with errors',
          description: `${result.responses.length} response(s) returned.`,
          variant: result.success ? 'default' : 'destructive',
        })
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaEventsToolsPanel:executeBatch',
          title: 'Batch failed',
          fallbackMessage: 'Could not run Meta batch request.',
        })
      })
      .finally(() => setRunningBatch(false))
  }, [batchJson, clientId, executeBatch, workspaceId])

  if (!hasMetaEventsTools(visibility) || eventTabs.length === 0) {
    return null
  }

  const panelTitle =
    visibility.showCapi && visibility.showOfflineEvents
      ? 'Conversions API, offline events & batch'
      : visibility.showCapi
        ? 'Conversions API'
        : visibility.showOfflineEvents
          ? 'Offline events'
          : 'Batch API'

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border/60 p-3">
      <p className="text-xs font-medium text-foreground">{panelTitle}</p>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          {visibility.showCapi ? (
            <TabsTrigger value="capi" className="text-xs">
              CAPI
            </TabsTrigger>
          ) : null}
          {visibility.showOfflineEvents ? (
            <TabsTrigger value="offline" className="text-xs">
              Offline
            </TabsTrigger>
          ) : null}
          {visibility.showBatchApi ? (
            <TabsTrigger value="batch" className="text-xs">
              Batch
            </TabsTrigger>
          ) : null}
        </TabsList>

        {visibility.showCapi ? (
        <MotionTabsContent activeTab={activeTab} tabValue="capi" className="mt-3 space-y-2">
          <PixelFields
            pixelId={pixelId}
            pixels={pixels}
            onPixelIdChange={setPixelId}
          />
          <EventFields
            eventName={eventName}
            actionSource={actionSource}
            email={email}
            value={value}
            currency={currency}
            orderId={orderId}
            testEventCode={testEventCode}
            onEventNameChange={setEventName}
            onActionSourceChange={setActionSource}
            onEmailChange={setEmail}
            onValueChange={setValue}
            onCurrencyChange={setCurrency}
            onOrderIdChange={setOrderId}
            onTestEventCodeChange={setTestEventCode}
            showActionSource
          />
          <Button type="button" size="sm" disabled={sendingCapi} onClick={handleSendCapi}>
            {sendingCapi ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : <Send className="mr-2 size-4" aria-hidden />}
            Send CAPI event
          </Button>
        </MotionTabsContent>
        ) : null}

        {visibility.showOfflineEvents ? (
        <MotionTabsContent activeTab={activeTab} tabValue="offline" className="mt-3 space-y-2">
          <PixelFields pixelId={pixelId} pixels={pixels} onPixelIdChange={setPixelId} />
          <EventFields
            eventName={eventName}
            actionSource={META_OFFLINE_ACTION_SOURCE}
            email={email}
            value={value}
            currency={currency}
            orderId={orderId}
            testEventCode={testEventCode}
            onEventNameChange={setEventName}
            onActionSourceChange={setActionSource}
            onEmailChange={setEmail}
            onValueChange={setValue}
            onCurrencyChange={setCurrency}
            onOrderIdChange={setOrderId}
            onTestEventCodeChange={setTestEventCode}
            showActionSource={false}
          />
          <p className="text-[11px] text-muted-foreground">
            Sends with <code className="text-[10px]">action_source: physical_store</code> for in-store or CRM offline conversions.
          </p>
          <Button type="button" size="sm" disabled={sendingOffline} onClick={handleSendOffline}>
            {sendingOffline ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : <Send className="mr-2 size-4" aria-hidden />}
            Send offline event
          </Button>
        </MotionTabsContent>
        ) : null}

        {visibility.showBatchApi ? (
        <MotionTabsContent activeTab={activeTab} tabValue="batch" className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={!adAccountId} onClick={handlePresetBatch}>
              <Zap className="mr-1.5 size-3.5" aria-hidden />
              Sample: list campaigns + ad sets
            </Button>
          </div>
          <Textarea
            value={batchJson}
            onChange={(event) => setBatchJson(event.target.value)}
            rows={6}
            className="font-mono text-xs"
            placeholder={'[\n  { "method": "GET", "relativeUrl": "act_123/campaigns?fields=id,name" }\n]'}
          />
          <Button type="button" size="sm" disabled={runningBatch || !batchJson.trim()} onClick={handleRunBatch}>
            {runningBatch ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
            Run batch (max 50)
          </Button>
          {batchResult ? (
            <pre className="max-h-32 overflow-auto rounded-md bg-muted/30 p-2 text-[10px] text-muted-foreground">
              {batchResult}
            </pre>
          ) : null}
        </MotionTabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}

function PixelFields({
  pixelId,
  pixels,
  onPixelIdChange,
}: {
  pixelId: string
  pixels: { rows: PixelRow[]; loading: boolean }
  onPixelIdChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Pixel</Label>
      {pixels.loading ? (
        <p className="text-xs text-muted-foreground">Loading pixels…</p>
      ) : pixels.rows.length > 0 ? (
        <Select value={pixelId || undefined} onValueChange={onPixelIdChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select pixel" />
          </SelectTrigger>
          <SelectContent>
            {pixels.rows.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      <Input
        value={pixelId}
        onChange={(event) => onPixelIdChange(event.target.value)}
        placeholder="Pixel ID"
        className="h-9"
      />
    </div>
  )
}

function EventFields({
  eventName,
  actionSource,
  email,
  value,
  currency,
  orderId,
  testEventCode,
  onEventNameChange,
  onActionSourceChange,
  onEmailChange,
  onValueChange,
  onCurrencyChange,
  onOrderIdChange,
  onTestEventCodeChange,
  showActionSource,
}: {
  eventName: string
  actionSource: string
  email: string
  value: string
  currency: string
  orderId: string
  testEventCode: string
  onEventNameChange: (value: string) => void
  onActionSourceChange: (value: string) => void
  onEmailChange: (value: string) => void
  onValueChange: (value: string) => void
  onCurrencyChange: (value: string) => void
  onOrderIdChange: (value: string) => void
  onTestEventCodeChange: (value: string) => void
  showActionSource: boolean
}) {
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Event</Label>
          <Select value={eventName} onValueChange={onEventNameChange}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {META_CAPI_STANDARD_EVENTS.map((event) => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showActionSource ? (
          <div className="space-y-1">
            <Label className="text-xs">Action source</Label>
            <Select value={actionSource} onValueChange={onActionSourceChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {META_CAPI_ACTION_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Email (hashed server-side)</Label>
          <Input value={email} onChange={(event) => onEmailChange(event.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Order ID</Label>
          <Input value={orderId} onChange={(event) => onOrderIdChange(event.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Value</Label>
          <Input value={value} onChange={(event) => onValueChange(event.target.value)} className="h-9" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Currency</Label>
          <Input value={currency} onChange={(event) => onCurrencyChange(event.target.value)} className="h-9" />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Test event code (optional)</Label>
        <Input
          value={testEventCode}
          onChange={(event) => onTestEventCodeChange(event.target.value)}
          placeholder="From Events Manager → Test events"
          className="h-9"
        />
      </div>
    </>
  )
}
