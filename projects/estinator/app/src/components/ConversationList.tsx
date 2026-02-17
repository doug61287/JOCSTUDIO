import { useState } from 'react';
import type { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({ 
  conversations, 
  activeConversationId, 
  onConversationSelect,
  onNewConversation 
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort by updatedAt (most recent first)
  const sortedConversations = [...filteredConversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="w-[300px] min-w-[300px] bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center justify-between px-4">
        <h2 className="text-[15px] font-semibold text-white/90">Conversations</h2>
        <button 
          onClick={onNewConversation}
          className="p-2 rounded-lg hover:bg-[#2A2A2A] text-[#8A8F98] hover:text-white/90 transition-fast"
          title="New conversation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#2A2A2A]">
        <div className="relative">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[14px] text-white/90 placeholder:text-[#6B7280] outline-none focus:border-[#5E6AD2] transition-fast"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#8A8F98]">
            <span className="text-3xl mb-2">💬</span>
            <p className="text-[14px]">No conversations</p>
            <button 
              onClick={onNewConversation}
              className="mt-3 text-[13px] text-[#5E6AD2] hover:underline"
            >
              Start one now
            </button>
          </div>
        ) : (
          <div className="py-2">
            {sortedConversations.map(conv => {
              const isActive = conv.id === activeConversationId;
              const lastMessage = conv.messages[conv.messages.length - 1];
              const messageCount = conv.messages.length;
              
              return (
                <button
                  key={conv.id}
                  onClick={() => onConversationSelect(conv.id)}
                  className={`w-full px-4 py-3 text-left transition-fast ${
                    isActive 
                      ? 'bg-[#5E6AD2]/10' 
                      : 'hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] flex-shrink-0 ${
                      isActive 
                        ? 'bg-[#5E6AD2]/20' 
                        : 'bg-[#2A2A2A]'
                    }`}>
                      💬
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`text-[14px] font-medium truncate ${
                          isActive ? 'text-[#5E6AD2]' : 'text-white/90'
                        }`}>
                          {conv.title}
                        </h3>
                        {lastMessage && (
                          <span className="text-[11px] text-[#6B7280] flex-shrink-0 ml-2">
                            {lastMessage.timestamp}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-[13px] truncate ${
                        isActive ? 'text-[#8A8F98]' : 'text-[#6B7280]'
                      }`}>
                        {lastMessage 
                          ? `${lastMessage.role === 'user' ? 'You: ' : ''}${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`
                          : 'No messages yet'
                        }
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[11px] text-[#6B7280]">
                          {messageCount} message{messageCount !== 1 ? 's' : ''}
                        </span>
                        {conv.isPinned && (
                          <span className="text-[11px] text-[#FBBF24]">📌 Pinned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
          <button className="hover:text-white/90 transition-fast">
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
}
