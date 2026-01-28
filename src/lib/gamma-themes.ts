// Gamma presentation themes
// These are common themes available in Gamma. Note that the themeId must match
// exactly what's returned from Gamma's List Themes API for your workspace.
// If a theme doesn't work, it may not be available in your Gamma workspace.

export type GammaPresentationTheme = {
  id: string
  name: string
  description: string
}

// Common Gamma themes - these may vary by workspace
export const GAMMA_PRESENTATION_THEMES: GammaPresentationTheme[] = [
  {
    id: 'default-dark',
    name: 'Basic Dark',
    description: 'Dark palette with bold, modern tones.',
  },
  {
    id: 'default-light',
    name: 'Basic Light',
    description: 'Clean, bright layout with a professional finish.',
  },
]

export function getGammaThemeById(id: string): GammaPresentationTheme | undefined {
  return GAMMA_PRESENTATION_THEMES.find(theme => theme.id === id)
}

export function getDefaultGammaTheme(): GammaPresentationTheme {
  return GAMMA_PRESENTATION_THEMES[0]!
}
