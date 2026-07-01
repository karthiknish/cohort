/**
 * Custom proposal PDF generator — mirrors the PPTX deck structure using jsPDF.
 *
 * Produces a landscape 16:9 PDF with the Cohorts brand theme:
 *   1. Title / cover page
 *   2. Table of Contents
 *   3. Section dividers + content slides (from AI instructions)
 *   4. Services table (when scope data exists)
 *   5. Budget allocation chart + ROI projection charts (when budget exists)
 *   6. Closing / Next Steps page
 *
 * Chart images are fetched from the QuickChart API (same as PPTX) and embedded
 * as PNG images, guaranteeing consistent rendering across all PDF viewers.
 */

import { jsPDF } from 'jspdf';
import type { ProposalFormData } from '@/lib/proposals';
import { parseSlideInstructions, parseBudgetAmount } from '../pptx/parsing';
import { renderBarChart, renderLineChart } from '../chart-images';
import {
    COLORS, PAGE_W, PAGE_H, MARGIN, CONTENT_W,
    HEADER_H, FOOTER_H, BODY_TOP, BODY_BOTTOM, BODY_H, FONT,
} from './constants';
import type { PptxSlideContent } from '../pptx/types';

// ─── Helpers ──────────────────────────────────────────────────────

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
        const lh = lineHeight ?? size * 1.35;
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
        return BODY_TOP;
    }
    return y;
}

// ─── Page chrome ──────────────────────────────────────────────────

