'use client';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { getButtonClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
export function ForYouShell() {
    return (<header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <Link href="/for-you" className="flex shrink-0 items-center transition-opacity hover:opacity-80" aria-label="Cohorts home">
          <Image src="/logo.svg" alt="" width={80} height={80} className="size-14 sm:h-16 sm:w-16" priority/>
        </Link>
        <Button asChild size="sm" variant="outline" className={cn('shadow-sm', getButtonClasses('outline'))}>
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden="true" className="mr-2 size-4"/>
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </header>);
}
