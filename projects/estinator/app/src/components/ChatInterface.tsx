import { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { ProjectTimeline } from './ProjectTimeline';
import type { Message, Project } from '../types';

interface ChatInterfaceProps {
  project?: Project;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'How many patient rooms are on the 15th floor?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Based on the finish schedule (A-102), there are **8 patient rooms** on the 15th floor:\n\n• Rooms 101-106: Standard patient rooms (180 SF each)\n• Rooms 107-108: Isolation patient rooms (200 SF each)\n\nAll rooms have VCT flooring, painted GWB walls, and ACT ceilings.',
    sources: [
      { name: 'A-102 Finish Schedule.pdf', page: '3', type: 'schedule' },
      { name: 'A-101 First Floor Plan.pdf', page: '1', type: 'drawing' },
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
  },
  {
    id: '3',
    role: 'user',
    content: 'Which doors are missing hardware specs?',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '4',
    role: 'assistant',
    content: 'I found **3 doors missing hardware specifications** in the hardware schedule:\n\n🔴 **Critical Issues:**\n• **Door 101-A** (Room 101) - 3\'6"×7\'0" HM\n• **Door 101-B** (Room 101) - 3\'0"×7\'0" HM\n• **Door 103-A** (Nurse Station) - 4\'0"×7\'0" HM\n\nThese doors appear in the door schedule but have no corresponding hardware set assigned in specification 087100.',
    sources: [
      { name: 'A-103 Door Schedule.pdf', page: '2', type: 'schedule' },
      { name: '087100 Door Hardware.pdf', page: '12', type: 'spec' },
    ],
    timestamp: new Date(Date.now() - 1000 * 60 * 1),
  },
];

const SUGGESTED_QUESTIONS = [
  'How many rooms are there?',
  'What doors are missing hardware?',
  'Show me conflicts between drawings and specs',
  'What are the finishes in Room 103?',
  'Generate an RFI for missing items',
];

export const ChatInterface = ({ project }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll analyze that for you based on the project documents. Looking at the ${project?.name || 'current project'}...`,
        sources: [
          { name: 'A-101 First Floor Plan.pdf', page: '1', type: 'drawing' },
        ],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary-500/25">
            📐
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Estinator</h1>
            <p className="text-xs text-gray-500">
              {project?.name || 'No project loaded'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowTimeline(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Icon name="timeline" className="w-4 h-4" />
            Timeline
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Icon name="upload" className="w-4 h-4" />
            Upload Documents
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <Icon name="settings" className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Welcome Message (if no messages) */}
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-primary-500/25">
                📐
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                What can I help you find?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Ask me anything about your construction documents. I can find conflicts, 
                extract schedules, detect missing specs, and generate RFIs.
              </p>
              
              {/* Suggested Questions */}
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_QUESTIONS.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(question)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
                  message.role === 'user'
                    ? 'bg-gray-200'
                    : 'bg-gradient-to-br from-primary-500 to-primary-600'
                }`}>
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>

                {/* Content */}
                <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div className={`inline-block px-5 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'prose-invert' : ''
                    }`}>
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="m-0 leading-relaxed">
                          {line.startsWith('•') ? (
                            <span className="flex items-start gap-2">
                              <span className="text-primary-500 mt-1">•</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                              }} />
                            </span>
                          ) : line.startsWith('🔴') || line.startsWith('🟡') ? (
                            <span className="font-semibold">{line}</span>
                          ) : (
                            <span dangerouslySetInnerHTML={{ 
                              __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                            }} />
                          )}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Sources (for assistant messages) */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.sources.map((source, i) => (
                        <button
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 transition-colors"
                        >
                          <Icon name="file" className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{source.name}</span>
                          <span className="text-gray-400">p.{source.page}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`mt-1 text-xs text-gray-400 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">Analyzing documents...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Timeline Modal */}
      <ProjectTimeline 
        isOpen={showTimeline} 
        onClose={() => setShowTimeline(false)} 
      />

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your project..."
              rows={1}
              className="w-full px-5 py-4 pr-14 bg-gray-100 border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:bg-white transition-all text-gray-900 placeholder:text-gray-500"
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all"
            >
              <Icon name="chevronRight" className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-2">
            Estinator can make mistakes. Always verify critical information against source documents.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
