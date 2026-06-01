'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { agencyOnlyPrefixes } from '@/lib/access-control/dashboard-access';
import { RoleAccessGate } from '@/shared/components/role-access-gate';
function isAgencyOnlyPath(pathname: string): boolean {
    return agencyOnlyPrefixes().some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
/** Blocks client users from agency-only dashboard routes (Ads, Socials). */
export function DashboardAgencyRoutesGate({ children }: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    if (!isAgencyOnlyPath(pathname)) {
        return children;
    }
    return <RoleAccessGate>{children}</RoleAccessGate>;
}
