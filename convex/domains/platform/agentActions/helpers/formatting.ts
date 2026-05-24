const USD_CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const currencyFormatters = new Map<string, Intl.NumberFormat>([['USD', USD_CURRENCY_FORMATTER]])

for (const currency of Intl.supportedValuesOf('currency')) {
  if (currencyFormatters.has(currency)) continue
  try {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    )
  } catch {
    // Some currency codes are not supported by this runtime locale.
  }
}

function formatCurrency(value: number, currency = 'USD'): string {
  const formatter = currencyFormatters.get(currency) ?? USD_CURRENCY_FORMATTER
  try {
    return formatter.format(value)
  } catch {
    return USD_CURRENCY_FORMATTER.format(value)
  }
}

function formatWholeNumber(value: number): string {
  return WHOLE_NUMBER_FORMATTER.format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

function formatRatio(value: number): string {
  return `${value.toFixed(2)}x`
}

export {
  formatCurrency,
  formatPercent,
  formatRatio,
  formatWholeNumber,
}