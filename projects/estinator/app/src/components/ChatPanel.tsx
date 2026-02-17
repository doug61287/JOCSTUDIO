import { useState, useRef, useEffect } from 'react';
import type { Message, Project } from '../types';
import { ProjectHeader } from './ProjectHeader';

interface ChatPanelProps {
  project: Project;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onFlagAsIssue: (messageId: string, content: string, source?: string) => void;
  onDraftRFI: (issueId: string) => void;
  selectedScopes: string[];
  onScopeToggle: (scope: string) => void;
}

export function ChatPanel({ 
  project,
  projects,
  onProjectSelect,
  messages, 
  onSendMessage, 
  onFlagAsIssue,
  onDraftRFI,
  selectedScopes,
  onScopeToggle
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D]">
      {/* Project Header with Scope Selector */}
      <ProjectHeader
        project={project}
        projects={projects}
        selectedScopes={selectedScopes}
        onScopeToggle={onScopeToggle}
        onProjectSelect={onProjectSelect}
      />

      {/* Messages - Telegram Style */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8A8F98]">
            <span className="text-4xl mb-4">💬</span>
            <h3 className="text-[18px] font-semibold text-white/90 mb-2">Start a conversation</h3>
            <p className="text-[14px] text-center max-w-md mb-6">
              Ask Estinator about your project documents, find conflicts, or generate RFIs.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              <QuickActionButton 
                icon="⚡" 
                label="Find conflicts" 
                onClick={() => onSendMessage("Find conflicts in the documents")}
              />
              <QuickActionButton 
                icon="📋" 
                label="List missing specs" 
                onClick={() => onSendMessage("What specifications are missing?")}
              />
              <QuickActionButton 
                icon="🔢" 
                label="Calculate quantities" 
                onClick={() => onSendMessage("Calculate quantities")}
              />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem 
                key={message.id} 
                message={message} 
                onFlagAsIssue={onFlagAsIssue}
                onDraftRFI={onDraftRFI}
              />
            ))}
            
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6] flex items-center justify-center text-[12px] shrink-0">
                  🤖
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                  <span className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                  <span className="w-2 h-2 bg-[#8A8F98] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#2A2A2A]">
        <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden focus-within:border-[#5E6AD2] transition-fast">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this project..."
            rows={1}
            className="w-full px-4 py-3 bg-transparent text-[15px] text-white/90 placeholder:text-[#6B7280] resize-none outline-none min-h-[52px] max-h-[200px]"
          />
          
          {/* Input Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-[#2A2A2A]">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98] transition-fast" title="Attach file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <button className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98] transition-fast" title="Voice input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              </button>
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5E6AD2] hover:bg-[#6872E3] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-medium text-white transition-fast"
            >
              Send
              <kbd className="bg-[#5E6AD2]/50 text-white/80 text-[10px]">↵</kbd>
            </button>
          </div>
        </div>
        
        <p className="mt-2 text-[11px] text-[#6B7280] text-center">
          Estinator may make mistakes. Please verify important information with source documents.
        </p>
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  onFlagAsIssue: (messageId: string, content: string, source?: string) => void;
  onDraftRFI: (issueId: string) => void;
}

function MessageItem({ message, onFlagAsIssue }: MessageItemProps) {
  const isUser = message.role === 'user';
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="flex gap-3 group animate-slide-in"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] shrink-0 ${
        isUser 
          ? 'bg-[#2A2A2A]' 
          : 'bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6]'
      }`}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-medium text-white/90">
            {isUser ? 'You' : 'Estinator'}
          </span>
          <span className="text-[11px] text-[#6B7280]">{message.timestamp}</span>
          
          {/* Message Actions */}
          {showActions && !isUser && (
            <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-fast">
              <button 
                onClick={() => onFlagAsIssue(message.id, message.content)}
                className="p-1 rounded hover:bg-[#2A2A2A] text-[#8A8F98]"
                title="Flag as issue"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </button>
              <button className="p-1 rounded hover:bg-[#2A2A2A] text-[#8A8F98]" title="Copy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="text-[15px] text-[#E5E7EB] leading-relaxed">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <AssistantMessage 
              content={message.content} 
              sources={message.sources}
              onFlagAsIssue={(content, source) => onFlagAsIssue(message.id, content, source)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  content: string;
  sources?: string[];
  onFlagAsIssue: (content: string, source?: string) => void;
}

function AssistantMessage({ content, sources, onFlagAsIssue }: AssistantMessageProps) {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4">
      {/* Main content */}
      <div className="space-y-3">
        {lines.map((line, index) => {
          // Check for numbered findings
          const findingMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*(?:\-\s*(.+))?$/);
          if (findingMatch) {
            const [, num, title, desc] = findingMatch;
            return (
              <FindingCard 
                key={index}
                number={num}
                title={title}
                description={desc}
                onFlagAsIssue={() => onFlagAsIssue(title)}
              />
            );
          }
          
          // Check for bullet points
          if (line.startsWith('•')) {
            return (
              <div key={index} className="flex items-start gap-2 ml-1">
                <span className="text-[#5E6AD2] mt-2">•</span>
                <span className="text-[#E5E7EB]">{line.substring(1).trim()}</span>
              </div>
            );
          }
          
          // Regular text
          if (line.trim()) {
            return <p key={index} className="text-[#E5E7EB]">{line}</p>;
          }
          
          return null;
        })}
      </div>
      
      {/* Sources */}
      {sources && sources.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-[11px] text-[#6B7280] uppercase tracking-wider">Sources:</span>
          {sources.map((source, index) => (
            <SourceTag key={index} source={source} />
          ))}
        </div>
      )}
    </div>
  );
}

interface FindingCardProps {
  number: string;
  title: string;
  description?: string;
  onFlagAsIssue: () => void;
}

function FindingCard({ number, title, description, onFlagAsIssue }: FindingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-3 group hover:border-[#3A3A3A] transition-fast"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 bg-[#5E6AD2]/10 text-[#5E6AD2] rounded-full flex items-center justify-center text-[12px] font-semibold">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-medium text-white/90">{title}</h4>
          {description && (
            <p className="text-[13px] text-[#8A8F98] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      
      {/* Inline Actions */}
      <div className={`flex items-center gap-2 mt-3 pt-2 border-t border-[#2A2A2A] transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={onFlagAsIssue}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-md text-[12px] text-[#8A8F98] hover:text-white/90 transition-fast"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          Flag as Issue
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-md text-[12px] text-[#8A8F98] hover:text-white/90 transition-fast">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Draft RFI
        </button>
      </div>
    </div>
  );
}

function SourceTag({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-[11px] text-[#8A8F98]">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      {source}
    </span>
  );
}

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#252525] rounded-lg text-[12px] text-[#8A8F98] hover:text-white/90 transition-fast"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
