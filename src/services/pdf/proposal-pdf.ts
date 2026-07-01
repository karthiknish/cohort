/**
 * Custom proposal PDF generator — A4 portrait document with the Cohorts brand theme.
 *
 * Structure:
 *   1. Title / cover page (with hero image)
 *   2. Table of Contents
 *   3. Section dividers + content slides (from AI instructions, with images)
 *   4. Services table (when scope data exists)
 *   5. Budget allocation chart + ROI projection charts (when budget exists)
 *   6. Closing / Next Steps page (with image)
 *
 * Chart images are fetched from the QuickChart API (same as PPTX) and embedded
 * as PNG images. Slide images are fetched from Pexels/Unsplash (same as PPTX)
 * with cross-topic deduplication via `prefetchSlideImages`.
 */

import { jsPDF } from 'jspdf';
import type { ProposalFormData } from '@/lib/proposals';
import { parseBudgetAmount, detectCurrency, formatCurrency, type CurrencySymbol } from '../pptx/parsing';
import { renderBarChart, renderLineChart } from '../chart-images';
import { prefetchSlideImages, type PexelsImage } from '../pexels-images';
import { COHORTS_LOGO_WHITE_BASE64 } from '../pptx/logo-data';
import {
    COLORS, PAGE_W, PAGE_H, MARGIN, CONTENT_W,
    HEADER_H, FOOTER_H, BODY_TOP, BODY_BOTTOM, BODY_H, FONT,
} from './constants';
import type { PptxSlideContent } from '../pptx/types';
import {
    buildDeckStructure, buildSlideTopics,
    getServiceDescriptions, getSidebarStatsForKeyword,
    computeBudgetWeights,
} from '../proposal-deck-structure';
import { sidebarKeyword } from '../pptx/parsing';

// ─── Helpers ──────────────────────────────────────────────

function rgb(c: readonly [number, number, number]): [number, number, number] {
    return [c[0], c[1], c[2]];
}

function fillRect(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    color: readonly [number, number, number],
): void {
    doc.setFillColor(...rgb(color));
    doc.rect(x, y, w, h, 'F');
}

function drawLine(
    doc: jsPDF,
    x1: number, y1: number, x2: number, y2: number,
    color: readonly [number, number, number],
    width = 1,
): void {
    doc.setDrawColor(...rgb(color));
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
}

function text(
    doc: jsPDF,
    str: string,
    x: number, y: number,
    opts: {
        size?: number;
        color?: readonly [number, number, number];
        bold?: boolean;
        italic?: boolean;
        align?: 'left' | 'center' | 'right';
        maxWidth?: number;
        lineHeight?: number;
    } = {},
): string[] {
    const { size = FONT.body, color = COLORS.dark, bold, italic, align = 'left', maxWidth, lineHeight } = opts;
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : italic ? 'italic' : 'normal');
    doc.setTextColor(...rgb(color));
    if (maxWidth) {
        const lh = lineHeight ?? size * 1.4;
        const lines = doc.splitTextToSize(str, maxWidth);
        let cy = y;
        for (const line of lines) {
            doc.text(line, x, cy, { align });
            cy += lh;
        }
        return lines;
    }
    doc.text(str, x, y, { align });
    return [str];
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > BODY_BOTTOM - 10) {
        doc.addPage();
        fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
        return BODY_TOP;
    }
    return y;
}

/** Embed a Pexels image (base64 with MIME prefix) into the PDF. */
function addImage(
    doc: jsPDF,
    image: PexelsImage | null,
    x: number, y: number, w: number, h: number,
): boolean {
    if (!image) return false;
    try {
        const base64 = image.base64.replace(/^data:image\/[a-z]+;base64,/, '').replace(/^image\/[a-z]+;base64,/, '');
        doc.addImage(base64, 'PNG', x, y, w, h, undefined, 'FAST');
        return true;
    } catch {
        return false;
    }
}

/** Draw a rounded rect card with optional accent strip on the left. */
function drawCard(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    accentColor?: readonly [number, number, number],
    radius = 4,
): void {
    doc.setFillColor(...rgb(COLORS.white));
    doc.setDrawColor(...rgb(COLORS.mutedLight));
    doc.setLineWidth(0.8);
    doc.roundedRect(x, y, w, h, radius, radius, 'FD');
    if (accentColor) {
        fillRect(doc, x, y, 4, h, accentColor);
    }
}

