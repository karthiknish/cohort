import { createFileRoute, redirect } from '@tanstack/react-router'
import { marketingHomeMetadata } from '@/features/marketing/lib/marketing-home-metadata'
import HomePageClient from '@/features/marketing/home/page.client'
import { getServerRequest } from '@/lib/server-request.server'
import { hasValidSession } from '@/lib/auth-guard'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    let request: Request | undefined
    try {
      request = getServerRequest()
    } catch {
      // SPA navigation — no server request; redirect handled by client auth
      return
    }
    if (await hasValidSession(request)) {
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
