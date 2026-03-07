export function buildProjectRoute(projectId: string, projectName?: string | null): string {
  const params = new URLSearchParams({ projectId })
  if (projectName) params.set('projectName', projectName)
  return `/dashboard/projects?${params.toString()}`
}

export function buildProjectTasksRoute(options: {
  projectId: string
  projectName?: string | null
  clientId?: string | null
  clientName?: string | null
  action?: string | null
}): string {
  const params = new URLSearchParams({ projectId: options.projectId })

  if (options.projectName) params.set('projectName', options.projectName)
  if (options.clientId) params.set('clientId', options.clientId)
  if (options.clientName) params.set('clientName', options.clientName)
  if (options.action) params.set('action', options.action)

  return `/dashboard/tasks?${params.toString()}`
}