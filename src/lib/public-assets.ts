const SVGL_PREFIX = '/svgl/';
function isExternalOAuthDocumentHost(hostname: string): boolean {
    return (hostname === 'accounts.google.com' ||
        hostname.endsWith('.facebook.com') ||
        hostname.endsWith('.linkedin.com'));
}
function getR2PublicBaseUrl(): string | null {
    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.replace(/\/$/, '');
    return base && base.length > 0 ? base : null;
}
/**
 * App origin for static assets under `/public`.
 * Relative paths break when `document.baseURI` is an OAuth provider (e.g. accounts.google.com).
 */
export function getAppOrigin(): string {
    const envBase = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL)?.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
        const { origin, hostname } = window.location;
        if (!isExternalOAuthDocumentHost(hostname)) {
            return origin;
        }
        if (envBase)
            return envBase;
        return origin;
    }
    return envBase ?? 'http://localhost:3000';
}
/** Absolute URL for a file in `/public` (path must start with `/`). */
export function getPublicAssetUrl(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const r2Base = getR2PublicBaseUrl();
    if (r2Base && normalized.startsWith(SVGL_PREFIX)) {
        return `${r2Base}${normalized}`;
    }
    return `${getAppOrigin()}${normalized}`;
}
