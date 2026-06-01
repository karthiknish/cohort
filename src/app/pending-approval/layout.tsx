import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'Account status',
    description: 'Check whether your workspace access is approved.',
    robots: { index: false, follow: false },
};
export default function PendingApprovalLayout({ children }: {
    children: React.ReactNode;
}) {
    return children;
}
