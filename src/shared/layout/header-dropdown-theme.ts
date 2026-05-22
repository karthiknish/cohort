import { cn } from '@/lib/utils'

/** Shared surfaces for header notification and profile menus. */
export const HEADER_DROPDOWN_THEME = {
  triggerIcon:
    'relative size-9 shrink-0 rounded-lg border border-transparent text-muted-foreground transition-[color,background-color,border-color,box-shadow] hover:border-border/60 hover:bg-muted/40 hover:text-foreground data-[state=open]:border-border/60 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground data-[state=open]:shadow-sm',
  triggerAvatar:
    'relative size-9 shrink-0 rounded-full border border-border/60 p-0 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-sm data-[state=open]:border-primary/35 data-[state=open]:ring-2 data-[state=open]:ring-primary/15',
  badge:
    'absolute -right-0.5 -top-0.5 inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[9px] font-bold leading-none text-destructive-foreground shadow-sm',
  panel:
    'flex flex-col overflow-hidden rounded-xl border border-border/70 bg-popover p-0 shadow-lg ring-1 ring-border/40',
  panelNotifications: 'w-[22rem] gap-1.5 p-2.5 sm:w-[26rem]',
  panelProfile: 'w-72',
  header:
    'shrink-0 rounded-lg border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-4 py-3.5',
  headerTitle: 'text-sm font-semibold tracking-tight text-foreground',
  headerSubtitle: 'text-xs text-muted-foreground',
  footer:
    'flex shrink-0 items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/15 px-3.5 py-2.5',
  inboxBody: 'px-1.5 py-1',
  menuBody: 'p-1.5',
  menuItem:
    'cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-popover-foreground focus:bg-muted/80 focus:text-foreground data-[highlighted]:bg-muted/80 data-[highlighted]:text-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:bg-destructive/10',
  menuItemIcon:
    'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground',
  menuItemIconDestructive: 'border-destructive/20 bg-destructive/10 text-destructive',
  menuSeparator: 'my-1 bg-border/60',
  profileIdentity: 'flex items-center gap-3 px-1 py-0.5',
  profileAvatar: 'size-10 shrink-0 ring-2 ring-border/50 ring-offset-2 ring-offset-popover',
  groupLabel: 'px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground',
} as const

export function headerDropdownTriggerClass(variant: 'icon' | 'avatar', active?: boolean) {
  return cn(
    variant === 'icon' ? HEADER_DROPDOWN_THEME.triggerIcon : HEADER_DROPDOWN_THEME.triggerAvatar,
    active && variant === 'icon' && 'border-primary/20 text-foreground',
  )
}
