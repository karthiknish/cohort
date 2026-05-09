const SEMANTIC_SWATCHES = {
  success: {
    DEFAULT: '#16a34a',
    foreground: '#ffffff',
    border: '#15803d',
    light: '#22c55e',
    dark: '#15803d',
    bg: '#ecfdf5',
    text: '#065f46',
  },
  warning: {
    DEFAULT: '#f59e0b',
    foreground: '#78350f',
    border: '#d97706',
    light: '#fbbf24',
    bg: '#fffbeb',
    text: '#92400e',
  },
  info: {
    DEFAULT: '#3b82f6',
    foreground: '#ffffff',
    border: '#2563eb',
    light: '#60a5fa',
    bg: '#eff6ff',
    text: '#1e40af',
  },
} as const

export const SEMANTIC_COLOR_TOKENS = {
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground))',
    border: 'hsl(var(--success-border))',
  },
  warning: {
    DEFAULT: 'hsl(var(--warning))',
    foreground: 'hsl(var(--warning-foreground))',
    border: 'hsl(var(--warning-border))',
  },
  info: {
    DEFAULT: 'hsl(var(--info))',
    foreground: 'hsl(var(--info-foreground))',
    border: 'hsl(var(--info-border))',
  },
} as const

export const COLORS = {
  primary: {
    DEFAULT: '#ffffff',
    foreground: '#0f172a',
  },
  secondary: {
    DEFAULT: '#1e293b',
    foreground: '#f9fafb',
  },
  accent: {
    DEFAULT: '#3b82f6',
    foreground: '#ffffff',
  },
  destructive: {
    DEFAULT: '#dc2626',
    foreground: '#ffffff',
    border: '#b91c1c',
  },
  success: SEMANTIC_SWATCHES.success,
  warning: SEMANTIC_SWATCHES.warning,
  info: SEMANTIC_SWATCHES.info,
  background: {
    DEFAULT: '#f9fafb',
    card: '#ffffff',
    popover: '#ffffff',
    sidebar: '#1e293b',
    muted: '#f3f4f6',
  },
  foreground: {
    DEFAULT: '#0f172a',
    muted: '#475569',
    subtle: '#6b7280',
    placeholder: '#9ca3af',
    disabled: '#d1d5db',
  },
  border: {
    DEFAULT: '#e2e8f0',
    input: '#e2e8f0',
    subtle: '#e5e7eb',
    sidebar: '#243041',
  },
  chart: {
    1: '#16a34a',
    2: '#15803d',
    3: '#1e293b',
    4: '#3b82f6',
    5: '#0ea5e9',
  },
  sidebar: {
    DEFAULT: '#1e293b',
    foreground: '#f9fafb',
    primary: '#ffffff',
    'primary-foreground': '#0f172a',
    accent: '#3b82f6',
    'accent-foreground': '#ffffff',
    border: '#243041',
    ring: '#3b82f6',
  },
} as const

export const GRAYS = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#0f172a',
} as const

export const SLATES = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const

export const PROVIDER_COLORS = {
  google: {
    DEFAULT: '#4285F4',
    blue: '#4285F4',
    green: '#34A853',
    yellow: '#FBBC05',
    red: '#EA4335',
    analytics: {
      yellow: '#F9AB00',
      orange: '#E37400',
    },
  },
  facebook: '#1877F2',
  meta: '#0668E1',
  linkedin: '#0A66C2',
  tiktok: '#FE2C55',
} as const

export const SEMANTIC_COLORS = {
  status: {
    active: SEMANTIC_SWATCHES.success.DEFAULT,
    inactive: '#6b7280',
    pending: SEMANTIC_SWATCHES.warning.DEFAULT,
    error: '#dc2626',
    success: SEMANTIC_SWATCHES.success.DEFAULT,
    warning: SEMANTIC_SWATCHES.warning.DEFAULT,
    info: SEMANTIC_SWATCHES.info.DEFAULT,
  },
  priority: {
    low: '#3b82f6',
    medium: SEMANTIC_SWATCHES.warning.DEFAULT,
    high: '#f97316',
    critical: '#dc2626',
  },
  project: {
    planning: '#64748b',
    active: SEMANTIC_SWATCHES.success.DEFAULT,
    onHold: SEMANTIC_SWATCHES.warning.DEFAULT,
    completed: SEMANTIC_SWATCHES.info.DEFAULT,
  },
  severity: {
    critical: '#dc2626',
    warning: SEMANTIC_SWATCHES.warning.DEFAULT,
    info: SEMANTIC_SWATCHES.info.DEFAULT,
  },
} as const

