'use client'

import { useCallback, useState } from 'react'
import { LoaderCircle, Globe } from 'lucide-react'

import { asErrorMessage } from '@/lib/convex-errors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'
import { usePreferences } from '@/shared/contexts/preferences-context'
import { Button } from '@/shared/ui/button'
import { CurrencySelect } from '@/shared/ui/currency-select'
import type { CurrencyCode } from '@/constants/currencies'
import { getPreviewSettingsRegionalPreferences } from '@/lib/preview-data'

export function RegionalPreferencesCard() {
  const { preferences, loading: preferencesLoading, error: preferencesError, clearError, updateCurrency } =
    usePreferences()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [previewCurrency, setPreviewCurrency] = useState<CurrencyCode>(() => getPreviewSettingsRegionalPreferences().currency)

  const handleCurrencyChange = useCallback((value: CurrencyCode) => {
    if (isPreviewMode) {
      setPreviewCurrency(value)
      toast({
        title: 'Preview mode',
        description: `Default currency changed to ${value} for this session only.`,
      })
      return
    }

    setSavingCurrency(true)
    void updateCurrency(value)
      .then(() => {
        toast({
          title: 'Currency updated',
          description: `Your default currency has been changed to ${value}.`,
        })
      })
      .catch((err: unknown) => {
        toast({
          title: 'Could not update currency',
          description: asErrorMessage(err),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setSavingCurrency(false)
      })
  }, [isPreviewMode, toast, updateCurrency])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Regional preferences
        </CardTitle>
        <CardDescription>Set your preferred currency for displaying financial data across the dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {preferencesError ? (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <div className="flex items-start justify-between gap-2">
              <span>{preferencesError}</span>
              <Button type="button" variant="ghost" size="sm" className="shrink-0 text-destructive" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="currency-select">Default currency</Label>
            <p className="text-sm text-muted-foreground">
              Amounts in analytics and reports will display in this currency.
            </p>
          </div>
          <CurrencySelect
            id="currency-select"
            value={isPreviewMode ? previewCurrency : preferences.currency}
            onValueChange={handleCurrencyChange}
            disabled={(!isPreviewMode && preferencesLoading) || savingCurrency}
            className="w-40"
          />
        </div>
        {savingCurrency && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Saving preference…
          </div>
        )}
      </CardContent>
    </Card>
  )
}
