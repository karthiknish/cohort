'use client';
import { useCallback, useEffect, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/auth-context';
import { useToast } from '@/shared/ui/use-toast';
import { getFriendlyAuthErrorMessage } from '@/services/auth/error-utils';
import { calculatePasswordStrength, initialResetPasswordFormState, initialVerificationState, resetPasswordFormReducer, verificationReducer, type ResetPasswordPageClientProps, } from './reset-password-types';
export function useResetPassword({ oobCode }: ResetPasswordPageClientProps) {
    const { push } = useRouter();
    const { toast } = useToast();
    const { verifyPasswordResetCode, confirmPasswordReset } = useAuth();
    const [verificationState, dispatchVerification] = useReducer(verificationReducer, initialVerificationState);
    const [formState, dispatchForm] = useReducer(resetPasswordFormReducer, initialResetPasswordFormState);
    const { newPassword, confirmPassword, showPassword, showConfirmPassword, formError, submitting } = formState;
    const passwordStrength = calculatePasswordStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword;
    useEffect(() => {
        if (!oobCode) {
            dispatchVerification({ type: 'missing-token' });
            return;
        }
        let active = true;
        verifyPasswordResetCode(oobCode)
            .then((verifiedEmail) => {
            if (!active)
                return;
            dispatchVerification({ type: 'verified', email: verifiedEmail });
        })
            .catch((error: unknown) => {
            if (!active)
                return;
            dispatchVerification({
                type: 'failed',
                error: getFriendlyAuthErrorMessage(error),
            });
        });
        return () => {
            active = false;
        };
    }, [oobCode, verifyPasswordResetCode]);
    const handleReturnToSignIn = () => {
        push('/auth');
    };
    const handleNewPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatchForm({ type: 'setNewPassword', value: event.target.value });
    };
    const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatchForm({ type: 'setConfirmPassword', value: event.target.value });
    };
    const handleToggleShowPassword = () => {
        dispatchForm({ type: 'toggleShowPassword' });
    };
    const handleToggleShowConfirmPassword = () => {
        dispatchForm({ type: 'toggleShowConfirmPassword' });
    };
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!oobCode || submitting) {
            return;
        }
        if (passwordStrength.score < 2) {
            dispatchForm({ type: 'setFormError', value: 'Please create a stronger password with at least 8 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            dispatchForm({ type: 'setFormError', value: 'Passwords do not match.' });
            return;
        }
        dispatchForm({ type: 'startSubmit' });
        void confirmPasswordReset(oobCode, newPassword)
            .then(() => {
            dispatchVerification({ type: 'success' });
            toast({
                title: 'Password updated',
                description: 'You can now sign in with your new password.',
            });
        })
            .catch((error: unknown) => {
            dispatchForm({ type: 'setFormError', value: getFriendlyAuthErrorMessage(error) });
        })
            .finally(() => {
            dispatchForm({ type: 'setSubmitting', value: false });
        });
    };
    return {
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
    };
}
