import { describe, expect, it } from 'vitest'

import {
  buildGeminiRateLimitKey,
  formatGeminiRateLimitMessage,
  GEMINI_RATE_LIMITS,
} from './geminiRateLimits'

describe('buildGeminiRateLimitKey', () => {
  it('builds stable sanitized keys for Gemini operations', () => {
    expect(buildGeminiRateLimitKey({
      name: 'meetingNotes',
      userId: 'user 1',
      workspaceId: 'ws/1',
      resourceId: 'meeting:42',
      scope: 'post meeting',
    })).toBe('gemini:meetingNotes:user_1:ws_1:post_meeting:meeting:42')
  })

  it('falls back for missing values', () => {
    expect(buildGeminiRateLimitKey({ name: 'clientSummary' }))
      .toBe('gemini:clientSummary:anonymous:global:default:all')
  })
})

describe('formatGeminiRateLimitMessage', () => {
  it('rounds retry-after windows up to the nearest second', () => {
    expect(formatGeminiRateLimitMessage(1_500))
      .toBe('Gemini request limit exceeded. Please try again in 2 seconds.')
  })
})

describe('GEMINI_RATE_LIMITS', () => {
  it('keeps proposal generation stricter than chat-like usage', () => {
    expect(GEMINI_RATE_LIMITS.proposalGeneration.maxRequests)
      .toBeLessThan(GEMINI_RATE_LIMITS.agentMessage.maxRequests)
  })
})