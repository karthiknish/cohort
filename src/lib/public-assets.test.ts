import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAppOrigin, getPublicAssetUrl } from './public-assets'

describe('public-assets', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('resolves public paths against env origin on OAuth document hosts', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://cohorts.test')

    vi.stubGlobal('window', {
      location: {
        origin: 'https://accounts.google.com',
        hostname: 'accounts.google.com',
      },
    })

    expect(getAppOrigin()).toBe('https://cohorts.test')
    expect(getPublicAssetUrl('/svgl/google.svg')).toBe('https://cohorts.test/svgl/google.svg')
  })

  it('uses window origin on normal app pages', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://cohorts.test')

    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:3001',
        hostname: 'localhost',
      },
    })

    expect(getAppOrigin()).toBe('http://localhost:3001')
    expect(getPublicAssetUrl('/svgl/meta.svg')).toBe('http://localhost:3001/svgl/meta.svg')
  })

  it('falls back to localhost without env on the server', () => {
    expect(getPublicAssetUrl('/svgl/pdf.svg')).toBe('http://localhost:3000/svgl/pdf.svg')
  })
})
