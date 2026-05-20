'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/ui/drawer'

type ResponsiveOverlayProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  /** Drawer direction on mobile. Defaults to bottom. */
  mobileDirection?: 'bottom' | 'right' | 'top' | 'left'
  /** Dialog max width on desktop. */
  dialogClassName?: string
  /** Drawer/drawer content class. */
  mobileClassName?: string
  /** Force drawer on all breakpoints (e.g. proposal builder). */
  preferDrawer?: boolean
  /** Hide the default close button in the header region. */
  hideCloseButton?: boolean
}

/**
 * Dialog on md+ viewports, Vaul Drawer on mobile — shadcn responsive pattern.
 * @see https://ui.shadcn.com/docs/components/radix/drawer#responsive-dialog
 */
export function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  mobileDirection = 'bottom',
  dialogClassName,
  mobileClassName,
  preferDrawer = false,
  hideCloseButton = false,
}: ResponsiveOverlayProps) {
  const isMobile = useIsMobile()
  const useDrawer = preferDrawer || isMobile

  const header = (
    <>
      {typeof title === 'string' ? (
        useDrawer ? (
          <DrawerTitle>{title}</DrawerTitle>
        ) : (
          <DialogTitle>{title}</DialogTitle>
        )
      ) : (
        title
      )}
      {description ? (
        useDrawer ? (
          <DrawerDescription>{description}</DrawerDescription>
        ) : (
          <DialogDescription>{description}</DialogDescription>
        )
      ) : null}
    </>
  )

  if (useDrawer) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction={mobileDirection}>
        <DrawerContent
          className={cn(
            mobileDirection === 'bottom' && 'pb-[max(1rem,env(safe-area-inset-bottom))]',
            mobileDirection === 'right' && 'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
            mobileClassName,
          )}
        >
          <DrawerHeader className="relative shrink-0 border-b border-border/60 text-left">
            {header}
            {!hideCloseButton ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 h-8 w-8"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </Button>
            ) : null}
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">{children}</div>
          {footer ? <DrawerFooter className="shrink-0">{footer}</DrawerFooter> : null}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg', dialogClassName)}>
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-4 text-left">
          {header}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer ? <DialogFooter className="shrink-0 border-t border-border/60 px-6 py-4">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
