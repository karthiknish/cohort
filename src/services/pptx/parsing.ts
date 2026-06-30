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
 *   BULLETS: section with "- point" lines
 *   COMPARISON: section with Before:/After: sub-sections
 *   CALLOUT: single-line takeaway
 */

import type { PptxSlideContent, SlideMetric, SlideComparison } from './types';

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
        if (/^(CALLOUT|BULLETS|METRICS):/i.test(trimmedLine)) break;
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

            // METRICS: section
            if (/^METRICS:\s*$/i.test(line)) {
                i++;
                while (i < lines.length) {
                    const rawMetricLine = lines[i];
                    if (!rawMetricLine) { i++; continue; }
                    const metricLine = rawMetricLine.trim();
                    if (!metricLine) { i++; continue; }
                    if (/^(CALLOUT|BULLETS|COMPARISON):/i.test(metricLine)) break;
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

            // BULLETS: section
            if (/^BULLETS:\s*$/i.test(line)) {
                i++;
                while (i < lines.length) {
                    const rawBulletLine = lines[i];
                    if (!rawBulletLine) { i++; continue; }
                    const bulletLine = rawBulletLine.trim();
                    if (!bulletLine) { i++; continue; }
                    if (/^(CALLOUT|METRICS|COMPARISON):/i.test(bulletLine)) break;
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

        if (title || bullets.length > 0 || metrics.length > 0) {
            slides.push({
                title: title || 'Slide',
                bullets,
                ...(metrics.length > 0 ? { metrics } : {}),
                ...(callout ? { callout } : {}),
                ...(comparison ? { comparison } : {}),
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

/** Extract a short keyword from a slide title for the sidebar label. */
export function sidebarKeyword(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('company') || lower.includes('about') || lower.includes('overview')) return 'company';
    if (lower.includes('market') || lower.includes('advertis') || lower.includes('channel')) return 'marketing';
    if (lower.includes('goal') || lower.includes('objective') || lower.includes('target')) return 'goals';
    if (lower.includes('scope') || lower.includes('service') || lower.includes('deliver')) return 'scope';
    if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('phase')) return 'timeline';
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('invest')) return 'budget';
    if (lower.includes('roi') || lower.includes('return') || lower.includes('projection')) return 'roi';
    if (lower.includes('strategy') || lower.includes('approach') || lower.includes('plan')) return 'strategy';
    if (lower.includes('challenge') || lower.includes('problem') || lower.includes('barrier')) return 'challenges';
    if (lower.includes('audience') || lower.includes('customer') || lower.includes('persona')) return 'audience';
    if (lower.includes('creative') || lower.includes('design') || lower.includes('content')) return 'creative';
    if (lower.includes('next') || lower.includes('step') || lower.includes('action')) return 'next';
    return 'default';
}
