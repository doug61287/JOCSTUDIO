import { useState, useRef, useEffect } from 'react';
import type { Project } from '../types';

interface ProjectHeaderProps {
  project: Project;
  selectedScopes: string[];
  onScopeToggle: (scope: string) => void;
}

// CSI MasterFormat 2020 - Divisions 01-49
const csiScopes = [
  { code: '01', name: 'General Requirements' },
  { code: '02', name: 'Existing Conditions' },
  { code: '03', name: 'Concrete' },
  { code: '04', name: 'Masonry' },
  { code: '05', name: 'Metals' },
  { code: '06', name: 'Wood, Plastics, Composites' },
  { code: '07', name: 'Thermal & Moisture Protection' },
  { code: '08', name: 'Openings' },
  { code: '09', name: 'Finishes' },
  { code: '10', name: 'Specialties' },
  { code: '11', name: 'Equipment' },
  { code: '12', name: 'Furnishings' },
  { code: '13', name: 'Special Construction' },
  { code: '14', name: 'Conveying Equipment' },
  { code: '21', name: 'Fire Suppression' },
  { code: '22', name: 'Plumbing' },
  { code: '23', name: 'HVAC' },
  { code: '25', name: 'Integrated Automation' },
  { code: '26', name: 'Electrical' },
  { code: '27', name: 'Communications' },
  { code: '28', name: 'Electronic Safety & Security' },
  { code: '31', name: 'Earthwork' },
  { code: '32', name: 'Exterior Improvements' },
  { code: '33', name: 'Utilities' },
];

const statusColors = {
  open: { bg: 'bg-[#5E6AD2]/10', text: 'text-[#5E6AD2]', dot: 'bg-[#5E6AD2]' },
  submitted: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', dot: 'bg-[#FBBF24]' },
  closed: { bg: 'bg-[#4ADE80]/10', text: 'text-[#4ADE80]', dot: 'bg-[#4ADE80]' },
};

export function ProjectHeader({ project, selectedScopes, onScopeToggle }: ProjectHeaderProps) {
  const [showScopeDropdown, setShowScopeDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowScopeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusStyle = statusColors[project.status];
  const daysLeft = project.dueDate 
    ? Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="border-b border-[#2A2A2A] bg-[#0D0D0D]">
      {/* Main Header Row */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[18px] font-semibold text-white/90 truncate">
                {project.name}
              </h1>
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-[12px] text-[#8A8F98]">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                NYC Health + Hospitals
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                New York, NY
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {project.cycle.currentWeek === project.cycle.totalWeeks 
                  ? 'Final week' 
                  : `Week ${project.cycle.currentWeek}/${project.cycle.totalWeeks}`}
                {daysLeft !== null && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                    daysLeft <= 3 ? 'bg-[#EF4444]/10 text-[#EF4444]' : 
                    daysLeft <= 7 ? 'bg-[#FBBF24]/10 text-[#FBBF24]' : 
                    'bg-[#2A2A2A] text-[#8A8F98]'
                  }`}>
                    {daysLeft}d left
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Right: Scope Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowScopeDropdown(!showScopeDropdown)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-fast ${
                selectedScopes.length > 0 
                  ? 'bg-[#5E6AD2]/10 border-[#5E6AD2]/30 text-[#5E6AD2]' 
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#8A8F98] hover:border-[#3A3A3A]'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="text-[13px] font-medium">
                {selectedScopes.length === 0 
                  ? 'All Scopes' 
                  : `${selectedScopes.length} Scope${selectedScopes.length > 1 ? 's' : ''}`}
              </span>
              {selectedScopes.length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-[#5E6AD2] rounded-full text-[10px] text-white font-medium">
                  {selectedScopes.length}
                </span>
              )}
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={`transition-transform ${showScopeDropdown ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Scope Dropdown */}
            {showScopeDropdown && (
              <div className="absolute top-full right-0 mt-2 w-[380px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                  <div>
                    <h3 className="text-[14px] font-semibold text-white/90">Select Scopes</h3>
                    <p className="text-[11px] text-[#8A8F98]">CSI MasterFormat 2020</p>
                  </div>
                  {selectedScopes.length > 0 && (
                    <button
                      onClick={() => selectedScopes.forEach(scope => onScopeToggle(scope))}
                      className="text-[11px] text-[#8A8F98] hover:text-white/90 transition-fast"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Scope List */}
                <div className="max-h-[360px] overflow-y-auto p-2">
                  <div className="grid grid-cols-1 gap-0.5">
                    {csiScopes.map((scope) => {
                      const isSelected = selectedScopes.includes(scope.code);
                      return (
                        <button
                          key={scope.code}
                          onClick={() => onScopeToggle(scope.code)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-fast ${
                            isSelected 
                              ? 'bg-[#5E6AD2]/15 text-[#5E6AD2]' 
                              : 'text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-5 h-5 rounded border transition-fast ${
                            isSelected 
                              ? 'bg-[#5E6AD2] border-[#5E6AD2]' 
                              : 'border-[#3A3A3A]'
                          }`}>
                            {isSelected && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-[12px] font-mono w-6 opacity-70">{scope.code}</span>
                          <span className="text-[13px] flex-1 truncate">{scope.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A2A2A] bg-[#252525]">
                  <span className="text-[12px] text-[#8A8F98]">
                    {selectedScopes.length === 0 
                      ? 'All divisions included' 
                      : `${selectedScopes.length} division${selectedScopes.length > 1 ? 's' : ''} selected`}
                  </span>
                  <button
                    onClick={() => setShowScopeDropdown(false)}
                    className="px-4 py-1.5 bg-[#5E6AD2] hover:bg-[#6872E3] rounded-lg text-[12px] font-medium text-white transition-fast"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Scopes Bar (if any selected) */}
      {selectedScopes.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#5E6AD2]/5 border-t border-[#2A2A2A] overflow-x-auto">
          <span className="text-[11px] text-[#8A8F98] shrink-0">Focusing on:</span>
          {selectedScopes.map(code => {
            const scope = csiScopes.find(s => s.code === code);
            return (
              <button
                key={code}
                onClick={() => onScopeToggle(code)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 rounded-full text-[11px] text-[#5E6AD2] hover:bg-[#5E6AD2]/20 transition-fast shrink-0"
              >
                <span className="font-mono">{code}</span>
                <span className="truncate max-w-[120px]">{scope?.name}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
