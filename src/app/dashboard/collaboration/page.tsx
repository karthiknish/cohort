'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Users,
  Paperclip,
  Send,
  MoreHorizontal,
  Phone,
  Video,
  Info,
  FileText,
  Image,
  Download
} from 'lucide-react'

const mockChannels = [
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

const mockMessages = [
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

const channelTypeColors = {
  'client': 'bg-blue-100 text-blue-800',
  'team': 'bg-green-100 text-green-800',
  'project': 'bg-purple-100 text-purple-800'
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="mt-2 text-sm text-gray-700">
            Communicate with your team and clients in real-time.
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <Plus className="h-4 w-4 mr-2" />
          New Channel
        </button>
      </div>

      <div className="flex-1 flex space-x-6 bg-white rounded-lg shadow overflow-hidden">
        {/* Channels Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search channels..."
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {filteredChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedChannel.id === channel.id ? 'bg-indigo-50 border-indigo-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {channel.name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${channelTypeColors[channel.type]}`}>
                          {channel.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {channel.lastMessage}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{channel.lastMessageTime}</span>
                        {channel.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                            {channel.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-gray-900">{selectedChannel.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${channelTypeColors[selectedChannel.type]}`}>
                    {selectedChannel.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedChannel.participants.join(', ')}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Info className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {mockMessages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">{message.senderAvatar}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{message.senderName}</p>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">{message.content}</p>
                    {message.attachments && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{attachment.size}</p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-indigo-600">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Paperclip className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Type a message..."
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-64 border-l border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Channel Info</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Participants</p>
              <div className="mt-2 space-y-2">
                {selectedChannel.participants.map((participant) => (
                  <div key={participant} className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {participant.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{participant}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shared Files</p>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">Q4_Report.pdf</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <Image className="h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">Campaign_Ad.jpg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
