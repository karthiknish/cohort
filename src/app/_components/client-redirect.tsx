'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type ClientRedirectProps = {
  href: string
}

export function ClientRedirect({ href }: ClientRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    router.replace(href)
  }, [href, router])

  return null
}
