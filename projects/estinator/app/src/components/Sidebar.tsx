import { useState } from 'react';
import type { Project, Conversation } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (conversationId: string) => void;
  stats: {
    open: number;
    blocked: number;
    resolved: number;
  };
}

export function Sidebar({ 
  projects, 
  activeProject, 
  onProjectSelect,
  conversations,
  activeConversationId,
  onConversationSelect,
  stats 
}: SidebarProps) {
  const [expandedProjects, setExpandedProjects] = useState<string[]>([activeProject.id]);
  
  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const openProjects = projects.filter(p => p.status === 'open');

  return (
    <div className="w-[280px] min-w-[280px] bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6] rounded-lg flex items-center justify-center text-sm">
          📐
        </div>
        <span className="font-semibold text-[15px]">Estinator</span>
      </div>

      {/* User Profile */}
      <div className="px-4 py-3 border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center text-[14px]">
            👤
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-white/90 truncate">Doug Lebbie</div>
            <div className="text-[12px] text-[#8A8F98] truncate">Senior Estimator</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-[#2A2A2A]">
        <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-3">
          Overview
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2">
            <div className="text-[20px] font-semibold text-white/90">{openProjects.length}</div>
            <div className="text-[11px] text-[#8A8F98]">Active Bids</div>
          </div>
          <div className={`bg-[#1A1A1A] border rounded-lg p-2 ${stats.blocked > 0 ? 'border-[#EF4444]/30' : 'border-[#2A2A2A]'}`}>
            <div className={`text-[20px] font-semibold ${stats.blocked > 0 ? 'text-[#EF4444]' : 'text-white/90'}`}>
              {stats.blocked}
            </div>
            <div className="text-[11px] text-[#8A8F98]">Blocked</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2">
            <div className="text-[20px] font-semibold text-[#FBBF24]">{stats.open}</div>
            <div className="text-[11px] text-[#8A8F98]">Open Issues</div>
          </div>
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2">
            <div className="text-[20px] font-semibold text-white/90">2</div>
            <div className="text-[11px] text-[#8A8F98]">Due Soon</div>
          </div>
        </div>
      </div>

      {/* Projects with Conversations */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider">
              Open Projects
            </div>
            <button className="p-1 rounded hover:bg-[#2A2A2A] text-[#8A8F98]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <div className="space-y-1">
            {openProjects.map(project => {
              const isExpanded = expandedProjects.includes(project.id);
              const projectConversations = conversations.filter(c => c.projectId === project.id);
              const isActive = project.id === activeProject.id;
              
              return (
                <div key={project.id}>
                  {/* Project Header */}
                  <button
                    onClick={() => {
                      onProjectSelect(project);
                      toggleProject(project.id);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-fast ${
                      isActive
                        ? 'bg-[#5E6AD2]/15 text-[#5E6AD2]'
                        : 'text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProject(project.id);
                      }}
                      className="p-0.5 rounded hover:bg-[#3A3A3A]"
                    >
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                    <span className="text-[16px]">
                      {project.name.includes('Hospital') ? '🏥' : 
                       project.name.includes('Theater') ? '🏢' : '🏫'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{project.name}</div>
                      <div className="text-[11px] opacity-70 truncate">
                        {project.cycle.currentWeek === project.cycle.totalWeeks 
                          ? 'Final week' 
                          : `Week ${project.cycle.currentWeek}/${project.cycle.totalWeeks}`}
                      </div>
                    </div>
                  </button>

                  {/* Conversations under project */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-[#2A2A2A] pl-3">
                      {projectConversations.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => {
                            onProjectSelect(project);
                            onConversationSelect(conv.id);
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-fast ${
                            conv.id === activeConversationId
                              ? 'bg-[#5E6AD2]/10 text-[#5E6AD2]'
                              : 'text-[#8A8F98] hover:text-white/90'
                          }`}
                        >
                          <span className="text-[12px]">💬</span>
                          <span className="text-[12px] truncate flex-1">{conv.title}</span>
                        </button>
                      ))}
                      
                      {/* New Chat Button */}
                      <button
                        onClick={() => onProjectSelect(project)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[#8A8F98] hover:text-white/90 transition-fast"
                      >
                        <span className="text-[12px]">+</span>
                        <span className="text-[12px]">New chat</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved/Pinned Chats */}
        <div className="px-4 py-3 border-t border-[#2A2A2A]">
          <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2">
            Saved Chats
          </div>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[#8A8F98] hover:text-white/90 transition-fast">
              <span>💡</span>
              <span className="text-[13px] truncate">How to calc quantities</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[#8A8F98] hover:text-white/90 transition-fast">
              <span>📋</span>
              <span className="text-[13px] truncate">RFI templates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90 transition-fast">
          <span>⚙️</span>
          Settings
        </button>
      </div>
    </div>
  );
}
