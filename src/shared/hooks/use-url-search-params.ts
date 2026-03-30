'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export function useUrlSearchParams() {
  const searchParams = useSearchParams()

  // Return a mutable clone so existing call sites can safely create/update
  // URLSearchParams instances without depending on Next.js's readonly wrapper.
  return useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams])
}