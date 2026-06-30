'use client';
import { useInSiteMeetingRoomChat } from './use-in-site-meeting-room-chat';
import type { InSiteMeetingRoomChatProps } from './in-site-meeting-room-chat-state';
export type { InSiteMeetingRoomChatProps } from './in-site-meeting-room-chat-state';
export function InSiteMeetingRoomChat(props: InSiteMeetingRoomChatProps) {
    return useInSiteMeetingRoomChat(props);
}
