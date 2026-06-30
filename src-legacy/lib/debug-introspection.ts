import { NotFoundError } from '@/lib/api-errors';
/**
 * Whether admin debug introspection routes/queries are available.
 * Off in production unless ENABLE_DEBUG_INTROSPECTION=true.
 */
export function isDebugIntrospectionEnabled(): boolean {
    const flag = process.env.ENABLE_DEBUG_INTROSPECTION;
    if (flag === 'true')
        return true;
    if (flag === 'false')
        return false;
    return process.env.NODE_ENV !== 'production';
}
export function assertDebugIntrospectionEnabled(): void {
    if (!isDebugIntrospectionEnabled()) {
        throw new NotFoundError('Not found');
    }
}
