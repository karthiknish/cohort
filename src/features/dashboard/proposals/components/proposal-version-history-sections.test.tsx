import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/dialog', () => ({
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div>separator</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import {
  ProposalVersionHistoryMenuContent,
  ProposalVersionHistoryTrigger,
  ProposalVersionPreviewDialog,
  ProposalVersionRestoreDialog,
} from './proposal-version-history-sections'

const version = {
  id: 'v1',
  proposalId: 'p1',
  versionNumber: 3,
  formData: { title: 'Proposal' },
  status: 'draft',
  stepProgress: 2,
  changeDescription: null,
  createdBy: 'alex@example.com',
  createdByName: 'Alex',
  createdAt: '2026-03-11T12:00:00.000Z',
}

const previewCurrentFormData = { title: 'Current' } as never

describe('proposal version history sections', () => {
  it('renders the trigger and menu content', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalVersionHistoryTrigger disabled={false} open={true} proposalId="p1" versionCount={2} versionSummary="2 versions" />
        <ProposalVersionHistoryMenuContent
          handleSaveVersion={vi.fn()}
          latestVersion={version}
          loading={false}
          proposalId="p1"
          restoring={false}
          saving={false}
          setPreviewVersion={vi.fn()}
          setRestoreConfirmVersion={vi.fn()}
          versions={[version]}
        />
      </>,
    )

    expect(markup).toContain('History')
    expect(markup).toContain('Version History')
    expect(markup).toContain('Save Point')
    expect(markup).toContain('v3')
    expect(markup).toContain('Latest:')
  })

  it('renders the preview and restore dialogs', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalVersionPreviewDialog currentFormData={previewCurrentFormData} previewVersion={version as never} setPreviewVersion={vi.fn()} />
        <ProposalVersionRestoreDialog
          handleRestoreVersion={vi.fn()}
          restoreConfirmVersion={version as never}
          restoring={false}
          setRestoreConfirmVersion={vi.fn()}
        />
      </>,
    )

    expect(markup).toContain('Version 3')
    expect(markup).toContain('Restore version?')
    expect(markup).toContain('Restore')
    expect(markup).toContain('Close')
  })
})