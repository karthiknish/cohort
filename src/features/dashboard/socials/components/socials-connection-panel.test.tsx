import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import { SocialsConnectionPanel } from './socials-connection-panel'

describe('SocialsConnectionPanel', () => {
  it('renders a single Meta connect action', () => {
    const markup = renderToStaticMarkup(
      <SocialsConnectionPanel
        panelId="social-connections-panel"
        selectedClientName="Acme"
        connected={false}
        accountName={null}
        lastSyncedAtMs={null}
        oauthPending={false}
        connectionError={null}
        onConnectMeta={vi.fn(async () => undefined)}
        onDisconnect={vi.fn(async () => undefined)}
        onRequestSync={vi.fn()}
      />,
    )

    expect(markup).toContain('Connect with Meta')
    expect(markup).not.toContain('Connect Facebook')
    expect(markup).not.toContain('Connect Instagram')
  })

  it('shows reconnect when already connected', () => {
    const markup = renderToStaticMarkup(
      <SocialsConnectionPanel
        panelId="social-connections-panel"
        selectedClientName={null}
        connected={true}
        accountName="My Business Account"
        lastSyncedAtMs={Date.now()}
        oauthPending={false}
        connectionError={null}
        onConnectMeta={vi.fn(async () => undefined)}
        onDisconnect={vi.fn(async () => undefined)}
        onRequestSync={vi.fn()}
      />,
    )

    expect(markup).toContain('Reconnect with Meta')
    expect(markup).toContain('My Business Account')
  })
})
