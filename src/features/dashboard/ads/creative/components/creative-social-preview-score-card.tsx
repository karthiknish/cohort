'use client';
import { useMemo } from 'react';
import { LazyMotion, domAnimation, m } from '@/shared/ui/motion';
import { Activity } from 'lucide-react';
import { easings, fadeInUpVariants, transitions } from '@/lib/motion';
import { motionLoopSeconds } from '@/lib/animation-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import type { Creative } from './types';
import type { CreativePerformanceSummary } from './creative-social-preview-state';
const progressBarInitial: {
    width: number;
} = { width: 0 };
const progressBarTransition = { duration: motionLoopSeconds.shimmer, ease: easings.easeOut };
export function CreativeSocialPreviewScoreCard({ creative, performanceSummary, efficiencyScore, }: {
    creative: Creative;
    performanceSummary: CreativePerformanceSummary;
    efficiencyScore: number;
}) {
    const scoreCardTransition = ({ ...transitions.slow, delay: 0.2 });
    const progressBarAnimate = ({ width: `${efficiencyScore}%` });
    return (<LazyMotion features={domAnimation}>
      <m.div initial="hidden" animate="visible" variants={fadeInUpVariants} transition={scoreCardTransition}>
        <Card className="border border-border/60 bg-card shadow-lg rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-4 pt-8 px-8">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-primary/80">
              <div className="size-6 rounded-lg bg-accent/10 flex items-center justify-center">
                <Activity className="size-3.5 text-primary"/>
              </div>
              The Alpha Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-10">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-black tracking-tighter text-primary">{efficiencyScore}</span>
                  <span className="text-sm font-bold text-primary/40 leading-none">/ 100</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {performanceSummary.period}
                </p>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center gap-3 justify-end group">
                  <span className="text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">
                    ROAS
                  </span>
                  <span className="text-lg font-black tracking-tight">{performanceSummary.roas.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-3 justify-end group">
                  <span className="text-[10px] font-bold text-muted-foreground/40 group-hover:text-primary transition-colors">
                    CTR
                  </span>
                  <span className="text-lg font-black tracking-tight">{performanceSummary.ctr.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-3 w-full rounded-full bg-accent/5 border border-accent/5 p-0.5 overflow-hidden">
                <m.div initial={progressBarInitial} animate={progressBarAnimate} transition={progressBarTransition} className="h-full bg-info rounded-full shadow-sm"/>
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-30">
                <span>Underperforming</span>
                <span>Industry Leader</span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground font-medium text-center bg-background/30 backdrop-blur-sm p-4 rounded-2xl border border-muted-foreground/5 italic">
              &quot;This creative&apos;s conversion profile exceeds {Math.max(0, efficiencyScore - 10)}% of tested
              assets in the {creative.providerId}-network benchmarks.&quot;
            </p>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>);
}
