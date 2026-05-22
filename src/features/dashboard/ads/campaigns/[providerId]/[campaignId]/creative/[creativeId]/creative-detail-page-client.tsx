'use client'

import { useCreativeDetailPageClient } from './creative-detail-page-client-controller'

type CreativeDetailPageClientProps = {
  campaignName?: string | null
  currency?: string | null
  searchParamsString?: string
}

export default function CreativeDetailPageClient(props: CreativeDetailPageClientProps) {
  return useCreativeDetailPageClient(props)
}
