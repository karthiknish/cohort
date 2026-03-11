'use client'

import type { ChangeEvent, ReactNode } from 'react'

import { AlertCircle, CheckCircle, Code, Plus, Save, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import type { CustomFormula, FormulaValidationResult } from '../hooks/use-formula-editor'

type MetricOption = { name: string; label: string; type: string }
type ExampleFormula = { name: string; formula: string; output: string }
type FormulaListItem = { formula: CustomFormula; result: number | null }

export function FormulaBuilderHeader({ children }: { children: ReactNode }) {
  return <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div className="flex flex-col gap-1"><CardTitle className="flex items-center gap-2 text-lg"><Code className="h-5 w-5" />Formula Builder</CardTitle><CardDescription>Create custom metrics by combining your ad performance data</CardDescription></div>{children}</CardHeader>
}

export function FormulaBuilderDialog({ availableMetrics, dialogOpen, exampleFormulas, formulaExpression, formulaName, onDialogOpenChange, onExpressionChange, onFormulaNameChange, onInsertMetric, onOutputMetricChange, onSave, onUseExample, outputMetric, previewResult, validation }: { availableMetrics: MetricOption[]; dialogOpen: boolean; exampleFormulas: ExampleFormula[]; formulaExpression: string; formulaName: string; onDialogOpenChange: (open: boolean) => void; onExpressionChange: (event: ChangeEvent<HTMLInputElement>) => void; onFormulaNameChange: (event: ChangeEvent<HTMLInputElement>) => void; onInsertMetric: (metricName: string) => void; onOutputMetricChange: (event: ChangeEvent<HTMLInputElement>) => void; onSave: () => void; onUseExample: (example: ExampleFormula) => void; outputMetric: string; previewResult: number | null; validation: FormulaValidationResult | null }) {
  return <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}><DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />New Formula</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Create Custom Formula</DialogTitle><DialogDescription>Define a formula using available metrics. Use +, -, *, / operators.</DialogDescription></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label htmlFor="formula-name">Formula Name</Label><Input id="formula-name" placeholder="e.g., Cost per Acquisition" value={formulaName} onChange={onFormulaNameChange} /></div><div className="space-y-2"><Label>Available Metrics</Label><div className="flex flex-wrap gap-2">{availableMetrics.map((metric) => <Button key={metric.name} type="button" variant="outline" size="sm" onClick={() => onInsertMetric(metric.name)}>{metric.label}</Button>)}</div></div><div className="space-y-2"><Label htmlFor="formula-expression">Formula Expression</Label><div className="relative"><Input id="formula-expression" placeholder="e.g., spend / conversions" value={formulaExpression} onChange={onExpressionChange} className={cn(validation && !validation.valid && 'border-red-500')} />{validation ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{validation.valid ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <TooltipProvider><Tooltip><TooltipTrigger><AlertCircle className="h-4 w-4 text-red-500" /></TooltipTrigger><TooltipContent><p>{validation.error}</p></TooltipContent></Tooltip></TooltipProvider>}</div> : null}</div>{validation?.valid && previewResult !== null ? <p className="text-sm text-muted-foreground">Preview: <span className="font-medium">{previewResult.toFixed(2)}</span></p> : null}</div><div className="space-y-2"><Label htmlFor="output-metric">Output Metric ID</Label><Input id="output-metric" placeholder="e.g., cpa" value={outputMetric} onChange={onOutputMetricChange} /></div><div className="space-y-2"><Label>Quick Examples</Label><div className="flex flex-wrap gap-2">{exampleFormulas.map((example) => <Button key={example.output} type="button" variant="ghost" size="sm" onClick={() => onUseExample(example)}>{example.name}</Button>)}</div></div></div><DialogFooter><Button variant="outline" onClick={() => onDialogOpenChange(false)}>Cancel</Button><Button onClick={onSave} disabled={!validation?.valid || !formulaName.trim() || !outputMetric.trim()} className="gap-2"><Save className="h-4 w-4" />Save Formula</Button></DialogFooter></DialogContent></Dialog>
}

export function FormulaBuilderLoadingState() {
  return <CardContent><div className="space-y-3">{['a', 'b', 'c'].map((slot) => <Skeleton key={slot} className="h-16 w-full rounded-lg" />)}</div></CardContent>
}

export function FormulaBuilderEmptyState() {
  return <CardContent><div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground"><Code className="h-8 w-8 opacity-50" /><p>No custom formulas yet. Create one to track custom KPIs.</p></div></CardContent>
}

export function FormulaBuilderList({ items, onDelete }: { items: FormulaListItem[]; onDelete: (formulaId: string) => void }) {
  return <CardContent><div className="space-y-3">{items.map(({ formula, result }) => <div key={formula.formulaId} className="flex items-center justify-between rounded-lg border border-muted/60 bg-background p-4"><div className="flex flex-col gap-1"><div className="flex items-center gap-2"><span className="font-medium">{formula.name}</span><Badge variant="secondary" className="text-xs">{formula.outputMetric}</Badge></div><code className="text-xs text-muted-foreground">{formula.formula}</code></div><div className="flex items-center gap-3">{result !== null ? <span className="text-lg font-semibold">{result.toFixed(2)}</span> : null}<Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(formula.formulaId)} aria-label={`Delete formula ${formula.name}`}><Trash2 className="h-4 w-4" /></Button></div></div>)}</div></CardContent>
}