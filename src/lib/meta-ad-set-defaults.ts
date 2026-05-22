import { getObjectiveConfig } from '@/services/integrations/meta-ads/campaign-modules/objectives'

export function resolveMetaAdSetDefaults(campaignObjective?: string | null): {
  optimizationGoal: string
  billingEvent: string
} {
  const config = campaignObjective ? getObjectiveConfig(campaignObjective) : null
  return {
    optimizationGoal: config?.optimizationGoals?.[0] ?? 'LINK_CLICKS',
    billingEvent: config?.billingEvents?.[0] ?? 'IMPRESSIONS',
  }
}
