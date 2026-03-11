import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import { SocialsConnectionPanel } from './socials-connection-panel'

describe('SocialsConnectionPanel', () => {
  it('renders separate Facebook and Instagram connect actions', () => {
    const markup = renderToStaticMarkup(
      <SocialsConnectionPanel
        panelId="social-connections-panel"
        selectedClientName="Acme"
        connected={false}
        accountName={null}
        lastSyncedAt={null}
        metaSetupMessage={null}
        metaNeedsAccountSelection={false}
        metaAccountOptions={[]}
        selectedMetaAccountId=""
        loadingMetaAccountOptions={false}
        connectingProvider={null}
        initializingMeta={false}
        onConnectFacebook={vi.fn(async () => undefined)}
        onConnectInstagram={vi.fn(async () => undefined)}
        onDisconnect={vi.fn(async () => undefined)}
        onRefresh={vi.fn()}
        onReloadAccounts={vi.fn(async () => [])}
        onSelectAccount={vi.fn()}
        onInitialize={vi.fn(async () => undefined)}
        facebookPages={[]}
        instagramProfiles={[]}
        metaSetupState={{
          stage: 'disconnected',
          title: 'Connect Facebook or Instagram to start social surface discovery',
          description: 'Choose either login button to begin the Meta Business authorization used for social surfaces.',
          switchSourceRecommended: false,
          switchSourceMessage: null,
        }}
        surfaceAvailability={{
          facebook: { status: 'disconnected', count: 0, emptyMessage: 'Connect Facebook to begin.' },
          instagram: { status: 'disconnected', count: 0, emptyMessage: 'Connect Instagram to begin.' },
        }}
        surfaceActorsLoading={false}
        surfaceActorsError={null}
        onRetrySurfaceActors={vi.fn()}
      />, 
    )

    expect(markup).toContain('Continue with Facebook')
    expect(markup).toContain('Continue with Instagram')
    expect(markup).toContain('Both buttons complete the same Meta Business authorization today')
  })
})