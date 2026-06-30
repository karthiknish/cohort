/**
 * Shared slide elements — header bar, footer, sidebar stats.
 * Used across all content slide layouts.
 */

import type pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import { COLORS, FONT, FONT_LIGHT, SLIDE_W, SLIDE_H, HEADER_H, FOOTER_H, MARGIN, BODY_TOP, BODY_H } from './constants';
import type { SidebarStat } from './types';
import { sidebarKeyword } from './parsing';

export function addSlideHeader(pptx: pptxgen, slide: pptxgen.Slide, title: string, slideNum: number): void {
    // Header bar
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: SLIDE_W, h: HEADER_H,
        fill: { color: COLORS.primary },
    });
    // Accent stripe
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: HEADER_H, w: SLIDE_W, h: 0.06,
        fill: { color: COLORS.secondary },
    });
    // Title
    slide.addText(title, {
        x: MARGIN, y: 0.1, w: 10.5, h: 0.8,
        fontSize: 26, bold: true, color: COLORS.white,
        fontFace: FONT, align: 'left', valign: 'middle',
    });
    // Slide number badge
    slide.addText(`${slideNum}`, {
        x: 11.8, y: 0.15, w: 0.9, h: 0.7,
        fontSize: 30, bold: true, color: COLORS.accentLight,
        fontFace: FONT_LIGHT, align: 'center', valign: 'middle',
    });
}

export function addSlideFooter(slide: pptxgen.Slide, companyName: string, slideNum: number, total: number): void {
    slide.addShape('rect', {
        x: 0, y: SLIDE_H - FOOTER_H, w: SLIDE_W, h: FOOTER_H,
        fill: { color: COLORS.mutedLight },
    });
    if (companyName) {
        slide.addText(companyName, {
            x: MARGIN, y: SLIDE_H - FOOTER_H, w: 6, h: FOOTER_H,
            fontSize: 9, color: COLORS.muted,
            fontFace: FONT, align: 'left', valign: 'middle',
        });
    }
    slide.addText(`${slideNum} / ${total}`, {
        x: 10.5, y: SLIDE_H - FOOTER_H, w: 2.2, h: FOOTER_H,
        fontSize: 9, color: COLORS.muted,
        fontFace: FONT, align: 'right', valign: 'middle',
    });
}

export function getSidebarStats(keyword: string, formData: ProposalFormData): SidebarStat[] {
    switch (keyword) {
        case 'company':
            return [
                { label: 'Industry', value: formData.company?.industry || '—' },
                { label: 'Company Size', value: formData.company?.size || '—' },
                { label: 'Locations', value: formData.company?.locations?.split('\n')[0] || '—' },
            ];
        case 'marketing':
            return [
                { label: 'Monthly Budget', value: formData.marketing?.budget || '—' },
                { label: 'Ad Accounts', value: formData.marketing?.adAccounts || '—' },
                { label: 'Platforms', value: formData.marketing?.platforms?.join(', ') || '—' },
            ];
        case 'goals':
            return [
                { label: 'Objectives', value: formData.goals?.objectives?.join(', ') || '—' },
                { label: 'Audience', value: formData.goals?.audience?.substring(0, 80) || '—' },
            ];
        case 'scope':
            return [
                { label: 'Services', value: formData.scope?.services?.join(', ') || '—' },
                { label: 'Custom Needs', value: formData.scope?.otherService?.substring(0, 80) || '—' },
            ];
        case 'timeline':
            return [
                { label: 'Start', value: formData.timelines?.startTime || '—' },
                { label: 'Events', value: formData.timelines?.upcomingEvents?.substring(0, 80) || '—' },
            ];
        case 'budget':
            return [
                { label: 'Budget', value: formData.marketing?.budget || '—' },
                { label: 'Engagement', value: formData.value?.engagementType || '—' },
            ];
        case 'audience':
            return [
                { label: 'Target', value: formData.goals?.audience?.substring(0, 80) || '—' },
                { label: 'Goals', value: formData.goals?.objectives?.join(', ') || '—' },
            ];
        case 'challenges':
            return [
                { label: 'Barriers', value: formData.goals?.challenges?.join(', ') || '—' },
                { label: 'Custom', value: formData.goals?.customChallenge || '—' },
            ];
        default:
            return [];
    }
}

export function addSidebar(
    pptx: pptxgen,
    slide: pptxgen.Slide,
    keyword: string,
    formData: ProposalFormData,
): void {
    const sidebarX = 8.6;
    const sidebarW = 4.1;
    const sidebarY = BODY_TOP + 0.1;
    const sidebarH = BODY_H - 0.2;

    // Sidebar background card
    slide.addShape(pptx.ShapeType.roundRect, {
        x: sidebarX, y: sidebarY, w: sidebarW, h: sidebarH,
        fill: { color: COLORS.white },
        line: { color: COLORS.mutedLight, width: 1 },
        rectRadius: 0.08,
    });

    // Accent strip on left edge of card
    slide.addShape(pptx.ShapeType.rect, {
        x: sidebarX, y: sidebarY, w: 0.08, h: sidebarH,
        fill: { color: COLORS.secondary },
    });

    const stats = getSidebarStats(keyword, formData);

    if (stats.length === 0) {
        slide.addText('Key Takeaway', {
            x: sidebarX + 0.3, y: sidebarY + 0.3, w: sidebarW - 0.5, h: 0.4,
            fontSize: 12, bold: true, color: COLORS.muted,
            fontFace: FONT, charSpacing: 1,
        });
        slide.addText(
            'A data-driven approach ensures every decision is backed by insights, not assumptions.',
            {
                x: sidebarX + 0.3, y: sidebarY + 0.8, w: sidebarW - 0.5, h: sidebarH - 1.2,
                fontSize: 15, color: COLORS.dark, fontFace: FONT,
                italic: true, valign: 'top', lineSpacingMultiple: 1.4,
            },
        );
        return;
    }

    // Stats header
    slide.addText('At a Glance', {
        x: sidebarX + 0.3, y: sidebarY + 0.3, w: sidebarW - 0.5, h: 0.4,
        fontSize: 12, bold: true, color: COLORS.muted,
        fontFace: FONT, charSpacing: 1,
    });

    // Render each stat as a labeled block
    let statY = sidebarY + 0.85;
    const statSpacing = (sidebarH - 1.1) / stats.length;

    for (const stat of stats) {
        slide.addText(stat.label, {
            x: sidebarX + 0.3, y: statY, w: sidebarW - 0.5, h: 0.3,
            fontSize: 11, color: COLORS.muted, fontFace: FONT, bold: true,
            charSpacing: 0.5,
        });
        slide.addText(stat.value, {
            x: sidebarX + 0.3, y: statY + 0.3, w: sidebarW - 0.5, h: Math.min(statSpacing - 0.4, 1.2),
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
            valign: 'top', lineSpacingMultiple: 1.25,
        });
        statY += statSpacing;
    }
}

// Re-export for convenience
export { sidebarKeyword };
