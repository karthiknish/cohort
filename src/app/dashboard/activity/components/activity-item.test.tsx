import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { EnhancedActivity } from '../types'

import { ActivityItem } from './activity-item'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const activity: EnhancedActivity = {
  id: 'activity-1',
  type: 'project_updated',
  timestamp: '2026-03-11T12:00:00.000Z',
  clientId: 'client-1',
  entityId: 'project-1',
  entityName: 'Spring Launch',
  description: 'Updated client handoff',
  navigationUrl: '/dashboard/projects/project-1',
  isRead: false,
  isPinned: false,
}

describe('ActivityItem', () => {
  it('renders a semantic details button instead of a role button wrapper', () => {
    const markup = renderToStaticMarkup(
      <ActivityItem
        activity={activity}
        isSelected={false}
        showReactions={null}
        comments={[]}
        onSelectionChange={vi.fn()}
        onTogglePin={vi.fn()}
        onMarkAsRead={vi.fn()}
        onAddReaction={vi.fn()}
        onAddComment={vi.fn()}
        onShowReactionsChange={vi.fn()}
        onViewDetails={vi.fn()}
        currentUserName="Alex Kim"
      />,
    )

    expect(markup).toContain('Open activity Updated client handoff')
    expect(markup).not.toContain('role="button"')
  })
})