export const CHART_COLORS = {
  primary: [
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#10b981',
    '#06b6d4',
    '#f97316',
    '#84cc16',
    '#6366f1',
  ],
  funnel: {
    impressions: '#3b82f6',
    clicks: '#8b5cf6',
    conversions: '#10b981',
    visitors: '#3b82f6',
    views: '#6366f1',
    cart: '#8b5cf6',
    checkout: '#a855f7',
    purchase: '#10b981',
  },
  metrics: {
    spend: '#ef4444',
    revenue: '#22c55e',
    roas: '#3b82f6',
    ctr: '#f59e0b',
    efficiency: '#8b5cf6',
    impressions: '#3b82f6',
    clicks: '#8b5cf6',
  },
  hsl: {
    emerald: 'hsl(160 84% 39%)',
    red: 'hsl(0 84% 60%)',
    indigo: 'hsl(239 84% 67%)',
    amber: 'hsl(38 92% 50%)',
    blue: 'hsl(217 91% 60%)',
    facebook: 'hsl(214 89% 52%)',
    pink: 'hsl(339 80% 55%)',
    primary: 'hsl(var(--primary))',
    destructive: 'hsl(var(--destructive))',
  },
} as const

export const EMAIL_COLORS = {
  background: '#f8fafc',
  canvasGlow: '#eef2ff',
  card: '#ffffff',
  muted: '#f8fafc',
  highlight: '#eef2ff',
  heading: '#0f172a',
  body: '#334155',
  subtle: '#64748b',
  mutedText: '#94a3b8',
  disabled: '#cbd5e1',
  border: '#e2e8f0',
  lightBorder: '#edf2f7',
  brand: {
    primary: '#ffffff',
    secondary: '#0f172a',
    foreground: '#f8fafc',
    accent: '#3b82f6',
    accentSoft: '#dbeafe',
  },
  button: {
    primary: '#ffffff',
    dark: '#0f172a',
  },
  success: {
    bg: SEMANTIC_SWATCHES.success.bg,
    border: '#bbf7d0',
    text: SEMANTIC_SWATCHES.success.border,
    darkText: '#166534',
  },
  info: {
    bg: SEMANTIC_SWATCHES.info.bg,
    border: '#bfdbfe',
    text: SEMANTIC_SWATCHES.info.text,
    darkText: '#1e3a8a',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    text: '#dc2626',
    darkText: '#991b1b',
  },
  warning: {
    bg: SEMANTIC_SWATCHES.warning.bg,
    border: '#fde68a',
    text: SEMANTIC_SWATCHES.warning.text,
    darkText: '#92400e',
  },
} as const

export const UTILS = {
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',
  current: 'currentColor',
  inherit: 'inherit',
} as const

export const CSS_VARS = {
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  'card-foreground': 'var(--card-foreground)',
  popover: 'var(--popover)',
  'popover-foreground': 'var(--popover-foreground)',
  primary: 'var(--primary)',
  'primary-foreground': 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  'secondary-foreground': 'var(--secondary-foreground)',
  muted: 'var(--muted)',
  'muted-foreground': 'var(--muted-foreground)',
  accent: 'var(--accent)',
  'accent-foreground': 'var(--accent-foreground)',
  destructive: 'var(--destructive)',
  'destructive-foreground': 'var(--destructive-foreground)',
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
} as const

export function getColor(path: string): string | undefined {
  const parts = path.split('.')
  let current: Record<string, unknown> = COLORS

  for (const part of parts) {
    if (current[part] === undefined) {
      return undefined
    }
    current = current[part] as Record<string, unknown>
  }

  return typeof current === 'string' ? current : undefined
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export function getProviderColor(providerId: string): string {
  const normalizedId = providerId.toLowerCase()
  const colors: Record<string, string> = {
    google: PROVIDER_COLORS.google.DEFAULT,
    facebook: PROVIDER_COLORS.facebook,
    meta: PROVIDER_COLORS.meta,
    linkedin: PROVIDER_COLORS.linkedin,
    tiktok: PROVIDER_COLORS.tiktok,
  }
  return colors[normalizedId] || GRAYS[500]
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: SEMANTIC_COLORS.status.active,
    inactive: SEMANTIC_COLORS.status.inactive,
    pending: SEMANTIC_COLORS.status.pending,
    error: SEMANTIC_COLORS.status.error,
    success: SEMANTIC_COLORS.status.success,
    warning: SEMANTIC_COLORS.status.warning,
    info: SEMANTIC_COLORS.status.info,
    planning: SEMANTIC_COLORS.project.planning,
    on_hold: SEMANTIC_COLORS.project.onHold,
    completed: SEMANTIC_COLORS.project.completed,
  }
  return colors[status.toLowerCase()] || GRAYS[500]
}

export function getSeverityColor(severity: 'critical' | 'warning' | 'info'): string {
  return SEMANTIC_COLORS.severity[severity]
}

export function getChartColor(index: number): string {
  return CHART_COLORS.primary[index % CHART_COLORS.primary.length]!
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: SEMANTIC_COLORS.priority.low,
    medium: SEMANTIC_COLORS.priority.medium,
    high: SEMANTIC_COLORS.priority.high,
    critical: SEMANTIC_COLORS.priority.critical,
  }
  return colors[priority.toLowerCase()] || GRAYS[500]
}

export function getSemanticBadgeStyle(color: string, alpha = 0.12): { backgroundColor: string; borderColor: string; color: string } {
  return {
    backgroundColor: hexToRgba(color, alpha),
    borderColor: hexToRgba(color, alpha + 0.08),
    color,
  }
}
