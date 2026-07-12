/**
 * Parse AI-generated slide instructions into structured slide content.
 *
 * Handles multiple formats the AI may produce:
 *   **Slide 1: Title**       (markdown bold — most common)
 *   Slide 1: Title           (plain)
 *   ## Slide 1: Title        (markdown heading)
 *   Slide 1 - Title          (dash separator)
 *
 * Each slide block may contain:
 *   METRICS: section with "- value: X | label: Y" lines
 *   BULLETS: section with "- point" lines (supports sub-bullets via indentation)
 *   COMPARISON: section with Before:/After: sub-sections
 *   TIMELINE: section with "- phase: N | title: X | detail: Y | duration: Z" lines
 *   QUOTE: single line "text: ... | attribution: ..."
 *   CALLOUT: single-line takeaway
 *   NOTES: single-line presenter talking points
 *   IMAGE: single-line stock photo topic
 */

import type { PptxSlideContent, SlideMetric, SlideComparison, SlideTimelinePhase, SlideQuote } from './types';

function cleanMarkdown(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
}

function parseMetricLine(line: string): SlideMetric | null {
    // Expected: - value: "45%" | label: Expected conversion rate uplift
    const match = line.match(/^-\s*value:\s*["']?(.*?)["']?\s*\|\s*label:\s*(.*)$/i);
    if (!match || !match[1] || !match[2]) return null;
    return { value: match[1].trim(), label: match[2].trim() };
}

function parseComparisonSection(lines: string[], startIndex: number): { comparison: SlideComparison; nextIndex: number } | null {
    const before: string[] = [];
    const after: string[] = [];
    let i = startIndex;
    let currentSection: 'before' | 'after' | null = null;

    while (i < lines.length) {
        const line = lines[i];
        if (!line) { i++; continue; }
        const trimmedLine = line.trim();
        if (!trimmedLine) { i++; continue; }

        // Stop at known section markers
        if (/^(CALLOUT|BULLETS|METRICS|TIMELINE|QUOTE):/i.test(trimmedLine)) break;
        if (/^Slide\s+\d+/i.test(trimmedLine)) break;

        if (/^before\s*:?$/i.test(trimmedLine)) {
            currentSection = 'before';
            i++;
            continue;
        }
        if (/^after\s*:?$/i.test(trimmedLine)) {
            currentSection = 'after';
            i++;
            continue;
        }

        if (trimmedLine.startsWith('-')) {
            const cleaned = cleanMarkdown(trimmedLine.replace(/^\s*[-•*]\s*/, ''));
            if (cleaned) {
                if (currentSection === 'before') before.push(cleaned);
                else if (currentSection === 'after') after.push(cleaned);
            }
        }
        i++;
    }

    if (before.length === 0 && after.length === 0) return null;
    return { comparison: { before, after }, nextIndex: i };
}

function parseTimelineLine(line: string): SlideTimelinePhase | null {
    // Expected: - phase: 1 | title: Foundation | detail: Audit and tracking setup | duration: Weeks 1-4
    const match = line.match(/^-\s*phase:\s*(\d+)\s*\|\s*title:\s*["']?(.*?)["']?\s*\|\s*detail:\s*(.*?)(?:\s*\|\s*duration:\s*(.*))?$/i);
    if (!match || !match[1] || !match[2] || !match[3]) return null;
    return {
        number: parseInt(match[1], 10),
        title: match[2].trim(),
        detail: match[3].trim(),
        ...(match[4] ? { duration: match[4].trim() } : {}),
    };
}

function parseTimelineSection(lines: string[], startIndex: number): { timeline: SlideTimelinePhase[]; nextIndex: number } | null {
    const phases: SlideTimelinePhase[] = [];
    let i = startIndex;
    while (i < lines.length) {
        const rawLine = lines[i];
        if (!rawLine) { i++; continue; }
        const line = rawLine.trim();
        if (!line) { i++; continue; }
        if (/^(CALLOUT|BULLETS|METRICS|COMPARISON|QUOTE):/i.test(line)) break;
        if (/^Slide\s+\d+/i.test(line)) break;
        if (/^-\s*phase:/i.test(line)) {
            const phase = parseTimelineLine(line);
            if (phase) phases.push(phase);
        }
        i++;
    }
    if (phases.length === 0) return null;
    // Sort by phase number and renumber to ensure sequential
    phases.sort((a, b) => a.number - b.number);
    return { timeline: phases, nextIndex: i };
}

function parseQuoteLine(line: string): SlideQuote | null {
    // Expected: QUOTE: text: "..." | attribution: "..."
    const match = line.match(/^text:\s*["']?(.*?)["']?\s*(?:\|\s*attribution:\s*(.*))?$/i);
    if (!match || !match[1]) return null;
    return {
        text: match[1].trim(),
        ...(match[2] ? { attribution: match[2].trim() } : {}),
    };
}

export function parseSlideInstructions(instructions: string): PptxSlideContent[] {
    const blocks = instructions.split(/\n(?=\*{0,2}Slide\s+\d+)/i);
    const slides: PptxSlideContent[] = [];

    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        const lines = trimmed.split(/\r?\n/);
        const headerLine = lines[0] ?? '';

        const titleMatch = headerLine.match(/^\*{0,2}(?:##\s*)?Slide\s+\d+\s*[:\-–]\s*(.*?)\*{0,2}\s*$/i);
        const rawTitle = titleMatch?.[1]?.trim() || headerLine.replace(/^\*+|\*+$/g, '').trim();
        const title = cleanMarkdown(rawTitle);

        const metrics: SlideMetric[] = [];
        const bullets: string[] = [];
        let callout: string | undefined;
        let comparison: SlideComparison | undefined;
        let timeline: SlideTimelinePhase[] | undefined;
        let quote: SlideQuote | undefined;
        let notes: string | undefined;
        let imageTopic: string | undefined;

        let i = 1;
        while (i < lines.length) {
            const rawLine = lines[i];
            if (!rawLine) { i++; continue; }
            const line = rawLine.trim();

            if (!line) { i++; continue; }

            // CALLOUT: line
            const calloutMatch = line.match(/^CALLOUT:\s*(.*)$/i);
            if (calloutMatch && calloutMatch[1]) {
                callout = cleanMarkdown(calloutMatch[1]);
                i++;
                continue;
            }

            // NOTES: line — speaker notes for the presenter
            const notesMatch = line.match(/^NOTES:\s*(.*)$/i);
            if (notesMatch && notesMatch[1]) {
                notes = cleanMarkdown(notesMatch[1]);
                i++;
                continue;
            }

            // IMAGE: line — AI-suggested image topic
            const imageMatch = line.match(/^IMAGE:\s*(.*)$/i);
            if (imageMatch && imageMatch[1]) {
                imageTopic = cleanMarkdown(imageMatch[1]);
                i++;
                continue;
            }

            // QUOTE: line — pull-quote or stat-hero
            const quoteMatch = line.match(/^QUOTE:\s*(.*)$/i);
            if (quoteMatch && quoteMatch[1]) {
                const parsed = parseQuoteLine(quoteMatch[1]);
                if (parsed) quote = parsed;
                i++;
                continue;
            }

            // METRICS: section
            if (/^METRICS:\s*$/i.test(line)) {
                i++;
                while (i < lines.length) {
                    const rawMetricLine = lines[i];
                    if (!rawMetricLine) { i++; continue; }
                    const metricLine = rawMetricLine.trim();
                    if (!metricLine) { i++; continue; }
                    if (/^(CALLOUT|BULLETS|COMPARISON|TIMELINE|QUOTE):/i.test(metricLine)) break;
                    if (/^Slide\s+\d+/i.test(metricLine)) break;
                    if (/^-\s*value:/i.test(metricLine)) {
                        const metric = parseMetricLine(metricLine);
                        if (metric) metrics.push(metric);
                    }
                    i++;
                }
                continue;
            }

            // COMPARISON: section
            if (/^COMPARISON:\s*$/i.test(line)) {
                const result = parseComparisonSection(lines, i + 1);
                if (result) {
                    comparison = result.comparison;
                    i = result.nextIndex;
                } else {
                    i++;
                }
                continue;
            }

            // TIMELINE: section
            if (/^TIMELINE:\s*$/i.test(line)) {
                const result = parseTimelineSection(lines, i + 1);
                if (result) {
                    timeline = result.timeline;
                    i = result.nextIndex;
                } else {
                    i++;
                }
                continue;
            }

            // BULLETS: section
            if (/^BULLETS:\s*$/i.test(line)) {
                i++;
                while (i < lines.length) {
                    const rawBulletLine = lines[i];
                    if (!rawBulletLine) { i++; continue; }
                    const bulletLine = rawBulletLine.trim();
                    if (!bulletLine) { i++; continue; }
                    if (/^(CALLOUT|METRICS|COMPARISON|TIMELINE|QUOTE):/i.test(bulletLine)) break;
                    if (/^Slide\s+\d+/i.test(bulletLine)) break;
                    if (bulletLine.startsWith('-') || bulletLine.startsWith('•') || bulletLine.startsWith('*')) {
                        const cleaned = cleanMarkdown(bulletLine.replace(/^\s*[-•*]\s*/, ''));
                        if (cleaned) bullets.push(cleaned);
                    }
                    i++;
                }
                continue;
            }

            // Fallback: treat as a bullet if it starts with a bullet marker
            if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                const cleaned = cleanMarkdown(line.replace(/^\s*[-•*]\s*/, ''));
                if (cleaned) bullets.push(cleaned);
            }

            i++;
        }

        if (title || bullets.length > 0 || metrics.length > 0 || timeline || quote) {
            slides.push({
                title: title || 'Slide',
                bullets,
                ...(metrics.length > 0 ? { metrics } : {}),
                ...(callout ? { callout } : {}),
                ...(comparison ? { comparison } : {}),
                ...(timeline ? { timeline } : {}),
                ...(quote ? { quote } : {}),
                ...(notes ? { notes } : {}),
                ...(imageTopic ? { imageTopic } : {}),
            });
        }
    }

    return slides;
}

/** Parse a budget string like "£7,500" or "5k" into a number. */
export function parseBudgetAmount(budget: string): number | null {
    if (!budget) return null;
    const match = budget.match(/[\d,]+(?:\.\d+)?/);
    if (!match) return null;
    const num = parseFloat(match[0].replace(/,/g, ''));
    if (isNaN(num)) return null;
    if (/k$/i.test(budget)) return num * 1000;
    return num;
}

export type CurrencySymbol = '£' | '$' | '€' | '₹';

/** Detect the currency symbol from a budget string. Defaults to £. */
export function detectCurrency(budget: string): CurrencySymbol {
    if (!budget) return '£';
    if (budget.includes('$')) return '$';
    if (budget.includes('€')) return '€';
    if (budget.includes('₹')) return '₹';
    if (budget.includes('£')) return '£';
    return '£';
}

/** Format a number with the given currency symbol and locale. */
export function formatCurrency(amount: number, symbol: CurrencySymbol = '£'): string {
    const locale = symbol === '$' ? 'en-US' : symbol === '€' ? 'en-IE' : symbol === '₹' ? 'en-IN' : 'en-GB';
    return `${symbol}${amount.toLocaleString(locale)}`;
}

/** Extract a short keyword from a slide title for the sidebar label. */
export function sidebarKeyword(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('company') || lower.includes('about') || lower.includes('overview')) return 'company';
    if (lower.includes('market') || lower.includes('advertis') || lower.includes('channel')) return 'marketing';
    if (lower.includes('goal') || lower.includes('objective') || lower.includes('target')) return 'goals';
    if (lower.includes('scope') || lower.includes('service') || lower.includes('deliver')) return 'scope';
    if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('phase') || lower.includes('roadmap') || lower.includes('execution')) return 'timeline';
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('invest')) return 'budget';
    if (lower.includes('roi') || lower.includes('return') || lower.includes('projection')) return 'roi';
    if (lower.includes('strategy') || lower.includes('approach') || lower.includes('plan')) return 'strategy';
    if (lower.includes('challenge') || lower.includes('problem') || lower.includes('barrier')) return 'challenges';
    if (lower.includes('audience') || lower.includes('customer') || lower.includes('persona')) return 'audience';
    if (lower.includes('creative') || lower.includes('design') || lower.includes('content')) return 'creative';
    if (lower.includes('next') || lower.includes('step') || lower.includes('action')) return 'next';
    if (lower.includes('risk') || lower.includes('mitigat')) return 'challenges';
    if (lower.includes('team') || lower.includes('credential') || lower.includes('partner')) return 'company';
    if (lower.includes('measure') || lower.includes('report') || lower.includes('kpis') || lower.includes('tracking')) return 'goals';
    if (lower.includes('optim') || lower.includes('test') || lower.includes('experiment')) return 'strategy';
    return 'default';
}
