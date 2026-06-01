'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { FadeIn } from '@/shared/ui/animate-in';
import { cn } from '@/lib/utils';
type AuthPanelProps = {
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    backHref?: string;
    backLabel?: string;
    className?: string;
};
export function AuthBackLink({ href = '/auth', label = 'Back to sign in', className, }: {
    href?: string;
    label?: string;
    className?: string;
}) {
    return (<Link href={href} className={cn('inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground', className)}>
      <ArrowLeft className="size-4 shrink-0" aria-hidden/>
      {label}
    </Link>);
}
export function AuthPanel({ title, description, icon, children, footer, backHref = '/auth', backLabel = 'Back to sign in', className, }: AuthPanelProps) {
    return (<FadeIn as="section" className={cn('mx-auto w-full max-w-md lg:max-w-120', className)}>
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl shadow-primary/5 ring-1 ring-border/40 backdrop-blur-sm motion-reduce:shadow-md">
        <div className="border-b border-border/50 px-6 py-5 sm:px-8">
          <AuthBackLink href={backHref} label={backLabel} className="mb-5"/>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            {icon ? (<span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                {icon}
              </span>) : null}
            <div className="min-w-0 space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
              {description ? (<p className="text-pretty text-sm leading-relaxed text-muted-foreground">{description}</p>) : null}
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:px-8 sm:py-7">{children}</div>
        {footer ? (<div className="border-t border-border/50 bg-muted/20 px-6 py-4 text-center text-xs text-muted-foreground sm:px-8">
            {footer}
          </div>) : null}
      </div>
    </FadeIn>);
}
