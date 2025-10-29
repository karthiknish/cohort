'use client'

import { useState } from 'react'
import {
  Plus,
  Search,
  MessageSquare,
  Users,
  Paperclip,
  Send,
  Phone,
  Video,
  Info,
  FileText,
  Image,
  Download,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type ChannelType = 'client' | 'team' | 'project'

interface Channel {
  id: string
  name: string
  type: ChannelType
  participants: string[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  clientId?: string
}

interface MessageAttachment {
  name: string
  size: string
  type: string
}

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  timestamp: string
  type: 'text' | 'file'
  attachments?: MessageAttachment[]
}

const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Tech Corp - Campaign Updates',
    type: 'client',
    participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    lastMessage: 'Q4 campaign performance looks great!',
    lastMessageTime: '2 min ago',
    unreadCount: 3,
    clientId: 'tech-corp'
  },
  {
    id: '2',
    name: 'Marketing Team',
    type: 'team',
    participants: ['John Doe', 'Jane Smith', 'Sarah Wilson', 'Mike Johnson'],
    lastMessage: 'Meeting at 3 PM today',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'StartupXYZ - Onboarding',
    type: 'client',
    participants: ['Sarah Wilson', 'Jane Smith'],
    lastMessage: 'Welcome onboard! Let\'s get started.',
    lastMessageTime: '3 hours ago',
    unreadCount: 1,
    clientId: 'startupxyz'
  },
  {
    id: '4',
    name: 'PPC Optimization Project',
    type: 'project',
    participants: ['Mike Johnson', 'John Doe'],
    lastMessage: 'Updated the bid strategy',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'john-doe',
    senderName: 'John Doe',
    senderAvatar: 'JD',
    content: 'Hey team, I just reviewed the Q4 campaign performance. The numbers look really strong!',
    timestamp: '10:30 AM',
    type: 'text'
  },
  {
    id: '2',
    senderId: 'jane-smith',
    senderName: 'Jane Smith',
    senderAvatar: 'JS',
    content: 'That\'s great news! ROAS is up 25% compared to last quarter.',
    timestamp: '10:35 AM',
    type: 'text'
  },
  {
    id: '3',
    senderId: 'mike-johnson',
    senderName: 'Mike Johnson',
    senderAvatar: 'MJ',
    content: 'I\'ve uploaded the performance report for your review.',
    timestamp: '10:40 AM',
    type: 'file',
    attachments: [
      {
        name: 'Q4_Performance_Report.pdf',
        size: '2.4 MB',
        type: 'pdf'
      }
    ]
  },
  {
    id: '4',
    senderId: 'sarah-wilson',
    senderName: 'Sarah Wilson',
    senderAvatar: 'SW',
    content: 'Excellent work team! Let\'s present this to the client tomorrow.',
    timestamp: '10:45 AM',
    type: 'text'
  }
]

const channelTypeColors: Record<ChannelType, string> = {
  client: 'bg-blue-100 text-blue-800',
  team: 'bg-green-100 text-green-800',
  project: 'bg-purple-100 text-purple-800',
}

export default function CollaborationPage() {
  const [selectedChannel, setSelectedChannel] = useState(mockChannels[0])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChannels = mockChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message
      setMessageInput('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team collaboration</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Communicate with teams and clients, share updates, and stay aligned in real-time.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New channel
        </Button>
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {mockChannels.length} active channels
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> Collaborative workspace
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0 lg:flex-row">
          <div className="flex h-full w-full flex-col border-b border-muted/40 lg:h-[640px] lg:w-80 lg:border-b-0 lg:border-r">
            <div className="p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search channels…"
                  className="pl-9"
                />
              </div>
            </div>
            <Separator className="lg:hidden" />
            <ScrollArea className="flex-1">
              <div className="space-y-2 p-3">
                {filteredChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      'h-auto w-full justify-start rounded-lg border border-transparent bg-transparent px-3 py-3 text-left shadow-none transition hover:bg-muted',
                      selectedChannel.id === channel.id && 'border-primary/40 bg-muted'
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {channel.name}
                          </p>
                          <Badge variant="outline" className={channelTypeColors[channel.type]}>
                            {channel.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {channel.lastMessage}
                        </p>
                        <span className="text-xs text-muted-foreground">{channel.lastMessageTime}</span>
                      </div>
                      {channel.unreadCount > 0 && (
                        <Badge className="shrink-0" variant="default">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex min-h-[480px] flex-1 flex-col lg:h-[640px]">
            <div className="flex items-start justify-between gap-3 border-b border-muted/40 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {selectedChannel.name}
                  </CardTitle>
                  <Badge variant="outline" className={channelTypeColors[selectedChannel.type]}>
                    {selectedChannel.type}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {selectedChannel.participants.join(', ')}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                {mockMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {message.senderAvatar}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{message.senderName}</p>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{message.content}</p>
                      {message.attachments && (
                        <div className="space-y-2">
                          {message.attachments.map((attachment) => (
                            <Card key={attachment.name} className="border-dashed border-muted/60 bg-muted/20">
                              <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">
                                    {attachment.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{attachment.size}</span>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-muted/40 p-4">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message…"
                  className="min-h-[48px] flex-1"
                />
                <Button onClick={handleSendMessage} className="h-9">
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <div className="flex w-full flex-col gap-6 border-t border-muted/40 p-4 text-sm text-muted-foreground lg:h-[640px] lg:w-64 lg:border-t-0">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Participants</p>
              <div className="space-y-2">
                {selectedChannel.participants.map((participant) => (
                  <div key={participant} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
                      {participant
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                    <span className="text-sm text-foreground">{participant}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Shared files</p>
              <Card className="border-muted/40 bg-muted/10">
                <CardContent className="flex items-center gap-2 p-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-xs text-foreground">Q4_Report.pdf</span>
                </CardContent>
              </Card>
              <Card className="border-muted/40 bg-muted/10">
                <CardContent className="flex items-center gap-2 p-3">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-xs text-foreground">Campaign_Ad.jpg</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
