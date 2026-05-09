import {
  Briefcase,
  CircleCheck,
  MessageSquare,
  User,
  FileText,
} from 'lucide-react'
import type { ActivityType } from './types'

export const ACTIVITY_ICONS: Record<
  ActivityType,
  React.ComponentType<{ className?: string }>
> = {
  project_updated: Briefcase,
  task_activity: CircleCheck,
  message_posted: MessageSquare,
  client_added: User,
  proposal_created: FileText,
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  project_updated:
    'bg-info/10 text-info border border-info/20',
  task_activity:
    'bg-success/10 text-success border border-success/20',
  message_posted:
    'bg-accent/10 text-primary border border-accent/20',
  client_added:
    'bg-secondary/80 text-foreground border border-border/40',
  proposal_created:
    'bg-warning/10 text-warning border border-warning/20',
}

export const REACTION_EMOJIS = ['👍', '❤️', '🎉', '👀', '🔥'] as const
