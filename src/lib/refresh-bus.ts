'use client'

export type DashboardRefreshReason =
  | 'manual-dashboard-refresh'
  | 'task-mutated'
  | 'project-mutated'
  | 'unknown'

export type DashboardRefreshEventDetail = {
  at: number
  reason: DashboardRefreshReason
  clientId?: string | null
}

const EVENT_NAME = 'cohorts:dashboard-refresh'
const BC_NAME = 'cohorts-dashboard-refresh'

function getEventTarget(): EventTarget | null {
  if (typeof window === 'undefined') return null
  const anyWindow = window as unknown as { __cohortsRefreshTarget?: EventTarget }
  if (!anyWindow.__cohortsRefreshTarget) {
    anyWindow.__cohortsRefreshTarget = new EventTarget()
  }
  return anyWindow.__cohortsRefreshTarget
}

export function emitDashboardRefresh(detail: Omit<DashboardRefreshEventDetail, 'at'> & { at?: number } = { reason: 'unknown' }) {
  if (typeof window === 'undefined') return

  const payload: DashboardRefreshEventDetail = {
    at: typeof detail.at === 'number' ? detail.at : Date.now(),
    reason: detail.reason ?? 'unknown',
    clientId: typeof detail.clientId === 'undefined' ? undefined : detail.clientId,
  }

  const target = getEventTarget()
  if (target) {
    target.dispatchEvent(new CustomEvent<DashboardRefreshEventDetail>(EVENT_NAME, { detail: payload }))
  }

  // Cross-tab refresh (best-effort)
  try {
    const bc = new BroadcastChannel(BC_NAME)
    bc.postMessage(payload)
    bc.close()
  } catch {
    // ignore
  }
}

export function onDashboardRefresh(handler: (detail: DashboardRefreshEventDetail) => void): () => void {
  const target = getEventTarget()
  if (!target) return () => {}

  const listener = (event: Event) => {
    const custom = event as CustomEvent<DashboardRefreshEventDetail>
    if (!custom?.detail) return
    handler(custom.detail)
  }

  target.addEventListener(EVENT_NAME, listener)

  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(BC_NAME)
    bc.onmessage = (msg) => {
      const data = msg?.data as DashboardRefreshEventDetail | undefined
      if (!data) return
      handler(data)
    }
  } catch {
    bc = null
  }

  return () => {
    target.removeEventListener(EVENT_NAME, listener)
    try {
      bc?.close()
    } catch {
      // ignore
    }
  }
}
