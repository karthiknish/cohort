import { describe, expect, it, vi } from 'vitest';
import type * as CohortsSpreadsheetChartsModule from './cohorts-spreadsheet-charts';
import { buildAnalyticsExportCharts } from './cohorts-spreadsheet-charts';
import { buildCohortsSpreadsheetWorkbook, ensureXlsxFilename } from './cohorts-spreadsheet';
vi.mock('./cohorts-spreadsheet-charts', async (importOriginal) => {
    const actual = await importOriginal<typeof CohortsSpreadsheetChartsModule>();
    return {
        ...actual,
        renderSpreadsheetCharts: (specs: Parameters<typeof actual.renderSpreadsheetCharts>[0]) => actual.filterMeaningfulCharts(specs).map((spec) => ({
            title: spec.title,
            base64: 'AAAA',
            width: 640,
            height: 320,
        })),
    };
});
describe('ensureXlsxFilename', () => {
    it('normalizes csv filenames to xlsx', () => {
        expect(ensureXlsxFilename('tasks-export.csv')).toBe('tasks-export.xlsx');
    });
    it('keeps xlsx extension', () => {
        expect(ensureXlsxFilename('analytics-export.xlsx')).toBe('analytics-export.xlsx');
    });
    it('adds xlsx extension when missing', () => {
        expect(ensureXlsxFilename('client-overview')).toBe('client-overview.xlsx');
    });
});
describe('buildCohortsSpreadsheetWorkbook', () => {
    it('puts tabular data on sheet 1 and charts on sheet 2', async () => {
        const charts = buildAnalyticsExportCharts([
            {
                date: '2026-05-01',
                platform: 'google',
                spend: 10,
                revenue: 20,
                impressions: 100,
                clicks: 10,
                conversions: 2,
            },
            {
                date: '2026-05-02',
                platform: 'google',
                spend: 15,
                revenue: 25,
                impressions: 120,
                clicks: 12,
                conversions: 3,
            },
            {
                date: '2026-05-03',
                platform: 'meta',
                spend: 5,
                revenue: 8,
                impressions: 80,
                clicks: 6,
                conversions: 1,
            },
        ]);
        const workbook = await buildCohortsSpreadsheetWorkbook({
            title: 'Analytics export',
            sheetName: 'Analytics',
            headers: ['Date', 'Spend', 'Revenue'],
            rows: [
                ['2026-05-01', '10.00', '20.00'],
                ['2026-05-02', '15.00', '25.00'],
                ['2026-05-03', '5.00', '8.00'],
            ],
            charts,
        });
        expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Analytics', 'Charts']);
        expect(workbook.getWorksheet('Analytics')?.rowCount).toBeGreaterThan(5);
        expect(workbook.getWorksheet('Charts')?.rowCount).toBeGreaterThan(3);
    });
    it('uses a single sheet when no charts are provided', async () => {
        const workbook = await buildCohortsSpreadsheetWorkbook({
            sheetName: 'Tasks',
            headers: ['Title'],
            rows: [['Example task']],
            charts: [],
        });
        expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Tasks']);
    });
});
