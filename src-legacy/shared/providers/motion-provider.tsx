'use client';
import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from '@/shared/ui/motion';
import { useMounted } from '@/shared/hooks/use-mounted';
interface MotionProviderProps {
    children: ReactNode;
}
export function MotionProvider({ children }: MotionProviderProps) {
    // `reducedMotion="user"` makes framer read the reduced-motion media query
    // synchronously while rendering `m` elements. The server can't detect that
    // preference, so a reduced-motion visitor would get different style/transform
    // output on the first client render than the server produced — a hydration
    // mismatch (React #418). Keep it `"never"` for SSR and the first client
    // render, then switch to `"user"` after mount so the preference is still
    // respected for all subsequent animations.
    const mounted = useMounted();
    return (<MotionConfig reducedMotion={mounted ? 'user' : 'never'}>
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>);
}
