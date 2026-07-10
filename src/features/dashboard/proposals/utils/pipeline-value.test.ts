import { describe, expect, it } from 'vitest';
import { formatPipelineValue, parseProposalPipelineValue } from './pipeline-value';

describe('parseProposalPipelineValue', () => {
    it('parses pound-formatted proposal size ranges from the wizard', () => {
        expect(parseProposalPipelineValue('£2,000 – £5,000')).toBe(5_000);
        expect(parseProposalPipelineValue('£5,000 – £10,000')).toBe(10_000);
        expect(parseProposalPipelineValue('£10,000+')).toBe(10_000);
    });

    it('parses dollar shorthand ranges from preview data', () => {
        expect(parseProposalPipelineValue('$10k - $25k')).toBe(25_000);
        expect(parseProposalPipelineValue('$25k - $50k')).toBe(50_000);
    });

    it('returns zero for empty or unparseable values', () => {
        expect(parseProposalPipelineValue('')).toBe(0);
        expect(parseProposalPipelineValue(undefined)).toBe(0);
        expect(parseProposalPipelineValue('Not specified')).toBe(0);
    });
});

describe('formatPipelineValue', () => {
    it('formats large totals for the metrics card', () => {
        expect(formatPipelineValue(80_000)).toBe('$80k');
        expect(formatPipelineValue(1_500_000)).toBe('$1.5m');
        expect(formatPipelineValue(0)).toBe('$0');
    });
});
