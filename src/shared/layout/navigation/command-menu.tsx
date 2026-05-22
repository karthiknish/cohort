'use client'

import { useCallback, useState } from 'react'

import { CommandMenuDialog, CommandMenuTriggerButtons } from './command-menu-sections'
import type { CommandMenuProps } from './command-menu-types'
import { useCommandMenu } from './use-command-menu'

export function CommandMenu({ onOpenHelp, onOpenShortcuts }: CommandMenuProps) {
  const {
    open,
    query,
    setQuery,
    searchStatusMessage,
    isSearchLoading,
    groupedSearchResults,
    quickActionItems,
    navigationItems,
    handleOpen,
    handleOpenChange,
    handleNavigate,
    handleSettingsSelect,
    handleHelpSelect,
    handleKeyboardShortcutsSelect,
    showHelp,
  } = useCommandMenu({ onOpenHelp, onOpenShortcuts })

  return (
    <>
      <CommandMenuTriggerButtons open={open} onOpen={handleOpen} />

      <CommandMenuDialog
        open={open}
        query={query}
        searchStatusMessage={searchStatusMessage}
        isSearchLoading={isSearchLoading}
        groupedSearchResults={groupedSearchResults}
        quickActionItems={quickActionItems}
        navigationItems={navigationItems}
        onOpenChange={handleOpenChange}
        onQueryChange={setQuery}
                      onNavigate={handleNavigate}
        onSettingsSelect={handleSettingsSelect}
        onHelpSelect={handleHelpSelect}
        onKeyboardShortcutsSelect={handleKeyboardShortcutsSelect}
        showHelp={showHelp}
      />
    </>
  )
}

export function useCommandMenuState() {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  return { open, setOpen, toggle }
}
