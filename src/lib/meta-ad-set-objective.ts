import { resolveMetaAdSetDefaults } from '@/lib/meta-ad-set-defaults'
import { getObjectiveConfig } from '@/services/integrations/meta-ads/campaign-modules/objectives'

export type MetaAdSetEngagementType =
  | 'POST_ENGAGEMENT'
  | 'PAGE_ENGAGEMENT'
  | 'EVENT_RESPONSES'
  | 'OFFER_CLAIMS'

export type MetaSalesOptimizationMode = 'pixel' | 'catalog'

export interface MetaAdSetObjectiveFields {
  pageId?: string
  engagementType?: MetaAdSetEngagementType
  postId?: string
  eventId?: string
  pixelId?: string
  conversionEvent?: string
  salesOptimizationMode?: MetaSalesOptimizationMode
  productCatalogId?: string
  productSetId?: string
}

/** Meta object_story / promoted object id: `{pageId}_{postId}`. */
export function formatMetaPostObjectId(pageId: string, postId: string): string {
  const trimmedPost = postId.trim()
  if (trimmedPost.includes('_')) return trimmedPost
  return `${pageId}_${trimmedPost}`
}

export function normalizeMetaCampaignObjective(campaignObjective?: string | null): string | null {
  if (!campaignObjective) return null
  const config = getObjectiveConfig(campaignObjective)
  return config?.objective ?? null
}

export function requiresMetaPageForAdSet(campaignObjective?: string | null): boolean {
  const normalized = normalizeMetaCampaignObjective(campaignObjective)
  return normalized === 'OUTCOME_LEADS' || normalized === 'OUTCOME_ENGAGEMENT'
}

export function validateMetaAdSetObjective(
  campaignObjective: string | null | undefined,
  fields: MetaAdSetObjectiveFields,
): string[] {
  const normalized = normalizeMetaCampaignObjective(campaignObjective)
  const errors: string[] = []

  if (normalized === 'OUTCOME_LEADS' && !fields.pageId) {
    errors.push('Select a Facebook Page for lead generation.')
  }

  if (normalized === 'OUTCOME_SALES') {
    const mode = fields.salesOptimizationMode ?? (fields.productCatalogId ? 'catalog' : 'pixel')
    if (mode === 'catalog') {
      if (!fields.productCatalogId) {
        errors.push('Select a product catalog for catalog sales.')
      }
    } else if (!fields.pixelId) {
      errors.push('Select a Facebook Pixel for conversion optimization.')
    } else if (!fields.conversionEvent) {
      errors.push('Select a conversion event for this sales ad set.')
    }
  }

  if (normalized === 'OUTCOME_ENGAGEMENT') {
    const engagementType = fields.engagementType ?? 'PAGE_ENGAGEMENT'
    if (
      (engagementType === 'PAGE_ENGAGEMENT'
        || engagementType === 'EVENT_RESPONSES'
        || engagementType === 'POST_ENGAGEMENT')
      && !fields.pageId
    ) {
      errors.push('Select a Facebook Page for this engagement ad set.')
    }
    if (engagementType === 'POST_ENGAGEMENT' && fields.pageId && !fields.postId) {
      errors.push('Select a Page post to promote.')
    }
    if (engagementType === 'EVENT_RESPONSES' && fields.pageId && !fields.eventId) {
      errors.push('Select a Page event to promote.')
    }
  }

  return errors
}

export function buildMetaAdSetPromotedObject(
  campaignObjective: string | null | undefined,
  fields: MetaAdSetObjectiveFields,
): Record<string, string> | undefined {
  const normalized = normalizeMetaCampaignObjective(campaignObjective)

  if (normalized === 'OUTCOME_SALES') {
    const mode = fields.salesOptimizationMode ?? (fields.productCatalogId ? 'catalog' : 'pixel')
    if (mode === 'catalog' && fields.productCatalogId) {
      const promoted: Record<string, string> = { product_catalog_id: fields.productCatalogId }
      if (fields.productSetId) {
        promoted.product_set_id = fields.productSetId
      }
      return promoted
    }
    if (fields.pixelId) {
      const promoted: Record<string, string> = { pixel_id: fields.pixelId }
      if (fields.conversionEvent) {
        promoted.custom_event_type = fields.conversionEvent
      }
      return promoted
    }
  }

  if (!fields.pageId) return undefined

  if (normalized !== 'OUTCOME_LEADS' && normalized !== 'OUTCOME_ENGAGEMENT') {
    return undefined
  }

  const promoted: Record<string, string> = { page_id: fields.pageId }

  if (normalized === 'OUTCOME_ENGAGEMENT') {
    const engagementType = fields.engagementType ?? 'PAGE_ENGAGEMENT'
    if (engagementType === 'POST_ENGAGEMENT' && fields.postId) {
      promoted.object_id = formatMetaPostObjectId(fields.pageId, fields.postId)
    }
    if (engagementType === 'EVENT_RESPONSES' && fields.eventId) {
      promoted.event_id = fields.eventId
    }
  }

  return promoted
}

export function resolveMetaAdSetObjectiveGoals(
  campaignObjective: string | null | undefined,
  fields: MetaAdSetObjectiveFields,
): { optimizationGoal: string; billingEvent: string } {
  const normalized = normalizeMetaCampaignObjective(campaignObjective)

  if (normalized === 'OUTCOME_LEADS') {
    return { optimizationGoal: 'LEAD_GENERATION', billingEvent: 'IMPRESSIONS' }
  }

  if (normalized === 'OUTCOME_SALES') {
    const mode = fields.salesOptimizationMode ?? (fields.productCatalogId ? 'catalog' : 'pixel')
    if (mode === 'catalog') {
      return { optimizationGoal: 'PRODUCT_CATALOG_SALES', billingEvent: 'IMPRESSIONS' }
    }
    return { optimizationGoal: 'OFFSITE_CONVERSIONS', billingEvent: 'IMPRESSIONS' }
  }

  if (normalized === 'OUTCOME_ENGAGEMENT') {
    const goal = fields.engagementType ?? 'PAGE_ENGAGEMENT'
    const billing = goal === 'POST_ENGAGEMENT' ? 'POST_ENGAGEMENT' : 'IMPRESSIONS'
    return { optimizationGoal: goal, billingEvent: billing }
  }

  return resolveMetaAdSetDefaults(campaignObjective)
}
