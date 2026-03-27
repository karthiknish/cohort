import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  SocialsMetaSetupCard,
  SocialsMetaSourceSwitcherCard,
  SocialsSurfaceInventoryCard,
} from './socials-connection-panel-sections'

describe('SocialsMetaSetupCard', () => {
  it('renders switch-source guidance for partial recovery states', () => {
    const setupState = {
      stage: 'partial' as const,
      title: 'Facebook is ready, Instagram still needs attention',
      description: 'Only one surface loaded from the selected Meta source.',
      switchSourceRecommended: true,
      switchSourceMessage: 'If you expected Instagram here, switch the Meta source below.',
    }

    const markup = renderToStaticMarkup(
      <SocialsMetaSetupCard
        setupState={setupState}
        selectedSourceLabel="Acme Ads"
        sourceSelectionRequired={false}
        loadingSources={false}
        facebookStatus="ready"
        instagramStatus="empty"
        facebookCount={2}
        instagramCount={0}
        onReloadSources={vi.fn()}
        onRetryDiscovery={vi.fn()}
      />,
    )

    expect(markup).toContain('This may be the wrong Meta source for this workspace.')
    expect(markup).toContain('If you expected Instagram here, switch the Meta source below.')
  })
})

describe('SocialsMetaSourceSwitcherCard', () => {
  it('renders switch-source controls with current source context', () => {
    const markup = renderToStaticMarkup(
      <SocialsMetaSourceSwitcherCard
        title="Switch Meta source for this workspace"
        description="Try another source if the current one only loads one surface."
        selectedMetaAccountId="acct-1"
        selectedSourceLabel="Acme Ads"
        metaAccountOptions={[
          { id: 'acct-1', name: 'Acme Ads' },
          { id: 'acct-2', name: 'Acme Commerce' },
        ]}
        loadingMetaAccountOptions={false}
        initializingMeta={false}
        onReloadAccounts={vi.fn()}
        onSelectAccount={vi.fn()}
        onConfirmSource={vi.fn()}
        confirmationLabel="Switch source"
      />,
    )

    expect(markup).toContain('Current: Acme Ads')
    expect(markup).toContain('Switch Meta source for this workspace')
    expect(markup).toContain('Switch source')
  })
})

describe('SocialsSurfaceInventoryCard', () => {
  const baseProps = {
    title: 'Facebook Pages',
    connected: true,
    loading: false,
    error: null,
    count: 0,
    status: 'empty' as const,
    emptyConnectedMessage: 'No Facebook Pages surfaced yet from Meta.',
    emptyDisconnectedMessage: 'Connect Meta to load Pages.',
    onRetry: vi.fn(),
    items: [] as Array<{ id: string; name: string; subtitle: string }>,
  }

  it('renders loading before empty state copy', () => {
    const markup = renderToStaticMarkup(<SocialsSurfaceInventoryCard {...baseProps} loading={true} status="loading" />)

    expect(markup).toContain('Loading…')
    expect(markup).toContain('skeleton-shimmer')
    expect(markup).not.toContain('No Facebook Pages surfaced yet from Meta.')
  })

  it('renders retryable error state', () => {
    const markup = renderToStaticMarkup(<SocialsSurfaceInventoryCard {...baseProps} error="Meta actor fetch failed" />)

    expect(markup).toContain('Unable to load facebook pages')
    expect(markup).toContain('Meta actor fetch failed')
    expect(markup).toContain('Retry discovery')
  })

  it('renders surfaced items when data is available', () => {
    const markup = renderToStaticMarkup(
      <SocialsSurfaceInventoryCard
        {...baseProps}
        count={1}
        status="ready"
        items={[{ id: 'page-1', name: 'Acme Page', subtitle: 'Publishing and insight access enabled' }]}
      />,
    )

    expect(markup).toContain('1 ready')
    expect(markup).toContain('Acme Page')
  })
})