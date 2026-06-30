import type { PreviewTone } from './types';
export const PREVIEW_DOT_PATTERN = {
    backgroundImage: 'radial-gradient(rgb(from var(--primary) r g b / 0.08) 1px, transparent 1px)',
    backgroundSize: '18px 18px',
} as const;
export const AUTO_ROTATE_MS = 5200;
export const TONE_BADGE: Record<PreviewTone, string> = {
    success: 'border-success/30 bg-success/10 text-success',
    warning: 'border-warning/30 bg-warning/10 text-warning',
    info: 'border-info/30 bg-info/10 text-info',
    accent: 'border-accent/30 bg-accent/10 text-primary',
};
export const BOUNCE_DOT_STYLES = [
    { id: 'mini-bounce-1', style: { animationDelay: '0ms' } },
    { id: 'mini-bounce-2', style: { animationDelay: '150ms' } },
    { id: 'mini-bounce-3', style: { animationDelay: '300ms' } },
] as const;
export const WINDOW_STATUS_DOTS = [
    { id: 'window-close', className: 'bg-destructive' },
    { id: 'window-minimize', className: 'bg-warning' },
    { id: 'window-expand', className: 'bg-success' },
] as const;
export const ATTENDEE_COLORS: Record<string, string> = {
    JL: 'bg-primary',
    SR: 'bg-secondary',
    KP: 'bg-info',
    MA: 'bg-success',
    DW: 'bg-foreground',
};
