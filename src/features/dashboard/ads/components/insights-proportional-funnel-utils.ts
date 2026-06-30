const MIN_VISUAL_WIDTH_PCT = 20;
const MAX_VISUAL_WIDTH_PCT = 100;
/**
 * Log-scaled widths so 19k impressions → few conversions still forms a readable funnel
 * (raw linear widths collapse the bottom into a needle).
 */
export function computeFunnelVisualWidths(values: number[]): number[] {
    const top = values[0] ?? 0;
    if (top <= 0) {
        return values.map(() => 0);
    }
    return values.map((value, index) => {
        if (index === 0) {
            return MAX_VISUAL_WIDTH_PCT;
        }
        if (value <= 0) {
            return MIN_VISUAL_WIDTH_PCT;
        }
        const logRatio = Math.log10(value + 1) / Math.log10(top + 1);
        const scaled = logRatio * MAX_VISUAL_WIDTH_PCT;
        return Math.max(MIN_VISUAL_WIDTH_PCT, Math.min(MAX_VISUAL_WIDTH_PCT, scaled));
    });
}