// ─── Page chrome ──────────────────────────────────────────

function addPageHeader(doc: jsPDF, title: string, slideNum: number): void {
    fillRect(doc, 0, 0, PAGE_W, HEADER_H, COLORS.primary);
    fillRect(doc, 0, HEADER_H, PAGE_W, 3, COLORS.secondary);
    text(doc, title, MARGIN, HEADER_H / 2 + 5, {
        size: FONT.headerTitle, color: COLORS.white, bold: true, align: 'left',
        maxWidth: PAGE_W - MARGIN * 2 - 40,
    });
    text(doc, String(slideNum), PAGE_W - MARGIN - 8, HEADER_H / 2 + 6, {
        size: FONT.slideNum, color: COLORS.accentLight, bold: true, align: 'right',
    });
}

function addPageFooter(doc: jsPDF, companyName: string, slideNum: number, total: number): void {
    fillRect(doc, 0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, COLORS.mutedLight);
    if (companyName) {
        text(doc, companyName, MARGIN, PAGE_H - FOOTER_H / 2 + 3, {
            size: FONT.footer, color: COLORS.muted, align: 'left',
        });
    }
    text(doc, `${slideNum} / ${total}`, PAGE_W - MARGIN, PAGE_H - FOOTER_H / 2 + 3, {
        size: FONT.footer, color: COLORS.muted, align: 'right',
    });
}

function addNewPage(doc: jsPDF): void {
    doc.addPage();
}

// ─── Title page ───────────────────────────────────────────

function addTitlePage(doc: jsPDF, formData: ProposalFormData, image: PexelsImage | null): void {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const objectives = formData.goals?.objectives?.join(', ');

    // Full primary background
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);

    // Hero image — top half (with fallback to accent stripe if no image)
    const heroH = PAGE_H * 0.38;
    if (addImage(doc, image, 0, 0, PAGE_W, heroH)) {
        // Dark overlay on image for text legibility
        doc.setFillColor(...rgb(COLORS.primary));
        doc.setGState(doc.GState({ opacity: 0.45 }));
        doc.rect(0, 0, PAGE_W, heroH, 'F');
        doc.setGState(doc.GState({ opacity: 1 }));
    }
    // Left accent stripe
    fillRect(doc, 0, 0, 10, PAGE_H, COLORS.secondary);

    // Cohorts white logo — top right corner (600×337 aspect → ~80×45pt)
    const logoW = 80;
    const logoH = 45;
    const logoX = PAGE_W - MARGIN - logoW;
    const logoY = 24;
    try {
        const logoBase64 = COHORTS_LOGO_WHITE_BASE64.replace(/^image\/png;base64,/, '');
        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoW, logoH, undefined, 'FAST');
    } catch {
        // Logo embedding is non-fatal
    }

    // Company name (uppercase, below hero)
    const textStartY = heroH + 50;
    text(doc, companyName.toUpperCase(), MARGIN + 16, textStartY, {
        size: FONT.subtitle, color: COLORS.accentLight, bold: true, align: 'left',
    });

    // Main heading
    text(doc, 'Marketing Proposal', MARGIN + 16, textStartY + 44, {
        size: FONT.title, color: COLORS.white, bold: true, align: 'left',
        maxWidth: PAGE_W - MARGIN * 2 - 32,
    });

    // Accent divider
    drawLine(doc, MARGIN + 16, textStartY + 60, MARGIN + 160, textStartY + 60, COLORS.secondary, 3);

    // Subtitle (industry | objectives)
    const subtitleParts = [industry, objectives].filter(Boolean);
    if (subtitleParts.length > 0) {
        text(doc, subtitleParts.join('  |  '), MARGIN + 16, textStartY + 84, {
            size: 13, color: COLORS.accentLight, align: 'left',
            maxWidth: PAGE_W - MARGIN * 2 - 32, lineHeight: 18,
        });
    }

    // Prepared by footer
    fillRect(doc, 0, PAGE_H - 56, PAGE_W, 56, COLORS.primaryDark);
    text(doc, 'Prepared by Cohorts', MARGIN + 16, PAGE_H - 24, {
        size: 11, color: COLORS.accentLight, align: 'left',
    });
    const dateStr = new Date().toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    text(doc, dateStr, PAGE_W - MARGIN - 16, PAGE_H - 24, {
        size: 11, color: COLORS.accentLight, align: 'right',
    });
}

