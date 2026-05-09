import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'

import { interactiveTransitionClass, surfaceMotionClasses } from '@/lib/animation-system'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

type DialogOverlayProps = React.ComponentPropsWithRef<typeof DialogPrimitive.Overlay>
type DialogContentProps = React.ComponentPropsWithRef<typeof DialogPrimitive.Content>
type DialogTitleProps = React.ComponentPropsWithRef<typeof DialogPrimitive.Title>
type DialogDescriptionProps = React.ComponentPropsWithRef<typeof DialogPrimitive.Description>

const DialogOverlay = ({ className, ref, ...props }: DialogOverlayProps) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[1100] bg-background/80 backdrop-blur-sm',
      surfaceMotionClasses.overlay,
      className
    )}
    {...props}
  />
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = ({ className, children, ref, ...props }: DialogContentProps) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'focus-ring fixed left-1/2 top-1/2 z-[1100] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg sm:rounded-xl max-h-[85vh] overflow-y-auto',
        surfaceMotionClasses.modalContent,
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'focus-ring absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100',
          interactiveTransitionClass
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = ({ className, ref, ...props }: DialogTitleProps) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = ({ className, ref, ...props }: DialogDescriptionProps) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
