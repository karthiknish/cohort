'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useToast } from '@/components/ui/use-toast'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { verifyPasswordResetCode, confirmPasswordReset } = useAuth()

  const oobCode = searchParams.get('oobCode')
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setVerificationError('Missing reset token. Please request a new password reset email.')
      setStatus('error')
      return
    }

    let active = true

    verifyPasswordResetCode(oobCode)
      .then((verifiedEmail) => {
        if (!active) return
        setEmail(verifiedEmail)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        setVerificationError(getErrorMessage(error, 'Unable to validate this reset link. Please request a new one.'))
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [oobCode, verifyPasswordResetCode])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!oobCode || submitting) {
      return
    }

    if (newPassword.trim().length < 6) {
      setFormError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      await confirmPasswordReset(oobCode, newPassword)
      setStatus('success')
      toast({
        title: 'Password updated',
        description: 'You can now sign in with your new password.',
      })
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, 'Unable to update your password. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturnToSignIn = () => {
    router.push('/auth')
  }

  return (
    <FadeIn as="div" className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      {status === 'loading' && (
        <Alert>
          <AlertTitle>Verifying reset link…</AlertTitle>
          <AlertDescription>Please hold on while we confirm your request.</AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertTitle>Reset link problem</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{verificationError ?? 'This reset link is invalid or has expired.'}</p>
            <p>
              Need a new link?{' '}
              <Link href="/auth/forgot" className="font-medium underline underline-offset-2">
                Request another reset email
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      )}

      {status === 'ready' && (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FadeInStagger as="div" className="space-y-5">
            {email && (
              <FadeInItem as="div">
                <Alert>
                  <AlertTitle>Resetting password</AlertTitle>
                  <AlertDescription>
                    We validated your request for <span className="font-semibold">{email}</span>.
                  </AlertDescription>
                </Alert>
              </FadeInItem>
            )}

            <FadeInItem as="div" className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter a new password"
                  className="pl-9 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-y-0 right-1"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </FadeInItem>

            <FadeInItem as="div" className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
              />
            </FadeInItem>

            {formError && (
              <FadeInItem as="div">
                <Alert variant="destructive">
                  <AlertTitle>Update failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              </FadeInItem>
            )}

            <FadeInItem as="div">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Updating password…' : 'Update password'}
              </Button>
            </FadeInItem>
          </FadeInStagger>
        </form>
      )}

      {status === 'success' && (
        <Alert>
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your password has been updated successfully.</p>
            <Button type="button" variant="link" className="px-0" onClick={handleReturnToSignIn}>
              Return to sign in
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </FadeIn>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <FadeIn as="div" className="mx-auto max-w-md space-y-6">
          <Alert>
            <AlertTitle>Loading reset link…</AlertTitle>
            <AlertDescription>Preparing your password reset request.</AlertDescription>
          </Alert>
        </FadeIn>
      }
    >
      <ResetPasswordContent />
    </Suspense>
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
