import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import { PlatformComparisonSummaryCard } from './platform-comparison-summary-card'
import type { MetricRecord } from '@/types/dashboard'

const empty: MetricRecord[] = []

describe('PlatformComparisonSummaryCard', () => {
  it('renders empty state copy when not loading and no metrics', () => {
    const html = renderToStaticMarkup(<PlatformComparisonSummaryCard metrics={empty} isLoading={false} />)
    expect(html).toContain('No ad metrics for this period')
  })
})