// ─── Table of Contents ────────────────────────────────────

function addTocPage(
    doc: jsPDF,
    sections: { title: string; description: string }[],
    companyName: string,
    slideNum: number,
    total: number,
): void {
    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, 'Table of Contents', slideNum);

    // Single column layout for A4 portrait
    const cardW = CONTENT_W;
    const cardH = 64;
    const cardGap = 12;
    const startX = MARGIN;
    const startY = BODY_TOP + 16;

    sections.forEach((section, i) => {
        const y = startY + i * (cardH + cardGap);
        if (y + cardH > BODY_BOTTOM - 10) return; // skip overflow

        drawCard(doc, startX, y, cardW, cardH, COLORS.secondary);

        const num = String(i + 1).padStart(2, '0');
        text(doc, num, startX + 16, y + 28, {
            size: FONT.tocNum, color: COLORS.secondary, bold: true, align: 'left',
        });
        text(doc, section.title, startX + 60, y + 24, {
            size: FONT.tocTitle, color: COLORS.primary, bold: true, align: 'left',
            maxWidth: cardW - 76,
        });
        text(doc, section.description, startX + 60, y + 42, {
            size: FONT.tocDesc, color: COLORS.muted, align: 'left',
            maxWidth: cardW - 76, lineHeight: 13,
        });
    });

    addPageFooter(doc, companyName, slideNum, total);
}

// ─── Section divider ──────────────────────────────────────

function addSectionDivider(
    doc: jsPDF,
    sectionNumber: number,
    sectionTitle: string,
    sectionSubtitle: string,
    slideNum: number,
    total: number,
    companyName: string,
    image: PexelsImage | null,
): void {
    addNewPage(doc);

    // Top half: image with primary overlay; bottom half: primary background
    const imageH = PAGE_H * 0.45;
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);

    if (addImage(doc, image, 0, 0, PAGE_W, imageH)) {
        doc.setFillColor(...rgb(COLORS.primary));
        doc.setGState(doc.GState({ opacity: 0.5 }));
        doc.rect(0, 0, PAGE_W, imageH, 'F');
        doc.setGState(doc.GState({ opacity: 1 }));
    }

    // Left accent stripe
    fillRect(doc, 0, 0, 18, PAGE_H, COLORS.secondary);

    const num = String(sectionNumber).padStart(2, '0');
    // Big faded number
    doc.setFontSize(FONT.sectionNum);
    doc.setFont('helvetica', 'bold');
    const blend = COLORS.secondary.map((s, i) => Math.round(s * 0.4 + (COLORS.primary[i] ?? 0) * 0.6)) as [number, number, number];
    doc.setTextColor(...blend);
    doc.text(num, MARGIN + 24, imageH + 70);

    // Section title
    text(doc, sectionTitle, MARGIN + 24, imageH + 110, {
        size: FONT.sectionTitle, color: COLORS.white, bold: true, align: 'left',
        maxWidth: PAGE_W - MARGIN * 2 - 48,
    });

    if (sectionSubtitle) {
        text(doc, sectionSubtitle, MARGIN + 24, imageH + 138, {
            size: 13, color: COLORS.accentLight, align: 'left',
            maxWidth: PAGE_W - MARGIN * 2 - 48, lineHeight: 17,
        });
    }

    // Footer info
    text(doc, `${slideNum} / ${total}`, PAGE_W - MARGIN - 8, PAGE_H - 20, {
        size: 10, color: COLORS.muted, align: 'right',
    });
    if (companyName) {
        text(doc, companyName, MARGIN + 8, PAGE_H - 20, {
            size: 10, color: COLORS.muted, align: 'left',
        });
    }
}

// ─── Content slide ────────────────────────────────────────

