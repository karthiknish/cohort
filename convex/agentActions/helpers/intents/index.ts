import type { AgentRequestContextType, DeterministicAgentIntent } from '../../types'

import { resolveDeterministicExecuteIntent } from './execute'
import { resolveDeterministicNavigationIntent } from './navigation'
import { resolveWeakCommandClarification, extractCampaignQueryFromIntent, getProviderSummaryLabel } from './parsing'

function resolveDeterministicAgentIntent(message: string, context?: AgentRequestContextType): DeterministicAgentIntent | null {
  const executeIntent = resolveDeterministicExecuteIntent(message, context)
  if (executeIntent) return executeIntent
  const navigationIntent = resolveDeterministicNavigationIntent(message, context)
  if (navigationIntent) return { action: 'navigate', route: navigationIntent.route, message: navigationIntent.message }
  const clarificationIntent = resolveWeakCommandClarification(message, context)
  if (clarificationIntent) return clarificationIntent
  return null
}

export {
  extractCampaignQueryFromIntent,
  getProviderSummaryLabel,
  resolveDeterministicAgentIntent,
  resolveWeakCommandClarification,
}
