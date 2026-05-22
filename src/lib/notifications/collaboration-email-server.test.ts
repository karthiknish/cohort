import { describe, expect, it, vi, beforeEach } from 'vitest'

import { shouldSendCollaborationEmailCopy } from '@/features/dashboard/collaboration/hooks/collaboration-email-notify'

const queryMock = vi.fn()

vi.mock('@/lib/convex-system-client', () => ({
  getSystemConvexClient: () => ({
    query: queryMock,
  }),
}))

import { isCollaborationEmailEnabledForRecipient } from './collaboration-email-server'

const enabledPrefs = {
  version: 2 as const,
  pauseAll: false,
  quietHours: { enabled: false, start: '22:00', end: '08:00' },
  categories: {
    tasks: { inApp: true, email: true },
    collaboration: { inApp: true, email: true },
    ads: { inApp: true, email: true },
    digest: { inApp: true, email: true },
    projects: { inApp: true, email: true },
    meetings: { inApp: true, email: true },
  },
}

describe('isCollaborationEmailEnabledForRecipient', () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it('returns true when prefs allow collaboration email', async () => {
    queryMock.mockResolvedValue({ notificationPreferences: enabledPrefs })
    await expect(isCollaborationEmailEnabledForRecipient('user@example.com')).resolves.toBe(true)
    expect(shouldSendCollaborationEmailCopy(enabledPrefs)).toBe(true)
  })

  it('returns false when collaboration email is disabled', async () => {
    queryMock.mockResolvedValue({
      notificationPreferences: {
        ...enabledPrefs,
        categories: { ...enabledPrefs.categories, collaboration: { inApp: true, email: false } },
      },
    })
    await expect(isCollaborationEmailEnabledForRecipient('user@example.com')).resolves.toBe(false)
  })
})
