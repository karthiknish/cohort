'use client';
import { LoaderCircle } from 'lucide-react';
import { dynamic } from '@/shared/ui/dynamic';

function CommandMenuLoading() {
    return (
        <div className="flex items-center justify-center p-8" aria-live="polite">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden />
            <span className="sr-only">Loading command menu…</span>
        </div>
    );
}

/** Defer cmdk + command palette chunk until after shell paint. */
export const CommandMenuDynamic = dynamic(
    () => import('./command-menu').then((m) => m.CommandMenu),
    { ssr: false, loading: () => <CommandMenuLoading /> },
);
