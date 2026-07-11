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

import type { ProposalFormData } from '@/lib/proposals';
import { asErrorMessage } from '@/lib/convex-errors';
import { logger } from '@/lib/logger';
import { prefetchSlideImages } from '../pexels-images';
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
    const { default: PptxGenJS } = await import('pptxgenjs');
    const pptx = new PptxGenJS();
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

    if (!instructions || !instructions.trim()) {
        throw new Error('Cannot generate PPTX: AI instructions are empty');
    }

    // Pre-fetch images from Pexels in parallel using shared topic list
    const slideTopics = buildSlideTopics(structure);
    const slideImages = await prefetchSlideImages(slideTopics);
    let imageIdx = 0;

    let currentSlideNum = 0;

    // 1. Title slide
    try {
        addTitleSlide(pptx, formData, slideImages[imageIdx] ?? null);
    } catch (err) {
        logger.warn('[PPTX] Failed to add title slide', { error: asErrorMessage(err) });
    }
    imageIdx++;
    currentSlideNum++;

    // 2. Table of Contents (no image needed)
    try {
        addTocSlide(
            pptx,
            sections.map((s) => ({ title: s.title, description: s.description })),
            companyName,
            currentSlideNum + 1,
            totalSlides,
        );
    } catch (err) {
        logger.warn('[PPTX] Failed to add TOC slide', { error: asErrorMessage(err) });
    }
    currentSlideNum++;

    // 3. Content sections — each starts with a divider, followed by its slides
    let aiSlideIdx = 0;
    for (let secIdx = 0; secIdx < sections.length; secIdx++) {
        const section = sections[secIdx]!;

        // Section divider
        currentSlideNum++;
        try {
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
        } catch (err) {
            logger.warn('[PPTX] Failed to add section divider', { error: asErrorMessage(err), slideNum: currentSlideNum });
        }
        imageIdx++;

        // Content slides for this section
        if (section.slideIndices.length > 0) {
            for (const localIdx of section.slideIndices) {
                const slideContent = aiSlides[localIdx];
                if (!slideContent) {
                    logger.warn('[PPTX] Missing AI slide content at index ' + localIdx);
                    continue;
                }
                currentSlideNum++;
                const image = slideImages[imageIdx] ?? null;
                imageIdx++;
                try {
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
                } catch (err) {
                    logger.warn('[PPTX] Failed to add content slide', { error: asErrorMessage(err), slideNum: currentSlideNum });
                }
                aiSlideIdx++;
            }
        } else if (hasServices && section.title.includes('Scope')) {
            currentSlideNum++;
            try {
                addServicesTableSlide(pptx, formData, companyName, currentSlideNum, totalSlides);
            } catch (err) {
                logger.warn('[PPTX] Failed to add services table slide', { error: asErrorMessage(err), slideNum: currentSlideNum });
            }
        } else if (hasBudget && section.title.includes('Budget')) {
            currentSlideNum++;
            try {
                await addBudgetAllocationSlide(pptx, formData, companyName, currentSlideNum, totalSlides);
            } catch (err) {
                logger.warn('[PPTX] Failed to add budget allocation slide', { error: asErrorMessage(err), slideNum: currentSlideNum });
            }
            currentSlideNum++;
            try {
                await addRoiProjectionSlide(pptx, formData, companyName, currentSlideNum, totalSlides);
            } catch (err) {
                logger.warn('[PPTX] Failed to add ROI projection slide', { error: asErrorMessage(err), slideNum: currentSlideNum });
            }
        }
    }

    // 4. Closing slide
    currentSlideNum++;
    try {
        addClosingSlide(pptx, formData, slideImages[imageIdx] ?? null);
    } catch (err) {
        logger.warn('[PPTX] Failed to add closing slide', { error: asErrorMessage(err) });
    }

    // Render to ArrayBuffer
    const result = await pptx.write({ outputType: 'arraybuffer' });
    return result as ArrayBuffer;
}
