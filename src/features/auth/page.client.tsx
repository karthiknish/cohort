'use client'

import { notifyFailure } from '@/lib/notifications'
import { LoaderCircle } from 'lucide-react'
import { useRouter, redirect } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { AuthCard } from '@/features/auth/components/auth-card'
import { AuthPageSkeleton } from '@/features/auth/components/auth-page-skeleton'
import { calculatePasswordStrength, startGoogleOAuthSignIn } from '@/features/auth/auth-utils'
import { authClient } from '@/lib/auth-client'
import { logError } from '@/lib/convex-errors'
import { getSafeRedirectPath } from '@/lib/utils'
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { RevealTransition, RevealTransitionFallback } from '@/shared/ui/page-transition'
import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'

const TAB_STORAGE_KEY = 'cohorts.auth.activeTab'
const REMEMBER_ME_KEY = 'cohorts.auth.rememberMe'
const AUTH_PAGE_FALLBACK = (
  <RevealTransitionFallback>
    <AuthPageSkeleton />
  </RevealTransitionFallback>
)

function preventDefault(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
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
    if (lastTab === '/for-you' || lastTab?.startsWith('/for-you')) {
      return '/for-you'
    }
    if (lastTab?.startsWith('/dashboard')) {
      return lastTab
    }
  }

  return '/for-you'
}

function HomeAuthPageContent() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [signInData, setSignInData] = useState({ email: '', password: '' })
  const [signUpData, setSignUpData] = useState(() => ({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  }))

  const { data: session, isPending: sessionPending } = authClient.useSession()
  const user = session?.user ?? null
  const loading = sessionPending
  const { push } = useRouter()
  const { toast } = useToast()
  const { signIn, signUp } = useAuth()

  useEffect(() => {
    setActiveTab(getInitialTab())
    setRememberMe(Boolean(window.localStorage.getItem(REMEMBER_ME_KEY)))
    setSignInData({
      email: window.localStorage.getItem(REMEMBER_ME_KEY) ?? '',
      password: '',
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const oauthError = params.get('error')
    if (!oauthError) return

    notifyFailure({
      title: 'Google sign-in failed',
      message: getFriendlyAuthErrorMessage(oauthError),
    })

    params.delete('error')
    params.delete('error_description')
    const nextQuery = params.toString()
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`
    window.history.replaceState(null, '', nextUrl)
  }, [toast])

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
      logError(error, 'AuthPage:persistTab')
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
              notifyFailure({
        title: 'Password needs work',
        message: 'Create a stronger password with at least 8 characters, including letters and numbers.',
      })
              return
            }

            if (signUpData.password !== signUpData.confirmPassword) {
              notifyFailure({
                title: "Passwords don't match",
                message: 'Please make sure both passwords are identical.',
              })
              return
            }

            const signedUpUser = await signUp({
              email: signUpData.email,
              password: signUpData.password,
              displayName: signUpData.displayName.trim() || signUpData.email,
            })

            toast({
              title: 'Welcome to Cohorts!',
              description: 'Your account has been created. Taking you to your workspace...',
            })

            if (signedUpUser.status === 'pending' || signedUpUser.status === 'invited') {
              push('/pending-approval')
              return
            }
          } else {
            if (!validateEmail(signInData.email)) {
              setEmailError('Please enter a valid email address')
              return
            }

            const signedInUser = await signIn(signInData.email, signInData.password)

            if (rememberMe && typeof window !== 'undefined') {
              window.localStorage.setItem(REMEMBER_ME_KEY, signInData.email)
            } else if (typeof window !== 'undefined') {
              window.localStorage.removeItem(REMEMBER_ME_KEY)
            }

            toast({
              title: 'Welcome back!',
              description: 'Signed in successfully. Loading your workspace...',
            })

            if (signedInUser.status === 'pending' || signedInUser.status === 'invited') {
              push('/pending-approval')
              return
            }
          }

          push(resolvePostAuthDestination())
        })
        .catch((error) => {
          notifyFailure({
            error,
            fallbackMessage: 'Sign in failed. Please try again.',
          })
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [passwordStrength.score, rememberMe, resolvePostAuthDestination, push, signIn, signInData, signUp, signUpData, toast],
  )

  const handleGoogleSignIn = useCallback(async () => {
    setIsSubmitting(true)

    try {
      await startGoogleOAuthSignIn(resolvePostAuthDestination())
      // Browser redirects to Google on success; do not clear loading state here.
    } catch (error) {
      toast({
        title: 'Google sign-in failed',
        description: getFriendlyAuthErrorMessage(error),
      })
      setIsSubmitting(false)
    }
  }, [resolvePostAuthDestination, toast])

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
      >
        <div className="flex min-h-dvh flex-1 items-center justify-center px-6 py-12 sm:py-16">
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