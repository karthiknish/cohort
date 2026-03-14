// =============================================================================
// CLIENTS PAGE - Types
// =============================================================================

import type { ClientRecord } from '@/types/clients'

export interface ClientStats {
  activeProjects: number
  totalProjects: number
  openTasks: number
  completedTasks: number
  pendingProposals: number
}

export type OnboardingItem = {
  id: string
  label: string
  done: boolean
  helper: string
  loading?: boolean
}

export type ClientPipelineBoardProps = {
  clients: ClientRecord[]
  selectedClientId: string
}
