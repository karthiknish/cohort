'use client'

import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { cn } from '@/lib/utils'

type AuthFieldProps = {
  id: string
  label: ReactNode
  labelAction?: ReactNode
  icon?: ReactNode
  error?: string | null
  children: ReactNode
  className?: string
}

export function AuthField({ id, label, labelAction, icon, error, children, className }: AuthFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {labelAction}
      </div>
      <div className="relative">
        {icon ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        {children}
      </div>
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const authInputClassName =
  'h-11 rounded-xl border-border/70 bg-background/80 pl-10 pr-3 shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary/40 focus-visible:ring-primary/20'
