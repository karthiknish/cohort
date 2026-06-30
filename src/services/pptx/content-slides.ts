/**
 * Content slide layouts — multiple variants for visual variety.
 *   Variant 0: Image on right side filling the entire right half
 *   Variant 1: Full-bleed background image with text overlay card
 *   Variant 2: Image on left side filling the entire left half
 *   Variant 3: Metrics-focused layout with big number callouts
 *   Variant 4: Comparison layout with before/after split
 *
 * All variants support an optional CALLOUT box at the bottom.
 */

import type pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import type { PexelsImage } from '../pexels-images';
import type { PptxSlideContent, SlideMetric } from './types';
import {
    COLORS, FONT, FONT_LIGHT, SLIDE_W, SLIDE_H, MARGIN,
    HEADER_H, BODY_TOP, BODY_BOTTOM, BODY_H,
} from './constants';
import { addSlideHeader, addSlideFooter, addSidebar, sidebarKeyword, getSidebarStats } from './shared-elements';

// ─── Title slide ──────────────────────────────────────────────────

export function addTitleSlide(pptx: pptxgen, formData: ProposalFormData, image: PexelsImage | null): void {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const objectives = formData.goals?.objectives?.join(', ');
    const services = formData.scope?.services?.join(', ');
    const slide = pptx.addSlide();

    if (image) {
        slide.background = { data: image.base64 };
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
            fill: { color: COLORS.primaryDark, transparency: 25 },
        });
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: 7.5, h: SLIDE_H,
            fill: { color: COLORS.primaryDark, transparency: 5 },
        });
    } else {
        slide.background = { color: COLORS.primary };
    }

    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.15, h: SLIDE_H,
        fill: { color: COLORS.secondary },
    });

    slide.addText(companyName.toUpperCase(), {
        x: 0.9, y: 0.7, w: 9, h: 0.5,
        fontSize: 14, color: COLORS.accentLight,
        fontFace: FONT, align: 'left', bold: true, charSpacing: 3,
    });

    slide.addText('Marketing Proposal', {
        x: 0.9, y: 2.0, w: 10, h: 1.3,
        fontSize: 48, bold: true, color: COLORS.white,
        fontFace: FONT_LIGHT, align: 'left',
    });

    slide.addShape(pptx.ShapeType.rect, {
        x: 0.9, y: 3.4, w: 2.5, h: 0.04,
        fill: { color: COLORS.secondary },
    });

    const subtitleParts = [industry, objectives].filter(Boolean);
    if (subtitleParts.length > 0) {
        slide.addText(subtitleParts.join('  |  '), {
            x: 0.9, y: 3.7, w: 10, h: 0.6,
            fontSize: 18, color: COLORS.accentLight,
            fontFace: FONT, align: 'left',
        });
    }

    if (services) {
        slide.addText(services, {
            x: 0.9, y: 4.5, w: 10, h: 0.5,
            fontSize: 14, color: COLORS.secondary,
            fontFace: FONT, align: 'left', italic: true,
        });
    }

    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: SLIDE_H - 0.6, w: SLIDE_W, h: 0.6,
        fill: { color: COLORS.primaryDark },
    });
    const dateStr = new Date().toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    slide.addText(`Prepared by Cohorts  |  ${dateStr}`, {
        x: 0.9, y: SLIDE_H - 0.6, w: 11, h: 0.6,
        fontSize: 11, color: COLORS.muted,
        fontFace: FONT, align: 'left', valign: 'middle',
    });
}

// ─── Callout box helper ───────────────────────────────────────────

function addCalloutBox(slide: pptxgen.Slide, pptx: pptxgen, callout: string, x: number, y: number, w: number, h: number): void {
    slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w, h,
        fill: { color: COLORS.primary, transparency: 88 },
        line: { color: COLORS.accent, width: 1 },
        rectRadius: 0.06,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x, y, w: 0.06, h,
        fill: { color: COLORS.accent },
    });
    slide.addText(callout, {
        x: x + 0.25, y: y + 0.08, w: w - 0.4, h: h - 0.16,
        fontSize: 13, color: COLORS.dark, fontFace: FONT,
        bold: true, italic: true, align: 'left', valign: 'middle',
        lineSpacingMultiple: 1.2,
    });
}

