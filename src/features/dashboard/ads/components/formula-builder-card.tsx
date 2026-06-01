'use client';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Card, } from '@/shared/ui/card';
import { FormulaBuilderDialog, FormulaBuilderEmptyState, FormulaBuilderHeader, FormulaBuilderList, FormulaBuilderLoadingState, } from './formula-builder-card-sections';
import type { CustomFormula, UseFormulaEditorReturn, FormulaValidationResult } from '../hooks/use-formula-editor';
import type { MetricTotals } from '../hooks/use-derived-metrics';
// =============================================================================
// TYPES
// =============================================================================
interface FormulaBuilderCardProps {
    formulaEditor: UseFormulaEditorReturn;
    metricTotals?: MetricTotals;
    loading?: boolean;
}
// =============================================================================
// CONSTANTS
// =============================================================================
const AVAILABLE_METRICS = [
    { name: 'spend', label: 'Spend', type: 'currency' },
    { name: 'impressions', label: 'Impressions', type: 'number' },
    { name: 'clicks', label: 'Clicks', type: 'number' },
    { name: 'conversions', label: 'Conversions', type: 'number' },
    { name: 'revenue', label: 'Revenue', type: 'currency' },
];
const EXAMPLE_FORMULAS = [
    { name: 'Cost per Click', formula: 'spend / clicks', output: 'cpc' },
    { name: 'Click-Through Rate', formula: 'clicks / impressions', output: 'ctr' },
    { name: 'Conversion Rate', formula: 'conversions / clicks', output: 'cvr' },
    { name: 'Return on Ad Spend', formula: 'revenue / spend', output: 'roas' },
];
type FormulaBuilderState = {
    dialogOpen: boolean;
    formulaName: string;
    formulaExpression: string;
    outputMetric: string;
    savingFormula: boolean;
};
type FormulaBuilderAction = {
    type: 'setDialogOpen';
    value: boolean;
} | {
    type: 'setFormulaName';
    value: string;
} | {
    type: 'setFormulaExpression';
    value: string | ((prev: string) => string);
} | {
    type: 'setOutputMetric';
    value: string;
} | {
    type: 'setSavingFormula';
    value: boolean;
} | {
    type: 'resetForm';
} | {
    type: 'applyExample';
    name: string;
    formula: string;
    output: string;
};
function createInitialFormulaBuilderState(): FormulaBuilderState {
    return {
        dialogOpen: false,
        formulaName: '',
        formulaExpression: '',
        outputMetric: '',
        savingFormula: false,
    };
}
function formulaBuilderReducer(state: FormulaBuilderState, action: FormulaBuilderAction): FormulaBuilderState {
    switch (action.type) {
        case 'setDialogOpen':
            return { ...state, dialogOpen: action.value };
        case 'setFormulaName':
            return { ...state, formulaName: action.value };
        case 'setFormulaExpression':
            return {
                ...state,
                formulaExpression: typeof action.value === 'function' ? action.value(state.formulaExpression) : action.value,
            };
        case 'setOutputMetric':
            return { ...state, outputMetric: action.value };
        case 'setSavingFormula':
            return { ...state, savingFormula: action.value };
        case 'resetForm':
            return { ...state, formulaName: '', formulaExpression: '', outputMetric: '', dialogOpen: false };
        case 'applyExample':
            return {
                ...state,
                formulaName: action.name,
                formulaExpression: action.formula,
                outputMetric: action.output,
            };
        default:
            return state;
    }
}
// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function FormulaBuilderCard({ formulaEditor, metricTotals, loading, }: FormulaBuilderCardProps) {
    const { formulas, loading: formulasLoading, loadFormulas, createFormula, deleteFormula, validateFormula, executeFormula, } = formulaEditor;
    const [state, dispatch] = useReducer(formulaBuilderReducer, undefined, createInitialFormulaBuilderState);
    const { dialogOpen, formulaName, formulaExpression, outputMetric, savingFormula } = state;
    // Load formulas on mount
    useEffect(() => {
        void loadFormulas();
    }, [loadFormulas]);
    const validation = (() => {
        if (!formulaExpression.trim()) {
            return null;
        }
        return validateFormula(formulaExpression);
    })();
    const previewResult = (() => {
        if (!validation?.valid || !metricTotals) {
            return null;
        }
        const inputs: Record<string, number> = {
            spend: metricTotals.spend,
            impressions: metricTotals.impressions,
            clicks: metricTotals.clicks,
            conversions: metricTotals.conversions,
            revenue: metricTotals.revenue,
        };
        return executeFormula(formulaExpression, inputs);
    })();
    const handleSave = async () => {
        if (savingFormula || !validation?.valid || !formulaName.trim() || !outputMetric.trim())
            return;
        dispatch({ type: 'setSavingFormula', value: true });
        try {
            const created = await createFormula({
                name: formulaName.trim(),
                formula: formulaExpression.trim(),
                inputs: validation.inputs ?? [],
                outputMetric: outputMetric.trim(),
            });
            if (!created) {
                return;
            }
            // Reset form only after a confirmed successful save.
            dispatch({ type: 'resetForm' });
        }
        finally {
            dispatch({ type: 'setSavingFormula', value: false });
        }
    };
    const handleInsertMetric = (metricName: string) => {
        dispatch({
            type: 'setFormulaExpression',
            value: (prev) => (prev ? `${prev} ${metricName}` : metricName),
        });
    };
    const handleUseExample = (example: typeof EXAMPLE_FORMULAS[0]) => {
        dispatch({
            type: 'applyExample',
            name: example.name,
            formula: example.formula,
            output: example.output,
        });
    };
    const handleExpressionChange = (event: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: 'setFormulaExpression', value: event.target.value });
    const handleFormulaNameChange = (event: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: 'setFormulaName', value: event.target.value });
    const handleOutputMetricChange = (event: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: 'setOutputMetric', value: event.target.value });
    const handleDialogOpenChange = (open: boolean) => {
        dispatch({ type: 'setDialogOpen', value: open });
    };
    const handleDeleteFormula = (formulaId: string) => {
        void deleteFormula(formulaId);
    };
    const formulaItems = formulas.map((formula) => {
        let result: number | null = null;
        if (metricTotals) {
            const inputs: Record<string, number> = {
                spend: metricTotals.spend,
                impressions: metricTotals.impressions,
                clicks: metricTotals.clicks,
                conversions: metricTotals.conversions,
                revenue: metricTotals.revenue,
            };
            result = executeFormula(formula.formula, inputs);
        }
        return { formula, result };
    });
    return (<Card className="shadow-sm">
            <FormulaBuilderHeader>
                <FormulaBuilderDialog availableMetrics={AVAILABLE_METRICS} dialogOpen={dialogOpen} exampleFormulas={EXAMPLE_FORMULAS} formulaExpression={formulaExpression} formulaName={formulaName} onDialogOpenChange={handleDialogOpenChange} onExpressionChange={handleExpressionChange} onInsertMetric={handleInsertMetric} onFormulaNameChange={handleFormulaNameChange} onOutputMetricChange={handleOutputMetricChange} onSave={handleSave} onUseExample={handleUseExample} outputMetric={outputMetric} previewResult={previewResult} saving={savingFormula} validation={validation}/>
            </FormulaBuilderHeader>
            {loading || formulasLoading ? <FormulaBuilderLoadingState /> : formulas.length === 0 ? <FormulaBuilderEmptyState /> : <FormulaBuilderList items={formulaItems} onDelete={handleDeleteFormula}/>}
        </Card>);
}
