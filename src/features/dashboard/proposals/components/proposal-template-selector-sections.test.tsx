import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div>separator</div>,
}))

import {
  ProposalTemplateDropdownContent,
  ProposalTemplateSaveDialog,
} from './proposal-template-selector-sections'

describe('proposal template selector sections', () => {
  it('renders loading before empty and workspace guidance when templates cannot be managed', () => {
    const loadingMarkup = renderToStaticMarkup(
      <ProposalTemplateDropdownContent
        templates={[]}
        loading={true}
        deletingTemplateId={null}
        canManageTemplates={false}
        onApplyTemplate={vi.fn()}
        onDeleteTemplate={vi.fn()}
        onOpenSaveDialog={vi.fn()}
      />,
    )

    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(loadingMarkup).toContain('Open a workspace to load and save proposal templates.')
    expect(loadingMarkup).not.toContain('No templates yet')
  })

  it('renders template rows with saved count', () => {
    const markup = renderToStaticMarkup(
      <ProposalTemplateDropdownContent
        templates={[{ id: 'tpl-1', name: 'SaaS Growth', description: 'For product-led SaaS', formData: {} as never, industry: 'SaaS', tags: ['growth'], isDefault: true, createdAt: null, updatedAt: null }]}
        loading={false}
        deletingTemplateId={null}
        canManageTemplates={true}
        onApplyTemplate={vi.fn()}
        onDeleteTemplate={vi.fn()}
        onOpenSaveDialog={vi.fn()}
      />,
    )

    expect(markup).toContain('1 saved')
    expect(markup).toContain('SaaS Growth')
    expect(markup).toContain('For product-led SaaS')
    expect(markup).toContain('growth')
  })

  it('renders save dialog guidance and fields', () => {
    const markup = renderToStaticMarkup(
      <ProposalTemplateSaveDialog
        open={true}
        saving={false}
        templateName="Starter"
        templateDescription="Good default"
        templateIndustry="E-commerce"
        isDefault={true}
        onOpenChange={vi.fn()}
        onTemplateNameChange={vi.fn()}
        onTemplateDescriptionChange={vi.fn()}
        onTemplateIndustryChange={vi.fn()}
        onDefaultChange={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(markup).toContain('Save as Template')
    expect(markup).toContain('This stores your current company, goals, scope, timelines, and proposal value')
    expect(markup).toContain('Set as the default starting template for new proposals')
    expect(markup).toContain('Save Template')
  })
})