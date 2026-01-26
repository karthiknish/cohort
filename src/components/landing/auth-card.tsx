'use client'

import Link from 'next/link'
import {
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  Shield,
  User,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import type { FormEventHandler } from 'react'

import type { PasswordStrength } from './auth-utils'

type SignInData = {
  email: string
  password: string
}

type SignUpData = {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}

type AuthCardProps = {
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

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <X className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={cn(met ? 'text-emerald-600' : 'text-muted-foreground')}>{label}</span>
    </div>
  )
}

export function AuthCard({
  activeTab,
  emailError,
  isSubmitting,
  isAuthLoading,
  rememberMe,
  showPassword,
  showConfirmPassword,
  passwordsMatch,
  signInData,
  signUpData,
  passwordStrength,
  onTabChange,
  onRememberMeChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onSignInChange,
  onSignUpChange,
  onSubmitSignIn,
  onSubmitSignUp,
  onGoogleSignIn,
}: AuthCardProps) {
  return (
    <FadeIn as="section" className="w-full lg:max-w-[480px]">
      <Card className="border-border/60 shadow-xl shadow-primary/5">
        <CardHeader className="space-y-1 pb-6 text-center">
          <CardTitle className="text-2xl">Welcome to Cohorts</CardTitle>
          <CardDescription className="text-base">
            {activeTab === 'signup'
              ? 'Create an account to get started.'
              : 'Sign in to access your dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
              <FadeInStagger
                as="form"
                className="space-y-4"
                onSubmit={onSubmitSignIn as unknown as React.FormEventHandler<HTMLDivElement>}
              >
                <FadeInItem as="div" className="space-y-2">
                  <Label htmlFor="signInEmail">Email address</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="signInEmail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signInData.email}
                      onChange={onSignInChange}
                      placeholder="name@company.com"
                      className={cn(
                        'pl-9',
                        emailError && activeTab === 'signin' && 'border-red-500 focus-visible:ring-red-500'
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {emailError && activeTab === 'signin' && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <CircleAlert className="h-3 w-3" />
                      {emailError}
                    </p>
                  )}
                </FadeInItem>

                <FadeInItem as="div" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signInPassword">Password</Label>
                    <Link href="/auth/forgot" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      id="signInPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={signInData.password}
                      onChange={onSignInChange}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onToggleShowPassword}
                      className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FadeInItem>

                <FadeInItem as="div" className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onChange={onRememberMeChange}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium text-muted-foreground leading-none cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </FadeInItem>

                <Button className="w-full" size="lg" disabled={isSubmitting || isAuthLoading} type="submit">
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </FadeInStagger>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <FadeInStagger
                as="form"
                className="space-y-4"
                onSubmit={onSubmitSignUp as unknown as React.FormEventHandler<HTMLDivElement>}
              >
                <FadeInItem as="div" className="space-y-2">
                  <Label htmlFor="displayName">Full name</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <User className="h-4 w-4" />
                    </span>
                    <Input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={signUpData.displayName}
                      onChange={onSignUpChange}
                      placeholder="Jane Smith"
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </FadeInItem>

                <FadeInItem as="div" className="space-y-2">
                  <Label htmlFor="signUpEmail">Email address</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="signUpEmail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={signUpData.email}
                      onChange={onSignUpChange}
                      placeholder="name@company.com"
                      className={cn(
                        'pl-9',
                        emailError && activeTab === 'signup' && 'border-red-500 focus-visible:ring-red-500'
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {emailError && activeTab === 'signup' && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <CircleAlert className="h-3 w-3" />
                      {emailError}
                    </p>
                  )}
                </FadeInItem>

                <FadeInItem as="div" className="space-y-2">
                  <Label htmlFor="signUpPassword">Password</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      id="signUpPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={signUpData.password}
                      onChange={onSignUpChange}
                      placeholder="Create a strong password"
                      className="pl-9 pr-10"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onToggleShowPassword}
                      className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {signUpData.password.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Password strength:</span>
                        </div>
                        <span
                          className={cn(
                            'font-medium',
                            passwordStrength.score <= 1 && 'text-red-500',
                            passwordStrength.score === 2 && 'text-orange-500',
                            passwordStrength.score === 3 && 'text-emerald-500',
                            passwordStrength.score >= 4 && 'text-emerald-600'
                          )}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-1 flex-1 rounded-full transition-colors',
                              level <= passwordStrength.score ? passwordStrength.color : 'bg-muted'
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
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={signUpData.confirmPassword}
                      onChange={onSignUpChange}
                      placeholder="Re-enter your password"
                      className={cn(
                        'pl-9 pr-10',
                        signUpData.confirmPassword.length > 0 &&
                          !passwordsMatch &&
                          'border-red-500 focus-visible:ring-red-500',
                        signUpData.confirmPassword.length > 0 &&
                          passwordsMatch &&
                          'border-emerald-500 focus-visible:ring-emerald-500'
                      )}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={onToggleShowConfirmPassword}
                      className="absolute inset-y-0 right-1 h-full w-9 text-muted-foreground hover:text-foreground"
                      disabled={isSubmitting}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {signUpData.confirmPassword.length > 0 && (
                    <p
                      className={cn(
                        'text-xs flex items-center gap-1',
                        passwordsMatch ? 'text-emerald-500' : 'text-red-500'
                      )}
                    >
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

                <Button className="w-full" size="lg" disabled={isSubmitting || isAuthLoading} type="submit">
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </FadeInStagger>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isAuthLoading}
              onClick={onGoogleSignIn}
              className="w-full"
            >
              {isSubmitting ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secured with SSL encryption</span>
          </div>

          <p className="text-center text-xs text-muted-foreground px-6">
            By clicking continue, you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </FadeIn>
  )
}
