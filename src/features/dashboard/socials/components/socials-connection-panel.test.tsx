import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import { SocialsConnectionPanel } from './socials-connection-panel'

describe('SocialsConnectionPanel', () => {
  it('renders separate Facebook and Instagram connect buttons', () => {
    const markup = renderToStaticMarkup(
      <SocialsConnectionPanel
        panelId="social-connections-panel"
        selectedClientName="Acme"
        connected={false}
        accountName={null}
        lastSyncedAtMs={null}
        connectingProvider={null}
        connectionError={null}
        onConnectFacebook={vi.fn(async () => undefined)}
        onConnectInstagram={vi.fn(async () => undefined)}
        onDisconnect={vi.fn(async () => undefined)}
        onRequestSync={vi.fn()}
      />,
    )

    expect(markup).toContain('Connect Facebook')
    expect(markup).toContain('Connect Instagram')
  })

  it('shows Reconnect when already connected', () => {
    const markup = renderToStaticMarkup(
      <SocialsConnectionPanel
        panelId="social-connections-panel"
        selectedClientName={null}
        connected={true}
        accountName="My Business Account"
        lastSyncedAtMs={Date.now()}
        connectingProvider={null}
        connectionError={null}
        onConnectFacebook={vi.fn(async () => undefined)}
        onConnectInstagram={vi.fn(async () => undefined)}
        onDisconnect={vi.fn(async () => undefined)}
        onRequestSync={vi.fn()}
      />,
    )

    expect(markup).toContain('Reconnect Facebook')
    expect(markup).toContain('Reconnect Instagram')
    expect(markup).toContain('My Business Account')
  })
})