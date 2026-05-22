import { ConvexError } from 'convex/values'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./convex-errors', () => ({
  logError: vi.fn(),
  asErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof ConvexError) {
      const data = error.data as { message?: string }
      return data.message ?? 'An error occurred'
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred'
  }),
}))

vi.mock('./notifications', () => ({
  notifyFailure: vi.fn(() => 'toast-id'),
}))

import { logError } from './convex-errors'
import { notifyFailure } from './notifications'
import { convexErrorMessage, reportConvexFailure } from './handle-convex-error'

describe('handle-convex-error', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reportConvexFailure logs and shows a toast', () => {
    const error = new ConvexError({
      code: 'CONFLICT',
      message: 'Already exists',
    })

    const toastId = reportConvexFailure({
      error,
      context: 'test:mutation',
      title: 'Save failed',
    })

    expect(logError).toHaveBeenCalledWith(error, 'test:mutation')
    expect(notifyFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Save failed',
        error,
      }),
    )
    expect(toastId).toBe('toast-id')
  })

  it('convexErrorMessage returns fallback for empty generic messages', () => {
    expect(convexErrorMessage(new Error(''), 'Custom fallback')).toBe('Custom fallback')
    expect(
      convexErrorMessage(
        new ConvexError({ code: 'BAD_REQUEST', message: 'Invalid input' }),
        'Custom fallback',
      ),
    ).toBe('Invalid input')
  })
})
