import { describe, expect, it } from 'vitest'

import {
  assessDocumentImportDueDate,
  buildAssigneeMemberPool,
  enrichExtractedTasksWithDocumentAssignees,
  normalizePriority,
  parseExplicitDocumentPriority,
  parseExtractedTasksResponse,
  resolveDocumentImportAssignees,
  resolveDocumentImportPriority,
  stripMarkdownFences,
} from './taskDocumentImportParsing'

describe('parseExtractedTasksResponse', () => {
  it('parses a bare JSON array of tasks', () => {
    const raw = JSON.stringify([
      { title: 'Ship creative', assignedToNames: ['Alex'], priority: 'high' },
    ])

    const tasks = parseExtractedTasksResponse(raw)
    expect(tasks).toHaveLength(1)
    expect(tasks[0]?.title).toBe('Ship creative')
  })

  it('parses fenced JSON and tasks wrapper objects', () => {
    const raw = `\`\`\`json
{
  "tasks": [
    { "title": "Review brief", "description": "Due Friday" }
  ]
}
\`\`\``

    const tasks = parseExtractedTasksResponse(raw)
    expect(tasks).toHaveLength(1)
    expect(tasks[0]?.title).toBe('Review brief')
  })

  it('returns an empty array for invalid JSON', () => {
    expect(parseExtractedTasksResponse('not json')).toEqual([])
  })
})

describe('normalizePriority', () => {
  it('normalizes known priorities and defaults to medium', () => {
    expect(normalizePriority('low')).toBe('low')
    expect(normalizePriority('HIGH')).toBe('high')
    expect(normalizePriority('urgent')).toBe('high')
    expect(normalizePriority('unknown')).toBe('medium')
  })
})

describe('resolveDocumentImportPriority', () => {
  const nowMs = Date.parse('2026-05-22T12:00:00.000Z')

  it('keeps explicit document priorities', () => {
    expect(
      resolveDocumentImportPriority({
        explicitPriority: 'high',
        dueDateMs: Date.parse('2026-06-01T00:00:00.000Z'),
        nowMs,
      }),
    ).toBe('high')
  })

  it('defaults to low when no priority or due date is available', () => {
    expect(
      resolveDocumentImportPriority({
        explicitPriority: null,
        dueDateMs: null,
        nowMs,
      }),
    ).toBe('low')
  })

  it('infers high priority for deadlines within three days', () => {
    expect(
      resolveDocumentImportPriority({
        explicitPriority: undefined,
        dueDateMs: Date.parse('2026-05-24T00:00:00.000Z'),
        nowMs,
      }),
    ).toBe('high')
  })

  it('infers medium priority for deadlines within two weeks', () => {
    expect(
      resolveDocumentImportPriority({
        explicitPriority: undefined,
        dueDateMs: Date.parse('2026-05-30T00:00:00.000Z'),
        nowMs,
      }),
    ).toBe('medium')
  })

  it('infers low priority for distant deadlines', () => {
    expect(
      resolveDocumentImportPriority({
        explicitPriority: undefined,
        dueDateMs: Date.parse('2026-06-22T00:00:00.000Z'),
        nowMs,
      }),
    ).toBe('low')
  })

  it('maps urgent explicit labels to high', () => {
    expect(parseExplicitDocumentPriority('urgent')).toBe('high')
  })
})

describe('stripMarkdownFences', () => {
  it('removes markdown code fences', () => {
    expect(stripMarkdownFences('```json\n[]\n```')).toBe('[]')
  })
})

const MARKETING_TASK_ALLOCATION_TEXT = `Marketing Task Allocation
Deepak
Task

Priority

Deadline

Prepare Q3 social media content calendar

High

28 May 2026

Research competitor ad creatives for UK SaaS brands

Medium

31 May 2026

Task

Priority

Deadline

Design banner concepts for summer campaign

High

29 May 2026

Schedule and publish weekly LinkedIn posts

Medium

1 June 2026

Archana`

describe('enrichExtractedTasksWithDocumentAssignees', () => {
  it('infers section assignees for allocation tables with trailing names', () => {
    const rawTasks = [
      { title: 'Prepare Q3 social media content calendar', priority: 'high' },
      { title: 'Research competitor ad creatives for UK SaaS brands', priority: 'medium' },
      { title: 'Design banner concepts for summer campaign', priority: 'high' },
      { title: 'Schedule and publish weekly LinkedIn posts', priority: 'medium' },
    ]

    const enriched = enrichExtractedTasksWithDocumentAssignees(
      MARKETING_TASK_ALLOCATION_TEXT,
      rawTasks,
    )

    expect(enriched[0]?.assignedToNames).toEqual(['Deepak'])
    expect(enriched[1]?.assignedToNames).toEqual(['Deepak'])
    expect(enriched[2]?.assignedToNames).toEqual(['Archana'])
    expect(enriched[3]?.assignedToNames).toEqual(['Archana'])
  })

  it('does not overwrite assignees already extracted by the model', () => {
    const rawTasks = [{ title: 'Ship creative', assignedToNames: ['Alex Kim'] }]

    const enriched = enrichExtractedTasksWithDocumentAssignees(
      MARKETING_TASK_ALLOCATION_TEXT,
      rawTasks,
    )

    expect(enriched[0]?.assignedToNames).toEqual(['Alex Kim'])
  })
})

