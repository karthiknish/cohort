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

    // Single column layout for A4 portrait — cards sized to fill the page
    const cardW = CONTENT_W;
    const cardGap = 12;
    const startX = MARGIN;
    const startY = BODY_TOP + 16;
    const availableH = BODY_BOTTOM - startY - 10;
    const cardH = Math.max(70, Math.min(100, (availableH - cardGap * (sections.length - 1)) / Math.max(sections.length, 1)));

    sections.forEach((section, i) => {
        const y = startY + i * (cardH + cardGap);

        drawCard(doc, startX, y, cardW, cardH, COLORS.secondary);

        const num = String(i + 1).padStart(2, '0');
        text(doc, num, startX + 16, y + 32, {
            size: FONT.tocNum, color: COLORS.secondary, bold: true, align: 'left',
        });
        text(doc, section.title, startX + 60, y + 28, {
            size: FONT.tocTitle, color: COLORS.primary, bold: true, align: 'left',
            maxWidth: cardW - 76,
        });
        text(doc, section.description, startX + 60, y + 46, {
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
    slideTitles?: string[],
): void {
    addNewPage(doc);

    // Top 40%: image with primary overlay; bottom 60%: primary background with content
    const imageH = PAGE_H * 0.40;
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
    doc.text(num, MARGIN + 24, imageH + 60);

    // Section title
    text(doc, sectionTitle, MARGIN + 24, imageH + 96, {
        size: FONT.sectionTitle, color: COLORS.white, bold: true, align: 'left',
        maxWidth: PAGE_W - MARGIN * 2 - 48,
    });

    if (sectionSubtitle) {
        text(doc, sectionSubtitle, MARGIN + 24, imageH + 122, {
            size: 13, color: COLORS.accentLight, align: 'left',
            maxWidth: PAGE_W - MARGIN * 2 - 48, lineHeight: 17,
        });
    }

    // Key topics list from slide titles
    if (slideTitles && slideTitles.length > 0) {
        const topicsY = imageH + 160;
        text(doc, 'IN THIS SECTION', MARGIN + 24, topicsY, {
            size: FONT.panelLabel, color: COLORS.accentLight, bold: true, align: 'left',
        });
        drawLine(doc, MARGIN + 24, topicsY + 8, MARGIN + 140, topicsY + 8, COLORS.secondary, 2);

        let ty = topicsY + 28;
        for (const title of slideTitles) {
            // Bullet circle
            doc.setFillColor(...rgb(COLORS.secondary));
            doc.circle(MARGIN + 30, ty - 3, 2.5, 'F');
            text(doc, title, MARGIN + 40, ty, {
                size: 12, color: COLORS.white, align: 'left',
                maxWidth: PAGE_W - MARGIN * 2 - 64, lineHeight: 16,
            });
            ty += 24;
        }
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

    // Content image — large banner across full width below header
    const imgW = CONTENT_W;
    const imgH = 130;
    const imgX = MARGIN;
    const imgY = BODY_TOP + 8;
    if (image) {
        addImage(doc, image, imgX, imgY, imgW, imgH);
    }

    // Content area — full width below image
    const contentX = MARGIN + 8;
    const contentW = CONTENT_W - 16;
    let y = imgY + imgH + 16;

    // Metrics row
    if (slideContent.metrics && slideContent.metrics.length > 0) {
        const metricW = contentW / slideContent.metrics.length;
        const metricH = 58;
        slideContent.metrics.forEach((metric, i) => {
            const mx = contentX + i * metricW;
            drawCard(doc, mx, y, metricW - 8, metricH, COLORS.secondary);
            text(doc, metric.value, mx + 12, y + 26, {
                size: FONT.metricValue, color: COLORS.primary, bold: true, align: 'left',
            });
            text(doc, metric.label, mx + 12, y + 44, {
                size: FONT.metricLabel, color: COLORS.muted, align: 'left',
                maxWidth: metricW - 24, lineHeight: 10,
            });
        });
        y += metricH + 14;
    }

    // Comparison block
    if (slideContent.comparison) {
        const colW = (contentW - 16) / 2;
        const compH = 120;
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

    // Bullets — render in a card to fill space
    if (slideContent.bullets.length > 0) {
        // Calculate height needed for bullets
        let bulletH = 0;
        for (const bullet of slideContent.bullets) {
            const lines = doc.splitTextToSize(`•  ${bullet}`, contentW - 24);
            bulletH += lines.length * 16 + 5;
        }
        bulletH += 20; // padding

        // Draw a card around bullets
        drawCard(doc, contentX, y, contentW, bulletH, COLORS.accent);
        let bulletY = y + 14;
        for (const bullet of slideContent.bullets) {
            bulletY = ensureSpace(doc, bulletY, 24);
            const lines = text(doc, `•  ${bullet}`, contentX + 12, bulletY, {
                size: FONT.body, color: COLORS.dark, align: 'left',
                maxWidth: contentW - 24, lineHeight: 16,
            });
            bulletY += lines.length * 16 + 5;
        }
        y += bulletH + 14;
    }

    // Callout box
    if (slideContent.callout) {
        y = ensureSpace(doc, y, 44);
        const calloutLines = doc.splitTextToSize(slideContent.callout, contentW - 28);
        const calloutH = Math.max(40, calloutLines.length * 15 + 16);
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

    // Sidebar with key stats — pinned to bottom of page as a full-width strip
    const stats = getSidebarStatsForKeyword(sidebarKeyword(slideContent.title), formData, 60);
    if (stats.length > 0) {
        const stripH = 56;
        const stripY = BODY_BOTTOM - stripH - 8;
        // Only draw if there's room (avoid overlap with content)
        if (y < stripY - 6) {
            drawCard(doc, MARGIN + 8, stripY, CONTENT_W - 16, stripH, COLORS.secondary);
            const statW = (CONTENT_W - 32) / stats.length;
            stats.forEach((stat, i) => {
                const sx = MARGIN + 16 + i * statW;
                text(doc, stat.label, sx, stripY + 18, {
                    size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
                    maxWidth: statW - 12,
                });
                text(doc, stat.value, sx, stripY + 36, {
                    size: FONT.panelValue, color: COLORS.dark, bold: true, align: 'left',
                    maxWidth: statW - 12, lineHeight: 13,
                });
            });
        }
    }

    addPageFooter(doc, companyName, slideNum, total);
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
    const rowH = Math.min(48, (BODY_H - headerH - 20) / Math.max(services.length, 1));

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
        text(doc, 'Included', cx + colWidths[2]! / 2, ry + rowH / 2 + 3, {
            size: FONT.tableCell, color: COLORS.secondary, bold: true, align: 'center',
        });
    });

    const bottomY = tableY + headerH + services.length * rowH;
    drawLine(doc, tableX, bottomY, tableX + tableW, bottomY, COLORS.mutedLight, 0.5);

    // Engagement summary panel below table to fill the page
    const panelY = bottomY + 20;
    const panelH = BODY_BOTTOM - panelY - 10;
    if (panelH > 60) {
        drawCard(doc, tableX, panelY, tableW, panelH, COLORS.secondary);

        let summaryY = panelY + 20;
        text(doc, 'ENGAGEMENT OVERVIEW', tableX + 14, summaryY, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });
        summaryY += 18;

        const colW = (tableW - 28) / 2;
        const engagement = formData.value?.engagementType || '';
        const timeline = formData.timelines?.startTime || '';
        const objectives = formData.goals?.objectives?.join(', ') || '';
        const audience = formData.goals?.audience || '';
        const challenges = formData.goals?.challenges?.join(', ') || '';
        const customNeeds = formData.scope?.otherService || '';

        const leftItems: [string, string][] = [];
        if (engagement) leftItems.push(['Engagement Type', engagement]);
        if (timeline) leftItems.push(['Start Timeline', timeline]);
        if (objectives) leftItems.push(['Objectives', objectives]);
        if (audience) leftItems.push(['Target Audience', audience.substring(0, 120)]);

        const rightItems: [string, string][] = [];
        if (challenges) rightItems.push(['Key Challenges', challenges]);
        if (customNeeds) rightItems.push(['Custom Needs', customNeeds.substring(0, 120)]);
        rightItems.push(['Total Services', String(services.length)]);

        for (const [label, value] of leftItems) {
            text(doc, label, tableX + 14, summaryY, {
                size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
            });
            const valLines = text(doc, value, tableX + 14, summaryY + 14, {
                size: FONT.panelValue, color: COLORS.dark, align: 'left',
                maxWidth: colW - 14, lineHeight: 14,
            });
            summaryY += 14 + valLines.length * 14 + 10;
        }

        let rightY = panelY + 38;
        for (const [label, value] of rightItems) {
            text(doc, label, tableX + 14 + colW, rightY, {
                size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
            });
            const valLines = text(doc, value, tableX + 14 + colW, rightY + 14, {
                size: FONT.panelValue, color: COLORS.dark, align: 'left',
                maxWidth: colW - 14, lineHeight: 14,
            });
            rightY += 14 + valLines.length * 14 + 10;
        }
    }

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
    const chartH = 240;
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

    // Channel breakdown table below chart
    const tableY = chartY + chartH + 12;
    const tableX = MARGIN + 8;
    const tableW = CONTENT_W - 16;
    const colW = [tableW * 0.40, tableW * 0.30, tableW * 0.30];
    const bdHeaderH = 24;
    const bdRowH = 22;

    // Header
    fillRect(doc, tableX, tableY, tableW, bdHeaderH, COLORS.primary);
    text(doc, 'Channel', tableX + 8, tableY + 16, { size: FONT.tableHeader, color: COLORS.white, bold: true, align: 'left' });
    text(doc, 'Monthly', tableX + colW[0]! + 8, tableY + 16, { size: FONT.tableHeader, color: COLORS.white, bold: true, align: 'left' });
    text(doc, '% of Budget', tableX + colW[0]! + colW[1]! + colW[2]! / 2, tableY + 16, { size: FONT.tableHeader, color: COLORS.white, bold: true, align: 'center' });

    labels.forEach((label, i) => {
        const ry = tableY + bdHeaderH + i * bdRowH;
        const rowBg = i % 2 === 0 ? COLORS.white : COLORS.light;
        fillRect(doc, tableX, ry, tableW, bdRowH, rowBg);
        drawLine(doc, tableX, ry, tableX + tableW, ry, COLORS.mutedLight, 0.5);
        text(doc, label, tableX + 8, ry + 15, { size: FONT.tableCell, color: COLORS.dark, bold: true, align: 'left', maxWidth: colW[0]! - 16 });
        text(doc, formatCurrency(values[i]!, currency), tableX + colW[0]! + 8, ry + 15, { size: FONT.tableCell, color: COLORS.dark, align: 'left' });
        const pct = Math.round((weights[i]! / totalWeight) * 100);
        text(doc, `${pct}%`, tableX + colW[0]! + colW[1]! + colW[2]! / 2, ry + 15, { size: FONT.tableCell, color: COLORS.secondary, bold: true, align: 'center' });
    });
    const bdBottom = tableY + bdHeaderH + labels.length * bdRowH;
    drawLine(doc, tableX, bdBottom, tableX + tableW, bdBottom, COLORS.mutedLight, 0.5);

    // Summary panel below table
    const panelY = bdBottom + 14;
    const panelH = BODY_BOTTOM - panelY - 10;
    const panelX = MARGIN + 8;
    const panelW = CONTENT_W - 16;

    if (panelH > 50) {
        drawCard(doc, panelX, panelY, panelW, panelH, COLORS.secondary);

        const colW2 = (panelW - 28) / 3;
        text(doc, 'MONTHLY INVESTMENT', panelX + 14, panelY + 18, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
        text(doc, formatCurrency(budget, currency), panelX + 14, panelY + 38, { size: FONT.panelBigValue, color: COLORS.primary, bold: true, align: 'left' });

        const engagement = formData.value?.engagementType || '';
        const timeline = formData.timelines?.startTime || '';

        if (engagement) {
            text(doc, 'ENGAGEMENT', panelX + 14 + colW2, panelY + 18, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
            text(doc, engagement, panelX + 14 + colW2, panelY + 38, { size: FONT.panelValue, color: COLORS.dark, align: 'left', maxWidth: colW2 - 14 });
        }
        if (timeline) {
            text(doc, 'START TIMELINE', panelX + 14 + colW2 * 2, panelY + 18, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
            text(doc, timeline, panelX + 14 + colW2 * 2, panelY + 38, { size: FONT.panelValue, color: COLORS.dark, align: 'left', maxWidth: colW2 - 14 });
        }

        // Annual projection box
        const annualY = panelY + panelH - 42;
        doc.setFillColor(...rgb(COLORS.light));
        doc.setDrawColor(...rgb(COLORS.secondary));
        doc.roundedRect(panelX + 10, annualY, panelW - 20, 34, 4, 4, 'FD');
        text(doc, 'PROJECTED ANNUAL', panelX + 18, annualY + 14, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
        text(doc, formatCurrency(budget * 12, currency), panelX + panelW - 18, annualY + 14, { size: 14, color: COLORS.secondary, bold: true, align: 'right' });
    }

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

    // Stacked vertically for portrait — leads on top, CPL below, assumptions panel at bottom
    const chartW = CONTENT_W - 16;
    const chartH = 220;
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
    const cplY = chartY + chartH + 10;
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

    // Assumptions & summary panel below charts
    const panelY = cplY + chartH + 12;
    const panelH = BODY_BOTTOM - panelY - 10;
    const panelX = MARGIN + 8;
    const panelW = CONTENT_W - 16;

    if (panelH > 50) {
        drawCard(doc, panelX, panelY, panelW, panelH, COLORS.secondary);

        text(doc, 'PROJECTION ASSUMPTIONS', panelX + 14, panelY + 18, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });

        const colW = (panelW - 28) / 3;
        const totalLeads = month1 + month2 + month3;
        const avgCpl = Math.round(budget / (totalLeads / 3));
        const totalSpend = budget * 3;

        // Three-column metrics
        text(doc, 'TOTAL LEADS (90 DAYS)', panelX + 14, panelY + 38, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
        text(doc, String(totalLeads), panelX + 14, panelY + 56, { size: FONT.panelBigValue, color: COLORS.primary, bold: true, align: 'left' });

        text(doc, 'AVG COST PER LEAD', panelX + 14 + colW, panelY + 38, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
        text(doc, formatCurrency(avgCpl, currency), panelX + 14 + colW, panelY + 56, { size: FONT.panelBigValue, color: COLORS.primary, bold: true, align: 'left' });

        text(doc, 'TOTAL SPEND (90 DAYS)', panelX + 14 + colW * 2, panelY + 38, { size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left' });
        text(doc, formatCurrency(totalSpend, currency), panelX + 14 + colW * 2, panelY + 56, { size: FONT.panelBigValue, color: COLORS.primary, bold: true, align: 'left' });

        drawLine(doc, panelX + 14, panelY + 72, panelX + panelW - 14, panelY + 72, COLORS.mutedLight, 0.8);

        // Assumptions text
        const assumptions = [
            'Lead generation improves as campaigns optimise over the 90-day period.',
            'Cost per lead decreases from month 1 to month 3 as targeting and creative mature.',
            'Projections are based on industry benchmarks and will be refined with live data.',
            'Actual results depend on market conditions, competition, and landing page quality.',
        ];
        let ay = panelY + 88;
        for (const assumption of assumptions) {
            const lines = text(doc, `•  ${assumption}`, panelX + 14, ay, {
                size: FONT.bodySmall, color: COLORS.dark, align: 'left',
                maxWidth: panelW - 28, lineHeight: 12,
            });
            ay += lines.length * 12 + 4;
        }
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
    const imageH = PAGE_H * 0.30;
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);
    if (addImage(doc, image, 0, 0, PAGE_W, imageH)) {
        doc.setFillColor(...rgb(COLORS.primary));
        doc.setGState(doc.GState({ opacity: 0.5 }));
        doc.rect(0, 0, PAGE_W, imageH, 'F');
        doc.setGState(doc.GState({ opacity: 1 }));
    }
    fillRect(doc, 0, 0, 10, PAGE_H, COLORS.secondary);

    // Heading
    text(doc, 'Next Steps', PAGE_W / 2, imageH + 50, {
        size: FONT.title, color: COLORS.white, bold: true, align: 'center',
    });

    drawLine(doc, PAGE_W / 2 - 48, imageH + 66, PAGE_W / 2 + 48, imageH + 66, COLORS.secondary, 3);

    text(doc, "Let's build something great together.", PAGE_W / 2, imageH + 92, {
        size: 14, color: COLORS.accentLight, align: 'center',
    });

    const nextSteps = [
        'Review this proposal and share feedback within 5 business days',
        'Schedule a kickoff call to align on goals and success metrics',
        'Approve scope and finalise engagement terms',
        'Launch campaign within agreed timeline and begin onboarding',
    ];

    // 2×2 grid for portrait — wider cards to fill the page
    const cardW = 220;
    const cardH = 90;
    const cardGapX = 16;
    const cardGapY = 14;
    const gridW = cardW * 2 + cardGapX;
    const startX = (PAGE_W - gridW) / 2;
    const startY = imageH + 120;

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
        doc.circle(cx + 22, cy + 22, 13, 'F');
        text(doc, String(i + 1), cx + 22, cy + 27, {
            size: 14, color: COLORS.white, bold: true, align: 'center',
        });

        text(doc, step, cx + 42, cy + 20, {
            size: FONT.bodySmall, color: COLORS.accentLight, align: 'left',
            maxWidth: cardW - 52, lineHeight: 13,
        });
    });

    // Contact / summary panel below the grid
    const panelY = startY + cardH * 2 + cardGapY + 20;
    const panelH = PAGE_H - 44 - panelY - 10;
    if (panelH > 40) {
        const panelX = MARGIN + 20;
        const panelW = PAGE_W - MARGIN * 2 - 40;
        doc.setFillColor(...rgb(COLORS.primaryDark));
        doc.setDrawColor(...rgb(COLORS.secondary));
        doc.setLineWidth(0.8);
        doc.roundedRect(panelX, panelY, panelW, panelH, 6, 6, 'FD');

        text(doc, 'GET IN TOUCH', panelX + 16, panelY + 20, {
            size: FONT.panelLabel, color: COLORS.accentLight, bold: true, align: 'left',
        });

        const colW = (panelW - 32) / 2;
        const objectives = formData.goals?.objectives?.join(', ') || '';
        const services = formData.scope?.services?.join(', ') || '';
        const budget = formData.marketing?.budget || '';

        if (objectives) {
            text(doc, 'PROPOSAL OBJECTIVES', panelX + 16, panelY + 40, {
                size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
            });
            const lines = text(doc, objectives, panelX + 16, panelY + 56, {
                size: 11, color: COLORS.white, align: 'left',
                maxWidth: colW - 16, lineHeight: 14,
            });
            void lines;
        }

        const rightX = panelX + 16 + colW;
        if (services) {
            text(doc, 'SCOPE', rightX, panelY + 40, {
                size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
            });
            text(doc, services, rightX, panelY + 56, {
                size: 11, color: COLORS.white, align: 'left',
                maxWidth: colW - 16, lineHeight: 14,
            });
        }

        if (budget) {
            text(doc, 'INVESTMENT', rightX, panelY + 80, {
                size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
            });
            text(doc, budget, rightX, panelY + 96, {
                size: 12, color: COLORS.accentLight, bold: true, align: 'left',
            });
        }
    }

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
        const slideTitles = section.slideIndices.length > 0
            ? section.slideIndices.map((idx) => aiSlides[idx]!.title)
            : undefined;
        addSectionDivider(
            doc, secIdx + 1, section.title, section.description,
            currentSlideNum, totalSlides, companyName,
            slideImages[imageIdx] ?? null,
            slideTitles,
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
