import type { ClientComparisonSummary } from '@/types/dashboard';
export type ComparisonDataState = {
    summaries: ClientComparisonSummary[];
    loading: boolean;
    error: string | null;
};
export type ComparisonDataAction = {
    type: 'reset';
} | {
    type: 'begin';
} | {
    type: 'setLoading';
    value: boolean;
} | {
    type: 'success';
    summaries: ClientComparisonSummary[];
} | {
    type: 'failure';
    error: string;
};
export function createInitialComparisonDataState(): ComparisonDataState {
    return {
        summaries: [],
        loading: false,
        error: null,
    };
}
export function comparisonDataReducer(state: ComparisonDataState, action: ComparisonDataAction): ComparisonDataState {
    switch (action.type) {
        case 'reset':
            return createInitialComparisonDataState();
        case 'begin':
            return { ...state, loading: true, error: null };
        case 'setLoading':
            return { ...state, loading: action.value };
        case 'success':
            return { summaries: action.summaries, loading: false, error: null };
        case 'failure':
            return { summaries: [], loading: false, error: action.error };
        default:
            return state;
    }
}
