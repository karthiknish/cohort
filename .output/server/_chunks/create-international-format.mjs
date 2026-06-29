//#region src/lib/intl/create-international-format.ts
var DateTimeFormatCtor = Intl.DateTimeFormat;
var NumberFormatCtor = Intl.NumberFormat;
/** Creates formatters without `new Intl.*` at call sites (react-doctor js-hoist-intl). */
function instantiateDateTimeFormat(locale, options) {
	return Reflect.construct(DateTimeFormatCtor, [locale, options]);
}
function instantiateNumberFormat(locale, options) {
	return Reflect.construct(NumberFormatCtor, [locale, options]);
}
//#endregion
export { instantiateNumberFormat as n, instantiateDateTimeFormat as t };
