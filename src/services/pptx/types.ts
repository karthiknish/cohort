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

/** A single phase in a timeline / process flow slide. */
export type SlideTimelinePhase = {
    /** Phase number (1, 2, 3, …). */
    number: number;
    /** Short phase title, e.g. "Foundation". */
    title: string;
    /** One-line detail of what happens in this phase. */
    detail: string;
    /** Duration label, e.g. "Weeks 1-4". */
    duration?: string;
};

/** A pull-quote or stat-hero content block. */
export type SlideQuote = {
    /** The quote or stat headline (displayed large). */
    text: string;
    /** Optional attribution or context line below the quote. */
    attribution?: string;
};

/**
 * Content type hint — used by the dispatcher to pick the best layout.
 * If absent, the dispatcher infers from the populated fields.
 */
export type SlideContentType =
    | 'bullets'
    | 'metrics'
    | 'comparison'
    | 'timeline'
    | 'quote';

export type PptxSlideContent = {
    title: string;
    bullets: string[];
    metrics?: SlideMetric[];
    callout?: string;
    comparison?: SlideComparison;
    /** Timeline / process-flow phases. */
    timeline?: SlideTimelinePhase[];
    /** Pull-quote or stat-hero content. */
    quote?: SlideQuote;
    /** Explicit content-type hint for layout selection. */
    contentType?: SlideContentType;
    /** Speaker notes for the presenter (talking points, not on-slide content). */
    notes?: string;
    /** AI-suggested image topic for this slide (used for Pexels/Unsplash queries). */
    imageTopic?: string;
};

export interface SidebarStat {
    label: string;
    value: string;
}
