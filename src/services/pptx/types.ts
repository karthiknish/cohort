/**
 * Shared types for PPTX generation.
 */

export type SlideMetric = {
    value: string;
    label: string;
};

export type SlideComparison = {
    before: string[];
    after: string[];
};

export type PptxSlideContent = {
    title: string;
    bullets: string[];
    metrics?: SlideMetric[];
    callout?: string;
    comparison?: SlideComparison;
};

export interface SidebarStat {
    label: string;
    value: string;
}
