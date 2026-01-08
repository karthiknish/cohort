'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Trash2,
    Play,
    Save,
    AlertCircle,
    CheckCircle,
    Code,
} from 'lucide-react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn, formatCurrency } from '@/lib/utils'

import type { UseFormulaEditorReturn, FormulaValidationResult } from '../hooks/use-formula-editor'
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
    const [validation, setValidation] = useState<FormulaValidationResult | null>(null)
    const [previewResult, setPreviewResult] = useState<number | null>(null)

    // Load formulas on mount
    useEffect(() => {
        void loadFormulas()
    }, [loadFormulas])

    // Validate formula as user types
    useEffect(() => {
        if (!formulaExpression.trim()) {
            setValidation(null)
            setPreviewResult(null)
            return
        }

        const result = validateFormula(formulaExpression)
        setValidation(result)

        // Calculate preview if valid and we have metrics
        if (result.valid && metricTotals) {
            const inputs: Record<string, number> = {
                spend: metricTotals.spend,
                impressions: metricTotals.impressions,
                clicks: metricTotals.clicks,
                conversions: metricTotals.conversions,
                revenue: metricTotals.revenue,
            }
            const preview = executeFormula(formulaExpression, inputs)
            setPreviewResult(preview)
        } else {
            setPreviewResult(null)
        }
    }, [formulaExpression, validateFormula, executeFormula, metricTotals])

    const handleSave = async () => {
        if (!validation?.valid || !formulaName.trim() || !outputMetric.trim()) return

        await createFormula({
            name: formulaName.trim(),
            formula: formulaExpression.trim(),
            inputs: validation.inputs ?? [],
            outputMetric: outputMetric.trim(),
        })

        // Reset form
        setFormulaName('')
        setFormulaExpression('')
        setOutputMetric('')
        setValidation(null)
        setPreviewResult(null)
        setDialogOpen(false)
    }

    const handleInsertMetric = (metricName: string) => {
        setFormulaExpression((prev) => (prev ? `${prev} ${metricName}` : metricName))
    }

    const handleUseExample = (example: typeof EXAMPLE_FORMULAS[0]) => {
        setFormulaName(example.name)
        setFormulaExpression(example.formula)
        setOutputMetric(example.output)
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Code className="h-5 w-5" />
                        Formula Builder
                    </CardTitle>
                    <CardDescription>
                        Create custom metrics by combining your ad performance data
                    </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Formula
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Custom Formula</DialogTitle>
                            <DialogDescription>
                                Define a formula using available metrics. Use +, -, *, / operators.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Formula Name */}
                            <div className="space-y-2">
                                <Label htmlFor="formula-name">Formula Name</Label>
                                <Input
                                    id="formula-name"
                                    placeholder="e.g., Cost per Acquisition"
                                    value={formulaName}
                                    onChange={(e) => setFormulaName(e.target.value)}
                                />
                            </div>

                            {/* Available Metrics */}
                            <div className="space-y-2">
                                <Label>Available Metrics</Label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_METRICS.map((metric) => (
                                        <Button
                                            key={metric.name}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleInsertMetric(metric.name)}
                                        >
                                            {metric.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Formula Expression */}
                            <div className="space-y-2">
                                <Label htmlFor="formula-expression">Formula Expression</Label>
                                <div className="relative">
                                    <Input
                                        id="formula-expression"
                                        placeholder="e.g., spend / conversions"
                                        value={formulaExpression}
                                        onChange={(e) => setFormulaExpression(e.target.value)}
                                        className={cn(
                                            validation && !validation.valid && 'border-red-500'
                                        )}
                                    />
                                    {validation && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {validation.valid ? (
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{validation.error}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {validation?.valid && previewResult !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        Preview: <span className="font-medium">{previewResult.toFixed(2)}</span>
                                    </p>
                                )}
                            </div>

                            {/* Output Metric Name */}
                            <div className="space-y-2">
                                <Label htmlFor="output-metric">Output Metric ID</Label>
                                <Input
                                    id="output-metric"
                                    placeholder="e.g., cpa"
                                    value={outputMetric}
                                    onChange={(e) => setOutputMetric(e.target.value)}
                                />
                            </div>

                            {/* Example Formulas */}
                            <div className="space-y-2">
                                <Label>Quick Examples</Label>
                                <div className="flex flex-wrap gap-2">
                                    {EXAMPLE_FORMULAS.map((example) => (
                                        <Button
                                            key={example.output}
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUseExample(example)}
                                        >
                                            {example.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={!validation?.valid || !formulaName.trim() || !outputMetric.trim()}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Formula
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading || formulasLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                ) : formulas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
                        <Code className="h-8 w-8 opacity-50" />
                        <p>No custom formulas yet. Create one to track custom KPIs.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formulas.map((formula) => {
                            // Calculate result if we have metrics
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

                            return (
                                <div
                                    key={formula.formulaId}
                                    className="flex items-center justify-between rounded-lg border border-muted/60 bg-background p-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{formula.name}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {formula.outputMetric}
                                            </Badge>
                                        </div>
                                        <code className="text-xs text-muted-foreground">
                                            {formula.formula}
                                        </code>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {result !== null && (
                                            <span className="text-lg font-semibold">
                                                {result.toFixed(2)}
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteFormula(formula.formulaId)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
