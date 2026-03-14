"use client"

import { LoaderCircle } from "lucide-react"
import { useRouter, redirect } from "next/navigation"
import { Suspense, useCallback, useMemo, useState } from "react"

import { AuthCard } from "@/features/marketing/home/components/auth-card"
import { bootstrapAndSyncSession, calculatePasswordStrength } from "@/features/marketing/home/components/auth-utils"
import { HERO_HEADLINE, HERO_HIGHLIGHTS, HERO_SUBHEAD } from "@/features/marketing/home/components/home-content"
import { HomeHero } from "@/features/marketing/home/components/home-hero"
import { useToast } from "@/shared/ui/use-toast"
import { authClient } from "@/lib/auth-client"
import { getFriendlyAuthErrorMessage } from "@/services/auth/error-utils"

function HomePageContent() {
  const TAB_STORAGE_KEY = "cohorts.auth.activeTab"
  const REMEMBER_ME_KEY = "cohorts.auth.rememberMe"
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
      if (lastTab?.startsWith('/dashboard') || lastTab === '/for-you') {
        return lastTab
      }
    }
    return '/for-you'
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
    redirect(resolvePostAuthDestination())
  }

  const handleSubmit = (mode: "signin" | "signup") => async (event: React.FormEvent) => {
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
  }

  const handleGoogleSignIn = async () => {
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

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
          <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
