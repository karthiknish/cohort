"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CircleCheck, Eye, EyeOff, Lock, Mail, User, CircleAlert, Check, X, Shield, LoaderCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { getFriendlyAuthErrorMessage } from "@/services/auth/error-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/ui/animate-in"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Password strength calculation
interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const passedChecks = Object.values(checks).filter(Boolean).length

  let score: number
  let label: string
  let color: string

  if (password.length === 0) {
    score = 0
    label = ""
    color = "bg-muted"
  } else if (passedChecks <= 1) {
    score = 1
    label = "Weak"
    color = "bg-red-500"
  } else if (passedChecks === 2) {
    score = 2
    label = "Fair"
    color = "bg-orange-500"
  } else if (passedChecks === 3) {
    score = 3
    label = "Good"
    color = "bg-yellow-500"
  } else if (passedChecks === 4) {
    score = 3
    label = "Strong"
    color = "bg-emerald-500"
  } else {
    score = 4
    label = "Very Strong"
    color = "bg-emerald-600"
  }

  return { score, label, color, checks }
}

// Password requirement component
function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={cn(met ? "text-emerald-600" : "text-muted-foreground")}>{label}</span>
    </div>
  )
}

const HERO_HIGHLIGHTS = [
  {
    title: "Unified client workspace",
    description:
      "Monitor pipeline, automations, and conversations without switching tools.",
  },
  {
    title: "AI-assisted proposals",
    description: "Draft tailored pitch decks with automated insights and instant presentation exports.",
  },
  {
    title: "Automated reporting",
    description: "Ship branded campaign recaps and alerts effortlessly to your clients.",
  },
  {
    title: "Secure client access",
    description: "Protect every workspace with role-based access and session safeguards.",
  },
] as const

