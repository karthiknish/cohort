/**
 * Shared types for PPTX generation.
 */

export type PptxSlideContent = {
    title: string;
    bullets: string[];
};

export interface SidebarStat {
    label: string;
    value: string;
}
