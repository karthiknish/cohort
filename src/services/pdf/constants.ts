/**
 * Shared constants for PDF generation — A4 portrait proposal document.
 *
 * Colors match the site theme in globals.css and the PPTX deck.
 * Page dimensions are A4 portrait (595.28 × 841.89 pt) for print-ready output.
 */

// jsPDF uses RGB tuples (0–255). Hex values from pptx/constants.ts are converted here.
export const COLORS = {
    primary: [37, 99, 235] as const,        // #2563EB blue-600 — headers, titles
    primaryDark: [29, 78, 216] as const,    // #1D4ED8 blue-700 — dark overlays
    secondary: [14, 165, 233] as const,     // #0EA5E9 sky-500 — secondary accent
    accent: [59, 130, 246] as const,        // #3B82F6 blue-500 — highlights
    accentLight: [147, 197, 253] as const,  // #93C5FD blue-300 — light accent
    success: [22, 163, 74] as const,        // #16A34A green-600
    warning: [245, 158, 11] as const,       // #F59E0B amber-500
    danger: [220, 38, 38] as const,         // #DC2626 red-600
    dark: [15, 23, 42] as const,            // #0F172A slate-900 — body text
    white: [255, 255, 255] as const,
    light: [241, 245, 249] as const,        // #F1F5F9 slate-100 — slide background
    cardBg: [255, 255, 255] as const,
    muted: [100, 116, 139] as const,        // #64748B slate-500 — secondary text
    mutedLight: [226, 232, 240] as const,   // #E2E8F0 slate-200 — borders
} as const;

// A4 portrait dimensions (points)
// 210mm × 297mm → 595.28pt × 841.89pt
export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const MARGIN = 48;                    // ~17mm
export const CONTENT_W = PAGE_W - MARGIN * 2; // ~499pt
export const HEADER_H = 64;                  // compact header for portrait
export const FOOTER_H = 32;                  // footer
export const BODY_TOP = HEADER_H + 16;       // 80
export const BODY_BOTTOM = PAGE_H - FOOTER_H; // ~810
export const BODY_H = BODY_BOTTOM - BODY_TOP; // ~730

// Font sizes (pt) — tuned for A4 portrait readability
export const FONT = {
    title: 32,        // title slide main heading
    subtitle: 13,     // title slide subtitle
    sectionNum: 56,   // section divider big number
    sectionTitle: 24, // section divider title
    headerTitle: 18,  // content slide header
    slideNum: 18,     // header slide number badge
    body: 12,         // body text / bullets
    bodySmall: 10,    // secondary body text
    metricValue: 22,  // metric callout value
    metricLabel: 9,   // metric callout label
    callout: 12,      // callout box text
    tocTitle: 13,     // TOC entry title
    tocDesc: 10,      // TOC entry description
    tocNum: 16,       // TOC entry number
    tableHeader: 11,  // table header text
    tableCell: 10,    // table cell text
    footer: 8,        // footer text
    panelLabel: 9,    // sidebar/panel label
    panelValue: 12,   // sidebar/panel value
    panelBigValue: 20,// sidebar big number
} as const;
