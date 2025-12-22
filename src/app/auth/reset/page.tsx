'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, ArrowLeft, Shield, Check, X, Loader2, CheckCircle } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Calculate password strength
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(newPassword),
    [newPassword]
  )

  // Check if passwords match
  const passwordsMatch = useMemo(
    () => newPassword === confirmPassword,
    [newPassword, confirmPassword]
  )

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

    // Validate password strength
    if (passwordStrength.score < 2) {
      setFormError('Please create a stronger password with at least 8 characters.')
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
    router.push('/')
  }

  return (
    <FadeIn as="div" className="mx-auto w-full max-w-md space-y-6">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Your new password must be different from your previous password.
        </p>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTitle>Reset link problem</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{verificationError ?? 'This reset link is invalid or has expired.'}</p>
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/auth/forgot">
              Request a new reset link
            </Link>
          </Button>
        </div>
      )}

      {status === 'ready' && (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FadeInStagger as="div" className="space-y-5">
            {email && (
              <FadeInItem as="div">
                <div className="rounded-lg border bg-muted/50 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Resetting password for <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
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
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
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
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your new password"
                  className={cn(
                    "pl-9 pr-10",
                    confirmPassword.length > 0 && !passwordsMatch && "border-red-500 focus-visible:ring-red-500",
                    confirmPassword.length > 0 && passwordsMatch && "border-emerald-500 focus-visible:ring-emerald-500"
                  )}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={submitting}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword.length > 0 && (
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
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password…
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>
            </FadeInItem>
          </FadeInStagger>
        </form>
      )}

      {status === 'success' && (
        <FadeIn as="div" className="space-y-6">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Password reset successful</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
          </div>

          <Button className="w-full" onClick={handleReturnToSignIn}>
            Continue to sign in
          </Button>
        </FadeIn>
      )}
    </FadeIn>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Suspense
        fallback={
          <FadeIn as="div" className="mx-auto w-full max-w-md space-y-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading reset page…</p>
            </div>
          </FadeIn>
        }
      >
        <ResetPasswordContent />
      </Suspense>
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
