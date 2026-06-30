/**
 * Content slide layouts — three alternating variants for visual variety.
 *   Variant 0: Image on right side filling the entire right half
 *   Variant 1: Full-bleed background image with text overlay card
 *   Variant 2: Image on left side filling the entire left half
 */

import type pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import type { PexelsImage } from '../pexels-images';
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

// ─── Layout variant 0: Image on right ─────────────────────────────

function addContentSlideImageRight(
    pptx: pptxgen,
    title: string,
    bullets: string[],
    formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): void {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, title, slideNumber);

    const leftW = 7.7;
    const leftX = MARGIN;
    const contentTop = BODY_TOP + 0.1;

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

    if (bullets.length > 0) {
        const bulletText = bullets.map((b) => ({
            text: b,
            options: { bullet: { code: '2022', indent: 20 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 10, paraSpaceBefore: 4 },
        }));
        slide.addText(bulletText, {
            x: leftX + 0.35, y: contentTop + 0.25, w: leftW - 0.6, h: BODY_H - 0.6,
            fontSize: 15, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.35,
        });
    } else {
        slide.addText('Details to follow during kickoff meeting.', {
            x: leftX + 0.35, y: contentTop + 0.25, w: leftW - 0.6, h: BODY_H - 0.6,
            fontSize: 15, color: COLORS.muted, fontFace: FONT,
            italic: true, align: 'left', valign: 'top',
        });
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
        addSidebar(pptx, slide, sidebarKeyword(title), formData);
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
}

// ─── Layout variant 1: Full-bleed background image ────────────────

function addContentSlideImageBackground(
    pptx: pptxgen,
    title: string,
    bullets: string[],
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
    slide.addText(title, {
        x: MARGIN, y: 0.1, w: 10.5, h: 0.8,
        fontSize: 26, bold: true, color: COLORS.white,
        fontFace: FONT, align: 'left', valign: 'middle',
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

    slide.addShape(pptx.ShapeType.roundRect, {
        x: cardX, y: cardY, w: cardW, h: cardH,
        fill: { color: COLORS.white, transparency: 5 },
        line: { color: COLORS.white, width: 1 },
        rectRadius: 0.08,
    });

    if (bullets.length > 0) {
        const bulletText = bullets.map((b) => ({
            text: b,
            options: { bullet: { code: '2022', indent: 20 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 10, paraSpaceBefore: 4 },
        }));
        slide.addText(bulletText, {
            x: cardX + 0.35, y: cardY + 0.25, w: cardW - 0.6, h: cardH - 0.5,
            fontSize: 15, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.35,
        });
    }

    addSlideFooter(slide, companyName, slideNumber, totalSlides);
}

// ─── Layout variant 2: Image on left ──────────────────────────────

function addContentSlideImageLeft(
    pptx: pptxgen,
    title: string,
    bullets: string[],
    formData: ProposalFormData,
    companyName: string,
    slideNumber: number,
    totalSlides: number,
    image: PexelsImage | null,
): void {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, title, slideNumber);

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
        const sidebarKeywordVal = sidebarKeyword(title);
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

    slide.addShape(pptx.ShapeType.roundRect, {
        x: rightX, y: contentTop + 0.1, w: rightW, h: BODY_H - 0.2,
        fill: { color: COLORS.white }, line: { color: COLORS.mutedLight, width: 1 }, rectRadius: 0.08,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: rightX, y: contentTop + 0.1, w: 0.08, h: BODY_H - 0.2,
        fill: { color: COLORS.primary },
    });

    if (bullets.length > 0) {
        const bulletText = bullets.map((b) => ({
            text: b,
            options: { bullet: { code: '2022', indent: 20 }, indentLevel: 0, breakLine: true, paraSpaceAfter: 10, paraSpaceBefore: 4 },
        }));
        slide.addText(bulletText, {
            x: rightX + 0.35, y: contentTop + 0.35, w: rightW - 0.6, h: BODY_H - 0.6,
            fontSize: 15, color: COLORS.dark, fontFace: FONT,
            align: 'left', valign: 'top', lineSpacingMultiple: 1.35,
        });
    } else {
        slide.addText('Details to follow during kickoff meeting.', {
            x: rightX + 0.35, y: contentTop + 0.35, w: rightW - 0.6, h: BODY_H - 0.6,
            fontSize: 15, color: COLORS.muted, fontFace: FONT,
            italic: true, align: 'left', valign: 'top',
        });
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
): void {
    const variant = layoutVariant % 3;
    if (variant === 0) {
        addContentSlideImageRight(pptx, title, bullets, formData, companyName, slideNumber, totalSlides, image);
    } else if (variant === 1) {
        addContentSlideImageBackground(pptx, title, bullets, formData, companyName, slideNumber, totalSlides, image);
    } else {
        addContentSlideImageLeft(pptx, title, bullets, formData, companyName, slideNumber, totalSlides, image);
    }
}