// ─── Metrics row helper ───────────────────────────────────────────

function addMetricsRow(slide: pptxgen.Slide, pptx: pptxgen, metrics: SlideMetric[], x: number, y: number, w: number, h: number): void {
    const count = Math.min(metrics.length, 4);
    if (count === 0) return;
    const gap = 0.2;
    const cardW = (w - gap * (count - 1)) / count;

    for (let i = 0; i < count; i++) {
        const metric = metrics[i]!;
        const cardX = x + i * (cardW + gap);

        slide.addShape(pptx.ShapeType.roundRect, {
            x: cardX, y, w: cardW, h,
            fill: { color: COLORS.white },
            line: { color: COLORS.mutedLight, width: 1 },
            rectRadius: 0.06,
        });
        slide.addShape(pptx.ShapeType.rect, {
            x: cardX, y, w: cardW, h: 0.06,
            fill: { color: COLORS.accent },
        });

        slide.addText(metric.value, {
            x: cardX + 0.1, y: y + 0.15, w: cardW - 0.2, h: h * 0.5,
            fontSize: 32, bold: true, color: COLORS.primary,
            fontFace: FONT_LIGHT, align: 'center', valign: 'middle',
            fit: 'shrink',
        });
        slide.addText(metric.label, {
            x: cardX + 0.1, y: y + h * 0.55, w: cardW - 0.2, h: h * 0.4,
            fontSize: 11, color: COLORS.muted, fontFace: FONT,
            align: 'center', valign: 'top', lineSpacingMultiple: 1.15,
        });
    }
}

// ─── Comparison helper ────────────────────────────────────────────

