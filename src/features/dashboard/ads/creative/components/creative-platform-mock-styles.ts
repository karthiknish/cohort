import type { CSSProperties } from 'react'

import { creativePlatformMockTheme as t } from './creative-platform-mock-theme'

/** Module-level styles for platform mock (stable references for react-perf). */
export const cpMockStyles = {
  avatarPlaceholder: {
    backgroundColor: t.avatarPlaceholderBg,
    color: t.textPrimary,
  },
  igSurface: { backgroundColor: t.surface, color: t.textPrimary },
  igRing: {
    backgroundImage: `linear-gradient(to top right, ${t.instagramRingFrom}, ${t.instagramRingVia}, ${t.instagramRingTo})`,
  },
  textMuted: { color: t.textMuted },
  textPrimary: { color: t.textPrimary },
  textSecondary: { color: t.textSecondary },
  link: { color: t.link },
  borderLightTop: { borderColor: t.borderLight },
  ctaInstagram: { backgroundColor: t.ctaInstagram },
  fbOuter: { backgroundColor: t.surfaceMuted, color: t.textPrimary },
  fbInner: { backgroundColor: t.surface },
  fbMediaBorder: { borderColor: `${t.borderDefault}cc` },
  fbLinkRow: { borderColor: t.borderDefault, backgroundColor: t.surfaceMuted },
  fbCta: { backgroundColor: t.surfaceButton, color: t.textPrimary },
  fbActionsBar: { borderColor: t.borderDefault },
} as const satisfies Record<string, CSSProperties>
