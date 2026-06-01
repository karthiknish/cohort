'use client';
import { notifyFailure } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { collaborationApi, collaborationChannelAvatarsApi } from '@/lib/convex-api';
import { uploadStorageFile } from '@/lib/upload-storage-file';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';
import { ChannelInfoHero, ChannelInfoTabs, } from './channel-info-dialog-sections';
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
export type ChannelInfoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    channel: Channel;
    channelMessages: CollaborationMessage[];
    channelParticipants: ClientTeamMember[];
    currentUserId: string | null;
    onPinnedMessageClick?: (messageId: string) => void;
    sharedFiles: CollaborationAttachment[];
    workspaceId: string;
    isAdmin: boolean;
    canManageMembers?: boolean;
    onManageMembers?: () => void;
};
export function ChannelInfoDialog({ open, onOpenChange, channel, channelMessages, channelParticipants, currentUserId, onPinnedMessageClick, sharedFiles, workspaceId, isAdmin, canManageMembers, onManageMembers, }: ChannelInfoDialogProps) {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const generateUploadUrl = useMutation(collaborationApi.generateUploadUrl);
    const syncMetadata = useMutation(collaborationApi.syncMetadata);
    const setChannelAvatar = useMutation(collaborationChannelAvatarsApi.setAvatar);
    const displayName = channel.name.startsWith('#') ? channel.name : `#${channel.name}`;
    const memberCount = channelParticipants.length;
    const handlePickPhoto = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !isAdmin)
            return;
        if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
            notifyFailure({
                title: 'Unsupported image',
                message: 'Use a JPEG, PNG, or WebP file.',
            });
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            notifyFailure({
                title: 'Image too large',
                message: 'Channel photos must be 2 MB or smaller.',
            });
            return;
        }
        setUploading(true);
        try {
            const storageId = await uploadStorageFile({
                file,
                contentType: file.type,
                generateUploadUrl: () => generateUploadUrl({}),
                syncMetadata: (args) => syncMetadata(args),
            });
            await setChannelAvatar({
                workspaceId,
                channelKey: channel.id,
                storageId,
            });
            toast({
                title: 'Channel photo updated',
                description: `${displayName} now has a new photo.`,
            });
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'channel-info-dialog.tsx:catch',
                title: 'Could not update photo',
                fallbackMessage: 'Could not update photo',
            });
        }
        finally {
            setUploading(false);
        }
    };
    const handleRemovePhoto = async () => {
        if (!isAdmin || !channel.avatarUrl)
            return;
        setRemoving(true);
        try {
            await setChannelAvatar({
                workspaceId,
                channelKey: channel.id,
                storageId: null,
            });
            toast({
                title: 'Channel photo removed',
                description: `${displayName} is using the default icon again.`,
            });
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'channel-info-dialog.tsx:catch',
                title: 'Could not remove photo',
                fallbackMessage: 'Could not remove photo',
            });
        }
        finally {
            setRemoving(false);
        }
    };
    const handleRemovePhotoClick = () => {
        void handleRemovePhoto();
    };
    const handleManageMembers = () => {
        onOpenChange(false);
        onManageMembers?.();
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,44rem)] w-[min(100vw-1.25rem,32rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg [&>button]:top-4 [&>button]:right-4 [&>button]:rounded-full [&>button]:bg-background/80 [&>button]:backdrop-blur-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>{displayName} channel info</DialogTitle>
          <DialogDescription>
            Members, shared files, and settings for this channel
          </DialogDescription>
        </DialogHeader>

        <ChannelInfoHero channel={channel} displayName={displayName} memberCount={memberCount} isAdmin={isAdmin} uploading={uploading} removing={removing} onPickPhoto={handlePickPhoto} onRemovePhoto={handleRemovePhotoClick}/>

        {isAdmin ? (<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload channel photo" className="sr-only" onChange={handleFileChange}/>) : null}

        <ChannelInfoTabs channel={channel} channelMessages={channelMessages} channelParticipants={channelParticipants} currentUserId={currentUserId} onPinnedMessageClick={onPinnedMessageClick} sharedFiles={sharedFiles} workspaceId={workspaceId} canManageMembers={canManageMembers} onManageMembers={onManageMembers ? handleManageMembers : undefined}/>
      </DialogContent>
    </Dialog>);
}
