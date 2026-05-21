'use client'

import Link from 'next/link'
import { HelpCircle, LogOut, Settings, Shield } from 'lucide-react'

import { useDashboardRoleAccent } from '@/shared/hooks/use-dashboard-role-accent'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TruncatedTextPreview } from '@/shared/ui/hover-preview'
import { cn } from '@/lib/utils'

import { HEADER_DROPDOWN_THEME } from './header-dropdown-theme'

type ProfileDropdownProps = {
  displayedName: string
  displayedEmail: string
  initials: string
  isPreviewMode: boolean
  roleLabel: string | null
  isAdmin: boolean
  onNavigate: () => void
  onOpenHelp: () => void
  onSignOut: () => void
}

function ProfileMenuItem({
  icon: Icon,
  label,
  destructive,
  onSelect,
  href,
  onNavigate,
}: {
  icon: typeof Settings
  label: string
  destructive?: boolean
  onSelect?: () => void
  href?: string
  onNavigate?: () => void
}) {
  const iconClass = cn(
    HEADER_DROPDOWN_THEME.menuItemIcon,
    destructive && HEADER_DROPDOWN_THEME.menuItemIconDestructive,
  )

  const content = (
    <>
      <span className={iconClass}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="font-medium">{label}</span>
    </>
  )

  if (href) {
    return (
      <DropdownMenuItem asChild className={HEADER_DROPDOWN_THEME.menuItem}>
        <Link href={href} onClick={onNavigate} className="flex w-full items-center gap-2.5">
          {content}
        </Link>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem
      variant={destructive ? 'destructive' : 'default'}
      onSelect={onSelect}
      className={HEADER_DROPDOWN_THEME.menuItem}
    >
      {content}
    </DropdownMenuItem>
  )
}

export function ProfileDropdown({
  displayedName,
  displayedEmail,
  initials,
  isPreviewMode,
  roleLabel,
  isAdmin,
  onNavigate,
  onOpenHelp,
  onSignOut,
}: ProfileDropdownProps) {
  const accent = useDashboardRoleAccent()
  const badgeLabel = isPreviewMode ? 'Preview' : roleLabel

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={HEADER_DROPDOWN_THEME.triggerAvatar}
          aria-label={`Open account menu for ${displayedName}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted/50 text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={cn(HEADER_DROPDOWN_THEME.panel, HEADER_DROPDOWN_THEME.panelProfile)}>
        <div className={HEADER_DROPDOWN_THEME.header}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className={HEADER_DROPDOWN_THEME.profileIdentity}>
              <Avatar className={HEADER_DROPDOWN_THEME.profileAvatar}>
                <AvatarFallback className="bg-muted/50 text-sm font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <TruncatedTextPreview
                    text={displayedName}
                    className="text-sm font-semibold text-foreground"
                    detail={displayedEmail}
                  />
                  {badgeLabel ? (
                    <Badge
                      variant="secondary"
                      className={cn(
                        'h-5 shrink-0 px-1.5 text-[10px] font-semibold uppercase tracking-wide',
                        accent.accountBadgeClass,
                      )}
                    >
                      {badgeLabel}
                    </Badge>
                  ) : null}
                </div>
                {displayedEmail ? (
                  <p className="truncate text-xs text-muted-foreground">{displayedEmail}</p>
                ) : null}
              </div>
            </div>
          </DropdownMenuLabel>
        </div>

        <div className={HEADER_DROPDOWN_THEME.menuBody}>
          <p className={HEADER_DROPDOWN_THEME.groupLabel}>Workspace</p>
          {isAdmin ? (
            <ProfileMenuItem icon={Shield} label="Admin panel" href="/admin" onNavigate={onNavigate} />
          ) : null}
          <ProfileMenuItem icon={Settings} label="Settings" href="/settings" onNavigate={onNavigate} />

          <DropdownMenuSeparator className={HEADER_DROPDOWN_THEME.menuSeparator} />
          <p className={HEADER_DROPDOWN_THEME.groupLabel}>Support</p>
          <ProfileMenuItem icon={HelpCircle} label="Help & navigation" onSelect={onOpenHelp} />

          <DropdownMenuSeparator className={HEADER_DROPDOWN_THEME.menuSeparator} />
          <ProfileMenuItem icon={LogOut} label="Sign out" destructive onSelect={onSignOut} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
