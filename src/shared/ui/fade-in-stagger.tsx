'use client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion';
import { useMounted } from '@/shared/hooks/use-mounted';
import { defaultFadeInDuration, defaultStaggerInterval, HIDDEN_VARIANTS_STAGGER, tagMap, VIEWPORT_DEFAULT, WHILE_IN_VIEW_FADE, type BaseMotionProps, type MotionElement, } from './animate-in-shared';
type FadeInStaggerProps = Omit<BaseMotionProps, 'initial' | 'animate' | 'variants' | 'whileInView' | 'viewport'> & {
    as?: MotionElement;
    delay?: number;
    duration?: number;
    stagger?: number;
    children?: ReactNode;
    className?: string;
};
export function FadeInStagger({ children, as, delay = 0, duration = defaultFadeInDuration, stagger = defaultStaggerInterval, ...props }: FadeInStaggerProps) {
    const mounted = useMounted();
    const prefersReducedMotion = useReducedMotion();
    const Tag = (as ? tagMap[as] : m.div) as typeof m.div;
    const variants = ({
        hidden: HIDDEN_VARIANTS_STAGGER,
        visible: { transition: { staggerChildren: stagger, delayChildren: delay, duration } },
    });
    const reducedMotion = mounted && prefersReducedMotion;
    return (<LazyMotion features={domAnimation}>
      <Tag initial={reducedMotion ? false : 'hidden'} whileInView={reducedMotion ? WHILE_IN_VIEW_FADE : 'visible'} viewport={VIEWPORT_DEFAULT} variants={reducedMotion ? undefined : variants} {...props}>
        {children}
      </Tag>
    </LazyMotion>);
}
