import { useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ChatPanel } from './components/ChatPanel';
import { ContextPanel } from './components/ContextPanel';
import { IssuesPanel } from './components/IssuesPanel';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { UnifiedHeader } from './components/UnifiedHeader';
import { UserHome } from './components/UserHome';
import type { Project, Conversation, Issue, Message, IssueStatus } from './types';

// No mock projects — projects come from the API / UserHome

// Track completed items for progress calculation
interface CompletedItems {
  documents: string[];
  materials: string[];
  specs: string[];
}

function App() {
  // View state: 'home' for dashboard, 'project' for the workspace
  const [currentView, setCurrentView] = useState<'home' | 'project'>('home');
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['21', '22', '26']);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  
  // Mobile panel state (must be before any early returns)
  const [mobileActivePanel, setMobileActivePanel] = useState<'context' | 'chat' | 'issues'>('chat');
  
  // Context-aware conversation state
  const [activeContextId, setActiveContextId] = useState<string | null>(null);
  const [activeContextType, setActiveContextType] = useState<'drawing' | 'spec' | 'schedule' | 'material' | null>(null);
  const [activeContextName, setActiveContextName] = useState<string>('');
  
  // Conversations mapped by context ID
  const [contextConversations, setContextConversations] = useState<Record<string, Conversation>>({});
  
  // Current messages for active context
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  
  // Completed items tracking
  const [completedItems, setCompletedItems] = useState<CompletedItems>(({
    documents: [],
    materials: [],
    specs: [],
  }));
  
  // Issues and RFIs
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 'issue-1',
      title: 'Panel EP-3 feeder size not specified',
      description: 'Panel EP-3 on E-501 shows no feeder size. Need confirmation from engineer.',
      status: 'open',
      priority: 'high',
      projectId: '1',
      trade: 'Electrical',
      sourceDocument: 'E-501 Panel Schedule',
      createdAt: new Date().toISOString(),
      contextId: 'e3',
      contextType: 'drawing',
    },
    {
      id: 'issue-2',
      title: 'Sprinkler coverage gap in Room 205',
      description: 'Drawing FP-002 shows insufficient head coverage for Room 205.',
      status: 'open',
      priority: 'medium',
      projectId: '1',
      trade: 'Fire',
      sourceDocument: 'FP-002',
      createdAt: new Date().toISOString(),
      contextId: 'fp2',
      contextType: 'drawing',
    },
    {
      id: 'rfi-1',
      title: 'RFI-001: Door hardware specification',
      description: 'Patient room door hardware grade not specified in Div 08.',
      status: 'open',
      priority: 'medium',
      projectId: '1',
      trade: 'Hardware',
      isRFI: true,
      rfiId: 'RFI-001',
      rfiStatus: 'draft',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Get context-specific intro message (defined before callbacks that use it)
  const getContextIntro = (type: 'drawing' | 'spec' | 'schedule' | 'material', name: string): string => {
    switch (type) {
      case 'drawing':
        return `I see you've opened **${name}**. I can help you understand what's on this sheet, identify conflicts with specs, extract quantities, or compare against other drawings. What would you like to explore?`;
      case 'spec':
        return `You're viewing **${name}**. I can summarize the requirements, check for missing sections, compare against drawings, or help you understand specific clauses. What do you need?`;
      case 'schedule':
        return `You're looking at **${name}**. I can help extract quantities, identify missing items, compare against drawings, or explain schedule requirements. What would you like to know?`;
      case 'material':
        return `Looking at **${name}**. I can provide installation guidance, check compatibility with other materials, find alternatives, or explain the specification requirements. What questions do you have?`;
      default:
        return `How can I help you with **${name}**?`;
    }
  };

  // Handle context item click (drawing, spec, schedule, material)
  const handleContextItemClick = useCallback((item: { id: string; name: string; type: 'drawing' | 'spec' | 'schedule' | 'material' }) => {
    const { id, name, type } = item;
    
    // Check if there's an existing conversation for this context
    const existingConversation = contextConversations[id];
    
    if (existingConversation && existingConversation.messages.length > 0) {
      // Resume existing conversation
      setActiveContextId(id);
      setActiveContextType(type);
      setActiveContextName(name);
      setCurrentMessages(existingConversation.messages);
      
      // Add system message about resuming
      const resumeMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Resuming our conversation about **${name}**. What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCurrentMessages(prev => [...prev, resumeMessage]);
    } else {
      // Start new conversation
      setActiveContextId(id);
      setActiveContextType(type);
      setActiveContextName(name);
      
      // Initial context-aware message
      const contextIntro = getContextIntro(type, name);
      const initialMessages: Message[] = [{
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: contextIntro,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }];
      
      setCurrentMessages(initialMessages);
      
      // Save to context conversations
      if (!activeProject) return;
      const newConversation: Conversation = {
        id: `conv-${id}`,
        projectId: activeProject.id,
        title: name,
        messages: initialMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setContextConversations(prev => ({ ...prev, [id]: newConversation }));
    }
  }, [contextConversations, activeProject?.id, getContextIntro]);

  // Generate context-aware response (mock) - defined before callbacks that use it
  const generateContextAwareResponse = (userMessage: string, _contextType: string | null, contextName: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('conflict') || lowerMsg.includes('issue')) {
      return `I've analyzed **${contextName}** against the project specifications. I found 2 potential conflicts:\n\n1. **Panel sizing discrepancy**: The panel schedule shows 42 circuits, but the riser diagram suggests only 36 spaces.\n\n2. **Voltage mismatch**: Spec calls for 480V, but single line shows 208V.\n\nWould you like me to draft an RFI for these issues?`;
    }
    
    if (lowerMsg.includes('quantity') || lowerMsg.includes('count')) {
      return `Based on **${contextName}**, I can extract the following quantities:\n\n• Panels: 8\n• Breakers (20A): 42\n• Breakers (30A): 12\n• Ground bus: 8\n\nConfidence: 95% (all items clearly labeled)\n\nShould I add these to your estimate?`;
    }
    
    if (lowerMsg.includes('explain') || lowerMsg.includes('what is')) {
      return `**${contextName}** shows the electrical distribution for the 1st floor. Key elements:\n\n• 8 panelboards serving different zones\n• MDP (Main Distribution Panel) fed from utility\n• Emergency power transfer switches shown in red\n• Room numbers coordinated with architectural plans\n\nThe schedule on the right side lists each panel's loads and breaker sizes.\n\nWhat specific aspect would you like me to clarify?`;
    }
    
    return `I understand you're asking about **${contextName}**. As your estimating assistant, I can help you:\n\n• Extract quantities from this drawing\n• Identify conflicts with specifications\n• Compare against other drawings\n• Draft RFIs for missing information\n• Explain technical details\n\nWhat would be most helpful right now?`;
  };

  // Handle sending message with context awareness
  const handleSendMessage = useCallback((content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCurrentMessages(prev => [...prev, userMessage]);

    // Simulate context-aware AI response
    setTimeout(() => {
      const aiResponse = generateContextAwareResponse(content, activeContextType, activeContextName);
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: activeContextType === 'drawing' ? [activeContextName] : undefined,
      };
      
      setCurrentMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation in storage
      if (activeContextId) {
        setContextConversations(prev => ({
          ...prev,
          [activeContextId]: {
            ...prev[activeContextId],
            messages: [...(prev[activeContextId]?.messages || []), userMessage, assistantMessage],
            updatedAt: new Date().toISOString(),
          }
        }));
      }
    }, 1000);
  }, [activeContextId, activeContextType, activeContextName, generateContextAwareResponse]);

  // Mark item as complete
  const handleMarkComplete = useCallback((id: string, type: 'drawing' | 'spec' | 'schedule' | 'material') => {
    setCompletedItems(prev => ({
      ...prev,
      [type === 'drawing' || type === 'spec' ? 'documents' : 'materials']: [...prev[type === 'drawing' || type === 'spec' ? 'documents' : 'materials'], id]
    }));
    
    // Add completion message to conversation
    const completionMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `✓ Marked as complete. I've noted that you've finished reviewing this item. Your progress has been updated.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setCurrentMessages(prev => [...prev, completionMessage]);
  }, []);

  // Get trade from context name (defined before callbacks that use it)
  const getTradeFromContext = (name: string): string => {
    if (name.startsWith('E-')) return 'Electrical';
    if (name.startsWith('P-')) return 'Plumbing';
    if (name.startsWith('FP-')) return 'Fire';
    if (name.startsWith('M-')) return 'Mechanical';
    if (name.startsWith('A-')) return 'Architectural';
    if (name.startsWith('S-')) return 'Structural';
    return 'General';
  };

  // Handle flagging as issue
  const handleFlagAsIssue = useCallback((_messageId: string, content: string, source?: string) => {
    if (!activeProject) return;
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: content.length > 50 ? content.substring(0, 50) + '...' : content,
      description: content,
      status: 'open',
      priority: 'medium',
      projectId: activeProject.id,
      trade: activeContextType === 'drawing' ? getTradeFromContext(activeContextName) : 'General',
      sourceDocument: source || activeContextName,
      createdAt: new Date().toISOString(),
      contextId: activeContextId || undefined,
      contextType: activeContextType || undefined,
    };
    setIssues(prev => [newIssue, ...prev]);
  }, [activeProject?.id, activeContextId, activeContextType, activeContextName, getTradeFromContext]);

  // Handle RFI draft
  const handleDraftRFI = useCallback((issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    
    const rfiMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `✍️ I've drafted an RFI based on this issue:\n\n**Subject:** ${issue.title}\n\n**Question:**\n${issue.description}\n\n**Context:** ${issue.sourceDocument}\n\nWould you like me to refine this or send it to the architect?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setCurrentMessages(prev => [...prev, rfiMessage]);
    
    // Mark issue as having RFI drafted
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, isRFI: true, rfiId: `RFI-${Date.now()}`, rfiStatus: 'draft' } : i));
  }, [issues]);

  // Handle scope toggle
  const handleScopeToggle = useCallback((scope: string) => {
    setSelectedScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
  }, []);

  const projectIssuesList = activeProject ? issues.filter(i => i.projectId === activeProject.id) : [];

  // Show User Home dashboard
  // Show User Home dashboard
  if (currentView === 'home') {
    return (
      <UserHome 
        onProjectSelect={(project) => {
          setActiveProject(project);
          setCurrentView('project');
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0D0D0D] text-white/90 flex flex-col font-sans">
      {/* Unified Header */}
      <UnifiedHeader
        project={activeProject ?? undefined}
        projects={[]}
        selectedScopes={selectedScopes}
        onScopeToggle={handleScopeToggle}
        onProjectSelect={setActiveProject}
        onHomeClick={() => setCurrentView('home')}
        conversationCount={Object.keys(contextConversations).length}
        issueCount={projectIssuesList.length}
      />

      {/* Guard: if somehow in project view without a project, show empty state */}
      {!activeProject ? (
        <div className="flex-1 flex items-center justify-center text-[#8A8F98]">
          <div className="text-center">
            <p className="mb-4">No project selected</p>
            <button 
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-[#5E6AD2] text-white rounded-lg hover:bg-[#6872E3]"
            >
              Go to Home
            </button>
          </div>
        </div>
      ) : (
      <>
      {/* Three Panel Layout - Desktop: side by side, Mobile: tab-based */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Panel: Context (Scope/Documents/Materials) - Hidden on mobile unless selected */}
        <div className={`${mobileActivePanel === 'context' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[300px] lg:min-w-[300px] absolute lg:relative z-10 bg-[#0D0D0D] h-full`}>
          <ContextPanel
            issues={projectIssuesList}
            activeProject={activeProject}
            selectedScopes={selectedScopes}
            completedItems={completedItems}
            onItemClick={(item) => {
              handleContextItemClick(item);
              setMobileActivePanel('chat'); // Switch to chat on mobile after selecting
            }}
            onMarkComplete={handleMarkComplete}
            activeContextId={activeContextId}
          />
        </div>
        
        {/* Center Panel: Context-Aware Chat */}
        <div className={`${mobileActivePanel === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 flex-col absolute lg:relative w-full h-full bg-[#0D0D0D]`}>
          {/* Context Header */}
          {activeContextId && (
            <div className="h-12 border-b border-[#2A2A2A] flex items-center justify-between px-4 bg-[#1A1A1A] shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[#5E6AD2]">
                  {activeContextType === 'drawing' && '📐'}
                  {activeContextType === 'spec' && '📄'}
                  {activeContextType === 'material' && '📦'}
                </span>
                <span className="text-[14px] font-medium text-white/90 truncate max-w-[150px] sm:max-w-[200px] lg:max-w-none">{activeContextName}</span>
                <span className="text-[11px] px-2 py-0.5 bg-[#5E6AD2]/20 text-[#5E6AD2] rounded hidden sm:inline">
                  {activeContextType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleMarkComplete(activeContextId, activeContextType!)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 border border-[#4ADE80]/30 rounded-lg text-[11px] text-[#4ADE80] transition-fast"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark Complete</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Chat */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatPanel
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              onFlagAsIssue={handleFlagAsIssue}
              onDraftRFI={handleDraftRFI}
              placeholder={activeContextId ? `Ask about ${activeContextName}...` : "Select an item from the Context panel to start a conversation..."}
            />
          </div>
        </div>
        
        {/* Right Panel: Issues & RFIs - Hidden on mobile unless selected */}
        <div className={`${mobileActivePanel === 'issues' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[450px] lg:min-w-[450px] absolute lg:relative z-10 bg-[#0D0D0D] h-full right-0`}>
          <IssuesPanel
            issues={projectIssuesList}
            onIssueStatusChange={(issueId: string, status: IssueStatus) => {
              setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status } : i));
            }}
            onIssueClick={(issue) => {
              // If issue has context, switch to that context
              if (issue.contextId && issue.contextType) {
                handleContextItemClick({ id: issue.contextId, name: issue.sourceDocument || 'Unknown', type: issue.contextType });
                setMobileActivePanel('chat');
              }
            }}
            onDraftRFI={handleDraftRFI}
          />
        </div>
      </div>
      </>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden h-14 border-t border-[#2A2A2A] bg-[#0D0D0D] flex items-center justify-around px-4">
        <button 
          onClick={() => setMobileActivePanel('context')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${mobileActivePanel === 'context' ? 'text-[#5E6AD2]' : 'text-[#6B7280]'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[10px]">Docs</span>
        </button>
        <button 
          onClick={() => setMobileActivePanel('chat')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${mobileActivePanel === 'chat' ? 'text-[#5E6AD2]' : 'text-[#6B7280]'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <span className="text-[10px]">Chat</span>
        </button>
        <button 
          onClick={() => setMobileActivePanel('issues')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${mobileActivePanel === 'issues' ? 'text-[#5E6AD2]' : 'text-[#6B7280]'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span className="text-[10px]">Issues</span>
        </button>
      </div>
      
      {/* Modals */}
      {isCommandPaletteOpen && (
        <CommandPalette
          onClose={() => setIsCommandPaletteOpen(false)}
          projects={[]}
          onProjectSelect={(project) => {
            setActiveProject(project);
            setCurrentView('project');
            setIsCommandPaletteOpen(false);
          }}
        />
      )}
      
      {isShortcutsOpen && (
        <KeyboardShortcuts onClose={() => setIsShortcutsOpen(false)} />
      )}
    </div>
  );
}

export default App;
