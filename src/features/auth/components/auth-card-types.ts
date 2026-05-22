import type { FormEventHandler } from 'react'

import type { PasswordStrength } from '../auth-utils'

export type SignInData = {
  email: string
  password: string
}

export type SignUpData = {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}

export type AuthCardProps = {
  activeTab: 'signin' | 'signup'
  emailError: string | null
  isSubmitting: boolean
  isAuthLoading: boolean
  rememberMe: boolean
  showPassword: boolean
  showConfirmPassword: boolean
  passwordsMatch: boolean
  signInData: SignInData
  signUpData: SignUpData
  passwordStrength: PasswordStrength
  onTabChange: (value: string) => void
  onRememberMeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onToggleShowPassword: () => void
  onToggleShowConfirmPassword: () => void
  onSignInChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSignUpChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmitSignIn: FormEventHandler<HTMLFormElement>
  onSubmitSignUp: FormEventHandler<HTMLFormElement>
  onGoogleSignIn: () => void
}

export const AUTH_TAB_OPTIONS = [
  { value: 'signin' as const, label: 'Sign in' },
  { value: 'signup' as const, label: 'Create account' },
]

export const authPrimaryButtonClassName = 'h-11 w-full rounded-full text-sm font-semibold shadow-sm'
