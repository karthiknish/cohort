'use client'

import { createContext, use } from 'react'

import type { Campaign, CampaignGroup } from './campaign-management-card-types'

type CampaignManagementActionContextValue = {
  actionLoading: string | null
  handleAction: (campaignId: string, action: 'enable' | 'pause' | 'remove') => Promise<void>
  openCampaignBiddingDialog: (campaign: Campaign) => void
  openCampaignBudgetDialog: (campaign: Campaign) => void
  handleGroupAction: (groupId: string, action: 'enable' | 'pause') => Promise<void>
  openGroupBudgetDialog: (group: CampaignGroup) => void
}

export const CampaignManagementActionContext = createContext<CampaignManagementActionContextValue | null>(null)

export function useCampaignManagementActions() {
  const context = use(CampaignManagementActionContext)
  if (!context) {
    throw new Error('CampaignManagementActionContext is missing')
  }
  return context
}
