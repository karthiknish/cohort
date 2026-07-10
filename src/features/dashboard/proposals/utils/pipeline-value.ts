/**
 * Extract the upper-bound monetary value from proposal size strings.
 * Supports preview-style (`$10k - $25k`) and form options (`£5,000 – £10,000`, `£10,000+`).
 */
export function parseProposalPipelineValue(sizeStr: string | null | undefined): number {
    if (typeof sizeStr !== 'string' || sizeStr.trim().length === 0) {
        return 0;
    }

    const amountPattern = /(?:[$£€]\s*)?([\d,]+(?:\.\d+)?)\s*(k|m)?\+?/gi;
    const values: number[] = [];

    for (const match of sizeStr.matchAll(amountPattern)) {
        const rawNumber = match[1]?.replace(/,/g, '');
        if (!rawNumber) continue;

        const num = Number.parseFloat(rawNumber);
        if (!Number.isFinite(num)) continue;

        const suffix = match[2]?.toLowerCase();
        if (suffix === 'k') {
            values.push(num * 1_000);
        } else if (suffix === 'm') {
            values.push(num * 1_000_000);
        } else {
            values.push(num);
        }
    }

    return values.length > 0 ? Math.max(...values) : 0;
}

export function formatPipelineValue(val: number): string {
    if (typeof val !== 'number' || Number.isNaN(val) || val <= 0) {
        return '$0';
    }
    if (val >= 1_000_000) {
        return `$${(val / 1_000_000).toFixed(1)}m`;
    }
    if (val >= 1_000) {
        return `$${Math.round(val / 1_000)}k`;
    }
    return `$${Math.round(val)}`;
}