function addPageHeader(doc: jsPDF, title: string, slideNum: number): void {
    // Header bar
    fillRect(doc, 0, 0, PAGE_W, HEADER_H, COLORS.primary);
    // Accent stripe
    fillRect(doc, 0, HEADER_H, PAGE_W, 4, COLORS.secondary);
    // Title
    text(doc, title, MARGIN, HEADER_H / 2 + 6, {
        size: FONT.headerTitle, color: COLORS.white, bold: true, align: 'left',
    });
    // Slide number badge
    text(doc, String(slideNum), PAGE_W - MARGIN - 10, HEADER_H / 2 + 8, {
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

// ─── Title page ───────────────────────────────────────────────────

function addTitlePage(doc: jsPDF, formData: ProposalFormData): void {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const objectives = formData.goals?.objectives?.join(', ');

    // Full primary background
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);
    // Left accent stripe
    fillRect(doc, 0, 0, 11, PAGE_H, COLORS.secondary);

    // Company name (uppercase, top)
    text(doc, companyName.toUpperCase(), MARGIN + 20, 60, {
        size: FONT.subtitle, color: COLORS.accentLight, bold: true, align: 'left',
    });

    // Main heading
    text(doc, 'Marketing Proposal', MARGIN + 20, 170, {
        size: FONT.title, color: COLORS.white, bold: true, align: 'left',
    });

    // Accent divider
    drawLine(doc, MARGIN + 20, 190, MARGIN + 200, 190, COLORS.secondary, 3);

    // Subtitle (industry | objectives)
    const subtitleParts = [industry, objectives].filter(Boolean);
    if (subtitleParts.length > 0) {
        text(doc, subtitleParts.join('  |  '), MARGIN + 20, 220, {
            size: 16, color: COLORS.accentLight, align: 'left',
        });
    }

    // Prepared by footer
    fillRect(doc, 0, PAGE_H - 50, PAGE_W, 50, COLORS.primaryDark);
    text(doc, 'Prepared by Cohorts', MARGIN + 20, PAGE_H - 22, {
        size: 12, color: COLORS.accentLight, align: 'left',
    });
    const dateStr = new Date().toLocaleDateString('en-GB', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    text(doc, dateStr, PAGE_W - MARGIN - 20, PAGE_H - 22, {
        size: 12, color: COLORS.accentLight, align: 'right',
    });
}

// ─── Table of Contents ────────────────────────────────────────────

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

    const colW = 418;
    const colGap = 29;
    const rowH = 108;
    const rowGap = 18;
    const startX = MARGIN;
    const startY = BODY_TOP + 22;
    const perCol = Math.ceil(sections.length / 2);

    sections.forEach((section, i) => {
        const col = i < perCol ? 0 : 1;
        const row = i % perCol;
        const x = startX + col * (colW + colGap);
        const y = startY + row * (rowH + rowGap);

        // Card background
        doc.setFillColor(...rgb(COLORS.white));
        doc.setDrawColor(...rgb(COLORS.mutedLight));
        doc.setLineWidth(1);
        doc.roundedRect(x, y, colW, rowH, 6, 6, 'FD');
        // Accent strip
        fillRect(doc, x, y, 6, rowH, COLORS.secondary);

        const num = String(i + 1).padStart(2, '0');
        text(doc, num, x + 18, y + 36, {
            size: FONT.tocNum, color: COLORS.secondary, bold: true, align: 'left',
        });
        text(doc, section.title, x + 80, y + 30, {
            size: FONT.tocTitle, color: COLORS.primary, bold: true, align: 'left',
            maxWidth: colW - 95,
        });
        text(doc, section.description, x + 80, y + 52, {
            size: FONT.tocDesc, color: COLORS.muted, align: 'left',
            maxWidth: colW - 95, lineHeight: 14,
        });
    });

    addPageFooter(doc, companyName, slideNum, total);
}

// ─── Section divider ──────────────────────────────────────────────

function addSectionDivider(
    doc: jsPDF,
    sectionNumber: number,
    sectionTitle: string,
    sectionSubtitle: string,
    slideNum: number,
    total: number,
    companyName: string,
): void {
    addNewPage(doc);
    // Full primary background
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);
    // Left accent stripe
    fillRect(doc, 0, 0, 22, PAGE_H, COLORS.secondary);

    const num = String(sectionNumber).padStart(2, '0');
    // Big faded number
    doc.setFontSize(FONT.sectionNum);
    doc.setFont('helvetica', 'bold');
    // Simulate transparency by blending secondary with primary
    const blend = COLORS.secondary.map((s, i) => Math.round(s * 0.4 + (COLORS.primary[i] ?? 0) * 0.6)) as [number, number, number];
    doc.setTextColor(...blend);
    doc.text(num, MARGIN + 30, 200);

    // Section title
    text(doc, sectionTitle, MARGIN + 30, 300, {
        size: FONT.sectionTitle, color: COLORS.white, bold: true, align: 'left',
        maxWidth: PAGE_W - MARGIN * 2 - 60,
    });

    if (sectionSubtitle) {
        text(doc, sectionSubtitle, MARGIN + 30, 340, {
            size: 14, color: COLORS.accentLight, align: 'left',
            maxWidth: PAGE_W - MARGIN * 2 - 60, lineHeight: 18,
        });
    }

    // Footer info
    text(doc, `${slideNum} / ${total}`, PAGE_W - MARGIN - 10, PAGE_H - 25, {
        size: 10, color: COLORS.muted, align: 'right',
    });
    if (companyName) {
        text(doc, companyName, MARGIN + 10, PAGE_H - 25, {
            size: 10, color: COLORS.muted, align: 'left',
        });
    }
}

// ─── Content slide ────────────────────────────────────────────────

function addContentSlide(
    doc: jsPDF,
    slideContent: PptxSlideContent,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): void {
    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, slideContent.title, slideNum);

    const contentX = MARGIN + 10;
    const contentW = CONTENT_W - 220; // leave room for sidebar
    let y = BODY_TOP + 20;

    // Metrics row
    if (slideContent.metrics && slideContent.metrics.length > 0) {
        const metricW = contentW / slideContent.metrics.length;
        slideContent.metrics.forEach((metric, i) => {
            const mx = contentX + i * metricW;
            // Card background
            doc.setFillColor(...rgb(COLORS.white));
            doc.setDrawColor(...rgb(COLORS.mutedLight));
            doc.setLineWidth(1);
            doc.roundedRect(mx, y, metricW - 10, 60, 4, 4, 'FD');
            fillRect(doc, mx, y, 4, 60, COLORS.secondary);

            text(doc, metric.value, mx + 14, y + 28, {
                size: FONT.metricValue, color: COLORS.primary, bold: true, align: 'left',
            });
            text(doc, metric.label, mx + 14, y + 46, {
                size: FONT.metricLabel, color: COLORS.muted, align: 'left',
                maxWidth: metricW - 28, lineHeight: 11,
            });
        });
        y += 75;
    }

    // Comparison block
    if (slideContent.comparison) {
        const colW = (contentW - 20) / 2;
        // Before
        doc.setFillColor(...rgb(COLORS.white));
        doc.setDrawColor(...rgb(COLORS.mutedLight));
        doc.roundedRect(contentX, y, colW, 120, 4, 4, 'FD');
        fillRect(doc, contentX, y, 4, 120, COLORS.warning);
        text(doc, 'BEFORE', contentX + 14, y + 20, {
            size: FONT.panelLabel, color: COLORS.warning, bold: true, align: 'left',
        });
        let beforeY = y + 38;
        for (const item of slideContent.comparison.before) {
            const lines = text(doc, `•  ${item}`, contentX + 14, beforeY, {
                size: FONT.bodySmall, color: COLORS.dark, align: 'left',
                maxWidth: colW - 28, lineHeight: 14,
            });
            beforeY += lines.length * 14 + 4;
        }

        // After
        const afterX = contentX + colW + 20;
        doc.setFillColor(...rgb(COLORS.white));
        doc.setDrawColor(...rgb(COLORS.mutedLight));
        doc.roundedRect(afterX, y, colW, 120, 4, 4, 'FD');
        fillRect(doc, afterX, y, 4, 120, COLORS.success);
        text(doc, 'AFTER', afterX + 14, y + 20, {
            size: FONT.panelLabel, color: COLORS.success, bold: true, align: 'left',
        });
        let afterY = y + 38;
        for (const item of slideContent.comparison.after) {
            const lines = text(doc, `•  ${item}`, afterX + 14, afterY, {
                size: FONT.bodySmall, color: COLORS.dark, align: 'left',
                maxWidth: colW - 28, lineHeight: 14,
            });
            afterY += lines.length * 14 + 4;
        }
        y += 135;
    }

    // Bullets
    if (slideContent.bullets.length > 0) {
        for (const bullet of slideContent.bullets) {
            y = ensureSpace(doc, y, 30);
            const lines = text(doc, `•  ${bullet}`, contentX, y, {
                size: FONT.body, color: COLORS.dark, align: 'left',
                maxWidth: contentW, lineHeight: 18,
            });
            y += lines.length * 18 + 6;
        }
    }

    // Callout box
    if (slideContent.callout) {
        y = ensureSpace(doc, y, 50);
        y += 6;
        const calloutLines = doc.splitTextToSize(slideContent.callout, contentW - 30);
        const calloutH = Math.max(40, calloutLines.length * 16 + 16);
        doc.setFillColor(...rgb(COLORS.primary));
        doc.roundedRect(contentX, y, contentW, calloutH, 4, 4, 'F');
        fillRect(doc, contentX, y, 4, calloutH, COLORS.secondary);
        let calloutY = y + 18;
        doc.setFontSize(FONT.callout);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...rgb(COLORS.white));
        for (const line of calloutLines) {
            doc.text(line, contentX + 16, calloutY);
            calloutY += 16;
        }
        y += calloutH + 10;
    }

    // Sidebar with key stats
    addSidebar(doc, slideContent.title, formData);

    addPageFooter(doc, companyName, slideNum, total);
}

