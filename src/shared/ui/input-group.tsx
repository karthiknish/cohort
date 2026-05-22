'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'

function InputGroup({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="input-group"
      className={cn(
        'm-0 min-w-0 border-0 p-0',
        'group/input-group relative flex w-full min-w-0 items-stretch rounded-md border border-input shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        className,
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 px-3 text-sm text-muted-foreground [&_svg]:size-4',
  {
    variants: {
      align: {
        'inline-start': 'order-first border-r border-input',
        'inline-end': 'order-last border-l border-input',
        'block-start': 'order-first w-full justify-start border-b border-input py-2',
        'block-end': 'order-last w-full justify-start border-t border-input py-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'fieldset'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <fieldset
      data-slot="input-group-addon"
      data-align={align}
      className={cn('m-0 min-w-0 border-0 p-0', inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  )
}

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> & {
  size?: 'xs' | 'sm' | 'icon-xs' | 'icon-sm'
}) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size === 'xs' || size === 'icon-xs' ? 'sm' : size}
      className={cn(
        'shrink-0 shadow-none',
        size === 'xs' && 'h-7 gap-1 px-2 text-xs',
        size === 'icon-xs' && 'size-7',
        size === 'icon-sm' && 'size-8',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
}
