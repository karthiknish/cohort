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
import { prefetchSlideImages, type PexelsImage } from '../pexels-images';
import { SLIDE_W, SLIDE_H } from './constants';
import { addTitleSlide, addContentSlide } from './content-slides';
import { addBudgetAllocationSlide, addRoiProjectionSlide } from './chart-slides';
import {
    addServicesTableSlide,
    addClosingSlide,
    addTocSlide,
    addSectionDivider,
} from './structural-slides';
import { buildDeckStructure, buildSlideTopics } from '../proposal-deck-structure';

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

    // Build shared deck structure (content-aware section assignment)
    const structure = buildDeckStructure(formData, instructions);
    const { sections, aiSlides, hasBudget, hasServices, totalSlides } = structure;

    // Pre-fetch images from Pexels in parallel using shared topic list
    const slideTopics = buildSlideTopics(structure);
    const slideImages = await prefetchSlideImages(slideTopics);
    let imageIdx = 0;

    let currentSlideNum = 0;

    // 1. Title slide
    addTitleSlide(pptx, formData, slideImages[imageIdx] ?? null);
    imageIdx++;
    currentSlideNum++;

    // 2. Table of Contents (no image needed)
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
        addSectionDivider(
            pptx,
            secIdx + 1,
            section.title,
            section.description,
            currentSlideNum,
            totalSlides,
            companyName,
            slideImages[imageIdx] ?? null,
        );
        imageIdx++;

        // Content slides for this section
        if (section.slideIndices.length > 0) {
            for (const localIdx of section.slideIndices) {
                const slideContent = aiSlides[localIdx]!;
                currentSlideNum++;
                const image = slideImages[imageIdx] ?? null;
                imageIdx++;
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
    addClosingSlide(pptx, formData, slideImages[imageIdx] ?? null);

    // Render to ArrayBuffer
    const result = await pptx.write({ outputType: 'arraybuffer' });
    return result as ArrayBuffer;
}
