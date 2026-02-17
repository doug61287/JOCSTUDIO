import { useState, useCallback } from 'react';
import { ConversationList } from './components/ConversationList';
import { ChatPanel } from './components/ChatPanel';
import { ContextPanel } from './components/ContextPanel';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { UnifiedHeader } from './components/UnifiedHeader';
import type { Project, Conversation, Issue, Message } from './types';

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bellevue Hospital',
    description: '15th Floor Cardiology Wing',
    documentCount: 12,
    status: 'open',
    dueDate: '2026-03-15',
    cycle: { currentWeek: 3, totalWeeks: 5 },
  },
  {
    id: '2',
    name: 'Apollo Theater',
    description: 'Historic Renovation Phase 2',
    documentCount: 8,
    status: 'open',
    dueDate: '2026-04-01',
    cycle: { currentWeek: 2, totalWeeks: 6 },
  },
  {
    id: '3',
    name: 'SUNY Downstate',
    description: 'Dental Clinic Expansion',
    documentCount: 15,
    status: 'open',
    dueDate: '2026-02-28',
    cycle: { currentWeek: 4, totalWeeks: 5 },
  },
  {
    id: '4',
    name: 'Central Park Pavilion',
    description: 'Public Restroom Renovation',
    documentCount: 6,
    status: 'submitted',
    dueDate: '2026-01-15',
    cycle: { currentWeek: 5, totalWeeks: 5 },
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    projectId: '1',
    title: "What's missing in electrical?",
    createdAt: '2026-02-17T10:00:00Z',
    updatedAt: '2026-02-17T10:25:00Z',
    isPinned: false,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: "What's missing in the electrical specs?",
        timestamp: '10:23 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `I found 4 items missing electrical specifications:

1. **Panel EP-3** - No feeder size specified
2. **Emergency circuits** - Load calc missing
3. **Room 105** - Receptacle count unspecified
4. **Light fixtures** - Type LF-12 not defined`,
        timestamp: '10:23 AM',
        sources: ['E-501 Panel Schedule', 'E-201 Single Line', 'E-302 Lighting Plan'],
      },
      {
        id: 'msg-3',
        role: 'user',
        content: 'Draft an RFI for the panel feeder issue',
        timestamp: '10:25 AM',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `✍️ Draft RFI created:

**Subject:** Panel EP-3 Feeder Size Missing

**Question:**
Panel EP-3 is shown on E-501 Panel Schedule (Line 42) but the feeder size is not specified. Please confirm:

1. Feeder size from MDP to EP-3
2. Conduit size and type
3. Overcurrent protection size

📎 Attached: Panel schedule excerpt`,
        timestamp: '10:25 AM',
      },
    ],
  },
  {
    id: 'conv-2',
    projectId: '1',
    title: 'Conflict analysis',
    createdAt: '2026-02-16T15:00:00Z',
    updatedAt: '2026-02-16T15:30:00Z',
    isPinned: false,
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'Find conflicts between mechanical and structural',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `I found 1 critical conflict:

1. **HVAC ductwork vs structural beam**
   The 24" supply duct on Level 3 intersects with beam B-302
   Location: Corridor between Rooms 301-305
   
   📄 M-301 Mechanical Plan shows duct at elevation 9'-6"
   📄 S-301 Structural Plan shows beam at elevation 9'-0"`,
        timestamp: 'Yesterday',
        sources: ['M-301 Mechanical Plan', 'S-301 Structural Plan'],
      },
    ],
  },
  {
    id: 'conv-3',
    projectId: '3',
    title: 'Door hardware specs',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:15:00Z',
    isPinned: false,
    messages: [
      {
        id: 'msg-7',
        role: 'user',
        content: 'Which doors are missing hardware specs?',
        timestamp: '2 days ago',
      },
      {
        id: 'msg-8',
        role: 'assistant',
        content: 'Found 3 doors without hardware specifications:\n\n• Door 101-A (Room 101)\n• Door 101-B (Room 101)\n• Door 103-A (Nurse Station)',
        timestamp: '2 days ago',
        sources: ['A-103 Door Schedule'],
      },
    ],
  },
];

const mockIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Panel EP-3 feeder size not specified',
    description: 'Panel EP-3 is shown on panel schedule but feeder size is missing',
    status: 'open',
    priority: 'high',
    projectId: '1',
    trade: 'Electrical',
    sourceDocument: 'E-501 Panel Schedule',
    createdAt: '2026-02-17T10:23:00Z',
    conversationId: 'conv-1',
    messageId: 'msg-2',
    rfiId: 'rfi-1',
    rfiStatus: 'draft',
  },
  {
    id: 'issue-2',
    title: 'HVAC ductwork vs structural beam conflict',
    description: '24" supply duct intersects with beam B-302 on Level 3',
    status: 'blocked',
    priority: 'critical',
    projectId: '1',
    trade: 'Mechanical',
    sourceDocument: 'M-301 Mechanical Plan',
    createdAt: '2026-02-16T15:30:00Z',
    conversationId: 'conv-2',
    messageId: 'msg-6',
  },
  {
    id: 'issue-3',
    title: 'Emergency circuits load calc missing',
    description: 'Emergency panel load calculations not provided',
    status: 'open',
    priority: 'medium',
    projectId: '1',
    trade: 'Electrical',
    sourceDocument: 'E-201 Single Line',
    createdAt: '2026-02-17T10:23:00Z',
    conversationId: 'conv-1',
    messageId: 'msg-2',
  },
  {
    id: 'issue-4',
    title: 'Door 101-A missing hardware specification',
    description: 'Hardware spec not found for patient room door',
    status: 'open',
    priority: 'high',
    projectId: '3',
    trade: 'Hardware',
    sourceDocument: 'A-103 Door Schedule',
    createdAt: '2026-02-15T09:15:00Z',
    conversationId: 'conv-3',
    messageId: 'msg-8',
  },
];

function App() {
  const [activeProject, setActiveProject] = useState<Project>(mockProjects[0]);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-1');
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['21', '22', '26']); // Default: FP, Plumbing, Electrical

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandPaletteOpen(prev => !prev);
    }
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setIsShortcutsOpen(true);
    }
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
      setIsShortcutsOpen(false);
    }
  }, []);

  // Add keyboard listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev => prev.map(conv => 
      conv.id === activeConversationId 
        ? { ...conv, messages: [...conv.messages, newMessage], updatedAt: new Date().toISOString() }
        : conv
    ));

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I'll analyze that for you. Based on the documents for ${activeProject.name}, I can see there are currently ${issues.filter(i => i.projectId === activeProject.id && i.status !== 'resolved').length} open issues that need attention.\n\nWould you like me to prioritize them by due date or severity?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...conv.messages, aiResponse] }
          : conv
      ));
    }, 1000);
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      projectId: activeProject.id,
      title: 'New conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const handleFlagAsIssue = (messageId: string, content: string, source?: string) => {
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: content.length > 50 ? content.substring(0, 50) + '...' : content,
      description: content,
      status: 'open',
      priority: 'medium',
      projectId: activeProject.id,
      trade: 'General',
      sourceDocument: source,
      createdAt: new Date().toISOString(),
      conversationId: activeConversationId,
      messageId,
    };
    setIssues(prev => [newIssue, ...prev]);
  };

  const handleDraftRFI = (issueId: string) => {
    console.log('Draft RFI for issue:', issueId);
  };

  const handleScopeToggle = (scope: string) => {
    setSelectedScopes(prev => 
      prev.includes(scope) 
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const projectConversations = conversations.filter(c => c.projectId === activeProject.id);
  const projectIssuesList = issues.filter(i => i.projectId === activeProject.id);

  return (
    <div className="h-screen w-screen bg-[#0D0D0D] text-white/90 flex flex-col overflow-hidden font-sans">
      {/* Unified Header - Spans all panels */}
      <UnifiedHeader
        project={activeProject}
        projects={mockProjects}
        selectedScopes={selectedScopes}
        onScopeToggle={handleScopeToggle}
        onProjectSelect={setActiveProject}
        conversationCount={projectConversations.length}
        issueCount={projectIssuesList.length}
      />

      {/* Three Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Conversations */}
        <ConversationList
          conversations={projectConversations}
          activeConversationId={activeConversationId}
          onConversationSelect={setActiveConversationId}
          onNewConversation={handleNewConversation}
        />
        
        {/* Center Panel: Chat */}
        <div className="flex-1 min-w-0">
          <ChatPanel
            messages={activeConversation.messages}
            onSendMessage={handleSendMessage}
            onFlagAsIssue={handleFlagAsIssue}
            onDraftRFI={handleDraftRFI}
          />
        </div>
        
        {/* Right Panel: Context (Issues + Documents) */}
        <ContextPanel
          issues={projectIssuesList}
          activeProject={activeProject}
          selectedScopes={selectedScopes}
          onIssueStatusChange={(issueId, status) => {
            setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status } : i));
          }}
          onDocumentClick={(doc) => {
            console.log('Document clicked:', doc);
            // Future: Open document viewer or ask chat about this doc
          }}
        />
      </div>
      
      {/* Command Palette */}
      {isCommandPaletteOpen && (
        <CommandPalette
          onClose={() => setIsCommandPaletteOpen(false)}
          projects={mockProjects}
          onProjectSelect={(project) => {
            setActiveProject(project);
            setIsCommandPaletteOpen(false);
          }}
        />
      )}
      
      {/* Keyboard Shortcuts */}
      {isShortcutsOpen && (
        <KeyboardShortcuts onClose={() => setIsShortcutsOpen(false)} />
      )}
    </div>
  );
}

export default App;
