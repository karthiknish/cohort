import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
