//#region src/lib/metrics/formula-engine.ts
var FALLBACK_BENCHMARKS = {
	cpa: 50,
	roas: 3,
	ctr: .02,
	cpc: 2,
	cpm: 10,
	conversionRate: .03,
	profitMargin: .2
};
var INDUSTRY_ROAS_BY_PROVIDER = {
	google: 3,
	facebook: 2.5,
	linkedin: 3,
	tiktok: 2
};
function median(values) {
	const filtered = values.filter((v) => Number.isFinite(v));
	if (filtered.length === 0) return null;
	const sorted = filtered.toSorted((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 1) return sorted[mid];
	return (sorted[mid - 1] + sorted[mid]) / 2;
}
function safeRatio(numerator, denominator) {
	if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
	const result = numerator / denominator;
	return Number.isFinite(result) ? result : null;
}
/**
* Calculates UI-facing benchmarks from historical metrics.
*
* - Uses per-day blended KPI medians as the primary benchmark.
* - Includes platform benchmarks (vs blended average) using existing logic.
* - Includes ROAS comparisons vs a configurable industry baseline.
*/
function calculateBenchmarks(metrics) {
	if (metrics.length === 0) return {
		benchmarks: Object.keys(FALLBACK_BENCHMARKS).map((metric) => ({
			metric,
			value: FALLBACK_BENCHMARKS[metric],
			source: "fallback"
		})),
		platformBenchmarks: [],
		roasIndustryComparisons: []
	};
	const byDate = /* @__PURE__ */ new Map();
	for (const m of metrics) {
		const existing = byDate.get(m.date) ?? {
			spend: 0,
			revenue: 0,
			conversions: 0,
			clicks: 0,
			impressions: 0
		};
		existing.spend += m.spend;
		existing.revenue += m.revenue;
		existing.conversions += m.conversions;
		existing.clicks += m.clicks;
		existing.impressions += m.impressions;
		byDate.set(m.date, existing);
	}
	const dailyCpa = [];
	const dailyRoas = [];
	const dailyCtr = [];
	const dailyCpc = [];
	const dailyCpm = [];
	const dailyConversionRate = [];
	const dailyProfitMargin = [];
	for (const totals of byDate.values()) {
		const roas = safeRatio(totals.revenue, totals.spend);
		if (roas !== null) dailyRoas.push(roas);
		const cpa = safeRatio(totals.spend, totals.conversions);
		if (cpa !== null) dailyCpa.push(cpa);
		const ctr = safeRatio(totals.clicks, totals.impressions);
		if (ctr !== null) dailyCtr.push(ctr);
		const cpc = safeRatio(totals.spend, totals.clicks);
		if (cpc !== null) dailyCpc.push(cpc);
		const cpm = safeRatio(totals.spend * 1e3, totals.impressions);
		if (cpm !== null) dailyCpm.push(cpm);
		const conversionRate = safeRatio(totals.conversions, totals.clicks);
		if (conversionRate !== null) dailyConversionRate.push(conversionRate);
		const profitMargin = safeRatio(totals.revenue - totals.spend, totals.revenue);
		if (profitMargin !== null) dailyProfitMargin.push(profitMargin);
	}
	const computed = {
		cpa: median(dailyCpa) ?? void 0,
		roas: median(dailyRoas) ?? void 0,
		ctr: median(dailyCtr) ?? void 0,
		cpc: median(dailyCpc) ?? void 0,
		cpm: median(dailyCpm) ?? void 0,
		conversionRate: median(dailyConversionRate) ?? void 0,
		profitMargin: median(dailyProfitMargin) ?? void 0
	};
	const benchmarks = Object.keys(FALLBACK_BENCHMARKS).map((metric) => {
		const value = computed[metric];
		if (typeof value === "number" && Number.isFinite(value) && value > 0) return {
			metric,
			value,
			source: "historical_median"
		};
		return {
			metric,
			value: FALLBACK_BENCHMARKS[metric],
			source: "fallback"
		};
	});
	const platformBenchmarks = calculateCrossplatformBenchmarks(metrics);
	const byProvider = /* @__PURE__ */ new Map();
	for (const m of metrics) {
		const existing = byProvider.get(m.providerId) ?? {
			spend: 0,
			revenue: 0
		};
		existing.spend += m.spend;
		existing.revenue += m.revenue;
		byProvider.set(m.providerId, existing);
	}
	return {
		benchmarks,
		platformBenchmarks,
		roasIndustryComparisons: Array.from(byProvider.entries()).map(([providerId, totals]) => {
			const roas = safeRatio(totals.revenue, totals.spend) ?? 0;
			const industryRoas = INDUSTRY_ROAS_BY_PROVIDER[providerId] ?? null;
			return {
				providerId,
				roas,
				industryRoas,
				vsIndustryPercent: industryRoas && industryRoas > 0 ? (roas - industryRoas) / industryRoas * 100 : null
			};
		})
	};
}
/**
* Calculates platform-level benchmarks and compares to blended average.
*/
function calculateCrossplatformBenchmarks(metrics) {
	if (metrics.length === 0) return [];
	const byProvider = /* @__PURE__ */ new Map();
	for (const m of metrics) {
		const existing = byProvider.get(m.providerId) || [];
		existing.push(m);
		byProvider.set(m.providerId, existing);
	}
	const totalSpend = metrics.reduce((sum, m) => sum + m.spend, 0);
	const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);
	const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
	const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
	const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
	const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
	const blendedCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
	const blendedCtr = totalImpressions > 0 ? totalClicks / totalImpressions * 100 : 0;
	const blendedCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
	const results = [];
	for (const [providerId, providerMetrics] of byProvider) {
		const pSpend = providerMetrics.reduce((sum, m) => sum + m.spend, 0);
		const pRevenue = providerMetrics.reduce((sum, m) => sum + m.revenue, 0);
		const pConversions = providerMetrics.reduce((sum, m) => sum + m.conversions, 0);
		const pClicks = providerMetrics.reduce((sum, m) => sum + m.clicks, 0);
		const pImpressions = providerMetrics.reduce((sum, m) => sum + m.impressions, 0);
		const roas = pSpend > 0 ? pRevenue / pSpend : 0;
		const cpa = pConversions > 0 ? pSpend / pConversions : 0;
		const ctr = pImpressions > 0 ? pClicks / pImpressions * 100 : 0;
		const cpc = pClicks > 0 ? pSpend / pClicks : 0;
		const roasDiff = blendedRoas > 0 ? (roas - blendedRoas) / blendedRoas * 100 : 0;
		const cpaDiff = blendedCpa > 0 ? (cpa - blendedCpa) / blendedCpa * 100 : 0;
		const ctrDiff = blendedCtr > 0 ? (ctr - blendedCtr) / blendedCtr * 100 : 0;
		const cpcDiff = blendedCpc > 0 ? (cpc - blendedCpc) / blendedCpc * 100 : 0;
		results.push({
			providerId,
			metrics: {
				roas,
				cpa,
				ctr,
				cpc
			},
			vsBlendedAverage: {
				roas: roasDiff,
				cpa: cpaDiff,
				ctr: ctrDiff,
				cpc: cpcDiff
			}
		});
	}
	return results;
}
var SUPPORTED_FUNCTIONS = [
	"abs",
	"min",
	"max",
	"round",
	"floor",
	"ceil"
];
var SUPPORTED_FUNCTION_SET = new Set(SUPPORTED_FUNCTIONS);
function tokenizeFormula(formula, inputs) {
	const tokens = [];
	let index = 0;
	while (index < formula.length) {
		const char = formula[index];
		if (!char) break;
		if (/\s/.test(char)) {
			index += 1;
			continue;
		}
		if (/[0-9.]/.test(char)) {
			let end = index + 1;
			while (end < formula.length && /[0-9.]/.test(formula[end] ?? "")) end += 1;
			const rawNumber = formula.slice(index, end);
			if (!/^\d+(?:\.\d+)?$|^\.\d+$/.test(rawNumber)) return null;
			const value = Number(rawNumber);
			if (!Number.isFinite(value)) return null;
			tokens.push({
				type: "number",
				value
			});
			index = end;
			continue;
		}
		if (/[a-zA-Z_]/.test(char)) {
			let end = index + 1;
			while (end < formula.length && /[a-zA-Z0-9_]/.test(formula[end] ?? "")) end += 1;
			const identifier = formula.slice(index, end);
			const normalized = identifier.toLowerCase();
			if (SUPPORTED_FUNCTION_SET.has(normalized)) {
				tokens.push({
					type: "function",
					value: normalized
				});
				index = end;
				continue;
			}
			const inputValue = inputs[identifier];
			if (typeof inputValue !== "number" || !Number.isFinite(inputValue)) return null;
			tokens.push({
				type: "number",
				value: inputValue
			});
			index = end;
			continue;
		}
		if (char === "+" || char === "-" || char === "*" || char === "/") {
			tokens.push({
				type: "operator",
				value: char
			});
			index += 1;
			continue;
		}
		if (char === "(") {
			tokens.push({ type: "leftParen" });
			index += 1;
			continue;
		}
		if (char === ")") {
			tokens.push({ type: "rightParen" });
			index += 1;
			continue;
		}
		if (char === ",") {
			tokens.push({ type: "comma" });
			index += 1;
			continue;
		}
		return null;
	}
	return tokens;
}
var FormulaParser = class {
	constructor(tokens) {
		this.position = 0;
		this.tokens = tokens;
	}
	parse() {
		const value = this.parseExpression();
		if (value === null || this.position !== this.tokens.length || !Number.isFinite(value)) return null;
		return value;
	}
	parseExpression() {
		let value = this.parseTerm();
		if (value === null) return null;
		while (true) {
			const token = this.peek();
			if (!token || token.type !== "operator" || token.value !== "+" && token.value !== "-") break;
			this.position += 1;
			const right = this.parseTerm();
			if (right === null) return null;
			value = token.value === "+" ? value + right : value - right;
		}
		return value;
	}
	parseTerm() {
		let value = this.parseFactor();
		if (value === null) return null;
		while (true) {
			const token = this.peek();
			if (!token || token.type !== "operator" || token.value !== "*" && token.value !== "/") break;
			this.position += 1;
			const right = this.parseFactor();
			if (right === null) return null;
			if (token.value === "/" && right === 0) return null;
			value = token.value === "*" ? value * right : value / right;
		}
		return value;
	}
	parseFactor() {
		const token = this.peek();
		if (!token) return null;
		if (token.type === "operator" && (token.value === "+" || token.value === "-")) {
			this.position += 1;
			const value = this.parseFactor();
			if (value === null) return null;
			return token.value === "-" ? -value : value;
		}
		if (token.type === "number") {
			this.position += 1;
			return token.value;
		}
		if (token.type === "leftParen") {
			this.position += 1;
			const value = this.parseExpression();
			if (value === null) return null;
			const closing = this.peek();
			if (!closing || closing.type !== "rightParen") return null;
			this.position += 1;
			return value;
		}
		if (token.type === "function") return this.parseFunctionCall(token.value);
		return null;
	}
	parseFunctionCall(name) {
		this.position += 1;
		const open = this.peek();
		if (!open || open.type !== "leftParen") return null;
		this.position += 1;
		const args = [];
		const next = this.peek();
		if (!next || next.type === "rightParen") return null;
		while (true) {
			const value = this.parseExpression();
			if (value === null) return null;
			args.push(value);
			const separator = this.peek();
			if (!separator) return null;
			if (separator.type === "comma") {
				this.position += 1;
				continue;
			}
			if (separator.type === "rightParen") {
				this.position += 1;
				break;
			}
			return null;
		}
		return applySupportedFunction(name, args);
	}
	peek() {
		return this.tokens[this.position];
	}
};
function applySupportedFunction(name, args) {
	switch (name) {
		case "abs":
		case "round":
		case "floor":
		case "ceil":
			if (args.length !== 1) return null;
			return Math[name](args[0]);
		case "min":
		case "max":
			if (args.length < 1) return null;
			return Math[name](...args);
		default: return null;
	}
}
/**
* Extract variable names from a formula string
*/
function extractFormulaVariables(formula) {
	const variables = formula.replace(/[0-9.]+/g, " ").replace(/[+\-*/()]/g, " ").split(/\s+/).filter(Boolean).filter((word) => !SUPPORTED_FUNCTIONS.includes(word.toLowerCase()) && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word));
	return [...new Set(variables)];
}
/**
* Safely evaluate a formula with given inputs
*/
function safeEvaluateFormula(formula, inputs) {
	const tokens = tokenizeFormula(formula, inputs);
	if (!tokens || tokens.length === 0) return null;
	const result = new FormulaParser(tokens).parse();
	if (result === null || !Number.isFinite(result)) return null;
	return result;
}
//#endregion
export { extractFormulaVariables as n, safeEvaluateFormula as r, calculateBenchmarks as t };
