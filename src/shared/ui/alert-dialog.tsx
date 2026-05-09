'use client'

import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { surfaceMotionClasses } from '@/lib/animation-system'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/shared/ui/button'

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

type AlertDialogOverlayProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Overlay>
type AlertDialogContentProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Content>
type AlertDialogTitleProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Title>
type AlertDialogDescriptionProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Description>
type AlertDialogActionProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Action>
type AlertDialogCancelProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Cancel>

const AlertDialogOverlay = ({ className, ref, ...props }: AlertDialogOverlayProps) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm',
      surfaceMotionClasses.overlay,
      className
    )}
    {...props}
    ref={ref}
  />
)
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = ({ className, ref, ...props }: AlertDialogContentProps) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-[1100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        surfaceMotionClasses.modalContent,
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
)
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogTitle = ({ className, ref, ...props }: AlertDialogTitleProps) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
)
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = ({ className, ref, ...props }: AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
)
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = ({ className, ref, ...props }: AlertDialogActionProps) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
)
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = ({ className, ref, ...props }: AlertDialogCancelProps) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: 'outline' }),
      'mt-2 sm:mt-0',
      className
    )}
    {...props}
  />
)
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
