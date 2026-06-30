/**
 * PPTX Generation Service — re-exports from the modular pptx/ directory.
 *
 * This file is kept for backwards-compatible imports (e.g. from Convex).
 * The actual implementation lives in src/services/pptx/:
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
export { generateProposalPptx, parseSlideInstructions } from './pptx/index';
export type { PptxSlideContent } from './pptx/types';
