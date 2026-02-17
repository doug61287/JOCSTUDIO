import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

interface ShortcutCategory {
  name: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcuts: ShortcutCategory[] = [
  {
    name: 'Global',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['G'], description: 'Go to... (then select)' },
      { keys: ['G', 'P'], description: 'Go to projects' },
      { keys: ['G', 'R'], description: 'Go to RFIs' },
      { keys: ['G', 'D'], description: 'Go to documents' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { keys: ['C'], description: 'Create RFI' },
      { keys: ['U'], description: 'Upload documents' },
      { keys: ['F'], description: 'Filter RFIs' },
      { keys: ['S'], description: 'Search documents' },
    ],
  },
  {
    name: 'Chat',
    shortcuts: [
      { keys: ['⌘', '↵'], description: 'Send message' },
      { keys: ['Shift', '↵'], description: 'New line' },
      { keys: ['↑'], description: 'Edit last message' },
    ],
  },
  {
    name: 'RFI List',
    shortcuts: [
      { keys: ['J'], description: 'Next RFI' },
      { keys: ['K'], description: 'Previous RFI' },
      { keys: ['O'], description: 'Open selected RFI' },
      { keys: ['E'], description: 'Edit selected RFI' },
      { keys: ['Space'], description: 'Preview RFI' },
    ],
  },
];

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-[560px] max-w-[90vw] max-h-[80vh] bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <h2 className="text-[16px] font-semibold">Keyboard Shortcuts</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98] transition-fast"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {shortcuts.map(category => (
            <div key={category.name}>
              <h3 className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-[14px] text-white/90">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd key={keyIndex}>{key}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2A2A2A] text-[12px] text-[#6B7280]">
          Tip: Press <kbd>?</kbd> anytime to show this help
        </div>
      </div>
    </div>
  );
}
