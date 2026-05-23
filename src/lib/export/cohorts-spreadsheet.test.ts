import { describe, expect, it } from 'vitest'

import { ensureXlsxFilename } from './cohorts-spreadsheet'

describe('ensureXlsxFilename', () => {
  it('normalizes csv filenames to xlsx', () => {
    expect(ensureXlsxFilename('tasks-export.csv')).toBe('tasks-export.xlsx')
  })

  it('keeps xlsx extension', () => {
    expect(ensureXlsxFilename('analytics-export.xlsx')).toBe('analytics-export.xlsx')
  })

  it('adds xlsx extension when missing', () => {
    expect(ensureXlsxFilename('client-overview')).toBe('client-overview.xlsx')
  })
})