function addContentSlide(
    doc: jsPDF,
    slideContent: PptxSlideContent,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
    image: PexelsImage | null,
): void {
    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, slideContent.title, slideNum);

    // Content image — placed at top right, below header
    const imgW = 140;
    const imgH = 90;
    const imgX = PAGE_W - MARGIN - imgW;
    const imgY = BODY_TOP + 8;
    if (image) {
        addImage(doc, image, imgX, imgY, imgW, imgH);
    }

    // Content area — full width below image, or beside it
    const contentX = MARGIN + 8;
    const contentW = CONTENT_W - 16;
    let y = BODY_TOP + 16;

    // Metrics row
    if (slideContent.metrics && slideContent.metrics.length > 0) {
        const metricW = contentW / slideContent.metrics.length;
        slideContent.metrics.forEach((metric, i) => {
            const mx = contentX + i * metricW;
            drawCard(doc, mx, y, metricW - 8, 52, COLORS.secondary);
            text(doc, metric.value, mx + 12, y + 24, {
                size: FONT.metricValue, color: COLORS.primary, bold: true, align: 'left',
            });
            text(doc, metric.label, mx + 12, y + 40, {
                size: FONT.metricLabel, color: COLORS.muted, align: 'left',
                maxWidth: metricW - 24, lineHeight: 10,
            });
        });
        y += 64;
    }

    // If image is placed at top right, push content below it
    if (image && y < imgY + imgH + 12) {
        y = imgY + imgH + 16;
    }

    // Comparison block
    if (slideContent.comparison) {
        const colW = (contentW - 16) / 2;
        const compH = 100;
        // Before
        drawCard(doc, contentX, y, colW, compH, COLORS.warning);
        text(doc, 'BEFORE', contentX + 12, y + 18, {
            size: FONT.panelLabel, color: COLORS.warning, bold: true, align: 'left',
        });
        let beforeY = y + 34;
        for (const item of slideContent.comparison.before) {
            const lines = text(doc, `•  ${item}`, contentX + 12, beforeY, {
                size: FONT.bodySmall, color: COLORS.dark, align: 'left',
                maxWidth: colW - 24, lineHeight: 12,
            });
            beforeY += lines.length * 12 + 3;
        }

        // After
        const afterX = contentX + colW + 16;
        drawCard(doc, afterX, y, colW, compH, COLORS.success);
        text(doc, 'AFTER', afterX + 12, y + 18, {
            size: FONT.panelLabel, color: COLORS.success, bold: true, align: 'left',
        });
        let afterY = y + 34;
        for (const item of slideContent.comparison.after) {
            const lines = text(doc, `•  ${item}`, afterX + 12, afterY, {
                size: FONT.bodySmall, color: COLORS.dark, align: 'left',
                maxWidth: colW - 24, lineHeight: 12,
            });
            afterY += lines.length * 12 + 3;
        }
        y += compH + 16;
    }

    // Bullets
    if (slideContent.bullets.length > 0) {
        for (const bullet of slideContent.bullets) {
            y = ensureSpace(doc, y, 24);
            const lines = text(doc, `•  ${bullet}`, contentX, y, {
                size: FONT.body, color: COLORS.dark, align: 'left',
                maxWidth: contentW, lineHeight: 16,
            });
            y += lines.length * 16 + 5;
        }
    }

    // Callout box
    if (slideContent.callout) {
        y = ensureSpace(doc, y, 44);
        y += 6;
        const calloutLines = doc.splitTextToSize(slideContent.callout, contentW - 28);
        const calloutH = Math.max(36, calloutLines.length * 15 + 14);
        doc.setFillColor(...rgb(COLORS.primary));
        doc.roundedRect(contentX, y, contentW, calloutH, 4, 4, 'F');
        fillRect(doc, contentX, y, 4, calloutH, COLORS.secondary);
        let calloutY = y + 16;
        doc.setFontSize(FONT.callout);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...rgb(COLORS.white));
        for (const line of calloutLines) {
            doc.text(line, contentX + 14, calloutY);
            calloutY += 15;
        }
        y += calloutH + 10;
    }

    // Sidebar with key stats — placed at bottom as a full-width strip (avoids overlap)
    addSidebarStrip(doc, slideContent.title, formData, y);

    addPageFooter(doc, companyName, slideNum, total);
}

