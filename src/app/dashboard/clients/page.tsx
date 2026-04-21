import { permanentRedirect } from 'next/navigation'

type RouteSearchParams = Record<string, string | string[] | undefined>

type DashboardClientsRedirectPageProps = {
	searchParams?: RouteSearchParams | Promise<RouteSearchParams>
}

function buildRedirectHref(searchParams: RouteSearchParams | undefined) {
	const params = new URLSearchParams()

	if (searchParams) {
		for (const [key, value] of Object.entries(searchParams)) {
			if (Array.isArray(value)) {
				value.forEach((entry) => {
					params.append(key, entry)
				})
				continue
			}

			if (typeof value === 'string') {
				params.set(key, value)
			}
		}
	}

	const query = params.toString()
	return query ? `/admin/clients?${query}` : '/admin/clients'
}

export default async function DashboardClientsRedirectPage({ searchParams }: DashboardClientsRedirectPageProps) {
	const resolvedSearchParams = await searchParams

	permanentRedirect(buildRedirectHref(resolvedSearchParams))
}
