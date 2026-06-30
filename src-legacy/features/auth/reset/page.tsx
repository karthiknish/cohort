import ResetPasswordPageClient from './reset-password-page-client';
type RouteSearchParams = Record<string, string | string[] | undefined>;
type ResetPasswordPageProps = {
    searchParams?: RouteSearchParams | Promise<RouteSearchParams>;
};
function getFirstSearchParam(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }
    return typeof value === 'string' ? value : null;
}
export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const resolvedSearchParams = await searchParams;
    return <ResetPasswordPageClient oobCode={getFirstSearchParam(resolvedSearchParams?.oobCode)}/>;
}
