'use client'

import { useCallback, type ChangeEvent, type ComponentProps, type ReactNode, type RefObject } from 'react'
import { AnimatePresence } from '@/shared/ui/motion'

import { panelUsesModalFocusTrap, type AgentPanelLayout } from '@/lib/agent-panel-layout'
import { cn } from '@/lib/utils'
import type { AgentError } from '@/lib/agent-errors'
import { Sheet, SheetContent } from '@/shared/ui/sheet'

import { AgentHistoryRail } from './agent-history-rail'
import { AgentModeHeader } from './agent-mode-panel-header'
import { AgentErrorBanner, RateLimitBanner } from './agent-mode-panel-composer'
import { stopPropagation } from './agent-mode-panel-message-utils'

export function AgentModePanelShell({
  isOpen,
  onOpenChange,
  panelLayout = 'docked',
  attachmentAccept,
  children,
  contextBanner,
  fileInputRef,
  headerProps,
  historyPanelProps,
  agentError,
  lastFailedMessage,
  onClearError,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelection,
  rateLimitCountdown,
  composerInputRef,
  onRequestClose,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onRequestClose?: () => void
  panelLayout?: AgentPanelLayout
  attachmentAccept: string
  children: ReactNode
  contextBanner?: ReactNode
  fileInputRef: RefObject<HTMLInputElement | null>
  headerProps: ComponentProps<typeof AgentModeHeader>
  historyPanelProps: ComponentProps<typeof AgentHistoryRail>
  agentError?: AgentError | null
  lastFailedMessage?: string | null
  onClearError?: () => void
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onFileSelection: (event: ChangeEvent<HTMLInputElement>) => void
  rateLimitCountdown?: number | null
  composerInputRef?: RefObject<HTMLTextAreaElement | null>
}) {
  const isFullscreen = panelLayout === 'fullscreen'
  const isCompact = panelLayout === 'compact'
  const isDocked = panelLayout === 'docked'
  const usesModal = panelUsesModalFocusTrap(panelLayout)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onRequestClose?.()
        return
      }
      onOpenChange(true)
    },
    [onOpenChange, onRequestClose],
  )

  const handleOpenAutoFocus = useCallback(
    (event: Event) => {
      event.preventDefault()
      composerInputRef?.current?.focus()
    },
    [composerInputRef],
  )

  const handleInteractOutside = useCallback(
    (event: Event) => {
      if (!usesModal) {
        event.preventDefault()
      }
    },
    [usesModal],
  )

  const shellBody = (
    <>
        <input
          ref={fileInputRef}
          type="file"
          accept={attachmentAccept}
          multiple
          className="hidden"
          onChange={onFileSelection}
        />

        <AgentModeHeader {...headerProps} panelLayout={panelLayout} />
        {contextBanner}

        {agentError && onClearError ? (
          <AgentErrorBanner
            error={agentError}
            lastFailedMessage={lastFailedMessage ?? null}
            onDismiss={onClearError}
          />
        ) : null}

        <AnimatePresence>
          {typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0 ? (
            <RateLimitBanner countdown={rateLimitCountdown} onDismiss={onClearError} />
          ) : null}
        </AnimatePresence>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {historyPanelProps.showHistory ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[10000] bg-black/45 backdrop-blur-[2px] md:hidden"
              aria-label="Close chat history"
              onClick={historyPanelProps.onClose}
            />
            <AgentHistoryRail
              {...historyPanelProps}
              layout="rail"
              className="max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[10001] max-md:border-r max-md:shadow-2xl"
            />
          </>
        ) : null}
        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col transition-[opacity,filter]',
            historyPanelProps.showHistory && 'max-md:pointer-events-none max-md:opacity-40 max-md:blur-[1px]',
          )}
        >
          {children}
        </div>
      </div>
    </>
  )

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange} modal={usesModal}>
      <SheetContent
        side="right"
        showOverlay={usesModal}
        overlayClassName={cn(
          usesModal && 'bg-black/50',
          isDocked && 'bg-black/15 pointer-events-none',
          isCompact && 'bg-transparent pointer-events-none',
        )}
        aria-labelledby="agent-mode-dialog-title"
        className={cn(
          'z-[9999] flex flex-col gap-0 overflow-hidden p-0 [&>button]:hidden',
          isFullscreen &&
            'inset-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none border-0 sm:max-w-none',
          isDocked &&
            'inset-y-0 right-0 left-auto h-full w-[min(480px,42vw)] max-w-[520px] border-l border-border/60 shadow-2xl max-md:inset-0 max-md:h-[100dvh] max-md:w-screen max-md:max-w-none',
          isCompact &&
            'inset-auto bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] top-auto left-auto h-[min(560px,calc(100dvh-5rem-env(safe-area-inset-bottom)))] w-[min(400px,calc(100vw-2rem))] max-w-[400px] rounded-2xl border border-border/60 shadow-2xl ring-1 ring-black/5 max-md:inset-0 max-md:h-[100dvh] max-md:w-screen max-md:max-w-none max-md:rounded-none max-md:ring-0',
        )}
        onOpenAutoFocus={handleOpenAutoFocus}
        onInteractOutside={handleInteractOutside}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onWheel={stopPropagation}
        onTouchMove={stopPropagation}
        onScroll={stopPropagation}
      >
        {shellBody}
      </SheetContent>
    </Sheet>
  )
}
