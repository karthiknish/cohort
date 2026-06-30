import { normalizeCreativeCtaValue } from '@/features/dashboard/ads/creative/components/helpers';
import type { Creative } from '@/features/dashboard/ads/creative/components/types';
import type { NormalizedAdMetric } from './creative-detail-page-client-utils';
export type CreativeDetailPageState = {
    creative: Creative | null;
    loading: boolean;
    copiedField: string | null;
    isEditing: boolean;
    editedHeadlines: string[];
    editedDescriptions: string[];
    editedCta: string;
    editedLandingPage: string;
    previewHeadlineIndex: number;
    previewDescriptionIndex: number;
    isSaving: boolean;
    generatingHeadlines: boolean;
    generatingDescriptions: boolean;
    days: string;
    creativeMetrics: NormalizedAdMetric[] | null;
};
export type CreativeDetailPageAction = {
    type: 'setCreative';
    value: Creative | null;
} | {
    type: 'patchCreative';
    updater: (prev: Creative | null) => Creative | null;
} | {
    type: 'setLoading';
    value: boolean;
} | {
    type: 'setCopiedField';
    value: string | null;
} | {
    type: 'setIsEditing';
    value: boolean;
} | {
    type: 'setEditedHeadlines';
    value: string[];
} | {
    type: 'updateEditedHeadlines';
    updater: (prev: string[]) => string[];
} | {
    type: 'setEditedDescriptions';
    value: string[];
} | {
    type: 'updateEditedDescriptions';
    updater: (prev: string[]) => string[];
} | {
    type: 'setEditedCta';
    value: string;
} | {
    type: 'setEditedLandingPage';
    value: string;
} | {
    type: 'setPreviewHeadlineIndex';
    value: number;
} | {
    type: 'updatePreviewHeadlineIndex';
    updater: (prev: number) => number;
} | {
    type: 'setPreviewDescriptionIndex';
    value: number;
} | {
    type: 'updatePreviewDescriptionIndex';
    updater: (prev: number) => number;
} | {
    type: 'setIsSaving';
    value: boolean;
} | {
    type: 'setGeneratingHeadlines';
    value: boolean;
} | {
    type: 'setGeneratingDescriptions';
    value: boolean;
} | {
    type: 'setDays';
    value: string;
} | {
    type: 'setCreativeMetrics';
    value: NormalizedAdMetric[] | null;
} | {
    type: 'syncFromCreative';
    creative: Creative;
};
export function createInitialCreativeDetailPageState(): CreativeDetailPageState {
    return {
        creative: null,
        loading: true,
        copiedField: null,
        isEditing: true,
        editedHeadlines: [],
        editedDescriptions: [],
        editedCta: '',
        editedLandingPage: '',
        previewHeadlineIndex: 0,
        previewDescriptionIndex: 0,
        isSaving: false,
        generatingHeadlines: false,
        generatingDescriptions: false,
        days: '7',
        creativeMetrics: null,
    };
}
export function creativeDetailPageReducer(state: CreativeDetailPageState, action: CreativeDetailPageAction): CreativeDetailPageState {
    switch (action.type) {
        case 'setCreative':
            return { ...state, creative: action.value };
        case 'patchCreative':
            return { ...state, creative: action.updater(state.creative) };
        case 'setLoading':
            return { ...state, loading: action.value };
        case 'setCopiedField':
            return { ...state, copiedField: action.value };
        case 'setIsEditing':
            return { ...state, isEditing: action.value };
        case 'setEditedHeadlines':
            return { ...state, editedHeadlines: action.value };
        case 'updateEditedHeadlines':
            return { ...state, editedHeadlines: action.updater(state.editedHeadlines) };
        case 'setEditedDescriptions':
            return { ...state, editedDescriptions: action.value };
        case 'updateEditedDescriptions':
            return { ...state, editedDescriptions: action.updater(state.editedDescriptions) };
        case 'setEditedCta':
            return { ...state, editedCta: action.value };
        case 'setEditedLandingPage':
            return { ...state, editedLandingPage: action.value };
        case 'setPreviewHeadlineIndex':
            return { ...state, previewHeadlineIndex: action.value };
        case 'updatePreviewHeadlineIndex':
            return { ...state, previewHeadlineIndex: action.updater(state.previewHeadlineIndex) };
        case 'setPreviewDescriptionIndex':
            return { ...state, previewDescriptionIndex: action.value };
        case 'updatePreviewDescriptionIndex':
            return { ...state, previewDescriptionIndex: action.updater(state.previewDescriptionIndex) };
        case 'setIsSaving':
            return { ...state, isSaving: action.value };
        case 'setGeneratingHeadlines':
            return { ...state, generatingHeadlines: action.value };
        case 'setGeneratingDescriptions':
            return { ...state, generatingDescriptions: action.value };
        case 'setDays':
            return { ...state, days: action.value };
        case 'setCreativeMetrics':
            return { ...state, creativeMetrics: action.value };
        case 'syncFromCreative':
            return {
                ...state,
                editedHeadlines: action.creative.headlines ?? [],
                editedDescriptions: action.creative.descriptions ?? [],
                editedCta: normalizeCreativeCtaValue(action.creative.callToAction),
                editedLandingPage: action.creative.landingPageUrl ?? '',
                previewHeadlineIndex: 0,
                previewDescriptionIndex: 0,
                isEditing: true,
            };
        default:
            return state;
    }
}
