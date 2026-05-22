'use client'

import { useMemo } from 'react'

import { authLockIconLg } from '@/features/auth/auth-icons'
import { AuthPanel } from '@/features/auth/components/auth-panel'
import { AuthShell } from '@/features/auth/components/auth-shell'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'

import {
  ResetPasswordErrorState,
  ResetPasswordFixture,
  ResetPasswordLoadingState,
  ResetPasswordReadyForm,
  ResetPasswordSuccessState,
} from './reset-password-sections'
import type { ResetPasswordPageClientProps } from './reset-password-types'
import { useResetPassword } from './use-reset-password'

function ResetPasswordContent({ oobCode }: ResetPasswordPageClientProps) {
  const {
    verificationState,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    formError,
    submitting,
    passwordStrength,
    passwordsMatch,
    handleReturnToSignIn,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleToggleShowPassword,
    handleToggleShowConfirmPassword,
    handleSubmit,
  } = useResetPassword({ oobCode })

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
          {status === 'loading' && <ResetPasswordLoadingState />}

          {status === 'error' && <ResetPasswordErrorState verificationError={verificationError} />}

          {status === 'ready' && (
            <ResetPasswordReadyForm
              email={email}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              submitting={submitting}
              formError={formError}
              passwordStrength={passwordStrength}
              passwordsMatch={passwordsMatch}
              onSubmit={handleSubmit}
              onNewPasswordChange={handleNewPasswordChange}
              onConfirmPasswordChange={handleConfirmPasswordChange}
              onToggleShowPassword={handleToggleShowPassword}
              onToggleShowConfirmPassword={handleToggleShowConfirmPassword}
            />
          )}

          {status === 'success' && <ResetPasswordSuccessState onReturnToSignIn={handleReturnToSignIn} />}
        </AuthPanel>
      </AuthShell>
    </BoneyardSkeletonBoundary>
  )
}

export default function ResetPasswordPageClient({ oobCode = null }: ResetPasswordPageClientProps) {
  return <ResetPasswordContent oobCode={oobCode} />
}
