import { ShellRouteTransition } from '@/shared/ui/page-transition'

export default function SettingsTemplate({ children }: { children: React.ReactNode }) {
  return <ShellRouteTransition>{children}</ShellRouteTransition>
}
