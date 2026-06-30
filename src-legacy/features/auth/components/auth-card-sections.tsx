'use client';
import { Link } from '@/shared/ui/link';
import { Check, Eye, EyeOff, LoaderCircle, Shield, X, } from 'lucide-react';
import type { FormEventHandler, MouseEvent } from 'react';
import { authForgotPasswordLink, authLockIconSm, authMailIconSm, authUserIconSm, } from '@/features/auth/auth-icons';
import { AuthField, authInputClassName } from '@/features/auth/components/auth-field';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in';
import { Input } from '@/shared/ui/input';
import { cn } from '@/lib/utils';
import { PROVIDER_COLORS } from '@/lib/colors';
import { AUTH_TAB_OPTIONS, authPrimaryButtonClassName, type AuthCardProps, } from './auth-card-types';
export function PasswordRequirement({ met, label }: {
    met: boolean;
    label: string;
}) {
    return (<div className="flex items-center gap-2 text-xs">
      {met ? (<Check className="size-3 shrink-0 text-success" aria-hidden/>) : (<X className="size-3 shrink-0 text-muted-foreground" aria-hidden/>)}
      <span className={cn(met ? 'text-success' : 'text-muted-foreground')}>{label}</span>
    </div>);
}
export function PasswordToggle({ visible, onToggle, disabled, label, }: {
    visible: boolean;
    onToggle: () => void;
    disabled?: boolean;
    label: string;
}) {
    return (<Button type="button" variant="ghost" size="icon-sm" onClick={onToggle} className="absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground" disabled={disabled} aria-label={label}>
      {visible ? <EyeOff className="size-4" aria-hidden/> : <Eye className="size-4" aria-hidden/>}
    </Button>);
}
export function AuthCardHeader({ activeTab, onTabClick, }: {
    activeTab: AuthCardProps['activeTab'];
    onTabClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
    return (<div className="space-y-6 px-6 pt-7 pb-2 sm:px-8 sm:pt-8">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {activeTab === 'signup' ? 'Create your workspace' : 'Welcome back'}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {activeTab === 'signup'
            ? 'Start with email or Google — your team can join once you are in.'
            : 'Sign in to pick up proposals, campaigns, and client work where you left off.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-full border border-border/60 bg-muted/40 p-1" role="tablist" aria-label="Authentication mode">
        {AUTH_TAB_OPTIONS.map((tab) => {
            const selected = activeTab === tab.value;
            return (<button key={tab.value} type="button" role="tab" aria-selected={selected} data-tab={tab.value} onClick={onTabClick} className={cn('rounded-full px-3 py-2.5 text-sm font-medium transition-[color,background-color,box-shadow]', selected
                    ? 'bg-background text-foreground shadow-sm ring-1 ring-border/60'
                    : 'text-muted-foreground hover:text-foreground')}>
              {tab.label}
            </button>);
        })}
      </div>
    </div>);
}
export function AuthCardSignInForm({ activeTab, emailError, ui, signInData, onRememberMeChange, onToggleShowPassword, onSignInChange, onSubmitSignIn, }: Pick<AuthCardProps, 'activeTab' | 'emailError' | 'ui' | 'signInData' | 'onRememberMeChange' | 'onToggleShowPassword' | 'onSignInChange' | 'onSubmitSignIn'>) {
    const { isSubmitting, isAuthLoading, rememberMe, showPassword } = ui;
    return (<FadeInStagger key="signin" as="form" className="space-y-4" onSubmit={onSubmitSignIn as unknown as FormEventHandler<HTMLDivElement>}>
      <FadeInItem as="div">
        <AuthField id="signInEmail" label="Email address" icon={authMailIconSm} error={emailError && activeTab === 'signin' ? emailError : null}>
          <Input id="signInEmail" name="email" type="email" autoComplete="email" required value={signInData.email} onChange={onSignInChange} placeholder="name@company.com" className={cn(authInputClassName, emailError && activeTab === 'signin' && 'border-destructive focus-visible:ring-destructive/30')} disabled={isSubmitting}/>
        </AuthField>
      </FadeInItem>

      <FadeInItem as="div">
        <AuthField id="signInPassword" label="Password" icon={authLockIconSm} labelAction={authForgotPasswordLink}>
          <Input id="signInPassword" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={signInData.password} onChange={onSignInChange} placeholder="••••••••" className={cn(authInputClassName, 'pr-11')} disabled={isSubmitting}/>
          <PasswordToggle visible={showPassword} onToggle={onToggleShowPassword} disabled={isSubmitting} label={showPassword ? 'Hide password' : 'Show password'}/>
        </AuthField>
      </FadeInItem>

      <FadeInItem as="div" className="flex items-center gap-2.5">
        <Checkbox id="remember-me" checked={rememberMe} onChange={onRememberMeChange} disabled={isSubmitting}/>
        <label htmlFor="remember-me" className="cursor-pointer select-none text-sm font-medium text-muted-foreground">
          Remember me on this device
        </label>
      </FadeInItem>

      <FadeInItem as="div">
        <Button className={authPrimaryButtonClassName} disabled={isSubmitting || isAuthLoading} type="submit">
          {isSubmitting ? (<>
              <LoaderCircle className="mr-2 size-4 shrink-0 animate-spin" aria-hidden/>
              Signing in…
            </>) : ('Sign in')}
        </Button>
      </FadeInItem>
    </FadeInStagger>);
}
export function AuthCardSignUpForm({ activeTab, emailError, ui, signUpData, passwordStrength, onToggleShowPassword, onToggleShowConfirmPassword, onSignUpChange, onSubmitSignUp, }: Pick<AuthCardProps, 'activeTab' | 'emailError' | 'ui' | 'signUpData' | 'passwordStrength' | 'onToggleShowPassword' | 'onToggleShowConfirmPassword' | 'onSignUpChange' | 'onSubmitSignUp'>) {
    const { isSubmitting, isAuthLoading, showPassword, showConfirmPassword, passwordsMatch } = ui;
    return (<FadeInStagger key="signup" as="form" className="space-y-4" onSubmit={onSubmitSignUp as unknown as FormEventHandler<HTMLDivElement>}>
      <FadeInItem as="div">
        <AuthField id="displayName" label="Full name" icon={authUserIconSm}>
          <Input id="displayName" name="displayName" type="text" autoComplete="name" value={signUpData.displayName} onChange={onSignUpChange} placeholder="Jane Smith" className={authInputClassName} disabled={isSubmitting}/>
        </AuthField>
      </FadeInItem>

      <FadeInItem as="div">
        <AuthField id="signUpEmail" label="Work email" icon={authMailIconSm} error={emailError && activeTab === 'signup' ? emailError : null}>
          <Input id="signUpEmail" name="email" type="email" autoComplete="email" required value={signUpData.email} onChange={onSignUpChange} placeholder="name@company.com" className={cn(authInputClassName, emailError && activeTab === 'signup' && 'border-destructive focus-visible:ring-destructive/30')} disabled={isSubmitting}/>
        </AuthField>
      </FadeInItem>

      <FadeInItem as="div">
        <AuthField id="signUpPassword" label="Password" icon={authLockIconSm}>
          <Input id="signUpPassword" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={signUpData.password} onChange={onSignUpChange} placeholder="Create a strong password" className={cn(authInputClassName, 'pr-11')} disabled={isSubmitting}/>
          <PasswordToggle visible={showPassword} onToggle={onToggleShowPassword} disabled={isSubmitting} label={showPassword ? 'Hide password' : 'Show password'}/>
        </AuthField>

        {signUpData.password.length > 0 ? (<div className="mt-3 space-y-2.5 rounded-2xl border border-border/50 bg-muted/25 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="size-3.5 shrink-0" aria-hidden/>
                <span>Password strength</span>
              </div>
              <span className={cn('font-semibold', passwordStrength.score <= 1 && 'text-destructive', passwordStrength.score === 2 && 'text-warning', passwordStrength.score >= 3 && 'text-success')}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (<div key={level} className={cn('h-1 flex-1 rounded-full transition-colors', level <= passwordStrength.score ? passwordStrength.color : 'bg-muted')}/>))}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <PasswordRequirement met={passwordStrength.checks.length} label="8+ characters"/>
              <PasswordRequirement met={passwordStrength.checks.uppercase} label="Uppercase"/>
              <PasswordRequirement met={passwordStrength.checks.lowercase} label="Lowercase"/>
              <PasswordRequirement met={passwordStrength.checks.number} label="Number"/>
              <PasswordRequirement met={passwordStrength.checks.special} label="Special char"/>
            </div>
          </div>) : null}
      </FadeInItem>

      <FadeInItem as="div">
        <AuthField id="confirmPassword" label="Confirm password" icon={authLockIconSm}>
          <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required value={signUpData.confirmPassword} onChange={onSignUpChange} placeholder="Re-enter your password" className={cn(authInputClassName, 'pr-11', signUpData.confirmPassword.length > 0 &&
            !passwordsMatch &&
            'border-destructive focus-visible:ring-destructive/30', signUpData.confirmPassword.length > 0 &&
            passwordsMatch &&
            'border-success focus-visible:ring-success/30')} disabled={isSubmitting}/>
          <PasswordToggle visible={showConfirmPassword} onToggle={onToggleShowConfirmPassword} disabled={isSubmitting} label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}/>
        </AuthField>
        {signUpData.confirmPassword.length > 0 ? (<p className={cn('mt-2 flex items-center gap-1.5 text-xs', passwordsMatch ? 'text-success' : 'text-destructive')}>
            {passwordsMatch ? (<>
                <Check className="size-3.5 shrink-0" aria-hidden/>
                Passwords match
              </>) : (<>
                <X className="size-3.5 shrink-0" aria-hidden/>
                Passwords do not match
              </>)}
          </p>) : null}
      </FadeInItem>

      <FadeInItem as="div">
        <Button className={authPrimaryButtonClassName} disabled={isSubmitting || isAuthLoading} type="submit">
          {isSubmitting ? (<>
              <LoaderCircle className="mr-2 size-4 shrink-0 animate-spin" aria-hidden/>
              Creating account…
            </>) : ('Create account')}
        </Button>
      </FadeInItem>
    </FadeInStagger>);
}
export function AuthCardSocialFooter({ ui, onGoogleSignIn, }: Pick<AuthCardProps, 'ui' | 'onGoogleSignIn'>) {
    const { isSubmitting, isAuthLoading } = ui;
    return (<>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border/60"/>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button type="button" variant="outline" disabled={isSubmitting || isAuthLoading} onClick={onGoogleSignIn} className="h-11 w-full gap-2.5 rounded-full border-border/70 bg-background/60 font-medium hover:bg-muted/40">
        {isSubmitting ? (<LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden/>) : (<svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill={PROVIDER_COLORS.google.blue} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill={PROVIDER_COLORS.google.green} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill={PROVIDER_COLORS.google.yellow} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill={PROVIDER_COLORS.google.red} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>)}
        Continue with Google
      </Button>

      <div className="flex items-center justify-center gap-2 rounded-xl bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Shield className="size-3.5 shrink-0 text-primary/80" aria-hidden/>
        <span>Encrypted in transit · SOC-ready infrastructure</span>
      </div>
    </>);
}
export function AuthCardTermsFooter() {
    return (<p className="border-t border-border/50 bg-muted/15 px-6 py-4 text-center text-[11px] leading-relaxed text-muted-foreground sm:px-8">
      By continuing, you agree to our{' '}
      <Link href="/terms" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
        Terms
      </Link>{' '}
      and{' '}
      <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2 hover:text-primary">
        Privacy Policy
      </Link>
      .
    </p>);
}
