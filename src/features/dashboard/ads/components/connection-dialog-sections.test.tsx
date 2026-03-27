import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/dialog', () => ({
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import {
  ConnectionDialogBody,
  ConnectionDialogFooterActions,
  ConnectionDialogHeader,
  ConnectionProgress,
} from './connection-dialog-sections'

const providerInfo = {
  name: 'Meta Ads',
  shortName: 'Meta',
  estimatedSetupTime: '2 minutes',
  benefits: ['Sync campaign performance'],
  requirements: ['Admin access'],
  loginMethod: 'redirect' as const,
}

const MetaIcon = ({ className }: { className?: string }) => <span className={className}>icon</span>

const popupBlockedGuidance = {
  title: 'Popup blocked',
  action: 'Allow popups and try again.',
}

describe('connection dialog sections', () => {
  it('renders the dialog header and progress', () => {
    const headerMarkup = renderToStaticMarkup(
      <ConnectionDialogHeader providerInfo={providerInfo} Icon={MetaIcon} />,
    )
    const progressMarkup = renderToStaticMarkup(<ConnectionProgress step="fetching" providerName="Meta Ads" />)

    expect(headerMarkup).toContain('Connect Meta Ads')
    expect(headerMarkup).toContain('2 minutes setup')
    expect(progressMarkup).toContain('Connecting to Meta Ads')
    expect(progressMarkup).toContain('Fetching ad accounts')
  })

  it('renders the preconnect and error states', () => {
    const preconnectMarkup = renderToStaticMarkup(
      <ConnectionDialogBody
        connectionStep="idle"
        error={null}
        errorGuidance={null}
        isInProgress={false}
        providerInfo={providerInfo}
        showPreConnect={true}
      />,
    )
    const errorMarkup = renderToStaticMarkup(
      <ConnectionDialogBody
        connectionStep="error"
        error="Popup was blocked"
        errorGuidance={popupBlockedGuidance}
        isInProgress={false}
        providerInfo={providerInfo}
        showPreConnect={false}
      />,
    )

    expect(preconnectMarkup).toContain('What you&#x27;ll get')
    expect(preconnectMarkup).toContain('Sync campaign performance')
    expect(preconnectMarkup).toContain('redirected to Meta')
    expect(errorMarkup).toContain('Popup blocked')
    expect(errorMarkup).toContain('Allow popups and try again.')
  })

  it('renders footer actions for connect, retry, and success states', () => {
    const connectMarkup = renderToStaticMarkup(
      <ConnectionDialogFooterActions
        connectionStep="idle"
        error={null}
        handleClose={vi.fn()}
        handleConnect={vi.fn()}
        isConnecting={false}
        isInProgress={false}
        onRetry={vi.fn()}
        providerInfo={providerInfo}
        showPreConnect={true}
      />,
    )
    const retryMarkup = renderToStaticMarkup(
      <ConnectionDialogFooterActions
        connectionStep="error"
        error="Popup was blocked"
        handleClose={vi.fn()}
        handleConnect={vi.fn()}
        isConnecting={false}
        isInProgress={false}
        onRetry={vi.fn()}
        providerInfo={providerInfo}
        showPreConnect={false}
      />,
    )
    const doneMarkup = renderToStaticMarkup(
      <ConnectionDialogFooterActions
        connectionStep="complete"
        error={null}
        handleClose={vi.fn()}
        handleConnect={vi.fn()}
        isConnecting={false}
        isInProgress={false}
        onRetry={vi.fn()}
        providerInfo={providerInfo}
        showPreConnect={false}
      />,
    )

    expect(connectMarkup).toContain('Continue to Meta')
    expect(retryMarkup).toContain('Try again')
    expect(doneMarkup).toContain('Done')
  })
})