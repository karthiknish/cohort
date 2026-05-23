import { describe, expect, it } from 'vitest'

import {
  parseExtractedProjectsResponse,
  parseProjectStatus,
  parseProjectTags,
  resolveDocumentImportClient,
  resolveDocumentImportProjectDate,
} from './projectDocumentImportParsing'

const clients = [
  { id: 'client-1', name: 'Acme Corp' },
  { id: 'client-2', name: 'Globex' },
]

describe('parseExtractedProjectsResponse', () => {
  it('parses a bare JSON array of projects', () => {
    const raw = JSON.stringify([
      { name: 'Website redesign', clientName: 'Acme Corp', status: 'active' },
    ])

    const projects = parseExtractedProjectsResponse(raw)
    expect(projects).toHaveLength(1)
    expect(projects[0]?.name).toBe('Website redesign')
  })

  it('parses fenced JSON and projects wrapper objects', () => {
    const raw = `\`\`\`json
{
  "projects": [
    { "name": "Q3 launch", "description": "Go-live in September" }
  ]
}
\`\`\``

    const projects = parseExtractedProjectsResponse(raw)
    expect(projects).toHaveLength(1)
    expect(projects[0]?.name).toBe('Q3 launch')
  })
})

describe('parseProjectStatus', () => {
  it('normalizes common status phrases', () => {
    expect(parseProjectStatus('in progress')).toBe('active')
    expect(parseProjectStatus('on hold')).toBe('on_hold')
    expect(parseProjectStatus('done')).toBe('completed')
  })
})

describe('resolveDocumentImportClient', () => {
  it('resolves an exact client match', () => {
    const result = resolveDocumentImportClient('Acme Corp', clients, null)
    expect(result.clientId).toBe('client-1')
    expect(result.clientStatus).toBe('resolved')
  })

  it('uses the preferred client when the document is silent', () => {
    const result = resolveDocumentImportClient(null, clients, 'client-2')
    expect(result.clientId).toBe('client-2')
    expect(result.clientStatus).toBe('preferred')
  })

  it('flags ambiguous client names', () => {
    const ambiguousClients = [
      { id: 'a', name: 'Acme Corp' },
      { id: 'b', name: 'Acme Corporation' },
    ]
    const result = resolveDocumentImportClient('Acme', ambiguousClients, null)
    expect(result.clientStatus).toBe('ambiguous')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })
})

describe('parseProjectTags', () => {
  it('parses arrays and comma-separated strings', () => {
    expect(parseProjectTags(['brand', 'web'])).toEqual(['brand', 'web'])
    expect(parseProjectTags('brand, web; paid')).toEqual(['brand', 'web', 'paid'])
  })
})

describe('resolveDocumentImportProjectDate', () => {
  it('marks vague dates as unclear', () => {
    const result = resolveDocumentImportProjectDate('soon', {})
    expect(result.status).toBe('unclear')
  })
})
