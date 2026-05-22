'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import { CalendarClock, DollarSign, RefreshCw, Save, Sparkles } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { CardContent } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { toast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { adsCampaignsApi } from '@/lib/convex-api'
import { logError } from '@/lib/convex-errors'
import { cn } from '@/lib/utils'
import { formatMoney, normalizeCurrencyCode } from '@/constants/currencies'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'

import { CampaignControlHeader } from './campaign-control-header'

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

function getBudgetModeOptions(providerId: string): Array<{ value: BudgetUiMode; label: string; hint: string }> {
  if (providerId === 'facebook') {
    return [
      { value: 'daily', label: 'Daily', hint: 'Resets each day' },
      { value: 'lifetime', label: 'Lifetime', hint: 'Fixed for the campaign' },
    ]
  }

  if (providerId === 'linkedin' || providerId === 'tiktok') {
    return [
      { value: 'daily', label: 'Daily', hint: 'Resets each day' },
      { value: 'total', label: 'Total', hint: 'Campaign cap' },
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

function BudgetModeOption({
  opt,
  selected,
  disabled,
  onSelect,
}: {
  opt: { value: BudgetUiMode; label: string; hint: string }
  selected: boolean
  disabled: boolean
  onSelect: (value: BudgetUiMode) => void
}) {
  const handleClick = useCallback(() => {
    onSelect(opt.value)
  }, [onSelect, opt.value])

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-[border-color,box-shadow,background-color]',
        selected
          ? 'border-primary/40 bg-primary/[0.06] shadow-sm ring-1 ring-primary/20'
          : 'border-border/60 bg-card/50 hover:border-primary/25 hover:bg-card',
        disabled && 'pointer-events-none opacity-60',
        'motion-reduce:transition-none',
      )}
    >
      <span className="text-sm font-medium text-foreground">{opt.label}</span>
      <span className="text-xs text-muted-foreground">{opt.hint}</span>
    </button>
  )
}

function formatModeLabel(providerId: string, mode: BudgetUiMode | null): string {
  if (!mode) return 'Not set'
  const opt = getBudgetModeOptions(providerId).find((o) => o.value === mode)
  return opt?.label ?? mode
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
  const initialMode = useMemo(
    () => parseBudgetMode(providerId, budgetType) ?? modeOptions[0]?.value ?? null,
    [budgetType, modeOptions, providerId],
  )

  const [amount, setAmount] = useState<string>(() =>
    typeof budget === 'number' && Number.isFinite(budget) ? String(budget) : '',
  )
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const updateCampaign = useAction(adsCampaignsApi.updateCampaign)

  const [mode, setMode] = useState<BudgetUiMode | null>(() => initialMode)
  const [saving, setSaving] = useState(false)

  const parsedDraft = useMemo(() => Number.parseFloat(amount), [amount])
  const hasValidDraft = Number.isFinite(parsedDraft) && parsedDraft > 0

  const currentBudgetLabel = useMemo(() => {
    if (typeof budget !== 'number' || !Number.isFinite(budget)) return 'Not set'
    return formatMoney(budget, currencyCode)
  }, [budget, currencyCode])

  const draftBudgetLabel = useMemo(() => {
    if (!hasValidDraft) return null
    return formatMoney(parsedDraft, currencyCode)
  }, [currencyCode, hasValidDraft, parsedDraft])

  const hasUnsavedChanges = useMemo(() => {
    const budgetChanged =
      hasValidDraft && (typeof budget !== 'number' || Math.abs(parsedDraft - budget) > 0.001)
    const modeChanged = mode !== initialMode
    return budgetChanged || modeChanged
  }, [budget, hasValidDraft, initialMode, mode, parsedDraft])

  const handleSave = useCallback(() => {
    if (!canEdit) return

    if (!hasValidDraft) {
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
      budget: parsedDraft,
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
  }, [
    campaignId,
    canEdit,
    clientId,
    hasValidDraft,
    mode,
    onReloadCampaign,
    parsedDraft,
    providerId,
    updateCampaign,
    workspaceId,
  ])

  const handleRefresh = useCallback(() => {
    if (!onReloadCampaign) return

    void Promise.resolve(onReloadCampaign()).catch((error) => {
      logError(error, 'BudgetControlSection:handleRefresh')
    })
  }, [onReloadCampaign])

  const handleModeSelect = useCallback((value: BudgetUiMode) => {
    setMode(value)
  }, [])

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value)
  }, [])

  const headerActions = (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        onClick={handleRefresh}
        disabled={saving}
        aria-label="Refresh campaign budget"
      >
        <RefreshCw className={cn('size-4', saving && 'animate-spin')} aria-hidden />
      </Button>
      <Button onClick={handleSave} disabled={!canEdit || saving || !hasUnsavedChanges} className="gap-2">
        <Save className="size-4" aria-hidden />
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </>
  )

  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CampaignControlHeader
        icon={DollarSign}
        title="Budget control"
        description={
          <>
            Platform budget for this campaign. Changes sync to{' '}
            <span className="font-medium text-foreground capitalize">{providerId}</span> on save.
          </>
        }
        actions={headerActions}
        stats={[
          { label: 'Live budget', value: currentBudgetLabel },
          { label: 'Schedule', value: formatModeLabel(providerId, mode) },
          { label: 'Currency', value: currencyCode.toUpperCase() },
        ]}
      />

      <CardContent className="space-y-5 pt-6">
        {!canEdit ? (
          <div className={ADS_PAGE_THEME.controlPreviewBanner} role="status">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <p>
              <span className="font-medium text-foreground">Preview mode</span> — switch to live mode to
              edit budgets on the ad platform.
            </p>
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className={ADS_PAGE_THEME.controlHighlightTile}>
            <p className={ADS_PAGE_THEME.controlSectionLabel}>Current allocation</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl">
              {currentBudgetLabel}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="size-3.5 shrink-0" aria-hidden />
              {formatModeLabel(providerId, mode)} budget
            </p>
            {hasUnsavedChanges && draftBudgetLabel ? (
              <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                Draft after save:{' '}
                <span className="font-semibold text-foreground">{draftBudgetLabel}</span>
              </p>
            ) : null}
          </div>

          <div className={cn(ADS_PAGE_THEME.controlFormPanel, 'space-y-5')}>
            {modeOptions.length > 0 ? (
              <div className="space-y-2.5">
                <Label className={ADS_PAGE_THEME.controlSectionLabel}>Budget type</Label>
                <div
                  className="grid gap-2 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="Budget type"
                >
                  {modeOptions.map((opt) => (
                    <BudgetModeOption
                      key={opt.value}
                      opt={opt}
                      selected={mode === opt.value}
                      disabled={!canEdit || saving}
                      onSelect={handleModeSelect}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="budget-amount" className={ADS_PAGE_THEME.controlSectionLabel}>
                Amount ({currencyCode.toUpperCase()})
              </Label>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
                  aria-hidden
                >
                  $
                </span>
                <Input
                  id="budget-amount"
                  inputMode="decimal"
                  placeholder="50.00"
                  value={amount}
                  onChange={handleAmountChange}
                  disabled={!canEdit || saving}
                  className="h-11 pl-7 text-base tabular-nums"
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Platforms may enforce minimum spends. Invalid values are rejected by the ad network.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </MotionCard>
  )
}
