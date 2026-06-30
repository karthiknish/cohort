'use client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { LazyMotion, domAnimation, m, type HTMLMotionProps, useReducedMotion } from '@/shared/ui/motion';
import { motionEasing } from '@/lib/motion';
import { useMounted } from '@/shared/hooks/use-mounted';
import { defaultFadeInDuration, tagMap, VIEWPORT_DEFAULT, WHILE_IN_VIEW_FADE, type MotionElement, } from './animate-in-shared';
export { FadeInStagger } from './fade-in-stagger';
export { FadeInItem } from './fade-in-item';
type BaseMotionProps = HTMLMotionProps<'div'>;
type FadeInProps = Omit<BaseMotionProps, 'initial' | 'animate' | 'variants' | 'whileInView' | 'viewport' | 'transition'> & {
    as?: MotionElement;
    delay?: number;
    duration?: number;
    y?: number;
    children?: ReactNode;
    className?: string;
};
export function FadeIn({ children, as, delay = 0, duration = defaultFadeInDuration, y = 16, ...props }: FadeInProps) {
    const mounted = useMounted();
    const prefersReducedMotion = useReducedMotion();
    const Tag = (as ? tagMap[as] : m.div) as typeof m.div;
    const initial = ({ opacity: 0, y });
    const whileInViewFull = ({ opacity: 1, y: 0 });
    const transition = ({ delay, duration, ease: motionEasing.out });
    if (mounted && prefersReducedMotion) {
        return (<LazyMotion features={domAnimation}>
        <Tag initial={false} whileInView={WHILE_IN_VIEW_FADE} viewport={VIEWPORT_DEFAULT} {...props}>
          {children}
        </Tag>
      </LazyMotion>);
    }
    return (<LazyMotion features={domAnimation}>
      <Tag initial={initial} whileInView={whileInViewFull} viewport={VIEWPORT_DEFAULT} transition={transition} {...props}>
        {children}
      </Tag>
    </LazyMotion>);
}
