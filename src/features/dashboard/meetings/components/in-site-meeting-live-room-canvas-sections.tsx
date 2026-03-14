'use client'

import {
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { LoaderCircle, Maximize2, Minimize2, PictureInPicture2, Radio, Sparkles } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'

import { InSiteMeetingRoomChat } from './in-site-meeting-room-chat'

type LayoutContextValue = ComponentProps<typeof LayoutContextProvider>['value']
type GridTracks = ComponentProps<typeof GridLayout>['tracks']

export function LiveRoomCanvasHeader({
  captureLabel,
  compact,
  isSupported,
  meetingTitle,
}: {
  captureLabel: string
  compact: boolean
  isSupported: boolean
  meetingTitle: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Live room</p>
        <p className={cn('mt-1 font-medium text-foreground', compact ? 'text-xs' : 'text-sm')}>{meetingTitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={captureLabel === 'Recording live' ? 'secondary' : 'outline'}>
          <Radio className="h-3 w-3" />
          {captureLabel}
        </Badge>
        <Badge variant={isSupported ? 'secondary' : 'outline'}>
          {isSupported ? 'Browser mic ready' : 'Browser mic unavailable'}
        </Badge>
      </div>
    </div>
  )
}

export function LiveRoomCanvasOverlay({
  aiStatusLabel,
  autoSyncing,
  canMinimize,
  captureLabel,
  compactBadgeTextColor,
  finalizingSession,
  isMinimized,
  notesProcessingState,
  onToggleMinimize,
  onTogglePictureInPicture,
  pipActive,
  pipSupported,
  transcriptProcessingState,
  useDarkChrome,
}: {
  aiStatusLabel: string
  autoSyncing: boolean
  canMinimize: boolean
  captureLabel: string
  compactBadgeTextColor?: string
  finalizingSession: boolean
  isMinimized: boolean
  notesProcessingState: 'idle' | 'processing' | 'failed'
  onToggleMinimize: () => void
  onTogglePictureInPicture: () => void
  pipActive: boolean
  pipSupported: boolean
  transcriptProcessingState: 'idle' | 'processing' | 'failed'
  useDarkChrome: boolean
}) {
  const chromeClassName = useDarkChrome
    ? 'border-white/15 bg-slate-950/45 text-white hover:bg-slate-900/60'
    : 'border border-border/60 bg-background/95'

  return (
    <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2">
      <div className="flex flex-wrap gap-2">
        <div
          className={cn(
            'pointer-events-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur',
            useDarkChrome
              ? 'border-rose-400/30 bg-rose-500/15 text-white'
              : 'border-rose-400/30 bg-rose-500/15 text-rose-50',
          )}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(251,113,133,0.18)] animate-pulse" />
          <span className={compactBadgeTextColor}>{captureLabel}</span>
        </div>

        {useDarkChrome ? (
          <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
            {autoSyncing || notesProcessingState === 'processing' || finalizingSession || transcriptProcessingState === 'processing' ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            )}
            {aiStatusLabel}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-auto flex gap-2">
        {pipSupported ? (
          <Button type="button" size="sm" variant="secondary" className={chromeClassName} onClick={onTogglePictureInPicture}>
            <PictureInPicture2 className="mr-2 h-3.5 w-3.5" />
            {pipActive ? 'Exit PiP' : 'Enter PiP'}
          </Button>
        ) : null}
        {canMinimize ? (
          <Button type="button" size="sm" variant="secondary" className={cn(chromeClassName, 'md:hidden')} onClick={onToggleMinimize}>
            {isMinimized ? <Maximize2 className="mr-2 h-3.5 w-3.5" /> : <Minimize2 className="mr-2 h-3.5 w-3.5" />}
            {isMinimized ? 'Restore room' : 'Send to tray'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function LiveRoomCanvasEmptyState({ compact }: { compact: boolean }) {
  return (
    <div
      className={cn(
        'relative flex h-full items-center justify-center rounded-[26px] border border-dashed border-border bg-muted/20 px-6 text-center',
        compact ? 'min-h-[150px]' : 'min-h-[420px]',
      )}
    >
      <div className="max-w-md space-y-3">
        <p className="text-sm font-medium text-foreground">Camera tiles will appear here once someone joins with video.</p>
        <p className="text-sm text-muted-foreground">
          You can still start the room, use audio-only mode, and capture transcript data for AI notes.
        </p>
      </div>
    </div>
  )
}

export function LiveRoomCanvasViewport({
  aiStatusLabel,
  autoSyncing,
  canMinimize,
  captureLabel,
  compact,
  finalizingSession,
  isMinimized,
  notesProcessingState,
  onToggleMinimize,
  onTogglePictureInPicture,
  pipActive,
  pipSupported,
  tracks,
  transcriptProcessingState,
}: {
  aiStatusLabel: string
  autoSyncing: boolean
  canMinimize: boolean
  captureLabel: string
  compact: boolean
  finalizingSession: boolean
  isMinimized: boolean
  notesProcessingState: 'idle' | 'processing' | 'failed'
  onToggleMinimize: () => void
  onTogglePictureInPicture: () => void
  pipActive: boolean
  pipSupported: boolean
  tracks: GridTracks
  transcriptProcessingState: 'idle' | 'processing' | 'failed'
}) {
  return (
    <div className={cn('min-h-0 flex-1 bg-background', compact ? 'p-2.5' : 'p-3 lg:p-4')}>
      {tracks.length > 0 ? (
        <div className="relative h-full">
          <LiveRoomCanvasOverlay
            aiStatusLabel={aiStatusLabel}
            autoSyncing={autoSyncing}
            canMinimize={canMinimize}
            captureLabel={captureLabel}
            finalizingSession={finalizingSession}
            isMinimized={isMinimized}
            notesProcessingState={notesProcessingState}
            onToggleMinimize={onToggleMinimize}
            onTogglePictureInPicture={onTogglePictureInPicture}
            pipActive={pipActive}
            pipSupported={pipSupported}
            transcriptProcessingState={transcriptProcessingState}
            useDarkChrome={true}
          />

          <GridLayout
            tracks={tracks}
            className={cn(
              'h-full rounded-[26px] border border-border/80 bg-muted/20 p-2',
              compact ? 'min-h-[150px]' : 'min-h-[420px]',
            )}
          >
            <ParticipantTile />
          </GridLayout>
          <InSiteMeetingRoomChat compact={compact} />
        </div>
      ) : (
        <div className="relative h-full">
          <LiveRoomCanvasOverlay
            aiStatusLabel={aiStatusLabel}
            autoSyncing={autoSyncing}
            canMinimize={canMinimize}
            captureLabel={captureLabel}
            compactBadgeTextColor=""
            finalizingSession={finalizingSession}
            isMinimized={isMinimized}
            notesProcessingState={notesProcessingState}
            onToggleMinimize={onToggleMinimize}
            onTogglePictureInPicture={onTogglePictureInPicture}
            pipActive={pipActive}
            pipSupported={pipSupported}
            transcriptProcessingState={transcriptProcessingState}
            useDarkChrome={false}
          />
          <LiveRoomCanvasEmptyState compact={compact} />
          <InSiteMeetingRoomChat compact={compact} />
        </div>
      )}
    </div>
  )
}

export function LiveRoomCanvasShell({
  aiStatusLabel,
  captureLabel,
  children,
  compact,
  isSupported,
  layoutContext,
  meetingTitle,
  roomViewportRef,
  shouldUseAssertiveLiveRegion,
}: {
  aiStatusLabel: string
  captureLabel: string
  children: ReactNode
  compact: boolean
  isSupported: boolean
  layoutContext: LayoutContextValue
  meetingTitle: string
  roomViewportRef: (node: HTMLDivElement | null) => void
  shouldUseAssertiveLiveRegion: boolean
}) {
  return (
    <LayoutContextProvider value={layoutContext}>
      <div
        ref={roomViewportRef}
        className={cn(
          'meeting-room-livekit-theme flex flex-col overflow-hidden border border-border bg-card shadow-sm',
          compact ? 'min-h-[220px] rounded-[28px]' : 'min-h-[560px] rounded-[32px]',
        )}
      >
        <p className="sr-only" aria-live={shouldUseAssertiveLiveRegion ? 'assertive' : 'polite'}>
          {`Recording state: ${captureLabel}. Automation state: ${aiStatusLabel}.`}
        </p>
        <LiveRoomCanvasHeader
          captureLabel={captureLabel}
          compact={compact}
          isSupported={isSupported}
          meetingTitle={meetingTitle}
        />

        {children}

        <div className={cn('border-t border-border bg-card/95 backdrop-blur', compact ? 'px-2.5 py-2.5' : 'px-3 py-3')}>
          <ControlBar controls={{ chat: false, settings: true }} />
        </div>

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  )
}