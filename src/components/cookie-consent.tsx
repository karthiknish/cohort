'use client'

import * as React from 'react'
import Link from 'next/link'
import { X, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { updateAnalyticsConsent } from '@/lib/analytics'

export type CookiePreferences = {
  essential: boolean // Always true, cannot be disabled
  analytics: boolean
  functionality: boolean
  marketing: boolean
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  functionality: false,
  marketing: false,
}

const COOKIE_CONSENT_KEY = 'cookie-consent'
const COOKIE_PREFERENCES_KEY = 'cookie-preferences'

// Event for triggering cookie settings modal
const COOKIE_SETTINGS_EVENT = 'open-cookie-settings'

export function openCookieSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
  }
}

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  
  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<CookiePreferences>
      return {
        essential: true, // Always true
        analytics: parsed.analytics ?? false,
        functionality: parsed.functionality ?? false,
        marketing: parsed.marketing ?? false,
      }
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_PREFERENCES
}

export function saveCookiePreferences(preferences: CookiePreferences, authToken?: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
    ...preferences,
    essential: true, // Always true
    timestamp: new Date().toISOString(),
  }))

  // Update analytics based on preference
  void updateAnalyticsConsent(preferences.analytics)

  // If authenticated, also store consent server-side for GDPR audit trail
  if (authToken) {
    void fetch('/api/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        type: 'cookie',
        preferences,
      }),
    }).catch(() => {
      // Silent fail - localStorage is the primary source
    })
  }
}

export function resetCookiePreferences(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  localStorage.removeItem(COOKIE_PREFERENCES_KEY)
  void updateAnalyticsConsent(false)
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [showDetails, setShowDetails] = React.useState(false)
  const [preferences, setPreferences] = React.useState<CookiePreferences>(DEFAULT_PREFERENCES)

  React.useEffect(() => {
    // Check if user has already consented
    const consented = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consented) {
      setIsVisible(true)
    } else {
      // Load existing preferences
      setPreferences(getCookiePreferences())
    }

    // Listen for manual open requests (e.g., from footer link)
    const handleOpenSettings = () => {
      setPreferences(getCookiePreferences())
      setShowDetails(true)
      setIsVisible(true)
    }

    window.addEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings)
    return () => {
      window.removeEventListener(COOKIE_SETTINGS_EVENT, handleOpenSettings)
    }
  }, [])

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      functionality: true,
      marketing: true,
    }
    saveCookiePreferences(allAccepted)
    setPreferences(allAccepted)
    setIsVisible(false)
  }

  const declineAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      functionality: false,
      marketing: false,
    }
    saveCookiePreferences(essentialOnly)
    setPreferences(essentialOnly)
    setIsVisible(false)
  }

  const savePreferences = () => {
    saveCookiePreferences(preferences)
    setIsVisible(false)
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return // Cannot disable essential cookies
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">Cookie preferences</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience. You can customize your preferences below or read our{' '}
                <Link href="/cookies" className="font-medium text-primary hover:underline">
                  Cookie Policy
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setIsVisible(false)}
              aria-label="Close cookie banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Expandable details */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 px-0 text-muted-foreground hover:text-foreground"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Settings className="h-4 w-4" />
              Customize preferences
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showDetails && (
              <div className="mt-4 space-y-4 rounded-lg border bg-muted/20 p-4 animate-in slide-in-from-top-2 duration-200">
                {/* Essential cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Essential cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Required for the website to function properly. Cannot be disabled.
                    </p>
                  </div>
                  <Checkbox checked disabled aria-label="Essential cookies (always on)" />
                </div>

                {/* Analytics cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analytics cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how visitors interact with our website using Firebase Analytics.
                    </p>
                  </div>
                  <Checkbox
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    aria-label="Analytics cookies"
                  />
                </div>

                {/* Functionality cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Functionality cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Remember your preferences like theme, language, and recently viewed items.
                    </p>
                  </div>
                  <Checkbox
                    checked={preferences.functionality}
                    onChange={(e) => updatePreference('functionality', e.target.checked)}
                    aria-label="Functionality cookies"
                  />
                </div>

                {/* Marketing cookies */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Marketing cookies</p>
                    <p className="text-xs text-muted-foreground">
                      Used to deliver relevant ads and track ad campaign performance across platforms.
                    </p>
                  </div>
                  <Checkbox
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    aria-label="Marketing cookies"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={declineAll}>
              Reject all
            </Button>
            {showDetails && (
              <Button variant="secondary" onClick={savePreferences}>
                Save preferences
              </Button>
            )}
            <Button onClick={acceptAll}>Accept all</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
