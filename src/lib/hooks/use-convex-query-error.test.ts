import { describe, expect, it } from 'vitest'

import {
  mergeQueryErrors,
  queryErrorFromUnknown,
  resolveConvexQueryErrorMessage,
} from './use-convex-query-error'

describe('use-convex-query-error helpers', () => {
  it('resolveConvexQueryErrorMessage returns null while loading or skipped', () => {
    expect(resolveConvexQueryErrorMessage(undefined, {})).toBeNull()
    expect(resolveConvexQueryErrorMessage(null, { loading: true })).toBeNull()
    expect(resolveConvexQueryErrorMessage(null, { skipped: true })).toBeNull()
  })

  it('resolveConvexQueryErrorMessage surfaces null data after load', () => {
    expect(
      resolveConvexQueryErrorMessage(null, {
        fallbackMessage: 'Unable to load meetings.',
      }),
    ).toBe('Unable to load meetings.')
  })

  it('resolveConvexQueryErrorMessage clears when data is present', () => {
    expect(resolveConvexQueryErrorMessage({ ok: true }, {})).toBeNull()
  })

  it('mergeQueryErrors returns the first non-empty string', () => {
    expect(mergeQueryErrors(null, undefined, 'First', 'Second')).toBe('First')
    expect(mergeQueryErrors(null, '')).toBeNull()
  })

  it('queryErrorFromUnknown uses Error.message when present', () => {
    expect(queryErrorFromUnknown(new Error('plain'), 'fallback')).toBe('plain')
    expect(queryErrorFromUnknown({}, 'fallback')).toBe('fallback')
  })
})
