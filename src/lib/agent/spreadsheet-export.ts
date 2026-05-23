import type { SpreadsheetChartSpec } from '@/lib/export/cohorts-spreadsheet-charts'
import { ensureXlsxFilename } from '@/lib/export/cohorts-spreadsheet'

export type AgentSpreadsheetExtraTable = {
  title: string
  headers: string[]
  rows: string[][]
}

/** JSON-serializable workbook descriptor returned by agent export operations. */
export type AgentSpreadsheetExportPayload = {
  filename: string
  title: string
  subtitle?: string
  sheetName?: string
  headers: string[]
  rows: string[][]
  extraTables?: AgentSpreadsheetExtraTable[]
  metadata?: Record<string, string>
  charts?: SpreadsheetChartSpec[]
}

export function parseAgentSpreadsheetExport(
  data: Record<string, unknown> | undefined,
): AgentSpreadsheetExportPayload | null {
  const raw = data?.spreadsheetExport
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const record = raw as Record<string, unknown>
  const filename = typeof record.filename === 'string' ? record.filename.trim() : ''
  const title = typeof record.title === 'string' ? record.title.trim() : ''
  const headers = Array.isArray(record.headers)
    ? record.headers.filter((value): value is string => typeof value === 'string')
    : []
  const rows = Array.isArray(record.rows)
    ? record.rows.flatMap((row) => {
        if (!Array.isArray(row)) return []
        return [row.map((cell) => (cell === null || cell === undefined ? '' : String(cell)))]
      })
    : []

  if (!filename || !title || headers.length === 0) return null

  const subtitle = typeof record.subtitle === 'string' ? record.subtitle : undefined
  const sheetName = typeof record.sheetName === 'string' ? record.sheetName : undefined

  const extraTables = Array.isArray(record.extraTables)
    ? record.extraTables.flatMap((table) => {
        if (!table || typeof table !== 'object' || Array.isArray(table)) return []
        const entry = table as Record<string, unknown>
        const tableTitle = typeof entry.title === 'string' ? entry.title : ''
        const tableHeaders = Array.isArray(entry.headers)
          ? entry.headers.filter((value): value is string => typeof value === 'string')
          : []
        const tableRows = Array.isArray(entry.rows)
          ? entry.rows.flatMap((row) => {
              if (!Array.isArray(row)) return []
              return [row.map((cell) => (cell === null || cell === undefined ? '' : String(cell)))]
            })
          : []
        if (!tableTitle || tableHeaders.length === 0) return []
        return [{ title: tableTitle, headers: tableHeaders, rows: tableRows }]
      })
    : undefined

  const metadata =
    record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)
      ? Object.fromEntries(
          Object.entries(record.metadata as Record<string, unknown>).flatMap(([key, value]) => {
            if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
              return []
            }
            return [[key, String(value)]]
          }),
        )
      : undefined

  const charts = Array.isArray(record.charts) ? (record.charts as SpreadsheetChartSpec[]) : undefined

  return {
    filename: ensureXlsxFilename(filename),
    title,
    subtitle,
    sheetName,
    headers,
    rows,
    extraTables,
    metadata,
    charts,
  }
}

export async function downloadAgentSpreadsheetExport(
  payload: AgentSpreadsheetExportPayload,
): Promise<void> {
  const { exportCohortsSpreadsheetRows } = await import('@/lib/export/cohorts-spreadsheet')
  await exportCohortsSpreadsheetRows({
    filename: payload.filename,
    title: payload.title,
    subtitle: payload.subtitle,
    sheetName: payload.sheetName,
    headers: payload.headers,
    rows: payload.rows,
    extraTables: payload.extraTables,
    metadata: payload.metadata,
    charts: payload.charts,
  })
}
