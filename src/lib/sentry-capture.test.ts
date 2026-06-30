import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getClientMock = vi.hoisted(() => vi.fn())
const captureExceptionMock = vi.hoisted(() => vi.fn())
const captureMessageMock = vi.hoisted(() => vi.fn())
const setUserMock = vi.hoisted(() => vi.fn())
const setTagMock = vi.hoisted(() => vi.fn())

vi.mock('@sentry/tanstackstart-react', () => ({
  getClient: getClientMock,
  captureException: captureExceptionMock,
  captureMessage: captureMessageMock,
  setUser: setUserMock,
  setTag: setTagMock,
}))

describe('sentry-capture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getClientMock.mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.resetModules()
  })

  async function loadModule() {
    return await import('./sentry-capture')
  }

  describe('when SDK is not initialized', () => {
    it('captureError is a no-op', async () => {
      const { captureError } = await loadModule()
      captureError(new Error('boom'))
      expect(captureExceptionMock).not.toHaveBeenCalled()
    })

    it('captureMessage is a no-op', async () => {
      const { captureMessage } = await loadModule()
      captureMessage('hello')
      expect(captureMessageMock).not.toHaveBeenCalled()
    })

    it('setSentryUser is a no-op', async () => {
      const { setSentryUser } = await loadModule()
      setSentryUser({ id: 'user-1', role: 'admin' })
      expect(setUserMock).not.toHaveBeenCalled()
      expect(setTagMock).not.toHaveBeenCalled()
    })

    it('setSentryTag is a no-op', async () => {
      const { setSentryTag } = await loadModule()
      setSentryTag('key', 'value')
      expect(setTagMock).not.toHaveBeenCalled()
    })
  })

  describe('when SDK is initialized', () => {
    beforeEach(() => {
      getClientMock.mockReturnValue({})
    })

    it('captureError forwards to Sentry.captureException with context', async () => {
      const { captureError } = await loadModule()
      const error = new Error('boom')
      captureError(error, {
        tags: { error_code: 'TEST' },
        extra: { context: 'test' },
        level: 'warning',
      })
      expect(captureExceptionMock).toHaveBeenCalledWith(error, {
        tags: { error_code: 'TEST' },
        extra: { context: 'test' },
        level: 'warning',
      })
    })

    it('captureError defaults level to error', async () => {
      const { captureError } = await loadModule()
      captureError(new Error('boom'))
      expect(captureExceptionMock).toHaveBeenCalledWith(expect.anything(), {
        tags: undefined,
        extra: undefined,
        level: 'error',
      })
    })

    it('captureMessage forwards to Sentry.captureMessage', async () => {
      const { captureMessage } = await loadModule()
      captureMessage('deployed', 'info', { tags: { release: 'v1' } })
      expect(captureMessageMock).toHaveBeenCalledWith('deployed', {
        level: 'info',
        tags: { release: 'v1' },
        extra: undefined,
      })
    })

    it('setSentryUser sets user id and role tag', async () => {
      const { setSentryUser } = await loadModule()
      setSentryUser({ id: 'user-1', email: 'a@b.com', role: 'admin' })
      expect(setUserMock).toHaveBeenCalledWith({ id: 'user-1' })
      expect(setTagMock).toHaveBeenCalledWith('user_role', 'admin')
    })

    it('setSentryUser(null) clears user and sets anonymous role', async () => {
      const { setSentryUser } = await loadModule()
      setSentryUser(null)
      expect(setUserMock).toHaveBeenCalledWith(null)
      expect(setTagMock).toHaveBeenCalledWith('user_role', 'anonymous')
    })

    it('setSentryTag forwards to Sentry.setTag', async () => {
      const { setSentryTag } = await loadModule()
      setSentryTag('feature_flag', 'enabled')
      expect(setTagMock).toHaveBeenCalledWith('feature_flag', 'enabled')
    })
  })

  describe('dynamic SDK state', () => {
    it('captures when SDK becomes active after initial no-op', async () => {
      const { captureError } = await loadModule()
      // SDK not active initially
      captureError(new Error('first'))
      expect(captureExceptionMock).not.toHaveBeenCalled()

      // SDK becomes active
      getClientMock.mockReturnValue({})
      captureError(new Error('second'))
      expect(captureExceptionMock).toHaveBeenCalledTimes(1)
      expect(captureExceptionMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'second' }),
        expect.anything(),
      )
    })
  })
})
