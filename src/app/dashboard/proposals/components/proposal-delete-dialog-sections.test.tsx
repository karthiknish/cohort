import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/dialog', () => ({
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { ProposalDeleteDialogContent } from './proposal-delete-dialog-sections'

describe('proposal delete dialog sections', () => {
  it('renders the destructive copy and actions', () => {
    const markup = renderToStaticMarkup(
      <ProposalDeleteDialogContent
        isDeleting={false}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        proposalName="Acme proposal"
      />,
    )

    expect(markup).toContain('Delete proposal')
    expect(markup).toContain('Acme proposal')
    expect(markup).toContain('Cancel')
    expect(markup).toContain('Delete')
  })
})