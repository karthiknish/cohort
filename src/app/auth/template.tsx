import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
