import { useRef, useEffect } from 'react';
import type { Message } from '../types';

interface ChatPanelProps {
  messages: Message[];
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatPanel({ messages, inputMessage, onInputChange, onSend }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="w-[360px] min-w-[360px] bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-semibold text-[15px]">Ask Estinator</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse"></span>
          <span className="text-[12px] text-[#8A8F98]">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageItem key={message.id} message={message} isFirst={index === 0} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2A2A2A]">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={3}
            className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[14px] text-white/90 placeholder:text-[#6B7280] resize-none focus:outline-none focus:border-[#5E6AD2] transition-fast"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            <span className="text-[11px] text-[#6B7280]">
              <kbd>↵</kbd> to send
            </span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <QuickAction text="Find conflicts" />
          <QuickAction text="Missing specs?" />
          <QuickAction text="Summarize" />
        </div>
      </div>
    </div>
  );
}

function MessageItem({ message, isFirst }: { message: Message; isFirst: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isFirst ? '' : 'animate-slide-in'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] flex-shrink-0 ${
        isUser 
          ? 'bg-[#2A2A2A]' 
          : 'bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6]'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-medium text-white/90">
            {isUser ? 'You' : 'Estinator'}
          </span>
          <span className="text-[11px] text-[#6B7280]">{message.timestamp}</span>
        </div>
        
        <div className="text-[13px] text-[#8A8F98] leading-relaxed whitespace-pre-wrap">
          {message.content.split('\n').map((line, i) => (
            <div key={i} className={line.startsWith('•') ? 'ml-0' : ''}>
              {line.startsWith('•') ? (
                <span className="text-white/90">{line}</span>
              ) : (
                line
              )}
            </div>
          ))}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.sources.map((source, index) => (
              <span 
                key={index}
                className="text-[11px] px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[#8A8F98]"
              >
                {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickAction({ text }: { text: string }) {
  return (
    <button className="px-2.5 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-[12px] text-[#8A8F98] hover:border-[#3A3A3A] hover:text-white/90 transition-fast">
      {text}
    </button>
  );
}
