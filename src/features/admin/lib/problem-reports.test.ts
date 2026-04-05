import { describe, expect, it } from 'vitest'

import {
  filterProblemReports,
  formatProblemReportDate,
  getProblemReportSeverityDisplay,
  getProblemReportStatusDisplay,
  type ProblemReport,
} from './problem-reports'

const sampleReports: ProblemReport[] = [
  {
    id: 'r1',
    userId: 'u1',
    userEmail: 'alex@example.com',
    userName: 'Alex Chen',
    workspaceId: 'ws1',
    title: 'Broken chart',
    description: 'Chart does not load',
    severity: 'high',
    status: 'open',
    fixed: null,
    resolution: null,
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'r2',
    userId: 'u2',
    userEmail: 'jordan@example.com',
    userName: 'Jordan Lee',
    workspaceId: 'ws1',
    title: 'Resolved issue',
    description: 'Already fixed',
    severity: 'low',
    status: 'resolved',
    fixed: true,
    resolution: 'Patched',
    createdAt: '2026-04-02T10:00:00.000Z',
    updatedAt: '2026-04-02T10:00:00.000Z',
  },
]

describe('problem report view helpers', () => {
  it('maps severity display metadata', () => {
    expect(getProblemReportSeverityDisplay('high')).toEqual({
      label: 'High',
      variant: 'default',
      className: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20',
    })
    expect(getProblemReportSeverityDisplay('critical')).toEqual({
      label: 'Critical',
      variant: 'destructive',
    })
  })

  it('maps status display metadata', () => {
    expect(getProblemReportStatusDisplay('resolved')).toEqual({
      icon: 'resolved',
      className: 'h-4 w-4 text-success',
    })
    expect(getProblemReportStatusDisplay('other')).toEqual({ icon: null })
  })

  it('formats missing dates as N/A', () => {
    expect(formatProblemReportDate(null, () => 'ignored')).toBe('N/A')
  })

  it('filters reports by status and search term together', () => {
    expect(filterProblemReports(sampleReports, {
      statusFilter: 'resolved',
      searchTerm: 'jordan',
    }).map((report) => report.id)).toEqual(['r2'])
  })

  it('returns all matching statuses when the search term is blank', () => {
    expect(filterProblemReports(sampleReports, {
      statusFilter: 'open',
      searchTerm: '   ',
    }).map((report) => report.id)).toEqual(['r1'])
  })
})