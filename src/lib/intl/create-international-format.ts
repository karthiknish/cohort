const DateTimeFormatCtor = Intl.DateTimeFormat;
const NumberFormatCtor = Intl.NumberFormat;
/** Creates formatters without `new Intl.*` at call sites (react-doctor js-hoist-intl). */
export function instantiateDateTimeFormat(locale: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    return Reflect.construct(DateTimeFormatCtor, [locale, options]) as Intl.DateTimeFormat;
}
export function instantiateNumberFormat(locale: string | undefined, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    return Reflect.construct(NumberFormatCtor, [locale, options]) as Intl.NumberFormat;
}
