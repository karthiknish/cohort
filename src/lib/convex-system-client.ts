import { ConvexHttpClient } from 'convex/browser';
type AdminAuthClient = ConvexHttpClient & {
    setAdminAuth?: (token: string, identity: {
        issuer: string;
        subject: string;
    }) => void;
};
let systemClient: ConvexHttpClient | null = null;
/** Server-side Convex client for internal mutations (rate limits, alerts, etc.). */
export function getSystemConvexClient(): ConvexHttpClient | null {
    if (systemClient)
        return systemClient;
    const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
    const deployKey = process.env.CONVEX_DEPLOY_KEY ??
        process.env.CONVEX_DEV_DEPLOY_KEY ??
        process.env.CONVEX_PROD_DEPLOY_KEY ??
        process.env.CONVEX_ADMIN_KEY ??
        process.env.CONVEX_ADMIN_TOKEN;
    if (!url || !deployKey) {
        return null;
    }
    systemClient = new ConvexHttpClient(url);
    (systemClient as AdminAuthClient).setAdminAuth?.(deployKey, {
        issuer: 'system',
        subject: 'server',
    });
    return systemClient;
}
