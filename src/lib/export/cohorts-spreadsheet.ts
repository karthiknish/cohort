import type ExcelJS from 'exceljs'

import { sanitizeCsvValue } from '@/lib/utils'

import {
  renderSpreadsheetCharts,
  type SpreadsheetChartImage,
  type SpreadsheetChartSpec,
} from './cohorts-spreadsheet-charts'
import { COHORTS_SPREADSHEET_THEME } from './cohorts-spreadsheet-theme'

export type CohortsSpreadsheetColumn<T extends Record<string, unknown> = Record<string, unknown>> = {
  key: keyof T | string
  label: string
  width?: number
}

export type ExportCohortsSpreadsheetOptions<T extends Record<string, unknown>> = {
  data: T[]
  filename: string
  title?: string
  subtitle?: string
  sheetName?: string
  columns?: CohortsSpreadsheetColumn<T>[]
  metadata?: Record<string, string>
  charts?: SpreadsheetChartSpec[]
}

export type SpreadsheetExtraTable = {
  title: string
  headers: string[]
  rows: Array<Array<string | number | boolean | null | undefined>>
}

export type ExportCohortsSpreadsheetRowsOptions = {
  filename: string
  title?: string
  subtitle?: string
  sheetName?: string
  headers: string[]
  rows: Array<Array<string | number | boolean | null | undefined>>
  extraTables?: SpreadsheetExtraTable[]
  metadata?: Record<string, string>
  charts?: SpreadsheetChartSpec[]
}

export function ensureXlsxFilename(filename: string): string {
  const trimmed = filename.trim()
  if (!trimmed) return 'cohorts-export.xlsx'
  const normalized = trimmed.replace(/\.(csv|xlsx)$/i, '.xlsx')
  return normalized.endsWith('.xlsx') ? normalized : `${normalized}.xlsx`
}

function sanitizeSpreadsheetCell(value: unknown): string {
  return sanitizeCsvValue(value)
}

function resolveColumns<T extends Record<string, unknown>>(
  data: T[],
  columns?: CohortsSpreadsheetColumn<T>[],
): CohortsSpreadsheetColumn<T>[] {
  if (columns && columns.length > 0) return columns
  const firstRow = data[0]
  if (!firstRow) return []

  return Object.keys(firstRow).map((key) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
  }))
}

function applyFill(cell: ExcelJS.Cell, argb: string) {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb },
  }
}

function applyBorder(cell: ExcelJS.Cell) {
  const color = { argb: COHORTS_SPREADSHEET_THEME.colors.border }
  cell.border = {
    top: { style: 'thin', color },
    left: { style: 'thin', color },
    bottom: { style: 'thin', color },
    right: { style: 'thin', color },
  }
}

function buildMetadataLines(metadata?: Record<string, string>): string[] {
  if (!metadata) return []
  return Object.entries(metadata).flatMap(([key, value]) =>
    value.trim().length > 0 ? [`${key}: ${value}`] : [],
  )
}

/** Reserve enough row height so floating chart images do not cover the data table above. */
function chartImageRowSpan(chartHeight: number): number {
  return Math.max(Math.ceil(chartHeight / 16) + 3, 16)
}

function embedWorksheetCharts(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  charts: SpreadsheetChartImage[],
  columnCount: number,
  startRow: number,
): number {
  if (charts.length === 0) return startRow

  const theme = COHORTS_SPREADSHEET_THEME
  let currentRow = startRow

  worksheet.mergeCells(currentRow, 1, currentRow, columnCount)
  const sectionCell = worksheet.getCell(currentRow, 1)
  sectionCell.value = 'Visual summary (optional charts)'
  sectionCell.font = { ...theme.fonts.title, color: { argb: theme.colors.foreground } }
  sectionCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(currentRow).height = 22
  currentRow += 1

  for (const chart of charts) {
    const rowSpan = chartImageRowSpan(chart.height)

    for (let offset = 0; offset < rowSpan; offset += 1) {
      worksheet.getRow(currentRow + offset).height = 18
    }

    const imageId = workbook.addImage({
      base64: chart.base64,
      extension: 'png',
    })

    worksheet.addImage(imageId, {
      tl: { col: 0, row: currentRow - 1 },
      ext: { width: chart.width, height: chart.height },
    })

    currentRow += rowSpan + 2
  }

  return currentRow + 1
}

