'use client';
import Link from 'next/link';
import { Check, Eye, EyeOff, LoaderCircle, Shield, X, CircleCheck } from 'lucide-react';
import { authLockIconLg, authLockIconSm } from '@/features/auth/auth-icons';
import { AuthField, authInputClassName } from '@/features/auth/components/auth-field';
import { AuthPanel } from '@/features/auth/components/auth-panel';
import { AuthShell } from '@/features/auth/components/auth-shell';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { FadeIn, FadeInItem, FadeInStagger } from '@/shared/ui/animate-in';
import { cn } from '@/lib/utils';
import type { PasswordStrength } from './reset-password-types';
import { resetPrimaryButtonClassName } from './reset-password-types';
export function PasswordRequirement({ met, label }: {
    met: boolean;
    label: string;
}) {
    return (<div className="flex items-center gap-2 text-xs">
      {met ? (<Check className="size-3 text-success"/>) : (<X className="size-3 text-muted-foreground"/>)}
      <span className={cn(met ? 'text-success' : 'text-muted-foreground')}>{label}</span>
    </div>);
}
export function ResetPasswordFixture() {
    return (<AuthShell>
      <AuthPanel title="Set new password" description="Your new password must be different from your previous password." icon={authLockIconLg}>
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
              <Input id="fixture-new-password" type="password" autoComplete="new-password" value="SamplePass123!" readOnly/>
            </FadeInItem>

            <FadeInItem as="div" className="space-y-2">
              <Label htmlFor="fixture-confirm-password">Confirm new password</Label>
              <Input id="fixture-confirm-password" type="password" autoComplete="new-password" value="SamplePass123!" readOnly/>
              <p className="flex items-center gap-1 text-xs text-success">
                <Check className="size-3"/>
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
    </AuthShell>);
}
export function ResetPasswordLoadingState() {
    return (<div className="flex flex-col items-center gap-4 py-8">
      <LoaderCircle className="size-8 animate-spin text-primary" aria-hidden/>
      <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
    </div>);
}
export function ResetPasswordErrorState({ verificationError }: {
    verificationError: string | null;
}) {
    return (<div className="space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Reset link problem</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{verificationError ?? 'This reset link is invalid or has expired.'}</p>
        </AlertDescription>
      </Alert>
      <Button asChild className={resetPrimaryButtonClassName}>
        <Link href="/auth/forgot">Request a new reset link</Link>
      </Button>
    </div>);
}
export function ResetPasswordSuccessState({ onReturnToSignIn }: {
    onReturnToSignIn: () => void;
}) {
    return (<FadeIn as="div" className="space-y-5">
      <div className="rounded-2xl border border-success/20 bg-success/10 p-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-success/15 text-success">
          <CircleCheck className="size-6" aria-hidden/>
        </div>
        <h3 className="mb-1 font-semibold text-foreground">Password reset successful</h3>
        <p className="text-sm text-muted-foreground">
          Your password has been updated. Sign in with your new credentials.
        </p>
      </div>

      <Button className={resetPrimaryButtonClassName} onClick={onReturnToSignIn}>
        Continue to sign in
      </Button>
    </FadeIn>);
}
type ResetPasswordReadyFormProps = {
    email: string | null;
    newPassword: string;
    confirmPassword: string;
    showPassword: boolean;
    showConfirmPassword: boolean;
    submitting: boolean;
    formError: string | null;
    passwordStrength: PasswordStrength;
    passwordsMatch: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onNewPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleShowPassword: () => void;
    onToggleShowConfirmPassword: () => void;
};
export function ResetPasswordReadyForm({ email, newPassword, confirmPassword, showPassword, showConfirmPassword, submitting, formError, passwordStrength, passwordsMatch, onSubmit, onNewPasswordChange, onConfirmPasswordChange, onToggleShowPassword, onToggleShowConfirmPassword, }: ResetPasswordReadyFormProps) {
    return (<form className="space-y-5" onSubmit={onSubmit}>
      <FadeInStagger as="div" className="space-y-5">
        {email && (<FadeInItem as="div">
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Resetting password for <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
          </FadeInItem>)}

        <FadeInItem as="div">
          <AuthField id="new-password" label="New password" icon={authLockIconSm}>
            <Input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={newPassword} onChange={onNewPasswordChange} placeholder="Enter a new password" className={cn(authInputClassName, 'pr-11')} disabled={submitting}/>
            <Button type="button" variant="ghost" size="icon-sm" className="absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground" onClick={onToggleShowPassword} aria-label={showPassword ? 'Hide password' : 'Show password'} disabled={submitting}>
              {showPassword ? <EyeOff className="size-4" aria-hidden/> : <Eye className="size-4" aria-hidden/>}
            </Button>
          </AuthField>

          {newPassword.length > 0 && (<div className="mt-3 space-y-2 rounded-2xl border border-border/50 bg-muted/25 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Shield className="size-3 text-muted-foreground"/>
                  <span className="text-muted-foreground">Password strength:</span>
                </div>
                <span className={cn('font-medium', passwordStrength.score <= 1 && 'text-destructive', passwordStrength.score === 2 && 'text-warning', passwordStrength.score === 3 && 'text-success', passwordStrength.score >= 4 && 'text-success')}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (<div key={level} className={cn('h-1 flex-1 rounded-full transition-colors', level <= passwordStrength.score ? passwordStrength.color : 'bg-muted')}/>))}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                <PasswordRequirement met={passwordStrength.checks.length} label="At least 8 characters"/>
                <PasswordRequirement met={passwordStrength.checks.uppercase} label="Uppercase letter"/>
                <PasswordRequirement met={passwordStrength.checks.lowercase} label="Lowercase letter"/>
                <PasswordRequirement met={passwordStrength.checks.number} label="Number"/>
                <PasswordRequirement met={passwordStrength.checks.special} label="Special character"/>
              </div>
            </div>)}
        </FadeInItem>

        <FadeInItem as="div">
          <AuthField id="confirm-password" label="Confirm new password" icon={authLockIconSm}>
            <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={onConfirmPasswordChange} placeholder="Re-enter your new password" className={cn(authInputClassName, 'pr-11', confirmPassword.length > 0 && !passwordsMatch && 'border-destructive focus-visible:ring-destructive/30', confirmPassword.length > 0 && passwordsMatch && 'border-success focus-visible:ring-success/30')} disabled={submitting}/>
            <Button type="button" variant="ghost" size="icon-sm" className="absolute inset-y-0 right-1.5 h-full w-9 text-muted-foreground hover:text-foreground" onClick={onToggleShowConfirmPassword} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} disabled={submitting}>
              {showConfirmPassword ? <EyeOff className="size-4" aria-hidden/> : <Eye className="size-4" aria-hidden/>}
            </Button>
          </AuthField>
          {confirmPassword.length > 0 && (<p className={cn('mt-2 flex items-center gap-1.5 text-xs', passwordsMatch ? 'text-success' : 'text-destructive')}>
              {passwordsMatch ? (<>
                  <Check className="size-3.5 shrink-0" aria-hidden/>
                  Passwords match
                </>) : (<>
                  <X className="size-3.5 shrink-0" aria-hidden/>
                  Passwords do not match
                </>)}
            </p>)}
        </FadeInItem>

        {formError && (<FadeInItem as="div">
            <Alert variant="destructive">
              <AlertTitle>Update failed</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          </FadeInItem>)}

        <FadeInItem as="div">
          <Button type="submit" className={resetPrimaryButtonClassName} disabled={submitting}>
            {submitting ? (<>
                <LoaderCircle className="mr-2 size-4 animate-spin"/>
                Updating password…
              </>) : ('Reset password')}
          </Button>
        </FadeInItem>
      </FadeInStagger>
    </form>);
}
