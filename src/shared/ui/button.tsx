import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { interactiveTransitionClass, pressableScaleClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

function childrenContainAccessibleText(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (typeof child === 'string') {
      return child.trim().length > 0
    }

    if (typeof child === 'number') {
      return true
    }

    if (!React.isValidElement(child)) {
      return false
    }

    const childProps = child.props as { className?: string; children?: React.ReactNode }
    if (typeof childProps.className === 'string' && childProps.className.includes('sr-only')) {
      return childrenContainAccessibleText(childProps.children)
    }

    return childrenContainAccessibleText(childProps.children)
  })
}

function hasAccessibleButtonLabel(props: React.ComponentProps<'button'>): boolean {
  if (typeof props['aria-label'] === 'string' && props['aria-label'].trim().length > 0) return true
  if (typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim().length > 0) return true
  if (typeof props.title === 'string' && props.title.trim().length > 0) return true
  return childrenContainAccessibleText(props.children)
}

const buttonVariants = cva(
  [
    "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
    interactiveTransitionClass,
    pressableScaleClass,
  ].join(' '),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 shadow-sm",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md focus-visible:ring-primary/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-9",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  if (process.env.NODE_ENV !== 'production' && !asChild && typeof size === 'string' && size.startsWith('icon') && !hasAccessibleButtonLabel(props)) {
    console.warn('Icon-only Button requires an accessible label via aria-label, aria-labelledby, title, or sr-only text.', props)
  }

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
