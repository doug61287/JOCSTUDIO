import type { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProject: Project;
  onProjectSelect: (project: Project) => void;
  stats: {
    open: number;
    resolved: number;
    blocked: number;
  };
  cycle: {
    currentWeek: number;
    totalWeeks: number;
  };
}

export function Sidebar({ 
  projects, 
  activeProject, 
  onProjectSelect,
  stats,
  cycle 
}: SidebarProps) {
  const daysLeft = Math.ceil((new Date(activeProject.dueDate || '').getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="w-[240px] min-w-[240px] bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center px-4 gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#5E6AD2] to-[#8B5CF6] rounded-lg flex items-center justify-center text-sm">
          📐
        </div>
        <span className="font-semibold text-[15px]">Estinator</span>
      </div>
      
      {/* Projects Section */}
      <div className="p-3">
        <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 px-2">
          Projects
        </div>
        <div className="space-y-0.5">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-fast text-left ${
                project.id === activeProject.id
                  ? 'bg-[#5E6AD2]/15 text-[#5E6AD2]'
                  : 'text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90'
              }`}
            >
              <span>
                {project.name.includes('Hospital') ? '🏥' : 
                 project.name.includes('Theater') ? '🏢' : '🏫'}
              </span>
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* RFIs Section */}
      <div className="p-3">
        <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 px-2">
          RFIs
        </div>
        <div className="space-y-0.5">
          <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] transition-fast text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span>
              Open
            </span>
            <span className="text-[11px] px-1.5 py-0.5 bg-[#2A2A2A] rounded-full">{stats.open}</span>
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] transition-fast text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
              Resolved
            </span>
            <span className="text-[11px] px-1.5 py-0.5 bg-[#2A2A2A] rounded-full">{stats.resolved}</span>
          </button>
          <button className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] transition-fast text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              Blocked
            </span>
            <span className="text-[11px] px-1.5 py-0.5 bg-[#2A2A2A] rounded-full">{stats.blocked}</span>
          </button>
        </div>
      </div>
      
      {/* Cycle Section */}
      <div className="p-3">
        <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2 px-2">
          Cycle
        </div>
        <div className="px-2 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px]">Week {cycle.currentWeek} of {cycle.totalWeeks}</span>
            <span className={`text-[11px] font-medium ${daysLeft <= 7 ? 'text-[#FBBF24]' : 'text-[#8A8F98]'}`}>
              {daysLeft}d left
            </span>
          </div>
          <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#5E6AD2] rounded-full transition-all"
              style={{ width: `${(cycle.currentWeek / cycle.totalWeeks) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Spacer */}
      <div className="flex-1"></div>
      
      {/* Footer */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <button 
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-[#8A8F98] hover:bg-[#2A2A2A] hover:text-white/90 transition-fast"
          onClick={() => {}}
        >
          <span>⚙️</span>
          Settings
          <span className="ml-auto text-[11px]"><kbd>⌘</kbd><kbd>,</kbd></span>
        </button>
      </div>
    </div>
  );
}
