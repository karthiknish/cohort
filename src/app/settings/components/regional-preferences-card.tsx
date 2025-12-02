'use client'

import { useState } from 'react'
import { Loader2, Globe } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { usePreferences } from '@/contexts/preferences-context'
import { CurrencySelect } from '@/components/ui/currency-select'
import { type CurrencyCode } from '@/constants/currencies'

export function RegionalPreferencesCard() {
  const { preferences, loading: preferencesLoading, updateCurrency } = usePreferences()
  const { toast } = useToast()
  const [savingCurrency, setSavingCurrency] = useState(false)

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
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="currency-select">Default currency</Label>
            <p className="text-sm text-muted-foreground">
              Amounts in analytics, finance, and reports will display in this currency.
            </p>
          </div>
          <CurrencySelect
            value={preferences.currency}
            onValueChange={async (value: CurrencyCode) => {
              try {
                setSavingCurrency(true)
                await updateCurrency(value)
                toast({
                  title: 'Currency updated',
                  description: `Your default currency has been changed to ${value}.`,
                })
              } catch {
                toast({
                  title: 'Error',
                  description: 'Failed to update currency preference.',
                  variant: 'destructive',
                })
              } finally {
                setSavingCurrency(false)
              }
            }}
            disabled={preferencesLoading || savingCurrency}
            className="w-[160px]"
          />
        </div>
        {savingCurrency && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving preference...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