function addSidebar(doc: jsPDF, title: string, formData: ProposalFormData): void {
    const sidebarX = MARGIN + CONTENT_W - 200;
    const sidebarW = 190;
    const sidebarY = BODY_TOP + 10;
    const sidebarH = BODY_H - 20;

    // Card background
    doc.setFillColor(...rgb(COLORS.white));
    doc.setDrawColor(...rgb(COLORS.mutedLight));
    doc.roundedRect(sidebarX, sidebarY, sidebarW, sidebarH, 4, 4, 'FD');
    fillRect(doc, sidebarX, sidebarY, 4, sidebarH, COLORS.secondary);

    const stats = getSidebarStats(title, formData);

    text(doc, 'AT A GLANCE', sidebarX + 14, sidebarY + 20, {
        size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
    });

    if (stats.length === 0) {
        text(doc, 'Key Takeaway', sidebarX + 14, sidebarY + 45, {
            size: FONT.bodySmall, color: COLORS.muted, bold: true, align: 'left',
        });
        text(doc, 'A data-driven approach ensures every decision is backed by insights, not assumptions.', sidebarX + 14, sidebarY + 65, {
            size: 12, color: COLORS.dark, italic: true, align: 'left',
            maxWidth: sidebarW - 28, lineHeight: 16,
        });
        return;
    }

    let statY = sidebarY + 45;
    const statSpacing = (sidebarH - 60) / stats.length;
    for (const stat of stats) {
        text(doc, stat.label, sidebarX + 14, statY, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });
        text(doc, stat.value, sidebarX + 14, statY + 16, {
            size: FONT.panelValue, color: COLORS.dark, align: 'left',
            maxWidth: sidebarW - 28, lineHeight: 15,
        });
        statY += statSpacing;
    }
}