function addComparisonContent(slide: pptxgen.Slide, pptx: pptxgen, before: string[], after: string[], x: number, y: number, w: number, h: number): void {
    const colW = (w - 0.3) / 2;
    const afterX = x + colW + 0.3;

    // Before column
    slide.addShape(pptx.ShapeType.roundRect, {
        x, y, w: colW, h,
        fill: { color: COLORS.white },
        line: { color: COLORS.mutedLight, width: 1 },
        rectRadius: 0.06,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x, y, w: colW, h: 0.45,
        fill: { color: COLORS.muted },
        rectRadius: 0.06,
    });
    slide.addText('Current State', {
        x: x + 0.2, y, w: colW - 0.4, h: 0.45,
        fontSize: 13, bold: true, color: COLORS.white,
        fontFace: FONT, align: 'left', valign: 'middle',
    });
    if (before.length > 0) {
        const beforeText = before.map((b) => ({
            text: b,
            options: { bullet: { code: '2022', indent: 16 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 8, fontSize: 12, color: COLORS.dark, fontFace: FONT },
        }));
        slide.addText(beforeText, {
            x: x + 0.25, y: y + 0.6, w: colW - 0.45, h: h - 0.75,
            valign: 'top', lineSpacingMultiple: 1.3,
        });
    }

    // After column
    slide.addShape(pptx.ShapeType.roundRect, {
        x: afterX, y, w: colW, h,
        fill: { color: COLORS.white },
        line: { color: COLORS.mutedLight, width: 1 },
        rectRadius: 0.06,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: afterX, y, w: colW, h: 0.45,
        fill: { color: COLORS.primary },
        rectRadius: 0.06,
    });
    slide.addText('Proposed State', {
        x: afterX + 0.2, y, w: colW - 0.4, h: 0.45,
        fontSize: 13, bold: true, color: COLORS.white,
        fontFace: FONT, align: 'left', valign: 'middle',
    });
    if (after.length > 0) {
        const afterText = after.map((a) => ({
            text: a,
            options: { bullet: { code: '2022', indent: 16 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 8, fontSize: 12, color: COLORS.dark, fontFace: FONT },
        }));
        slide.addText(afterText, {
            x: afterX + 0.25, y: y + 0.6, w: colW - 0.45, h: h - 0.75,
            valign: 'top', lineSpacingMultiple: 1.3,
        });
    }
}

// ─── Bullet text helper ───────────────────────────────────────────

function makeBulletText(bullets: string[]) {
    return bullets.map((b) => ({
        text: b,
        options: { bullet: { code: '2022', indent: 20 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 10, paraSpaceBefore: 4 },
    }));
}

// ─── Layout variant 0: Image on right ─────────────────────────────

function addContentSlideImageRight(
    pptx: pptxgen,
    content: PptxSlideContent,
    formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): void {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, content.title, slideNumber);

    const leftW = 7.7;
    const leftX = MARGIN;
    const contentTop = BODY_TOP + 0.1;
    const hasMetrics = (content.metrics?.length ?? 0) > 0;
    const hasComparison = !!content.comparison;
    const calloutH = content.callout ? 0.7 : 0;
    const metricsH = hasMetrics ? 1.6 : 0;
    const bodyH = BODY_H - 0.2 - metricsH - calloutH - (hasMetrics || hasComparison ? 0.2 : 0);

    slide.addShape(pptx.ShapeType.roundRect, {
        x: leftX, y: contentTop, w: leftW, h: BODY_H - 0.2,
        fill: { color: COLORS.white },
        line: { color: COLORS.mutedLight, width: 1 },
        rectRadius: 0.08,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: leftX, y: contentTop, w: 0.08, h: BODY_H - 0.2,
        fill: { color: COLORS.primary },
    });

    let cursorY = contentTop + 0.25;

    if (hasMetrics) {
        addMetricsRow(slide, pptx, content.metrics!, leftX + 0.3, cursorY, leftW - 0.6, metricsH);
        cursorY += metricsH + 0.2;
    }

    if (hasComparison) {
        addComparisonContent(slide, pptx, content.comparison!.before, content.comparison!.after, leftX + 0.3, cursorY, leftW - 0.6, bodyH);
        cursorY += bodyH + 0.15;
    } else if (content.bullets.length > 0) {
        slide.addText(makeBulletText(content.bullets), {
            x: leftX + 0.35, y: cursorY, w: leftW - 0.6, h: bodyH,
            fontSize: 15, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.35,
        });
        cursorY += bodyH + 0.1;
    } else if (!hasMetrics) {
        slide.addText('Details to follow during kickoff meeting.', {
            x: leftX + 0.35, y: cursorY, w: leftW - 0.6, h: bodyH,
            fontSize: 15, color: COLORS.muted, fontFace: FONT,
            italic: true, align: 'left', valign: 'top',
        });
    }

    if (content.callout) {
        addCalloutBox(slide, pptx, content.callout, leftX + 0.3, contentTop + BODY_H - 0.2 - calloutH - 0.1, leftW - 0.6, calloutH);
    }

    // Right column: image filling the ENTIRE right side
    const imgX = 8.6;
    const imgW = SLIDE_W - imgX;
    const imgY = BODY_TOP;
    const imgH = BODY_BOTTOM - BODY_TOP;

    if (image) {
        slide.addImage({
            data: image.base64,
            x: imgX, y: imgY, w: imgW, h: imgH,
            sizing: { type: 'cover', w: imgW, h: imgH },
        });
    } else {
        addSidebar(pptx, slide, sidebarKeyword(content.title), formData);
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
}

// ─── Layout variant 1: Full-bleed background image ────────────────

function addContentSlideImageBackground(
    pptx: pptxgen,
    content: PptxSlideContent,
    _formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): void {
    const slide = pptx.addSlide();

    if (image) {
        slide.background = { data: image.base64 };
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
            fill: { color: COLORS.primaryDark, transparency: 15 },
        });
    } else {
        slide.background = { color: COLORS.primary };
    }

    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: SLIDE_W, h: HEADER_H,
        fill: { color: COLORS.primaryDark, transparency: 10 },
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: HEADER_H, w: SLIDE_W, h: 0.06,
        fill: { color: COLORS.secondary },
    });
    slide.addText(content.title, {
        x: MARGIN, y: 0.1, w: 10.5, h: 0.8,
        fontSize: 26, bold: true, color: COLORS.white,
        fontFace: FONT, align: 'left', valign: 'middle',
        fit: 'shrink',
    });
    slide.addText(`${slideNumber}`, {
        x: 11.8, y: 0.15, w: 0.9, h: 0.7,
        fontSize: 30, bold: true, color: COLORS.accentLight,
        fontFace: FONT_LIGHT, align: 'center', valign: 'middle',
    });

    const cardX = MARGIN;
    const cardY = BODY_TOP + 0.2;
    const cardW = 8.5;
    const cardH = BODY_H - 0.4;
    const hasMetrics = (content.metrics?.length ?? 0) > 0;
    const hasComparison = !!content.comparison;
    const calloutH = content.callout ? 0.65 : 0;
    const metricsH = hasMetrics ? 1.5 : 0;
    const bodyH = cardH - metricsH - calloutH - (hasMetrics || hasComparison ? 0.2 : 0) - 0.3;

    slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX, y: cardY, w: cardW, h: cardH,
        fill: { color: COLORS.white, transparency: 5 },
        line: { color: COLORS.white, width: 1 },
        rectRadius: 0.08,
    });

    let cursorY = cardY + 0.2;

    if (hasMetrics) {
        addMetricsRow(slide, pptx, content.metrics!, cardX + 0.25, cursorY, cardW - 0.5, metricsH);
        cursorY += metricsH + 0.2;
    }

    if (hasComparison) {
        addComparisonContent(slide, pptx, content.comparison!.before, content.comparison!.after, cardX + 0.25, cursorY, cardW - 0.5, bodyH);
        cursorY += bodyH + 0.1;
    } else if (content.bullets.length > 0) {
        slide.addText(makeBulletText(content.bullets), {
            x: cardX + 0.35, y: cursorY, w: cardW - 0.6, h: bodyH,
            fontSize: 15, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.35,
        });
    }

    if (content.callout) {
        addCalloutBox(slide, pptx, content.callout, cardX + 0.25, cardY + cardH - calloutH - 0.15, cardW - 0.5, calloutH);
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
}

