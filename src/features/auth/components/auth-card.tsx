'use client';
import { useCallback, type MouseEvent } from 'react';
import { FadeIn } from '@/shared/ui/animate-in';
import type { AuthCardProps } from './auth-card-types';
import { AuthCardHeader, AuthCardSignInForm, AuthCardSignUpForm, AuthCardSocialFooter, AuthCardTermsFooter, } from './auth-card-sections';
export function AuthCard({ activeTab, emailError, ui, signInData, signUpData, passwordStrength, onTabChange, onRememberMeChange, onToggleShowPassword, onToggleShowConfirmPassword, onSignInChange, onSignUpChange, onSubmitSignIn, onSubmitSignUp, onGoogleSignIn, }: AuthCardProps) {
    const handleTabClick = (event: MouseEvent<HTMLButtonElement>) => {
        const value = event.currentTarget.dataset.tab;
        if (value === 'signin' || value === 'signup') {
            onTabChange(value);
        }
    };
    return (<FadeIn as="section" className="mx-auto w-full max-w-md lg:max-w-120">
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-primary/5 ring-1 ring-border/40 backdrop-blur-sm motion-reduce:shadow-md">
        <AuthCardHeader activeTab={activeTab} onTabClick={handleTabClick}/>

        <div className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-7">
          {activeTab === 'signin' ? (<AuthCardSignInForm activeTab={activeTab} emailError={emailError} ui={ui} signInData={signInData} onRememberMeChange={onRememberMeChange} onToggleShowPassword={onToggleShowPassword} onSignInChange={onSignInChange} onSubmitSignIn={onSubmitSignIn}/>) : (<AuthCardSignUpForm activeTab={activeTab} emailError={emailError} ui={ui} signUpData={signUpData} passwordStrength={passwordStrength} onToggleShowPassword={onToggleShowPassword} onToggleShowConfirmPassword={onToggleShowConfirmPassword} onSignUpChange={onSignUpChange} onSubmitSignUp={onSubmitSignUp}/>)}

          <AuthCardSocialFooter ui={ui} onGoogleSignIn={onGoogleSignIn}/>
        </div>

        <AuthCardTermsFooter />
      </div>
    </FadeIn>);
}
