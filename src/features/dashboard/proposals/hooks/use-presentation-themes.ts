'use client'

import { useAction } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'

import { presentationDeckApi } from '@/lib/convex-api'
import {
  FALLBACK_PRESENTATION_THEMES,
  type PresentationThemeOption,
} from '@/lib/presentation-themes'

type ThemeRow = {
  id: string
  name: string
  type?: string
  thumbnailUrl?: string
}

export function usePresentationThemes() {
  const listThemes = useAction(presentationDeckApi.listThemes)
  const [themes, setThemes] = useState<PresentationThemeOption[]>(FALLBACK_PRESENTATION_THEMES)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const result = await listThemes({ limit: 50 })
        if (cancelled) return

        const mapped: PresentationThemeOption[] = (result.data as ThemeRow[]).map((theme) => ({
          id: theme.id,
          name: theme.name,
          description:
            theme.type === 'custom'
              ? 'Workspace theme from your brand library.'
              : 'Curated visual style for client-ready decks.',
          thumbnailUrl: theme.thumbnailUrl ?? null,
        }))

        setThemes(mapped.length > 0 ? mapped : FALLBACK_PRESENTATION_THEMES)
      } catch {
        if (!cancelled) {
          setThemes(FALLBACK_PRESENTATION_THEMES)
          setLoadError('Showing default styles — live theme catalog will load when the engine is connected.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [listThemes])

  const themeById = useMemo(() => new Map(themes.map((theme) => [theme.id, theme])), [themes])

  return { themes, themeById, isLoading, loadError }
}
