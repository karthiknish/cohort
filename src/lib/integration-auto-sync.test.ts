import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const adsAdminMocks = vi.hoisted(() => ({
  enqueueSyncJob: vi.fn(),
  getAdIntegration: vi.fn(),
  hasPendingSyncJob: vi.fn(),
  markIntegrationSyncRequested: vi.fn(),
}))

const analyticsAdminMocks = vi.hoisted(() => ({
  getGoogleAnalyticsIntegration: vi.fn(),
  hasPendingGoogleAnalyticsSyncJob: vi.fn(),
  markGoogleAnalyticsSyncRequested: vi.fn(),
}))

vi.mock('@/lib/ads-admin', () => adsAdminMocks)
vi.mock('@/lib/analytics-admin', () => analyticsAdminMocks)

describe('scheduleIntegrationSync', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    adsAdminMocks.enqueueSyncJob.mockResolvedValue(undefined)
    adsAdminMocks.hasPendingSyncJob.mockResolvedValue(false)
    adsAdminMocks.markIntegrationSyncRequested.mockResolvedValue(undefined)
    analyticsAdminMocks.hasPendingGoogleAnalyticsSyncJob.mockResolvedValue(false)
    analyticsAdminMocks.markGoogleAnalyticsSyncRequested.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('routes google analytics scheduling through analytics integration helpers', async () => {
    analyticsAdminMocks.getGoogleAnalyticsIntegration.mockResolvedValue({
      autoSyncEnabled: true,
      syncFrequencyMinutes: null,
      scheduledTimeframeDays: null,
      lastSyncedAt: null,
      lastSyncRequestedAt: null,
    })

    const { scheduleIntegrationSync } = await import('./integration-auto-sync')
    const scheduled = await scheduleIntegrationSync({ userId: 'user_123', providerId: 'google-analytics' })

    expect(scheduled).toBe(true)
    expect(analyticsAdminMocks.getGoogleAnalyticsIntegration).toHaveBeenCalledWith({ userId: 'user_123' })
    expect(adsAdminMocks.getAdIntegration).not.toHaveBeenCalled()
    expect(analyticsAdminMocks.hasPendingGoogleAnalyticsSyncJob).toHaveBeenCalledWith({ userId: 'user_123' })
    expect(adsAdminMocks.enqueueSyncJob).toHaveBeenCalledWith({
      userId: 'user_123',
      providerId: 'google-analytics',
      jobType: 'scheduled-sync',
      timeframeDays: 90,
    })
    expect(analyticsAdminMocks.markGoogleAnalyticsSyncRequested).toHaveBeenCalledWith({ userId: 'user_123' })
  })

  it('keeps ads providers on the ads integration helpers', async () => {
    adsAdminMocks.getAdIntegration.mockResolvedValue({
      autoSyncEnabled: true,
      syncFrequencyMinutes: null,
      scheduledTimeframeDays: 30,
      lastSyncedAt: null,
      lastSyncRequestedAt: null,
    })

    const { scheduleIntegrationSync } = await import('./integration-auto-sync')
    const scheduled = await scheduleIntegrationSync({ userId: 'user_456', providerId: 'google' })

    expect(scheduled).toBe(true)
    expect(adsAdminMocks.getAdIntegration).toHaveBeenCalledWith({ userId: 'user_456', providerId: 'google' })
    expect(analyticsAdminMocks.getGoogleAnalyticsIntegration).not.toHaveBeenCalled()
    expect(adsAdminMocks.hasPendingSyncJob).toHaveBeenCalledWith({ userId: 'user_456', providerId: 'google' })
    expect(adsAdminMocks.markIntegrationSyncRequested).toHaveBeenCalledWith({ userId: 'user_456', providerId: 'google' })
  })
})