function addSidebarStrip(doc: jsPDF, title: string, formData: ProposalFormData, y: number): void {
    const stats = getSidebarStatsForKeyword(sidebarKeyword(title), formData, 60);
    if (stats.length === 0) return;

    y = ensureSpace(doc, y, 50);
    const stripH = 44;
    drawCard(doc, MARGIN + 8, y, CONTENT_W - 16, stripH, COLORS.secondary);

    const statW = (CONTENT_W - 32) / stats.length;
    stats.forEach((stat, i) => {
        const sx = MARGIN + 16 + i * statW;
        text(doc, stat.label, sx, y + 16, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
            maxWidth: statW - 12,
        });
        text(doc, stat.value, sx, y + 32, {
            size: FONT.panelValue, color: COLORS.dark, bold: true, align: 'left',
            maxWidth: statW - 12, lineHeight: 13,
        });
    });
}


// ─── Services table ───────────────────────────────────────

function addServicesTable(
    doc: jsPDF,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): void {
    const services = formData.scope?.services || [];
    if (services.length === 0) return;

    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, 'Scope of Services', slideNum);

    const serviceDescriptions = getServiceDescriptions(formData);

    const tableX = MARGIN + 8;
    const tableY = BODY_TOP + 12;
    const tableW = CONTENT_W - 16;
    const colWidths = [tableW * 0.26, tableW * 0.56, tableW * 0.18];
    const headerH = 28;
    const rowH = Math.min(44, (BODY_H - headerH - 20) / Math.max(services.length, 1));

    // Header row
    fillRect(doc, tableX, tableY, tableW, headerH, COLORS.primary);
    const headers = ['Service', "What's Included", 'Status'];
    let hx = tableX;
    headers.forEach((h, i) => {
        text(doc, h, hx + 8, tableY + 18, {
            size: FONT.tableHeader, color: COLORS.white, bold: true,
            align: i === 2 ? 'center' : 'left',
        });
        hx += colWidths[i]!;
    });

    // Data rows
    services.forEach((service, i) => {
        const ry = tableY + headerH + i * rowH;
        const rowBg = i % 2 === 0 ? COLORS.white : COLORS.light;
        fillRect(doc, tableX, ry, tableW, rowH, rowBg);
        drawLine(doc, tableX, ry, tableX + tableW, ry, COLORS.mutedLight, 0.5);

        const desc = serviceDescriptions[service] || 'Tailored delivery based on your requirements';
        const priority = 'Included';
        const priorityColor = COLORS.secondary;

        let cx = tableX;
        text(doc, service, cx + 8, ry + rowH / 2 + 3, {
            size: FONT.tableCell, color: COLORS.dark, bold: true, align: 'left',
            maxWidth: colWidths[0]! - 16,
        });
        cx += colWidths[0]!;
        text(doc, desc, cx + 8, ry + rowH / 2 + 3, {
            size: FONT.tableCell, color: COLORS.muted, align: 'left',
            maxWidth: colWidths[1]! - 16, lineHeight: 12,
        });
        cx += colWidths[1]!;
        text(doc, priority, cx + colWidths[2]! / 2, ry + rowH / 2 + 3, {
            size: FONT.tableCell, color: priorityColor, bold: true, align: 'center',
        });
    });

    const bottomY = tableY + headerH + services.length * rowH;
    drawLine(doc, tableX, bottomY, tableX + tableW, bottomY, COLORS.mutedLight, 0.5);

    addPageFooter(doc, companyName, slideNum, total);
}

// ─── Budget allocation slide ──────────────────────────────

