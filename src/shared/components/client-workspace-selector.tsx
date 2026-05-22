'use client'

import { cn } from '@/lib/utils'

import {
  ManageWorkspacesButton,
  ManageWorkspacesDialog,
  WorkspaceSelect,
} from './client-workspace-selector-sections'
import type { ClientWorkspaceSelectorProps } from './client-workspace-selector-types'
import { useClientWorkspaceSelector } from './use-client-workspace-selector'

export function ClientWorkspaceSelector({ className }: ClientWorkspaceSelectorProps) {
  const {
    isAdmin,
    hasClients,
    clients,
    isSheetOpen,
    newClientName,
    accountManagerInput,
    teamInput,
    saving,
    removingId,
    errorMessage,
    mentionableUsers,
    placeholder,
    selectValue,
    selectedLabel,
    handleSheetChange,
    handleClientNameChange,
    handleAccountManagerChange,
    handleTeamChange,
    handleRemoveClient,
    handleOpenSheet,
    handleCloseSheet,
    handleSaveClientClick,
    handleValueChange,
  } = useClientWorkspaceSelector({ className })

  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <WorkspaceSelect
        clients={clients}
        hasClients={hasClients}
        selectValue={selectValue}
        selectedLabel={selectedLabel}
        placeholder={placeholder}
        onValueChange={handleValueChange}
      />

      {isAdmin && (
        <>
          <ManageWorkspacesButton onClick={handleOpenSheet} />

          <ManageWorkspacesDialog
            isOpen={isSheetOpen}
            onOpenChange={handleSheetChange}
            newClientName={newClientName}
            accountManagerInput={accountManagerInput}
            teamInput={teamInput}
            saving={saving}
            removingId={removingId}
            errorMessage={errorMessage}
            clients={clients}
            mentionableUsers={mentionableUsers}
            onClientNameChange={handleClientNameChange}
            onAccountManagerChange={handleAccountManagerChange}
            onTeamChange={handleTeamChange}
            onRemoveClient={handleRemoveClient}
            onClose={handleCloseSheet}
            onSave={handleSaveClientClick}
          />
        </>
      )}
    </div>
  )
}
