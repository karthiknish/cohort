import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { WorkspaceTrendsCard } from './workspace-trends-card'
import type { ClientComparisonSummary } from '@/types/dashboard'

const empty: ClientComparisonSummary[] = []

describe('WorkspaceTrendsCard', () => {
  it('renders empty state when summaries is empty', () => {
    const html = renderToStaticMarkup(
      <WorkspaceTrendsCard summaries={empty} periodDays={30} mixedCurrencies={false} />,
    )
    expect(html).toContain('No cross-workspace data')
  })
})
