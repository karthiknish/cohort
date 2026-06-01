import type { FeatureItem, FeaturePriority, FeatureReference, FeatureStatus } from '@/types/features';
export type FeatureFormState = {
    isSubmitting: boolean;
    isGeneratingTitle: boolean;
    isGeneratingDescription: boolean;
    title: string;
    description: string;
    status: FeatureStatus;
    priority: FeaturePriority;
    imageUrl: string | null;
    references: FeatureReference[];
    newRefUrl: string;
    newRefLabel: string;
};
export type FeatureFormAction = {
    type: 'reset';
    feature?: FeatureItem | null;
    defaultStatus: FeatureStatus;
} | {
    type: 'setIsSubmitting';
    value: boolean;
} | {
    type: 'setGeneratingTitle';
    value: boolean;
} | {
    type: 'setGeneratingDescription';
    value: boolean;
} | {
    type: 'setTitle';
    value: string;
} | {
    type: 'setDescription';
    value: string;
} | {
    type: 'setStatus';
    value: FeatureStatus;
} | {
    type: 'setPriority';
    value: FeaturePriority;
} | {
    type: 'setImageUrl';
    value: string | null;
} | {
    type: 'setReferences';
    value: FeatureReference[];
} | {
    type: 'addReference';
    reference: FeatureReference;
} | {
    type: 'removeReference';
    index: number;
} | {
    type: 'setNewRefUrl';
    value: string;
} | {
    type: 'setNewRefLabel';
    value: string;
} | {
    type: 'clearNewReferenceInputs';
};
export function createEmptyFeatureFormState(defaultStatus: FeatureStatus): FeatureFormState {
    return {
        isSubmitting: false,
        isGeneratingTitle: false,
        isGeneratingDescription: false,
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'medium',
        imageUrl: null,
        references: [],
        newRefUrl: '',
        newRefLabel: '',
    };
}
export function featureFormReducer(state: FeatureFormState, action: FeatureFormAction): FeatureFormState {
    switch (action.type) {
        case 'reset':
            if (action.feature) {
                return {
                    ...createEmptyFeatureFormState(action.defaultStatus),
                    title: action.feature.title,
                    description: action.feature.description,
                    status: action.feature.status,
                    priority: action.feature.priority,
                    imageUrl: action.feature.imageUrl ?? null,
                    references: action.feature.references ?? [],
                };
            }
            return createEmptyFeatureFormState(action.defaultStatus);
        case 'setIsSubmitting':
            return { ...state, isSubmitting: action.value };
        case 'setGeneratingTitle':
            return { ...state, isGeneratingTitle: action.value };
        case 'setGeneratingDescription':
            return { ...state, isGeneratingDescription: action.value };
        case 'setTitle':
            return { ...state, title: action.value };
        case 'setDescription':
            return { ...state, description: action.value };
        case 'setStatus':
            return { ...state, status: action.value };
        case 'setPriority':
            return { ...state, priority: action.value };
        case 'setImageUrl':
            return { ...state, imageUrl: action.value };
        case 'setReferences':
            return { ...state, references: action.value };
        case 'addReference':
            return {
                ...state,
                references: [...state.references, action.reference],
                newRefUrl: '',
                newRefLabel: '',
            };
        case 'removeReference':
            return { ...state, references: state.references.filter((_, i) => i !== action.index) };
        case 'setNewRefUrl':
            return { ...state, newRefUrl: action.value };
        case 'setNewRefLabel':
            return { ...state, newRefLabel: action.value };
        case 'clearNewReferenceInputs':
            return { ...state, newRefUrl: '', newRefLabel: '' };
        default:
            return state;
    }
}
export interface FeatureFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feature?: FeatureItem | null;
    defaultStatus?: FeatureStatus;
    onSubmit: (data: {
        title: string;
        description: string;
        status: FeatureStatus;
        priority: FeaturePriority;
        imageUrl: string | null;
        references: FeatureReference[];
    }) => Promise<void>;
}
