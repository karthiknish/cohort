'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { Loader2, Send, Server, Store, Zap } from 'lucide-react'

import { adsMetaEventsApi, adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import {
  META_CAPI_ACTION_SOURCES,
  META_CAPI_STANDARD_EVENTS,
  META_OFFLINE_ACTION_SOURCE,
} from '@/lib/meta-capi-events'
import {
  hasMetaEventsTools,
  resolveMetaCampaignUiVisibility,
} from '@/lib/meta-campaign-ui'
import { Alert, AlertDescription } from '@/shared/ui/alert'
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
  MetaJsonResultBlock,
  MetaPixelPicker,
  MetaToolsActionBar,
  MetaToolsFormSection,
  MetaToolsPanelShell,
  type MetaPixelRow,
} from './meta-tools-ui'

type MetaEventsToolsPanelProps = {
  workspaceId: string
  clientId?: string | null
  adAccountId?: string | null
  campaignObjective?: string | null
  /** Account-level surfaces hide CAPI/offline without a campaign objective. */
  scope?: 'campaign' | 'account'
}

function defaultEventsTab(tabs: Array<'capi' | 'offline' | 'batch'>): string {
  if (tabs.includes('capi')) return 'capi'
  if (tabs.includes('offline')) return 'offline'
  return tabs[0] ?? 'batch'
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

  const [activeTab, setActiveTab] = useState(() => defaultEventsTab(eventTabs))

  const listAdPixels = useAction(adsMetaToolsApi.listAdPixels)
  const sendCapiEvents = useAction(adsMetaEventsApi.sendCapiEvents)
  const sendOfflineEvents = useAction(adsMetaEventsApi.sendOfflineEvents)
  const executeBatch = useAction(adsMetaEventsApi.executeBatch)

  const [pixels, dispatchPixels] = useReducer(
    (_: { rows: MetaPixelRow[]; loading: boolean }, value: { rows: MetaPixelRow[]; loading: boolean }) =>
      value,
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
      setActiveTab(defaultEventsTab(eventTabs))
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

  const handleBatchJsonChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBatchJson(event.target.value)
  }, [])

  if (!hasMetaEventsTools(visibility) || eventTabs.length === 0) {
    return null
  }

  const shellDescription =
    visibility.showCapi && visibility.showOfflineEvents
      ? 'Send server-side conversion and offline store events, or run Graph API batch requests for debugging.'
      : visibility.showCapi
        ? 'Send server-side conversion events to Meta without relying on the browser pixel.'
        : visibility.showOfflineEvents
          ? 'Upload in-store or CRM conversions with a physical-store action source.'
          : 'Run grouped Graph API requests in a single call (max 50).'

  return (
    <MetaToolsPanelShell
      icon={Server}
      title="Conversions API & events"
      description={shellDescription}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-9 w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          {visibility.showCapi ? (
            <TabsTrigger value="capi" className="gap-1.5 text-xs sm:text-sm">
              <Send className="size-3.5 shrink-0" aria-hidden />
              Conversions API
            </TabsTrigger>
          ) : null}
          {visibility.showOfflineEvents ? (
            <TabsTrigger value="offline" className="gap-1.5 text-xs sm:text-sm">
              <Store className="size-3.5 shrink-0" aria-hidden />
              Offline
            </TabsTrigger>
          ) : null}
          {visibility.showBatchApi ? (
            <TabsTrigger value="batch" className="gap-1.5 text-xs sm:text-sm">
              <Zap className="size-3.5 shrink-0" aria-hidden />
              Batch API
            </TabsTrigger>
          ) : null}
        </TabsList>

        {visibility.showCapi ? (
          <MotionTabsContent activeTab={activeTab} tabValue="capi" className="mt-4 space-y-5">
            <MetaToolsFormSection
              title="Pixel"
              description="Events are attributed to this pixel in Events Manager."
            >
              <MetaPixelPicker pixelId={pixelId} pixels={pixels} onPixelIdChange={setPixelId} />
            </MetaToolsFormSection>

            <MetaToolsFormSection title="Event" description="Standard event name and where the conversion happened.">
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
            </MetaToolsFormSection>

            <MetaToolsActionBar>
              <Button type="button" disabled={sendingCapi || !pixelId.trim()} onClick={handleSendCapi}>
                {sendingCapi ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="mr-2 size-4" aria-hidden />
                )}
                Send test event
              </Button>
              <p className="text-xs text-muted-foreground">
                PII is hashed server-side before it reaches Meta.
              </p>
            </MetaToolsActionBar>
          </MotionTabsContent>
        ) : null}

        {visibility.showOfflineEvents ? (
          <MotionTabsContent activeTab={activeTab} tabValue="offline" className="mt-4 space-y-5">
            <MetaToolsFormSection
              title="Pixel"
              description="Offline uploads use the same pixel dataset as your web events."
            >
              <MetaPixelPicker pixelId={pixelId} pixels={pixels} onPixelIdChange={setPixelId} />
            </MetaToolsFormSection>

            <MetaToolsFormSection
              title="Store event"
              description="Sent with action_source physical_store for in-store or CRM conversions."
            >
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
            </MetaToolsFormSection>

            <MetaToolsActionBar>
              <Button type="button" disabled={sendingOffline || !pixelId.trim()} onClick={handleSendOffline}>
                {sendingOffline ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <Store className="mr-2 size-4" aria-hidden />
                )}
                Send offline event
              </Button>
            </MetaToolsActionBar>
          </MotionTabsContent>
        ) : null}

        {visibility.showBatchApi ? (
          <MotionTabsContent activeTab={activeTab} tabValue="batch" className="mt-4 space-y-5">
            <MetaToolsFormSection
              title="Batch payload"
              description="Array of { method, relativeUrl, body?, name? } objects. Useful for quick Graph API probes."
            >
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!adAccountId}
                  onClick={handlePresetBatch}
                >
                  <Zap className="mr-1.5 size-3.5" aria-hidden />
                  Load sample (campaigns + ad sets)
                </Button>
              </div>
              <Textarea
                value={batchJson}
                onChange={handleBatchJsonChange}
                rows={8}
                className="font-mono text-xs leading-relaxed"
                placeholder={'[\n  { "method": "GET", "relativeUrl": "act_123/campaigns?fields=id,name" }\n]'}
                spellCheck={false}
              />
            </MetaToolsFormSection>

            <MetaToolsActionBar>
              <Button
                type="button"
                disabled={runningBatch || !batchJson.trim()}
                onClick={handleRunBatch}
              >
                {runningBatch ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
                Run batch (max 50)
              </Button>
            </MetaToolsActionBar>

            {batchResult ? (
              <MetaJsonResultBlock title="Response" content={batchResult} />
            ) : null}
          </MotionTabsContent>
        ) : null}
      </Tabs>
    </MetaToolsPanelShell>
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
  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onEmailChange(event.target.value),
    [onEmailChange],
  )

  const handleOrderIdChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onOrderIdChange(event.target.value),
    [onOrderIdChange],
  )

  const handleValueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onValueChange(event.target.value),
    [onValueChange],
  )

  const handleCurrencyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onCurrencyChange(event.target.value),
    [onCurrencyChange],
  )

  const handleTestEventCodeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onTestEventCodeChange(event.target.value),
    [onTestEventCodeChange],
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Event name</Label>
          <Select value={eventName} onValueChange={onEventNameChange}>
            <SelectTrigger className="h-10">
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Action source</Label>
            <Select value={actionSource} onValueChange={onActionSourceChange}>
              <SelectTrigger className="h-10">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Email</Label>
          <Input
            value={email}
            onChange={handleEmailChange}
            placeholder="customer@example.com"
            className="h-10"
            autoComplete="off"
          />
          <p className="text-[11px] text-muted-foreground">Hashed on the server before send.</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Order ID</Label>
          <Input
            value={orderId}
            onChange={handleOrderIdChange}
            placeholder="Optional deduplication key"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Value</Label>
          <Input
            value={value}
            onChange={handleValueChange}
            placeholder="0.00"
            inputMode="decimal"
            className="h-10 tabular-nums"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Currency</Label>
          <Input
            value={currency}
            onChange={handleCurrencyChange}
            placeholder="USD"
            className="h-10 uppercase"
            maxLength={3}
          />
        </div>
      </div>

      <Alert className="border-info/20 bg-info/5">
        <AlertDescription className="space-y-2 text-xs leading-relaxed">
          <p className="font-medium text-foreground">Test in Events Manager</p>
          <p className="text-muted-foreground">
            Open Test events, copy your test code, and paste it below. Events with a test code appear in the
            debugger without affecting production reporting.
          </p>
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="meta-test-event-code" className="text-xs text-muted-foreground">
              Test event code (optional)
            </Label>
            <Input
              id="meta-test-event-code"
              value={testEventCode}
              onChange={handleTestEventCodeChange}
              placeholder="TEST12345"
              className="h-10 font-mono text-sm"
            />
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
