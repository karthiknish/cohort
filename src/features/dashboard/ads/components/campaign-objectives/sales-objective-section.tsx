'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useReducer } from 'react'
import { AlertCircle, Loader2, ShoppingBag, TrendingUp } from 'lucide-react'

import { adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { CONVERSION_EVENTS } from './types'
import type { ObjectiveComponentProps } from './types'

type PixelRow = { id: string; name: string }
type CatalogRow = { id: string; name: string; productCount?: number }
type ProductSetRow = { id: string; name: string; productCount?: number }

type PixelPickerState = { pixels: PixelRow[]; loading: boolean }
type CatalogPickerState = { catalogs: CatalogRow[]; loading: boolean }
type ProductSetPickerState = { sets: ProductSetRow[]; loading: boolean }

export function SalesObjectiveSection({ formData, onChange, disabled, metaContext }: ObjectiveComponentProps) {
  const salesMode = formData.salesOptimizationMode ?? 'pixel'

  const [pixelState, dispatchPixels] = useReducer(
    (_: PixelPickerState, value: PixelPickerState) => value,
    { pixels: [], loading: false },
  )
  const [catalogState, dispatchCatalogs] = useReducer(
    (_: CatalogPickerState, value: CatalogPickerState) => value,
    { catalogs: [], loading: false },
  )
  const [setState, dispatchSets] = useReducer(
    (_: ProductSetPickerState, value: ProductSetPickerState) => value,
    { sets: [], loading: false },
  )

  const listAdPixels = useAction(adsMetaToolsApi.listAdPixels)
  const listProductCatalogs = useAction(adsMetaToolsApi.listProductCatalogs)
  const listProductSets = useAction(adsMetaToolsApi.listProductSets)
  const canLoadMeta = Boolean(metaContext?.workspaceId)

  useEffect(() => {
    if (!canLoadMeta || !metaContext?.workspaceId) {
      dispatchPixels({ pixels: [], loading: false })
      return
    }

    let cancelled = false
    dispatchPixels({ pixels: [], loading: true })

    void listAdPixels({
      workspaceId: metaContext.workspaceId,
      clientId: metaContext.clientId ?? null,
    })
      .then((rows) => {
        if (cancelled) return
        dispatchPixels({
          pixels: Array.isArray(rows)
            ? rows.map((row) => ({ id: String(row.id), name: String(row.name) }))
            : [],
          loading: false,
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'SalesObjectiveSection:listAdPixels',
          title: 'Could not load pixels',
          fallbackMessage: 'Could not load pixels',
        })
        dispatchPixels({ pixels: [], loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [canLoadMeta, listAdPixels, metaContext?.clientId, metaContext?.workspaceId])

  useEffect(() => {
    if (!canLoadMeta || !metaContext?.workspaceId || salesMode !== 'catalog') {
      dispatchCatalogs({ catalogs: [], loading: false })
      return
    }

    let cancelled = false
    dispatchCatalogs({ catalogs: [], loading: true })

    void listProductCatalogs({
      workspaceId: metaContext.workspaceId,
      clientId: metaContext.clientId ?? null,
    })
      .then((rows) => {
        if (cancelled) return
        dispatchCatalogs({
          catalogs: Array.isArray(rows)
            ? rows.map((row) => ({
                id: String(row.id),
                name: String(row.name),
                productCount:
                  typeof row.productCount === 'number' ? row.productCount : undefined,
              }))
            : [],
          loading: false,
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'SalesObjectiveSection:listProductCatalogs',
          title: 'Could not load catalogs',
          fallbackMessage: 'Could not load product catalogs',
        })
        dispatchCatalogs({ catalogs: [], loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [canLoadMeta, listProductCatalogs, metaContext?.clientId, metaContext?.workspaceId, salesMode])

  useEffect(() => {
    if (!canLoadMeta || !metaContext?.workspaceId || salesMode !== 'catalog' || !formData.productCatalogId) {
      dispatchSets({ sets: [], loading: false })
      return
    }

    let cancelled = false
    dispatchSets({ sets: [], loading: true })

    void listProductSets({
      workspaceId: metaContext.workspaceId,
      clientId: metaContext.clientId ?? null,
      catalogId: formData.productCatalogId,
    })
      .then((rows) => {
        if (cancelled) return
        dispatchSets({
          sets: Array.isArray(rows)
            ? rows.map((row) => ({
                id: String(row.id),
                name: String(row.name),
                productCount:
                  typeof row.productCount === 'number' ? row.productCount : undefined,
              }))
            : [],
          loading: false,
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'SalesObjectiveSection:listProductSets',
          title: 'Could not load product sets',
          fallbackMessage: 'Could not load product sets',
        })
        dispatchSets({ sets: [], loading: false })
      })

    return () => {
      cancelled = true
    }
  }, [
    canLoadMeta,
    formData.productCatalogId,
    listProductSets,
    metaContext?.clientId,
    metaContext?.workspaceId,
    salesMode,
  ])

  const handleSalesModeChange = useCallback(
    (value: string) => {
      const mode = value === 'catalog' ? 'catalog' : 'pixel'
      onChange({
        salesOptimizationMode: mode,
        productCatalogId: mode === 'catalog' ? formData.productCatalogId : undefined,
        productSetId: mode === 'catalog' ? formData.productSetId : undefined,
        pixelId: mode === 'pixel' ? formData.pixelId : undefined,
        conversionEvent: mode === 'pixel' ? formData.conversionEvent : undefined,
      })
    },
    [formData.conversionEvent, formData.pixelId, formData.productCatalogId, formData.productSetId, onChange],
  )

  const handleConversionEventChange = useCallback(
    (value: string) => onChange({ conversionEvent: value }),
    [onChange],
  )

  const handlePixelChange = useCallback(
    (value: string) => onChange({ pixelId: value }),
    [onChange],
  )

  const handleManualPixelChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange({ pixelId: event.target.value }),
    [onChange],
  )

  const handleCatalogChange = useCallback(
    (value: string) => onChange({ productCatalogId: value, productSetId: undefined }),
    [onChange],
  )

  const handleProductSetChange = useCallback(
    (value: string) => onChange({ productSetId: value === '__all__' ? undefined : value }),
    [onChange],
  )

  const handleManualCatalogChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ productCatalogId: event.target.value, productSetId: undefined }),
    [onChange],
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-success" />
            Sales optimization
          </CardTitle>
          <CardDescription>
            Optimize for website conversions (pixel) or dynamic product ads from a catalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sales-optimization-mode">Optimization type</Label>
            <Select
              value={salesMode}
              onValueChange={handleSalesModeChange}
              disabled={disabled}
            >
              <SelectTrigger id="sales-optimization-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pixel">Website conversions (pixel)</SelectItem>
                <SelectItem value="catalog">Product catalog (DPA)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {salesMode === 'pixel' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="conversion-event">Optimization event</Label>
                <Select
                  value={formData.conversionEvent}
                  onValueChange={handleConversionEventChange}
                  disabled={disabled}
                >
                  <SelectTrigger id="conversion-event">
                    <SelectValue placeholder="Select conversion event" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONVERSION_EVENTS.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        <div className="flex flex-col items-start">
                          <span>{event.label}</span>
                          <span className="text-xs text-muted-foreground">{event.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixel-id">Facebook Pixel</Label>
                {canLoadMeta ? (
                  pixelState.loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Loading pixels…
                    </div>
                  ) : pixelState.pixels.length > 0 ? (
                    <Select value={formData.pixelId || undefined} onValueChange={handlePixelChange} disabled={disabled}>
                      <SelectTrigger id="pixel-id">
                        <SelectValue placeholder="Select a pixel" />
                      </SelectTrigger>
                      <SelectContent>
                        {pixelState.pixels.map((pixel) => (
                          <SelectItem key={pixel.id} value={pixel.id}>
                            {pixel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null
                ) : null}
                <Input
                  id="pixel-id-manual"
                  placeholder="Or enter pixel ID manually"
                  value={formData.pixelId || ''}
                  onChange={handleManualPixelChange}
                  disabled={disabled}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="product-catalog-id" className="flex items-center gap-1.5">
                  <ShoppingBag className="size-3.5" aria-hidden />
                  Product catalog
                </Label>
                {canLoadMeta ? (
                  catalogState.loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Loading catalogs…
                    </div>
                  ) : catalogState.catalogs.length > 0 ? (
                    <Select
                      value={formData.productCatalogId || undefined}
                      onValueChange={handleCatalogChange}
                      disabled={disabled}
                    >
                      <SelectTrigger id="product-catalog-id">
                        <SelectValue placeholder="Select a catalog" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogState.catalogs.map((catalog) => (
                          <SelectItem key={catalog.id} value={catalog.id}>
                            {catalog.name}
                            {catalog.productCount != null
                              ? ` (${catalog.productCount.toLocaleString()} products)`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null
                ) : null}
                <Input
                  id="product-catalog-id-manual"
                  placeholder="Or enter catalog ID manually"
                  value={formData.productCatalogId || ''}
                  onChange={handleManualCatalogChange}
                  disabled={disabled}
                />
              </div>

              {formData.productCatalogId && canLoadMeta ? (
                <div className="space-y-2">
                  <Label htmlFor="product-set-id">Product set (optional)</Label>
                  {setState.loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Loading product sets…
                    </div>
                  ) : setState.sets.length > 0 ? (
                    <Select
                      value={formData.productSetId ?? '__all__'}
                      onValueChange={handleProductSetChange}
                      disabled={disabled}
                    >
                      <SelectTrigger id="product-set-id">
                        <SelectValue placeholder="All catalog products" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All catalog products</SelectItem>
                        {setState.sets.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.name}
                            {set.productCount != null
                              ? ` (${set.productCount.toLocaleString()} products)`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No product sets found. Meta will use the full catalog.
                    </p>
                  )}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="size-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sales campaign tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {salesMode === 'pixel' ? (
                  <>
                    <li>Ensure the pixel fires on your site before launching</li>
                    <li>Use retargeting audiences for cart abandoners</li>
                  </>
                ) : (
                  <>
                    <li>Sync products to the catalog in Meta Commerce Manager first</li>
                    <li>Use dynamic creative or catalog templates when creating ads</li>
                  </>
                )}
                <li>Monitor ROAS and adjust budget on the Budget tab</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
