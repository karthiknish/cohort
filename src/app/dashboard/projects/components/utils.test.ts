import { describe, expect, it } from 'vitest'

import type { ProjectRecord } from '@/types/projects'

import { filterProjectsByQuery, projectMatchesQuery } from './utils'

const PROJECT: ProjectRecord = {
  id: 'project-1',
  name: 'Website Redesign',
  description: 'Refresh landing pages and improve conversion flows.',
  status: 'active',
  clientId: 'client-1',
  clientName: 'Acme Labs',
  startDate: null,
  endDate: null,
  tags: ['design', 'conversion'],
  ownerId: null,
  createdAt: null,
  updatedAt: null,
  taskCount: 4,
  openTaskCount: 2,
  recentActivityAt: null,
}

describe('project search helpers', () => {
  it('matches client names and tags in addition to project text', () => {
    expect(projectMatchesQuery(PROJECT, 'acme')).toBe(true)
    expect(projectMatchesQuery(PROJECT, 'conversion')).toBe(true)
    expect(projectMatchesQuery(PROJECT, 'redesign')).toBe(true)
  })

  it('returns all projects when the query is empty', () => {
    expect(filterProjectsByQuery([PROJECT], '')).toEqual([PROJECT])
    expect(filterProjectsByQuery([PROJECT], '   ')).toEqual([PROJECT])
  })

  it('filters out non-matching projects', () => {
    const otherProject = { ...PROJECT, id: 'project-2', name: 'Paid Social Sprint', clientName: 'Beta Co', tags: ['ads'] }

    expect(filterProjectsByQuery([PROJECT, otherProject], 'acme')).toEqual([PROJECT])
  })
})