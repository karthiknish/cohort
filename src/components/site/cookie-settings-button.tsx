'use client'

import { openCookieSettings } from '@/components/cookie-consent'

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => openCookieSettings()}
      className="transition hover:text-primary"
    >
      Cookie Settings
    </button>
  )
}
