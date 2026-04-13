import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function ForYouTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
