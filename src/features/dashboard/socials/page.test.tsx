import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/contexts/preview-context', () => ({
  usePreview: vi.fn(),
}))

vi.mock('./hooks/use-socials-page-controller', () => ({
  useSocialsPageController: vi.fn(),
}))

vi.mock('./components/socials-header', () => ({
  SocialsHeader: ({ selectedClientName }: { selectedClientName: string | null }) => <div>Header:{selectedClientName ?? 'none'}</div>,
}))

vi.mock('./components/socials-connection-panel', () => ({
  SocialsConnectionPanel: () => <div>Connection Panel</div>,
}))

vi.mock('./components/social-surface-panel', () => ({
  SocialSurfacePanel: ({ surface, connected }: { surface: string; connected: boolean }) => (
    <div>{surface}:{connected ? 'connected' : 'disconnected'}</div>
  ),
}))

import { usePreview } from '@/shared/contexts/preview-context'
import { useSocialsPageController } from './hooks/use-socials-page-controller'

import SocialsPage from './page'

const mockedUsePreview = vi.mocked(usePreview)
const mockedUseSocialsPageController = vi.mocked(useSocialsPageController)

const baseControllerValue = {
  selectedClient: { name: 'Tech Corp' },
  connections: {
    status: { connected: true, accountName: 'Demo Meta', lastSyncedAtMs: 1 },
    connectingProvider: null,
    connectionError: null,
    handleConnectFacebook: vi.fn(async () => undefined),
    handleConnectInstagram: vi.fn(async () => undefined),
    handleDisconnect: vi.fn(async () => undefined),
    handleRequestSync: vi.fn(async () => undefined),
    statusLoading: false,
  },
  metrics: {
    overviewLoading: false,
    facebookOverview: null,
    instagramOverview: null,
  },
  facebookKpis: [{ id: 'reach', label: 'Reach', value: '12K', detail: 'detail' }],
  instagramKpis: [{ id: 'reach', label: 'Reach', value: '15K', detail: 'detail' }],
  dateRange: { start: new Date('2026-03-01T00:00:00.000Z'), end: new Date('2026-03-30T23:59:59.999Z') },
  setDateRange: vi.fn(),
}

describe('SocialsPage', () => {
  it('hides connection options in preview mode while keeping social panels visible', () => {
    mockedUsePreview.mockReturnValue({
      isPreviewMode: true,
      togglePreviewMode: vi.fn(),
      setPreviewMode: vi.fn(),
    })
    mockedUseSocialsPageController.mockReturnValue(baseControllerValue)

    const markup = renderToStaticMarkup(<SocialsPage />)

    expect(markup).not.toContain('Connection Panel')
    expect(markup).toContain('facebook:connected')
    expect(markup).toContain('Facebook')
    expect(markup).toContain('Instagram')
  })

  it('renders the connection panel outside preview mode', () => {
    mockedUsePreview.mockReturnValue({
      isPreviewMode: false,
      togglePreviewMode: vi.fn(),
      setPreviewMode: vi.fn(),
    })
    mockedUseSocialsPageController.mockReturnValue(baseControllerValue)

    const markup = renderToStaticMarkup(<SocialsPage />)

    expect(markup).toContain('Connection Panel')
  })
})