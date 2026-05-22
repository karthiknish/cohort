'use client'

import { CircleHelp, Keyboard, Search, Settings } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/ui/command'
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'

import { COMMAND_MENU_STATUS_ID } from './command-menu-types'
import { CommandMenuActionItem, CommandMenuRouteItem } from './command-menu-items'

type CommandMenuDialogProps = {
  open: boolean
  query: string
  searchStatusMessage: string
  isSearchLoading: boolean
  groupedSearchResults: Record<string, Array<{
    id: string
    href: string
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }>>
  quickActionItems: Array<{
    name: string
    action: string
    icon: React.ComponentType<{ className?: string }>
    description: string
  }>
  navigationItems: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    description: string
  }>
  onOpenChange: (open: boolean) => void
  onQueryChange: (value: string) => void
  onNavigate: (href: string) => void
  onSettingsSelect: () => void
  onHelpSelect?: () => void
  onKeyboardShortcutsSelect: () => void
  showHelp: boolean
}

export function CommandMenuTriggerButtons({
  open,
  onOpen,
}: {
  open: boolean
  onOpen: () => void
}) {
  return (
    <>
      <button
        id="tour-command-menu-mobile"
        onClick={onOpen}
        className="inline-flex sm:hidden items-center justify-center rounded-md border border-input bg-background p-2 text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
        aria-label="Open quick navigation"
        aria-expanded={open}
        aria-haspopup="dialog"
        type="button"
      >
        <Search className="size-4 shrink-0" aria-hidden />
      </button>

      <button
        id="tour-command-menu"
        onClick={onOpen}
        type="button"
        aria-label="Search and quick navigation"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="hidden sm:inline-flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="flex-1 text-left truncate">Quick navigation…</span>
        <KeyboardShortcutBadge combo="mod+k" />
      </button>
    </>
  )
}

export function CommandMenuDialog({
  open,
  query,
  searchStatusMessage,
  isSearchLoading,
  groupedSearchResults,
  quickActionItems,
  navigationItems,
  onOpenChange,
  onQueryChange,
  onNavigate,
  onSettingsSelect,
  onHelpSelect,
  onKeyboardShortcutsSelect,
  showHelp,
}: CommandMenuDialogProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <output
        id={COMMAND_MENU_STATUS_ID}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {searchStatusMessage}
      </output>
      <CommandInput
        placeholder="Search pages, actions, clients, tasks, projects, or proposals…"
        value={query}
        onValueChange={onQueryChange}
        aria-label="Search pages, actions, clients, tasks, projects, or proposals"
        aria-describedby={COMMAND_MENU_STATUS_ID}
      />
      <CommandList aria-busy={isSearchLoading} aria-label="Quick navigation results">
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(groupedSearchResults).length > 0 ? (
          <>
            {Object.entries(groupedSearchResults).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => (
                  <CommandMenuRouteItem
                    key={item.id}
                    description={item.description}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    onNavigate={onNavigate}
                  />
                ))}
              </CommandGroup>
            ))}

            <CommandSeparator />
          </>
        ) : null}

        <CommandGroup heading="Quick Actions">
          {quickActionItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandMenuRouteItem
                key={item.name}
                description={item.description}
                href={item.action}
                icon={Icon}
                label={item.name}
                onNavigate={onNavigate}
              />
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandMenuRouteItem
                key={item.name}
                description={item.description}
                href={item.href}
                icon={Icon}
                label={item.name}
                onNavigate={onNavigate}
              />
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandMenuActionItem icon={Settings} label="Settings" onSelect={onSettingsSelect} />
          {showHelp && onHelpSelect && (
            <CommandMenuActionItem icon={CircleHelp} label="Help & Shortcuts" onSelect={onHelpSelect}>
              <CommandShortcut>?</CommandShortcut>
            </CommandMenuActionItem>
          )}
          <CommandMenuActionItem
            icon={Keyboard}
            label="Keyboard shortcuts"
            onSelect={onKeyboardShortcutsSelect}
          >
            <CommandShortcut>?</CommandShortcut>
          </CommandMenuActionItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
