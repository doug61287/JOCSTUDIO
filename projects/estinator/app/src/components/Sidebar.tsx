import type { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
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
  stats 
}: SidebarProps) {
  const openProjects = projects.filter(p => p.status === 'open');
  const submittedProjects = projects.filter(p => p.status === 'submitted');
  const closedProjects = projects.filter(p => p.status === 'closed');

  return (
    <div className="w-[260px] min-w-[260px] bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col">
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
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-2">
            <div className="text-[18px] font-semibold text-white/90">{openProjects.length}</div>
            <div className="text-[11px] text-[#8A8F98]">Active</div>
          </div>
          <div className={`bg-[#1A1A1A] border rounded-lg p-2 ${stats.blocked > 0 ? 'border-[#EF4444]/30' : 'border-[#2A2A2A]'}`}>
            <div className={`text-[18px] font-semibold ${stats.blocked > 0 ? 'text-[#EF4444]' : 'text-white/90'}`}>
              {stats.blocked}
            </div>
            <div className="text-[11px] text-[#8A8F98]">Blocked</div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {/* Open Projects */}
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider">
              Open ({openProjects.length})
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
              const isActive = project.id === activeProject.id;
              const daysLeft = project.dueDate 
                ? Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              
              return (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-fast ${
                    isActive
                      ? 'bg-[#5E6AD2]/15 border border-[#5E6AD2]/30'
                      : 'hover:bg-[#1A1A1A] border border-transparent'
                  }`}
                >
                  <span className="text-[18px] mt-0.5">
                    {project.name.includes('Hospital') ? '🏥' : 
                     project.name.includes('Theater') ? '🏢' : '🏫'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] font-medium truncate ${isActive ? 'text-[#5E6AD2]' : 'text-white/90'}`}>
                      {project.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#8A8F98]">
                        Week {project.cycle.currentWeek}/{project.cycle.totalWeeks}
                      </span>
                      {daysLeft !== null && daysLeft <= 7 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          daysLeft <= 3 ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#FBBF24]/10 text-[#FBBF24]'
                        }`}>
                          {daysLeft}d
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submitted Projects */}
        {submittedProjects.length > 0 && (
          <div className="px-3 py-2 border-t border-[#2A2A2A]">
            <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 px-1">
              Submitted ({submittedProjects.length})
            </div>
            <div className="space-y-1">
              {submittedProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[#8A8F98] hover:bg-[#1A1A1A] transition-fast"
                >
                  <span className="text-[16px]">📋</span>
                  <span className="text-[13px] truncate">{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Closed Projects */}
        {closedProjects.length > 0 && (
          <div className="px-3 py-2 border-t border-[#2A2A2A]">
            <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 px-1">
              Closed ({closedProjects.length})
            </div>
            <div className="space-y-1">
              {closedProjects.slice(0, 3).map(project => (
                <button
                  key={project.id}
                  onClick={() => onProjectSelect(project)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-[#8A8F98] hover:bg-[#1A1A1A] transition-fast"
                >
                  <span className="text-[16px]">📁</span>
                  <span className="text-[13px] truncate opacity-70">{project.name}</span>
                </button>
              ))}
              {closedProjects.length > 3 && (
                <button className="w-full px-3 py-2 text-[12px] text-[#8A8F98] hover:text-white/90 transition-fast">
                  + {closedProjects.length - 3} more...
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#8A8F98] hover:bg-[#1A1A1A] hover:text-white/90 transition-fast">
          <span>⚙️</span>
          Settings
        </button>
      </div>
    </div>
  );
}
