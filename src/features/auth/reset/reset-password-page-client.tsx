'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Shield, Check, X, LoaderCircle, CircleCheck } from 'lucide-react'

import { authLockIconLg, authLockIconSm } from '@/features/auth/auth-icons'
import { AuthField, authInputClassName } from '@/features/auth/components/auth-field'
import { AuthPanel } from '@/features/auth/components/auth-panel'
import { AuthShell } from '@/features/auth/components/auth-shell'
import { useAuth } from '@/shared/contexts/auth-context'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { FadeIn, FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { useToast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils'

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
    color = "bg-destructive"
  } else if (passedChecks === 2) {
    score = 2
    label = "Fair"
    color = "bg-warning"
  } else if (passedChecks === 3) {
    score = 3
    label = "Good"
    color = "bg-warning"
  } else if (passedChecks === 4) {
    score = 3
    label = "Strong"
    color = "bg-success"
  } else {
    score = 4
    label = "Very Strong"
    color = "bg-success"
  }

  return { score, label, color, checks }
}

// Password requirement component
function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="size-3 text-success" />
      ) : (
        <X className="size-3 text-muted-foreground" />
      )}
      <span className={cn(met ? "text-success" : "text-muted-foreground")}>{label}</span>
    </div>
  )
}

type ResetPasswordPageClientProps = {
  oobCode?: string | null
}

type VerificationStatus = 'loading' | 'ready' | 'success' | 'error'

type VerificationState = {
  status: VerificationStatus
  email: string | null
  verificationError: string | null
}

type VerificationAction =
  | { type: 'missing-token' }
  | { type: 'verified'; email: string }
  | { type: 'failed'; error: string }
  | { type: 'success' }

const initialVerificationState: VerificationState = {
  status: 'loading',
  email: null,
  verificationError: null,
}

const primaryButtonClassName = 'h-11 w-full rounded-full text-sm font-semibold shadow-sm'

function ResetPasswordFixture() {
  return (
    <AuthShell>
      <AuthPanel
        title="Set new password"
        description="Your new password must be different from your previous password."
        icon={authLockIconLg}
      >
      <form className="space-y-5">
        <FadeInStagger as="div" className="space-y-5">
          <FadeInItem as="div">
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Resetting password for <span className="font-medium text-foreground">alex@northstar.studio</span>
              </p>
            </div>
          </FadeInItem>

          <FadeInItem as="div" className="space-y-2">
            <Label htmlFor="fixture-new-password">New password</Label>
            <Input
              id="fixture-new-password"
              type="password"
              autoComplete="new-password"
              value="SamplePass123!"
              readOnly
            />
          </FadeInItem>

          <FadeInItem as="div" className="space-y-2">
            <Label htmlFor="fixture-confirm-password">Confirm new password</Label>
            <Input
              id="fixture-confirm-password"
              type="password"
              autoComplete="new-password"
              value="SamplePass123!"
              readOnly
            />
            <p className="flex items-center gap-1 text-xs text-success">
              <Check className="size-3" />
              Passwords match
            </p>
          </FadeInItem>

          <FadeInItem as="div">
            <Button type="button" className="w-full">
              Reset password
            </Button>
          </FadeInItem>
        </FadeInStagger>
      </form>
      </AuthPanel>
    </AuthShell>
  )
}

type ResetPasswordFormState = {
  newPassword: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  formError: string | null
  submitting: boolean
}

type ResetPasswordFormAction =
  | { type: 'setNewPassword'; value: string }
  | { type: 'setConfirmPassword'; value: string }
  | { type: 'toggleShowPassword' }
  | { type: 'toggleShowConfirmPassword' }
  | { type: 'setFormError'; value: string | null }
  | { type: 'setSubmitting'; value: boolean }
  | { type: 'startSubmit' }

const initialResetPasswordFormState: ResetPasswordFormState = {
  newPassword: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
  formError: null,
  submitting: false,
}

function resetPasswordFormReducer(
  state: ResetPasswordFormState,
  action: ResetPasswordFormAction,
): ResetPasswordFormState {
  switch (action.type) {
    case 'setNewPassword':
      return { ...state, newPassword: action.value }
    case 'setConfirmPassword':
      return { ...state, confirmPassword: action.value }
    case 'toggleShowPassword':
      return { ...state, showPassword: !state.showPassword }
    case 'toggleShowConfirmPassword':
      return { ...state, showConfirmPassword: !state.showConfirmPassword }
    case 'setFormError':
      return { ...state, formError: action.value }
    case 'setSubmitting':
      return { ...state, submitting: action.value }
    case 'startSubmit':
      return { ...state, submitting: true, formError: null }
    default:
      return state
  }
}

function verificationReducer(state: VerificationState, action: VerificationAction): VerificationState {
  switch (action.type) {
    case 'missing-token':
      return {
        status: 'error',
        email: null,
        verificationError: 'Missing reset token. Please request a new password reset email.',
      }
    case 'verified':
      return {
        status: 'ready',
        email: action.email,
        verificationError: null,
      }
    case 'failed':
      return {
        status: 'error',
        email: null,
        verificationError: action.error,
      }
    case 'success':
      return {
        ...state,
        status: 'success',
      }
    default:
      return state
  }
}

