/**
 * PPTX Generation Service using pptxgenjs
 * Generates PowerPoint presentations directly from slide instructions.
 * Replaces the Gamma API integration.
 */
import pptxgen from 'pptxgenjs';
import type { ProposalFormData } from '@/lib/proposals';

export type PptxSlideContent = {
    title: string;
    bullets: string[];
};

/**
 * Parse the AI-generated slide instructions text into structured slide content.
 * Expected format:
 *   Slide 1: Executive Summary
 *   - Bullet point 1
 *   - Bullet point 2
 *   Slide 2: Objectives & KPIs
 *   - Bullet point 1
 */
export function parseSlideInstructions(instructions: string): PptxSlideContent[] {
    const blocks = instructions.split(/\n(?=Slide\s+\d+)/i);
    const slides: PptxSlideContent[] = [];

    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;

        const lines = trimmed.split(/\r?\n/);
        const headerLine = lines[0] || '';
        const titleMatch = headerLine.match(/^Slide\s+\d+\s*[:\-]?\s*(.*)$/i);
        const title = titleMatch?.[1]?.trim() || headerLine.trim();

        const bullets = lines
            .slice(1)
            .map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
            .filter((line) => line.length > 0);

        if (title || bullets.length > 0) {
            slides.push({ title: title || 'Slide', bullets });
        }
    }

    return slides;
}

/**
 * Build a title slide from proposal form data.
 */
function buildTitleSlide(formData: ProposalFormData): { title: string; subtitle: string } {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const goals = formData.goals?.objectives?.join(', ');
    const subtitle = [industry, goals].filter(Boolean).join(' | ');
    return {
        title: `${companyName} — Marketing Proposal`,
        subtitle: subtitle || 'Strategic Marketing Proposal',
    };
}

/**
 * Generate a PPTX file as a Node.js Buffer from slide instructions and proposal form data.
 */
export async function generateProposalPptx(
    formData: ProposalFormData,
    instructions: string,
): Promise<Buffer> {
    const pptx = new pptxgen();
    pptx.defineLayout({ name: 'Custom16x9', width: 13.333, height: 7.5 });
    pptx.layout = 'Custom16x9';

    // Brand colors
    const primaryColor = '0F4C81';
    const accentColor = '1A82C4';
    const darkText = '1A1A1A';
    const lightText = 'FFFFFF';
    const bgLight = 'F5F7FA';

    // Title slide
    const titleInfo = buildTitleSlide(formData);
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: primaryColor };
    titleSlide.addText(titleInfo.title, {
        x: 0.5,
        y: 2.5,
        w: 12.333,
        h: 1.5,
        fontSize: 36,
        bold: true,
        color: lightText,
        align: 'center',
        fontFace: 'Arial',
    });
    if (titleInfo.subtitle) {
        titleSlide.addText(titleInfo.subtitle, {
            x: 0.5,
            y: 4,
            w: 12.333,
            h: 0.75,
            fontSize: 20,
            color: 'B0C4DE',
            align: 'center',
            fontFace: 'Arial',
        });
    }
    const companyName = formData.company?.name?.trim();
    if (companyName) {
        titleSlide.addText(companyName, {
            x: 0.5,
            y: 6.5,
            w: 12.333,
            h: 0.5,
            fontSize: 14,
            color: '8090A0',
            align: 'center',
            fontFace: 'Arial',
        });
    }

    // Content slides from AI instructions
    const slides = parseSlideInstructions(instructions);

    for (const slide of slides) {
        const s = pptx.addSlide();
        s.background = { color: bgLight };

        // Header bar
        s.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: 13.333,
            h: 1.2,
            fill: { color: primaryColor },
        });

        // Slide title
        s.addText(slide.title, {
            x: 0.5,
            y: 0.2,
            w: 12.333,
            h: 0.8,
            fontSize: 26,
            bold: true,
            color: lightText,
            fontFace: 'Arial',
        });

        // Accent line
        s.addShape(pptx.ShapeType.rect, {
            x: 0.5,
            y: 1.35,
            w: 2,
            h: 0.06,
            fill: { color: accentColor },
        });

        // Bullets
        if (slide.bullets.length > 0) {
            const bulletText = slide.bullets.map((b) => ({ text: b, options: { bullet: true } }));
            s.addText(bulletText, {
                x: 0.75,
                y: 1.8,
                w: 11.833,
                h: 5.2,
                fontSize: 18,
                color: darkText,
                fontFace: 'Arial',
                lineSpacingMultiple: 1.5,
                valign: 'top',
            });
        }

        // Footer with company name
        if (companyName) {
            s.addText(companyName, {
                x: 10.5,
                y: 7,
                w: 2.833,
                h: 0.4,
                fontSize: 10,
                color: '909090',
                align: 'right',
                fontFace: 'Arial',
            });
        }
    }

    // Closing slide
    const closingSlide = pptx.addSlide();
    closingSlide.background = { color: primaryColor };
    closingSlide.addText('Next Steps', {
        x: 0.5,
        y: 2.5,
        w: 12.333,
        h: 1,
        fontSize: 36,
        bold: true,
        color: lightText,
        align: 'center',
        fontFace: 'Arial',
    });
    closingSlide.addText('Let\'s build something great together.', {
        x: 0.5,
        y: 3.8,
        w: 12.333,
        h: 0.75,
        fontSize: 20,
        color: 'B0C4DE',
        align: 'center',
        fontFace: 'Arial',
    });

    // Render to Buffer (Node.js environment)
    const result = await pptx.write({ outputType: 'nodebuffer' });
    return result as Buffer;
}
