'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import { DollarSign, RefreshCw, Save } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { toast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { adsCampaignsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { cn } from '@/lib/utils'
import { formatMoney, normalizeCurrencyCode } from '@/constants/currencies'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'

type BudgetUiMode = 'daily' | 'lifetime' | 'total'

type Props = {
  providerId: string
  campaignId: string
  clientId?: string | null
  isPreviewMode?: boolean
  currency?: string | null
  budget?: number
  budgetType?: string | null
  onReloadCampaign?: () => void | Promise<void>
}

function parseBudgetMode(providerId: string, budgetType?: string | null): BudgetUiMode | null {
  const raw = typeof budgetType === 'string' ? budgetType.trim().toLowerCase() : ''

  if (providerId === 'tiktok') {
    if (raw === 'budget_mode_day') return 'daily'
    if (raw === 'budget_mode_total') return 'total'
  }

  if (raw === 'daily') return 'daily'
  if (raw === 'lifetime') return 'lifetime'
  if (raw === 'total') return 'total'

  return null
}

function getBudgetModeOptions(providerId: string): Array<{ value: BudgetUiMode; label: string }> {
  if (providerId === 'facebook') {
    return [
      { value: 'daily', label: 'Daily budget' },
      { value: 'lifetime', label: 'Lifetime budget' },
    ]
  }

  if (providerId === 'linkedin' || providerId === 'tiktok') {
    return [
      { value: 'daily', label: 'Daily budget' },
      { value: 'total', label: 'Total budget' },
    ]
  }

  return []
}

function toApiBudgetMode(providerId: string, mode: BudgetUiMode | null): string | undefined {
  if (!mode) return undefined
  if (providerId === 'tiktok') {
    return mode === 'daily' ? 'BUDGET_MODE_DAY' : 'BUDGET_MODE_TOTAL'
  }
  return mode
}

export function BudgetControlSection({
  providerId,
  campaignId,
  clientId,
  isPreviewMode,
  currency,
  budget,
  budgetType,
  onReloadCampaign,
}: Props) {
  const canEdit = !isPreviewMode

  const currencyCode = useMemo(() => normalizeCurrencyCode(currency ?? undefined), [currency])
  const modeOptions = useMemo(() => getBudgetModeOptions(providerId), [providerId])
  const initialMode = useMemo(() => parseBudgetMode(providerId, budgetType) ?? modeOptions[0]?.value ?? null, [budgetType, modeOptions, providerId])

  const [amount, setAmount] = useState<string>(() =>
    typeof budget === 'number' && Number.isFinite(budget) ? String(budget) : ''
  )
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const updateCampaign = useAction(adsCampaignsApi.updateCampaign)

  const [mode, setMode] = useState<BudgetUiMode | null>(() => initialMode)
  const [saving, setSaving] = useState(false)

  const currentBudgetLabel = useMemo(() => {
    if (typeof budget !== 'number' || !Number.isFinite(budget)) return 'Not set'
    return formatMoney(budget, currencyCode)
  }, [budget, currencyCode])

  const handleSave = useCallback(() => {
    if (!canEdit) return

    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      notifyFailure({
        title: 'Invalid budget',
        message: 'Enter a valid budget amount greater than 0.',
      })
      return
    }

    setSaving(true)
    const apiMode = toApiBudgetMode(providerId, mode)

    if (!workspaceId) {
      setSaving(false)
      return
    }

    void updateCampaign({
        workspaceId,
      providerId: toAdsProviderId(providerId),
        clientId: clientId ?? null,
        campaignId,
        action: 'updateBudget',
        budget: parsed,
        budgetMode: apiMode,
      })

      .then(() => {
        toast({
          title: 'Budget updated',
          description: 'Changes will reflect after refresh.',
        })

        return onReloadCampaign?.()
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'BudgetControlSection:handleSave',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        setSaving(false)
      })
  }, [amount, canEdit, campaignId, clientId, mode, onReloadCampaign, providerId, updateCampaign, workspaceId])

  const handleRefresh = useCallback(() => {
    if (!onReloadCampaign) return

    void Promise.resolve(onReloadCampaign()).catch((error) => {
      logError(error, 'BudgetControlSection:handleRefresh')
    })
  }, [onReloadCampaign])

  const handleModeChange = useCallback((value: string) => {
    setMode(value as BudgetUiMode)
  }, [])

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)
  }, [])

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CardHeader className="border-b border-border/50 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
              <DollarSign className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="space-y-0.5">
              <p className={ADS_PAGE_THEME.sectionEyebrow}>Campaign settings</p>
              <CardTitle className="text-lg font-semibold tracking-tight">Budget control</CardTitle>
              <CardDescription>
                Current: <span className="font-medium text-foreground">{currentBudgetLabel}</span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleRefresh}
              disabled={saving}
              aria-label="Refresh campaign"
            >
              <RefreshCw className={cn('h-4 w-4', saving && 'animate-spin')} />
            </Button>
            <Button onClick={handleSave} disabled={!canEdit || saving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {!canEdit && (
          <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
            Preview Mode is enabled. Switch to live mode to edit budgets.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {modeOptions.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="budget-type">Budget type</Label>
              <Select value={mode ?? undefined} onValueChange={handleModeChange} disabled={!canEdit || saving}>
                <SelectTrigger id="budget-type">
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  {modeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={cn('space-y-2', modeOptions.length > 0 ? 'sm:col-span-2' : 'sm:col-span-3')}>
            <Label htmlFor="budget-amount">Budget amount ({currencyCode.toUpperCase()})</Label>
            <Input
              id="budget-amount"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={amount}
              onChange={handleAmountChange}
              disabled={!canEdit || saving}
            />
            <p className="text-xs text-muted-foreground">
              Note: Some platforms enforce minimums and may reject certain values.
            </p>
          </div>
        </div>
      </CardContent>
    </MotionCard>
  )
}
