"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoaderCircle } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { getFriendlyAuthErrorMessage } from "@/services/auth/error-utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { AuthCard } from "@/components/landing/auth-card"
import { bootstrapAndSyncSession, calculatePasswordStrength } from "@/components/landing/auth-utils"
import { HERO_HEADLINE, HERO_HIGHLIGHTS, HERO_SUBHEAD } from "@/components/landing/home-content"
import { HomeHero } from "@/components/landing/home-hero"

export default function HomePage() {
  const TAB_STORAGE_KEY = "cohorts.auth.activeTab"
  const REMEMBER_ME_KEY = "cohorts.auth.rememberMe"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [signInData, setSignInData] = useState(() => ({ email: "", password: "" }))
  const [signUpData, setSignUpData] = useState(() => ({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  }))
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const user = session?.user ?? null
  const loading = sessionPending
  const [sessionSynced, setSessionSynced] = useState(true) // Default to true now that manual sync is gone
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const redirectInProgressRef = (globalThis as any).__cohortsRedirectInProgressRef ?? { current: false }
    ; (globalThis as any).__cohortsRedirectInProgressRef = redirectInProgressRef

  const REDIRECT_STATE_KEY = "cohorts.auth.redirectState"
  const REDIRECT_STATE_STALE_MS = 30_000

  type RedirectState = { dest: string; count: number; ts: number }

  const readRedirectState = (): RedirectState | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.sessionStorage.getItem(REDIRECT_STATE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as Partial<RedirectState> | null
      if (!parsed || typeof parsed.dest !== 'string' || typeof parsed.count !== 'number' || typeof parsed.ts !== 'number') {
        return null
      }
      return { dest: parsed.dest, count: parsed.count, ts: parsed.ts }
    } catch {
      return null
    }
  }

  const writeRedirectState = (state: { dest: string; count: number; ts: number }) => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(REDIRECT_STATE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }

  const clearRedirectState = () => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(REDIRECT_STATE_KEY)
    } catch {
      // ignore
    }
  }

  // Fix hydration mismatch: track whether component has mounted on client
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Session sync is now handled by Better Auth and our unified server helpers

  // Use stable disabled state: always disabled on server/before mount, then use actual loading state
  const isAuthLoading = !hasMounted || loading

  // Calculate password strength for signup
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(signUpData.password),
    [signUpData.password]
  )

  // Check if passwords match in real-time
  const passwordsMatch = useMemo(
    () => signUpData.password === signUpData.confirmPassword,
    [signUpData.password, signUpData.confirmPassword]
  )

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  useEffect(() => {
    // Wait for session sync to complete before redirecting
    if (loading || !user || !sessionSynced) return
    if (redirectInProgressRef.current) return

    const redirect = searchParams.get("redirect")
    let destination = redirect || "/dashboard"

    // If no explicit redirect, try to restore last visited dashboard tab
    if (!redirect && typeof window !== 'undefined') {
      const lastTab = window.localStorage.getItem('cohorts_last_tab')
      if (lastTab && lastTab.startsWith('/dashboard')) {
        destination = lastTab
      }
    }

    // Cleanup stale tracking so refreshes don't cause false positives.
    if (typeof window !== 'undefined') {
      const now = Date.now()
      const state = readRedirectState()
      if (state && now - state.ts > REDIRECT_STATE_STALE_MS) {
        clearRedirectState()
      }

      // Prevent infinite redirect loops: detect rapid repeats to the same destination.
      const next = readRedirectState()
      if (next && next.dest === destination && now - next.ts < 2000) {
        if (next.count >= 3) {
          console.error('[HomePage] Infinite redirect detected for:', destination)
          toast({
            title: "Redirect loop detected",
            description: "We're having trouble syncing your session. Please try refreshing the page.",
            variant: "destructive",
          })
          return
        }
        writeRedirectState({ dest: destination, count: next.count + 1, ts: now })
      } else {
        writeRedirectState({ dest: destination, count: 1, ts: now })
      }
    }

    redirectInProgressRef.current = true

    // Try Next.js router first
    router.replace(destination)

    // Fallback: if router doesn't navigate within 3 seconds, force hard navigation
    const fallbackTimeout = setTimeout(() => {
      console.warn('[HomePage] Router navigation timeout, using fallback')
      window.location.href = destination
    }, 3000)

    // Clean up timeout if component unmounts (navigation succeeded)
    return () => clearTimeout(fallbackTimeout)
  }, [loading, user, sessionSynced, router, searchParams, toast])

  // When we're back on the home page without a user, clear any stale redirect-loop tracking.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user) {
      clearRedirectState()
      setSessionSynced(false) // Reset so re-login will sync again
    }
  }, [user])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const stored = window.localStorage.getItem(TAB_STORAGE_KEY)
      if (stored === "signin" || stored === "signup") {
        setActiveTab(stored)
      }

      // Load remember me preference
      const rememberedEmail = window.localStorage.getItem(REMEMBER_ME_KEY)
      if (rememberedEmail) {
        setSignInData((prev) => ({ ...prev, email: rememberedEmail }))
        setRememberMe(true)
      }
    } catch (error) {
      console.warn("[HomePage] failed to hydrate tab selection", error)
    }
  }, [])

  const handleTabChange = (value: string) => {
    const nextTab = value === "signup" ? "signup" : "signin"
    setActiveTab(nextTab)

    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(TAB_STORAGE_KEY, nextTab)
    } catch (error) {
      console.warn("[HomePage] failed to persist tab selection", error)
    }
  }

  if (!loading && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm">
            Redirecting to your dashboard…
          </div>
          <button
            type="button"
            onClick={() => {
              // Force a hard navigation if stuck
              window.location.href = '/dashboard'
            }}
            className="text-xs text-primary hover:underline"
          >
            Click here if not redirected automatically
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = (mode: "signin" | "signup") => async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setEmailError(null)

    try {
      if (mode === "signup") {
        // Validate email
        if (!validateEmail(signUpData.email)) {
          setEmailError("Please enter a valid email address")
          setIsSubmitting(false)
          return
        }

        // Validate password strength
        if (passwordStrength.score < 2) {
          toast({
            title: "Password needs work",
            description: "Create a stronger password with at least 8 characters, including letters and numbers.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        if (signUpData.password !== signUpData.confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure both passwords are identical.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }

        await authClient.signUp.email({
          email: signUpData.email,
          password: signUpData.password,
          name: signUpData.displayName.trim() || signUpData.email,
        })

        await Promise.all([
          authClient.getSession().catch(() => null),
          bootstrapAndSyncSession(),
        ])
        setSessionSynced(true)

        toast({
          title: "Welcome to Cohorts!",
          description: "Your account has been created. Taking you to your dashboard...",
        })
      } else {
        // Validate email
        if (!validateEmail(signInData.email)) {
          setEmailError("Please enter a valid email address")
          setIsSubmitting(false)
          return
        }

        await authClient.signIn.email({
          email: signInData.email,
          password: signInData.password,
        })

        await Promise.all([
          authClient.getSession().catch(() => null),
          bootstrapAndSyncSession(),
        ])
        setSessionSynced(true)

        // Handle remember me
        if (rememberMe && typeof window !== "undefined") {
          window.localStorage.setItem(REMEMBER_ME_KEY, signInData.email)
        } else if (typeof window !== "undefined") {
          window.localStorage.removeItem(REMEMBER_ME_KEY)
        }

        toast({
          title: "Welcome back!",
          description: "Signed in successfully. Loading your workspace...",
        })
      }

      const redirect = searchParams.get("redirect")
      // Restore last visited tab if no explicit redirect
      let destination = redirect || "/dashboard"
      if (!redirect && typeof window !== 'undefined') {
        const lastTab = window.localStorage.getItem('cohorts_last_tab')
        if (lastTab && lastTab.startsWith('/dashboard')) {
          destination = lastTab
        }
      }
      router.push(destination)
    } catch (error) {
      const errorMessage = getFriendlyAuthErrorMessage(error)
      toast({
        title: mode === "signin" ? "Sign in failed" : "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true)
      await authClient.signIn.social({
        provider: "google",
      })
      await authClient.getSession().catch(() => null)

      // Social sign-in may redirect; in case it returns without redirect,
      // ensure bootstrap+session cookies are ready.
      await Promise.all([
        authClient.getSession().catch(() => null),
        bootstrapAndSyncSession(),
      ])
      setSessionSynced(true)
    } catch (error) {
      const errorMessage = getFriendlyAuthErrorMessage(error)
      toast({
        title: "Google sign-in failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSignInData((previous) => ({
      ...previous,
      [name]: value,
    }))
    // Clear email error when user starts typing
    if (name === "email" && emailError) {
      setEmailError(null)
    }
  }

  const handleSignUpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSignUpData((previous) => ({
      ...previous,
      [name]: value,
    }))
    // Clear email error when user starts typing
    if (name === "email" && emailError) {
      setEmailError(null)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-12 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-20 lg:px-10 lg:py-20">
        <HomeHero headline={HERO_HEADLINE} subhead={HERO_SUBHEAD} highlights={HERO_HIGHLIGHTS} />
        <AuthCard
          activeTab={activeTab}
          emailError={emailError}
          isSubmitting={isSubmitting}
          isAuthLoading={isAuthLoading}
          rememberMe={rememberMe}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          passwordsMatch={passwordsMatch}
          signInData={signInData}
          signUpData={signUpData}
          passwordStrength={passwordStrength}
          onTabChange={handleTabChange}
          onRememberMeChange={(event) => setRememberMe(event.target.checked)}
          onToggleShowPassword={() => setShowPassword((previous) => !previous)}
          onToggleShowConfirmPassword={() => setShowConfirmPassword((previous) => !previous)}
          onSignInChange={handleSignInChange}
          onSignUpChange={handleSignUpChange}
          onSubmitSignIn={handleSubmit("signin")}
          onSubmitSignUp={handleSubmit("signup")}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
    </div>
  )
}



