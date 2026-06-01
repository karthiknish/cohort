import { SUPPORTED_CURRENCIES, type CurrencyCode } from '@/constants/currencies';
import { instantiateNumberFormat } from './create-international-format';
export const EN_US_NUMBER_FORMATTER = new Intl.NumberFormat('en-US');
export const EN_US_NUMBER_MAX_2_FORMATTER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});
export const EN_US_COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});
export const EN_US_DATETIME_MEDIUM_FORMATTER = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
});
export const GANTT_SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
});
export const AGENT_CHART_CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});
export const AGENT_CHART_WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
});
const EN_US_CURRENCY_MAX_0_USD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});
const EN_US_CURRENCY_MIN_2_USD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
});
const EN_US_CURRENCY_MAX_0_BY_CODE = new Map<string, Intl.NumberFormat>();
const EN_US_CURRENCY_MIN_2_BY_CODE = new Map<string, Intl.NumberFormat>();
for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
    EN_US_CURRENCY_MAX_0_BY_CODE.set(code, new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
    }));
    EN_US_CURRENCY_MIN_2_BY_CODE.set(code, new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
    }));
}
export function formatEnUsCurrencyMaxFractionDigits(value: number, currency: string = 'USD', maximumFractionDigits: 0 | 2 = 0): string {
    if (maximumFractionDigits === 2) {
        try {
            return (EN_US_CURRENCY_MIN_2_BY_CODE.get(currency) ?? EN_US_CURRENCY_MIN_2_USD).format(value);
        }
        catch {
            return EN_US_CURRENCY_MIN_2_USD.format(value);
        }
    }
    try {
        return (EN_US_CURRENCY_MAX_0_BY_CODE.get(currency) ?? EN_US_CURRENCY_MAX_0_USD).format(value);
    }
    catch {
        return EN_US_CURRENCY_MAX_0_USD.format(value);
    }
}
const EN_US_CURRENCY_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();
for (const code of Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]) {
    EN_US_CURRENCY_FORMATTER_CACHE.set(`en-US|${code}|maximumFractionDigits:0`, new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
    }));
    EN_US_CURRENCY_FORMATTER_CACHE.set(`en-US|${code}|minimumFractionDigits:0|maximumFractionDigits:0`, new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }));
}
function serializeNumberFormatOptions(options: Intl.NumberFormatOptions): string {
    return Object.entries(options)
        .toSorted(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, value]) => `${key}:${String(value)}`)
        .join('|');
}
function getEnUsCurrencyFormatter(currency: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const cacheKey = `en-US|${currency}|${serializeNumberFormatOptions(options)}`;
    const existingFormatter = EN_US_CURRENCY_FORMATTER_CACHE.get(cacheKey);
    if (existingFormatter) {
        return existingFormatter;
    }
    const formatter = instantiateNumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
        ...options,
    });
    EN_US_CURRENCY_FORMATTER_CACHE.set(cacheKey, formatter);
    return formatter;
}
export function formatEnUsCurrency(value: number, currency = 'USD', options: Intl.NumberFormatOptions = {}): string {
    try {
        return getEnUsCurrencyFormatter(currency, options).format(value);
    }
    catch {
        return getEnUsCurrencyFormatter('USD', options).format(value);
    }
}
