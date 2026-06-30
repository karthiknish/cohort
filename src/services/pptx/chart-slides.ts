/**
 * Chart slides — budget allocation and ROI projection.
 *
 * Charts are rendered as PNG images via the QuickChart API (Chart.js)
 * to guarantee consistent rendering across all PowerPoint viewers.
 * Native PPTX charts have rendering issues in many viewers.
 */

import type pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import { renderBarChart, renderLineChart } from '../chart-images';
import {
    COLORS, FONT, FONT_LIGHT, SLIDE_W, MARGIN,
    BODY_TOP, BODY_H,
} from './constants';
import { parseBudgetAmount } from './parsing';
import { addSlideHeader, addSlideFooter } from './shared-elements';

export async function addBudgetAllocationSlide(
    pptx: pptxgen,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): Promise<void> {
    const budget = parseBudgetAmount(formData.marketing?.budget || '');
    if (!budget) return;

    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, 'Budget Allocation', slideNum);

    const services = formData.scope?.services || [];
    const channelLabels = services.length > 0
        ? services
        : ['PPC (Google Ads)', 'Paid Social', 'SEO & Content', 'Creative & Design'];
    const weights = [0.35, 0.25, 0.20, 0.12, 0.08].slice(0, channelLabels.length);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const labels = channelLabels.map(s => s.length > 22 ? s.substring(0, 20) + '…' : s);
    const values = weights.map(w => Math.round((w / totalWeight) * budget));

    const chartImg = await renderBarChart(
        labels,
        [{ label: 'Budget Allocation', data: values, color: '#2563EB' }],
        { width: 900, height: 600, horizontal: true, valueFormat: '£' },
    );

    if (chartImg) {
        slide.addImage({
            data: chartImg,
            x: MARGIN, y: BODY_TOP + 0.2, w: 7.8, h: BODY_H - 0.4,
            sizing: { type: 'contain', w: 7.8, h: BODY_H - 0.4 },
        });
    } else {
        slide.addText('Budget Allocation by Channel', {
            x: MARGIN, y: BODY_TOP + 0.3, w: 7.8, h: 0.4,
            fontSize: 16, bold: true, color: COLORS.dark, fontFace: FONT,
        });
        const fallbackText = labels.map((label, i) => ({
            text: `${label}: £${values[i]!.toLocaleString('en-GB')}`,
            options: { bullet: { code: '2022', indent: 20 }, breakLine: true, paraSpaceAfter: 8 },
        }));
        slide.addText(fallbackText, {
            x: MARGIN + 0.2, y: BODY_TOP + 0.8, w: 7.4, h: BODY_H - 1.0,
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
        });
    }

    // Summary panel on right
    const panelX = 8.7;
    const panelW = 4.0;
    const panelY = BODY_TOP + 0.1;
    const panelH = BODY_H - 0.2;

    slide.addShape(pptx.ShapeType.roundRect, {
        x: panelX, y: panelY, w: panelW, h: panelH,
        fill: { color: COLORS.white }, line: { color: COLORS.mutedLight, width: 1 }, rectRadius: 0.08,
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: panelX, y: panelY, w: 0.08, h: panelH,
        fill: { color: COLORS.secondary },
    });

    slide.addText('MONTHLY INVESTMENT', {
        x: panelX + 0.3, y: panelY + 0.3, w: panelW - 0.5, h: 0.3,
        fontSize: 10, color: COLORS.muted, fontFace: FONT, bold: true, charSpacing: 1.5,
    });
    slide.addText(`£${budget.toLocaleString('en-GB')}`, {
        x: panelX + 0.3, y: panelY + 0.6, w: panelW - 0.5, h: 0.7,
        fontSize: 32, bold: true, color: COLORS.primary, fontFace: FONT_LIGHT,
    });

    slide.addShape(pptx.ShapeType.rect, {
        x: panelX + 0.3, y: panelY + 1.45, w: panelW - 0.6, h: 0.02,
        fill: { color: COLORS.mutedLight },
    });

    let infoY = panelY + 1.65;
    const engagement = formData.value?.engagementType || '';
    if (engagement) {
        slide.addText('ENGAGEMENT', {
            x: panelX + 0.3, y: infoY, w: panelW - 0.5, h: 0.25,
            fontSize: 10, color: COLORS.muted, fontFace: FONT, bold: true, charSpacing: 1.5,
        });
        slide.addText(engagement, {
            x: panelX + 0.3, y: infoY + 0.25, w: panelW - 0.5, h: 0.35,
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
        });
        infoY += 0.8;
    }

    const timeline = formData.timelines?.startTime || '';
    if (timeline) {
        slide.addText('START TIMELINE', {
            x: panelX + 0.3, y: infoY, w: panelW - 0.5, h: 0.25,
            fontSize: 10, color: COLORS.muted, fontFace: FONT, bold: true, charSpacing: 1.5,
        });
        slide.addText(timeline, {
            x: panelX + 0.3, y: infoY + 0.25, w: panelW - 0.5, h: 0.35,
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
        });
        infoY += 0.8;
    }

    const annualBoxY = panelY + panelH - 1.3;
    slide.addShape(pptx.ShapeType.roundRect, {
        x: panelX + 0.2, y: annualBoxY, w: panelW - 0.4, h: 1.0,
        fill: { color: COLORS.light }, line: { color: COLORS.secondary, width: 1 }, rectRadius: 0.06,
    });
    slide.addText('PROJECTED ANNUAL', {
        x: panelX + 0.4, y: annualBoxY + 0.15, w: panelW - 0.7, h: 0.25,
        fontSize: 10, color: COLORS.muted, fontFace: FONT, bold: true, charSpacing: 1.5,
    });
    slide.addText(`£${(budget * 12).toLocaleString('en-GB')}`, {
        x: panelX + 0.4, y: annualBoxY + 0.4, w: panelW - 0.7, h: 0.5,
        fontSize: 24, bold: true, color: COLORS.secondary, fontFace: FONT_LIGHT,
    });

    addSlideFooter(slide, companyName, slideNum, total);
}

