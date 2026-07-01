/** Cohorts brand tokens for spreadsheet exports (aligned with src/app/globals.css). */
export const COHORTS_SPREADSHEET_THEME = {
    brandName: 'Cohorts',
    colors: {
        primary: 'FF2563EB',
        primaryDark: 'FF1D4ED8',
        primaryForeground: 'FFFFFFFF',
        secondary: 'FF0EA5E9',
        foreground: 'FF0F172A',
        mutedForeground: 'FF64748B',
        muted: 'FFF1F5F9',
        accent: 'FFEFF6FF',
        accentLight: 'FFDBEAFE',
        border: 'FFE2E8F0',
        white: 'FFFFFFFF',
    },
    fonts: {
        brand: { name: 'Calibri', size: 18, bold: true },
        title: { name: 'Calibri', size: 14, bold: true },
        subtitle: { name: 'Calibri', size: 10 },
        header: { name: 'Calibri', size: 11, bold: true },
        body: { name: 'Calibri', size: 11 },
        footer: { name: 'Calibri', size: 9, italic: true },
    },
} as const;
