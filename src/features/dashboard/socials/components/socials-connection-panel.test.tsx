import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('next/link', () => ({
    default: ({ children, href }: {
        children: ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));
import { SocialsConnectionPanel } from './socials-connection-panel';
const LAST_SYNCED_AT_MS = Date.parse('2026-05-09T12:00:00.000Z');
describe('SocialsConnectionPanel', () => {
    it('renders a single Meta connect action', () => {
        const markup = renderToStaticMarkup(<SocialsConnectionPanel panelId="social-connections-panel" selectedClientName="Acme" connected={false} setupComplete={false} accountName={null} lastSyncedAtMs={null} lastSyncStatus={null} oauthPending={false} syncPending={false} connectionError={null} onConnectMeta={vi.fn(async () => undefined)} onDisconnect={vi.fn(async () => undefined)} onRequestSync={vi.fn()}/>);
        expect(markup).toContain('Connect with Meta');
        expect(markup).toContain('Connect with Meta to authorize');
        expect(markup).not.toContain('Sync now');
        expect(markup).not.toContain('Disconnect');
        expect(markup).not.toContain('Connect Facebook');
        expect(markup).not.toContain('Connect Instagram');
    });
    it('shows reconnect when already connected', () => {
        const markup = renderToStaticMarkup(<SocialsConnectionPanel panelId="social-connections-panel" selectedClientName={null} connected={true} setupComplete={true} accountName="My Business Account" lastSyncedAtMs={LAST_SYNCED_AT_MS} lastSyncStatus="success" oauthPending={false} syncPending={false} connectionError={null} onConnectMeta={vi.fn(async () => undefined)} onDisconnect={vi.fn(async () => undefined)} onRequestSync={vi.fn()}/>);
        expect(markup).toContain('Reconnect with Meta');
        expect(markup).toContain('My Business Account');
        expect(markup).toContain('Sync now');
        expect(markup).toContain('Disconnect');
    });
    it('hides sync actions until page setup is complete', () => {
        const markup = renderToStaticMarkup(<SocialsConnectionPanel panelId="social-connections-panel" selectedClientName="Acme" connected={true} setupComplete={false} accountName="My Business Account" lastSyncedAtMs={null} lastSyncStatus={null} oauthPending={false} syncPending={false} connectionError={null} onConnectMeta={vi.fn(async () => undefined)} onDisconnect={vi.fn(async () => undefined)} onRequestSync={vi.fn()}/>);
        expect(markup).toContain('Page setup required');
        expect(markup).toContain('Choose a Facebook Page below');
        expect(markup).toContain('disabled=""');
    });
});
