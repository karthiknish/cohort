import type { ChangeEvent, CSSProperties } from 'react';
import type { AlgorithmicInsight } from '@/lib/ad-algorithms';
import type { Creative } from './types';
import type { CreativePerformanceSummary } from './creative-social-preview';
export function toStableStringItems(items: string[]) {
    const counts = new Map<string, number>();
    return items.map((value, index) => {
        const occurrence = (counts.get(value) ?? 0) + 1;
        counts.set(value, occurrence);
        return {
            value,
            index,
            key: `${value}::${occurrence}`,
        };
    });
}
export function createTextChangeHandler(onUpdate: (index: number, value: string) => void, index: number) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onUpdate(index, event.target.value);
    };
}
export function createIndexClickHandler(onRemove: (index: number) => void, index: number) {
    return () => onRemove(index);
}
export function createCopyHandler(onCopy: (text: string, field: string) => void, text: string, field: string) {
    return () => onCopy(text, field);
}
export function getWidthStyle(width: number): CSSProperties {
    return { width: `${width}%` };
}
export type CreativeEditorTabSharedProps = {
    creative: Creative;
    copiedField: string | null;
    onCopy: (text: string, field: string) => void;
    isEditing: boolean;
    editedHeadlines: string[];
    editedDescriptions: string[];
    editedCta: string;
    editedLandingPage: string;
    previewHeadlineIndex: number;
    previewDescriptionIndex: number;
    onPreviewHeadlineIndexChange?: (index: number) => void;
    onPreviewDescriptionIndexChange?: (index: number) => void;
    onAddHeadline: () => void;
    onRemoveHeadline: (index: number) => void;
    onUpdateHeadline: (index: number, value: string) => void;
    onAddDescription: () => void;
    onRemoveDescription: (index: number) => void;
    onUpdateDescription: (index: number, value: string) => void;
    onChangeCta: (value: string) => void;
    onChangeLandingPage: (value: string) => void;
    generatingHeadlines?: boolean;
    generatingDescriptions?: boolean;
    onGenerateHeadlines?: () => void;
    onGenerateDescriptions?: () => void;
    performanceSummary?: CreativePerformanceSummary | null;
    onRefreshPerformance?: () => void;
    algorithmicInsights: AlgorithmicInsight[];
};
