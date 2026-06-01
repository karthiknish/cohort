import { WorkspaceLayout } from '@/shared/layout/workspace-layout';
export const dynamic = 'force-dynamic';
export default function DashboardLayout({ children }: {
    children: React.ReactNode;
}) {
    return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
