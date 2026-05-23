import { describe, expect, it, beforeEach, afterEach } from 'vitest'

import { assertMetaWebhookVerifyToken } from './metaWebhookAuth'

describe('assertMetaWebhookVerifyToken', () => {
  const originalVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN
  const originalConvexUrl = process.env.CONVEX_CLOUD_URL
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    delete process.env.META_WEBHOOK_VERIFY_TOKEN
    delete process.env.CONVEX_CLOUD_URL
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    if (originalVerifyToken === undefined) {
      delete process.env.META_WEBHOOK_VERIFY_TOKEN
    } else {
      process.env.META_WEBHOOK_VERIFY_TOKEN = originalVerifyToken
    }
    if (originalConvexUrl === undefined) {
      delete process.env.CONVEX_CLOUD_URL
    } else {
      process.env.CONVEX_CLOUD_URL = originalConvexUrl
    }
    process.env.NODE_ENV = originalNodeEnv
  })

  it('allows any token in local dev when verify token is unset', () => {
    expect(() => assertMetaWebhookVerifyToken('anything')).not.toThrow()
  })

  it('rejects mismatched token when configured', () => {
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'expected-token'
    expect(() => assertMetaWebhookVerifyToken('wrong')).toThrow(/verify token/i)
  })

  it('accepts matching token when configured', () => {
    process.env.META_WEBHOOK_VERIFY_TOKEN = 'expected-token'
    expect(() => assertMetaWebhookVerifyToken('expected-token')).not.toThrow()
  })
})
