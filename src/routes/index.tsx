import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { marketingHomeMetadata } from '@/features/marketing/lib/marketing-home-metadata'
import HomePageClient from '@/features/marketing/home/page.client'
import { getToken } from '@/lib/auth-server'

const checkHomeAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const token = await getToken()
  return { isAuthenticated: !!token }
})

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    // On client navigation, skip SSR auth check — client auth handles it
    if (typeof document !== 'undefined') return

    const { isAuthenticated } = await checkHomeAuth()
    if (isAuthenticated) {
      throw redirect({ to: '/for-you' })
    }
  },
  head: () => ({
    meta: [
      { title: marketingHomeMetadata.title as string },
      { name: 'description', content: marketingHomeMetadata.description as string },
    ],
  }),
  component: HomePage,
})

function HomePage() {
  return <HomePageClient />
}
