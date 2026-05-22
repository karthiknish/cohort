'use client'

import { useCampaignManagementCard } from './use-campaign-management-card'

import type { CampaignManagementCardProps } from './campaign-management-card-types'

export type { CampaignManagementCardProps } from './campaign-management-card-types'

export function CampaignManagementCard(props: CampaignManagementCardProps) {
  return useCampaignManagementCard(props)
}
