'use client';
import { Mic, ShieldCheck } from 'lucide-react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion';
import { fadeInUpVariants, pressableScaleClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
type MeetingRecordingPromptCardProps = {
    canRecord: boolean;
    captureError: string | null;
    captureSupported: boolean;
    inRoom: boolean;
    recordingEnabled: boolean;
    onEnableRecording: () => void;
    compact?: boolean;
};
export function MeetingRecordingPromptCard({ canRecord, captureError, captureSupported, inRoom, recordingEnabled, onEnableRecording, compact = false, }: MeetingRecordingPromptCardProps) {
    const prefersReducedMotion = useReducedMotion();
    const visible = inRoom && !recordingEnabled && canRecord;
    return (<AnimatePresence>
      {visible ? (<LazyMotion features={domAnimation}>
          {!captureSupported ? (<m.div key="unsupported" initial={prefersReducedMotion ? false : 'hidden'} animate={prefersReducedMotion ? undefined : 'visible'} exit={prefersReducedMotion ? undefined : 'exit'} variants={fadeInUpVariants}>
              <Alert className={compact ? 'text-xs' : undefined}>
                <AlertTitle>Transcript recording unavailable</AlertTitle>
                <AlertDescription>
                  This browser does not support live speech capture. Use Chrome on desktop for automatic meeting transcripts.
                </AlertDescription>
              </Alert>
            </m.div>) : (<m.div key="consent" initial={prefersReducedMotion ? false : 'hidden'} animate={prefersReducedMotion ? undefined : 'visible'} exit={prefersReducedMotion ? undefined : 'exit'} variants={fadeInUpVariants} className="rounded-2xl border border-warning/30 bg-warning/5 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Record this meeting</p>
                  <p className="text-sm text-foreground">
                    Start transcript capture when you are ready. Cohorts listens locally in your browser, saves the transcript,
                    then generates Gemini meeting notes with guardrails after enough conversation is captured.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0"/>
                    <span>Allow microphone access when prompted. Only spoken content in the room is transcribed.</span>
                  </div>
                  {captureError ? <p className="text-xs text-destructive">{captureError}</p> : null}
                </div>
                <Button type="button" size="sm" className={cn(pressableScaleClass)} onClick={onEnableRecording}>
                  <Mic className="size-4"/>
                  Start recording transcript
                </Button>
              </div>
            </m.div>)}
        </LazyMotion>) : null}
    </AnimatePresence>);
}
