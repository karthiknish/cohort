/**
 * Structural slides — services table, closing, TOC, section dividers.
 */

import type pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import type { PexelsImage } from '../pexels-images';
import {
    COLORS, FONT, FONT_LIGHT, SLIDE_W, SLIDE_H, MARGIN, CONTENT_W,
    HEADER_H, BODY_TOP, BODY_H,
} from './constants';
import { addSlideHeader, addSlideFooter } from './shared-elements';

// ─── Services table slide ─────────────────────────────────────────

export function addServicesTableSlide(
    pptx: pptxgen,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): void {
    const services = formData.scope?.services || [];
    if (services.length === 0) return;

    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, 'Scope of Services', slideNum);

    const serviceDescriptions: Record<string, string> = {
        'PPC (Google Ads)': 'Search & display campaigns, keyword strategy, bid management, landing page optimisation',
        'Paid Social (Meta/TikTok/LinkedIn)': 'Audience targeting, creative testing, retargeting funnels, lookalike audiences',
        'SEO & Content Marketing': 'Technical SEO, content calendar, organic growth strategy, link building',
        'Email Marketing': 'Automation flows, segmentation, lifecycle campaigns, A/B testing',
        'Creative & Design': 'Ad creative, landing pages, brand assets, motion graphics',
        'Strategy & Consulting': 'Marketing audits, growth planning, quarterly reviews, competitive analysis',
        'Other': formData.scope?.otherService || 'Custom deliverables tailored to your requirements',
    };

    const rows: pptxgen.TableRow[] = [
        [
            { text: 'Service', options: { bold: true, color: COLORS.white, fill: { color: COLORS.primary }, fontSize: 13, fontFace: FONT, align: 'left' } },
            { text: "What's Included", options: { bold: true, color: COLORS.white, fill: { color: COLORS.primary }, fontSize: 13, fontFace: FONT, align: 'left' } },
            { text: 'Priority', options: { bold: true, color: COLORS.white, fill: { color: COLORS.primary }, fontSize: 13, fontFace: FONT, align: 'center' } },
        ],
    ];

    services.forEach((service, i) => {
        const desc = serviceDescriptions[service] || 'Tailored delivery based on your requirements';
        const priority = i === 0 ? 'High' : i === 1 ? 'Medium' : 'Standard';
        const priorityColor = i === 0 ? COLORS.warning : i === 1 ? COLORS.secondary : COLORS.muted;
        const rowBg = i % 2 === 0 ? COLORS.white : COLORS.light;
        rows.push([
            { text: service, options: { fontSize: 12, fontFace: FONT, color: COLORS.dark, bold: true, fill: { color: rowBg }, valign: 'middle' } },
            { text: desc, options: { fontSize: 11, fontFace: FONT, color: COLORS.muted, fill: { color: rowBg }, valign: 'middle' } },
            { text: priority, options: { fontSize: 11, fontFace: FONT, color: priorityColor, align: 'center', bold: true, fill: { color: rowBg }, valign: 'middle' } },
        ]);
    });

    const tableY = BODY_TOP + 0.15;
    const tableH = BODY_H - 0.3;
    slide.addTable(rows, {
        x: MARGIN, y: tableY, w: CONTENT_W,
        colW: [3.5, 6.63, 2.0],
        h: tableH,
        rowH: tableH / (rows.length),
        border: { type: 'solid', pt: 1, color: COLORS.mutedLight },
        valign: 'middle',
        autoPage: false,
    });

    addSlideFooter(slide, companyName, slideNum, total);
}

// ─── Closing slide ────────────────────────────────────────────────

export function addClosingSlide(pptx: pptxgen, formData: ProposalFormData, image: PexelsImage | null): void {
    const companyName = formData.company?.name?.trim() || 'Client';
    const slide = pptx.addSlide();

    if (image) {
        slide.background = { data: image.base64 };
        slide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
            fill: { color: COLORS.primaryDark, transparency: 20 },
        });
    } else {
        slide.background = { color: COLORS.primary };
    }

    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 0.15, h: SLIDE_H,
        fill: { color: COLORS.secondary },
    });

    slide.addText('Next Steps', {
        x: 1.0, y: 1.5, w: 11, h: 1.0,
        fontSize: 44, bold: true, color: COLORS.white,
        fontFace: FONT_LIGHT, align: 'center',
    });

    slide.addShape(pptx.ShapeType.rect, {
        x: 5.9, y: 2.6, w: 1.5, h: 0.04,
        fill: { color: COLORS.secondary },
    });

    slide.addText("Let's build something great together.", {
        x: 1.0, y: 2.9, w: 11, h: 0.6,
        fontSize: 20, color: COLORS.accentLight,
        fontFace: FONT, align: 'center',
    });

    const nextSteps = [
        'Review this proposal and share feedback',
        'Schedule a kickoff call to align on goals',
        'Approve scope and finalise engagement terms',
        'Launch campaign within agreed timeline',
    ];

    const cardW = 2.7;
    const cardH = 1.6;
    const cardGap = 0.25;
    const totalCardsW = cardW * 4 + cardGap * 3;
    const startX = (SLIDE_W - totalCardsW) / 2;
    const cardY = 3.9;

    nextSteps.forEach((step, i) => {
        const cx = startX + i * (cardW + cardGap);

        slide.addShape(pptx.ShapeType.roundRect, {
            x: cx, y: cardY, w: cardW, h: cardH,
            fill: { color: COLORS.primaryDark, transparency: 10 },
            line: { color: COLORS.secondary, width: 1 },
            rectRadius: 0.1,
        });

        slide.addShape(pptx.ShapeType.roundRect, {
            x: cx + cardW / 2 - 0.3, y: cardY + 0.2, w: 0.6, h: 0.6,
            fill: { color: COLORS.secondary },
            rectRadius: 0.3,
        });
        slide.addText(`${i + 1}`, {
            x: cx + cardW / 2 - 0.3, y: cardY + 0.2, w: 0.6, h: 0.6,
            fontSize: 20, bold: true, color: COLORS.white,
            fontFace: FONT, align: 'center', valign: 'middle',
        });

        slide.addText(step, {
            x: cx + 0.15, y: cardY + 0.9, w: cardW - 0.3, h: 0.6,
            fontSize: 11, color: COLORS.accentLight,
            fontFace: FONT, align: 'center', valign: 'top',
            lineSpacingMultiple: 1.2,
        });
    });

    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: SLIDE_H - 0.6, w: SLIDE_W, h: 0.6,
        fill: { color: COLORS.primaryDark },
    });
    slide.addText(`Prepared for ${companyName}  |  Cohorts`, {
        x: 1.0, y: SLIDE_H - 0.6, w: 11, h: 0.6,
        fontSize: 11, color: COLORS.muted,
        fontFace: FONT, align: 'center', valign: 'middle',
    });
}

