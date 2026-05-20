import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function PendingApprovalTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
