'use client'

import { LoaderCircle } from 'lucide-react'
import { useRouter, redirect } from 'next/navigation'
import { Suspense, useCallback, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { AuthCard } from '@/features/auth/components/auth-card'
import { AuthPageSkeleton } from '@/features/auth/components/auth-page-skeleton'
import { bootstrapAndSyncSession, calculatePasswordStrength } from '@/features/auth/auth-utils'
import { authClient } from '@/lib/auth-client'
import { getSafeRedirectPath } from '@/lib/utils'
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'
import { useToast } from '@/shared/ui/use-toast'

const TAB_STORAGE_KEY = 'cohorts.auth.activeTab'
const REMEMBER_ME_KEY = 'cohorts.auth.rememberMe'
const AUTH_PAGE_FALLBACK = (
  <RevealTransitionFallback>
    <AuthPageSkeleton />
  </RevealTransitionFallback>
)
const FIXTURE_PASSWORD_STRENGTH = {
  score: 3,
  label: 'Strong',
  color: 'bg-success',
  checks: {
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
    special: false,
  },
} as const
const FIXTURE_SIGN_IN_DATA = { email: 'alex@northstar.studio', password: 'password123' } as const
const FIXTURE_SIGN_UP_DATA = {
  email: 'alex@northstar.studio',
  password: 'SamplePass123',
  confirmPassword: 'SamplePass123',
  displayName: 'Alex Morgan',
} as const

function noop() {}

function preventDefault(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}

function AuthPageFixture() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <div className="w-full max-w-120">
        <AuthCard
          activeTab="signin"
          emailError={null}
          isSubmitting={false}
          isAuthLoading={false}
          rememberMe={true}
          showPassword={false}
          showConfirmPassword={false}
          passwordsMatch={true}
          signInData={FIXTURE_SIGN_IN_DATA}
          signUpData={FIXTURE_SIGN_UP_DATA}
          passwordStrength={FIXTURE_PASSWORD_STRENGTH}
          onTabChange={noop}
          onRememberMeChange={noop}
          onToggleShowPassword={noop}
          onToggleShowConfirmPassword={noop}
          onSignInChange={noop}
          onSignUpChange={noop}
          onSubmitSignIn={preventDefault}
          onSubmitSignUp={preventDefault}
          onGoogleSignIn={noop}
        />
      </div>
    </div>
  )
}

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
  const loadingContent = useMemo(() => <AuthPageSkeleton />, [])
  const fixtureContent = useMemo(() => <AuthPageFixture />, [])
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
    <RevealTransition>
      <BoneyardSkeletonBoundary
        name="auth-main-page"
        loading={isAuthLoading && !user}
        loadingContent={loadingContent}
        fixture={fixtureContent}
      >
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
          <div className="w-full max-w-120">
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
      </BoneyardSkeletonBoundary>
    </RevealTransition>
  )
}

export default function AuthPageClient() {
  return <Suspense fallback={AUTH_PAGE_FALLBACK}><HomeAuthPageContent /></Suspense>
}