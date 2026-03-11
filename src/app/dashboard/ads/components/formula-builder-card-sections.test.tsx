import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import {
  FormulaBuilderDialog,
  FormulaBuilderEmptyState,
  FormulaBuilderHeader,
  FormulaBuilderList,
  FormulaBuilderLoadingState,
} from './formula-builder-card-sections'

describe('formula builder card sections', () => {
  it('renders the header and create dialog', () => {
    const headerMarkup = renderToStaticMarkup(<FormulaBuilderHeader><div>actions</div></FormulaBuilderHeader>)
    const dialogMarkup = renderToStaticMarkup(
      <FormulaBuilderDialog
        availableMetrics={[{ name: 'spend', label: 'Spend', type: 'currency' }]}
        dialogOpen={true}
        exampleFormulas={[{ name: 'Cost per Click', formula: 'spend / clicks', output: 'cpc' }]}
        formulaExpression="spend / clicks"
        formulaName="Cost per Click"
        onDialogOpenChange={vi.fn()}
        onExpressionChange={vi.fn()}
        onFormulaNameChange={vi.fn()}
        onInsertMetric={vi.fn()}
        onOutputMetricChange={vi.fn()}
        onSave={vi.fn()}
        onUseExample={vi.fn()}
        outputMetric="cpc"
        previewResult={2.34}
        validation={{ valid: true, inputs: ['spend', 'clicks'] }}
      />,
    )

    expect(headerMarkup).toContain('Formula Builder')
    expect(dialogMarkup).toContain('Create Custom Formula')
    expect(dialogMarkup).toContain('Available Metrics')
    expect(dialogMarkup).toContain('Preview:')
    expect(dialogMarkup).toContain('Save Formula')
  })

  it('renders loading and empty states', () => {
    const loadingMarkup = renderToStaticMarkup(<FormulaBuilderLoadingState />)
    const emptyMarkup = renderToStaticMarkup(<FormulaBuilderEmptyState />)

    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(emptyMarkup).toContain('No custom formulas yet')
  })

  it('renders saved formulas', () => {
    const markup = renderToStaticMarkup(
      <FormulaBuilderList
        items={[{ formula: { workspaceId: 'w1', formulaId: 'f1', name: 'ROAS', formula: 'revenue / spend', inputs: ['revenue', 'spend'], outputMetric: 'roas', isActive: true, createdBy: 'u1' }, result: 4.5 }]}
        onDelete={vi.fn()}
      />,
    )

    expect(markup).toContain('ROAS')
    expect(markup).toContain('revenue / spend')
    expect(markup).toContain('4.50')
    expect(markup).toContain('Delete formula ROAS')
  })
})