'use client'

import { useCallback } from 'react'
import { Bell } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Drawer, DrawerContent } from '@/shared/ui/drawer'
import { cn } from '@/lib/utils'

import { NotificationsInboxPanel } from '@/features/notifications/components/notifications-inbox-panel'
import { QueryErrorAlert } from '@/shared/ui/query-error-alert'
import { useNotificationInbox } from '@/features/notifications/hooks/use-notification-inbox'
import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { HEADER_DROPDOWN_THEME } from '@/shared/layout/header-dropdown-theme'

export function NotificationsDropdown() {
  const isMobile = useIsMobile()
  const {
    open,
    handleOpenChange,
    handleOpenNotification,
    unreadCount,
    hasUnread,
    ackInFlight,
    isLoadingInitial,
    notifications,
    groupedNotifications,
    triggerDisabled,
    handleDismiss,
    handleMarkAllRead,
    handleLoadMore,
    hasNextPage,
    isFetchingNextPage,
    inboxQueryError,
  } = useNotificationInbox()

  const handleMobileOpen = useCallback(() => {
    handleOpenChange(true)
  }, [handleOpenChange])

  const inboxPanel = (
    <>
      <QueryErrorAlert error={inboxQueryError} title="Unable to load notifications" />
      <NotificationsInboxPanel
      unreadCount={unreadCount}
      ackInFlight={ackInFlight}
      isLoadingInitial={isLoadingInitial}
      notifications={notifications}
      groupedNotifications={groupedNotifications}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onMarkAllRead={handleMarkAllRead}
      onLoadMore={handleLoadMore}
      onOpen={handleOpenNotification}
      onDismiss={handleDismiss}
      variant={isMobile ? 'drawer' : 'dropdown'}
    />
    </>
  )

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(HEADER_DROPDOWN_THEME.triggerIcon, hasUnread && !open && 'text-foreground')}
      disabled={triggerDisabled}
      aria-label={hasUnread ? `${unreadCount} unread notifications` : 'View notifications'}
      onClick={isMobile ? handleMobileOpen : undefined}
    >
      <Bell className={cn('size-[1.125rem]', hasUnread && 'motion-safe:animate-pulse')} />
      {hasUnread ? (
        <span className={HEADER_DROPDOWN_THEME.badge} aria-hidden>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </Button>
  )

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Drawer open={open} onOpenChange={handleOpenChange} direction="bottom">
          <DrawerContent className="flex max-h-[85dvh] flex-col gap-1.5 overflow-hidden rounded-t-2xl p-3">
            {inboxPanel}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className={cn(HEADER_DROPDOWN_THEME.panel, HEADER_DROPDOWN_THEME.panelNotifications)}
      >
        {inboxPanel}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
