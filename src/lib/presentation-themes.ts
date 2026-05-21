export type PresentationThemeOption = {
  id: string
  name: string
  description: string
  thumbnailUrl?: string | null
}

/** Offline fallback when live themes cannot be loaded. */
export const FALLBACK_PRESENTATION_THEMES: PresentationThemeOption[] = [
  {
    id: 'fallback-dark',
    name: 'Classic dark',
    description: 'Bold contrast with a polished, executive feel.',
  },
  {
    id: 'fallback-light',
    name: 'Classic light',
    description: 'Clean layout with generous whitespace.',
  },
]

export function getPresentationThemeById(id: string): PresentationThemeOption | undefined {
  return FALLBACK_PRESENTATION_THEMES.find((theme) => theme.id === id)
}

export function getDefaultPresentationTheme(): PresentationThemeOption {
  return FALLBACK_PRESENTATION_THEMES[0]!
}
