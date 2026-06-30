/**
 * Shared constants for PPTX generation — colors, fonts, dimensions.
 * Matches the site theme in globals.css.
 */

export const COLORS = {
    primary: '2563EB',       // blue-600 — headers, titles, bar charts
    primaryDark: '1D4ED8',   // blue-700 — dark overlays
    secondary: '0EA5E9',     // sky-500 — secondary accent
    accent: '3B82F6',        // blue-500 — highlights
    accentLight: '93C5FD',   // blue-300 — light accent
    success: '16A34A',       // green-600
    warning: 'F59E0B',       // amber-500
    danger: 'DC2626',        // red-600
    dark: '0F172A',          // slate-900 — body text
    white: 'FFFFFF',
    light: 'F1F5F9',         // slate-100 — slide background
    cardBg: 'FFFFFF',
    muted: '64748B',         // slate-500 — secondary text
    mutedLight: 'E2E8F0',    // slate-200 — borders
    chartColors: ['2563EB', '0EA5E9', '3B82F6', '16A34A', '8B5CF6'],
    chartGrid: 'E2E8F0',     // slate-200 — gridline color
} as const;

// Geist Variable isn't available in PowerPoint — Segoe UI is the closest
// system font (standard on Windows, widely available in PowerPoint)
export const FONT = 'Segoe UI';
export const FONT_LIGHT = 'Segoe UI Semibold';

// Slide dimensions (LAYOUT_WIDE equivalent)
export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;
export const MARGIN = 0.6;
export const CONTENT_W = SLIDE_W - MARGIN * 2; // 12.13
export const HEADER_H = 1.0;
export const FOOTER_H = 0.4;
export const BODY_TOP = HEADER_H + 0.15; // 1.15
export const BODY_BOTTOM = SLIDE_H - FOOTER_H; // 7.1
export const BODY_H = BODY_BOTTOM - BODY_TOP; // ~5.95
