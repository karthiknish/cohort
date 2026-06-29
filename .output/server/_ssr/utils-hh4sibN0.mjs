import { o as SUPPORTED_CURRENCIES } from "./preview-data-CXkRNfsX.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { N as isValid, g as formatDistanceToNow, r as parseISO } from "../_libs/date-fns.mjs";
import { t as formatInTimeZone } from "../_libs/date-fns-tz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-international-format-CP8hei7-.js
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
//#region node_modules/.nitro/vite/services/ssr/assets/utils-hh4sibN0.js
var DEFAULT_TIMEZONE = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "UTC";
/**
* Formats a date string or object into a standardized format.
*/
function formatDate(date, formatStr = "PPP", timeZone = DEFAULT_TIMEZONE, fallback = "") {
	if (!date) return fallback;
	const d = typeof date === "string" ? (() => {
		const trimmed = date.trim();
		if (!trimmed) return /* @__PURE__ */ new Date("");
		const isoParsed = parseISO(trimmed);
		if (isValid(isoParsed)) return isoParsed;
		return new Date(trimmed);
	})() : new Date(date);
	if (!isValid(d)) return fallback;
	return formatInTimeZone(d, timeZone, formatStr);
}
/**
* Formats a date as an ISO string in UTC.
*/
function toISO(date = /* @__PURE__ */ new Date()) {
	if (typeof date === "string") {
		const trimmed = date.trim();
		if (!trimmed) return "";
		const isoParsed = parseISO(trimmed);
		if (isValid(isoParsed)) return isoParsed.toISOString();
		const nativeParsed = new Date(trimmed);
		return isValid(nativeParsed) ? nativeParsed.toISOString() : "";
	}
	const d = new Date(date);
	return isValid(d) ? d.toISOString() : "";
}
/**
* Returns a relative time string (e.g., "2 hours ago").
*/
function formatRelativeTime$1(date) {
	if (!date) return "";
	const d = typeof date === "string" ? parseISO(date) : new Date(date);
	if (!isValid(d)) return "";
	return formatDistanceToNow(d, { addSuffix: true });
}
/**
* Parses a date string safely.
*/
function parseDate(date) {
	if (!date) return null;
	const d = parseISO(date);
	return isValid(d) ? d : null;
}
/**
* Standard date formats for the application.
*/
var DATE_FORMATS = {
	SHORT: "MMM d, yyyy",
	LONG: "MMMM d, yyyy",
	WITH_TIME: "MMM d, yyyy h:mm a",
	ISO_DATE: "yyyy-MM-dd",
	MONTH_YEAR: "MMMM yyyy"
};
var EN_US_NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
var EN_US_NUMBER_MAX_2_FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
var EN_US_COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1
});
var EN_US_DATETIME_MEDIUM_FORMATTER = new Intl.DateTimeFormat("en-US", {
	dateStyle: "medium",
	timeStyle: "short"
});
var GANTT_SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en", {
	month: "short",
	day: "numeric"
});
new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0
});
var AGENT_CHART_WHOLE_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
var EN_US_CURRENCY_MAX_0_USD = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0
});
var EN_US_CURRENCY_MIN_2_USD = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2
});
var EN_US_CURRENCY_MAX_0_BY_CODE = /* @__PURE__ */ new Map();
var EN_US_CURRENCY_MIN_2_BY_CODE = /* @__PURE__ */ new Map();
for (const code of Object.keys(SUPPORTED_CURRENCIES)) {
	EN_US_CURRENCY_MAX_0_BY_CODE.set(code, new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: code,
		maximumFractionDigits: 0
	}));
	EN_US_CURRENCY_MIN_2_BY_CODE.set(code, new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: code,
		minimumFractionDigits: 2
	}));
}
function formatEnUsCurrencyMaxFractionDigits(value, currency = "USD", maximumFractionDigits = 0) {
	if (maximumFractionDigits === 2) try {
		return (EN_US_CURRENCY_MIN_2_BY_CODE.get(currency) ?? EN_US_CURRENCY_MIN_2_USD).format(value);
	} catch {
		return EN_US_CURRENCY_MIN_2_USD.format(value);
	}
	try {
		return (EN_US_CURRENCY_MAX_0_BY_CODE.get(currency) ?? EN_US_CURRENCY_MAX_0_USD).format(value);
	} catch {
		return EN_US_CURRENCY_MAX_0_USD.format(value);
	}
}
var EN_US_CURRENCY_FORMATTER_CACHE = /* @__PURE__ */ new Map();
for (const code of Object.keys(SUPPORTED_CURRENCIES)) {
	EN_US_CURRENCY_FORMATTER_CACHE.set(`en-US|${code}|maximumFractionDigits:0`, new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: code,
		maximumFractionDigits: 0
	}));
	EN_US_CURRENCY_FORMATTER_CACHE.set(`en-US|${code}|minimumFractionDigits:0|maximumFractionDigits:0`, new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: code,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}));
}
function serializeNumberFormatOptions(options) {
	return Object.entries(options).toSorted(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)).map(([key, value]) => `${key}:${String(value)}`).join("|");
}
function getEnUsCurrencyFormatter(currency, options) {
	const cacheKey = `en-US|${currency}|${serializeNumberFormatOptions(options)}`;
	const existingFormatter = EN_US_CURRENCY_FORMATTER_CACHE.get(cacheKey);
	if (existingFormatter) return existingFormatter;
	const formatter = instantiateNumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
		...options
	});
	EN_US_CURRENCY_FORMATTER_CACHE.set(cacheKey, formatter);
	return formatter;
}
function formatEnUsCurrency(value, currency = "USD", options = {}) {
	try {
		return getEnUsCurrencyFormatter(currency, options).format(value);
	} catch {
		return getEnUsCurrencyFormatter("USD", options).format(value);
	}
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatCurrency(value, currency = "USD", options = {}) {
	return formatEnUsCurrency(value, currency, options);
}
/**
* Normalizes input strings before validation/storage.
* This is not HTML sanitization and must not be relied on for XSS protection.
*/
function isDisallowedInputChar(char) {
	const code = char.charCodeAt(0);
	return code <= 8 || code === 11 || code === 12 || code >= 14 && code <= 31 || code === 127;
}
function sanitizeInput(value) {
	if (typeof value !== "string") return value;
	return [...value].filter((char) => !isDisallowedInputChar(char)).join("").trim();
}
/**
* Sanitize a value for CSV export to prevent formula injection.
* Prefixes values starting with =, +, -, or @ with a single quote.
*/
function sanitizeCsvValue(value) {
	if (value === null || value === void 0) return "";
	const stringValue = String(value);
	if (/^[=+\-@\t\r]/.test(stringValue)) return `'${stringValue}`;
	return stringValue;
}
function coerceNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}
/**
* Validates a file for upload.
* Checks for allowed MIME types and maximum file size.
*/
function validateFile(file, options = {}) {
	const { allowedTypes, maxSizeMb = 5 } = options;
	const maxSizeBytes = maxSizeMb * 1024 * 1024;
	if (file.size > maxSizeBytes) return {
		valid: false,
		error: `File size exceeds the maximum limit of ${maxSizeMb}MB`
	};
	if (allowedTypes && allowedTypes.length > 0) {
		if (!allowedTypes.includes(file.type)) return {
			valid: false,
			error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`
		};
	}
	return { valid: true };
}
/**
* Validates if a redirect URL is safe to use.
* Prevents Open Redirect vulnerabilities by ensuring the URL is either:
* 1. A relative path (starts with /)
* 2. An absolute URL matching the application's base URL
*/
function isValidRedirectUrl(url) {
	if (!url) return false;
	if (url.startsWith("/") && !url.startsWith("//")) return true;
	try {
		const appBase = new URL("http://localhost:3000");
		const redirectBase = new URL(url);
		return redirectBase.protocol === appBase.protocol && redirectBase.hostname === appBase.hostname && redirectBase.port === appBase.port;
	} catch {
		return false;
	}
}
/**
* Gets the workspace ID from user data.
* Uses agencyId if available and non-empty, otherwise falls back to user.id.
* Returns null if neither is available.
*/
function getWorkspaceId(user) {
	if (!user) return null;
	if (user.agencyId && user.agencyId.length > 0) return user.agencyId;
	if (user.id && user.id.length > 0) return user.id;
	return null;
}
/**
* Format a date as relative time (e.g., "2 hours ago", "3 days ago")
*/
function formatRelativeTime(date) {
	const diffMs = (/* @__PURE__ */ new Date()).getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1e3);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffDays / 365);
	if (diffSecs < 60) return "just now";
	else if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
	else if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
	else if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
	else if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
	else if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
	else return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}
//#endregion
export { instantiateDateTimeFormat as C, validateFile as S, isValidRedirectUrl as _, EN_US_NUMBER_FORMATTER as a, sanitizeInput as b, cn as c, formatDate as d, formatEnUsCurrency as f, getWorkspaceId as g, formatRelativeTime$1 as h, EN_US_DATETIME_MEDIUM_FORMATTER as i, coerceNumber as l, formatRelativeTime as m, DATE_FORMATS as n, EN_US_NUMBER_MAX_2_FORMATTER as o, formatEnUsCurrencyMaxFractionDigits as p, EN_US_COMPACT_NUMBER_FORMATTER as r, GANTT_SHORT_DATE_FORMATTER as s, AGENT_CHART_WHOLE_NUMBER_FORMATTER as t, formatCurrency as u, parseDate as v, toISO as x, sanitizeCsvValue as y };
