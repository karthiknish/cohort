/**
 * Content slide layouts — multiple variants for visual variety.
 *   Variant 0: Image on right side filling the entire right half
 *   Variant 1: Full-bleed background image with text overlay card
 *   Variant 2: Image on left side filling the entire left half
 *   Variant 3: Timeline / process-flow layout (numbered phase cards with arrows)
 *   Variant 4: Quote / stat-hero layout (large centered text, minimal chrome)
 *
 * All variants support an optional CALLOUT box at the bottom.
 */

import type pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import type { PexelsImage } from '../pexels-images';
import type { PptxSlideContent, SlideMetric, SlideTimelinePhase } from './types';
import {
    COLORS, FONT, FONT_LIGHT, SLIDE_W, SLIDE_H, MARGIN, CONTENT_W,
    HEADER_H, BODY_TOP, BODY_BOTTOM, BODY_H,
} from './constants';
import { addSlideHeader, addSlideFooter, addSidebar, sidebarKeyword, getSidebarStats } from './shared-elements';
import { COHORTS_LOGO_WHITE_BASE64 } from './logo-data';

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

    // Cohorts white logo — top right corner
    slide.addImage({
        data: COHORTS_LOGO_WHITE_BASE64,
        x: SLIDE_W - 3.2, y: 0.5, w: 2.5, h: 1.4,
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
            options: { bullet: { code: '2022', indent: 16 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 8, fontSize: 11, color: COLORS.dark, fontFace: FONT },
        }));
        slide.addText(beforeText, {
            x: x + 0.25, y: y + 0.6, w: colW - 0.45, h: h - 0.75,
            valign: 'top', lineSpacingMultiple: 1.25,
            fit: 'shrink',
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
            options: { bullet: { code: '2022', indent: 16 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 8, fontSize: 11, color: COLORS.dark, fontFace: FONT },
        }));
        slide.addText(afterText, {
            x: afterX + 0.25, y: y + 0.6, w: colW - 0.45, h: h - 0.75,
            valign: 'top', lineSpacingMultiple: 1.25,
            fit: 'shrink',
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
): pptxgen.Slide {
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
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.3,
            fit: 'shrink',
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
            altText: content.imageTopic || `Image for ${content.title}`,
        });
    } else {
        addSidebar(pptx, slide, sidebarKeyword(content.title), formData);
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
    return slide;
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
): pptxgen.Slide {
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
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.3,
            fit: 'shrink',
        });
    }

    if (content.callout) {
        addCalloutBox(slide, pptx, content.callout, cardX + 0.25, cardY + cardH - calloutH - 0.15, cardW - 0.5, calloutH);
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
    return slide;
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
): pptxgen.Slide {
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
            altText: content.imageTopic || `Image for ${content.title}`,
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
        if (stats.length === 0) {
            // No form data for this topic — show a key takeaway instead of empty stats
            slide.addText('Key Takeaway', {
                x: sidebarX + 0.3, y: sidebarY + 0.3, w: sidebarW - 0.5, h: 0.4,
                fontSize: 12, bold: true, color: COLORS.muted, fontFace: FONT, charSpacing: 1,
            });
            slide.addText(
                'A data-driven approach ensures every decision is backed by insights, not assumptions.',
                {
                    x: sidebarX + 0.3, y: sidebarY + 0.8, w: sidebarW - 0.5, h: sidebarH - 1.2,
                    fontSize: 15, color: COLORS.dark, fontFace: FONT,
                    italic: true, valign: 'top', lineSpacingMultiple: 1.4,
                },
            );
        } else {
            slide.addText('At a Glance', {
                x: sidebarX + 0.3, y: sidebarY + 0.3, w: sidebarW - 0.5, h: 0.4,
                fontSize: 12, bold: true, color: COLORS.muted, fontFace: FONT, charSpacing: 1,
            });
            let statY = sidebarY + 0.85;
            const statSpacing = (sidebarH - 1.1) / stats.length;
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
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.3,
            fit: 'shrink',
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
    return slide;
}

// ─── Layout variant 3: Timeline / process flow ────────────────────

function addTimelineFlow(
    pptx: pptxgen,
    content: PptxSlideContent,
    _formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): pptxgen.Slide {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, content.title, slideNumber);

    const phases = content.timeline ?? [];
    const calloutH = content.callout ? 0.7 : 0;
    const flowTop = BODY_TOP + 0.2;
    const flowH = BODY_H - 0.4 - calloutH - (calloutH > 0 ? 0.15 : 0);

    if (phases.length === 0) {
        // Fallback: no timeline data — show bullets if available
        slide.addText('Timeline details to follow during kickoff.', {
            x: MARGIN, y: flowTop, w: SLIDE_W - MARGIN * 2, h: flowH,
            fontSize: 16, color: COLORS.muted, fontFace: FONT,
            italic: true, align: 'center', valign: 'middle',
        });
    } else {
        const count = Math.min(phases.length, 5);
        const gap = 0.25;
        const arrowW = 0.3;
        const totalGaps = (count - 1) * gap;
        const totalArrows = (count - 1) * arrowW;
        const cardW = (CONTENT_W - totalGaps - totalArrows) / count;
        const cardH = flowH;

        for (let i = 0; i < count; i++) {
            const phase = phases[i]!;
            const cx = MARGIN + i * (cardW + gap + arrowW);

            // Phase card
            slide.addShape(pptx.ShapeType.roundRect, {
                x: cx, y: flowTop, w: cardW, h: cardH,
                fill: { color: COLORS.white },
                line: { color: COLORS.mutedLight, width: 1 },
                rectRadius: 0.08,
            });

            // Top accent bar
            const accentColor = i === 0 ? COLORS.secondary : i === count - 1 ? COLORS.success : COLORS.accent;
            slide.addShape(pptx.ShapeType.rect, {
                x: cx, y: flowTop, w: cardW, h: 0.08,
                fill: { color: accentColor },
            });

            // Phase number circle
            const circleSize = 0.55;
            const circleX = cx + cardW / 2 - circleSize / 2;
            const circleY = flowTop + 0.25;
            slide.addShape(pptx.ShapeType.ellipse, {
                x: circleX, y: circleY, w: circleSize, h: circleSize,
                fill: { color: accentColor },
            });
            slide.addText(`${phase.number}`, {
                x: circleX, y: circleY, w: circleSize, h: circleSize,
                fontSize: 20, bold: true, color: COLORS.white,
                fontFace: FONT, align: 'center', valign: 'middle',
            });

            // Phase title
            slide.addText(phase.title, {
                x: cx + 0.15, y: circleY + circleSize + 0.15, w: cardW - 0.3, h: 0.4,
                fontSize: 14, bold: true, color: COLORS.primary,
                fontFace: FONT, align: 'center', valign: 'middle',
                fit: 'shrink',
            });

            // Duration badge
            if (phase.duration) {
                slide.addText(phase.duration, {
                    x: cx + 0.15, y: circleY + circleSize + 0.55, w: cardW - 0.3, h: 0.3,
                    fontSize: 10, color: COLORS.secondary, fontFace: FONT,
                    bold: true, align: 'center', valign: 'middle', charSpacing: 0.5,
                });
            }

            // Detail text
            const detailY = circleY + circleSize + 0.9;
            const detailH = cardH - (detailY - flowTop) - 0.2;
            slide.addText(phase.detail, {
                x: cx + 0.2, y: detailY, w: cardW - 0.4, h: Math.max(detailH, 0.5),
                fontSize: 11, color: COLORS.dark, fontFace: FONT,
                align: 'center', valign: 'top', lineSpacingMultiple: 1.25,
                fit: 'shrink',
            });

            // Arrow between cards
            if (i < count - 1) {
                const arrowX = cx + cardW + gap;
                const arrowY = flowTop + cardH / 2 - 0.15;
                slide.addShape(pptx.ShapeType.rtTriangle, {
                    x: arrowX, y: arrowY, w: arrowW, h: 0.3,
                    fill: { color: COLORS.mutedLight },
                    rotate: 90,
                });
            }
        }
    }

    // Callout
    if (content.callout) {
        addCalloutBox(slide, pptx, content.callout, MARGIN, BODY_BOTTOM - calloutH - 0.1, CONTENT_W, calloutH);
    }

    // Decorative image strip on the right (small, non-distracting)
    if (image) {
        const stripW = 1.2;
        slide.addImage({
            data: image.base64,
            x: SLIDE_W - stripW, y: BODY_TOP, w: stripW, h: 0.06,
            sizing: { type: 'crop', w: stripW, h: 0.06 },
            altText: content.imageTopic || 'Timeline accent',
        });
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
    return slide;
}

// ─── Layout variant 4: Quote / stat hero ───────────────────────────

function addQuoteHeroSlide(
    pptx: pptxgen,
    content: PptxSlideContent,
    _formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): pptxgen.Slide {
    const slide = pptx.addSlide();

    if (image) {
        slide.background = { data: image.base64 };
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
            fill: { color: COLORS.primaryDark, transparency: 30 },
        });
    } else {
        slide.background = { color: COLORS.primary };
    }

    // Left accent bar
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.3, h: SLIDE_H,
        fill: { color: COLORS.secondary },
    });

    // Large quotation mark
    slide.addText('"', {
        x: MARGIN, y: BODY_TOP - 0.3, w: 2, h: 2,
        fontSize: 120, bold: true, color: COLORS.secondary,
        fontFace: FONT_LIGHT, align: 'left', valign: 'top',
        transparency: 30,
    });

    const quoteText = content.quote?.text ?? content.title;
    const quoteAttribution = content.quote?.attribution;

    // Quote text — large, centered in the body area
    const quoteX = MARGIN + 0.8;
    const quoteW = SLIDE_W - quoteX - MARGIN - 0.5;
    const quoteY = BODY_TOP + 0.8;
    const quoteH = BODY_H - 1.6 - (content.callout ? 0.8 : 0) - (quoteAttribution ? 0.6 : 0);

    slide.addText(quoteText, {
        x: quoteX, y: quoteY, w: quoteW, h: quoteH,
        fontSize: 36, bold: true, color: COLORS.white,
        fontFace: FONT_LIGHT, align: 'left', valign: 'middle',
        lineSpacingMultiple: 1.2,
        fit: 'shrink',
    });

    // Attribution
    if (quoteAttribution) {
        slide.addShape(pptx.ShapeType.rect, {
            x: quoteX, y: quoteY + quoteH + 0.15, w: 1.5, h: 0.03,
            fill: { color: COLORS.secondary },
        });
        slide.addText(quoteAttribution, {
            x: quoteX, y: quoteY + quoteH + 0.25, w: quoteW, h: 0.4,
            fontSize: 16, color: COLORS.accentLight,
            fontFace: FONT, italic: true, align: 'left', valign: 'top',
        });
    }

    // Callout at the bottom
    if (content.callout) {
        const calloutY = BODY_BOTTOM - 0.7;
        slide.addShape(pptx.ShapeType.roundRect, {
            x: quoteX, y: calloutY, w: quoteW, h: 0.55,
            fill: { color: COLORS.white, transparency: 85 },
            line: { color: COLORS.secondary, width: 1 },
            rectRadius: 0.06,
        });
        slide.addText(content.callout, {
            x: quoteX + 0.2, y: calloutY, w: quoteW - 0.4, h: 0.55,
            fontSize: 14, color: COLORS.white, fontFace: FONT,
            bold: true, italic: true, align: 'left', valign: 'middle',
        });
    }

    // Slide number
    slide.addText(`${slideNumber} / ${totalSlides}`, {
        x: SLIDE_W - 1.8, y: SLIDE_H - 0.5, w: 1.2, h: 0.4,
        fontSize: 10, color: COLORS.muted,
        fontFace: FONT, align: 'right', valign: 'middle',
    });
    if (companyName) {
        slide.addText(companyName, {
            x: MARGIN, y: SLIDE_H - 0.5, w: 6, h: 0.4,
            fontSize: 10, color: COLORS.muted,
            fontFace: FONT, align: 'left', valign: 'middle',
        });
    }

    return slide;
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
    const hasMetrics = (slideContent.metrics?.length ?? 0) > 0;
    const hasComparison = !!slideContent.comparison;
    const hasTimeline = (slideContent.timeline?.length ?? 0) > 0;
    const hasQuote = !!slideContent.quote;

    // Content-type-aware layout selection:
    // - TIMELINE content → always use variant 3 (timeline flow)
    // - QUOTE content → always use variant 4 (quote hero)
    // - COMPARISON content → use variant 0 (full-width card needed)
    // - METRICS content → prefer variant 0 or 1 (most room for metric cards)
    // - BULLETS only → cycle through variants 0-2 for visual variety
    let variant: number;
    if (hasTimeline) {
        variant = 3;
    } else if (hasQuote) {
        variant = 4;
    } else if (hasComparison) {
        variant = 0;
    } else if (hasMetrics) {
        // Metrics need width — prefer 0 or 1, avoid 2 (image left has less room)
        variant = layoutVariant % 2;
    } else {
        // Plain bullets — cycle 0, 1, 2 for visual variety
        variant = layoutVariant % 3;
    }

    let slide: pptxgen.Slide;
    if (variant === 3) {
        slide = addTimelineFlow(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    } else if (variant === 4) {
        slide = addQuoteHeroSlide(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    } else if (variant === 0) {
        slide = addContentSlideImageRight(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    } else if (variant === 1) {
        slide = addContentSlideImageBackground(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    } else {
        slide = addContentSlideImageLeft(pptx, slideContent, formData, companyName, slideNumber, totalSlides, image);
    }

    // Add speaker notes if available
    if (slideContent.notes) {
        slide.addNotes(slideContent.notes);
    }
}
