import type { DateRange } from './date-range-picker'

export type BiddingDraft = {
  type: string
  value: string
}

export type Campaign = {
  id: string
  name: string
  providerId: string
  status: string
  campaignName?: string
  budget?: number
  budgetType?: string
  currency?: string
  objective?: string
  startTime?: string
  stopTime?: string
  isHistorical?: boolean
  biddingStrategy?: {
    type: string
    targetCpa?: number
    targetRoas?: number
    bidCeiling?: number
  }
  schedule?: Array<{
    dayOfWeek: string
    startHour: number
    endHour: number
  }>
}

export type CampaignGroup = {
  id: string
  name: string
  status: string
  totalBudget?: number
  currency?: string
}

export type CampaignManagementView = 'campaigns' | 'groups'

export type CampaignManagementCardProps = {
  providerId: string
  providerName: string
  isConnected: boolean
  dateRange: DateRange
  onRefresh?: () => void
  setupRequired?: boolean
  setupTitle?: string
  setupDescription?: string
  setupActionLabel?: string
  onSetupAction?: () => void
}
