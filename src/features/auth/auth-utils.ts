import { authClient } from '@/lib/auth-client';
/**
 * Starts Better Auth Google OAuth (proxied to Convex via /api/auth).
 * Redirects the browser; does not return on success.
 */
export async function startGoogleOAuthSignIn(callbackURL: string): Promise<void> {
    await authClient.signIn.social({
        provider: 'google',
        callbackURL,
    });
}
/**
 * Domain profile shape resolved after sign-in. role/status/agencyId live in
 * the Convex `users` table (joined by `legacyId` = better-auth user id).
 * The domain profile is loaded reactively in the auth hook via
 * `api.users.getByLegacyIdSafe`; first-touch profile creation runs through
 * `api.users.ensureProfileOnSignIn` (an identity-gated Convex mutation), so
 * there is no longer a custom `/api/auth/bootstrap` round-trip.
 */
export type BootstrapProfile = {
    legacyId: string;
    role: 'admin' | 'team' | 'client';
    status: 'active' | 'pending' | 'invited' | 'disabled' | 'suspended';
    agencyId: string;
};
export type PasswordStrength = {
    score: number;
    label: string;
    color: string;
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
};
export type EmailProviderLink = {
    url: string;
    label: string;
};
const EMAIL_PROVIDER_DOMAINS: Record<string, EmailProviderLink> = {
    'gmail.com': { url: 'https://mail.google.com', label: 'Open Gmail' },
    'googlemail.com': { url: 'https://mail.google.com', label: 'Open Gmail' },
    'outlook.com': { url: 'https://outlook.live.com/mail/', label: 'Open Outlook' },
    'hotmail.com': { url: 'https://outlook.live.com/mail/', label: 'Open Outlook' },
    'live.com': { url: 'https://outlook.live.com/mail/', label: 'Open Outlook' },
    'msn.com': { url: 'https://outlook.live.com/mail/', label: 'Open Outlook' },
    'yahoo.com': { url: 'https://mail.yahoo.com', label: 'Open Yahoo Mail' },
    'yahoo.co.uk': { url: 'https://mail.yahoo.com', label: 'Open Yahoo Mail' },
    'icloud.com': { url: 'https://www.icloud.com/mail', label: 'Open iCloud Mail' },
    'me.com': { url: 'https://www.icloud.com/mail', label: 'Open iCloud Mail' },
    'mac.com': { url: 'https://www.icloud.com/mail', label: 'Open iCloud Mail' },
    'aol.com': { url: 'https://mail.aol.com', label: 'Open AOL Mail' },
    'proton.me': { url: 'https://proton.me/mail', label: 'Open Proton Mail' },
    'protonmail.com': { url: 'https://proton.me/mail', label: 'Open Proton Mail' },
    'pm.me': { url: 'https://proton.me/mail', label: 'Open Proton Mail' },
    'zoho.com': { url: 'https://mail.zoho.com', label: 'Open Zoho Mail' },
    'yandex.com': { url: 'https://mail.yandex.com', label: 'Open Yandex Mail' },
    'yandex.ru': { url: 'https://mail.yandex.com', label: 'Open Yandex Mail' },
};
/**
 * Resolves a webmail deep link from the domain of an email address.
 * Returns `null` for custom/unknown domains so callers can render an
 * honest fallback instead of guessing the wrong provider.
 */
export function getEmailProviderLink(email: string): EmailProviderLink | null {
    const domain = email.trim().toLowerCase().split('@')[1];
    if (!domain) {
        return null;
    }
    return EMAIL_PROVIDER_DOMAINS[domain] ?? null;
}
export function calculatePasswordStrength(password: string): PasswordStrength {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const passedChecks = Object.values(checks).filter(Boolean).length;
    let score: number;
    let label: string;
    let color: string;
    if (password.length === 0) {
        score = 0;
        label = '';
        color = 'bg-muted';
    }
    else if (passedChecks <= 1) {
        score = 1;
        label = 'Weak';
        color = 'bg-destructive';
    }
    else if (passedChecks === 2) {
        score = 2;
        label = 'Fair';
        color = 'bg-warning';
    }
    else if (passedChecks === 3) {
        score = 3;
        label = 'Good';
        color = 'bg-info';
    }
    else if (passedChecks === 4) {
        score = 3;
        label = 'Strong';
        color = 'bg-success';
    }
    else {
        score = 4;
        label = 'Very Strong';
        color = 'bg-success';
    }
    return { score, label, color, checks };
}
