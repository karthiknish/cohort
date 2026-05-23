import { describe, expect, it } from 'vitest'

import {
  getProjectImportReviewBlocker,
  projectNeedsClientReview,
} from './projects-document-import-review'
import type { ProposedImportProject } from './projects-document-import-types'

function buildProject(overrides: Partial<ProposedImportProject> = {}): ProposedImportProject {
  return {
    localId: 'import-1',
    name: 'Website redesign',
    description: '',
    status: 'planning',
    clientId: 'client-1',
    documentClientName: 'Acme Corp',
    clientStatus: 'resolved',
    startDate: '2026-06-01',
    endDate: '2026-08-01',
    startDateStatus: 'resolved',
    endDateStatus: 'resolved',
    startDateHint: null,
    endDateHint: null,
    tags: [],
    suggestions: [],
    sourceExcerpt: null,
    include: true,
    ...overrides,
  }
}

describe('projectNeedsClientReview', () => {
  it('flags ambiguous client matches', () => {
    expect(
      projectNeedsClientReview(
        buildProject({ clientStatus: 'ambiguous', clientId: '', suggestions: ['Acme Corp', 'Acme LLC'] }),
      ),
    ).toBe(true)
  })
})

describe('getProjectImportReviewBlocker', () => {
  it('requires at least one selected project', () => {
    expect(getProjectImportReviewBlocker([buildProject({ include: false })])).toBe(
      'Select at least one project to create.',
    )
  })
})
