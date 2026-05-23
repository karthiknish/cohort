'use client'

import { exportCohortsSpreadsheet, ensureXlsxFilename } from '@/lib/export/cohorts-spreadsheet'
import type { SpreadsheetChartSpec } from '@/lib/export/cohorts-spreadsheet-charts'

export async function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[],
  options?: {
    title?: string
    subtitle?: string
    metadata?: Record<string, string>
    charts?: SpreadsheetChartSpec[]
  },
) {
  if (!data.length) return

  await exportCohortsSpreadsheet({
    data,
    filename: ensureXlsxFilename(filename),
    columns,
    title: options?.title,
    subtitle: options?.subtitle,
    metadata: options?.metadata,
    charts: options?.charts,
  })
}

/** Branded Excel export (preferred over legacy CSV naming). */
export const exportToSpreadsheet = exportToCsv
