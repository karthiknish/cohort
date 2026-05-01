'use client'

import { Keyboard } from 'lucide-react'
import { useMemo } from 'react'

import { useAuth } from '@/shared/contexts/auth-context'
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'

import { getShortcutsForRole, type ShortcutContext } from './keyboard-shortcuts'

interface KeyboardShortcutsOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  includeContexts?: ShortcutContext[]
}

export function KeyboardShortcutsOverlay({
  open,
  onOpenChange,
  includeContexts = ['global', 'proposal-builder'],
}: KeyboardShortcutsOverlayProps) {
  const { user } = useAuth()

  const shortcuts = useMemo(() => {
    return includeContexts.flatMap((context) => getShortcutsForRole(user?.role, context))
  }, [includeContexts, user?.role])

  const groupedShortcuts = useMemo(() => {
    return shortcuts.reduce<Record<string, typeof shortcuts>>((accumulator, shortcut) => {
      if (!accumulator[shortcut.group]) {
        accumulator[shortcut.group] = []
      }

      accumulator[shortcut.group]!.push(shortcut)
      return accumulator
    }, {})
  }, [shortcuts])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-muted/40 px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Keyboard className="h-5 w-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use global navigation shortcuts anywhere in the dashboard, with extra commands available inside the proposal builder.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6 py-5">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([group, items]) => (
              <section key={group} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {group}
                  </h3>
                  <div className="h-px flex-1 bg-border/60" aria-hidden />
                </div>
                <div className="grid gap-2">
                  {items.map((shortcut) => (
                    <div
                      key={`${shortcut.context}-${shortcut.combo}-${shortcut.description}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-muted/40 bg-muted/10 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{shortcut.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {shortcut.context === 'proposal-builder' ? 'Proposal builder only' : 'Available globally'}
                        </p>
                      </div>
                      <KeyboardShortcutBadge combo={shortcut.combo} className="shrink-0" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}