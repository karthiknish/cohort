import {
  Briefcase,
  CircleCheck,
  MessageSquare,
  Calendar,
  User,
} from 'lucide-react'
import type { ActivityType } from './types'

export const ACTIVITY_ICONS: Record<
  ActivityType,
  React.ComponentType<{ className?: string }>
> = {
  project_updated: Briefcase,
  task_completed: CircleCheck,
  message_posted: MessageSquare,
  client_added: User,
  invoice_sent: Calendar,
  proposal_created: Briefcase,
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  project_updated:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  task_completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  message_posted:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  client_added:
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  invoice_sent:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  proposal_created:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

export const REACTION_EMOJIS = ['👍', '❤️', '🎉', '👀', '🔥'] as const
