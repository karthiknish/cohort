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
    /** Speaker notes for the presenter (talking points, not on-slide content). */
    notes?: string;
    /** AI-suggested image topic for this slide (used for Pexels/Unsplash queries). */
    imageTopic?: string;
};

export interface SidebarStat {
    label: string;
    value: string;
}
