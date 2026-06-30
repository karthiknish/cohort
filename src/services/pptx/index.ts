/**
 * PPTX generation module — barrel export.
 *
 * File structure:
 *   pptx/
 *   ├── constants.ts         — colors, fonts, slide dimensions
 *   ├── types.ts             — shared TypeScript types
 *   ├── parsing.ts           — AI instruction parsing + budget/keyword helpers
 *   ├── shared-elements.ts   — header, footer, sidebar components
 *   ├── content-slides.ts    — title slide + 3 content layout variants
 *   ├── chart-slides.ts      — budget allocation + ROI projection (QuickChart images)
 *   ├── structural-slides.ts — services table, closing, TOC, section dividers
 *   └── index.ts             — barrel export + main generator function
 */

import pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';
import {
    prefetchSlideImages,
    topicFromTitle,
    type PexelsImage,
} from '../pexels-images';
import { SLIDE_W, SLIDE_H } from './constants';
import { parseSlideInstructions, parseBudgetAmount } from './parsing';
import { addTitleSlide, addContentSlide } from './content-slides';
import { addBudgetAllocationSlide, addRoiProjectionSlide } from './chart-slides';
import {
    addServicesTableSlide,
    addClosingSlide,
    addTocSlide,
    addSectionDivider,
} from './structural-slides';

// Re-export public types and functions
export type { PptxSlideContent } from './types';
export { parseSlideInstructions } from './parsing';

// ─── Main generator ───────────────────────────────────────────────

/**
 * Generate a PPTX file as an ArrayBuffer from slide instructions and proposal form data.
 *
 * Uses `arraybuffer` output type (not `nodebuffer`) because the Convex Node.js
 * runtime does not expose the `Buffer` global that jszip requires.
 */
export async function generateProposalPptx(
    formData: ProposalFormData,
    instructions: string,
): Promise<ArrayBuffer> {
    const pptx = new pptxgen();
    pptx.defineLayout({ name: 'Custom16x9', width: SLIDE_W, height: SLIDE_H });
    pptx.layout = 'Custom16x9';
    pptx.author = 'Cohorts';
    pptx.company = 'Cohorts';
    pptx.subject = 'Marketing Proposal';
    pptx.theme = { headFontFace: 'Segoe UI Semibold', bodyFontFace: 'Segoe UI' };

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

    // Pre-fetch images from Pexels in parallel
    const slideTopics = [
        'company',
        ...aiSlides.map((s) => topicFromTitle(s.title)),
        ...sections.map((s) => topicFromTitle(s.title)),
        'next',
    ];
    const imageMap = await prefetchSlideImages(slideTopics);

    let currentSlideNum = 0;

    // 1. Title slide
    addTitleSlide(pptx, formData, imageMap.get('company') ?? null);
    currentSlideNum++;

    // 2. Table of Contents
    addTocSlide(
        pptx,
        sections.map((s) => ({ title: s.title, description: s.description })),
        companyName,
        currentSlideNum + 1,
        totalSlides,
    );
    currentSlideNum++;

    // 3. Content sections — each starts with a divider, followed by its slides
    let aiSlideIdx = 0;
    for (let secIdx = 0; secIdx < sections.length; secIdx++) {
        const section = sections[secIdx]!;

        // Section divider
        currentSlideNum++;
        const dividerTopic = topicFromTitle(section.title);
        addSectionDivider(
            pptx,
            secIdx + 1,
            section.title,
            section.description,
            currentSlideNum,
            totalSlides,
            companyName,
            imageMap.get(dividerTopic) ?? null,
        );

        // Content slides for this section
        if (section.slideIndices.length > 0) {
            for (const localIdx of section.slideIndices) {
                const slideContent = aiSlides[localIdx]!;
                currentSlideNum++;
                const topic = topicFromTitle(slideContent.title);
                const image = imageMap.get(topic) ?? null;
                addContentSlide(
                    pptx,
                    slideContent.title,
                    slideContent.bullets,
                    formData,
                    companyName,
                    currentSlideNum,
                    totalSlides,
                    image,
                    aiSlideIdx,
                    slideContent,
                );
                aiSlideIdx++;
            }
        } else if (hasServices && section.title.includes('Scope')) {
            currentSlideNum++;
            addServicesTableSlide(pptx, formData, companyName, currentSlideNum, totalSlides);
        } else if (hasBudget && section.title.includes('Budget')) {
            currentSlideNum++;
            await addBudgetAllocationSlide(pptx, formData, companyName, currentSlideNum, totalSlides);
            currentSlideNum++;
            await addRoiProjectionSlide(pptx, formData, companyName, currentSlideNum, totalSlides);
        }
    }

    // 4. Closing slide
    currentSlideNum++;
    addClosingSlide(pptx, formData, imageMap.get('next') ?? null);

    // Render to ArrayBuffer
    const result = await pptx.write({ outputType: 'arraybuffer' });
    return result as ArrayBuffer;
}
