import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { EnhancedActivity } from '../types'

import { ActivityList } from './activity-list'

const baseProps = {
  activities: [] as EnhancedActivity[],
  loading: false,
  error: null as string | null,
  hasMore: false,
  searchQuery: '',
  typeFilter: 'all' as const,
  dateRange: 'all' as const,
  statusFilter: 'all' as const,
  sortBy: 'newest' as const,
  onRetry: vi.fn(),
  onLoadMore: vi.fn(),
  onTogglePin: vi.fn(),
  onMarkAsRead: vi.fn(),
  onAddReaction: vi.fn(),
  onAddComment: vi.fn(),
  onViewDetails: vi.fn(),
  selectedActivities: new Set<string>(),
  onSelectionChange: vi.fn(),
  onSelectAll: vi.fn(),
  comments: {},
  currentUserName: 'Alex Kim',
}

describe('ActivityList', () => {
  it('renders a visible retry state for load failures', () => {
    const markup = renderToStaticMarkup(
      <ActivityList {...baseProps} error="Realtime activity is temporarily unavailable." />,
    )

    expect(markup).toContain('Failed to load activities')
    expect(markup).toContain('Realtime activity is temporarily unavailable.')
    expect(markup).toContain('Try Again')
  })
})