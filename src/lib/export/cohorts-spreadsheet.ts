import type ExcelJS from 'exceljs';
import { sanitizeCsvValue } from '@/lib/utils';
import { renderSpreadsheetCharts, type SpreadsheetChartImage, type SpreadsheetChartSpec, } from './cohorts-spreadsheet-charts';
import { COHORTS_SPREADSHEET_THEME } from './cohorts-spreadsheet-theme';
import { COHORTS_LOGO_WHITE_BASE64 } from '@/services/pptx/logo-data';
export type CohortsSpreadsheetColumn<T extends Record<string, unknown> = Record<string, unknown>> = {
    key: keyof T | string;
    label: string;
    width?: number;
};
export type ExportCohortsSpreadsheetOptions<T extends Record<string, unknown>> = {
    data: T[];
    filename: string;
    title?: string;
    subtitle?: string;
    sheetName?: string;
    columns?: CohortsSpreadsheetColumn<T>[];
    metadata?: Record<string, string>;
    charts?: SpreadsheetChartSpec[];
};
export type SpreadsheetExtraTable = {
    title: string;
    headers: string[];
    rows: Array<Array<string | number | boolean | null | undefined>>;
};
export type ExportCohortsSpreadsheetRowsOptions = {
    filename: string;
    title?: string;
    subtitle?: string;
    /** Sheet 1 — tabular data only (defaults to "Data"). */
    sheetName?: string;
    /** Sheet 2 — chart images (defaults to "Charts"). */
    chartsSheetName?: string;
    headers: string[];
    rows: Array<Array<string | number | boolean | null | undefined>>;
    extraTables?: SpreadsheetExtraTable[];
    metadata?: Record<string, string>;
    charts?: SpreadsheetChartSpec[];
};
const DEFAULT_DATA_SHEET_NAME = 'Data';
const DEFAULT_CHARTS_SHEET_NAME = 'Charts';
const LOGO_WIDTH = 120;
const LOGO_HEIGHT = 30;
export function ensureXlsxFilename(filename: string): string {
    const trimmed = filename.trim();
    if (!trimmed)
        return 'cohorts-export.xlsx';
    const normalized = trimmed.replace(/\.(csv|xlsx)$/i, '.xlsx');
    return normalized.endsWith('.xlsx') ? normalized : `${normalized}.xlsx`;
}
function sanitizeSpreadsheetCell(value: unknown): string {
    return sanitizeCsvValue(value);
}
function resolveColumns<T extends Record<string, unknown>>(data: T[], columns?: CohortsSpreadsheetColumn<T>[]): CohortsSpreadsheetColumn<T>[] {
    if (columns && columns.length > 0)
        return columns;
    const firstRow = data[0];
    if (!firstRow)
        return [];
    return Object.keys(firstRow).map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
    }));
}
function applyFill(cell: ExcelJS.Cell, argb: string) {
    cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb },
    };
}
function applyBorder(cell: ExcelJS.Cell) {
    const color = { argb: COHORTS_SPREADSHEET_THEME.colors.border };
    cell.border = {
        top: { style: 'thin', color },
        left: { style: 'thin', color },
        bottom: { style: 'thin', color },
        right: { style: 'thin', color },
    };
}
function applyTopBorder(cell: ExcelJS.Cell, argb: string) {
    cell.border = {
        ...cell.border,
        top: { style: 'medium', color: { argb } },
    };
}
function buildMetadataLines(metadata?: Record<string, string>): string[] {
    if (!metadata)
        return [];
    return Object.entries(metadata).flatMap(([key, value]) => value.trim().length > 0 ? [`${key}: ${value}`] : []);
}
/** Detect if a string value is numeric (for right-alignment). */
function isNumericValue(value: string): boolean {
    if (!value || value.trim().length === 0)
        return false;
    const cleaned = value.replace(/[£$,%\s]/g, '');
    return cleaned !== '' && !Number.isNaN(Number(cleaned));
}
/** Reserve enough row height so floating chart images do not cover the data table above. */
function chartImageRowSpan(chartHeight: number): number {
    return Math.max(Math.ceil(chartHeight / 16) + 3, 16);
}
function embedWorksheetCharts(workbook: ExcelJS.Workbook, worksheet: ExcelJS.Worksheet, charts: SpreadsheetChartImage[], columnCount: number, startRow: number): number {
    if (charts.length === 0)
        return startRow;
    let currentRow = startRow;
    for (const chart of charts) {
        const rowSpan = chartImageRowSpan(chart.height);
        for (let offset = 0; offset < rowSpan; offset += 1) {
            worksheet.getRow(currentRow + offset).height = 18;
        }
        const imageId = workbook.addImage({
            base64: chart.base64,
            extension: 'png',
        });
        worksheet.addImage(imageId, {
            tl: { col: 0, row: currentRow - 1 },
            ext: { width: chart.width, height: chart.height },
        });
        currentRow += rowSpan + 2;
    }
    return currentRow + 1;
}
/** Add the Cohorts white logo to the right side of the brand header row. */
function addLogoToHeader(workbook: ExcelJS.Workbook, worksheet: ExcelJS.Worksheet, columnCount: number, row: number): void {
    try {
        const logoBase64 = COHORTS_LOGO_WHITE_BASE64.replace(/^image\/png;base64,/, '');
        const imageId = workbook.addImage({
            base64: logoBase64,
            extension: 'png',
        });
        // Place logo at the right edge of the merged brand row
        const logoCol = Math.max(columnCount - 2, 1);
        worksheet.addImage(imageId, {
            tl: { col: logoCol - 1, row: row - 1 },
            ext: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
        });
    } catch {
        // Logo embedding is non-fatal
    }
}
function buildChartsWorksheetHeader(worksheet: ExcelJS.Worksheet, columnCount: number, options: {
    dataSheetName: string;
    title?: string;
    subtitle?: string;
    metadata?: Record<string, string>;
    chartCount: number;
}): number {
    const theme = COHORTS_SPREADSHEET_THEME;
    let currentRow = 1;
    // Brand header row with primary fill
    worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
    const brandCell = worksheet.getCell(currentRow, 1);
    brandCell.value = theme.brandName;
    brandCell.font = { ...theme.fonts.brand, color: { argb: theme.colors.primaryForeground } };
    applyFill(brandCell, theme.colors.primary);
    brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    worksheet.getRow(currentRow).height = 36;
    currentRow += 1;
    // Accent stripe
    worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
    const stripeCell = worksheet.getCell(currentRow, 1);
    applyFill(stripeCell, theme.colors.secondary);
    worksheet.getRow(currentRow).height = 4;
    currentRow += 1;
    // Title
    if (options.title?.trim()) {
        worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
        const titleCell = worksheet.getCell(currentRow, 1);
        titleCell.value = options.title.trim();
        titleCell.font = { ...theme.fonts.title, color: { argb: theme.colors.foreground } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        worksheet.getRow(currentRow).height = 24;
        currentRow += 1;
    }
    const metaLines = [
        `Numeric data is on the "${options.dataSheetName}" sheet.`,
        options.subtitle?.trim(),
        `${options.chartCount} chart${options.chartCount === 1 ? '' : 's'} generated from export data.`,
        `Exported ${new Date().toLocaleString()}`,
        ...buildMetadataLines(options.metadata),
    ].filter((line): line is string => Boolean(line?.trim()));
    for (const line of metaLines) {
        worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
        const metaCell = worksheet.getCell(currentRow, 1);
        metaCell.value = line;
        metaCell.font = { ...theme.fonts.subtitle, color: { argb: theme.colors.mutedForeground } };
        metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        currentRow += 1;
    }
    return currentRow + 1;
}
async function loadExcelJS() {
    const module = await import('exceljs');
    return module.default;
}
function writeTableSection(worksheet: ExcelJS.Worksheet, columnCount: number, headers: string[], rows: string[][], startRow: number): { lastRow: number; headerRow: number } {
    const theme = COHORTS_SPREADSHEET_THEME;
    const headerRowIndex = startRow;
    headers.forEach((header, index) => {
        const cell = worksheet.getCell(headerRowIndex, index + 1);
        cell.value = header;
        cell.font = { ...theme.fonts.header, color: { argb: theme.colors.primaryForeground } };
        applyFill(cell, theme.colors.primary);
        applyBorder(cell);
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    });
    worksheet.getRow(headerRowIndex).height = 24;
    rows.forEach((rowValues, rowOffset) => {
        const rowIndex = headerRowIndex + 1 + rowOffset;
        const zebraFill = rowOffset % 2 === 1 ? theme.colors.muted : theme.colors.white;
        rowValues.forEach((value, columnIndex) => {
            const cell = worksheet.getCell(rowIndex, columnIndex + 1);
            cell.value = value;
            cell.font = { ...theme.fonts.body, color: { argb: theme.colors.foreground } };
            applyFill(cell, zebraFill);
            applyBorder(cell);
            // Right-align numeric values for better readability
            const numeric = isNumericValue(value);
            cell.alignment = {
                vertical: 'middle',
                horizontal: numeric ? 'right' : 'left',
                indent: numeric ? 0 : 1,
                wrapText: !numeric,
            };
        });
    });
    return { lastRow: headerRowIndex + rows.length, headerRow: headerRowIndex };
}
async function buildBrandedWorkbook({ title, subtitle, sheetName, chartsSheetName, headers, rows, extraTables = [], metadata, charts = [], }: {
    title?: string;
    subtitle?: string;
    sheetName?: string;
    chartsSheetName?: string;
    headers: string[];
    rows: string[][];
    extraTables?: SpreadsheetExtraTable[];
    metadata?: Record<string, string>;
    charts?: SpreadsheetChartSpec[];
}): Promise<ExcelJS.Workbook> {
    const ExcelJS = await loadExcelJS();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = COHORTS_SPREADSHEET_THEME.brandName;
    workbook.created = new Date();
    const dataSheetName = sheetName?.slice(0, 31) || DEFAULT_DATA_SHEET_NAME;
    const resolvedChartsSheetName = chartsSheetName?.slice(0, 31) || DEFAULT_CHARTS_SHEET_NAME;
    const chartImages = renderSpreadsheetCharts(charts);
    const worksheet = workbook.addWorksheet(dataSheetName);
    const columnCount = Math.max(headers.length, 1);
    const theme = COHORTS_SPREADSHEET_THEME;
    // ─── Brand header row ───
    worksheet.mergeCells(1, 1, 1, columnCount);
    const brandCell = worksheet.getCell(1, 1);
    brandCell.value = theme.brandName;
    brandCell.font = { ...theme.fonts.brand, color: { argb: theme.colors.primaryForeground } };
    applyFill(brandCell, theme.colors.primary);
    brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    worksheet.getRow(1).height = 36;
    addLogoToHeader(workbook, worksheet, columnCount, 1);
    let currentRow = 2;
    // ─── Accent stripe ───
    worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
    const stripeCell = worksheet.getCell(currentRow, 1);
    applyFill(stripeCell, theme.colors.secondary);
    worksheet.getRow(currentRow).height = 4;
    currentRow += 1;
    // ─── Title ───
    if (title?.trim()) {
        worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
        const titleCell = worksheet.getCell(currentRow, 1);
        titleCell.value = title.trim();
        titleCell.font = { ...theme.fonts.title, color: { argb: theme.colors.foreground } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        worksheet.getRow(currentRow).height = 24;
        currentRow += 1;
    }
    // ─── Metadata lines ───
    const metaLines = [
        ...(subtitle?.trim() ? [subtitle.trim()] : []),
        `Exported ${new Date().toLocaleString()}`,
        ...buildMetadataLines(metadata),
    ];
    for (const line of metaLines) {
        worksheet.mergeCells(currentRow, 1, currentRow, columnCount);
        const metaCell = worksheet.getCell(currentRow, 1);
        metaCell.value = line;
        metaCell.font = { ...theme.fonts.subtitle, color: { argb: theme.colors.mutedForeground } };
        metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        currentRow += 1;
    }
    // ─── Data table ───
    const headerRowIndex = currentRow + 1;
    const { lastRow, headerRow } = writeTableSection(worksheet, columnCount, headers, rows, headerRowIndex);
    // Auto-filter on the data table
    if (rows.length > 0) {
        const lastColLetter = worksheet.getColumn(columnCount).letter;
        worksheet.autoFilter = {
            from: { row: headerRow, column: 1 },
            to: { row: lastRow, column: columnCount },
        };
    }
    let nextRow = lastRow + 2;
    // ─── Extra tables ───
    for (const table of extraTables) {
        worksheet.mergeCells(nextRow, 1, nextRow, columnCount);
        const tableTitleCell = worksheet.getCell(nextRow, 1);
        tableTitleCell.value = table.title;
        tableTitleCell.font = { ...theme.fonts.title, color: { argb: theme.colors.foreground } };
        tableTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        worksheet.getRow(nextRow).height = 22;
        nextRow += 1;
        const sanitizedExtraRows = table.rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value)));
        const extraResult = writeTableSection(worksheet, columnCount, table.headers, sanitizedExtraRows, nextRow);
        nextRow = extraResult.lastRow + 2;
    }
    // ─── Column widths ───
    const maxColumns = Math.max(columnCount, ...extraTables.map((table) => table.headers.length));
    for (let index = 0; index < maxColumns; index += 1) {
        const column = worksheet.getColumn(index + 1);
        let maxCellLength = headers[index]?.length ?? 0;
        for (const row of rows) {
            maxCellLength = Math.max(maxCellLength, String(row[index] ?? '').length);
        }
        for (const table of extraTables) {
            maxCellLength = Math.max(maxCellLength, table.headers[index]?.length ?? 0);
            for (const row of table.rows) {
                maxCellLength = Math.max(maxCellLength, String(row[index] ?? '').length);
            }
        }
        column.width = Math.min(Math.max(maxCellLength + 4, 12), 48);
    }
    // ─── Footer ───
    const footerRowIndex = nextRow;
    worksheet.mergeCells(footerRowIndex, 1, footerRowIndex, columnCount);
    const footerCell = worksheet.getCell(footerRowIndex, 1);
    footerCell.value =
        chartImages.length > 0
            ? `Prepared in ${theme.brandName} — see "${resolvedChartsSheetName}" for charts`
            : `Prepared in ${theme.brandName}`;
    footerCell.font = { ...theme.fonts.footer, color: { argb: theme.colors.mutedForeground } };
    footerCell.alignment = { horizontal: 'left', indent: 1 };
    // Top border on footer for visual separation
    for (let col = 1; col <= columnCount; col++) {
        applyTopBorder(worksheet.getCell(footerRowIndex, col), theme.colors.border);
    }
    worksheet.views = [
        {
            state: 'frozen',
            ySplit: headerRowIndex,
            activeCell: `A${headerRowIndex + 1}`,
        },
    ];
    // ─── Charts sheet ───
    if (chartImages.length > 0) {
        const chartsColumnCount = 8;
        const chartsWorksheet = workbook.addWorksheet(resolvedChartsSheetName === dataSheetName ? DEFAULT_CHARTS_SHEET_NAME : resolvedChartsSheetName);
        const chartStartRow = buildChartsWorksheetHeader(chartsWorksheet, chartsColumnCount, {
            dataSheetName,
            title: title ? `${title} — charts` : undefined,
            subtitle,
            metadata,
            chartCount: chartImages.length,
        });
        // Add logo to charts sheet header too
        addLogoToHeader(workbook, chartsWorksheet, chartsColumnCount, 1);
        embedWorksheetCharts(workbook, chartsWorksheet, chartImages, chartsColumnCount, chartStartRow);
        for (let index = 0; index < chartsColumnCount; index += 1) {
            chartsWorksheet.getColumn(index + 1).width = 14;
        }
        chartsWorksheet.views = [{ state: 'frozen', ySplit: 3, activeCell: 'A4' }];
    }
    return workbook;
}
export async function workbookToXlsxBlob(workbook: ExcelJS.Workbook): Promise<Blob> {
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}
async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
    const blob = await workbookToXlsxBlob(workbook);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ensureXlsxFilename(filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
/** Build a branded workbook in memory (data sheet + optional charts sheet). */
export async function buildCohortsSpreadsheetWorkbook(options: Omit<ExportCohortsSpreadsheetRowsOptions, 'filename'>): Promise<ExcelJS.Workbook> {
    const { headers, rows, title, subtitle, sheetName, chartsSheetName, extraTables, metadata, charts } = options;
    if (headers.length === 0) {
        const ExcelJS = await loadExcelJS();
        return new ExcelJS.Workbook();
    }
    const sanitizedRows = rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value)));
    const sanitizedExtraTables = extraTables?.map((table) => ({
        title: table.title,
        headers: table.headers,
        rows: table.rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value))),
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
        charts,
    });
}
export async function exportCohortsSpreadsheetRows(options: ExportCohortsSpreadsheetRowsOptions): Promise<void> {
    const { headers, rows, filename, title, subtitle, sheetName, chartsSheetName, extraTables, metadata, charts, } = options;
    if (headers.length === 0)
        return;
    const workbook = await buildCohortsSpreadsheetWorkbook({
        title,
        subtitle,
        sheetName,
        chartsSheetName,
        headers,
        rows,
        extraTables,
        metadata,
        charts,
    });
    await downloadWorkbook(workbook, filename);
}
export async function exportCohortsSpreadsheet<T extends Record<string, unknown>>(options: ExportCohortsSpreadsheetOptions<T>): Promise<void> {
    const { data, filename, title, subtitle, sheetName, columns, metadata, charts } = options;
    if (data.length === 0)
        return;
    const resolvedColumns = resolveColumns(data, columns);
    if (resolvedColumns.length === 0)
        return;
    const headers = resolvedColumns.map((column) => column.label);
    const rows = data.map((row) => resolvedColumns.map((column) => sanitizeSpreadsheetCell(row[column.key as keyof T])));
    await exportCohortsSpreadsheetRows({
        filename,
        title,
        subtitle,
        sheetName,
        headers,
        rows,
        metadata,
        charts,
    });
}
