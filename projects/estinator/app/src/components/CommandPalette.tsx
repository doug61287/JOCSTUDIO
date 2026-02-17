import { useState, useEffect, useRef } from 'react';
import type { Project } from '../types';

interface CommandPaletteProps {
  onClose: () => void;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
}

type CommandType = 'project' | 'action' | 'navigate';

interface Command {
  id: string;
  type: CommandType;
  title: string;
  subtitle?: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ onClose, projects, onProjectSelect }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Build commands list
  const commands: Command[] = [
    // Projects
    ...projects.map(project => ({
      id: `project-${project.id}`,
      type: 'project' as CommandType,
      title: project.name,
      subtitle: project.description,
      icon: project.name.includes('Hospital') ? '🏥' : project.name.includes('Theater') ? '🏢' : '🏫',
      action: () => {
        onProjectSelect(project);
        onClose();
      },
    })),
    // Actions
    {
      id: 'create-rfi',
      type: 'action',
      title: 'Create RFI',
      subtitle: 'Draft a new request for information',
      icon: '➕',
      shortcut: 'C',
      action: () => {
        console.log('Create RFI');
        onClose();
      },
    },
    {
      id: 'upload-documents',
      type: 'action',
      title: 'Upload Documents',
      subtitle: 'Add drawings, specs, or schedules',
      icon: '📤',
      shortcut: 'U',
      action: () => {
        console.log('Upload documents');
        onClose();
      },
    },
    {
      id: 'find-conflicts',
      type: 'action',
      title: 'Find Conflicts',
      subtitle: 'Scan for discrepancies between documents',
      icon: '⚡',
      action: () => {
        console.log('Find conflicts');
        onClose();
      },
    },
    // Navigation
    {
      id: 'view-rfis',
      type: 'navigate',
      title: 'View RFIs',
      subtitle: 'Show all open and resolved RFIs',
      icon: '📋',
      action: () => {
        onClose();
      },
    },
    {
      id: 'view-documents',
      type: 'navigate',
      title: 'View Documents',
      subtitle: 'Browse uploaded project documents',
      icon: '📄',
      action: () => {
        onClose();
      },
    },
    {
      id: 'view-timeline',
      type: 'navigate',
      title: 'View Timeline',
      subtitle: 'See bid cycle progress and deadlines',
      icon: '📅',
      action: () => {
        onClose();
      },
    },
  ];

  // Filter commands
  const filteredCommands = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by type
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.type]) acc[cmd.type] = [];
    acc[cmd.type].push(cmd);
    return acc;
  }, {} as Record<CommandType, Command[]>);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
    }
  };

  const typeLabels: Record<CommandType, string> = {
    project: 'Projects',
    action: 'Actions',
    navigate: 'Navigate',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Palette */}
      <div 
        className="relative w-[640px] max-w-[90vw] bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A2A2A]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8A8F98]">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or ask anything..."
            className="flex-1 bg-transparent text-[16px] text-white/90 placeholder:text-[#6B7280] outline-none"
          />
          <kbd className="text-[11px]">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-[#8A8F98]">
              <p className="text-[14px]">No results found</p>
              <p className="text-[12px] mt-1">Try a different search term</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([type, cmds]) => (
              <div key={type}>
                <div className="px-4 py-1.5 text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider">
                  {typeLabels[type as CommandType]}
                </div>
                {cmds.map((cmd) => {
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-fast ${
                        isSelected 
                          ? 'bg-[#5E6AD2]/15 text-white' 
                          : 'text-[#8A8F98] hover:bg-[#2A2A2A]'
                      }`}
                    >
                      <span className="text-[18px]">{cmd.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[14px] font-medium ${isSelected ? 'text-white' : 'text-white/90'}`}>
                          {cmd.title}
                        </div>
                        {cmd.subtitle && (
                          <div className="text-[12px] text-[#8A8F98] truncate">
                            {cmd.subtitle}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className={isSelected ? 'bg-[#5E6AD2]/20 text-white' : ''}>
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#2A2A2A] text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd>↑</kbd><kbd>↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd>↵</kbd> to select
            </span>
          </div>
          <span>{filteredCommands.length} results</span>
        </div>
      </div>
    </div>
  );
}