describe('buildAssigneeMemberPool', () => {
  const workspaceMembers = [
    { id: 'user-aaa', name: 'aaa', email: 'aaa@example.com' },
  ]

  it('adds client roster names for suggestions when no workspace profile matches', () => {
    const pool = buildAssigneeMemberPool(workspaceMembers, ['Deepak Karnan', 'Archana Ravi Kumar'])

    expect(resolveDocumentImportAssignees(['Deepak'], pool)).toEqual({
      assignedToUserIds: [],
      assignmentStatus: 'unassigned',
      suggestions: ['Deepak Karnan'],
    })
  })

  it('links roster names to admin workspace profiles via first-name matching', () => {
    const pool = buildAssigneeMemberPool(
      [{ id: 'admin-deepak', name: 'Deepak Karnan', email: 'deepak@agency.com' }],
      ['Deepak Karnan'],
    )

    expect(resolveDocumentImportAssignees(['Deepak'], pool)).toEqual({
      assignedToUserIds: ['admin-deepak'],
      assignmentStatus: 'resolved',
      suggestions: [],
    })
  })

  it('links roster full names to short admin workspace profiles', () => {
    const pool = buildAssigneeMemberPool(
      [{ id: 'admin-deepak', name: 'Deepak', email: 'deepak@agency.com' }],
      ['Deepak Karnan'],
    )

    expect(resolveDocumentImportAssignees(['Deepak'], pool)).toEqual({
      assignedToUserIds: ['admin-deepak'],
      assignmentStatus: 'resolved',
      suggestions: [],
    })
  })

  it('links roster names to workspace profiles when names match exactly', () => {
    const pool = buildAssigneeMemberPool(workspaceMembers, ['aaa', 'Deepak Karnan'])

    expect(resolveDocumentImportAssignees(['aaa'], pool)).toEqual({
      assignedToUserIds: ['user-aaa'],
      assignmentStatus: 'resolved',
      suggestions: [],
    })
  })
})

describe('resolveDocumentImportAssignees', () => {
  const members = [
    { id: 'user-deepak', name: 'Deepak Sharma', email: 'deepak.sharma@example.com' },
    { id: 'user-archana', name: 'Archana Patel', email: 'archana@example.com' },
    { id: 'user-karthik', name: 'Karthik User', email: 'karthik@example.com' },
  ]

  it('links first-name document assignees to workspace profiles', () => {
    const result = resolveDocumentImportAssignees(['Deepak'], members)

    expect(result).toEqual({
      assignedToUserIds: ['user-deepak'],
      assignmentStatus: 'resolved',
      suggestions: [],
    })
  })

  it('links trailing-name document assignees to workspace profiles', () => {
    const result = resolveDocumentImportAssignees(['Patel'], members)

    expect(result).toEqual({
      assignedToUserIds: ['user-archana'],
      assignmentStatus: 'resolved',
      suggestions: [],
    })
  })

  it('does not store raw names when no workspace profile matches', () => {
    const result = resolveDocumentImportAssignees(['Arch'], members)

    expect(result.assignedToUserIds).toEqual([])
    expect(result.assignmentStatus).toBe('unassigned')
    expect(result.suggestions).toContain('Archana Patel')
  })

  it('marks duplicate workspace matches as ambiguous', () => {
    const result = resolveDocumentImportAssignees(['Deepak'], [
      { id: '1', name: 'Deepak Sharma' },
      { id: '2', name: 'Deepak Singh' },
    ])

    expect(result).toEqual({
      assignedToUserIds: [],
      assignmentStatus: 'ambiguous',
      suggestions: ['Deepak Sharma', 'Deepak Singh'],
    })
  })

  it('does not match middle names inside a workspace profile', () => {
    const result = resolveDocumentImportAssignees(['Deepak'], [{ id: '1', name: 'Karthik Deepak Singh' }])

    expect(result).toEqual({
      assignedToUserIds: [],
      assignmentStatus: 'unassigned',
      suggestions: [],
    })
  })
})

describe('assessDocumentImportDueDate', () => {
  it('marks clear document dates as resolved', () => {
    expect(
      assessDocumentImportDueDate({
        dueDate: '28 May 2026',
      }),
    ).toEqual({
      status: 'resolved',
      hint: null,
      candidate: '28 May 2026',
    })
  })

  it('marks vague deadlines as unclear', () => {
    expect(
      assessDocumentImportDueDate({
        dueDate: 'next week',
      }),
    ).toEqual({
      status: 'unclear',
      hint: 'next week',
      candidate: 'next week',
    })
  })

  it('marks missing deadlines when nothing is present', () => {
    expect(
      assessDocumentImportDueDate({
        dueDate: null,
        description: 'Prepare the launch checklist',
      }),
    ).toEqual({
      status: 'missing',
      hint: null,
      candidate: null,
    })
  })

  it('reads deadline mentions from source excerpts', () => {
    expect(
      assessDocumentImportDueDate({
        sourceExcerpt: 'Deadline: 31 May 2026',
      }),
    ).toEqual({
      status: 'resolved',
      hint: null,
      candidate: '31 May 2026',
    })
  })
})
