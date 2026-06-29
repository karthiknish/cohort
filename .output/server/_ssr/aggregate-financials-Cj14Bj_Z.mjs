//#region node_modules/.nitro/vite/services/ssr/assets/aggregate-financials-Cj14Bj_Z.js
/**
* Determine financial comparability across a collection of currency labels.
*
* null / undefined entries are treated as "unknown" (legacy rows written before currency
* stamping was introduced). Unknown rows do NOT make comparability non-single — only
* rows with genuinely DIFFERENT known currencies do.
*
* - single_currency: all known rows share the same currency (unknowns assumed same)
* - mixed_currency: known rows have two or more distinct currencies
* - unknown_currency: no known currency in the set at all
*/
function assessComparability(currencies) {
	const unique = /* @__PURE__ */ new Set();
	for (const c of currencies) {
		const cleaned = cleanCurrency(c);
		if (cleaned) unique.add(cleaned);
	}
	if (unique.size === 0) return "unknown_currency";
	if (unique.size > 1) return "mixed_currency";
	return "single_currency";
}
/** Upper-case and trim a currency code. Returns null for empty/non-string. */
function cleanCurrency(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim().toUpperCase();
	return trimmed.length > 0 ? trimmed : null;
}
/**
* Aggregate delivery + financial totals from metric rows using the same
* comparability rules as the Convex V2 read model.
*/
function aggregateMetricFinancials(rows) {
	const deliveryTotals = {
		impressions: 0,
		clicks: 0,
		conversions: 0
	};
	const byCurrency = {};
	const currencyList = [];
	for (const row of rows) {
		deliveryTotals.impressions += Number(row.impressions ?? 0);
		deliveryTotals.clicks += Number(row.clicks ?? 0);
		deliveryTotals.conversions += Number(row.conversions ?? 0);
		const currency = cleanCurrency(row.currency);
		currencyList.push(currency);
		const bucketKey = currency ?? "__unknown__";
		const bucket = byCurrency[bucketKey] ?? {
			spend: 0,
			revenue: 0
		};
		bucket.spend += Number(row.spend ?? 0);
		bucket.revenue += Number(row.revenue ?? 0);
		byCurrency[bucketKey] = bucket;
	}
	const comparability = assessComparability(currencyList);
	const visibleByCurrency = Object.fromEntries(Object.entries(byCurrency).filter(([key]) => key !== "__unknown__"));
	const knownCurrencies = Object.keys(visibleByCurrency);
	const primaryCurrency = knownCurrencies.length === 1 ? knownCurrencies[0] : null;
	return {
		deliveryTotals,
		financialTotals: {
			comparability,
			totalsByCurrency: visibleByCurrency,
			primaryCurrency,
			spend: comparability === "single_currency" && primaryCurrency ? visibleByCurrency[primaryCurrency]?.spend ?? 0 : null,
			revenue: comparability === "single_currency" && primaryCurrency ? visibleByCurrency[primaryCurrency]?.revenue ?? 0 : null
		}
	};
}
function formatAggregatedMoney(amount, financial, format) {
	if (amount === null || amount === void 0) return "—";
	if (financial.comparability === "single_currency" && financial.primaryCurrency) return format(amount, financial.primaryCurrency);
	if (financial.comparability === "mixed_currency") return "Multi-currency";
	return "—";
}
function financialTotalsHelper(financial, fallback) {
	if (financial.comparability === "single_currency" && financial.primaryCurrency) return fallback;
	if (financial.comparability === "mixed_currency") {
		const codes = Object.keys(financial.totalsByCurrency);
		return codes.length > 0 ? `Totals split across ${codes.join(", ")} — not combined` : "Multiple currencies — totals are not combined";
	}
	if (financial.comparability === "unknown_currency") return "Currency unknown for synced rows";
	return fallback;
}
function isFinancialComparable(comparability) {
	return comparability === "single_currency";
}
//#endregion
export { isFinancialComparable as i, financialTotalsHelper as n, formatAggregatedMoney as r, aggregateMetricFinancials as t };
