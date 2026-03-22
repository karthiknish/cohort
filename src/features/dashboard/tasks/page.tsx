import TasksPageClient from './tasks-page-client'

type RouteSearchParams = Record<string, string | string[] | undefined>

type TasksPageProps = {
  searchParams?: RouteSearchParams | Promise<RouteSearchParams>
}

function getFirstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return typeof value === 'string' ? value : null
}

function toSearchParamsString(searchParams: RouteSearchParams | undefined): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item)
      }
      continue
    }

    if (typeof value === 'string') {
      params.set(key, value)
    }
  }

  return params.toString()
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <TasksPageClient
      initialAction={getFirstSearchParam(resolvedSearchParams?.action)}
      initialClientId={getFirstSearchParam(resolvedSearchParams?.clientId)}
      initialClientName={getFirstSearchParam(resolvedSearchParams?.clientName)}
      initialProjectId={getFirstSearchParam(resolvedSearchParams?.projectId)}
      initialProjectName={getFirstSearchParam(resolvedSearchParams?.projectName)}
      initialSearchParamsString={toSearchParamsString(resolvedSearchParams)}
    />
  )
}
