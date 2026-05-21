'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { CircleCheck, LoaderCircle } from 'lucide-react'

import { authMailIconLg, authMailIconSm } from '@/features/auth/auth-icons'
import { AuthField, authInputClassName } from '@/features/auth/components/auth-field'
import { AuthPanel } from '@/features/auth/components/auth-panel'
import { AuthShell } from '@/features/auth/components/auth-shell'
import { useAuth } from '@/shared/contexts/auth-context'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { FadeIn, FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'
import { useToast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils'

const primaryButtonClassName = 'h-11 w-full rounded-full text-sm font-semibold shadow-sm'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setEmailError(null)

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (submitting) return

    setSubmitting(true)
    setSuccess(false)
    setError(null)

    void resetPassword(email)
      .then(() => {
        setSuccess(true)
        toast({
          title: 'Check your inbox',
          description: 'If an account exists for this email, we sent password reset instructions.',
        })
      })
      .catch((err: unknown) => {
        setError(getFriendlyAuthErrorMessage(err))
      })
      .finally(() => {
        setSubmitting(false)
      })
  }, [email, resetPassword, submitting, toast, validateEmail])

  const handleEmailChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
    setEmailError(null)
  }, [])

  const handleResetAnotherEmail = useCallback(() => {
    setSuccess(false)
  }, [])

  const handleOpenEmailApp = useCallback(() => {
    window.open('https://mail.google.com', '_blank')
  }, [])

  return (
    <BoneyardSkeletonBoundary name="auth-forgot-page" loading={false}>
      <AuthShell>
        <AuthPanel
          title="Forgot password?"
          description="Enter the email on your account and we'll send reset instructions."
          icon={authMailIconLg}
          footer={
            <>
              Remember your password?{' '}
              <Link href="/auth" className="font-medium text-primary hover:underline underline-offset-2">
                Return to sign in
              </Link>
            </>
          }
        >
          {!success ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <FadeInStagger as="div" className="space-y-5">
                <FadeInItem as="div">
                  <AuthField
                    id="reset-email"
                    label="Email address"
                    icon={authMailIconSm}
                    error={emailError}
                  >
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="you@company.com"
                      className={cn(
                        authInputClassName,
                        emailError && 'border-destructive focus-visible:ring-destructive/30',
                      )}
                      disabled={submitting}
                    />
                  </AuthField>
                </FadeInItem>

                <FadeInItem as="div">
                  <Button type="submit" className={primaryButtonClassName} disabled={submitting}>
                    {submitting ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Sending reset link…
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </Button>
                </FadeInItem>
              </FadeInStagger>
            </form>
          ) : (
            <FadeIn as="div" className="space-y-5">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <CircleCheck className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">Check your email</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  We sent a password reset link to
                  <br />
                  <span className="font-medium text-foreground">{email.trim()}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive it? Check spam or{' '}
                  <button
                    type="button"
                    onClick={handleResetAnotherEmail}
                    className="font-medium text-primary hover:underline underline-offset-2"
                  >
                    try another email
                  </button>
                </p>
              </div>

              <Button
                variant="outline"
                className="h-11 w-full rounded-full border-border/70"
                onClick={handleOpenEmailApp}
              >
                Open email app
              </Button>
            </FadeIn>
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </AuthPanel>
      </AuthShell>
    </BoneyardSkeletonBoundary>
  )
}

