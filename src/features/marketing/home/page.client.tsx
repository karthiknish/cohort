"use client"

import { LoaderCircle } from "lucide-react"
import { useRouter, redirect } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"

import { AuthCard } from "@/features/marketing/home/components/auth-card"
import { bootstrapAndSyncSession, calculatePasswordStrength } from "@/features/marketing/home/components/auth-utils"
import { DashboardPreview } from "@/features/marketing/home/components/dashboard-preview"
import { FeaturesBento } from "@/features/marketing/home/components/features-bento"
import { HeroBackground } from "@/features/marketing/home/components/hero-background"
import { HERO_HEADLINE, HERO_SUBHEAD } from "@/features/marketing/home/components/home-content"
import { FadeIn } from "@/shared/ui/animate-in"
import { useToast } from "@/shared/ui/use-toast"
import { authClient } from "@/lib/auth-client"
import { getFriendlyAuthErrorMessage } from "@/services/auth/error-utils"

const TAB_STORAGE_KEY = "cohorts.auth.activeTab"
const REMEMBER_ME_KEY = "cohorts.auth.rememberMe"
const HOME_PAGE_FALLBACK = (
  <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
  </div>
)

function HomePageContent() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(() => {
    if (typeof window === 'undefined') {
      return "signin"
    }

    const stored = window.localStorage.getItem(TAB_STORAGE_KEY)
    return stored === "signup" ? "signup" : "signin"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Boolean(window.localStorage.getItem(REMEMBER_ME_KEY))
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [signInData, setSignInData] = useState(() => {
    if (typeof window === 'undefined') {
      return { email: "", password: "" }
    }

    const rememberedEmail = window.localStorage.getItem(REMEMBER_ME_KEY) ?? ""
    return { email: rememberedEmail, password: "" }
  })
  const [signUpData, setSignUpData] = useState(() => ({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  }))
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const user = session?.user ?? null
  const loading = sessionPending
  const router = useRouter()
  const { toast } = useToast()
  const getRedirectParam = useCallback(() => {
    if (typeof window === 'undefined') {
      return null
    }
    return new URLSearchParams(window.location.search).get("redirect")
  }, [])
  const resolvePostAuthDestination = useCallback(() => {
    const redirectParam = getRedirectParam()
    if (redirectParam) {
      return redirectParam
    }
    if (typeof window !== 'undefined') {
      const lastTab = window.localStorage.getItem('cohorts_last_tab')
      if (lastTab?.startsWith('/dashboard')) {
        return lastTab
      }
    }
    return '/dashboard'
  }, [getRedirectParam])

  // Session sync is now handled by Better Auth and our unified server helpers
  const isAuthLoading = loading

  // Calculate password strength for signup
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(signUpData.password),
    [signUpData.password]
  )

  // Check if passwords match in real-time
  const passwordsMatch = signUpData.password === signUpData.confirmPassword

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleTabChange = useCallback((value: string) => {
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
  }, [])

  const authenticatedDestination = !loading && user ? resolvePostAuthDestination() : null

  if (authenticatedDestination) {
    redirect(authenticatedDestination)
  }

  const handleSubmit = useCallback(
    (mode: "signin" | "signup") => async (event: FormEvent) => {
      event.preventDefault()
      setIsSubmitting(true)
      setEmailError(null)

      await Promise.resolve()
        .then(async () => {
          if (mode === "signup") {
            // Validate email
            if (!validateEmail(signUpData.email)) {
              setEmailError("Please enter a valid email address")
              return
            }

            // Validate password strength
            if (passwordStrength.score < 2) {
              toast({
                title: "Password needs work",
                description: "Create a stronger password with at least 8 characters, including letters and numbers.",
                variant: "destructive",
              })
              return
            }

            if (signUpData.password !== signUpData.confirmPassword) {
              toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords are identical.",
                variant: "destructive",
              })
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

            toast({
              title: "Welcome to Cohorts!",
              description: "Your account has been created. Taking you to your dashboard...",
            })
          } else {
            // Validate email
            if (!validateEmail(signInData.email)) {
              setEmailError("Please enter a valid email address")
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

          const destination = resolvePostAuthDestination()
          router.push(destination)
        })
        .catch((error) => {
          const errorMessage = getFriendlyAuthErrorMessage(error)
          toast({
            title: mode === "signin" ? "Sign in failed" : "Sign up failed",
            description: errorMessage,
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [
      passwordStrength.score,
      rememberMe,
      resolvePostAuthDestination,
      router,
      signInData,
      signUpData,
      toast,
    ]
  )

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true)

    await authClient.signIn.social({
      provider: "google",
    })
      .then(async () => {
        await authClient.getSession().catch(() => null)

        // Social sign-in may redirect; in case it returns without redirect,
        // ensure bootstrap+session cookies are ready.
        await Promise.all([
          authClient.getSession().catch(() => null),
          bootstrapAndSyncSession(),
        ])
      })
      .catch((error) => {
        const errorMessage = getFriendlyAuthErrorMessage(error)
        toast({
          title: "Google sign-in failed",
          description: errorMessage,
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }, [toast])

  const handleSignInChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSignInData((previous) => ({
      ...previous,
      [name]: value,
    }))
    // Clear email error when user starts typing
    if (name === "email" && emailError) {
      setEmailError(null)
    }
  }, [emailError])

  const handleSignUpChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSignUpData((previous) => ({
      ...previous,
      [name]: value,
    }))
    // Clear email error when user starts typing
    if (name === "email" && emailError) {
      setEmailError(null)
    }
  }, [emailError])

  const handleRememberMeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked)
  }, [])

  const handleToggleShowPassword = useCallback(() => {
    setShowPassword((previous) => !previous)
  }, [])

  const handleToggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((previous) => !previous)
  }, [])

  const handleSubmitSignIn = useCallback(
    (event: FormEvent) => {
      void handleSubmit("signin")(event)
    },
    [handleSubmit]
  )

  const handleSubmitSignUp = useCallback(
    (event: FormEvent) => {
      void handleSubmit("signup")(event)
    },
    [handleSubmit]
  )

  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-primary px-6 pb-20 pt-24 text-center">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
            <span className="mr-2 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            Now in public beta
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {HERO_HEADLINE}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            {HERO_SUBHEAD}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#auth-section"
              className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition-all duration-200 hover:scale-[1.02] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Get started free
            </a>
            <a
              href="#auth-section"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white/80 transition-colors duration-200 hover:border-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Sign in
            </a>
          </div>

          <div className="mt-16">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-background px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/50">Features</p>
            <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
              Everything your agency runs on
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              One platform. Every workflow. From first proposal to final report.
            </p>
          </FadeIn>
          <FeaturesBento />
        </div>
      </section>

      {/* ── Auth ── */}
      <section id="auth-section" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-md">
          <FadeIn className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Start your free workspace
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join agencies already using Cohorts to work smarter.
            </p>
          </FadeIn>
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
            onRememberMeChange={handleRememberMeChange}
            onToggleShowPassword={handleToggleShowPassword}
            onToggleShowConfirmPassword={handleToggleShowConfirmPassword}
            onSignInChange={handleSignInChange}
            onSignUpChange={handleSignUpChange}
            onSubmitSignIn={handleSubmitSignIn}
            onSubmitSignUp={handleSubmitSignUp}
            onGoogleSignIn={handleGoogleSignIn}
          />
        </div>
      </section>
    </div>
  )
}

export default function HomePage() {
  return <Suspense fallback={HOME_PAGE_FALLBACK}><HomePageContent /></Suspense>
}