function getSidebarStats(title: string, formData: ProposalFormData): { label: string; value: string }[] {
    const lower = title.toLowerCase();
    if (lower.includes('company') || lower.includes('about') || lower.includes('overview')) {
        return [
            { label: 'Industry', value: formData.company?.industry || '—' },
            { label: 'Company Size', value: formData.company?.size || '—' },
            { label: 'Locations', value: formData.company?.locations?.split('\n')[0] || '—' },
        ];
    }
    if (lower.includes('market') || lower.includes('advertis') || lower.includes('channel')) {
        return [
            { label: 'Monthly Budget', value: formData.marketing?.budget || '—' },
            { label: 'Ad Accounts', value: formData.marketing?.adAccounts || '—' },
            { label: 'Platforms', value: formData.marketing?.platforms?.join(', ') || '—' },
        ];
    }
    if (lower.includes('goal') || lower.includes('objective') || lower.includes('target')) {
        return [
            { label: 'Objectives', value: formData.goals?.objectives?.join(', ') || '—' },
            { label: 'Audience', value: formData.goals?.audience?.substring(0, 80) || '—' },
        ];
    }
    if (lower.includes('scope') || lower.includes('service') || lower.includes('deliver')) {
        return [
            { label: 'Services', value: formData.scope?.services?.join(', ') || '—' },
            { label: 'Custom Needs', value: formData.scope?.otherService?.substring(0, 80) || '—' },
        ];
    }
    if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('phase')) {
        return [
            { label: 'Start', value: formData.timelines?.startTime || '—' },
            { label: 'Events', value: formData.timelines?.upcomingEvents?.substring(0, 80) || '—' },
        ];
    }
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('invest')) {
        return [
            { label: 'Budget', value: formData.marketing?.budget || '—' },
            { label: 'Engagement', value: formData.value?.engagementType || '—' },
        ];
    }
    if (lower.includes('audience') || lower.includes('customer') || lower.includes('persona')) {
        return [
            { label: 'Target', value: formData.goals?.audience?.substring(0, 80) || '—' },
            { label: 'Goals', value: formData.goals?.objectives?.join(', ') || '—' },
        ];
    }
    if (lower.includes('challenge') || lower.includes('problem') || lower.includes('barrier')) {
        return [
            { label: 'Barriers', value: formData.goals?.challenges?.join(', ') || '—' },
            { label: 'Custom', value: formData.goals?.customChallenge || '—' },
        ];
    }
    return [];
}

