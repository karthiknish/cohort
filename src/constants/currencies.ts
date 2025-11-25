/**
 * Multi-currency support constants
 * Includes major world currencies with symbols and formatting options
 */

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'CHF'
  | 'CNY'
  | 'INR'
  | 'BRL'
  | 'MXN'
  | 'SGD'
  | 'HKD'
  | 'NZD'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'ZAR'
  | 'AED'
  | 'KRW'

export interface CurrencyInfo {
  code: CurrencyCode
  name: string
  symbol: string
  locale: string
  decimalDigits: number
  symbolPosition: 'before' | 'after'
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    locale: 'en-CA',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    locale: 'en-AU',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    locale: 'ja-JP',
    decimalDigits: 0,
    symbolPosition: 'before',
  },
  CHF: {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    locale: 'de-CH',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    locale: 'zh-CN',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    locale: 'en-IN',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    locale: 'pt-BR',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  MXN: {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: 'MX$',
    locale: 'es-MX',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    locale: 'en-SG',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  HKD: {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    locale: 'en-HK',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  NZD: {
    code: 'NZD',
    name: 'New Zealand Dollar',
    symbol: 'NZ$',
    locale: 'en-NZ',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  SEK: {
    code: 'SEK',
    name: 'Swedish Krona',
    symbol: 'kr',
    locale: 'sv-SE',
    decimalDigits: 2,
    symbolPosition: 'after',
  },
  NOK: {
    code: 'NOK',
    name: 'Norwegian Krone',
    symbol: 'kr',
    locale: 'nb-NO',
    decimalDigits: 2,
    symbolPosition: 'after',
  },
  DKK: {
    code: 'DKK',
    name: 'Danish Krone',
    symbol: 'kr',
    locale: 'da-DK',
    decimalDigits: 2,
    symbolPosition: 'after',
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    locale: 'en-ZA',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    locale: 'ar-AE',
    decimalDigits: 2,
    symbolPosition: 'before',
  },
  KRW: {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    locale: 'ko-KR',
    decimalDigits: 0,
    symbolPosition: 'before',
  },
}

export const CURRENCY_CODES = Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]

export const DEFAULT_CURRENCY: CurrencyCode = 'USD'

/**
 * Get currency info by code (case-insensitive)
 */
export function getCurrencyInfo(code: string): CurrencyInfo {
  const normalizedCode = code.toUpperCase() as CurrencyCode
  return SUPPORTED_CURRENCIES[normalizedCode] ?? SUPPORTED_CURRENCIES[DEFAULT_CURRENCY]
}

/**
 * Check if a currency code is supported
 */
export function isSupportedCurrency(code: string): code is CurrencyCode {
  return code.toUpperCase() in SUPPORTED_CURRENCIES
}

/**
 * Get a list of currencies for select dropdowns
 */
export function getCurrencyOptions(): Array<{ value: CurrencyCode; label: string; symbol: string }> {
  return CURRENCY_CODES.map((code) => ({
    value: code,
    label: `${code} - ${SUPPORTED_CURRENCIES[code].name}`,
    symbol: SUPPORTED_CURRENCIES[code].symbol,
  }))
}

/**
 * Popular currencies for quick selection (subset for common use)
 */
export const POPULAR_CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'INR',
  'JPY',
  'CHF',
]

/**
 * Get popular currency options for select dropdowns
 */
export function getPopularCurrencyOptions(): Array<{ value: CurrencyCode; label: string; symbol: string }> {
  return POPULAR_CURRENCIES.map((code) => ({
    value: code,
    label: `${code} - ${SUPPORTED_CURRENCIES[code].name}`,
    symbol: SUPPORTED_CURRENCIES[code].symbol,
  }))
}
