import { Suspense } from 'react'

import CreativeDetailPageClient from './creative-detail-page-client'
import { Skeleton } from '@/shared/ui/skeleton'

type RouteSearchParams = Record<string, string | string[] | undefined>

type CreativeDetailPageProps = {
  searchParams?: RouteSearchParams | Promise<RouteSearchParams>
}

const CREATIVE_DETAIL_PAGE_FALLBACK = <CreativeDetailPageFallback />

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

export default async function CreativeDetailPage({ searchParams }: CreativeDetailPageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <Suspense fallback={CREATIVE_DETAIL_PAGE_FALLBACK}>
      <CreativeDetailPageClient
        campaignName={getFirstSearchParam(resolvedSearchParams?.campaignName)}
        currency={getFirstSearchParam(resolvedSearchParams?.currency)}
        searchParamsString={toSearchParamsString(resolvedSearchParams)}
      />
    </Suspense>
  )
}

function CreativeDetailPageFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-96 w-full rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}
