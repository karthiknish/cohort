'use client';
import type { ComponentProps, ReactNode } from 'react';
import { FadeIn } from '@/shared/ui/animate-in';
import { TabsContent } from '@/shared/ui/tabs-content';
type MotionTabsContentProps = Omit<ComponentProps<typeof TabsContent>, 'value'> & {
    activeTab: string;
    tabValue: string;
    children: ReactNode;
    y?: number;
    duration?: number;
};
export function MotionTabsContent({ activeTab, tabValue, children, className, y = 10, duration = 0.2, ...props }: MotionTabsContentProps) {
    return (<TabsContent value={tabValue} className={className} {...props}>
      <FadeIn key={`${tabValue}-${activeTab}`} y={y} duration={duration}>
        {children}
      </FadeIn>
    </TabsContent>);
}
