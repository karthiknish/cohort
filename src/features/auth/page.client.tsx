'use client'

import Link from 'next/link'
import { ArrowLeft, LayoutDashboard, LoaderCircle, Mic2, ShieldCheck, Sparkles } from 'lucide-react'
import { useRouter, redirect } from 'next/navigation'
import { Suspense, useCallback, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { AuthCard } from '@/features/auth/components/auth-card'
import { bootstrapAndSyncSession, calculatePasswordStrength } from '@/features/auth/auth-utils'
import { HeroBackground } from '@/features/marketing/home/components/hero-background'
import { authClient } from '@/lib/auth-client'
import { getSafeRedirectPath } from '@/lib/utils'
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils'
import { FadeIn, FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'
import { useToast } from '@/shared/ui/use-toast'

const TAB_STORAGE_KEY = 'cohorts.auth.activeTab'
const REMEMBER_ME_KEY = 'cohorts.auth.rememberMe'
const AUTH_PAGE_FALLBACK = (
  <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
    <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
  </div>
)

const AUTH_VALUE_PROPS = [
  {
    id: 'campaigns',
    Icon: LayoutDashboard,
    title: 'Run every client account in one place',
    description: 'Campaigns, reporting, proposals, and delivery workflows stay in one shared system.',
  },
  {
    id: 'agents',
    Icon: Sparkles,
    title: 'Use AI where the work actually happens',
    description: 'Draft proposals, summarize meetings, and surface risks without jumping between tools.',
  },
  {
    id: 'security',
    Icon: ShieldCheck,
    title: 'Built for teams, clients, and permissions',
    description: 'Role-based access keeps internal operations and client visibility clearly separated.',
  },
] as const

function getInitialTab(): 'signin' | 'signup' {
  if (typeof window === 'undefined') {
    return 'signin'
  }

  const queryTab = new URLSearchParams(window.location.search).get('tab')
  if (queryTab === 'signup') {
    return 'signup'
  }
  if (queryTab === 'signin') {
    return 'signin'
  }

  const stored = window.localStorage.getItem(TAB_STORAGE_KEY)
  return stored === 'signup' ? 'signup' : 'signin'
}

function resolveDashboardDestination(): string {
  if (typeof window !== 'undefined') {
    const lastTab = window.localStorage.getItem('cohorts_last_tab')
    if (lastTab?.startsWith('/dashboard')) {
      return lastTab
    }
  }

  return '/dashboard'
}

function HomeAuthPageContent() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(getInitialTab)
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
      return { email: '', password: '' }
    }

    const rememberedEmail = window.localStorage.getItem(REMEMBER_ME_KEY) ?? ''
    return { email: rememberedEmail, password: '' }
  })
  const [signUpData, setSignUpData] = useState(() => ({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
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

    return getSafeRedirectPath(new URLSearchParams(window.location.search).get('redirect'))
  }, [])

  const resolvePostAuthDestination = useCallback(() => {
    const redirectParam = getRedirectParam()
    if (redirectParam) {
      return redirectParam
    }

    return resolveDashboardDestination()
  }, [getRedirectParam])

  const isAuthLoading = loading
  const passwordStrength = useMemo(() => calculatePasswordStrength(signUpData.password), [signUpData.password])
  const passwordsMatch = signUpData.password === signUpData.confirmPassword

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleTabChange = useCallback((value: string) => {
    const nextTab = value === 'signup' ? 'signup' : 'signin'
    setActiveTab(nextTab)

    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(TAB_STORAGE_KEY, nextTab)
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set('tab', nextTab)
      window.history.replaceState(null, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
    } catch (error) {
      console.warn('[AuthPage] failed to persist tab selection', error)
    }
  }, [])

  const authenticatedDestination = !loading && user ? resolvePostAuthDestination() : null

  if (authenticatedDestination) {
    redirect(authenticatedDestination)
  }

  const handleSubmit = useCallback(
    (mode: 'signin' | 'signup') => async (event: FormEvent) => {
      event.preventDefault()
      setIsSubmitting(true)
      setEmailError(null)

      await Promise.resolve()
        .then(async () => {
          if (mode === 'signup') {
            if (!validateEmail(signUpData.email)) {
              setEmailError('Please enter a valid email address')
              return
            }

            if (passwordStrength.score < 2) {
              toast({
                title: 'Password needs work',
                description: 'Create a stronger password with at least 8 characters, including letters and numbers.',
                variant: 'destructive',
              })
              return
            }

            if (signUpData.password !== signUpData.confirmPassword) {
              toast({
                title: 'Passwords don\'t match',
                description: 'Please make sure both passwords are identical.',
                variant: 'destructive',
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
              title: 'Welcome to Cohorts!',
              description: 'Your account has been created. Taking you to your dashboard...',
            })
          } else {
            if (!validateEmail(signInData.email)) {
              setEmailError('Please enter a valid email address')
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

            if (rememberMe && typeof window !== 'undefined') {
              window.localStorage.setItem(REMEMBER_ME_KEY, signInData.email)
            } else if (typeof window !== 'undefined') {
              window.localStorage.removeItem(REMEMBER_ME_KEY)
            }

            toast({
              title: 'Welcome back!',
              description: 'Signed in successfully. Loading your workspace...',
            })
          }

          router.push(resolvePostAuthDestination())
        })
        .catch((error) => {
          toast({
            title: mode === 'signin' ? 'Sign in failed' : 'Sign up failed',
            description: getFriendlyAuthErrorMessage(error),
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [passwordStrength.score, rememberMe, resolvePostAuthDestination, router, signInData, signUpData, toast],
  )

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true)

    await authClient.signIn.social({ provider: 'google' })
      .then(async () => {
        await authClient.getSession().catch(() => null)
        await Promise.all([
          authClient.getSession().catch(() => null),
          bootstrapAndSyncSession(),
        ])
      })
      .catch((error) => {
        toast({
          title: 'Google sign-in failed',
          description: getFriendlyAuthErrorMessage(error),
          variant: 'destructive',
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

    if (name === 'email' && emailError) {
      setEmailError(null)
    }
  }, [emailError])

  const handleSignUpChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSignUpData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (name === 'email' && emailError) {
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

  const handleSubmitSignIn = useCallback((event: FormEvent) => {
    void handleSubmit('signin')(event)
  }, [handleSubmit])

  const handleSubmitSignUp = useCallback((event: FormEvent) => {
    void handleSubmit('signup')(event)
  }, [handleSubmit])

  return (
    <div className="relative min-h-screen overflow-hidden bg-primary px-6 py-10">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center">
        <div className="grid w-full gap-10 py-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <FadeIn as="section" className="text-white">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mt-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
              <Mic2 className="mr-2 h-4 w-4" />
              Secure access for teams and clients
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Start or return to your agency workspace
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Sign in or create your Cohorts account to run campaigns, proposals, meetings, and client delivery from one AI-native workspace.
            </p>

            <FadeInStagger as="div" className="mt-10 grid gap-4 sm:grid-cols-3">
              {AUTH_VALUE_PROPS.map((item) => (
                <FadeInItem
                  key={item.id}
                  as="div"
                  className="rounded-2xl border border-white/15 bg-white/8 p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/12">
                    <item.Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{item.description}</p>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </FadeIn>

          <div className="mx-auto w-full max-w-120 lg:justify-self-end">
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
        </div>
      </div>
    </div>
  )
}

export default function AuthPageClient() {
  return <Suspense fallback={AUTH_PAGE_FALLBACK}><HomeAuthPageContent /></Suspense>
}