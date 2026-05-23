'use client'

import * as React from 'react'
import { createContext, use, useMemo } from 'react'

import { useIsMobile } from '@/shared/hooks/use-is-mobile'
import { cn } from '@/lib/utils'
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/shared/ui/drawer'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/shared/ui/sheet'

type OverlayKind = 'drawer' | 'sheet'

const ResponsiveFormSheetContext = createContext<OverlayKind>('sheet')

type ResponsiveFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  /** Optional trigger rendered outside the panel (e.g. “New project” button). */
  trigger?: React.ReactNode
  /** Classes for SheetContent / DrawerContent (typically full-height form shell). */
  contentClassName?: string
  sheetSide?: 'right' | 'left'
}

/**
 * Right sheet on md+; bottom drawer on mobile (Vaul) for native-feeling forms.
 */
export function ResponsiveFormSheet({
  open,
  onOpenChange,
  children,
  trigger,
  contentClassName,
  sheetSide = 'right',
}: ResponsiveFormSheetProps) {
  const isMobile = useIsMobile()
  const kind: OverlayKind = isMobile ? 'drawer' : 'sheet'
  const contextValue = useMemo(() => kind, [kind])

  if (isMobile) {
    return (
      <ResponsiveFormSheetContext.Provider value={contextValue}>
        <Drawer open={open} onOpenChange={onOpenChange} direction="bottom" shouldScaleBackground>
          {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
          <DrawerContent
            className={cn(
              'flex max-h-[92dvh] flex-col gap-0 p-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
              contentClassName,
            )}
          >
            {children}
          </DrawerContent>
        </Drawer>
      </ResponsiveFormSheetContext.Provider>
    )
  }

  return (
    <ResponsiveFormSheetContext.Provider value={contextValue}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
        <SheetContent side={sheetSide} className={contentClassName}>
          {children}
        </SheetContent>
      </Sheet>
    </ResponsiveFormSheetContext.Provider>
  )
}

type FormSheetCloseProps = React.ComponentProps<typeof SheetClose>

/** Close control that works inside ResponsiveFormSheet (Sheet or Drawer). */
export function FormSheetClose({ ...props }: FormSheetCloseProps) {
  const kind = use(ResponsiveFormSheetContext)

  if (kind === 'drawer') {
    return <DrawerClose {...props} />
  }

  return <SheetClose {...props} />
}
