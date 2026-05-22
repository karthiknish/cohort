'use client'

import { useCampaignManagementCard } from './use-campaign-management-card'


import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useAction } from 'convex/react'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useState } from 'react'

import { toast } from '@/shared/ui/use-toast'
import { getCurrencyInfo, isSupportedCurrency, normalizeCurrencyCode } from '@/constants/currencies'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsCampaignGroupsApi, adsCampaignsApi } from '@/lib/convex-api'
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data'

import {
  CampaignManagementConnectedView,
  CampaignManagementDisconnectedState,
  CampaignManagementSetupState,
} from './campaign-management-card-sections'
import {
  INITIAL_CAMPAIGN_MANAGEMENT_STATE,
  campaignManagementReducer,
} from './campaign-management-card-state'
import { buildCampaignColumns, buildGroupColumns } from './campaign-management-card-columns'
import { CampaignManagementActionContext } from './campaign-management-card-table-context'
import type { BiddingDraft, Campaign, CampaignGroup, CampaignManagementView } from './campaign-management-card-types'
import type { DateRange } from './date-range-picker'
import { CreateMetaCampaignDialog } from './create-meta-campaign-dialog'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'

// =============================================================================
// TYPES
// =============================================================================

type Props = {
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

function toIsoDateOnly(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CampaignManagementCard({
  providerId,
  providerName,
  isConnected,
  dateRange,
  onRefresh,
  setupRequired = false,
  setupTitle,
  setupDescription,
  setupActionLabel,
  onSetupAction,
}: Props) {
  return useCampaignManagementCard({
    providerId,
    providerName,
    isConnected,
    dateRange,
    onRefresh,
    setupRequired,
    setupTitle,
    setupDescription,
    setupActionLabel,
    onSetupAction,
  })
}
