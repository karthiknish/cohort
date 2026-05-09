const USD_CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

function formatCurrency(value: number): string {
  return USD_CURRENCY_FORMATTER.format(value)
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