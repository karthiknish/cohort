import { instantiateDateTimeFormat } from './create-international-format';
const LOCAL_DATE_TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const DAY_KEY_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
export function getLocalDateTimeFormatter(timezone: string | null | undefined): Intl.DateTimeFormat {
    const normalizedTimeZone = typeof timezone === 'string' && timezone.trim().length > 0 ? timezone : '';
    const existingFormatter = LOCAL_DATE_TIME_FORMATTERS.get(normalizedTimeZone);
    if (existingFormatter) {
        return existingFormatter;
    }
    const formatter = instantiateDateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: normalizedTimeZone || undefined,
    });
    LOCAL_DATE_TIME_FORMATTERS.set(normalizedTimeZone, formatter);
    return formatter;
}
export function getDayKeyFormatter(timeZone?: string | null): Intl.DateTimeFormat {
    const normalizedTimeZone = typeof timeZone === 'string' && timeZone.trim().length > 0 ? timeZone : '';
    const existingFormatter = DAY_KEY_FORMATTERS.get(normalizedTimeZone);
    if (existingFormatter) {
        return existingFormatter;
    }
    const formatter = instantiateDateTimeFormat('en-US', {
        timeZone: normalizedTimeZone || undefined,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    DAY_KEY_FORMATTERS.set(normalizedTimeZone, formatter);
    return formatter;
}