async function addBudgetAllocation(
    doc: jsPDF,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): Promise<void> {
    const budget = parseBudgetAmount(formData.marketing?.budget || '');
    if (!budget) return;
    const currency = detectCurrency(formData.marketing?.budget || '');

    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, 'Budget Allocation', slideNum);

    const services = formData.scope?.services || [];
    const channelLabels = services.length > 0
        ? services
        : ['PPC (Google Ads)', 'Paid Social', 'SEO & Content', 'Creative & Design'];
    const weights = computeBudgetWeights(services).slice(0, channelLabels.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const labels = channelLabels.map(s => s.length > 20 ? s.substring(0, 18) + '…' : s);
    const values = weights.map(w => Math.round((w / totalWeight) * budget));

    const chartImg = await renderBarChart(
        labels,
        [{ label: 'Budget Allocation', data: values, color: '#2563EB' }],
        { width: 800, height: 500, horizontal: true, valueFormat: currency },
    );

    // Chart on top, summary panel below (portrait layout)
    const chartW = CONTENT_W - 16;
    const chartH = 260;
    const chartX = MARGIN + 8;
    const chartY = BODY_TOP + 8;

    if (chartImg) {
        const base64 = chartImg.replace(/^image\/png;base64,/, '');
        try {
            doc.addImage(base64, 'PNG', chartX, chartY, chartW, chartH, undefined, 'FAST');
        } catch {
            renderBudgetFallback(doc, labels, values, chartX, chartY, chartW, currency);
        }
    } else {
        renderBudgetFallback(doc, labels, values, chartX, chartY, chartW, currency);
    }

    // Summary panel below chart
    const panelY = chartY + chartH + 16;
    const panelH = BODY_BOTTOM - panelY - 10;
    const panelX = MARGIN + 8;
    const panelW = CONTENT_W - 16;

    drawCard(doc, panelX, panelY, panelW, panelH, COLORS.secondary);

    text(doc, 'MONTHLY INVESTMENT', panelX + 14, panelY + 20, {
        size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
    });
    text(doc, formatCurrency(budget, currency), panelX + 14, panelY + 42, {
        size: FONT.panelBigValue, color: COLORS.primary, bold: true, align: 'left',
    });

    drawLine(doc, panelX + 14, panelY + 56, panelX + panelW - 14, panelY + 56, COLORS.mutedLight, 0.8);

    // Two-column info below
    let infoY = panelY + 72;
    const colW = (panelW - 28) / 2;
    const engagement = formData.value?.engagementType || '';
    const timeline = formData.timelines?.startTime || '';

    if (engagement) {
        text(doc, 'ENGAGEMENT', panelX + 14, infoY, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });
        text(doc, engagement, panelX + 14, infoY + 16, {
            size: FONT.panelValue, color: COLORS.dark, align: 'left',
            maxWidth: colW - 14,
        });
    }
    if (timeline) {
        text(doc, 'START TIMELINE', panelX + 14 + colW, infoY, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });
        text(doc, timeline, panelX + 14 + colW, infoY + 16, {
            size: FONT.panelValue, color: COLORS.dark, align: 'left',
            maxWidth: colW - 14,
        });
    }

    // Annual projection box
    const annualY = panelY + panelH - 56;
    doc.setFillColor(...rgb(COLORS.light));
    doc.setDrawColor(...rgb(COLORS.secondary));
    doc.roundedRect(panelX + 10, annualY, panelW - 20, 44, 4, 4, 'FD');
    text(doc, 'PROJECTED ANNUAL', panelX + 18, annualY + 16, {
        size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
    });
    text(doc, formatCurrency(budget * 12, currency), panelX + 18, annualY + 36, {
        size: 16, color: COLORS.secondary, bold: true, align: 'left',
    });

    addPageFooter(doc, companyName, slideNum, total);
}

function renderBudgetFallback(
    doc: jsPDF,
    labels: string[],
    values: number[],
    x: number, y: number, w: number,
    currency: CurrencySymbol = '£',
): void {
    text(doc, 'Budget Allocation by Channel', x, y + 20, {
        size: 14, color: COLORS.dark, bold: true, align: 'left',
    });
    let fy = y + 44;
    labels.forEach((label, i) => {
        text(doc, `•  ${label}: ${formatCurrency(values[i]!, currency)}`, x + 8, fy, {
            size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16,
        });
        fy += 20;
    });
}

// ─── ROI projection slide ─────────────────────────────────

