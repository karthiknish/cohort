import { describe, expect, it } from 'vitest'

import {
  normalizePriority,
  parseExtractedTasksResponse,
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
    expect(normalizePriority('urgent')).toBe('medium')
  })
})

describe('stripMarkdownFences', () => {
  it('removes markdown code fences', () => {
    expect(stripMarkdownFences('```json\n[]\n```')).toBe('[]')
  })
})
