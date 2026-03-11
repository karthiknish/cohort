import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CampaignAdsSection } from './campaign-ads-section'

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(async () => []),
}))

vi.mock('next/image', () => ({
  default: () => <div data-next-image="true" />,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ toString: () => '' }),
}))

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { agencyId: 'agency-1' } }),
}))

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

vi.mock('./create-creative-dialog', () => ({
  CreateCreativeDialog: () => <div>Create creative</div>,
}))

describe('CampaignAdsSection composition', () => {
  it('renders the preview-mode state', () => {
    const markup = renderToStaticMarkup(
      <CampaignAdsSection providerId="meta" campaignId="campaign-1" clientId="client-1" isPreviewMode />,
    )

    expect(markup).toContain('Ad Creatives')
    expect(markup).toContain('Ads list is not available in preview mode.')
    expect(markup).toContain('Create creative')
  })

  it('renders the live loading shell before creatives load', () => {
    const markup = renderToStaticMarkup(
      <CampaignAdsSection providerId="google" campaignId="campaign-2" clientId="client-2" />,
    )

    expect(markup).toContain('Create creative')
    expect(markup).toContain('Loading creatives...')
    expect(markup).toContain('animate-spin')
  })
})