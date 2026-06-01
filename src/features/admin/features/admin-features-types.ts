import { getPreviewAdminFeatures } from '@/lib/preview-data';
import type { Id } from '/_generated/dataModel';
import type { FeatureItem, FeaturePriority, FeatureReference, FeatureStatus } from '@/types/features';
export type FeatureRow = {
    id: string;
    title: string;
    description: string;
    status: FeatureStatus;
    priority: FeaturePriority;
    imageUrl: string | null;
    references: FeatureReference[];
    createdAtMs: number;
    updatedAtMs: number;
};
export type FeatureDocId = Id<'platformFeatures'>;
export function toFeatureDocId(value: string): FeatureDocId {
    return value as unknown as FeatureDocId;
}
export type AdminFeaturesState = {
    refreshing: boolean;
    previewFeatures: FeatureItem[];
    formDialogOpen: boolean;
    editingFeature: FeatureItem | null;
    defaultStatus: FeatureStatus;
    deleteConfirmOpen: boolean;
    featureToDelete: FeatureItem | null;
    isDeleting: boolean;
};
export type AdminFeaturesAction = {
    type: 'setRefreshing';
    value: boolean;
} | {
    type: 'setPreviewFeatures';
    value: FeatureItem[];
} | {
    type: 'updatePreviewFeatures';
    updater: (current: FeatureItem[]) => FeatureItem[];
} | {
    type: 'openFormDialog';
    editingFeature: FeatureItem | null;
    defaultStatus: FeatureStatus;
} | {
    type: 'setFormDialogOpen';
    value: boolean;
} | {
    type: 'openDeleteConfirm';
    feature: FeatureItem;
} | {
    type: 'closeDeleteConfirm';
} | {
    type: 'setIsDeleting';
    value: boolean;
};
export function createInitialAdminFeaturesState(): AdminFeaturesState {
    return {
        refreshing: false,
        previewFeatures: getPreviewAdminFeatures(),
        formDialogOpen: false,
        editingFeature: null,
        defaultStatus: 'backlog',
        deleteConfirmOpen: false,
        featureToDelete: null,
        isDeleting: false,
    };
}
export function adminFeaturesReducer(state: AdminFeaturesState, action: AdminFeaturesAction): AdminFeaturesState {
    switch (action.type) {
        case 'setRefreshing':
            return { ...state, refreshing: action.value };
        case 'setPreviewFeatures':
            return { ...state, previewFeatures: action.value };
        case 'updatePreviewFeatures':
            return { ...state, previewFeatures: action.updater(state.previewFeatures) };
        case 'openFormDialog':
            return {
                ...state,
                formDialogOpen: true,
                editingFeature: action.editingFeature,
                defaultStatus: action.defaultStatus,
            };
        case 'setFormDialogOpen':
            return { ...state, formDialogOpen: action.value };
        case 'openDeleteConfirm':
            return { ...state, deleteConfirmOpen: true, featureToDelete: action.feature };
        case 'closeDeleteConfirm':
            return { ...state, deleteConfirmOpen: false, featureToDelete: null, isDeleting: false };
        case 'setIsDeleting':
            return { ...state, isDeleting: action.value };
        default:
            return state;
    }
}
export type FeatureSubmitData = {
    title: string;
    description: string;
    status: FeatureStatus;
    priority: FeaturePriority;
    imageUrl: string | null;
    references: FeatureReference[];
};