// ─── Services table ───────────────────────────────────────────────

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

    const serviceDescriptions: Record<string, string> = {
        'PPC (Google Ads)': 'Search & display campaigns, keyword strategy, bid management, landing page optimisation',
        'Paid Social (Meta/TikTok/LinkedIn)': 'Audience targeting, creative testing, retargeting funnels, lookalike audiences',
        'SEO & Content Marketing': 'Technical SEO, content calendar, organic growth strategy, link building',
        'Email Marketing': 'Automation flows, segmentation, lifecycle campaigns, A/B testing',
        'Creative & Design': 'Ad creative, landing pages, brand assets, motion graphics',
        'Strategy & Consulting': 'Marketing audits, growth planning, quarterly reviews, competitive analysis',
        'Other': formData.scope?.otherService || 'Custom deliverables tailored to your requirements',
    };

    const tableX = MARGIN + 10;
    const tableY = BODY_TOP + 15;
    const tableW = CONTENT_W - 20;
    const colWidths = [tableW * 0.28, tableW * 0.54, tableW * 0.18];
    const headerH = 32;
    const rowH = Math.min(50, (BODY_H - headerH - 20) / Math.max(services.length, 1));

    // Header row
    fillRect(doc, tableX, tableY, tableW, headerH, COLORS.primary);
    const headers = ['Service', "What's Included", 'Priority'];
    let hx = tableX;
    headers.forEach((h, i) => {
        text(doc, h, hx + 10, tableY + 20, {
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

        // Border
        drawLine(doc, tableX, ry, tableX + tableW, ry, COLORS.mutedLight, 0.5);

        const desc = serviceDescriptions[service] || 'Tailored delivery based on your requirements';
        const priority = i === 0 ? 'High' : i === 1 ? 'Medium' : 'Standard';
        const priorityColor = i === 0 ? COLORS.warning : i === 1 ? COLORS.secondary : COLORS.muted;

        let cx = tableX;
        text(doc, service, cx + 10, ry + rowH / 2 + 4, {
            size: FONT.tableCell, color: COLORS.dark, bold: true, align: 'left',
            maxWidth: colWidths[0]! - 20,
        });
        cx += colWidths[0]!;
        text(doc, desc, cx + 10, ry + rowH / 2 + 4, {
            size: FONT.tableCell, color: COLORS.muted, align: 'left',
            maxWidth: colWidths[1]! - 20, lineHeight: 13,
        });
        cx += colWidths[1]!;
        text(doc, priority, cx + colWidths[2]! / 2, ry + rowH / 2 + 4, {
            size: FONT.tableCell, color: priorityColor, bold: true, align: 'center',
        });
    });

    // Bottom border
    const bottomY = tableY + headerH + services.length * rowH;
    drawLine(doc, tableX, bottomY, tableX + tableW, bottomY, COLORS.mutedLight, 0.5);

    addPageFooter(doc, companyName, slideNum, total);
}

// ─── Budget allocation slide ──────────────────────────────────────

async function addBudgetAllocation(
    doc: jsPDF,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): Promise<void> {
    const budget = parseBudgetAmount(formData.marketing?.budget || '');
    if (!budget) return;

    addNewPage(doc);
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.light);
    addPageHeader(doc, 'Budget Allocation', slideNum);

    const services = formData.scope?.services || [];
    const channelLabels = services.length > 0
        ? services
        : ['PPC (Google Ads)', 'Paid Social', 'SEO & Content', 'Creative & Design'];
    const weights = [0.35, 0.25, 0.20, 0.12, 0.08].slice(0, channelLabels.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const labels = channelLabels.map(s => s.length > 22 ? s.substring(0, 20) + '…' : s);
    const values = weights.map(w => Math.round((w / totalWeight) * budget));

    // Fetch chart image
    const chartImg = await renderBarChart(
        labels,
        [{ label: 'Budget Allocation', data: values, color: '#2563EB' }],
        { width: 900, height: 600, horizontal: true, valueFormat: '£' },
    );

    const chartW = 560;
    const chartH = BODY_H - 30;
    const chartX = MARGIN + 10;
    const chartY = BODY_TOP + 10;

    if (chartImg) {
        // chartImg is "image/png;base64,..." — extract the base64 part
        const base64 = chartImg.replace(/^image\/png;base64,/, '');
        try {
            doc.addImage(base64, 'PNG', chartX, chartY, chartW, chartH, undefined, 'FAST');
        } catch {
            // Fallback to text if image embedding fails
            renderBudgetFallback(doc, labels, values, chartX, chartY, chartW);
        }
    } else {
        renderBudgetFallback(doc, labels, values, chartX, chartY, chartW);
    }

    // Summary panel on right
    const panelX = MARGIN + CONTENT_W - 290;
    const panelW = 280;
    const panelY = BODY_TOP + 10;
    const panelH = BODY_H - 20;

    doc.setFillColor(...rgb(COLORS.white));
    doc.setDrawColor(...rgb(COLORS.mutedLight));
    doc.roundedRect(panelX, panelY, panelW, panelH, 4, 4, 'FD');
    fillRect(doc, panelX, panelY, 4, panelH, COLORS.secondary);

    text(doc, 'MONTHLY INVESTMENT', panelX + 14, panelY + 22, {
        size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
    });
    text(doc, `£${budget.toLocaleString('en-GB')}`, panelX + 14, panelY + 50, {
        size: FONT.panelBigValue, color: COLORS.primary, bold: true, align: 'left',
    });

    drawLine(doc, panelX + 14, panelY + 65, panelX + panelW - 14, panelY + 65, COLORS.mutedLight, 1);

    let infoY = panelY + 85;
    const engagement = formData.value?.engagementType || '';
    if (engagement) {
        text(doc, 'ENGAGEMENT', panelX + 14, infoY, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });
        text(doc, engagement, panelX + 14, infoY + 18, {
            size: FONT.panelValue, color: COLORS.dark, align: 'left',
            maxWidth: panelW - 28,
        });
        infoY += 50;
    }

    const timeline = formData.timelines?.startTime || '';
    if (timeline) {
        text(doc, 'START TIMELINE', panelX + 14, infoY, {
            size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
        });
        text(doc, timeline, panelX + 14, infoY + 18, {
            size: FONT.panelValue, color: COLORS.dark, align: 'left',
            maxWidth: panelW - 28,
        });
    }

    // Annual projection box
    const annualY = panelY + panelH - 80;
    doc.setFillColor(...rgb(COLORS.light));
    doc.setDrawColor(...rgb(COLORS.secondary));
    doc.roundedRect(panelX + 10, annualY, panelW - 20, 60, 4, 4, 'FD');
    text(doc, 'PROJECTED ANNUAL', panelX + 20, annualY + 18, {
        size: FONT.panelLabel, color: COLORS.muted, bold: true, align: 'left',
    });
    text(doc, `£${(budget * 12).toLocaleString('en-GB')}`, panelX + 20, annualY + 42, {
        size: 18, color: COLORS.secondary, bold: true, align: 'left',
    });

    addPageFooter(doc, companyName, slideNum, total);
}

