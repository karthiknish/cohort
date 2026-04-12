import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/contexts/preview-context', () => ({
  usePreview: vi.fn(),
}))

vi.mock('./hooks/use-socials-page-controller', () => ({
  useSocialsPageController: vi.fn(),
}))

vi.mock('@/features/dashboard/ads/components/date-range-picker', () => ({
  DateRangePicker: () => <div data-testid="date-range-picker" />,
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
    oauthPending: false,
    connectionError: null,
    handleConnectMeta: vi.fn(async () => undefined),
    handleDisconnect: vi.fn(async () => undefined),
    handleRequestSync: vi.fn(async () => undefined),
    statusLoading: false,
  },
  metrics: {
    overviewLoading: false,
    facebookOverview: {
      surface: 'facebook',
      impressions: 1000,
      reach: 500,
      engagedUsers: 50,
      reactions: 10,
      comments: 5,
      shares: 2,
      saves: 1,
      followerCountLatest: 100,
      followerDeltaTotal: 5,
      rowCount: 7,
    },
    instagramOverview: {
      surface: 'instagram',
      impressions: 800,
      reach: 400,
      engagedUsers: 40,
      reactions: 8,
      comments: 4,
      shares: 1,
      saves: 0,
      followerCountLatest: 90,
      followerDeltaTotal: 3,
      rowCount: 7,
    },
    dateRange: { start: new Date('2026-03-01T00:00:00.000Z'), end: new Date('2026-03-30T23:59:59.999Z') },
    setDateRange: vi.fn(),
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

    expect(markup).not.toContain('Meta connection')
    expect(markup).not.toContain('Connect with Meta')
    expect(markup).toContain('Facebook organic performance')
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

    expect(markup).toContain('Meta connection')
  })
})