function ResetPasswordContent({ oobCode }: ResetPasswordPageClientProps) {
  const { push } = useRouter()
  const { toast } = useToast()
  const { verifyPasswordResetCode, confirmPasswordReset } = useAuth()
  const [verificationState, dispatchVerification] = useReducer(verificationReducer, initialVerificationState)
  const [formState, dispatchForm] = useReducer(resetPasswordFormReducer, initialResetPasswordFormState)
  const { newPassword, confirmPassword, showPassword, showConfirmPassword, formError, submitting } = formState

  // Calculate password strength
  const passwordStrength = calculatePasswordStrength(newPassword)

  // Check if passwords match
  const passwordsMatch = newPassword === confirmPassword

  useEffect(() => {
    if (!oobCode) {
      dispatchVerification({ type: 'missing-token' })
      return
    }

    let active = true

    verifyPasswordResetCode(oobCode)
      .then((verifiedEmail) => {
        if (!active) return
        dispatchVerification({ type: 'verified', email: verifiedEmail })
      })
      .catch((error: unknown) => {
        if (!active) return
        dispatchVerification({
          type: 'failed',
          error: getFriendlyAuthErrorMessage(error),
        })
      })

    return () => {
      active = false
    }
  }, [oobCode, verifyPasswordResetCode])

  const handleReturnToSignIn = useCallback(() => {
    push('/auth')
  }, [push])

  const handleNewPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({ type: 'setNewPassword', value: event.target.value })
  }, [])

  const handleConfirmPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({ type: 'setConfirmPassword', value: event.target.value })
  }, [])

  const handleToggleShowPassword = useCallback(() => {
    dispatchForm({ type: 'toggleShowPassword' })
  }, [])

  const handleToggleShowConfirmPassword = useCallback(() => {
    dispatchForm({ type: 'toggleShowConfirmPassword' })
  }, [])

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!oobCode || submitting) {
        return
      }

      // Validate password strength
      if (passwordStrength.score < 2) {
        dispatchForm({ type: 'setFormError', value: 'Please create a stronger password with at least 8 characters.' })
        return
      }

      if (newPassword !== confirmPassword) {
        dispatchForm({ type: 'setFormError', value: 'Passwords do not match.' })
        return
      }

      dispatchForm({ type: 'startSubmit' })

      void confirmPasswordReset(oobCode, newPassword)
        .then(() => {
          dispatchVerification({ type: 'success' })
          toast({
            title: 'Password updated',
            description: 'You can now sign in with your new password.',
          })
        })
        .catch((error: unknown) => {
          dispatchForm({ type: 'setFormError', value: getFriendlyAuthErrorMessage(error) })
        })
        .finally(() => {
          dispatchForm({ type: 'setSubmitting', value: false })
        })
    },
    [confirmPassword, confirmPasswordReset, newPassword, oobCode, passwordStrength.score, submitting, toast],
  )

  const { status, email, verificationError } = verificationState
  const fixtureContent = useMemo(() => <ResetPasswordFixture />, [])

  return (
    <BoneyardSkeletonBoundary
      name="auth-reset-page"
      loading={status === 'loading'}
      fixture={fixtureContent}
    >
      <AuthShell>
        <AuthPanel
          title="Set new password"
          description="Choose a strong password you have not used on this account before."
          icon={authLockIconLg}
        >
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden />
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
          <Button asChild className={primaryButtonClassName}>
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
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Resetting password for <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </FadeInItem>
            )}

            <FadeInItem as="div">
              <AuthField id="new-password" label="New password" icon={authLockIconSm}>
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  placeholder="Enter a new password"
                  className={cn(authInputClassName, 'pr-11')}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground"
                  onClick={handleToggleShowPassword}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={submitting}
                >
                  {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </Button>
              </AuthField>

              {newPassword.length > 0 && (
                <div className="mt-3 space-y-2 rounded-2xl border border-border/50 bg-muted/25 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Shield className="size-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Password strength:</span>
                    </div>
                    <span className={cn(
                      "font-medium",
                      passwordStrength.score <= 1 && "text-destructive",
                      passwordStrength.score === 2 && "text-warning",
                      passwordStrength.score === 3 && "text-success",
                      passwordStrength.score >= 4 && "text-success"
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

            <FadeInItem as="div">
              <AuthField id="confirm-password" label="Confirm new password" icon={authLockIconSm}>
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Re-enter your new password"
                  className={cn(
                    authInputClassName,
                    'pr-11',
                    confirmPassword.length > 0 && !passwordsMatch && 'border-destructive focus-visible:ring-destructive/30',
                    confirmPassword.length > 0 && passwordsMatch && 'border-success focus-visible:ring-success/30',
                  )}
                  disabled={submitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground"
                  onClick={handleToggleShowConfirmPassword}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={submitting}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                </Button>
              </AuthField>
              {confirmPassword.length > 0 && (
                <p
                  className={cn(
                    'mt-2 flex items-center gap-1.5 text-xs',
                    passwordsMatch ? 'text-success' : 'text-destructive',
                  )}
                >
                  {passwordsMatch ? (
                    <>
                      <Check className="size-3.5 shrink-0" aria-hidden />
                      Passwords match
                    </>
                  ) : (
                    <>
                      <X className="size-3.5 shrink-0" aria-hidden />
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
              <Button type="submit" className={primaryButtonClassName} disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
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
        <FadeIn as="div" className="space-y-5">
          <div className="rounded-2xl border border-success/20 bg-success/10 p-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
              <CircleCheck className="size-6" aria-hidden />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">Password reset successful</h3>
            <p className="text-sm text-muted-foreground">
              Your password has been updated. Sign in with your new credentials.
            </p>
          </div>

          <Button className={primaryButtonClassName} onClick={handleReturnToSignIn}>
            Continue to sign in
          </Button>
        </FadeIn>
      )}
        </AuthPanel>
      </AuthShell>
    </BoneyardSkeletonBoundary>
  )
}

export default function ResetPasswordPageClient({ oobCode = null }: ResetPasswordPageClientProps) {
  return <ResetPasswordContent oobCode={oobCode} />
}
