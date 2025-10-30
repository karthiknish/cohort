'use client'

import { MessageSquare, Users } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { CollaborationChannelList } from './channel-list'
import { CollaborationMessagePane } from './message-pane'
import { CollaborationSidebar } from './sidebar'
import { useCollaborationData } from '../hooks/use-collaboration-data'
import { CollaborationSkeleton } from './collaboration-skeleton'

export function CollaborationDashboard() {
  const {
    channels,
    filteredChannels,
    searchQuery,
    setSearchQuery,
    selectedChannel,
    selectChannel,
    channelSummaries,
    channelMessages,
    isCurrentChannelLoading,
    isBootstrapping,
    messagesError,
    totalChannels,
    totalParticipants,
    channelParticipants,
    sharedFiles,
    senderSelection,
    setSenderSelection,
    messageInput,
    setMessageInput,
    handleSendMessage,
    sending,
    isSendDisabled,
    messagesEndRef,
  } = useCollaborationData()

  if (isBootstrapping) {
    return <CollaborationSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team collaboration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coordinate with teammates and clients in dedicated workspaces tied to each account.
          </p>
        </div>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> {totalChannels} channels
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {totalParticipants} teammates
            </Badge>
            {selectedChannel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> {channelMessages.length} messages in current thread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0 lg:flex-row">
          <CollaborationChannelList
            channels={channels}
            filteredChannels={filteredChannels}
            selectedChannel={selectedChannel}
            onSelectChannel={selectChannel}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            channelSummaries={channelSummaries}
          />

          <CollaborationMessagePane
            channel={selectedChannel}
            channelMessages={channelMessages}
            channelParticipants={channelParticipants}
            messagesError={messagesError}
            isLoading={isCurrentChannelLoading}
            senderSelection={senderSelection}
            onSenderSelectionChange={setSenderSelection}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={() => void handleSendMessage()}
            sending={sending}
            isSendDisabled={isSendDisabled}
            messagesEndRef={messagesEndRef}
          />

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <CollaborationSidebar
            channel={selectedChannel}
            channelParticipants={channelParticipants}
            sharedFiles={sharedFiles}
          />
        </CardContent>
      </Card>
    </div>
  )
}
