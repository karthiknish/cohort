import { normalizeMetaCampaignObjective } from '@/lib/meta-ad-set-objective'

export type MetaCampaignObjective =
  | 'OUTCOME_SALES'
  | 'OUTCOME_LEADS'
  | 'OUTCOME_TRAFFIC'
  | 'OUTCOME_ENGAGEMENT'
  | 'OUTCOME_AWARENESS'
  | 'OUTCOME_APP_PROMOTION'
  | null

export type MetaCampaignUiContext = {
  /** Campaign objective from Meta or normalized OUTCOME_* value. */
  campaignObjective?: string | null
  /** When known (e.g. ad set form), gates catalog/DPA creative. */
  salesOptimizationMode?: 'pixel' | 'catalog'
  /**
   * Account-level surfaces (audience builder, automation card) hide conversion
   * tools that need a campaign objective context.
   */
  scope?: 'campaign' | 'account'
}

export type MetaCampaignUiVisibility = {
  objective: MetaCampaignObjective
  showCapi: boolean
  showOfflineEvents: boolean
  showBatchApi: boolean
  showPixelInsights: boolean
  showBusinessManager: boolean
  showAdLibrary: boolean
  showWebhooks: boolean
  showPlacementTargeting: boolean
  showCustomAudiences: boolean
  showDynamicCreativeFormat: boolean
  defaultCapiEventName: string
  metaToolsDescription: string
}

function resolveObjective(campaignObjective?: string | null): MetaCampaignObjective {
  return normalizeMetaCampaignObjective(campaignObjective) as MetaCampaignObjective
}

export function resolveMetaCampaignUiVisibility(
  context: MetaCampaignUiContext = {},
): MetaCampaignUiVisibility {
  const objective = resolveObjective(context.campaignObjective)
  const scope = context.scope ?? (objective ? 'campaign' : 'account')
  const isAccountScope = scope === 'account'

  const isSales = objective === 'OUTCOME_SALES'
  const isLeads = objective === 'OUTCOME_LEADS'
  const isTraffic = objective === 'OUTCOME_TRAFFIC'
  const isEngagement = objective === 'OUTCOME_ENGAGEMENT'
  const isAwareness = objective === 'OUTCOME_AWARENESS'
  const isAppPromotion = objective === 'OUTCOME_APP_PROMOTION'

  const showConversionEvents =
    !isAccountScope && (isSales || isLeads)

  const catalogSales = isSales && context.salesOptimizationMode === 'catalog'

  let metaToolsDescription =
    'Account tools: batch API, pixels, Business Manager, Ad Library, and webhooks.'
  if (!isAccountScope && objective) {
    if (isSales) {
      metaToolsDescription =
        'Conversion tracking (CAPI, offline), pixels, and account webhooks for this sales campaign.'
    } else if (isLeads) {
      metaToolsDescription = 'Lead CAPI events, pixel health, and webhooks for this leads campaign.'
    } else if (isEngagement) {
      metaToolsDescription = 'Batch requests, webhooks, and competitive Ad Library research.'
    } else if (isAwareness) {
      metaToolsDescription = 'Ad Library research, webhooks, and batch utilities for awareness campaigns.'
    } else if (isTraffic) {
      metaToolsDescription = 'Pixel stats, batch API, and webhooks for traffic campaigns.'
    } else if (isAppPromotion) {
      metaToolsDescription = 'Batch API and webhook subscriptions for app promotion campaigns.'
    }
  }

  return {
    objective,
    showCapi: showConversionEvents,
    showOfflineEvents: !isAccountScope && isSales,
    showBatchApi: true,
    showPixelInsights: isAccountScope || isSales || isLeads || isTraffic,
    showBusinessManager: true,
    showAdLibrary: isAccountScope || isAwareness || isTraffic || isEngagement,
    showWebhooks: true,
    showPlacementTargeting: !isAppPromotion,
    showCustomAudiences: !isAppPromotion,
    showDynamicCreativeFormat: catalogSales,
    defaultCapiEventName: isLeads ? 'Lead' : isSales ? 'Purchase' : 'PageView',
    metaToolsDescription,
  }
}

export function hasMetaEventsTools(visibility: MetaCampaignUiVisibility): boolean {
  return visibility.showCapi || visibility.showOfflineEvents || visibility.showBatchApi
}

export function hasMetaAdvancedTools(visibility: MetaCampaignUiVisibility): boolean {
  return (
    visibility.showPixelInsights
    || visibility.showBusinessManager
    || visibility.showAdLibrary
    || visibility.showWebhooks
  )
}

export function hasAnyMetaCampaignTools(visibility: MetaCampaignUiVisibility): boolean {
  return hasMetaEventsTools(visibility) || hasMetaAdvancedTools(visibility)
}

export type MetaCreativeObjectTypeOption = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'DYNAMIC'

export function getMetaCreativeObjectTypeOptions(
  campaignObjective?: string | null,
  salesOptimizationMode?: 'pixel' | 'catalog',
): MetaCreativeObjectTypeOption[] {
  const visibility = resolveMetaCampaignUiVisibility({
    campaignObjective,
    salesOptimizationMode,
    scope: 'campaign',
  })
  const options: MetaCreativeObjectTypeOption[] = ['IMAGE', 'VIDEO', 'CAROUSEL']
  if (visibility.showDynamicCreativeFormat) {
    options.push('DYNAMIC')
  }
  return options
}
