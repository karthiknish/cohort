import { cn } from '@/lib/utils'
import { SEMANTIC_COLORS, CHART_COLORS } from '@/lib/colors'

export const DASHBOARD_THEME = {
  layout: {
    container: 'space-y-6',
    header: 'flex flex-col justify-between gap-4 md:flex-row md:items-center',
    title: 'text-3xl font-bold tracking-tight text-foreground',
    subtitle: 'text-muted-foreground',
  },
  cards: {
    base: 'border-muted/60 bg-background shadow-sm',
    header: 'border-b border-muted/40 pb-4',
    content: 'p-6',
  },
  badges: {
    base: 'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest',
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-muted/50 text-muted-foreground border-muted/40',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  buttons: {
    base: 'rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm transition-all active:scale-[0.98]',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border-muted/40 bg-background hover:bg-muted/5 hover:text-primary',
    ghost: 'hover:bg-muted/5 hover:text-primary',
  },
  icons: {
    container: 'flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20',
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  },
  inputs: {
    base: 'rounded-xl border-muted/40 bg-background',
  },
  stats: {
    container: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
    card: 'overflow-hidden border-muted/50 bg-background shadow-sm transition-all hover:shadow-md',
    label: 'text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80',
    value: 'text-2xl font-bold text-foreground',
    description: 'text-xs text-muted-foreground',
  },
  tables: {
    header: 'text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80',
    row: 'hover:bg-muted/30 transition-colors',
    cell: 'text-sm text-foreground',
  },
  tabs: {
    list: 'bg-muted/50',
    trigger: 'gap-1.5 data-[state=active]:bg-background',
  },
  skeletons: {
    card: 'h-28 w-full',
    text: 'h-4 w-32',
    avatar: 'h-10 w-10 rounded-full',
  },
  animations: {
    fadeIn: 'animate-in fade-in-50 slide-in-from-bottom-2 duration-500',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },
  colors: SEMANTIC_COLORS,
  chartColors: CHART_COLORS,
} as const

export const PAGE_ICONS = {
  clients: 'Users',
  projects: 'Briefcase',
  tasks: 'ListTodo',
  analytics: 'BarChart3',
  ads: 'Target',
  meetings: 'Video',
  collaboration: 'MessageSquare',
  proposals: 'FileText',
  integrations: 'Plug',
  notifications: 'Bell',
  activity: 'Activity',
  settings: 'Settings',
} as const

export const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  clients: {
    title: 'Clients',
    description: 'Manage client workspaces and team relationships.',
  },
  projects: {
    title: 'Projects',
    description: 'Portfolio overview and project management.',
  },
  tasks: {
    title: 'Tasks',
    description: 'Track and manage work items across projects.',
  },
  analytics: {
    title: 'Analytics',
    description: 'Performance insights and data visualization.',
  },
  ads: {
    title: 'Ad Platforms',
    description: 'Connect and manage advertising accounts.',
  },
  meetings: {
    title: 'Meetings',
    description: 'Schedule client calls, manage Meet invites, and review concise AI notes.',
  },
  collaboration: {
    title: 'Team collaboration',
    description: 'Coordinate with teammates and clients in dedicated workspaces tied to each account.',
  },
  proposals: {
    title: 'Proposals',
    description: 'Create and manage business proposals.',
  },
  integrations: {
    title: 'Integrations',
    description: 'Connect external tools and services.',
  },
  notifications: {
    title: 'Notifications',
    description: 'Stay updated on important activities.',
  },
  activity: {
    title: 'Activity',
    description: 'Recent actions and audit trail.',
  },
} as const

export function getStatCardClasses(variant: 'default' | 'success' | 'warning' | 'destructive' = 'default') {
  const variants = {
    default: '',
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    destructive: 'border-destructive/20 bg-destructive/5',
  }
  return cn(DASHBOARD_THEME.stats.card, variants[variant])
}

export function getBadgeClasses(variant: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' = 'secondary') {
  return cn(DASHBOARD_THEME.badges.base, DASHBOARD_THEME.badges[variant])
}

export function getButtonClasses(variant: 'primary' | 'outline' | 'ghost' = 'outline') {
  return cn(DASHBOARD_THEME.buttons.base, DASHBOARD_THEME.buttons[variant])
}

export function getIconContainerClasses(size: 'small' | 'medium' | 'large' = 'medium') {
  return cn(DASHBOARD_THEME.icons.container, DASHBOARD_THEME.icons[size])
}

export function getPriorityBadgeClasses(priority: 'low' | 'medium' | 'high' | 'critical') {
  const colors = {
    low: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    critical: 'bg-red-500/10 text-red-600 border-red-500/20',
  }
  return cn(DASHBOARD_THEME.badges.base, colors[priority])
}

export function getStatusBadgeClasses(status: 'active' | 'inactive' | 'pending' | 'completed' | 'error') {
  const colors = {
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    inactive: 'bg-muted/50 text-muted-foreground border-muted/40',
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
  }
  return cn(DASHBOARD_THEME.badges.base, colors[status])
}

export function getChannelTypeBadgeClasses(type: 'team' | 'client' | 'project' | 'direct') {
  const colors = {
    team: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    client: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    project: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    direct: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  }
  return cn(DASHBOARD_THEME.badges.base, colors[type])
}
