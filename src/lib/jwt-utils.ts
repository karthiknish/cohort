/** Decode JWT `sub` without verifying signature (token already obtained from trusted auth route). */
export function decodeJwtSubject(token: string): string | null {
    const parts = token.split('.');
    const payloadPart = parts[1];
    if (!payloadPart) {
        return null;
    }
    try {
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
            sub?: unknown;
        };
        return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
    }
    catch {
        return null;
    }
}
