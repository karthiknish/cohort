'use client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion';
import { motionEasing } from '@/lib/motion';
import { useMounted } from '@/shared/hooks/use-mounted';
import { defaultFadeInDuration, tagMap, VIEWPORT_DEFAULT, WHILE_IN_VIEW_FADE, type BaseMotionProps, type MotionElement, } from './animate-in-shared';
type FadeInItemProps = Omit<BaseMotionProps, 'initial' | 'animate' | 'variants' | 'whileInView' | 'viewport' | 'transition'> & {
    as?: MotionElement;
    y?: number;
    duration?: number;
    children?: ReactNode;
    className?: string;
    initial?: BaseMotionProps['initial'];
    whileInView?: BaseMotionProps['whileInView'];
    viewport?: BaseMotionProps['viewport'];
};
export function FadeInItem({ children, as, y = 18, duration = defaultFadeInDuration, initial, whileInView, viewport, ...props }: FadeInItemProps) {
    const mounted = useMounted();
    const prefersReducedMotion = useReducedMotion();
    const Tag = (as ? tagMap[as] : m.div) as typeof m.div;
    const resolvedViewport = viewport ?? VIEWPORT_DEFAULT;
    const variants = ({
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: motionEasing.out } },
    });
    if (mounted && prefersReducedMotion) {
        return (<LazyMotion features={domAnimation}>
        <Tag initial={false} whileInView={WHILE_IN_VIEW_FADE} viewport={resolvedViewport} {...props}>
          {children}
        </Tag>
      </LazyMotion>);
    }
    return (<LazyMotion features={domAnimation}>
      <Tag initial={initial ?? 'hidden'} whileInView={whileInView ?? 'visible'} viewport={resolvedViewport} variants={variants} {...props}>
        {children}
      </Tag>
    </LazyMotion>);
}
