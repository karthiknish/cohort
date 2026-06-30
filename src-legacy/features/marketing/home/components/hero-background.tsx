'use client';
import { useMemo } from 'react';
import { LazyMotion, domAnimation, m } from '@/shared/ui/motion';
import { motionEasing, motionLoopSeconds } from '@/lib/animation-system';
import { cn } from '@/lib/utils';
const diagonalShimmerStyle = {
    backgroundImage: 'repeating-linear-gradient(115deg, rgb(from var(--primary) r g b / 0.35) 0px, rgb(from var(--primary) r g b / 0.35) 1px, transparent 1px, transparent 48px)',
} as const;
const orbs = [
    {
        id: 'hero-orb-primary-left',
        size: 280,
        blur: 'blur-3xl',
        gradient: 'from-primary/35 via-primary/12 to-transparent',
        initial: { x: -120, y: -140, scale: 0.9 },
        animate: { x: -80, y: -120, scale: 1.05 },
        delay: 0,
    },
    {
        id: 'hero-orb-accent-top',
        size: 240,
        blur: 'blur-2xl',
        gradient: 'from-accent/28 via-primary/18 to-transparent',
        initial: { x: 40, y: -60, scale: 0.85 },
        animate: { x: 20, y: -30, scale: 1 },
        delay: 1.5,
    },
    {
        id: 'hero-orb-warm-right',
        size: 220,
        blur: 'blur-3xl',
        gradient: 'from-secondary/22 via-primary/12 to-transparent',
        initial: { x: 140, y: 160, scale: 0.8 },
        animate: { x: 120, y: 130, scale: 0.94 },
        delay: 3,
    },
] as const;
const dotPatternStyle = {
    backgroundImage: 'radial-gradient(rgb(from var(--primary) r g b / 0.14) 1px, transparent 1px)',
    backgroundSize: '22px 22px',
} as const;
const gridPatternStyle = {
    backgroundImage: `
    linear-gradient(rgb(from var(--primary) r g b / 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(from var(--primary) r g b / 0.06) 1px, transparent 1px)
  `,
    backgroundSize: '72px 72px',
} as const;
function HeroOrb({ orb }: {
    orb: (typeof orbs)[number];
}) {
    const sizeStyle = ({ width: orb.size, height: orb.size });
    const transition = ({
        duration: motionLoopSeconds.heroOrbit,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: motionEasing.out,
        delay: orb.delay,
    });
    return (<m.span aria-hidden className={cn('absolute inline-block rounded-full bg-gradient-to-br motion-reduce:animate-none', orb.gradient, orb.blur)} style={sizeStyle} initial={orb.initial} animate={orb.animate} transition={transition}/>);
}
type HeroBackgroundProps = {
    className?: string;
};
/**
 * Full-bleed marketing hero backdrop: primary-tinted wash, dot + grid patterns, soft orbs.
 */
export function HeroBackground({ className }: HeroBackgroundProps) {
    return (<div className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)} aria-hidden>
      {/* Base gradient — avoids flat white */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.09] via-primary/[0.03] to-background"/>

      {/* Dot field */}
      <div className="absolute inset-0 opacity-40 motion-reduce:opacity-30" style={dotPatternStyle}/>

      {/* Subtle orthogonal grid */}
      <div className="absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_35%,black,transparent)] motion-reduce:opacity-40" style={gridPatternStyle}/>

      {/* Primary wash behind headline */}
      <div className="absolute inset-x-0 top-0 h-[min(100%,42rem)] bg-[radial-gradient(ellipse_90%_65%_at_50%_-5%,rgb(from_var(--primary)_r_g_b_/_0.16),transparent_62%)]"/>

      {/* Corner accents */}
      <div className="absolute -left-24 top-1/4 size-64 rounded-full bg-primary/10 blur-3xl"/>
      <div className="absolute -right-16 top-1/3 size-56 rounded-full bg-accent/10 blur-3xl"/>

      {/* Diagonal shimmer bands (very subtle) */}
      <div className="absolute inset-0 opacity-[0.04]" style={diagonalShimmerStyle}/>

      <LazyMotion features={domAnimation}>
        <div className="absolute inset-x-0 top-0 mx-auto h-[36rem] w-full max-w-6xl motion-reduce:opacity-80">
          {orbs.map((orb) => (<HeroOrb key={orb.id} orb={orb}/>))}
        </div>
      </LazyMotion>

      {/* Fade into page body */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/80 to-transparent"/>

      {/* Top edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"/>
    </div>);
}