export async function addRoiProjectionSlide(
    pptx: pptxgen,
    formData: ProposalFormData,
    companyName: string,
    slideNum: number,
    total: number,
): Promise<void> {
    const budget = parseBudgetAmount(formData.marketing?.budget || '');
    if (!budget) return;

    const slide = pptx.addSlide();
    slide.background = { color: COLORS.light };

    addSlideHeader(pptx, slide, 'Projected ROI (90-Day Outlook)', slideNum);

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

    const leftW = 6.0;
    if (leadsChart) {
        slide.addImage({
            data: leadsChart,
            x: MARGIN, y: BODY_TOP + 0.2, w: leftW, h: BODY_H - 0.4,
            sizing: { type: 'contain', w: leftW, h: BODY_H - 0.4 },
        });
    } else {
        slide.addText('Projected Leads per Month', {
            x: MARGIN, y: BODY_TOP + 0.3, w: leftW, h: 0.4,
            fontSize: 16, bold: true, color: COLORS.dark, fontFace: FONT,
        });
        slide.addText([
            { text: `Month 1: ${month1} leads`, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
            { text: `Month 2: ${month2} leads`, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
            { text: `Month 3: ${month3} leads`, options: { bullet: true } },
        ], {
            x: MARGIN + 0.2, y: BODY_TOP + 0.8, w: leftW - 0.2, h: BODY_H - 1.0,
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
        });
    }

    const rightX = 6.9;
    const rightW = SLIDE_W - rightX - MARGIN;
    if (cplChart) {
        slide.addImage({
            data: cplChart,
            x: rightX, y: BODY_TOP + 0.2, w: rightW, h: BODY_H - 0.4,
            sizing: { type: 'contain', w: rightW, h: BODY_H - 0.4 },
        });
    } else {
        slide.addText('Cost per Lead Trend (£)', {
            x: rightX, y: BODY_TOP + 0.3, w: rightW, h: 0.4,
            fontSize: 16, bold: true, color: COLORS.dark, fontFace: FONT,
        });
        slide.addText([
            { text: 'Month 1: £50 per lead', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
            { text: 'Month 2: £35 per lead', options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } },
            { text: 'Month 3: £25 per lead', options: { bullet: true } },
        ], {
            x: rightX + 0.2, y: BODY_TOP + 0.8, w: rightW - 0.2, h: BODY_H - 1.0,
            fontSize: 14, color: COLORS.dark, fontFace: FONT,
        });
    }

    addSlideFooter(slide, companyName, slideNum, total);
}
