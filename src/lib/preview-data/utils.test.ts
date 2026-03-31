import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  isPreviewModeEnabled,
  isPreviewRouteRequest,
  isScreenRecordingModeEnabled,
  withPreviewModeSearchParam,
  withPreviewModeSearchParamIfEnabled,
} from './utils'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('preview route access helpers', () => {
  it('allows preview-marked proposal and ad detail routes', () => {
    expect(
      isPreviewRouteRequest(
        '/dashboard/proposals/preview-proposal-1/deck',
        new URLSearchParams('preview=1'),
      ),
    ).toBe(true)

    expect(
      isPreviewRouteRequest(
        '/dashboard/ads/campaigns/meta/campaign-1/creative/creative-1',
        new URLSearchParams('preview=true'),
      ),
    ).toBe(true)
  })

  it('rejects unrelated routes or missing preview flags', () => {
    expect(
      isPreviewRouteRequest(
        '/dashboard/projects',
        new URLSearchParams('preview=1'),
      ),
    ).toBe(false)

    expect(
      isPreviewRouteRequest(
        '/dashboard/proposals/preview-proposal-1/deck',
        new URLSearchParams(''),
      ),
    ).toBe(false)
  })

  it('adds the preview flag without dropping existing params or hashes', () => {
    expect(withPreviewModeSearchParam('/dashboard/proposals/demo/deck')).toBe(
      '/dashboard/proposals/demo/deck?preview=1',
    )

    expect(
      withPreviewModeSearchParam('/dashboard/ads/campaigns/meta/campaign-1?startDate=2026-03-01'),
    ).toBe('/dashboard/ads/campaigns/meta/campaign-1?startDate=2026-03-01&preview=1')

    expect(withPreviewModeSearchParam('/dashboard/proposals/demo/deck#overview')).toBe(
      '/dashboard/proposals/demo/deck?preview=1#overview',
    )
  })

  it('keeps hrefs unchanged when preview mode is disabled', () => {
    expect(withPreviewModeSearchParamIfEnabled('/dashboard/proposals/demo/deck', false)).toBe(
      '/dashboard/proposals/demo/deck',
    )
  })

  it('forces preview mode when screen recording is enabled', () => {
    vi.stubEnv('NEXT_PUBLIC_SCREEN_RECORDING_ENABLED', 'true')

    expect(isScreenRecordingModeEnabled()).toBe(true)
    expect(isPreviewModeEnabled()).toBe(true)
  })
})