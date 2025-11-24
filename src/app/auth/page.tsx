"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/ui/animate-in"
import { useToast } from "@/components/ui/use-toast"

const HERO_HIGHLIGHTS = [
  {
    title: "Unified client workspace",
    description:
      "Monitor pipeline, automations, and conversations without switching tools.",
  },
  {
    title: "AI-assisted proposals",
    description: "Draft tailored pitch decks with automated insights and instant Gamma exports.",
  },
  {
    title: "Automated reporting",
    description: "Ship branded campaign recaps and alerts effortlessly to your clients.",
  },
] as const

export default function AuthPage() {
  const TAB_STORAGE_KEY = "cohorts.auth.activeTab"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [signInData, setSignInData] = useState({ email: "", password: "" })
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  })
  const { user, signIn, signInWithGoogle, signUp, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const stored = window.localStorage.getItem(TAB_STORAGE_KEY)
      if (stored === "signin" || stored === "signup") {
        setActiveTab(stored)
      }
    } catch (error) {
      console.warn("[AuthPage] failed to hydrate tab selection", error)
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
      console.warn("[AuthPage] failed to persist tab selection", error)
    }
  }

  if (!loading && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground shadow-sm">
          Redirecting to your dashboard…
        </div>
      </div>
    )
  }

  const handleSubmit = (mode: "signin" | "signup") => async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      if (mode === "signup") {
        if (signUpData.password !== signUpData.confirmPassword) {
          toast({
            title: "Passwords do not match",
            description: "Please confirm your password and try again.",
            variant: "destructive",
          })
          return
        }

        await signUp({
          email: signUpData.email,
          password: signUpData.password,
          displayName: signUpData.displayName.trim() || undefined,
        })
        toast({
          title: "Account created",
          description: "Redirecting to your dashboard…",
        })
      } else {
        await signIn(signInData.email, signInData.password)
        toast({
          title: "Signed in",
          description: "Redirecting to your dashboard…",
        })
      }

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Authentication error",
        description: getErrorMessage(error, "Authentication failed. Please try again."),
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      toast({
        title: "Signed in with Google",
        description: "Redirecting to your dashboard…",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Google sign-in failed",
        description: getErrorMessage(error, "Google sign-in failed. Please try again."),
        variant: "destructive",
      })
    }
  }

  const handleSignInChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignInData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSignUpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }))
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
                  <CheckCircle2 className="h-5 w-5" />
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
                          className="pl-9"
                        />
                      </div>
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
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FadeInItem>

                    <Button className="w-full" size="lg" disabled={loading} type="submit">
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </FadeInStagger>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <FadeInStagger as="form" className="space-y-4" onSubmit={handleSubmit("signup")}>
                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="displayName">Full name</Label>
                      <Input
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={signUpData.displayName}
                        onChange={handleSignUpChange}
                        placeholder="Jane Smith"
                      />
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
                          className="pl-9"
                        />
                      </div>
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
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FadeInItem>

                    <FadeInItem as="div" className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={signUpData.confirmPassword}
                        onChange={handleSignUpChange}
                        placeholder="Re-enter your password"
                      />
                    </FadeInItem>

                    <Button className="w-full" size="lg" disabled={loading} type="submit">
                      {loading ? "Creating account..." : "Create Account"}
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

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {loading ? "Signing in..." : "Google"}
              </Button>

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

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}
