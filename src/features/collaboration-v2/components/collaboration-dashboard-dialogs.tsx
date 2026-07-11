'use client';

import { NewDMDialog } from '@/features/dashboard/collaboration/components/new-dm-dialog';
import { MessageForwardDialog } from '@/features/dashboard/collaboration/components/message-forward-dialog';
import type { CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';

type WorkspaceMember = {
  id: string;
  name: string;
  email?: string;
  role?: string;
};

export type CollaborationDashboardDialogsProps = {
  isNewDMDialogOpen: boolean;
  setIsNewDMDialogOpen: (open: boolean) => void;
  onUserSelect: (targetUser: { id: string; name: string; role?: string | null }) => Promise<void>;
  workspaceMembers: WorkspaceMember[];
  workspaceId: string | null;
  currentUserId: string | null;
  currentUserRole: string | null;
  forwardingMessage: CollaborationMessage | null;
  setForwardingMessage: (message: CollaborationMessage | null) => void;
  channels: Channel[];
  currentChannelId: string | null;
  taskModal: React.ReactNode;
  channelExtrasForwardDialog: React.ReactNode;
};

export function CollaborationDashboardDialogs({
  isNewDMDialogOpen,
  setIsNewDMDialogOpen,
  onUserSelect,
  workspaceMembers,
  workspaceId,
  currentUserId,
  currentUserRole,
  forwardingMessage,
  setForwardingMessage,
  channels,
  currentChannelId,
  taskModal,
  channelExtrasForwardDialog,
}: CollaborationDashboardDialogsProps) {
  return (
    <>
      <NewDMDialog
        open={isNewDMDialogOpen}
        onOpenChange={setIsNewDMDialogOpen}
        onUserSelect={onUserSelect}
        workspaceMembers={workspaceMembers}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

      <MessageForwardDialog
        message={forwardingMessage}
        channels={channels.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          clientId: c.clientId,
          projectId: c.projectId,
          isCustom: c.isCustom,
        }))}
        currentChannelId={currentChannelId}
        workspaceId={workspaceId}
        userId={currentUserId}
        open={forwardingMessage !== null}
        onOpenChange={(open) => {
          if (!open) setForwardingMessage(null);
        }}
      />

      {/* Task creation modal + extras forward dialog from useCollaborationChannelExtras */}
      {taskModal}
      {channelExtrasForwardDialog}
    </>
  );
}