// ─── TOC slide ────────────────────────────────────────────────────

export function addTocSlide(
    pptx: pptxgen,
    sections: { title: string; description: string }[],
    companyName: string,
    slideNum: number,
    total: number,
): void {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, 'Table of Contents', slideNum);

    const colW = 5.8;
    const colGap = 0.4;
    const rowH = 1.5;
    const rowGap = 0.25;
    const startX = MARGIN;
    const startY = BODY_TOP + 0.3;
    const perCol = Math.ceil(sections.length / 2);

    sections.forEach((section, i) => {
        const col = i < perCol ? 0 : 1;
        const row = i % perCol;
        const x = startX + col * (colW + colGap);
        const y = startY + row * (rowH + rowGap);

        slide.addShape(pptx.ShapeType.roundRect, {
            x, y, w: colW, h: rowH,
            fill: { color: COLORS.white }, line: { color: COLORS.mutedLight, width: 1 }, rectRadius: 0.08,
        });

        slide.addShape(pptx.ShapeType.rect, {
            x, y, w: 0.08, h: rowH,
            fill: { color: COLORS.secondary },
        });

        const num = String(i + 1).padStart(2, '0');
        slide.addText(num, {
            x: x + 0.25, y: y + 0.15, w: 0.8, h: 0.5,
            fontSize: 28, bold: true, color: COLORS.secondary,
            fontFace: FONT_LIGHT, align: 'left', valign: 'middle',
        });

        slide.addText(section.title, {
            x: x + 1.1, y: y + 0.15, w: colW - 1.3, h: 0.5,
            fontSize: 16, bold: true, color: COLORS.primary,
            fontFace: FONT, align: 'left', valign: 'middle', margin: 0,
        });

        slide.addText(section.description, {
            x: x + 1.1, y: y + 0.65, w: colW - 1.3, h: 0.7,
            fontSize: 12, color: COLORS.muted,
            fontFace: FONT, align: 'left', valign: 'top',
            margin: 0, lineSpacingMultiple: 1.2,
        });
    });

    addSlideFooter(slide, companyName, slideNum, total);
}

// ─── Section divider slide ────────────────────────────────────────

export function addSectionDivider(
    pptx: pptxgen,
    sectionNumber: number,
    sectionTitle: string,
    sectionSubtitle: string,
    slideNum: number,
    total: number,
    companyName: string,
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
        x: 0, y: 0, w: 0.3, h: SLIDE_H,
        fill: { color: COLORS.secondary },
    });

    const num = String(sectionNumber).padStart(2, '0');
    slide.addText(num, {
        x: 1.0, y: 1.2, w: 5, h: 3,
        fontSize: 120, bold: true, color: COLORS.secondary,
        fontFace: FONT_LIGHT, align: 'left', valign: 'middle',
        transparency: 20,
    });

    slide.addText(sectionTitle, {
        x: 1.0, y: 4.0, w: 10, h: 1.0,
        fontSize: 40, bold: true, color: COLORS.white,
        fontFace: FONT_LIGHT, align: 'left',
    });

    if (sectionSubtitle) {
        slide.addText(sectionSubtitle, {
            x: 1.0, y: 5.1, w: 10, h: 0.6,
            fontSize: 18, color: COLORS.accentLight,
            fontFace: FONT, align: 'left',
        });
    }

    slide.addText(`${slideNum} / ${total}`, {
        x: 11.5, y: SLIDE_H - 0.5, w: 1.2, h: 0.4,
        fontSize: 10, color: COLORS.muted,
        fontFace: FONT, align: 'right', valign: 'middle',
    });
    if (companyName) {
        slide.addText(companyName, {
            x: 1.0, y: SLIDE_H - 0.5, w: 6, h: 0.4,
            fontSize: 10, color: COLORS.muted,
            fontFace: FONT, align: 'left', valign: 'middle',
        });
    }
}
