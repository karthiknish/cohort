"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
        <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600 shadow-sm">
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
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-20">
        <FadeIn as="section" className="w-full max-w-2xl space-y-8 text-zinc-900">
       

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Run every client engagement from a single modern workspace.
            </h1>
            <p className="max-w-xl text-base text-zinc-600">
              Streamline onboarding, proposals, performance snapshots, and feedback loops with a platform designed
              for agencies that need to move fast.
            </p>
          </div>

          <FadeInStagger className="grid gap-4 sm:grid-cols-2">
            {HERO_HIGHLIGHTS.map((item) => (
              <FadeInItem
                key={item.title}
                as="div"
                className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm"
              >
                <div className="mt-1 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="text-xs text-zinc-600">{item.description}</p>
                </div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </FadeIn>

        <FadeIn as="section" className="w-full lg:max-w-xl">
          <div className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-semibold text-zinc-900">Welcome back</h2>
              <p className="text-sm text-zinc-600">
                {activeTab === "signup"
                  ? "Create an account to launch proposals, automate reporting, and collaborate with your clients."
                  : "Sign in to access live insights across campaigns, proposals, and collaboration threads."}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
                <TabsTrigger
                  value="signin"
                  className="flex items-center justify-center rounded-md border border-transparent text-sm font-medium text-zinc-600 transition data-[state=active]:border-zinc-900 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex items-center justify-center rounded-md border border-transparent text-sm font-medium text-zinc-600 transition data-[state=active]:border-zinc-900 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <FadeInStagger as="form" className="space-y-5" onSubmit={handleSubmit("signin")}>
                  <FadeInItem as="div" className="space-y-2">
                    <Label htmlFor="signInEmail" className="text-zinc-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
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
                        placeholder="you@example.com"
                        className="border-zinc-300 bg-white pl-9 text-zinc-900 placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary"
                      />
                    </div>
                  </FadeInItem>

                  <FadeInItem as="div" className="space-y-2">
                    <Label htmlFor="signInPassword" className="text-zinc-700">
                      Password
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
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
                        className="border-zinc-300 bg-white pl-9 pr-10 text-zinc-900 placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute inset-y-0 right-1 text-zinc-500 hover:text-zinc-800"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FadeInItem>

                  <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800" disabled={loading} type="submit">
                    {loading ? "Please wait…" : "Sign In"}
                  </Button>
                  <div className="text-center text-xs text-zinc-500">
                    <Link href="/auth/forgot" className="font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </FadeInStagger>
              </TabsContent>

              <TabsContent value="signup">
                <FadeInStagger as="form" className="space-y-5" onSubmit={handleSubmit("signup")}>
                  <FadeInItem as="div" className="space-y-2">
                    <Label htmlFor="displayName" className="text-zinc-700">
                      Full name (optional)
                    </Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={signUpData.displayName}
                      onChange={handleSignUpChange}
                      placeholder="Jane Smith"
                      className="border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary"
                    />
                  </FadeInItem>

                  <FadeInItem as="div" className="space-y-2">
                    <Label htmlFor="signUpEmail" className="text-zinc-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
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
                        placeholder="you@example.com"
                        className="border-zinc-300 bg-white pl-9 text-zinc-900 placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary"
                      />
                    </div>
                  </FadeInItem>

                  <FadeInItem as="div" className="space-y-2">
                    <Label htmlFor="signUpPassword" className="text-zinc-700">
                      Password
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
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
                        className="border-zinc-300 bg-white pl-9 pr-10 text-zinc-900 placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute inset-y-0 right-1 text-zinc-500 hover:text-zinc-800"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FadeInItem>

                  <FadeInItem as="div" className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-zinc-700">
                      Confirm password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      placeholder="Re-enter your password"
                      className="border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-primary"
                    />
                  </FadeInItem>

                  <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800" disabled={loading} type="submit">
                    {loading ? "Please wait…" : "Create Account"}
                  </Button>
                </FadeInStagger>
              </TabsContent>
            </Tabs>

            <FadeInStagger className="space-y-4">
              <FadeInItem as="div" className="relative flex items-center gap-3">
                <Separator className="flex-1 border-zinc-200" />
                <span className="text-xs uppercase tracking-wider text-zinc-500">Or continue with</span>
                <Separator className="flex-1 border-zinc-200" />
              </FadeInItem>

              <FadeInItem>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {loading ? "Signing in…" : "Continue with Google"}
                </Button>
              </FadeInItem>

              <FadeInItem>
                <p className="text-center text-xs text-zinc-500">
                  You can link your advertising accounts separately from the dashboard once you are signed in.
                </p>
              </FadeInItem>
            </FadeInStagger>

            <p className="text-center text-xs text-zinc-500">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="font-medium text-primary hover:underline">
                Terms of Service
              </Link>
              ,{" "}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>
              , and{" "}
              <Link href="/cookies" className="font-medium text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </div>
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
