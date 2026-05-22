'use client'

import { useAction } from 'convex/react'
import { useEffect, useMemo, useReducer } from 'react'

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

type PresentationThemesState = {
  themes: PresentationThemeOption[]
  isLoading: boolean
  loadError: string | null
}

type PresentationThemesAction =
  | { type: 'beginLoad' }
  | { type: 'loadSuccess'; themes: PresentationThemeOption[] }
  | {
      type: 'loadFailure'
      themes: PresentationThemeOption[]
      loadError: string
    }

function presentationThemesReducer(
  state: PresentationThemesState,
  action: PresentationThemesAction,
): PresentationThemesState {
  switch (action.type) {
    case 'beginLoad':
      return { ...state, isLoading: true, loadError: null }
    case 'loadSuccess':
      return { themes: action.themes, isLoading: false, loadError: null }
    case 'loadFailure':
      return { themes: action.themes, isLoading: false, loadError: action.loadError }
    default:
      return state
  }
}

export function usePresentationThemes() {
  const listThemes = useAction(presentationDeckApi.listThemes)
  const [state, dispatch] = useReducer(presentationThemesReducer, {
    themes: FALLBACK_PRESENTATION_THEMES,
    isLoading: true,
    loadError: null,
  })
  const { themes, isLoading, loadError } = state

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (cancelled) return
      dispatch({ type: 'beginLoad' })
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

        dispatch({
          type: 'loadSuccess',
          themes: mapped.length > 0 ? mapped : FALLBACK_PRESENTATION_THEMES,
        })
      } catch {
        if (!cancelled) {
          dispatch({
            type: 'loadFailure',
            themes: FALLBACK_PRESENTATION_THEMES,
            loadError:
              'Showing default styles — live theme catalog will load when the engine is connected.',
          })
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