async function addRoiProjection(
    doc: jsPDF,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): Promise<void> {
    const budget = parseBudgetAmount(formData.marketing?.budget || '');
    if (!budget) return;
    const currency = detectCurrency(formData.marketing?.budget || '');

    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, 'Projected ROI (90-Day Outlook)', slideNum);

    const month1 = Math.round(budget / 50);
    const month2 = Math.round(budget / 35);
    const month3 = Math.round(budget / 25);

    const [leadsChart, cplChart] = await Promise.all([
        renderBarChart(
            ['Month 1', 'Month 2', 'Month 3'],
            [{ label: 'Projected Leads', data: [month1, month2, month3], color: '#2563EB' }],
            { width: 700, height: 500, title: 'Projected Leads per Month', valueFormat: '' },
        ),
        renderLineChart(
            ['Month 1', 'Month 2', 'Month 3'],
            [{ label: `Cost per Lead (${currency})`, data: [50, 35, 25], color: '#F59E0B' }],
            { width: 700, height: 500, title: `Cost per Lead Trend (${currency})`, valueFormat: currency, smooth: true },
        ),
    ]);

    // Stacked vertically for portrait — leads on top, CPL below
    const chartW = CONTENT_W - 16;
    const chartH = 280;
    const chartX = MARGIN + 8;
    const chartY = BODY_TOP + 8;

    // Leads chart
    if (leadsChart) {
        const base64 = leadsChart.replace(/^image\/png;base64,/, '');
        try {
            doc.addImage(base64, 'PNG', chartX, chartY, chartW, chartH, undefined, 'FAST');
        } catch {
            renderLeadsFallback(doc, month1, month2, month3, chartX, chartY, chartW);
        }
    } else {
        renderLeadsFallback(doc, month1, month2, month3, chartX, chartY, chartW);
    }

    // CPL chart below
    const cplY = chartY + chartH + 12;
    if (cplChart) {
        const base64 = cplChart.replace(/^image\/png;base64,/, '');
        try {
            doc.addImage(base64, 'PNG', chartX, cplY, chartW, chartH, undefined, 'FAST');
        } catch {
            renderCplFallback(doc, chartX, cplY, chartW, currency);
        }
    } else {
        renderCplFallback(doc, chartX, cplY, chartW, currency);
    }

    addPageFooter(doc, companyName, slideNum, total);
}

function renderLeadsFallback(
    doc: jsPDF, m1: number, m2: number, m3: number,
    x: number, y: number, w: number,
): void {
    text(doc, 'Projected Leads per Month', x, y + 20, {
        size: 14, color: COLORS.dark, bold: true, align: 'left',
    });
    text(doc, `•  Month 1: ${m1} leads`, x + 8, y + 44, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16 });
    text(doc, `•  Month 2: ${m2} leads`, x + 8, y + 64, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16 });
    text(doc, `•  Month 3: ${m3} leads`, x + 8, y + 84, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16 });
}

function renderCplFallback(doc: jsPDF, x: number, y: number, w: number, currency: CurrencySymbol = '£'): void {
    text(doc, `Cost per Lead Trend (${currency})`, x, y + 20, {
        size: 14, color: COLORS.dark, bold: true, align: 'left',
    });
    text(doc, `•  Month 1: ${currency}50 per lead`, x + 8, y + 44, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16 });
    text(doc, `•  Month 2: ${currency}35 per lead`, x + 8, y + 64, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16 });
    text(doc, `•  Month 3: ${currency}25 per lead`, x + 8, y + 84, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 16 });
}

// ─── Closing page ─────────────────────────────────────────

function addClosingPage(doc: jsPDF, formData: ProposalFormData, image: PexelsImage | null): void {
    const companyName = formData.company?.name?.trim() || 'Client';
    addNewPage(doc);

    // Top image area
    const imageH = PAGE_H * 0.35;
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);
    if (addImage(doc, image, 0, 0, PAGE_W, imageH)) {
        doc.setFillColor(...rgb(COLORS.primary));
        doc.setGState(doc.GState({ opacity: 0.5 }));
        doc.rect(0, 0, PAGE_W, imageH, 'F');
        doc.setGState(doc.GState({ opacity: 1 }));
    }
    fillRect(doc, 0, 0, 10, PAGE_H, COLORS.secondary);

    // Heading
    text(doc, 'Next Steps', PAGE_W / 2, imageH + 60, {
        size: FONT.title, color: COLORS.white, bold: true, align: 'center',
    });

    drawLine(doc, PAGE_W / 2 - 48, imageH + 76, PAGE_W / 2 + 48, imageH + 76, COLORS.secondary, 3);

    text(doc, "Let's build something great together.", PAGE_W / 2, imageH + 104, {
        size: 14, color: COLORS.accentLight, align: 'center',
    });

    const nextSteps = [
        'Review this proposal and share feedback',
        'Schedule a kickoff call to align on goals',
        'Approve scope and finalise engagement terms',
        'Launch campaign within agreed timeline',
    ];

    // 2×2 grid for portrait
    const cardW = 200;
    const cardH = 80;
    const cardGapX = 16;
    const cardGapY = 14;
    const gridW = cardW * 2 + cardGapX;
    const startX = (PAGE_W - gridW) / 2;
    const startY = imageH + 140;

    nextSteps.forEach((step, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = startX + col * (cardW + cardGapX);
        const cy = startY + row * (cardH + cardGapY);

        doc.setFillColor(...rgb(COLORS.primaryDark));
        doc.setDrawColor(...rgb(COLORS.secondary));
        doc.setLineWidth(1);
        doc.roundedRect(cx, cy, cardW, cardH, 6, 6, 'FD');

        // Number circle
        doc.setFillColor(...rgb(COLORS.secondary));
        doc.circle(cx + 20, cy + 20, 12, 'F');
        text(doc, String(i + 1), cx + 20, cy + 24, {
            size: 14, color: COLORS.white, bold: true, align: 'center',
        });

        text(doc, step, cx + 38, cy + 18, {
            size: FONT.bodySmall, color: COLORS.accentLight, align: 'left',
            maxWidth: cardW - 48, lineHeight: 13,
        });
    });

    // Footer
    fillRect(doc, 0, PAGE_H - 44, PAGE_W, 44, COLORS.primaryDark);
    text(doc, `Prepared for ${companyName}`, PAGE_W / 2, PAGE_H - 20, {
        size: 11, color: COLORS.muted, align: 'center',
    });
}

