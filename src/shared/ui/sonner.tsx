"use client"

import { type CSSProperties } from 'react'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const TOASTER_ICONS = {
  success: <CircleCheckIcon className="size-4" />,
  info: <InfoIcon className="size-4" />,
  warning: <TriangleAlertIcon className="size-4" />,
  error: <OctagonXIcon className="size-4" />,
  loading: <Loader2Icon className="size-4 animate-spin" />,
} as const

const TOASTER_STYLE = {
  '--border-radius': 'var(--radius)',
} as CSSProperties & { '--border-radius': string }

const DEFAULT_TOAST_OPTIONS: NonNullable<ToasterProps['toastOptions']> = {
  closeButtonAriaLabel: 'Dismiss notification',
}

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      containerAriaLabel="Notifications"
      icons={TOASTER_ICONS}
      style={TOASTER_STYLE}
      toastOptions={{
        ...DEFAULT_TOAST_OPTIONS,
        ...toastOptions,
      }}
      {...props}
    />
  )
}

export { Toaster }
export { toast } from "sonner"
