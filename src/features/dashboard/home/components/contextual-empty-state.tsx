'use client';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
interface ContextualEmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    secondaryActionLabel?: string;
    secondaryActionHref?: string;
    tips?: string[];
    className?: string;
}
export function ContextualEmptyState({ icon: Icon, title, description, actionLabel, actionHref, secondaryActionLabel, secondaryActionHref, tips, className, }: ContextualEmptyStateProps) {
    const tipItems = (tips ?? []).map((tip, tipIndex) => ({
        id: `tip-${tipIndex + 1}-${tip.slice(0, 16)}`,
        order: tipIndex + 1,
        tip,
    }));
    return (<Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent/10 text-primary mb-4">
          <Icon className="size-8"/>
        </div>
        
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
        
        <div className="mt-6 flex items-center gap-3">
          <Button asChild>
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="ml-2 size-4"/>
            </Link>
          </Button>
          
          {secondaryActionLabel && secondaryActionHref && (<Button variant="outline" asChild>
              <Link href={secondaryActionHref}>
                {secondaryActionLabel}
              </Link>
            </Button>)}
        </div>
        
        {tipItems.length > 0 && (<div className="mt-8 w-full max-w-md">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
              <Sparkles className="size-3"/>
              <span>Quick tips</span>
            </div>
            <ul className="space-y-2 text-left">
              {tipItems.map((tipItem) => (<li key={tipItem.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {tipItem.order}
                  </span>
                  {tipItem.tip}
                </li>))}
            </ul>
          </div>)}
      </CardContent>
    </Card>);
}