// ─── Main generator ───────────────────────────────────────

/**
 * Generate a proposal PDF as an ArrayBuffer from slide instructions and proposal form data.
 * A4 portrait format with the Cohorts brand theme and Pexels slide images.
 */
export async function generateProposalPdf(
    formData: ProposalFormData,
    instructions: string,
): Promise<ArrayBuffer> {
    const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait',
    });

    const companyName = formData.company?.name?.trim() || 'Client';

    // Build shared deck structure (content-aware section assignment)
    const structure = buildDeckStructure(formData, instructions);
    const { sections, aiSlides, hasBudget, hasServices, totalSlides } = structure;

    // Pre-fetch images from Pexels/Unsplash — same dedup pool as PPTX.
    const slideTopics = buildSlideTopics(structure);
    const slideImages = await prefetchSlideImages(slideTopics);
    let imageIdx = 0;

    let currentSlideNum = 0;

    // 1. Title page
    addTitlePage(doc, formData, slideImages[imageIdx] ?? null);
    imageIdx++;
    currentSlideNum++;

    // 2. Table of Contents
    currentSlideNum++;
    addTocPage(doc, sections, companyName, currentSlideNum, totalSlides);

    // 3. Content sections
    for (let secIdx = 0; secIdx < sections.length; secIdx++) {
        const section = sections[secIdx]!;

        // Section divider
        currentSlideNum++;
        addSectionDivider(
            doc, secIdx + 1, section.title, section.description,
            currentSlideNum, totalSlides, companyName,
            slideImages[imageIdx] ?? null,
        );
        imageIdx++;

        // Content slides for this section
        if (section.slideIndices.length > 0) {
            for (const localIdx of section.slideIndices) {
                const slideContent = aiSlides[localIdx]!;
                currentSlideNum++;
                addContentSlide(
                    doc, slideContent, formData, companyName,
                    currentSlideNum, totalSlides,
                    slideImages[imageIdx] ?? null,
                );
                imageIdx++;
            }
        } else if (hasServices && section.title.includes('Scope')) {
            currentSlideNum++;
            addServicesTable(doc, formData, companyName, currentSlideNum, totalSlides);
        } else if (hasBudget && section.title.includes('Budget')) {
            currentSlideNum++;
            await addBudgetAllocation(doc, formData, companyName, currentSlideNum, totalSlides);
            currentSlideNum++;
            await addRoiProjection(doc, formData, companyName, currentSlideNum, totalSlides);
        }
    }

    // 4. Closing page
    currentSlideNum++;
    addClosingPage(doc, formData, slideImages[imageIdx] ?? null);

    // Set document metadata
    doc.setProperties({
        title: `Marketing Proposal — ${companyName}`,
        subject: 'Marketing Proposal',
        author: 'Cohorts',
        creator: 'Cohorts',
    });

    return doc.output('arraybuffer') as ArrayBuffer;
}
