import { CircleAlert, FileSearch, FolderOpen, Inbox, Users, type LucideIcon } from 'lucide-react'

export const emptyStateIcons: Record<string, LucideIcon> = {
  inbox: Inbox,
  search: FileSearch,
  users: Users,
  folder: FolderOpen,
  alert: CircleAlert,
}
