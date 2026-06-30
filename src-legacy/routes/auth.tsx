import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AuthError } from '@/shared/ui/route-boundaries/auth-error'
import { AuthLoading } from '@/shared/ui/route-boundaries/auth-loading'

export const Route = createFileRoute('/auth')({
  component: () => <Outlet />,
  errorComponent: AuthError,
  pendingComponent: AuthLoading,
})
