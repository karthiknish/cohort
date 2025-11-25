'use client'

import * as React from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  SUPPORTED_CURRENCIES,
  POPULAR_CURRENCIES,
  type CurrencyCode,
  getCurrencyOptions,
} from '@/constants/currencies'

interface CurrencySelectProps {
  value: string
  onValueChange: (value: CurrencyCode) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  showPopular?: boolean
  compact?: boolean
}

export function CurrencySelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = 'Currency',
  className,
  showPopular = true,
  compact = false,
}: CurrencySelectProps) {
  const normalizedValue = (value?.toUpperCase() || 'USD') as CurrencyCode
  const currencyInfo = SUPPORTED_CURRENCIES[normalizedValue] ?? SUPPORTED_CURRENCIES.USD
  const allOptions = getCurrencyOptions()

  return (
    <Select
      value={normalizedValue}
      onValueChange={(v) => onValueChange(v as CurrencyCode)}
      disabled={disabled}
    >
      <SelectTrigger className={cn(compact ? 'w-[100px]' : 'w-[140px]', className)}>
        <SelectValue placeholder={placeholder}>
          <span className="flex items-center gap-1.5">
            <span className="font-medium">{currencyInfo.symbol}</span>
            <span className="text-muted-foreground">{normalizedValue}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {showPopular && (
          <>
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Popular
            </div>
            {POPULAR_CURRENCIES.map((code) => (
              <SelectItem key={code} value={code}>
                <span className="flex items-center gap-2">
                  <span className="w-6 font-medium">{SUPPORTED_CURRENCIES[code].symbol}</span>
                  <span className="w-10">{code}</span>
                  <span className="text-xs text-muted-foreground">
                    {SUPPORTED_CURRENCIES[code].name}
                  </span>
                </span>
              </SelectItem>
            ))}
            <div className="my-1 border-t border-muted" />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              All currencies
            </div>
          </>
        )}
        {allOptions
          .filter((opt) => !showPopular || !POPULAR_CURRENCIES.includes(opt.value))
          .map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                <span className="w-6 font-medium">{opt.symbol}</span>
                <span className="w-10">{opt.value}</span>
                <span className="text-xs text-muted-foreground">
                  {SUPPORTED_CURRENCIES[opt.value].name}
                </span>
              </span>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}

// Compact currency badge for display
interface CurrencyBadgeProps {
  currency: string
  className?: string
}

export function CurrencyBadge({ currency, className }: CurrencyBadgeProps) {
  const normalizedCode = (currency?.toUpperCase() || 'USD') as CurrencyCode
  const info = SUPPORTED_CURRENCIES[normalizedCode] ?? SUPPORTED_CURRENCIES.USD

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium',
        className
      )}
    >
      <span>{info.symbol}</span>
      <span className="text-muted-foreground">{normalizedCode}</span>
    </span>
  )
}
