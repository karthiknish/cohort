'use client'

import { authLockIconLg } from '@/features/auth/auth-icons'
import { AuthPanel } from '@/features/auth/components/auth-panel'
import { AuthShell } from '@/features/auth/components/auth-shell'
import { AuthPageSkeleton } from '@/features/auth/components/auth-page-skeleton'
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary'

import {
  ResetPasswordErrorState,
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
  return (
    <PageSkeletonBoundary
      loading={status === 'loading'}
      loadingContent={<AuthPageSkeleton />}
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
    </PageSkeletonBoundary>
  )
}

export default function ResetPasswordPageClient({ oobCode = null }: ResetPasswordPageClientProps) {
  return <ResetPasswordContent oobCode={oobCode} />
}
