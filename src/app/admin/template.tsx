'use client'

import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