async function loadExcelJS() {
  const module = await import('exceljs')
  return module.default
}

function writeTableSection(
  worksheet: ExcelJS.Worksheet,
  columnCount: number,
  headers: string[],
  rows: string[][],
  startRow: number,
): number {
  const theme = COHORTS_SPREADSHEET_THEME
  const headerRowIndex = startRow

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(headerRowIndex, index + 1)
    cell.value = header
    cell.font = { ...theme.fonts.header, color: { argb: theme.colors.primaryForeground } }
    applyFill(cell, theme.colors.primary)
    applyBorder(cell)
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  })
  worksheet.getRow(headerRowIndex).height = 22

  rows.forEach((rowValues, rowOffset) => {
    const rowIndex = headerRowIndex + 1 + rowOffset
    const stripe = rowOffset % 2 === 1 ? theme.colors.muted : theme.colors.white

    rowValues.forEach((value, columnIndex) => {
      const cell = worksheet.getCell(rowIndex, columnIndex + 1)
      cell.value = value
      cell.font = { ...theme.fonts.body, color: { argb: theme.colors.foreground } }
      applyFill(cell, stripe)
      applyBorder(cell)
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true }
    })
  })

  return headerRowIndex + rows.length
}

async function buildBrandedWorkbook({
  title,
  subtitle,
  sheetName,
  headers,
  rows,
  extraTables = [],
  metadata,
  charts = [],
}: {
  title?: string
  subtitle?: string
  sheetName?: string
  headers: string[]
  rows: string[][]
  extraTables?: SpreadsheetExtraTable[]
  metadata?: Record<string, string>
  charts?: SpreadsheetChartSpec[]
}): Promise<ExcelJS.Workbook> {
  const ExcelJS = await loadExcelJS()
  const workbook = new ExcelJS.Workbook()
  workbook.creator = COHORTS_SPREADSHEET_THEME.brandName
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(sheetName?.slice(0, 31) || 'Export')

  const columnCount = Math.max(headers.length, 1)
  const theme = COHORTS_SPREADSHEET_THEME

  worksheet.mergeCells(1, 1, 1, columnCount)
  const brandCell = worksheet.getCell(1, 1)
  brandCell.value = theme.brandName
  brandCell.font = { ...theme.fonts.brand, color: { argb: theme.colors.primaryForeground } }
  applyFill(brandCell, theme.colors.primary)
  brandCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  worksheet.getRow(1).height = 30

  let currentRow = 2

  if (title?.trim()) {
    worksheet.mergeCells(currentRow, 1, currentRow, columnCount)
    const titleCell = worksheet.getCell(currentRow, 1)
    titleCell.value = title.trim()
    titleCell.font = { ...theme.fonts.title, color: { argb: theme.colors.foreground } }
    titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    worksheet.getRow(currentRow).height = 22
    currentRow += 1
  }

  const metaLines = [
    ...(subtitle?.trim() ? [subtitle.trim()] : []),
    `Exported ${new Date().toLocaleString()}`,
    ...buildMetadataLines(metadata),
  ]

  for (const line of metaLines) {
    worksheet.mergeCells(currentRow, 1, currentRow, columnCount)
    const metaCell = worksheet.getCell(currentRow, 1)
    metaCell.value = line
    metaCell.font = { ...theme.fonts.subtitle, color: { argb: theme.colors.mutedForeground } }
    metaCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    currentRow += 1
  }

  const headerRowIndex = currentRow + 1
  const lastDataRow = writeTableSection(worksheet, columnCount, headers, rows, headerRowIndex)

  let nextRow = lastDataRow + 2

  for (const table of extraTables) {
    worksheet.mergeCells(nextRow, 1, nextRow, columnCount)
    const tableTitleCell = worksheet.getCell(nextRow, 1)
    tableTitleCell.value = table.title
    tableTitleCell.font = { ...theme.fonts.title, color: { argb: theme.colors.foreground } }
    tableTitleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
    worksheet.getRow(nextRow).height = 22
    nextRow += 1

    const sanitizedExtraRows = table.rows.map((row) =>
      row.map((value) => sanitizeSpreadsheetCell(value)),
    )
    nextRow = writeTableSection(worksheet, columnCount, table.headers, sanitizedExtraRows, nextRow) + 2
  }

  const maxColumns = Math.max(
    columnCount,
    ...extraTables.map((table) => table.headers.length),
  )

  for (let index = 0; index < maxColumns; index += 1) {
    const column = worksheet.getColumn(index + 1)
    let maxCellLength = headers[index]?.length ?? 0

    for (const row of rows) {
      maxCellLength = Math.max(maxCellLength, String(row[index] ?? '').length)
    }

    for (const table of extraTables) {
      maxCellLength = Math.max(maxCellLength, table.headers[index]?.length ?? 0)
      for (const row of table.rows) {
        maxCellLength = Math.max(maxCellLength, String(row[index] ?? '').length)
      }
    }

    column.width = Math.min(Math.max(maxCellLength + 4, 12), 48)
  }

  let footerRowIndex = nextRow
  worksheet.mergeCells(footerRowIndex, 1, footerRowIndex, columnCount)
  const footerCell = worksheet.getCell(footerRowIndex, 1)
  footerCell.value = `Prepared in ${theme.brandName}`
  footerCell.font = { ...theme.fonts.footer, color: { argb: theme.colors.mutedForeground } }
  footerCell.alignment = { horizontal: 'left', indent: 1 }

  const chartImages = renderSpreadsheetCharts(charts)
  if (chartImages.length > 0) {
    footerRowIndex = embedWorksheetCharts(
      workbook,
      worksheet,
      chartImages,
      columnCount,
      footerRowIndex + 2,
    )
  }

  worksheet.views = [
    {
      state: 'frozen',
      ySplit: headerRowIndex,
      activeCell: `A${headerRowIndex + 1}`,
    },
  ]

  return workbook
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = ensureXlsxFilename(filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportCohortsSpreadsheetRows(
  options: ExportCohortsSpreadsheetRowsOptions,
): Promise<void> {
  const { headers, rows, filename, title, subtitle, sheetName, extraTables, metadata, charts } = options
  if (headers.length === 0) return

  const sanitizedRows = rows.map((row) =>
    row.map((value) => sanitizeSpreadsheetCell(value)),
  )

  const sanitizedExtraTables = extraTables?.map((table) => ({
    title: table.title,
    headers: table.headers,
    rows: table.rows.map((row) => row.map((value) => sanitizeSpreadsheetCell(value))),
  }))

  const workbook = await buildBrandedWorkbook({
    title,
    subtitle,
    sheetName,
    headers,
    rows: sanitizedRows,
    extraTables: sanitizedExtraTables,
    metadata,
    charts,
  })

  await downloadWorkbook(workbook, filename)
}

export async function exportCohortsSpreadsheet<T extends Record<string, unknown>>(
  options: ExportCohortsSpreadsheetOptions<T>,
): Promise<void> {
  const { data, filename, title, subtitle, sheetName, columns, metadata, charts } = options
  if (data.length === 0) return

  const resolvedColumns = resolveColumns(data, columns)
  if (resolvedColumns.length === 0) return

  const headers = resolvedColumns.map((column) => column.label)
  const rows = data.map((row) =>
    resolvedColumns.map((column) => sanitizeSpreadsheetCell(row[column.key as keyof T])),
  )

  await exportCohortsSpreadsheetRows({
    filename,
    title,
    subtitle,
    sheetName,
    headers,
    rows,
    metadata,
    charts,
  })
}
