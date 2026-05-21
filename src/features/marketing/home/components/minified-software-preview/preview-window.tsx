'use client'

import { useCallback } from 'react'
import { Bot, ChevronLeft, ChevronRight, MessageSquare, Search, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

import { PREVIEW_DOT_PATTERN, WINDOW_STATUS_DOTS } from './constants'
import { AgentTabPanel } from './panels/agent-panel'
import { ClientsPanel } from './panels/clients-panel'
import { MeetingsPanel } from './panels/meetings-panel'
import { OverviewPanel } from './panels/overview-panel'
import { ProposalsPanel } from './panels/proposals-panel'
import { PREVIEW_TABS, PREVIEW_TAB_ORDER, SIDEBAR_EXTRA } from './tabs'
import type { MinifiedPreviewController } from './use-minified-preview'

type PreviewWindowProps = MinifiedPreviewController

export function PreviewWindow({
  activeTabId,
  activeMetricId,
  surfaceRef,
  tab,
  activeTabIndex,
  handleTabClick,
  handleTabKeyDown,
  handleMetricClick,
  stepTab,
}: PreviewWindowProps) {
  const handlePreviousTab = useCallback(() => stepTab(-1), [stepTab])
  const handleNextTab = useCallback(() => stepTab(1), [stepTab])

  return (
    <div
      ref={surfaceRef}
      className="relative overflow-hidden rounded-2xl border border-border/40 bg-background/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out motion-reduce:transition-none"
    >
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/60 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[7px]" aria-hidden="true">
            {WINDOW_STATUS_DOTS.map((dot) => (
              <span key={dot.id} className={cn('block h-[11px] w-[11px] rounded-full', dot.className)} />
            ))}
          </div>
          <div
            className="flex items-center gap-2 rounded-md border border-border/50 bg-background/80 px-3 py-1"
            aria-hidden="true"
          >
            <Search className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground/70">
              app.cohorts.ai/dashboard
            </span>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-success uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-success motion-reduce:animate-none animate-pulse" />
            Sample data
          </span>
          <span className="rounded-full border border-border/50 bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Interactive
          </span>
        </div>
      </div>

      <div className="border-b border-border/30 bg-muted/30 px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            aria-label="Previous preview section"
            onClick={handlePreviousTab}
            disabled={activeTabIndex <= 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <div className="flex min-w-0 flex-1 gap-1" role="group" aria-label="Preview sections">
            {PREVIEW_TAB_ORDER.map((id, index) => (
              <button
                key={id}
                type="button"
                data-tab-id={id}
                onClick={handleTabClick}
                className={cn(
                  'h-1 min-w-[12px] flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none',
                  index === activeTabIndex ? 'bg-primary' : 'bg-border/70 hover:bg-border',
                )}
                aria-label={`Show ${PREVIEW_TABS.find((t) => t.id === id)?.label ?? id} preview`}
                aria-current={index === activeTabIndex ? 'step' : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            aria-label="Next preview section"
            onClick={handleNextTab}
            disabled={activeTabIndex >= PREVIEW_TAB_ORDER.length - 1}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-[52px_1fr] lg:grid-cols-[52px_1fr_260px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] motion-reduce:opacity-20"
          style={PREVIEW_DOT_PATTERN}
        />

        <div className="hidden border-r border-border/30 bg-muted/30 py-3 sm:block">
          <div className="flex flex-col items-center gap-1" role="tablist" aria-label="Preview sections, sidebar">
            {PREVIEW_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                id={`preview-tab-d-${t.id}`}
                data-tab-id={t.id}
                role="tab"
                aria-selected={t.id === activeTabId}
                aria-controls="preview-panel-main"
                tabIndex={t.id === activeTabId ? 0 : -1}
                onClick={handleTabClick}
                onKeyDown={handleTabKeyDown}
                title={t.label}
                aria-label={`${t.label} preview`}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  t.id === activeTabId
                    ? 'bg-accent/12 text-primary shadow-sm'
                    : 'text-muted-foreground/55 hover:bg-muted/50 hover:text-muted-foreground',
                )}
              >
                <t.Icon className="h-4 w-4" aria-hidden />
              </button>
            ))}
            <div className="my-1 h-px w-5 bg-border/40" aria-hidden />
            <div aria-hidden="true">
              {SIDEBAR_EXTRA.map((item) => (
                <div
                  key={item.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/25"
                >
                  <item.Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="min-h-[380px] p-4 sm:p-5"
          role="tabpanel"
          id="preview-panel-main"
          aria-label={`${tab.label} workspace preview (sample)`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                {tab.eyebrow}
              </p>
              <h3 className="mt-1 truncate text-base font-semibold text-foreground sm:text-lg">{tab.label}</h3>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {tab.status}
            </div>
          </div>

          <div
            className="mb-4 flex snap-x snap-mandatory gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Preview sections, mobile"
          >
            {PREVIEW_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                id={`preview-tab-m-${t.id}`}
                data-tab-id={t.id}
                role="tab"
                aria-selected={t.id === activeTabId}
                aria-controls="preview-panel-main"
                tabIndex={t.id === activeTabId ? 0 : -1}
                onClick={handleTabClick}
                onKeyDown={handleTabKeyDown}
                aria-label={`${t.label} preview`}
                className={cn(
                  'flex snap-start shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  t.id === activeTabId
                    ? 'border-accent/30 bg-accent/8 text-primary'
                    : 'border-border/40 text-muted-foreground/60 hover:border-border/60 hover:bg-muted/30',
                )}
              >
                <t.Icon className="h-3 w-3 shrink-0" aria-hidden />
                {t.label}
              </button>
            ))}
          </div>

          <div
            key={activeTabId}
            className="animate-in fade-in-0 slide-in-from-right-2 duration-300 motion-reduce:animate-none"
          >
            {activeTabId === 'overview' ? (
              <OverviewPanel activeMetricId={activeMetricId} onMetricClick={handleMetricClick} />
            ) : null}
            {activeTabId === 'proposals' ? <ProposalsPanel /> : null}
            {activeTabId === 'clients' ? <ClientsPanel /> : null}
            {activeTabId === 'meetings' ? <MeetingsPanel /> : null}
            {activeTabId === 'agent' ? <AgentTabPanel /> : null}
          </div>
        </div>

        <div className="hidden border-l border-border/30 bg-accent/[0.03] lg:block">
          <div className="border-b border-border/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/70 uppercase">Agent</span>
            </div>
          </div>
          <div className="p-3.5">
            <div className="space-y-2.5">
              {tab.agentItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/30 bg-background/60 px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" />
                    <div>
                      <p className="text-[11px] font-medium leading-4 text-foreground/80">{item.text}</p>
                      <p className="mt-1 text-[9px] font-medium tracking-wide text-muted-foreground/50 uppercase">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/40 bg-background/70 px-3 py-2">
              <MessageSquare className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/40">Ask the agent anything…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
