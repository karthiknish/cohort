import { describe, expect, it } from 'vitest'

import { shouldSendCollaborationEmailCopy } from './collaboration-email-notify'

describe('shouldSendCollaborationEmailCopy', () => {
  it('returns false when pauseAll is enabled', () => {
    expect(
      shouldSendCollaborationEmailCopy({
        version: 2,
        pauseAll: true,
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        categories: {
          tasks: { inApp: true, email: true },
          collaboration: { inApp: true, email: true },
          ads: { inApp: true, email: true },
          digest: { inApp: true, email: true },
          projects: { inApp: true, email: true },
          meetings: { inApp: true, email: true },
        },
      }),
    ).toBe(false)
  })

  it('returns false when collaboration email is disabled', () => {
    expect(
      shouldSendCollaborationEmailCopy({
        version: 2,
        pauseAll: false,
        quietHours: { enabled: false, start: '22:00', end: '08:00' },
        categories: {
          tasks: { inApp: true, email: true },
          collaboration: { inApp: true, email: false },
          ads: { inApp: true, email: true },
          digest: { inApp: true, email: true },
          projects: { inApp: true, email: true },
          meetings: { inApp: true, email: true },
        },
      }),
    ).toBe(false)
  })

  it('returns true when collaboration email is enabled and not paused', () => {
    expect(
      shouldSendCollaborationEmailCopy({
        version: 2,
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
      }),
    ).toBe(true)
  })
})
