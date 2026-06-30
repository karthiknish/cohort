/**
 * Parse AI-generated slide instructions into structured slide content.
 *
 * Handles multiple formats the AI may produce:
 *   **Slide 1: Title**       (markdown bold — most common)
 *   Slide 1: Title           (plain)
 *   ## Slide 1: Title        (markdown heading)
 *   Slide 1 - Title          (dash separator)
 */

import type { PptxSlideContent } from './types';

export function parseSlideInstructions(instructions: string): PptxSlideContent[] {
    const blocks = instructions.split(/\n(?=\*{0,2}Slide\s+\d+)/i);
    const slides: PptxSlideContent[] = [];

    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        const lines = trimmed.split(/\r?\n/);
        const headerLine = lines[0] || '';

        const titleMatch = headerLine.match(/^\*{0,2}(?:##\s*)?Slide\s+\d+\s*[:\-–]\s*(.*?)\*{0,2}\s*$/i);
        const rawTitle = titleMatch?.[1]?.trim() || headerLine.replace(/^\*+|\*+$/g, '').trim();
        const title = rawTitle.replace(/\*+/g, '').trim();

        const bullets = lines
            .slice(1)
            .map((line) => {
                let cleaned = line.replace(/^\s*[-•*]\s*/, '').trim();
                cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
                return cleaned;
            })
            .filter((line) => line.length > 0);

        if (title || bullets.length > 0) {
            slides.push({ title: title || 'Slide', bullets });
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
