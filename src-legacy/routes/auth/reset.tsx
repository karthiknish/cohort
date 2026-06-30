import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordPageClient from '@/features/auth/reset/reset-password-page-client'

export const Route = createFileRoute('/auth/reset')({
  validateSearch: (search: Record<string, unknown>) => ({
    oobCode: typeof search.oobCode === 'string' ? search.oobCode : undefined,
  }),
  head: () => ({
    meta: [
      { title: 'Reset Password | Cohorts' },
      {
        name: 'description',
        content: 'Set a new password for your Cohorts account using a secure reset link.',
      },
    ],
  }),
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  const { oobCode } = Route.useSearch()
  return <ResetPasswordPageClient oobCode={oobCode ?? null} />
}