function renderBudgetFallback(
    doc: jsPDF,
    labels: string[],
    values: number[],
    x: number, y: number, w: number,
): void {
    text(doc, 'Budget Allocation by Channel', x, y + 20, {
        size: 16, color: COLORS.dark, bold: true, align: 'left',
    });
    let fy = y + 50;
    labels.forEach((label, i) => {
        text(doc, `•  ${label}: £${values[i]!.toLocaleString('en-GB')}`, x + 10, fy, {
            size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20,
        });
        fy += 24;
    });
}

// ─── ROI projection slide ─────────────────────────────────────────

async function addRoiProjection(
    doc: jsPDF,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): Promise<void> {
    const budget = parseBudgetAmount(formData.marketing?.budget || '');
    if (!budget) return;

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
            { width: 700, height: 600, title: 'Projected Leads per Month', valueFormat: '' },
        ),
        renderLineChart(
            ['Month 1', 'Month 2', 'Month 3'],
            [{ label: 'Cost per Lead (£)', data: [50, 35, 25], color: '#F59E0B' }],
            { width: 700, height: 600, title: 'Cost per Lead Trend (£)', valueFormat: '£', smooth: true },
        ),
    ]);

    const leftW = 430;
    const chartH = BODY_H - 30;
    const chartY = BODY_TOP + 10;

    // Left chart — leads
    if (leadsChart) {
        const base64 = leadsChart.replace(/^image\/png;base64,/, '');
        try {
            doc.addImage(base64, 'PNG', MARGIN + 10, chartY, leftW, chartH, undefined, 'FAST');
        } catch {
            renderLeadsFallback(doc, month1, month2, month3, MARGIN + 10, chartY, leftW);
        }
    } else {
        renderLeadsFallback(doc, month1, month2, month3, MARGIN + 10, chartY, leftW);
    }

    // Right chart — CPL
    const rightX = MARGIN + leftW + 30;
    const rightW = CONTENT_W - leftW - 30;
    if (cplChart) {
        const base64 = cplChart.replace(/^image\/png;base64,/, '');
        try {
            doc.addImage(base64, 'PNG', rightX, chartY, rightW, chartH, undefined, 'FAST');
        } catch {
            renderCplFallback(doc, rightX, chartY, rightW);
        }
    } else {
        renderCplFallback(doc, rightX, chartY, rightW);
    }

    addPageFooter(doc, companyName, slideNum, total);
}

