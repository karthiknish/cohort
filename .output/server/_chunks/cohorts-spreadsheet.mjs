import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { c as sanitizeCsvValue } from "./utils.mjs";
import { t as CHART_COLORS } from "./colors.mjs";
//#region src/lib/export/cohorts-spreadsheet-chart-specs.ts
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
//#endregion
//#region src/lib/export/cohorts-spreadsheet-theme.ts
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
//#endregion
//#region src/lib/export/cohorts-spreadsheet-chart-render.ts
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
//#region src/lib/export/cohorts-spreadsheet.ts
var cohorts_spreadsheet_exports = /* @__PURE__ */ __exportAll({
	buildCohortsSpreadsheetWorkbook: () => buildCohortsSpreadsheetWorkbook,
	ensureXlsxFilename: () => ensureXlsxFilename,
	exportCohortsSpreadsheet: () => exportCohortsSpreadsheet,
	exportCohortsSpreadsheetRows: () => exportCohortsSpreadsheetRows,
	workbookToXlsxBlob: () => workbookToXlsxBlob
});
var DEFAULT_DATA_SHEET_NAME = "Data";
var DEFAULT_CHARTS_SHEET_NAME = "Charts";
function ensureXlsxFilename(filename) {
	const trimmed = filename.trim();
	if (!trimmed) return "cohorts-export.xlsx";
	const normalized = trimmed.replace(/\.(csv|xlsx)$/i, ".xlsx");
	return normalized.endsWith(".xlsx") ? normalized : `${normalized}.xlsx`;
}
function sanitizeSpreadsheetCell(value) {
	return sanitizeCsvValue(value);
}
function resolveColumns(data, columns) {
	if (columns && columns.length > 0) return columns;
	const firstRow = data[0];
	if (!firstRow) return [];
	return Object.keys(firstRow).map((key) => ({
		key,
		label: key.charAt(0).toUpperCase() + key.slice(1)
	}));
}
function applyFill(cell, argb) {
	cell.fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb }
	};
}
function applyBorder(cell) {
	const color = { argb: COHORTS_SPREADSHEET_THEME.colors.border };
	cell.border = {
		top: {
			style: "thin",
			color
		},
		left: {
			style: "thin",
			color
		},
		bottom: {
			style: "thin",
			color
		},
		right: {
			style: "thin",
			color
		}
	};
}
function buildMetadataLines(metadata) {
	if (!metadata) return [];
	return Object.entries(metadata).flatMap(([key, value]) => value.trim().length > 0 ? [`${key}: ${value}`] : []);
}
/** Reserve enough row height so floating chart images do not cover the data table above. */
function chartImageRowSpan(chartHeight) {
	return Math.max(Math.ceil(chartHeight / 16) + 3, 16);
}
function embedWorksheetCharts(workbook, worksheet, charts, columnCount, startRow) {
	if (charts.length === 0) return startRow;
	let currentRow = startRow;
	for (const chart of charts) {
		const rowSpan = chartImageRowSpan(chart.height);
		for (let offset = 0; offset < rowSpan; offset += 1) worksheet.getRow(currentRow + offset).height = 18;
		const imageId = workbook.addImage({
			base64: chart.base64,
			extension: "png"
		});
		worksheet.addImage(imageId, {
			tl: {
				col: 0,
				row: currentRow - 1
			},
			ext: {
				width: chart.width,
				height: chart.height
			}
		});
		currentRow += rowSpan + 2;
	}
	return currentRow + 1;
}
function buildChartsWorksheetHeader(worksheet, columnCount, options) {
	const theme = COHORTS_SPREADSHEET_THEME;
	let currentRow = 1;
	worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
	const brandCell = worksheet.getCell(currentRow, 1);
	brandCell.value = theme.brandName;
	brandCell.font = {
		...theme.fonts.brand,
		color: { argb: theme.colors.primaryForeground }
	};
	applyFill(brandCell, theme.colors.primary);
	brandCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1
	};
	worksheet.getRow(currentRow).height = 30;
	currentRow += 1;
	worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
	const titleCell = worksheet.getCell(currentRow, 1);
	titleCell.value = options.title?.trim() || "Visual summary";
	titleCell.font = {
		...theme.fonts.title,
		color: { argb: theme.colors.foreground }
	};
	titleCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1
	};
	worksheet.getRow(currentRow).height = 22;
	currentRow += 1;
	const metaLines = [
		`Numeric data is on the "${options.dataSheetName}" sheet.`,
		options.subtitle?.trim(),
		`${options.chartCount} chart${options.chartCount === 1 ? "" : "s"} generated from export data.`,
		`Exported ${(/* @__PURE__ */ new Date()).toLocaleString()}`,
		...buildMetadataLines(options.metadata)
	].filter((line) => Boolean(line?.trim()));
	for (const line of metaLines) {
		worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
		const metaCell = worksheet.getCell(currentRow, 1);
		metaCell.value = line;
		metaCell.font = {
			...theme.fonts.subtitle,
			color: { argb: theme.colors.mutedForeground }
		};
		metaCell.alignment = {
			vertical: "middle",
			horizontal: "left",
			indent: 1
		};
		currentRow += 1;
	}
	return currentRow + 1;
}
async function loadExcelJS() {
	return (await import("../_libs/exceljs+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t(), 1))).default;
}
function writeTableSection(worksheet, columnCount, headers, rows, startRow) {
	const theme = COHORTS_SPREADSHEET_THEME;
	const headerRowIndex = startRow;
	headers.forEach((header, index) => {
		const cell = worksheet.getCell(headerRowIndex, index + 1);
		cell.value = header;
		cell.font = {
			...theme.fonts.header,
			color: { argb: theme.colors.primaryForeground }
		};
		applyFill(cell, theme.colors.primary);
		applyBorder(cell);
		cell.alignment = {
			vertical: "middle",
			horizontal: "left",
			indent: 1
		};
	});
	worksheet.getRow(headerRowIndex).height = 22;
	rows.forEach((rowValues, rowOffset) => {
		const rowIndex = headerRowIndex + 1 + rowOffset;
		const zebraFill = rowOffset % 2 === 1 ? theme.colors.muted : theme.colors.white;
		rowValues.forEach((value, columnIndex) => {
			const cell = worksheet.getCell(rowIndex, columnIndex + 1);
			cell.value = value;
			cell.font = {
				...theme.fonts.body,
				color: { argb: theme.colors.foreground }
			};
			applyFill(cell, zebraFill);
			applyBorder(cell);
			cell.alignment = {
				vertical: "middle",
				horizontal: "left",
				indent: 1,
				wrapText: true
			};
		});
	});
	return headerRowIndex + rows.length;
}
async function buildBrandedWorkbook({ title, subtitle, sheetName, chartsSheetName, headers, rows, extraTables = [], metadata, charts = [] }) {
	const workbook = new (await (loadExcelJS())).Workbook();
	workbook.creator = COHORTS_SPREADSHEET_THEME.brandName;
	workbook.created = /* @__PURE__ */ new Date();
	const dataSheetName = sheetName?.slice(0, 31) || DEFAULT_DATA_SHEET_NAME;
	const resolvedChartsSheetName = chartsSheetName?.slice(0, 31) || DEFAULT_CHARTS_SHEET_NAME;
	const chartImages = renderSpreadsheetCharts(charts);
	const worksheet = workbook.addWorksheet(dataSheetName);
	const columnCount = Math.max(headers.length, 1);
	const theme = COHORTS_SPREADSHEET_THEME;
	worksheet.mergeCells(1, 1, 1, columnCount);
	const brandCell = worksheet.getCell(1, 1);
	brandCell.value = theme.brandName;
	brandCell.font = {
		...theme.fonts.brand,
		color: { argb: theme.colors.primaryForeground }
	};
	applyFill(brandCell, theme.colors.primary);
	brandCell.alignment = {
		vertical: "middle",
		horizontal: "left",
		indent: 1
	};
	worksheet.getRow(1).height = 30;
	let currentRow = 2;
	if (title?.trim()) {
		worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
		const titleCell = worksheet.getCell(currentRow, 1);
		titleCell.value = title.trim();
		titleCell.font = {
			...theme.fonts.title,
			color: { argb: theme.colors.foreground }
		};
		titleCell.alignment = {
			vertical: "middle",
			horizontal: "left",
			indent: 1
		};
		worksheet.getRow(currentRow).height = 22;
		currentRow += 1;
	}
	const metaLines = [
		...subtitle?.trim() ? [subtitle.trim()] : [],
		`Exported ${(/* @__PURE__ */ new Date()).toLocaleString()}`,
		...buildMetadataLines(metadata)
	];
	for (const line of metaLines) {
		worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
		const metaCell = worksheet.getCell(currentRow, 1);
		metaCell.value = line;
		metaCell.font = {
			...theme.fonts.subtitle,
			color: { argb: theme.colors.mutedForeground }
		};
		metaCell.alignment = {
			vertical: "middle",
			horizontal: "left",
			indent: 1
		};
		currentRow += 1;
	}
	const headerRowIndex = currentRow + 1;
	let nextRow = writeTableSection(worksheet, columnCount, headers, rows, headerRowIndex) + 2;
	for (const table of extraTables) {
		worksheet.mergeCells(nextRow, 1, nextRow, columnCount);
		const tableTitleCell = worksheet.getCell(nextRow, 1);
		tableTitleCell.value = table.title;
		tableTitleCell.font = {
			...theme.fonts.title,
			color: { argb: theme.colors.foreground }
		};
		tableTitleCell.alignment = {
			vertical: "middle",
			horizontal: "left",
			indent: 1
		};
		worksheet.getRow(nextRow).height = 22;
		nextRow += 1;
		const sanitizedExtraRows = table.rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value)));
		nextRow = writeTableSection(worksheet, columnCount, table.headers, sanitizedExtraRows, nextRow) + 2;
	}
	const maxColumns = Math.max(columnCount, ...extraTables.map((table) => table.headers.length));
	for (let index = 0; index < maxColumns; index += 1) {
		const column = worksheet.getColumn(index + 1);
		let maxCellLength = headers[index]?.length ?? 0;
		for (const row of rows) maxCellLength = Math.max(maxCellLength, String(row[index] ?? "").length);
		for (const table of extraTables) {
			maxCellLength = Math.max(maxCellLength, table.headers[index]?.length ?? 0);
			for (const row of table.rows) maxCellLength = Math.max(maxCellLength, String(row[index] ?? "").length);
		}
		column.width = Math.min(Math.max(maxCellLength + 4, 12), 48);
	}
	const footerRowIndex = nextRow;
	worksheet.mergeCells(footerRowIndex, 1, footerRowIndex, columnCount);
	const footerCell = worksheet.getCell(footerRowIndex, 1);
	footerCell.value = chartImages.length > 0 ? `Prepared in ${theme.brandName} — see "${resolvedChartsSheetName}" for charts` : `Prepared in ${theme.brandName}`;
	footerCell.font = {
		...theme.fonts.footer,
		color: { argb: theme.colors.mutedForeground }
	};
	footerCell.alignment = {
		horizontal: "left",
		indent: 1
	};
	worksheet.views = [{
		state: "frozen",
		ySplit: headerRowIndex,
		activeCell: `A${headerRowIndex + 1}`
	}];
	if (chartImages.length > 0) {
		const chartsColumnCount = 8;
		const chartsWorksheet = workbook.addWorksheet(resolvedChartsSheetName === dataSheetName ? DEFAULT_CHARTS_SHEET_NAME : resolvedChartsSheetName);
		embedWorksheetCharts(workbook, chartsWorksheet, chartImages, chartsColumnCount, buildChartsWorksheetHeader(chartsWorksheet, chartsColumnCount, {
			dataSheetName,
			title: title ? `${title} — charts` : void 0,
			subtitle,
			metadata,
			chartCount: chartImages.length
		}));
		for (let index = 0; index < chartsColumnCount; index += 1) chartsWorksheet.getColumn(index + 1).width = 14;
		chartsWorksheet.views = [{
			state: "frozen",
			ySplit: 1,
			activeCell: "A2"
		}];
	}
	return workbook;
}
async function workbookToXlsxBlob(workbook) {
	const buffer = await workbook.xlsx.writeBuffer();
	return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
async function downloadWorkbook(workbook, filename) {
	const blob = await workbookToXlsxBlob(workbook);
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = ensureXlsxFilename(filename);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
/** Build a branded workbook in memory (data sheet + optional charts sheet). */
async function buildCohortsSpreadsheetWorkbook(options) {
	const { headers, rows, title, subtitle, sheetName, chartsSheetName, extraTables, metadata, charts } = options;
	if (headers.length === 0) return new (await (loadExcelJS())).Workbook();
	const sanitizedRows = rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value)));
	const sanitizedExtraTables = extraTables?.map((table) => ({
		title: table.title,
		headers: table.headers,
		rows: table.rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value)))
	}));
	return buildBrandedWorkbook({
		title,
		subtitle,
		sheetName,
		chartsSheetName,
		headers,
		rows: sanitizedRows,
		extraTables: sanitizedExtraTables,
		metadata,
		charts
	});
}
async function exportCohortsSpreadsheetRows(options) {
	const { headers, rows, filename, title, subtitle, sheetName, chartsSheetName, extraTables, metadata, charts } = options;
	if (headers.length === 0) return;
	await downloadWorkbook(await buildCohortsSpreadsheetWorkbook({
		title,
		subtitle,
		sheetName,
		chartsSheetName,
		headers,
		rows,
		extraTables,
		metadata,
		charts
	}), filename);
}
async function exportCohortsSpreadsheet(options) {
	const { data, filename, title, subtitle, sheetName, columns, metadata, charts } = options;
	if (data.length === 0) return;
	const resolvedColumns = resolveColumns(data, columns);
	if (resolvedColumns.length === 0) return;
	await exportCohortsSpreadsheetRows({
		filename,
		title,
		subtitle,
		sheetName,
		headers: resolvedColumns.map((column) => column.label),
		rows: data.map((row) => resolvedColumns.map((column) => sanitizeSpreadsheetCell(row[column.key]))),
		metadata,
		charts
	});
}
//#endregion
export { exportCohortsSpreadsheetRows as a, buildAnalyticsExportCharts as c, filterMeaningfulCharts as d, exportCohortsSpreadsheet as i, buildCategoryCountChart as l, cohorts_spreadsheet_exports as n, workbookToXlsxBlob as o, ensureXlsxFilename as r, buildAdsMetricsCharts as s, buildCohortsSpreadsheetWorkbook as t, buildCollaborationExportCharts as u };
