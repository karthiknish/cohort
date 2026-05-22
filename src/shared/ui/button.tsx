import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { buttonVariants, type ButtonVariantProps } from '@/shared/ui/button-variants'

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

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  ButtonVariantProps & {
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

export { Button }