function renderLeadsFallback(
    doc: jsPDF, m1: number, m2: number, m3: number,
    x: number, y: number, w: number,
): void {
    text(doc, 'Projected Leads per Month', x, y + 20, {
        size: 16, color: COLORS.dark, bold: true, align: 'left',
    });
    text(doc, `•  Month 1: ${m1} leads`, x + 10, y + 50, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20 });
    text(doc, `•  Month 2: ${m2} leads`, x + 10, y + 74, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20 });
    text(doc, `•  Month 3: ${m3} leads`, x + 10, y + 98, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20 });
}

function renderCplFallback(doc: jsPDF, x: number, y: number, w: number): void {
    text(doc, 'Cost per Lead Trend (£)', x, y + 20, {
        size: 16, color: COLORS.dark, bold: true, align: 'left',
    });
    text(doc, '•  Month 1: £50 per lead', x + 10, y + 50, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20 });
    text(doc, '•  Month 2: £35 per lead', x + 10, y + 74, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20 });
    text(doc, '•  Month 3: £25 per lead', x + 10, y + 98, { size: FONT.body, color: COLORS.dark, align: 'left', maxWidth: w - 20 });
}

// ─── Closing page ─────────────────────────────────────────────────

function addClosingPage(doc: jsPDF, formData: ProposalFormData): void {
    const companyName = formData.company?.name?.trim() || 'Client';
    addNewPage(doc);

    // Full primary background
    fillRect(doc, 0, 0, PAGE_W, PAGE_H, COLORS.primary);
    // Left accent stripe
    fillRect(doc, 0, 0, 11, PAGE_H, COLORS.secondary);

    // Heading
    text(doc, 'Next Steps', PAGE_W / 2, 120, {
        size: FONT.title, color: COLORS.white, bold: true, align: 'center',
    });

    // Accent divider
    drawLine(doc, PAGE_W / 2 - 54, 140, PAGE_W / 2 + 54, 140, COLORS.secondary, 3);

    text(doc, "Let's build something great together.", PAGE_W / 2, 170, {
        size: 16, color: COLORS.accentLight, align: 'center',
    });

    const nextSteps = [
        'Review this proposal and share feedback',
        'Schedule a kickoff call to align on goals',
        'Approve scope and finalise engagement terms',
        'Launch campaign within agreed timeline',
    ];

    const cardW = 200;
    const cardH = 115;
    const cardGap = 18;
    const totalCardsW = cardW * 4 + cardGap * 3;
    const startX = (PAGE_W - totalCardsW) / 2;
    const cardY = 240;

    nextSteps.forEach((step, i) => {
        const cx = startX + i * (cardW + cardGap);

        // Card background
        doc.setFillColor(...rgb(COLORS.primaryDark));
        doc.setDrawColor(...rgb(COLORS.secondary));
        doc.setLineWidth(1);
        doc.roundedRect(cx, cardY, cardW, cardH, 6, 6, 'FD');

        // Number circle
        doc.setFillColor(...rgb(COLORS.secondary));
        doc.circle(cx + cardW / 2, cardY + 25, 16, 'F');
        text(doc, String(i + 1), cx + cardW / 2, cardY + 30, {
            size: 16, color: COLORS.white, bold: true, align: 'center',
        });

        // Step text
        text(doc, step, cx + 10, cardY + 60, {
            size: FONT.bodySmall, color: COLORS.accentLight, align: 'center',
            maxWidth: cardW - 20, lineHeight: 14,
        });
    });

    // Footer
    fillRect(doc, 0, PAGE_H - 43, PAGE_W, 43, COLORS.primaryDark);
    text(doc, `Prepared for ${companyName}`, PAGE_W / 2, PAGE_H - 20, {
        size: 11, color: COLORS.muted, align: 'center',
    });
}

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generate a proposal PDF as an ArrayBuffer from slide instructions and proposal form data.
 * Mirrors the PPTX deck structure with the Cohorts brand theme.
 */
