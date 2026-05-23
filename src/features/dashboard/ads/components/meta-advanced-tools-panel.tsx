'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { ExternalLink, Loader2, Search } from 'lucide-react'

import { adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { META_AD_ACCOUNT_WEBHOOK_FIELDS } from '@/lib/meta-webhook-fields'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
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
import { toast } from '@/shared/ui/use-toast'
import {
  hasMetaAdvancedTools,
  resolveMetaCampaignUiVisibility,
} from '@/lib/meta-campaign-ui'

type PixelRow = { id: string; name: string }

type MetaAdvancedToolsPanelProps = {
  workspaceId: string
  clientId?: string | null
  campaignObjective?: string | null
  scope?: 'campaign' | 'account'
}

export function MetaAdvancedToolsPanel({
  workspaceId,
  clientId,
  campaignObjective,
  scope,
}: MetaAdvancedToolsPanelProps) {
  const visibility = useMemo(
    () => resolveMetaCampaignUiVisibility({ campaignObjective, scope }),
    [campaignObjective, scope],
  )

  const advancedTabs = useMemo(() => {
    const tabs: Array<'pixel' | 'business' | 'adlibrary' | 'webhooks'> = []
    if (visibility.showPixelInsights) tabs.push('pixel')
    if (visibility.showBusinessManager) tabs.push('business')
    if (visibility.showAdLibrary) tabs.push('adlibrary')
    if (visibility.showWebhooks) tabs.push('webhooks')
    return tabs
  }, [visibility])

  const [activeTab, setActiveTab] = useState('pixel')
  const listAdPixels = useAction(adsMetaToolsApi.listAdPixels)
  const getPixelStats = useAction(adsMetaToolsApi.getPixelStats)
  const getPixelDetails = useAction(adsMetaToolsApi.getPixelDetails)
  const listBusinesses = useAction(adsMetaToolsApi.listBusinesses)
  const listBusinessAdAccounts = useAction(adsMetaToolsApi.listBusinessAdAccounts)
  const searchAdLibrary = useAction(adsMetaToolsApi.searchAdLibrary)
  const listAdAccountWebhooks = useAction(adsMetaToolsApi.listAdAccountWebhooks)
  const updateAdAccountWebhooks = useAction(adsMetaToolsApi.updateAdAccountWebhooks)
  const clearAdAccountWebhooks = useAction(adsMetaToolsApi.clearAdAccountWebhooks)

  const [pixels, dispatchPixels] = useReducer(
    (_: { rows: PixelRow[]; loading: boolean }, value: { rows: PixelRow[]; loading: boolean }) => value,
    { rows: [], loading: false },
  )
  const [pixelId, setPixelId] = useState('')
  const [pixelDetails, setPixelDetails] = useState<string>('')
  const [pixelStats, setPixelStats] = useState<string>('')
  const [loadingPixel, setLoadingPixel] = useState(false)

  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string }>>([])
  const [businessId, setBusinessId] = useState('')
  const [businessAccounts, setBusinessAccounts] = useState<string>('')
  const [loadingBusiness, setLoadingBusiness] = useState(false)

  const [adLibraryQuery, setAdLibraryQuery] = useState('')
  const [adLibraryCountry, setAdLibraryCountry] = useState('US')
  const [adLibraryRows, setAdLibraryRows] = useState<
    Array<{
      id: string
      pageName?: string
      adSnapshotUrl?: string
      adCreativeBodies?: string[]
    }>
  >([])
  const [loadingAdLibrary, setLoadingAdLibrary] = useState(false)

  const [webhookFields, setWebhookFields] = useState<Set<string>>(new Set())
  const [loadingWebhooks, setLoadingWebhooks] = useState(false)
  const [savingWebhooks, setSavingWebhooks] = useState(false)

  useEffect(() => {
    if (advancedTabs.length > 0 && !advancedTabs.includes(activeTab as 'pixel' | 'business' | 'adlibrary' | 'webhooks')) {
      setActiveTab(advancedTabs[0]!)
    }
  }, [activeTab, advancedTabs])

  useEffect(() => {
    if (!visibility.showPixelInsights) {
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
        const only = mapped.length === 1 ? mapped[0] : undefined
        if (only) setPixelId(only.id)
      })
      .catch(() => {
        if (!cancelled) dispatchPixels({ rows: [], loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [clientId, listAdPixels, visibility.showPixelInsights, workspaceId])

  const handleLoadPixelInsights = useCallback(() => {
    if (!pixelId.trim()) return
    setLoadingPixel(true)
    setPixelDetails('')
    setPixelStats('')
    void Promise.all([
      getPixelDetails({ workspaceId, clientId: clientId ?? null, pixelId: pixelId.trim() }),
      getPixelStats({ workspaceId, clientId: clientId ?? null, pixelId: pixelId.trim(), days: 7 }),
    ])
      .then(([details, stats]) => {
        setPixelDetails(details ? JSON.stringify(details, null, 2) : 'No pixel details returned.')
        setPixelStats(
          Array.isArray(stats) && stats.length > 0
            ? JSON.stringify(stats, null, 2)
            : 'No stats for the last 7 days.',
        )
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:pixelInsights',
          title: 'Could not load pixel data',
          fallbackMessage: 'Check pixel permissions.',
        })
      })
      .finally(() => setLoadingPixel(false))
  }, [clientId, getPixelDetails, getPixelStats, pixelId, workspaceId])

  const handleLoadBusinesses = useCallback(() => {
    setLoadingBusiness(true)
    void listBusinesses({ workspaceId, clientId: clientId ?? null })
      .then((rows) => {
        setBusinesses(Array.isArray(rows) ? rows : [])
        const first = rows?.[0]
        if (first && typeof first === 'object' && 'id' in first) {
          setBusinessId(String(first.id))
        }
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:listBusinesses',
          title: 'Could not load businesses',
          fallbackMessage: 'Requires business_management permission.',
        })
      })
      .finally(() => setLoadingBusiness(false))
  }, [clientId, listBusinesses, workspaceId])

  const handleLoadBusinessAccounts = useCallback(() => {
    if (!businessId) return
    setLoadingBusiness(true)
    void listBusinessAdAccounts({
      workspaceId,
      clientId: clientId ?? null,
      businessId,
    })
      .then((rows) => {
        setBusinessAccounts(JSON.stringify(rows, null, 2))
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:listBusinessAdAccounts',
          title: 'Could not load ad accounts',
          fallbackMessage: 'Check Business Manager access.',
        })
      })
      .finally(() => setLoadingBusiness(false))
  }, [businessId, clientId, listBusinessAdAccounts, workspaceId])

  const handleSearchAdLibrary = useCallback(() => {
    if (!adLibraryQuery.trim()) return
    setLoadingAdLibrary(true)
    void searchAdLibrary({
      workspaceId,
      clientId: clientId ?? null,
      searchTerms: adLibraryQuery.trim(),
      adReachedCountries: [adLibraryCountry],
      limit: 15,
    })
      .then((rows) => {
        setAdLibraryRows(Array.isArray(rows) ? rows : [])
        toast({
          title: 'Ad Library search complete',
          description: `Found ${Array.isArray(rows) ? rows.length : 0} ads.`,
        })
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:searchAdLibrary',
          title: 'Ad Library search failed',
          fallbackMessage: 'Requires Ad Library API access on your Meta app.',
        })
      })
      .finally(() => setLoadingAdLibrary(false))
  }, [adLibraryCountry, adLibraryQuery, clientId, searchAdLibrary, workspaceId])

  const handleLoadWebhooks = useCallback(() => {
    setLoadingWebhooks(true)
    void listAdAccountWebhooks({ workspaceId, clientId: clientId ?? null })
      .then((result) => {
        const fields = Array.isArray(result?.subscribedFields) ? result.subscribedFields : []
        setWebhookFields(new Set(fields.map(String)))
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:listWebhooks',
          title: 'Could not load webhooks',
          fallbackMessage: 'Check ad account permissions.',
        })
      })
      .finally(() => setLoadingWebhooks(false))
  }, [clientId, listAdAccountWebhooks, workspaceId])

  const handleToggleWebhookField = useCallback((field: string) => {
    setWebhookFields((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }, [])

  const handleSaveWebhooks = useCallback(() => {
    setSavingWebhooks(true)
    void updateAdAccountWebhooks({
      workspaceId,
      clientId: clientId ?? null,
      subscribedFields: [...webhookFields],
    })
      .then(() => {
        toast({ title: 'Webhook subscriptions updated' })
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:updateWebhooks',
          title: 'Could not update webhooks',
          fallbackMessage: 'Ensure your Meta app is subscribed at the app level first.',
        })
      })
      .finally(() => setSavingWebhooks(false))
  }, [clientId, updateAdAccountWebhooks, webhookFields, workspaceId])

  const handleClearWebhooks = useCallback(() => {
    setSavingWebhooks(true)
    void clearAdAccountWebhooks({ workspaceId, clientId: clientId ?? null })
      .then(() => {
        setWebhookFields(new Set())
        toast({ title: 'Webhook subscriptions cleared' })
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAdvancedToolsPanel:clearWebhooks',
          title: 'Could not clear webhooks',
        })
      })
      .finally(() => setSavingWebhooks(false))
  }, [clearAdAccountWebhooks, clientId, workspaceId])

  if (!hasMetaAdvancedTools(visibility) || advancedTabs.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-border/60 p-3">
      <p className="text-xs font-medium text-foreground">
        {visibility.showPixelInsights && visibility.showAdLibrary
          ? 'Pixel stats, Business Manager, Ad Library & webhooks'
          : visibility.showPixelInsights
            ? 'Pixel stats, Business Manager & webhooks'
            : visibility.showAdLibrary
              ? 'Ad Library, Business Manager & webhooks'
              : 'Business Manager & webhooks'}
      </p>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8 flex-wrap">
          {visibility.showPixelInsights ? (
            <TabsTrigger value="pixel" className="text-xs">
              Pixel
            </TabsTrigger>
          ) : null}
          {visibility.showBusinessManager ? (
            <TabsTrigger value="business" className="text-xs">
              Business
            </TabsTrigger>
          ) : null}
          {visibility.showAdLibrary ? (
            <TabsTrigger value="adlibrary" className="text-xs">
              Ad Library
            </TabsTrigger>
          ) : null}
          {visibility.showWebhooks ? (
            <TabsTrigger value="webhooks" className="text-xs">
              Webhooks
            </TabsTrigger>
          ) : null}
        </TabsList>

        {visibility.showPixelInsights ? (
        <MotionTabsContent activeTab={activeTab} tabValue="pixel" className="mt-3 space-y-2">
          <PixelSelect pixels={pixels} pixelId={pixelId} onPixelIdChange={setPixelId} />
          <Button type="button" size="sm" disabled={loadingPixel || !pixelId} onClick={handleLoadPixelInsights}>
            {loadingPixel ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
            Load details &amp; 7-day stats
          </Button>
          {pixelDetails ? (
            <pre className="max-h-28 overflow-auto rounded-md bg-muted/30 p-2 text-[10px]">{pixelDetails}</pre>
          ) : null}
          {pixelStats ? (
            <pre className="max-h-28 overflow-auto rounded-md bg-muted/30 p-2 text-[10px]">{pixelStats}</pre>
          ) : null}
        </MotionTabsContent>
        ) : null}

        {visibility.showBusinessManager ? (
        <MotionTabsContent activeTab={activeTab} tabValue="business" className="mt-3 space-y-2">
          <Button type="button" size="sm" variant="outline" disabled={loadingBusiness} onClick={handleLoadBusinesses}>
            {loadingBusiness ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
            Load businesses
          </Button>
          {businesses.length > 0 ? (
            <Select value={businessId} onValueChange={setBusinessId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select business" />
              </SelectTrigger>
              <SelectContent>
                {businesses.map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={loadingBusiness || !businessId}
            onClick={handleLoadBusinessAccounts}
          >
            List ad accounts
          </Button>
          {businessAccounts ? (
            <pre className="max-h-36 overflow-auto rounded-md bg-muted/30 p-2 text-[10px]">{businessAccounts}</pre>
          ) : null}
        </MotionTabsContent>
        ) : null}

        {visibility.showAdLibrary ? (
        <MotionTabsContent activeTab={activeTab} tabValue="adlibrary" className="mt-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Requires Ad Library API permission on your Meta app. Results are public ads only.
          </p>
          <div className="grid gap-2 sm:grid-cols-[1fr_5rem]">
            <Input
              value={adLibraryQuery}
              onChange={(event) => setAdLibraryQuery(event.target.value)}
              placeholder="Search terms"
              className="h-9"
            />
            <Input
              value={adLibraryCountry}
              onChange={(event) => setAdLibraryCountry(event.target.value.toUpperCase())}
              placeholder="US"
              className="h-9"
            />
          </div>
          <Button type="button" size="sm" disabled={loadingAdLibrary} onClick={handleSearchAdLibrary}>
            {loadingAdLibrary ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : (
              <Search className="mr-2 size-4" aria-hidden />
            )}
            Search Ad Library
          </Button>
          {adLibraryRows.length > 0 ? (
            <ul className="max-h-40 space-y-2 overflow-auto">
              {adLibraryRows.map((ad) => (
                <li key={ad.id} className="rounded-md border border-border/50 p-2 text-xs">
                  <p className="font-medium">{ad.pageName ?? ad.id}</p>
                  {ad.adCreativeBodies?.[0] ? (
                    <p className="line-clamp-2 text-muted-foreground">{ad.adCreativeBodies[0]}</p>
                  ) : null}
                  {ad.adSnapshotUrl ? (
                    <a
                      href={ad.adSnapshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-primary"
                    >
                      View snapshot <ExternalLink className="size-3" aria-hidden />
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </MotionTabsContent>
        ) : null}

        {visibility.showWebhooks ? (
        <MotionTabsContent activeTab={activeTab} tabValue="webhooks" className="mt-3 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Subscribes the linked Meta app to ad account change notifications. Configure your app callback URL in Meta
            Developer settings.
          </p>
          <Button type="button" size="sm" variant="outline" disabled={loadingWebhooks} onClick={handleLoadWebhooks}>
            {loadingWebhooks ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
            Load current subscriptions
          </Button>
          <div className="flex flex-wrap gap-2">
            {META_AD_ACCOUNT_WEBHOOK_FIELDS.map((field) => (
              <label key={field} className="flex items-center gap-1.5 text-xs">
                <Checkbox
                  checked={webhookFields.has(field)}
                  onChange={() => handleToggleWebhookField(field)}
                />
                <Badge variant="outline" className="text-[10px] capitalize">
                  {field}
                </Badge>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={savingWebhooks} onClick={handleSaveWebhooks}>
              Save subscriptions
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={savingWebhooks} onClick={handleClearWebhooks}>
              Clear all
            </Button>
          </div>
        </MotionTabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}

function PixelSelect({
  pixels,
  pixelId,
  onPixelIdChange,
}: {
  pixels: { rows: PixelRow[]; loading: boolean }
  pixelId: string
  onPixelIdChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Pixel</Label>
      {pixels.loading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
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
      <Input value={pixelId} onChange={(event) => onPixelIdChange(event.target.value)} className="h-9" />
    </div>
  )
}
