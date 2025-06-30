import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import { X, Send, Users, Globe, Hash, Smile } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: number;
  channelType: 'global' | 'guild' | 'private';
  channelId?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  type: 'global' | 'guild' | 'private';
  icon: string;
  memberCount?: number;
  isActive: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  user: any;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  gameState,
  user
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock channels
  useEffect(() => {
    const mockChannels: ChatChannel[] = [
      {
        id: 'global',
        name: 'Global Chat',
        type: 'global',
        icon: '🌍',
        memberCount: 1247,
        isActive: true
      },
      {
        id: 'guild-shadow',
        name: 'Shadow Covenant',
        type: 'guild',
        icon: '🌙',
        memberCount: 25,
        isActive: true
      },
      {
        id: 'guild-divine',
        name: 'Divine Order',
        type: 'guild',
        icon: '✨',
        memberCount: 18,
        isActive: false
      },
      {
        id: 'summoning-help',
        name: 'Summoning Help',
        type: 'global',
        icon: '🔮',
        memberCount: 892,
        isActive: true
      },
      {
        id: 'trading',
        name: 'Trading Hub',
        type: 'global',
        icon: '💰',
        memberCount: 634,
        isActive: true
      }
    ];
    
    setChannels(mockChannels);
    setSelectedChannel(mockChannels[0]);
  }, []);

  // Mock messages
  useEffect(() => {
    if (selectedChannel) {
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: 'user1',
          senderUsername: 'ShadowMaster',
          message: 'Just summoned a legendary demon! The ritual circle was perfect tonight.',
          timestamp: Date.now() - 5 * 60 * 1000,
          channelType: selectedChannel.type,
          channelId: selectedChannel.id
        },
        {
          id: '2',
          senderId: 'user2',
          senderUsername: 'CelestialSeeker',
          message: 'Congrats! What runes did you use? I\'ve been trying to get a legendary for weeks.',
          timestamp: Date.now() - 4 * 60 * 1000,
          channelType: selectedChannel.type,
          channelId: selectedChannel.id
        },
        {
          id: '3',
          senderId: 'user3',
          senderUsername: 'VoidWalker',
          message: 'The weather system really makes a difference. Stormy nights have been giving me better results.',
          timestamp: Date.now() - 3 * 60 * 1000,
          channelType: selectedChannel.type,
          channelId: selectedChannel.id
        },
        {
          id: '4',
          senderId: 'user1',
          senderUsername: 'ShadowMaster',
          message: '@CelestialSeeker I used rage, chaos, fire, and void. The combination was intense!',
          timestamp: Date.now() - 2 * 60 * 1000,
          channelType: selectedChannel.type,
          channelId: selectedChannel.id
        },
        {
          id: '5',
          senderId: 'user4',
          senderUsername: 'MysticSeer',
          message: 'Anyone want to trade? I have a shiny rare divine entity looking for a good demon.',
          timestamp: Date.now() - 1 * 60 * 1000,
          channelType: selectedChannel.type,
          channelId: selectedChannel.id
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedChannel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedChannel || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderUsername: user.username || 'Anonymous',
      message: currentMessage.trim(),
      timestamp: Date.now(),
      channelType: selectedChannel.type,
      channelId: selectedChannel.id
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');

    // In a real implementation, you would send this to your backend
    // await sendMessageToBackend(newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full h-[80vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex h-full">
          {/* Channel Sidebar */}
          <div className="w-64 border-r border-purple-500/30 p-4 overflow-y-auto">
            <h3 className="text-lg font-serif text-purple-300 mb-4 flex items-center space-x-2">
              <Hash className="w-5 h-5" />
              <span>Channels</span>
            </h3>

            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${
                    selectedChannel?.id === channel.id
                      ? 'bg-purple-900/50 text-purple-200'
                      : 'text-purple-400 hover:bg-purple-900/30 hover:text-purple-300'
                  }`}
                >
                  <div className="text-xl">{channel.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-serif">{channel.name}</div>
                    {channel.memberCount && (
                      <div className="text-xs text-purple-500">{channel.memberCount} members</div>
                    )}
                  </div>
                  {!channel.isActive && (
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-purple-500/30">
              <h3 className="text-lg font-serif text-purple-300 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Direct Messages</span>
              </h3>

              <div className="text-center text-purple-500 text-sm py-4">
                Direct messaging coming soon...
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Channel Header */}
            <div className="p-4 border-b border-purple-500/30">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedChannel?.icon}</div>
                <div>
                  <h3 className="text-lg font-serif text-purple-200">{selectedChannel?.name}</h3>
                  <div className="text-xs text-purple-400">
                    {selectedChannel?.type === 'global' ? 'Global Channel' : 'Guild Channel'}
                    {selectedChannel?.memberCount && ` • ${selectedChannel.memberCount} members`}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner text="Loading messages..." />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex space-x-3 ${
                        message.senderId === user?.id ? 'justify-end' : ''
                      }`}
                    >
                      {message.senderId !== user?.id && (
                        <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center">
                          <span className="text-purple-200 font-bold">
                            {message.senderUsername.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className={`max-w-[70%] ${
                        message.senderId === user?.id
                          ? 'bg-purple-900/50 border border-purple-500/50'
                          : 'bg-black/50 border border-purple-500/30'
                      } rounded-lg p-3`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-serif ${
                            message.senderId === user?.id ? 'text-purple-200' : 'text-purple-300'
                          }`}>
                            {message.senderId === user?.id ? 'You' : message.senderUsername}
                          </span>
                          <span className="text-purple-500 text-xs">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <div className={`${
                          message.senderId === user?.id ? 'text-purple-200' : 'text-purple-300'
                        }`}>
                          {message.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-purple-500/30">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedChannel?.name || 'channel'}...`}
                    className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-purple-200 placeholder-purple-500 focus:border-purple-400 focus:outline-none resize-none"
                    rows={2}
                  />
                  <button className="absolute right-3 bottom-3 text-purple-400 hover:text-purple-300 transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="p-3 bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};