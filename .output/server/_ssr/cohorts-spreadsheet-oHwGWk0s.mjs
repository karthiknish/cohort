import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./motion-DtlbbvFg.mjs";
import { y as sanitizeCsvValue } from "./utils-hh4sibN0.mjs";
import { s as renderSpreadsheetCharts, t as COHORTS_SPREADSHEET_THEME } from "./cohorts-spreadsheet-charts-C3_blKf3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cohorts-spreadsheet-oHwGWk0s.js
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
	return (await import("../_libs/exceljs+[...].mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).default;
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
export { exportCohortsSpreadsheetRows as a, exportCohortsSpreadsheet as i, cohorts_spreadsheet_exports as n, workbookToXlsxBlob as o, ensureXlsxFilename as r, buildCohortsSpreadsheetWorkbook as t };
