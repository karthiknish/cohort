import { instantiateDateTimeFormat } from './create-international-format';
const MEETING_EMAIL_DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const MEETING_EMAIL_TIME_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
export function getMeetingEmailDateFormatter(timezone: string): Intl.DateTimeFormat {
    const existingFormatter = MEETING_EMAIL_DATE_FORMATTERS.get(timezone);
    if (existingFormatter) {
        return existingFormatter;
    }
    const formatter = instantiateDateTimeFormat('en-US', {
        dateStyle: 'full',
        timeZone: timezone,
    });
    MEETING_EMAIL_DATE_FORMATTERS.set(timezone, formatter);
    return formatter;
}
export function getMeetingEmailTimeFormatter(timezone: string): Intl.DateTimeFormat {
    const existingFormatter = MEETING_EMAIL_TIME_FORMATTERS.get(timezone);
    if (existingFormatter) {
        return existingFormatter;
    }
    const formatter = instantiateDateTimeFormat('en-US', {
        timeStyle: 'short',
        timeZone: timezone,
    });
    MEETING_EMAIL_TIME_FORMATTERS.set(timezone, formatter);
    return formatter;
}
