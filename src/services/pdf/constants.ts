/**
 * Shared constants for PDF generation — mirrors the PPTX theme in `pptx/constants.ts`.
 * Colors match the site theme in globals.css and the PPTX deck.
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

// Page dimensions — landscape, 16:9 aspect ratio (matches PPTX LAYOUT_WIDE)
// jsPDF uses points (pt) by default. 1 inch = 72pt.
// 13.333in × 7.5in → 960pt × 540pt
export const PAGE_W = 960;
export const PAGE_H = 540;
export const MARGIN = 43;          // ~0.6in
export const CONTENT_W = PAGE_W - MARGIN * 2;  // 874
export const HEADER_H = 72;        // ~1.0in
export const FOOTER_H = 29;        // ~0.4in
export const BODY_TOP = HEADER_H + 11;  // ~1.15in → 83
export const BODY_BOTTOM = PAGE_H - FOOTER_H;  // 511
export const BODY_H = BODY_BOTTOM - BODY_TOP;  // ~428

// Font sizes (pt) — tuned for landscape deck readability
export const FONT = {
    title: 36,        // title slide main heading
    subtitle: 14,     // title slide subtitle
    sectionNum: 64,   // section divider big number
    sectionTitle: 28, // section divider title
    headerTitle: 20,  // content slide header
    slideNum: 22,     // header slide number badge
    body: 13,         // body text / bullets
    bodySmall: 11,    // secondary body text
    metricValue: 24,  // metric callout value
    metricLabel: 10,  // metric callout label
    callout: 13,      // callout box text
    tocTitle: 14,     // TOC entry title
    tocDesc: 11,      // TOC entry description
    tocNum: 18,       // TOC entry number
    tableHeader: 12,  // table header text
    tableCell: 11,    // table cell text
    footer: 8,        // footer text
    panelLabel: 9,    // sidebar/panel label
    panelValue: 13,   // sidebar/panel value
    panelBigValue: 22,// sidebar big number
} as const;