export async function generateProposalPdf(
    formData: ProposalFormData,
    instructions: string,
): Promise<ArrayBuffer> {
    const doc = new jsPDF({
        unit: 'pt',
        format: [PAGE_W, PAGE_H],
        orientation: 'landscape',
    });

    const companyName = formData.company?.name?.trim() || 'Client';

    // Parse AI-generated slides
    const aiSlides = parseSlideInstructions(instructions);

    // Determine which data-driven slides to include
    const hasBudget = parseBudgetAmount(formData.marketing?.budget || '') !== null;
    const hasServices = (formData.scope?.services || []).length > 0;

    // Build section structure for TOC + dividers
    const sections: { title: string; description: string; slideIndices: number[] }[] = [];

    if (aiSlides.length > 0) {
        const overviewCount = Math.min(3, Math.ceil(aiSlides.length / 2));
        sections.push({
            title: 'Company & Market Overview',
            description: 'Executive summary, company background, and market analysis',
            slideIndices: Array.from({ length: overviewCount }, (_, i) => i),
        });
        if (aiSlides.length > overviewCount) {
            sections.push({
                title: 'Strategy & Approach',
                description: 'Proposed marketing strategy, target audience, and campaign structure',
                slideIndices: Array.from({ length: aiSlides.length - overviewCount }, (_, i) => i + overviewCount),
            });
        }
    }

    if (hasServices) {
        sections.push({
            title: 'Scope of Services',
            description: 'Detailed breakdown of services and deliverables',
            slideIndices: [],
        });
    }
    if (hasBudget) {
        sections.push({
            title: 'Budget & ROI Projections',
            description: 'Investment breakdown and projected return on investment',
            slideIndices: [],
        });
    }

    // Calculate total slides
    const dividerCount = sections.length;
    const dataSlideCount = (hasServices ? 1 : 0) + (hasBudget ? 2 : 0);
    const totalSlides = 1 + 1 + aiSlides.length + dividerCount + dataSlideCount + 1;

    let currentSlideNum = 0;

    // 1. Title page
    addTitlePage(doc, formData);
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
        );

        // Content slides for this section
        if (section.slideIndices.length > 0) {
            for (const localIdx of section.slideIndices) {
                const slideContent = aiSlides[localIdx]!;
                currentSlideNum++;
                addContentSlide(
                    doc, slideContent, formData, companyName,
                    currentSlideNum, totalSlides,
                );
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
    addClosingPage(doc, formData);

    // Set document metadata
    doc.setProperties({
        title: `Marketing Proposal — ${companyName}`,
        subject: 'Marketing Proposal',
        author: 'Cohorts',
        creator: 'Cohorts',
    });

    return doc.output('arraybuffer') as ArrayBuffer;
}
