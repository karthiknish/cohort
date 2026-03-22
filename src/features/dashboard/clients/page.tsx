import ClientsDashboardPageClient from './clients-dashboard-page'

type RouteSearchParams = Record<string, string | string[] | undefined>

type ClientsDashboardPageProps = {
  searchParams?: RouteSearchParams | Promise<RouteSearchParams>
}

function getFirstSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return typeof value === 'string' ? value : null
}

export default async function ClientsDashboardPage({ searchParams }: ClientsDashboardPageProps) {
  const resolvedSearchParams = await searchParams

  return <ClientsDashboardPageClient initialClientId={getFirstSearchParam(resolvedSearchParams?.clientId)} />
}
