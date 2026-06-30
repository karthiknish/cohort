'use client';
import { Link } from '@/shared/ui/link';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
type AdminClientsPageHeaderActionsProps = {
    clientsLoading: boolean;
    onRefresh: () => void;
};
export function AdminClientsPageHeaderActions({ clientsLoading, onRefresh }: AdminClientsPageHeaderActionsProps) {
    return (<>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/team">Team</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/admin">Admin home</Link>
      </Button>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={clientsLoading} className="inline-flex items-center gap-2">
        <LoaderCircle className={`size-4 ${clientsLoading ? 'animate-spin' : ''}`}/> Refresh
      </Button>
    </>);
}
