'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

    try {
      await resetPassword(email)
      setSuccess(true)
      toast({
        title: 'Check your inbox',
        description: 'If an account exists for this email, we sent password reset instructions.',
      })
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to send reset instructions. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <FadeIn as="div" className="mx-auto w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link 
          href="/auth" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        {!success ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FadeInStagger as="div" className="space-y-5">
              <FadeInItem as="div" className="space-y-2">
                <Label htmlFor="reset-email">Email address</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (emailError) setEmailError(null)
                    }}
                    placeholder="you@example.com"
                    className={cn("pl-9", emailError && "border-red-500 focus-visible:ring-red-500")}
                    disabled={submitting}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500">{emailError}</p>
                )}
              </FadeInItem>

              <FadeInItem as="div">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link…
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </FadeInItem>
            </FadeInStagger>
          </form>
        ) : (
          <FadeIn as="div" className="space-y-6">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Check your email</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a password reset link to<br />
                <span className="font-medium text-foreground">{email.trim()}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="font-medium text-primary hover:underline"
                >
                  try another email
                </button>
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://mail.google.com', '_blank')}
            >
              Open email app
            </Button>
          </FadeIn>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center text-xs text-muted-foreground">
          Remember your password?{' '}
          <Link href="/auth" className="font-medium text-primary hover:underline">
            Return to sign in
          </Link>
        </div>
      </FadeIn>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}
