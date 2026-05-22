export interface PasswordStrength {
  score: number
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

export function calculatePasswordStrength(password: string): PasswordStrength {
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
    label = ''
    color = 'bg-muted'
  } else if (passedChecks <= 1) {
    score = 1
    label = 'Weak'
    color = 'bg-destructive'
  } else if (passedChecks === 2) {
    score = 2
    label = 'Fair'
    color = 'bg-warning'
  } else if (passedChecks === 3) {
    score = 3
    label = 'Good'
    color = 'bg-warning'
  } else if (passedChecks === 4) {
    score = 3
    label = 'Strong'
    color = 'bg-success'
  } else {
    score = 4
    label = 'Very Strong'
    color = 'bg-success'
  }

  return { score, label, color, checks }
}

export type ResetPasswordPageClientProps = {
  oobCode?: string | null
}

export type VerificationStatus = 'loading' | 'ready' | 'success' | 'error'

export type VerificationState = {
  status: VerificationStatus
  email: string | null
  verificationError: string | null
}

export type VerificationAction =
  | { type: 'missing-token' }
  | { type: 'verified'; email: string }
  | { type: 'failed'; error: string }
  | { type: 'success' }

export const initialVerificationState: VerificationState = {
  status: 'loading',
  email: null,
  verificationError: null,
}

export const resetPrimaryButtonClassName = 'h-11 w-full rounded-full text-sm font-semibold shadow-sm'

export type ResetPasswordFormState = {
  newPassword: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  formError: string | null
  submitting: boolean
}

export type ResetPasswordFormAction =
  | { type: 'setNewPassword'; value: string }
  | { type: 'setConfirmPassword'; value: string }
  | { type: 'toggleShowPassword' }
  | { type: 'toggleShowConfirmPassword' }
  | { type: 'setFormError'; value: string | null }
  | { type: 'setSubmitting'; value: boolean }
  | { type: 'startSubmit' }

export const initialResetPasswordFormState: ResetPasswordFormState = {
  newPassword: '',
  confirmPassword: '',
  showPassword: false,
  showConfirmPassword: false,
  formError: null,
  submitting: false,
}

export function resetPasswordFormReducer(
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

export function verificationReducer(state: VerificationState, action: VerificationAction): VerificationState {
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
