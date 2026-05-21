import {
  BarChart3,
  Bot,
  CalendarClock,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { PreviewTab, PreviewTabId } from './types'

export const PREVIEW_TABS: readonly PreviewTab[] = [
  {
    id: 'overview',
    Icon: LayoutDashboard,
    label: 'Overview',
    eyebrow: 'Agency pulse',
    status: 'Live board',
    agentItems: [
      { id: 'a1', text: 'Client recap drafted for Apex', time: '2 min ago' },
      { id: 'a2', text: 'Budget drift flagged · BlueWave', time: '6 min ago' },
      { id: 'a3', text: 'Kickoff checklist assembled', time: '12 min ago' },
    ],
  },
  {
    id: 'proposals',
    Icon: FileText,
    label: 'Proposals',
    eyebrow: 'AI proposals',
    status: '7 active',
    agentItems: [
      { id: 'a1', text: 'NovaTech Q3 proposal drafted', time: 'just now' },
      { id: 'a2', text: 'Pricing section updated auto', time: '4 min ago' },
      { id: 'a3', text: 'Apex proposal sent to client', time: '18 min ago' },
    ],
  },
  {
    id: 'clients',
    Icon: Users,
    label: 'Clients',
    eyebrow: 'Account focus',
    status: '12 active',
    agentItems: [
      { id: 'a1', text: 'Health score refreshed · NovaTech', time: 'just now' },
      { id: 'a2', text: 'Renewal brief queued · Meridian', time: 'pending' },
      { id: 'a3', text: 'Expansion path drafted · BlueOrbit', time: 'ready' },
    ],
  },
  {
    id: 'meetings',
    Icon: CalendarClock,
    label: 'Meetings',
    eyebrow: 'Schedule',
    status: '3 today',
    agentItems: [
      { id: 'a1', text: 'Apex kickoff brief prepared', time: 'ready' },
      { id: 'a2', text: 'BlueOrbit review notes generated', time: '2 min ago' },
      { id: 'a3', text: 'Standup recap auto-published', time: '20 min ago' },
    ],
  },
  {
    id: 'agent',
    Icon: Bot,
    label: 'Agent',
    eyebrow: 'Agent mode',
    status: '4 flows running',
    agentItems: [
      { id: 'a1', text: 'Follow-up sequence triggered', time: '1 min ago' },
      { id: 'a2', text: 'Meeting recap merged into thread', time: '6 min ago' },
      { id: 'a3', text: 'Pacing anomaly escalated', time: '10 min ago' },
    ],
  },
] as const

export const SIDEBAR_EXTRA: readonly { id: string; Icon: LucideIcon }[] = [
  { id: 'analytics', Icon: BarChart3 },
  { id: 'messages', Icon: MessageSquare },
  { id: 'settings', Icon: Settings },
]

const TAB_ID_SET = new Set<string>(['overview', 'proposals', 'clients', 'meetings', 'agent'])

export const INITIAL_PREVIEW_TAB = PREVIEW_TABS[0]!
export const PREVIEW_TAB_ORDER = PREVIEW_TABS.map((tab) => tab.id)

export function isPreviewTabId(value: string | undefined): value is PreviewTabId {
  return value !== undefined && TAB_ID_SET.has(value)
}

export function getNextPreviewTabId(current: PreviewTabId): PreviewTabId {
  const index = PREVIEW_TAB_ORDER.indexOf(current)
  if (index === -1 || index === PREVIEW_TAB_ORDER.length - 1) {
    return PREVIEW_TAB_ORDER[0]!
  }
  return PREVIEW_TAB_ORDER[index + 1]!
}
