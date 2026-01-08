'use client'

import { type FormEvent, useState } from 'react'

import { LoaderCircle, Plus, Search, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CurrencySelect, CurrencyBadge } from '@/components/ui/currency-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { FinanceCostEntry } from '@/types/finance'
import type { CurrencyCode } from '@/constants/currencies'

import { formatCadence, formatCurrency } from '../utils'
import type { CostFormState } from '../hooks/use-finance-data'

interface FinanceCostsCardProps {
  costs: Array<FinanceCostEntry & { monthlyValue: number }>
  monthlyCostTotal: number
  newCost: CostFormState
  onChangeNewCost: (value: CostFormState | ((prev: CostFormState) => CostFormState)) => void
  onAddCost: (event: FormEvent<HTMLFormElement>) => void
  onRemoveCost: (id: string) => void
  submitting: boolean
  removingCostId?: string | null
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
  currency?: string
}

export function FinanceCostsCard({
  costs,
  monthlyCostTotal,
  newCost,
  onChangeNewCost,
  onAddCost,
  onRemoveCost,
  submitting,
  removingCostId,
  onLoadMore,
  hasMore,
  loadingMore,
  currency,
}: FinanceCostsCardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const resolvedCurrency = currency ?? 'USD'

  const filteredCosts = costs.filter((cost) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      cost.category.toLowerCase().includes(query) ||
      cost.cadence.toLowerCase().includes(query)
    )
  })

  return (
    <Card className="border-muted/60 bg-background shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-col gap-4 border-b border-muted/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">Operating Costs</CardTitle>
          <CardDescription>
            Track SaaS, people, and overhead expenses that roll into financial charts.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search costs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 focus-visible:ring-primary"
            />
          </div>
          <Badge variant="secondary" className="w-fit whitespace-nowrap bg-primary/10 text-xs font-semibold uppercase tracking-wide text-primary px-3 py-1.5">
            {formatCurrency(Math.round(monthlyCostTotal), resolvedCurrency)} per month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <form onSubmit={onAddCost} className="grid gap-3 md:grid-cols-[2fr,1fr,1fr,1fr,auto]">
          <div className="space-y-1.5">
            <Label htmlFor="cost-category" className="text-sm font-medium">Cost category</Label>
            <Input
              id="cost-category"
              value={newCost.category}
              onChange={(event) => onChangeNewCost((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="e.g. Creative tooling"
              className="focus-visible:ring-primary"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost-amount" className="text-sm font-medium">Amount</Label>
            <Input
              id="cost-amount"
              type="number"
              min="0"
              value={newCost.amount}
              onChange={(event) => onChangeNewCost((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="1500"
              className="focus-visible:ring-primary"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost-currency" className="text-sm font-medium">Currency</Label>
            <CurrencySelect
              value={(newCost.currency ?? 'USD') as CurrencyCode}
              onValueChange={(value) => onChangeNewCost((prev) => ({ ...prev, currency: value }))}
              showPopular
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost-cadence" className="text-sm font-medium">Cadence</Label>
            <Select
              value={newCost.cadence}
              onValueChange={(value) => onChangeNewCost((prev) => ({ ...prev, cadence: value as FinanceCostEntry['cadence'] }))}
            >
              <SelectTrigger id="cost-cadence">
                <SelectValue placeholder="Monthly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-off">One-off</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full shadow-sm hover:shadow transition-shadow" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add cost
                </>
              )}
            </Button>
          </div>
        </form>

        <Separator className="bg-muted/50" />

        <div className="space-y-3">
          {filteredCosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              {costs.length === 0 ? 'No company-level costs captured yet.' : 'No costs match your search.'}
            </p>
          ) : (
            filteredCosts.map((cost) => (
              <div
                key={cost.id}
                className="flex flex-col gap-3 rounded-lg border border-muted/40 bg-muted/10 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <CurrencyBadge currency={(cost.currency ?? 'USD')} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cost.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCadence(cost.cadence)} · {formatCurrency(Math.round(cost.amount), cost.currency ?? resolvedCurrency)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
                    {formatCurrency(Math.round(cost.monthlyValue), cost.currency ?? resolvedCurrency)} / mo
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => void onRemoveCost(cost.id)}
                          aria-label={`Remove ${cost.category}`}
                          disabled={removingCostId === cost.id}
                        >
                          {removingCostId === cost.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove cost</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))
          )}
          {hasMore ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void onLoadMore?.()}
                disabled={loadingMore}
                className="hover:bg-muted/50 transition-colors"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2 text-sm">
                    <LoaderCircle className="h-4 w-4 animate-spin" /> Loading more
                  </span>
                ) : (
                  'Load more costs'
                )}
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
