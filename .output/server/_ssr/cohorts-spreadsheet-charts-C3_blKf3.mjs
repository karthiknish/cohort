import { t as CHART_COLORS } from "./colors-DH3BrJD1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cohorts-spreadsheet-charts-C3_blKf3.js
var CHART_PADDING = {
	top: 52,
	right: 24,
	bottom: 48,
	left: 56
};
var DEFAULT_COLORS = CHART_COLORS.primary;
var MIN_TOTAL_VALUE = 1e-4;
var MIN_PIE_SLICE_SHARE = .04;
var MAX_EXPORT_CHARTS = 5;
function parseNumeric(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Number(value.replace(/,/g, ""));
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}
function positivePoints(points) {
	return points.filter((point) => Number.isFinite(point.value) && point.value > MIN_TOTAL_VALUE);
}
function sumPointValues(points) {
	return points.reduce((sum, point) => sum + point.value, 0);
}
function computeAxisMax(values) {
	const filtered = values.filter((value) => Number.isFinite(value) && value >= 0);
	const max = filtered.length > 0 ? Math.max(...filtered) : 0;
	if (max <= 0) return 1;
	if (max < 1) return Math.ceil(max * 20) / 20 || .05;
	const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
	const niceMax = Math.ceil(max / magnitude) * magnitude;
	return niceMax > max ? niceMax : max * 1.15;
}
function createAxisValueFormatter(maxValue) {
	if (maxValue < 1) return (value) => value.toLocaleString(void 0, { maximumFractionDigits: 2 });
	if (maxValue < 1e3) return (value) => value.toLocaleString(void 0, { maximumFractionDigits: 1 });
	return (value) => value.toLocaleString(void 0, { maximumFractionDigits: 0 });
}
function meaningfulSeriesPoints(spec, series) {
	return positivePoints(series.points);
}
function isChartSpecMeaningful(spec) {
	const activeSeries = spec.series.flatMap((series) => {
		const points = meaningfulSeriesPoints(spec, series);
		if (points.length === 0 || sumPointValues(points) < MIN_TOTAL_VALUE) return [];
		return [{
			series,
			points
		}];
	});
	if (activeSeries.length === 0) return false;
	switch (spec.kind) {
		case "line":
		case "area": return activeSeries.some(({ points }) => points.length >= 3);
		case "pie":
		case "bar": return activeSeries.some(({ points }) => points.length >= 2);
		default: return activeSeries.some(({ points }) => points.length >= 2);
	}
}
function filterMeaningfulCharts(specs) {
	return specs.filter(isChartSpecMeaningful);
}
function formatFieldLabel(field) {
	return field.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
function collapseSmallPieSlices(points) {
	const positive = positivePoints(points);
	const total = sumPointValues(positive);
	if (total <= 0 || positive.length <= 2) return positive;
	const major = [];
	let otherValue = 0;
	for (const point of positive) if (point.value / total >= MIN_PIE_SLICE_SHARE) major.push(point);
	else otherValue += point.value;
	if (otherValue > MIN_TOTAL_VALUE) major.push({
		label: "Other",
		value: otherValue
	});
	return major.length >= 2 ? major : positive;
}
function truncateLabel(label, max = 14) {
	const trimmed = label.trim();
	if (trimmed.length <= max) return trimmed;
	return `${trimmed.slice(0, max - 1)}…`;
}
function sortByLabel(points) {
	return points.toSorted((a, b) => {
		const aTime = Date.parse(a.label);
		const bTime = Date.parse(b.label);
		if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return aTime - bTime;
		return a.label.localeCompare(b.label);
	});
}
function limitPoints(points, max = 12) {
	if (points.length <= max) return points;
	const sorted = sortByLabel(points);
	const head = sorted.slice(0, max - 1);
	const otherValue = sorted.slice(max - 1).reduce((sum, point) => sum + point.value, 0);
	return [...head, {
		label: "Other",
		value: otherValue
	}];
}
function aggregateByField(rows, labelKey, valueKey) {
	const totals = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const record = row;
		const label = String(record[labelKey] ?? "Unknown").trim() || "Unknown";
		const value = parseNumeric(record[valueKey]);
		totals.set(label, (totals.get(label) ?? 0) + value);
	}
	return limitPoints(Array.from(totals.entries()).map(([label, value]) => ({
		label,
		value
	})), 10);
}
function aggregateByDate(rows, dateKey, valueKey) {
	const totals = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const record = row;
		const label = String(record[dateKey] ?? "").trim();
		if (!label) continue;
		const value = parseNumeric(record[valueKey]);
		totals.set(label, (totals.get(label) ?? 0) + value);
	}
	return sortByLabel(Array.from(totals.entries()).map(([label, value]) => ({
		label,
		value
	})));
}
function buildCategoryCountChart(rows, field, title, kind = "bar") {
	const counts = rows.reduce((map, row) => {
		const label = String(row[field] ?? "Unknown").trim() || "Unknown";
		map.set(label, (map.get(label) ?? 0) + 1);
		return map;
	}, /* @__PURE__ */ new Map());
	const points = positivePoints(limitPoints(Array.from(counts.entries()).map(([label, value]) => ({
		label,
		value
	})), 10));
	if (points.length < 2) return null;
	const spec = {
		title,
		kind,
		series: [{
			name: field,
			points
		}]
	};
	return isChartSpecMeaningful(spec) ? spec : null;
}
function buildTimeSeriesChart(rows, dateField, valueField, title, kind = "line", subtitle) {
	const points = positivePoints(aggregateByDate(rows, dateField, valueField));
	if (points.length < 3) return null;
	const spec = {
		title,
		subtitle,
		kind,
		series: [{
			name: formatFieldLabel(valueField),
			points
		}]
	};
	return isChartSpecMeaningful(spec) ? spec : null;
}
function buildMultiMetricTimeSeriesChart(rows, dateField, valueFields, title, kind = "line", subtitle) {
	const series = valueFields.flatMap((field) => {
		const points = positivePoints(aggregateByDate(rows, dateField, field));
		if (points.length < 3) return [];
		return [{
			name: formatFieldLabel(field),
			points
		}];
	});
	if (series.length === 0) return null;
	const spec = {
		title,
		subtitle,
		kind,
		series
	};
	return isChartSpecMeaningful(spec) ? spec : null;
}
function buildCategoryBreakdownChart(rows, labelField, valueField, title, kind = "bar", subtitle) {
	const rawPoints = positivePoints(aggregateByField(rows, labelField, valueField));
	const points = kind === "pie" ? collapseSmallPieSlices(rawPoints) : rawPoints;
	if (points.length < 2) return null;
	const spec = {
		title,
		subtitle,
		kind,
		series: [{
			name: formatFieldLabel(valueField),
			points
		}]
	};
	return isChartSpecMeaningful(spec) ? spec : null;
}
function buildAnalyticsExportCharts(rows) {
	const charts = [];
	const spendRevenue = buildMultiMetricTimeSeriesChart(rows, "date", ["spend", "revenue"], "Spend vs revenue over time", "line", "Daily totals from export rows");
	if (spendRevenue) charts.push(spendRevenue);
	const delivery = buildMultiMetricTimeSeriesChart(rows, "date", ["impressions", "clicks"], "Delivery volume over time", "area", "Impressions and clicks by day");
	if (delivery) charts.push(delivery);
	const spendTrend = buildTimeSeriesChart(rows, "date", "spend", "Daily spend", "area");
	if (spendTrend && !spendRevenue) charts.push(spendTrend);
	const conversionsTrend = buildTimeSeriesChart(rows, "date", "conversions", "Daily conversions", "line", "Conversion volume by day");
	if (conversionsTrend) charts.push(conversionsTrend);
	const platformChart = buildCategoryBreakdownChart(rows, "platform", "spend", "Spend by platform", "pie", "Share of spend in this export window");
	if (platformChart) charts.push(platformChart);
	return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS);
}
function buildAdsMetricsCharts(rows) {
	const chartRows = rows.map((row) => ({
		date: row.date,
		providerId: row.providerId,
		spend: row.spend,
		impressions: row.impressions ?? 0,
		clicks: row.clicks ?? 0,
		conversions: row.conversions ?? 0,
		revenue: row.revenue ?? 0
	}));
	const charts = [];
	const spendRevenue = buildMultiMetricTimeSeriesChart(chartRows, "date", ["spend", "revenue"], "Spend vs revenue trend", "line", "Daily ad spend and attributed revenue");
	if (spendRevenue) charts.push(spendRevenue);
	const spendTrend = buildTimeSeriesChart(chartRows, "date", "spend", "Daily ad spend", "area", "Total spend per day");
	if (spendTrend && !spendRevenue) charts.push(spendTrend);
	const delivery = buildMultiMetricTimeSeriesChart(chartRows, "date", ["impressions", "clicks"], "Impressions and clicks", "area", "Delivery volume by day");
	if (delivery) charts.push(delivery);
	const conversionsTrend = buildTimeSeriesChart(chartRows, "date", "conversions", "Daily conversions", "line", "Conversion count by day");
	if (conversionsTrend) charts.push(conversionsTrend);
	const providerChart = buildCategoryBreakdownChart(chartRows, "providerId", "spend", "Spend by provider", "pie", "Platform mix for this export");
	if (providerChart) charts.push(providerChart);
	return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS);
}
function buildCollaborationExportCharts(rows) {
	const charts = [];
	const byDay = rows.reduce((map, row) => {
		const rawDate = String(row.date ?? "").trim();
		if (!rawDate) return map;
		const day = rawDate.split(",")[0]?.trim() || rawDate;
		map.set(day, (map.get(day) ?? 0) + 1);
		return map;
	}, /* @__PURE__ */ new Map());
	const activityPoints = positivePoints(sortByLabel(Array.from(byDay.entries()).map(([label, value]) => ({
		label,
		value
	}))));
	if (activityPoints.length >= 3) charts.push({
		title: "Messages over time",
		subtitle: "Daily message volume in this export",
		kind: "line",
		series: [{
			name: "Messages",
			points: activityPoints
		}]
	});
	const senderChart = buildCategoryCountChart(rows, "sender", "Messages by sender", "bar");
	if (senderChart) charts.push({
		...senderChart,
		subtitle: "Top contributors in this channel export"
	});
	return filterMeaningfulCharts(charts).slice(0, MAX_EXPORT_CHARTS);
}
/** Cohorts brand tokens for spreadsheet exports (aligned with src/app/globals.css). */
var COHORTS_SPREADSHEET_THEME = {
	brandName: "Cohorts",
	colors: {
		primary: "FF2563EB",
		primaryForeground: "FFFFFFFF",
		foreground: "FF0F172A",
		mutedForeground: "FF64748B",
		muted: "FFF1F5F9",
		accent: "FFEFF6FF",
		border: "FFE2E8F0",
		white: "FFFFFFFF"
	},
	fonts: {
		brand: {
			name: "Calibri",
			size: 18,
			bold: true
		},
		title: {
			name: "Calibri",
			size: 13,
			bold: true
		},
		subtitle: {
			name: "Calibri",
			size: 10
		},
		header: {
			name: "Calibri",
			size: 11,
			bold: true
		},
		body: {
			name: "Calibri",
			size: 11
		},
		footer: {
			name: "Calibri",
			size: 9,
			italic: true
		}
	}
};
function drawChartFrame(ctx, title, subtitle) {
	const theme = COHORTS_SPREADSHEET_THEME;
	ctx.fillStyle = `#${theme.colors.white.slice(2)}`;
	ctx.fillRect(0, 0, 640, 320);
	ctx.strokeStyle = `#${theme.colors.border.slice(2)}`;
	ctx.lineWidth = 1;
	ctx.strokeRect(.5, .5, 639, 319);
	ctx.fillStyle = `#${theme.colors.foreground.slice(2)}`;
	ctx.font = "bold 16px Calibri, Arial, sans-serif";
	ctx.fillText(title, CHART_PADDING.left, 28);
	if (subtitle?.trim()) {
		ctx.fillStyle = `#${theme.colors.mutedForeground.slice(2)}`;
		ctx.font = "12px Calibri, Arial, sans-serif";
		ctx.fillText(truncateLabel(subtitle.trim(), 72), CHART_PADDING.left, 44);
	}
	ctx.fillStyle = `#${theme.colors.primary.slice(2)}`;
	ctx.fillRect(CHART_PADDING.left, subtitle?.trim() ? 50 : 36, 28, 3);
}
function drawSeriesLegend(ctx, series, plot) {
	if (series.length <= 1) return;
	const theme = COHORTS_SPREADSHEET_THEME;
	ctx.font = "11px Calibri, Arial, sans-serif";
	series.forEach((entry, index) => {
		const color = entry.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
		const x = plot.x + plot.width - 148;
		const y = plot.y + 8 + index * 18;
		ctx.fillStyle = color;
		ctx.fillRect(x, y - 8, 10, 10);
		ctx.fillStyle = `#${theme.colors.foreground.slice(2)}`;
		ctx.fillText(truncateLabel(entry.name, 16), x + 14, y);
	});
}
function getPlotArea() {
	return {
		x: CHART_PADDING.left,
		y: CHART_PADDING.top,
		width: 640 - CHART_PADDING.left - CHART_PADDING.right,
		height: 320 - CHART_PADDING.top - CHART_PADDING.bottom
	};
}
function drawAxes(ctx, labels, maxValue, valueFormatter) {
	const plot = getPlotArea();
	const theme = COHORTS_SPREADSHEET_THEME;
	ctx.strokeStyle = `#${theme.colors.border.slice(2)}`;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(plot.x, plot.y);
	ctx.lineTo(plot.x, plot.y + plot.height);
	ctx.lineTo(plot.x + plot.width, plot.y + plot.height);
	ctx.stroke();
	ctx.fillStyle = `#${theme.colors.mutedForeground.slice(2)}`;
	ctx.font = "11px Calibri, Arial, sans-serif";
	const ticks = 4;
	for (let index = 0; index <= ticks; index += 1) {
		const ratio = index / ticks;
		const value = maxValue * (1 - ratio);
		const y = plot.y + plot.height * ratio;
		ctx.fillText(valueFormatter(value), 8, y + 4);
		ctx.strokeStyle = `#${theme.colors.muted.slice(2)}`;
		ctx.beginPath();
		ctx.moveTo(plot.x, y);
		ctx.lineTo(plot.x + plot.width, y);
		ctx.stroke();
	}
	const step = labels.length > 1 ? plot.width / (labels.length - 1) : plot.width;
	labels.forEach((label, index) => {
		const x = plot.x + step * index;
		ctx.save();
		ctx.translate(x, plot.y + plot.height + 16);
		ctx.rotate(-Math.PI / 6);
		ctx.fillText(truncateLabel(label), 0, 0);
		ctx.restore();
	});
}
function renderLineLikeChart(ctx, spec, filled, valueFormatter) {
	const activeSeries = spec.series.flatMap((series) => {
		const points = sortByLabel(positivePoints(series.points));
		return points.length >= 3 ? [{
			series,
			points
		}] : [];
	});
	if (activeSeries.length === 0) return;
	const labels = Array.from(new Set(activeSeries.flatMap(({ points }) => points.map((point) => point.label)))).toSorted((a, b) => {
		const aTime = Date.parse(a);
		const bTime = Date.parse(b);
		if (!Number.isNaN(aTime) && !Number.isNaN(bTime)) return aTime - bTime;
		return a.localeCompare(b);
	});
	const maxValue = computeAxisMax(activeSeries.flatMap(({ points }) => points.map((point) => point.value)));
	const plot = getPlotArea();
	drawAxes(ctx, labels, maxValue, valueFormatter);
	drawSeriesLegend(ctx, activeSeries.map(({ series }) => series), plot);
	const step = labels.length > 1 ? plot.width / (labels.length - 1) : 0;
	activeSeries.forEach(({ series, points }, seriesIndex) => {
		const color = series.color ?? DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length];
		const valueByLabel = new Map(points.map((point) => [point.label, point.value]));
		const coords = labels.flatMap((label, index) => {
			const value = valueByLabel.get(label);
			if (value === void 0) return [];
			return [{
				x: plot.x + step * index,
				y: plot.y + plot.height - value / maxValue * plot.height
			}];
		});
		if (coords.length < 2) return;
		if (filled && activeSeries.length === 1) {
			ctx.beginPath();
			coords.forEach((coord, index) => {
				if (index === 0) ctx.moveTo(coord.x, coord.y);
				else ctx.lineTo(coord.x, coord.y);
			});
			ctx.lineTo(coords[coords.length - 1]?.x ?? plot.x, plot.y + plot.height);
			ctx.lineTo(coords[0]?.x ?? plot.x, plot.y + plot.height);
			ctx.closePath();
			ctx.fillStyle = `${color}33`;
			ctx.fill();
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 2.5;
		ctx.beginPath();
		coords.forEach((coord, index) => {
			if (index === 0) ctx.moveTo(coord.x, coord.y);
			else ctx.lineTo(coord.x, coord.y);
		});
		ctx.stroke();
		ctx.fillStyle = color;
		coords.forEach((coord) => {
			ctx.beginPath();
			ctx.arc(coord.x, coord.y, 3.5, 0, Math.PI * 2);
			ctx.fill();
		});
	});
}
function renderBarChart(ctx, spec, valueFormatter) {
	const series = spec.series[0];
	if (!series || series.points.length === 0) return;
	const points = positivePoints(series.points);
	if (points.length < 2) return;
	const labels = points.map((point) => point.label);
	const maxValue = computeAxisMax(points.map((point) => point.value));
	const plot = getPlotArea();
	drawAxes(ctx, labels, maxValue, valueFormatter);
	const barWidth = Math.min(42, plot.width / points.length * .65);
	const gap = (plot.width - barWidth * points.length) / Math.max(points.length + 1, 1);
	points.forEach((point, index) => {
		const height = point.value / maxValue * plot.height;
		const x = plot.x + gap + index * (barWidth + gap);
		const y = plot.y + plot.height - height;
		ctx.fillStyle = series.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
		ctx.fillRect(x, y, barWidth, height);
	});
}
function renderPieChart(ctx, spec, valueFormatter) {
	const series = spec.series[0];
	if (!series || series.points.length === 0) return;
	const points = collapseSmallPieSlices(series.points);
	const total = points.reduce((sum, point) => sum + point.value, 0);
	if (total <= 0) return;
	const centerX = CHART_PADDING.left + 110;
	const centerY = CHART_PADDING.top + 110;
	const radius = 88;
	let startAngle = -Math.PI / 2;
	points.forEach((point, index) => {
		const sliceAngle = point.value / total * Math.PI * 2;
		const color = series.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
		ctx.closePath();
		ctx.fillStyle = color;
		ctx.fill();
		startAngle += sliceAngle;
	});
	ctx.fillStyle = `#${COHORTS_SPREADSHEET_THEME.colors.foreground.slice(2)}`;
	ctx.font = "12px Calibri, Arial, sans-serif";
	points.forEach((point, index) => {
		const y = CHART_PADDING.top + 24 + index * 24;
		ctx.fillStyle = DEFAULT_COLORS[index % DEFAULT_COLORS.length];
		ctx.fillRect(260, y - 10, 12, 12);
		ctx.fillStyle = `#${COHORTS_SPREADSHEET_THEME.colors.foreground.slice(2)}`;
		ctx.fillText(`${truncateLabel(point.label, 18)} (${valueFormatter(point.value)})`, 280, y);
	});
}
function renderSpreadsheetChartToBase64(spec) {
	if (typeof document === "undefined") return null;
	if (!spec.series.some((series) => series.points.length > 0)) return null;
	const canvas = document.createElement("canvas");
	canvas.width = 640;
	canvas.height = 320;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	const axisMax = computeAxisMax(spec.series.flatMap((series) => series.points.map((point) => point.value)));
	const valueFormatter = spec.valueFormatter ?? createAxisValueFormatter(axisMax);
	drawChartFrame(ctx, spec.title, spec.subtitle);
	switch (spec.kind) {
		case "line":
			renderLineLikeChart(ctx, spec, false, valueFormatter);
			break;
		case "area":
			renderLineLikeChart(ctx, spec, true, valueFormatter);
			break;
		case "bar":
			renderBarChart(ctx, spec, valueFormatter);
			break;
		case "pie":
			renderPieChart(ctx, spec, valueFormatter);
			break;
		default: return null;
	}
	return canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
}
function renderSpreadsheetCharts(specs) {
	return filterMeaningfulCharts(specs).map((spec) => {
		const base64 = renderSpreadsheetChartToBase64(spec);
		if (!base64) return null;
		return {
			title: spec.title,
			base64,
			width: 640,
			height: 320
		};
	}).filter((chart) => chart !== null);
}
//#endregion
export { buildCollaborationExportCharts as a, buildCategoryCountChart as i, buildAdsMetricsCharts as n, filterMeaningfulCharts as o, buildAnalyticsExportCharts as r, renderSpreadsheetCharts as s, COHORTS_SPREADSHEET_THEME as t };
