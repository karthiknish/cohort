import { m, type HTMLMotionProps } from '@/shared/ui/motion';
import { motionDurationSeconds } from '@/lib/motion';
export const tagMap = {
    div: m.div,
    section: m.section,
    article: m.article,
    ul: m.ul,
    li: m.li,
    main: m.main,
    form: m.form,
} as const;
export type MotionElement = keyof typeof tagMap;
export const defaultFadeInDuration = motionDurationSeconds.normal;
export const defaultStaggerInterval = motionDurationSeconds.fast * 0.5;
export type BaseMotionProps = HTMLMotionProps<'div'>;
export const WHILE_IN_VIEW_FADE = { opacity: 1 };
export const VIEWPORT_DEFAULT = { once: true, amount: 0.2 };
export const HIDDEN_VARIANTS_STAGGER = {};
