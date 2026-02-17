import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { ChatPanel } from './components/ChatPanel';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import type { Project, RFI, Message, ViewType } from './types';

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bellevue Hospital',
    description: '15th Floor Cardiology Wing',
    documentCount: 12,
    status: 'active',
    dueDate: '2026-03-15',
    cycle: { currentWeek: 3, totalWeeks: 5 },
  },
  {
    id: '2',
    name: 'Apollo Theater',
    description: 'Historic Renovation Phase 2',
    documentCount: 8,
    status: 'active',
    dueDate: '2026-04-01',
    cycle: { currentWeek: 2, totalWeeks: 6 },
  },
  {
    id: '3',
    name: 'SUNY Downstate',
    description: 'Dental Clinic Expansion',
    documentCount: 15,
    status: 'active',
    dueDate: '2026-02-28',
    cycle: { currentWeek: 4, totalWeeks: 5 },
  },
];

const mockRFIs: RFI[] = [
  {
    id: '1',
    title: 'Door 101-A missing hardware specification',
    description: 'Hardware spec not found for patient room door',
    status: 'open',
    priority: 'high',
    projectId: '1',
    source: 'A-103 Door Schedule',
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'HVAC ductwork vs structural beam conflict',
    description: 'Ductwork path conflicts with beam location in corridor',
    status: 'blocked',
    priority: 'critical',
    projectId: '1',
    source: 'M-201 Mechanical',
    createdAt: '5 hours ago',
  },
  {
    id: '3',
    title: 'Electrical panel sizing discrepancy',
    description: 'Panel schedule shows different size than floor plan',
    status: 'open',
    priority: 'medium',
    projectId: '1',
    source: 'E-501 Electrical',
    createdAt: '1 day ago',
  },
  {
    id: '4',
    title: 'Ceiling height verification needed',
    description: 'Section drawing shows different height than reflected plan',
    status: 'resolved',
    priority: 'low',
    projectId: '1',
    source: 'A-501 Building Section',
    createdAt: '2 days ago',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'How many rooms are missing finish specs?',
    timestamp: '10:23 AM',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Found 12 rooms without finish specifications:\n• Rooms 101-106 (Patient wing)\n• Nurse station (2 areas)\n• Storage rooms 201-204',
    sources: ['A-201 Floor Plan', '09 6000 Finish Schedule'],
    timestamp: '10:23 AM',
  },
];

function App() {
  const [activeProject, setActiveProject] = useState<Project>(mockProjects[0]);
  const [activeView, setActiveView] = useState<ViewType>('rfis');
  const [rfis] = useState<RFI[]>(mockRFIs);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Command palette: Cmd+K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsCommandPaletteOpen(prev => !prev);
    }
    
    // Shortcuts help: ?
    if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setIsShortcutsOpen(true);
    }
    
    // Close modals: Escape
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
      setIsShortcutsOpen(false);
    }
    
    // Create RFI: C
    if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !isCommandPaletteOpen) {
      e.preventDefault();
      console.log('Create RFI');
    }
    
    // Filter: F
    if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !isCommandPaletteOpen) {
      e.preventDefault();
      console.log('Filter');
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Mock AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ll analyze that for you. Based on the documents uploaded, I can see there are 3 open RFIs and 1 critical conflict that needs immediate attention.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const stats = {
    open: rfis.filter(r => r.status === 'open').length,
    resolved: rfis.filter(r => r.status === 'resolved').length,
    blocked: rfis.filter(r => r.status === 'blocked').length,
  };

  return (
    <div className="h-screen w-screen bg-[#0D0D0D] text-white/90 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        projects={mockProjects}
        activeProject={activeProject}
        onProjectSelect={setActiveProject}
        stats={stats}
        cycle={activeProject.cycle}
      />
      
      {/* Main Panel */}
      <MainPanel
        project={activeProject}
        rfis={rfis}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSend={handleSendMessage}
      />
      
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
