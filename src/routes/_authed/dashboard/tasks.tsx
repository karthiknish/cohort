import { createFileRoute } from '@tanstack/react-router'
import TasksPageClient from '@/features/dashboard/tasks/tasks-page-client'

export const Route = createFileRoute('/_authed/dashboard/tasks')({
  validateSearch: (search: Record<string, unknown>) => ({
    action: typeof search.action === 'string' ? search.action : undefined,
    clientId: typeof search.clientId === 'string' ? search.clientId : undefined,
    clientName: typeof search.clientName === 'string' ? search.clientName : undefined,
    projectId: typeof search.projectId === 'string' ? search.projectId : undefined,
    projectName: typeof search.projectName === 'string' ? search.projectName : undefined,
  }),
  head: () => ({
    meta: [{ title: 'Tasks | Cohorts' }],
  }),
  component: TasksRoute,
})

function TasksRoute() {
  const search = Route.useSearch()
  const initialSearchParamsString = new URLSearchParams(
    Object.entries(search).flatMap(([key, value]) =>
      value == null ? [] : [[key, value]],
    ),
  ).toString()

  return (
    <TasksPageClient
      initialAction={search.action ?? null}
      initialClientId={search.clientId ?? null}
      initialClientName={search.clientName ?? null}
      initialProjectId={search.projectId ?? null}
      initialProjectName={search.projectName ?? null}
      initialSearchParamsString={initialSearchParamsString}
    />
  )
}