export default function HomePage() {
  const TAB_STORAGE_KEY = "cohorts.auth.activeTab"
  const REMEMBER_ME_KEY = "cohorts.auth.rememberMe"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [signInData, setSignInData] = useState({ email: "", password: "" })
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  })
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
      await authClient.signIn.social({
        provider: "google",
      })
    } catch (error) {
      const errorMessage = getFriendlyAuthErrorMessage(error)
      toast({
        title: "Google sign-in failed",
        description: errorMessage,
        variant: "destructive",
      })
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
        <FadeIn as="section" className="flex w-full max-w-2xl flex-col justify-center space-y-10 lg:py-12">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
              Now in public beta
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              Run every client engagement from a single modern workspace.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              Streamline onboarding, proposals, performance snapshots, and feedback loops with a platform designed
              for agencies that need to move fast.
            </p>
          </div>

          <FadeInStagger className="grid gap-5 sm:grid-cols-2">
            {HERO_HIGHLIGHTS.map((item) => (
              <FadeInItem
                key={item.title}
                as="div"
                className="group flex gap-4 rounded-2xl border border-border/50 bg-background/50 p-5 shadow-sm transition-all hover:border-primary/20 hover:bg-background hover:shadow-md"
              >
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <CircleCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </FadeIn>

        <FadeIn as="section" className="w-full lg:max-w-[480px]">
          <Card className="border-border/60 shadow-xl shadow-primary/5">
            <CardHeader className="space-y-1 pb-6 text-center">
              <CardTitle className="text-2xl">Welcome to Cohorts</CardTitle>
              <CardDescription className="text-base">
                {activeTab === "signup"
                  ? "Create an account to get started."
                  : "Sign in to access your dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0">
                  <FadeInStagger as="form" className="space-y-4" onSubmit={handleSubmit("signin")}>
                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="signInEmail">Email address</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </span>
                        <Input
                          id="signInEmail"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={signInData.email}
                          onChange={handleSignInChange}
                          placeholder="name@company.com"
                          className={cn("pl-9", emailError && activeTab === "signin" && "border-red-500 focus-visible:ring-red-500")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {emailError && activeTab === "signin" && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <CircleAlert className="h-3 w-3" />
                          {emailError}
                        </p>
                      )}
                    </FadeInItem>

                    <FadeInItem as="div" className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signInPassword">Password</Label>
                        <Link
                          href="/auth/forgot"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <Lock className="h-4 w-4" />
                        </span>
                        <Input
                          id="signInPassword"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={signInData.password}
                          onChange={handleSignInChange}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FadeInItem>

                    <FadeInItem as="div" className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isSubmitting}
                      />
                      <label
                        htmlFor="remember-me"
                        className="text-sm font-medium text-muted-foreground leading-none cursor-pointer select-none"
                      >
                        Remember me
                      </label>
                    </FadeInItem>

                    <Button className="w-full" size="lg" disabled={isSubmitting || isAuthLoading} type="submit">
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </FadeInStagger>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <FadeInStagger as="form" className="space-y-4" onSubmit={handleSubmit("signup")}>
                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="displayName">Full name</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          id="displayName"
                          name="displayName"
                          type="text"
                          value={signUpData.displayName}
                          onChange={handleSignUpChange}
                          placeholder="Jane Smith"
                          className="pl-9"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FadeInItem>

                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="signUpEmail">Email address</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </span>
                        <Input
                          id="signUpEmail"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={signUpData.email}
                          onChange={handleSignUpChange}
                          placeholder="name@company.com"
                          className={cn("pl-9", emailError && activeTab === "signup" && "border-red-500 focus-visible:ring-red-500")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {emailError && activeTab === "signup" && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <CircleAlert className="h-3 w-3" />
                          {emailError}
                        </p>
                      )}
                    </FadeInItem>

                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="signUpPassword">Password</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <Lock className="h-4 w-4" />
                        </span>
                        <Input
                          id="signUpPassword"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={signUpData.password}
                          onChange={handleSignUpChange}
                          placeholder="Create a strong password"
                          className="pl-9 pr-10"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>

                      {/* Password Strength Indicator */}
                      {signUpData.password.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <Shield className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Password strength:</span>
                            </div>
                            <span className={cn(
                              "font-medium",
                              passwordStrength.score <= 1 && "text-red-500",
                              passwordStrength.score === 2 && "text-orange-500",
                              passwordStrength.score === 3 && "text-emerald-500",
                              passwordStrength.score >= 4 && "text-emerald-600"
                            )}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-colors",
                                  level <= passwordStrength.score ? passwordStrength.color : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                            <PasswordRequirement met={passwordStrength.checks.length} label="At least 8 characters" />
                            <PasswordRequirement met={passwordStrength.checks.uppercase} label="Uppercase letter" />
                            <PasswordRequirement met={passwordStrength.checks.lowercase} label="Lowercase letter" />
                            <PasswordRequirement met={passwordStrength.checks.number} label="Number" />
                            <PasswordRequirement met={passwordStrength.checks.special} label="Special character" />
                          </div>
                        </div>
                      )}
                    </FadeInItem>

                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                          <Lock className="h-4 w-4" />
                        </span>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          required
                          value={signUpData.confirmPassword}
                          onChange={handleSignUpChange}
                          placeholder="Re-enter your password"
                          className={cn(
                            "pl-9 pr-10",
                            signUpData.confirmPassword.length > 0 && !passwordsMatch && "border-red-500 focus-visible:ring-red-500",
                            signUpData.confirmPassword.length > 0 && passwordsMatch && "border-emerald-500 focus-visible:ring-emerald-500"
                          )}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowConfirmPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {signUpData.confirmPassword.length > 0 && (
                        <p className={cn(
                          "text-xs flex items-center gap-1",
                          passwordsMatch ? "text-emerald-500" : "text-red-500"
                        )}>
                          {passwordsMatch ? (
                            <>
                              <Check className="h-3 w-3" />
                              Passwords match
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              Passwords do not match
                            </>
                          )}
                        </p>
                      )}
                    </FadeInItem>

                    <Button className="w-full" size="lg" disabled={isSubmitting || isAuthLoading} type="submit">
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </FadeInStagger>
                </TabsContent>
              </Tabs>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || isAuthLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secured with SSL encryption</span>
              </div>

              <p className="text-center text-xs text-muted-foreground px-6">
                By clicking continue, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}



