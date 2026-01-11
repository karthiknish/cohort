'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'
import { DollarSign, RefreshCw, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { adsCampaignsApi } from '@/lib/convex-api'
import { cn } from '@/lib/utils'
import { formatMoney, normalizeCurrencyCode } from '@/constants/currencies'

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

function unwrapApiErrorMessage(payload: unknown): string | null {
  const rec = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  const error = rec && typeof rec.error === 'string' ? rec.error : null
  const message = rec && typeof rec.message === 'string' ? rec.message : null
  return error || message || null
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

  const [amount, setAmount] = useState<string>('')
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const updateCampaign = useAction(adsCampaignsApi.updateCampaign)

  const [mode, setMode] = useState<BudgetUiMode | null>(initialMode)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    // Only fill input automatically when empty (avoid clobbering user edits)
    if (amount.trim().length > 0) return
    if (typeof budget === 'number' && Number.isFinite(budget)) {
      setAmount(String(budget))
    }
  }, [budget])

  const currentBudgetLabel = useMemo(() => {
    if (typeof budget !== 'number' || !Number.isFinite(budget)) return 'Not set'
    return formatMoney(budget, currencyCode)
  }, [budget, currencyCode])

  const handleSave = useCallback(async () => {
    if (!canEdit) return

    const parsed = Number.parseFloat(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast({
        title: 'Invalid budget',
        description: 'Enter a valid budget amount greater than 0.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const apiMode = toApiBudgetMode(providerId, mode)

      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      await updateCampaign({
        workspaceId,
        providerId: providerId as any,
        clientId: clientId ?? null,
        campaignId,
        action: 'updateBudget',
        budget: parsed,
        budgetMode: apiMode,
      })

      toast({
        title: 'Budget updated',
        description: 'Changes will reflect after refresh.',
      })

      await onReloadCampaign?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update budget',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }, [amount, canEdit, campaignId, clientId, mode, onReloadCampaign, providerId, updateCampaign, workspaceId])

  const handleRefresh = useCallback(async () => {
    try {
      await onReloadCampaign?.()
    } catch {
      // ignore
    }
  }, [onReloadCampaign])

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Budget control</CardTitle>
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
            <Button onClick={() => void handleSave()} disabled={!canEdit || saving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canEdit && (
          <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
            Preview Mode is enabled. Switch to live mode to edit budgets.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {modeOptions.length > 0 && (
            <div className="space-y-2">
              <Label>Budget type</Label>
              <Select value={mode ?? undefined} onValueChange={(v) => setMode(v as BudgetUiMode)} disabled={!canEdit || saving}>
                <SelectTrigger>
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
            <Label>Budget amount ({currencyCode})</Label>
            <Input
              inputMode="decimal"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!canEdit || saving}
            />
            <p className="text-xs text-muted-foreground">
              Note: Some platforms enforce minimums and may reject certain values.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
