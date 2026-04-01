import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/contexts/preview-context', () => ({
  usePreview: vi.fn(),
}))

import { usePreview } from '@/shared/contexts/preview-context'

import { DashboardRoleBanner } from './dashboard-role-banner'

const mockedUsePreview = vi.mocked(usePreview)

describe('DashboardRoleBanner', () => {
  it('hides the banner in preview mode', () => {
    mockedUsePreview.mockReturnValue({
      isPreviewMode: true,
      setPreviewMode: vi.fn(),
      togglePreviewMode: vi.fn(),
    })

    const markup = renderToStaticMarkup(<DashboardRoleBanner userRole="admin" userDisplayName="Alex Morgan" />)

    expect(markup).toBe('')
  })

  it('renders the admin banner outside preview mode', () => {
    mockedUsePreview.mockReturnValue({
      isPreviewMode: false,
      setPreviewMode: vi.fn(),
      togglePreviewMode: vi.fn(),
    })

    const markup = renderToStaticMarkup(<DashboardRoleBanner userRole="admin" userDisplayName="Alex Morgan" />)

    expect(markup).toContain('Admin Dashboard')
    expect(markup).toContain('Admin Panel')
  })
})