// ─── Layout variant 2: Image on left ──────────────────────────────

function addContentSlideImageLeft(
    pptx: pptxgen,
    content: PptxSlideContent,
    formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): void {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, content.title, slideNumber);

    const contentTop = BODY_TOP;
    const imgX = 0;
    const imgW = 4.8;
    const imgY = BODY_TOP;
    const imgH = BODY_BOTTOM - BODY_TOP;

    if (image) {
        slide.addImage({
            data: image.base64,
            x: imgX, y: imgY, w: imgW, h: imgH,
            sizing: { type: 'cover', w: imgW, h: imgH },
        });
    } else {
        const sidebarKeywordVal = sidebarKeyword(content.title);
        const sidebarX = MARGIN;
        const sidebarW = 4.5;
        const sidebarY = contentTop + 0.1;
        const sidebarH = BODY_H - 0.2;
        slide.addShape(pptx.ShapeType.roundRect, {
            x: sidebarX, y: sidebarY, w: sidebarW, h: sidebarH,
            fill: { color: COLORS.white }, line: { color: COLORS.mutedLight, width: 1 }, rectRadius: 0.08,
        });
        slide.addShape(pptx.ShapeType.rect, {
            x: sidebarX, y: sidebarY, w: 0.08, h: sidebarH,
            fill: { color: COLORS.secondary },
        });
        const stats = getSidebarStats(sidebarKeywordVal, formData);
        slide.addText('At a Glance', {
            x: sidebarX + 0.3, y: sidebarY + 0.3, w: sidebarW - 0.5, h: 0.4,
            fontSize: 12, bold: true, color: COLORS.muted, fontFace: FONT, charSpacing: 1,
        });
        let statY = sidebarY + 0.85;
        const statSpacing = (sidebarH - 1.1) / Math.max(stats.length, 1);
        for (const stat of stats) {
            slide.addText(stat.label, {
                x: sidebarX + 0.3, y: statY, w: sidebarW - 0.5, h: 0.3,
                fontSize: 11, color: COLORS.muted, fontFace: FONT, bold: true,
            });
            slide.addText(stat.value, {
                x: sidebarX + 0.3, y: statY + 0.3, w: sidebarW - 0.5, h: Math.min(statSpacing - 0.4, 1.2),
                fontSize: 14, color: COLORS.dark, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.25,
            });
            statY += statSpacing;
        }
    }

    const rightX = 5.4;
    const rightW = SLIDE_W - rightX - MARGIN;
    const hasMetrics = (content.metrics?.length ?? 0) > 0;
    const hasComparison = !!content.comparison;
    const calloutH = content.callout ? 0.7 : 0;
    const metricsH = hasMetrics ? 1.6 : 0;
    const bodyH = BODY_H - 0.2 - metricsH - calloutH - (hasMetrics || hasComparison ? 0.2 : 0);

    slide.addShape(pptx.ShapeType.roundRect, {
        x: rightX, y: contentTop + 0.1, w: rightW, h: BODY_H - 0.2,
        fill: { color: COLORS.white }, line: { color: COLORS.mutedLight, width: 1 }, rectRadius: 0.08,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: rightX, y: contentTop + 0.1, w: 0.08, h: BODY_H - 0.2,
        fill: { color: COLORS.primary },
    });

    let cursorY = contentTop + 0.35;

    if (hasMetrics) {
        addMetricsRow(slide, pptx, content.metrics!, rightX + 0.3, cursorY, rightW - 0.6, metricsH);
        cursorY += metricsH + 0.2;
    }

    if (hasComparison) {
        addComparisonContent(slide, pptx, content.comparison!.before, content.comparison!.after, rightX + 0.3, cursorY, rightW - 0.6, bodyH);
        cursorY += bodyH + 0.15;
    } else if (content.bullets.length > 0) {
        slide.addText(makeBulletText(content.bullets), {
            x: rightX + 0.35, y: cursorY, w: rightW - 0.6, h: bodyH,
            fontSize: 15, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.35,
        });
        cursorY += bodyH + 0.1;
    } else if (!hasMetrics) {
        slide.addText('Details to follow during kickoff meeting.', {
            x: rightX + 0.35, y: cursorY, w: rightW - 0.6, h: bodyH,
            fontSize: 15, color: COLORS.muted, fontFace: FONT,
            italic: true, align: 'left', valign: 'top',
        });
    }

    if (content.callout) {
        addCalloutBox(slide, pptx, content.callout, rightX + 0.3, contentTop + BODY_H - 0.2 - calloutH - 0.1, rightW - 0.6, calloutH);
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
}

// ─── Dispatcher ───────────────────────────────────────────────────

export function addContentSlide(
    pptx: pptxgen,
    title: string,
    bullets: string[],
    formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
    layoutVariant: number,
    content?: PptxSlideContent,
): void {
    const slideContent: PptxSlideContent = content ?? { title, bullets };
    // If metrics are present, bias toward variant 0 (image right) or 1 (background)
    // since those layouts have the most room for metric cards.
    const hasMetrics = (slideContent.metrics?.length ?? 0) > 0;
    const hasComparison = !!slideContent.comparison;
    let variant = layoutVariant % 3;
    if (hasComparison) {
        // Comparison needs width — use variant 0 (image right gives full-width card)
        variant = 0;
    } else if (hasMetrics && variant === 2) {
        // Variant 2 (image left) has less width for metrics — prefer 0 or 1
        variant = 0;
    }

    if (variant === 0) {
        addContentSlideImageRight(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    } else if (variant === 1) {
        addContentSlideImageBackground(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    } else {
        addContentSlideImageLeft(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    }
}
