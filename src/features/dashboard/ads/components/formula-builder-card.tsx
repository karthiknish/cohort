'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    Card,
} from '@/shared/ui/card'

import {
    FormulaBuilderDialog,
    FormulaBuilderEmptyState,
    FormulaBuilderHeader,
    FormulaBuilderList,
    FormulaBuilderLoadingState,
} from './formula-builder-card-sections'

import type { CustomFormula, UseFormulaEditorReturn, FormulaValidationResult } from '../hooks/use-formula-editor'
import type { MetricTotals } from '../hooks/use-derived-metrics'

// =============================================================================
// TYPES
// =============================================================================

interface FormulaBuilderCardProps {
    formulaEditor: UseFormulaEditorReturn
    metricTotals?: MetricTotals
    loading?: boolean
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
]

const EXAMPLE_FORMULAS = [
    { name: 'Cost per Click', formula: 'spend / clicks', output: 'cpc' },
    { name: 'Click-Through Rate', formula: 'clicks / impressions', output: 'ctr' },
    { name: 'Conversion Rate', formula: 'conversions / clicks', output: 'cvr' },
    { name: 'Return on Ad Spend', formula: 'revenue / spend', output: 'roas' },
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FormulaBuilderCard({
    formulaEditor,
    metricTotals,
    loading,
}: FormulaBuilderCardProps) {
    const {
        formulas,
        loading: formulasLoading,
        loadFormulas,
        createFormula,
        deleteFormula,
        validateFormula,
        executeFormula,
    } = formulaEditor

    const [dialogOpen, setDialogOpen] = useState(false)
    const [formulaName, setFormulaName] = useState('')
    const [formulaExpression, setFormulaExpression] = useState('')
    const [outputMetric, setOutputMetric] = useState('')
    const [savingFormula, setSavingFormula] = useState(false)

    // Load formulas on mount
    useEffect(() => {
        void loadFormulas()
    }, [loadFormulas])

    const validation = useMemo<FormulaValidationResult | null>(() => {
        if (!formulaExpression.trim()) {
            return null
        }

        return validateFormula(formulaExpression)
    }, [formulaExpression, validateFormula])

    const previewResult = useMemo<number | null>(() => {
        if (!validation?.valid || !metricTotals) {
            return null
        }

        const inputs: Record<string, number> = {
            spend: metricTotals.spend,
            impressions: metricTotals.impressions,
            clicks: metricTotals.clicks,
            conversions: metricTotals.conversions,
            revenue: metricTotals.revenue,
        }

        return executeFormula(formulaExpression, inputs)
    }, [validation, metricTotals, executeFormula, formulaExpression])

    const handleSave = useCallback(async () => {
        if (savingFormula || !validation?.valid || !formulaName.trim() || !outputMetric.trim()) return

        setSavingFormula(true)

        try {
            const created = await createFormula({
                name: formulaName.trim(),
                formula: formulaExpression.trim(),
                inputs: validation.inputs ?? [],
                outputMetric: outputMetric.trim(),
            })

            if (!created) {
                return
            }

            // Reset form only after a confirmed successful save.
            setFormulaName('')
            setFormulaExpression('')
            setOutputMetric('')
            setDialogOpen(false)
        } finally {
            setSavingFormula(false)
        }
    }, [createFormula, formulaExpression, formulaName, outputMetric, savingFormula, validation])

    const handleInsertMetric = useCallback((metricName: string) => {
        setFormulaExpression((prev) => (prev ? `${prev} ${metricName}` : metricName))
    }, [])

    const handleUseExample = useCallback((example: typeof EXAMPLE_FORMULAS[0]) => {
        setFormulaName(example.name)
        setFormulaExpression(example.formula)
        setOutputMetric(example.output)
    }, [])

    const handleExpressionChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => setFormulaExpression(event.target.value),
        []
    )

    const handleFormulaNameChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => setFormulaName(event.target.value),
        []
    )

    const handleOutputMetricChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => setOutputMetric(event.target.value),
        []
    )

    const handleDeleteFormula = useCallback(
        (formulaId: string) => {
            void deleteFormula(formulaId)
        },
        [deleteFormula]
    )

    const formulaItems = useMemo<Array<{ formula: CustomFormula; result: number | null }>>(() => {
        return formulas.map((formula) => {
            let result: number | null = null
            if (metricTotals) {
                const inputs: Record<string, number> = {
                    spend: metricTotals.spend,
                    impressions: metricTotals.impressions,
                    clicks: metricTotals.clicks,
                    conversions: metricTotals.conversions,
                    revenue: metricTotals.revenue,
                }
                result = executeFormula(formula.formula, inputs)
            }
            return { formula, result }
        })
    }, [executeFormula, formulas, metricTotals])

    return (
        <Card className="shadow-sm">
            <FormulaBuilderHeader>
                <FormulaBuilderDialog
                    availableMetrics={AVAILABLE_METRICS}
                    dialogOpen={dialogOpen}
                    exampleFormulas={EXAMPLE_FORMULAS}
                    formulaExpression={formulaExpression}
                    formulaName={formulaName}
                    onDialogOpenChange={setDialogOpen}
                    onExpressionChange={handleExpressionChange}
                    onInsertMetric={handleInsertMetric}
                    onFormulaNameChange={handleFormulaNameChange}
                    onOutputMetricChange={handleOutputMetricChange}
                    onSave={handleSave}
                    onUseExample={handleUseExample}
                    outputMetric={outputMetric}
                    previewResult={previewResult}
                    saving={savingFormula}
                    validation={validation}
                />
            </FormulaBuilderHeader>
            {loading || formulasLoading ? <FormulaBuilderLoadingState /> : formulas.length === 0 ? <FormulaBuilderEmptyState /> : <FormulaBuilderList items={formulaItems} onDelete={handleDeleteFormula} />}
        </Card>
    )
}
