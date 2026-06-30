import { createFileRoute } from '@tanstack/react-router'
import SocialsPage from '@/features/dashboard/socials/page'

export const Route = createFileRoute('/_authed/dashboard/socials')({
  head: () => ({
    meta: [{ title: 'Socials | Cohorts' }],
  }),
  component: () => <SocialsPage />,
})
