import { describe, expect, it } from 'vitest'

import {
  buildTaskDigest,
  buildTaskDigestUserMessage,
  formatDueLabel,
  parseTaskTimeWindowFromIntent,
} from './taskSummary'
import type { ClientTaskRecord } from './shared'

function task(partial: Partial<ClientTaskRecord> & Pick<ClientTaskRecord, 'legacyId' | 'title'>): ClientTaskRecord {
  return {
    status: 'todo',
    priority: 'medium',
    dueDateMs: null,
    assignedTo: null,
    clientName: null,
    projectName: null,
    ...partial,
  }
}

describe('parseTaskTimeWindowFromIntent', () => {
  it('detects due this week phrasing', () => {
    expect(parseTaskTimeWindowFromIntent('Summarize my tasks due this week')).toBe('due_this_week')
  })

  it('defaults to all tasks', () => {
    expect(parseTaskTimeWindowFromIntent('summarize tasks for abc')).toBe('all')
  })
})

describe('buildTaskDigestUserMessage', () => {
  const nowMs = Date.UTC(2026, 4, 19, 12, 0, 0)

  it('lists focused tasks for due-this-week requests', () => {
    const digest = buildTaskDigest({
      tasks: [
        task({
          legacyId: 't1',
          title: 'Homepage review',
          dueDateMs: nowMs + 2 * 24 * 60 * 60 * 1000,
          priority: 'high',
        }),
        task({
          legacyId: 't2',
          title: 'Old brief',
          status: 'completed',
          dueDateMs: nowMs - 5 * 24 * 60 * 60 * 1000,
        }),
        task({
          legacyId: 't3',
          title: 'Unscheduled follow-up',
        }),
      ],
      mode: 'summary',
      timeWindow: 'due_this_week',
      scopeLabel: 'abc',
      clientName: 'abc',
      nowMs,
    })

    const message = buildTaskDigestUserMessage(digest)

    expect(message).toContain('For abc:')
    expect(message).toContain('1 due this week')
    expect(message).toContain('Homepage review')
    expect(formatDueLabel(nowMs + 2 * 24 * 60 * 60 * 1000, nowMs)).toBe('Due in 2d')
  })

  it('explains when nothing is due this week but other work exists', () => {
    const digest = buildTaskDigest({
      tasks: [
        task({
          legacyId: 't1',
          title: 'Overdue item',
          dueDateMs: nowMs - 2 * 24 * 60 * 60 * 1000,
        }),
        task({
          legacyId: 't2',
          title: 'No date item',
        }),
      ],
      mode: 'summary',
      timeWindow: 'due_this_week',
      scopeLabel: 'abc',
      clientName: 'abc',
      nowMs,
    })

    const message = buildTaskDigestUserMessage(digest)

    expect(message).toContain('none due this week')
    expect(message).toContain('Elsewhere:')
    expect(message).toContain('1 overdue')
    expect(message).toContain('1 without a due date')
  })

  it('highlights overdue and due-this-week in the default summary', () => {
    const digest = buildTaskDigest({
      tasks: [
        task({
          legacyId: 't1',
          title: 'Late deliverable',
          dueDateMs: nowMs - 24 * 60 * 60 * 1000,
        }),
        task({
          legacyId: 't2',
          title: 'Friday launch',
          dueDateMs: nowMs + 3 * 24 * 60 * 60 * 1000,
        }),
      ],
      mode: 'summary',
      timeWindow: 'all',
      scopeLabel: 'you',
      nowMs,
    })

    const message = buildTaskDigestUserMessage(digest)

    expect(message).toContain('2 open')
    expect(message).toContain('Overdue:')
    expect(message).toContain('Late deliverable')
    expect(message).toContain('Due this week:')
    expect(message).toContain('Friday launch')
  })
})
