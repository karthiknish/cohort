export const AGENT_URL_PARAM_OPEN = 'agent'
export const AGENT_URL_PARAM_VIEW = 'agentView'
export const AGENT_URL_PARAM_CONVERSATION = 'agentConversation'

export type AgentPanelUrlView = 'chat' | 'history'

export type AgentPanelUrlState = {
  open: boolean
  view: AgentPanelUrlView
  conversationId: string | null
}

export function parseAgentPanelUrl(searchParams: URLSearchParams): AgentPanelUrlState {
  const agent = searchParams.get(AGENT_URL_PARAM_OPEN)
  const open = agent === 'open' || agent === '1' || agent === 'true'
  const viewRaw = searchParams.get(AGENT_URL_PARAM_VIEW)
  const view: AgentPanelUrlView = viewRaw === 'history' ? 'history' : 'chat'
  const conversationId = searchParams.get(AGENT_URL_PARAM_CONVERSATION)?.trim() || null

  return { open, view, conversationId }
}

export function applyAgentPanelUrl(
  searchParams: URLSearchParams,
  patch: Partial<AgentPanelUrlState>,
): URLSearchParams {
  const next = new URLSearchParams(searchParams.toString())
  const open = patch.open ?? parseAgentPanelUrl(next).open
  const view = patch.view ?? parseAgentPanelUrl(next).view
  const conversationId = open
    ? patch.conversationId !== undefined
      ? patch.conversationId
      : parseAgentPanelUrl(next).conversationId
    : null

  if (open) {
    next.set(AGENT_URL_PARAM_OPEN, 'open')
  } else {
    next.delete(AGENT_URL_PARAM_OPEN)
    next.delete(AGENT_URL_PARAM_VIEW)
    next.delete(AGENT_URL_PARAM_CONVERSATION)
  }

  if (open && view === 'history') {
    next.set(AGENT_URL_PARAM_VIEW, 'history')
  } else {
    next.delete(AGENT_URL_PARAM_VIEW)
  }

  if (open && conversationId) {
    next.set(AGENT_URL_PARAM_CONVERSATION, conversationId)
  } else {
    next.delete(AGENT_URL_PARAM_CONVERSATION)
  }

  return next
}

export function agentPanelHref(
  pathname: string,
  searchParams: URLSearchParams,
  patch: Partial<AgentPanelUrlState>,
): string {
  const next = applyAgentPanelUrl(searchParams, patch)
  const query = next.toString()
  return query.length > 0 ? `${pathname}?${query}` : pathname
}
