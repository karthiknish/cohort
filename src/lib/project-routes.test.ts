import { describe, expect, it } from 'vitest'

import { buildProjectRoute, buildProjectTasksRoute } from './project-routes'

describe('project route helpers', () => {
  it('builds a project route with optional name context', () => {
    expect(buildProjectRoute('project-1', 'Website Refresh')).toBe('/dashboard/projects?projectId=project-1&projectName=Website+Refresh')
  })

  it('builds a project task route with client and action context', () => {
    expect(buildProjectTasksRoute({
      projectId: 'project-1',
      projectName: 'Website Refresh',
      clientId: 'client-1',
      clientName: 'Acme Labs',
      action: 'create',
    })).toBe('/dashboard/tasks?projectId=project-1&projectName=Website+Refresh&clientId=client-1&clientName=Acme+Labs&action=create')
  })
})