export type AgentPanelLayout = 'compact' | 'docked' | 'fullscreen'

const LAYOUT_KEY = 'cohort-agent-panel-layout'

export const AGENT_PANEL_LAYOUT_CYCLE: AgentPanelLayout[] = ['compact', 'docked', 'fullscreen']

export function isAgentPanelLayout(value: string | null | undefined): value is AgentPanelLayout {
  return value === 'compact' || value === 'docked' || value === 'fullscreen'
}

export function readAgentPanelLayout(): AgentPanelLayout {
  if (typeof window === 'undefined') return 'fullscreen'

  const stored = window.localStorage.getItem(LAYOUT_KEY)
  if (isAgentPanelLayout(stored)) return stored

  if (window.matchMedia('(max-width: 767px)').matches) {
    return 'fullscreen'
  }

  return 'fullscreen'
}

export function writeAgentPanelLayout(layout: AgentPanelLayout): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LAYOUT_KEY, layout)
}

export function cycleAgentPanelLayout(current: AgentPanelLayout): AgentPanelLayout {
  const index = AGENT_PANEL_LAYOUT_CYCLE.indexOf(current)
  const next = AGENT_PANEL_LAYOUT_CYCLE[(index + 1) % AGENT_PANEL_LAYOUT_CYCLE.length]
  return next ?? 'docked'
}

/** Full-screen modal blocks the dashboard; docked/compact keep the page usable. */
export function panelUsesModalFocusTrap(layout: AgentPanelLayout): boolean {
  return layout === 'fullscreen'
}

export function shouldKeepAgentOpenOnNavigate(layout?: AgentPanelLayout): boolean {
  const resolved = layout ?? readAgentPanelLayout()
  return resolved === 'compact' || resolved === 'docked'
}

/** Docked/compact panels cover the FAB; fullscreen keeps it as the close control. */
export function shouldHideAgentFab(isOpen: boolean, layout: AgentPanelLayout): boolean {
  return isOpen && layout !== 'fullscreen'
}

export function layoutLabel(layout: AgentPanelLayout): string {
  switch (layout) {
    case 'compact':
      return 'Compact'
    case 'docked':
      return 'Docked'
    case 'fullscreen':
      return 'Full screen'
  }
}
