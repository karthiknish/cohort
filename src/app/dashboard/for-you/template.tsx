import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function DashboardForYouTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
