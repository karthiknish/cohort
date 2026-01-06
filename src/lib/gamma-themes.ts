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
    id: '',
    name: 'Default',
    description: 'Use Gamma\'s default theme',
  },
  {
    id: 'Prism',
    name: 'Prism',
    description: 'Modern, colorful design with gradient accents',
  },
  {
    id: 'Chisel',
    name: 'Chisel',
    description: 'Clean, minimalist professional look',
  },
  {
    id: 'Standard Dark',
    name: 'Standard Dark',
    description: 'Dark background with light text',
  },
  {
    id: 'Dark Gradient',
    name: 'Dark Gradient',
    description: 'Dark theme with subtle gradient backgrounds',
  },
]

export function getGammaThemeById(id: string): GammaPresentationTheme | undefined {
  return GAMMA_PRESENTATION_THEMES.find(theme => theme.id === id)
}

export function getDefaultGammaTheme(): GammaPresentationTheme {
  return GAMMA_PRESENTATION_THEMES[0]
}
