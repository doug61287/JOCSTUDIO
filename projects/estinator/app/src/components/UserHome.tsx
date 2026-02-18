import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  MessageSquare, 
  FileText, 
  AlertCircle,
  ChevronRight,
  Building2,
  MoreVertical,
  Filter,
  ArrowUpRight,
  Loader2,
  X
} from 'lucide-react';
import { projectsApi } from '../lib/api.js';

// Types
interface Project {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  lastActive: string;
  documentCount: number;
  openIssues: number;
  thumbnail?: string;
  selectedScopes: string[];
}

interface RecentActivity {
  id: string;
  type: 'conversation' | 'document' | 'issue';
  projectId: string;
  projectName: string;
  title: string;
  timestamp: string;
  context?: string;
}

// Components
const Header = () => (
  <header className="h-16 border-b border-[#2A2A2A] bg-[#0D0D0D] flex items-center px-4 sm:px-6 sticky top-0 z-50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#5E6AD2]/20 flex items-center justify-center">
        <span className="text-base sm:text-lg">🧠</span>
      </div>
      <span className="text-base sm:text-lg font-bold text-white">
        BUILDER<span className="text-[#5E6AD2]">BRAIN</span>
      </span>
    </div>
    
    <div className="ml-auto flex items-center gap-2 sm:gap-4">
      <div className="relative hidden sm:block">
        <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          placeholder="Search projects..."
          className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#3A3A3A] w-48 lg:w-64"
        />
      </div>
      <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#8A8F98] hover:text-white hover:border-[#3A3A3A] transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-center">
        <span className="text-xs sm:text-sm font-semibold text-[#8A8F98]">JD</span>
      </div>
    </div>
  </header>
);

const WelcomeBanner = ({
  projectCount,
  issueCount,
  onCreateClick
}: {
  projectCount: number;
  issueCount: number;
  onCreateClick: () => void;
}) => (
  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome back, John</h1>
        <p className="text-[#8A8F98] text-sm sm:text-base">
          You have <span className="text-white font-medium">{projectCount} active projects</span> and <span className="text-[#5E6AD2] font-medium">{issueCount} open issues</span> requiring attention.
        </p>
      </div>
      <button
        onClick={onCreateClick}
        className="bg-[#5E6AD2] hover:bg-[#4F57B8] text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
      >
        <Plus className="w-4 h-4" />
        New Project
      </button>
    </div>
  </div>
);

const ScopeBadge = ({ code }: { code: string }) => {
  const labels: Record<string, string> = {
    '21': 'Fire',
    '22': 'Plumbing',
    '26': 'Electrical',
    '28': 'Security',
  };

  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#5E6AD2]/10 text-[#8A8F98] border border-[#5E6AD2]/30">
      {labels[code] || code}
    </span>
  );
};

const ProjectCard = ({ project, onClick }: { project: Project; onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#5E6AD2]/50 transition-all cursor-pointer group"
  >
    {/* Thumbnail - with proper fallback */}
    <div className="h-32 bg-[#252525] relative overflow-hidden">
      <img 
        src={project.thumbnail || '/project-placeholder.jpg'} 
        alt={project.name} 
        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
        onError={(e) => {
          // Hide broken image and show fallback
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Building2 className="w-12 h-12 text-[#3A3A3A]" />
      </div>
      <div className="absolute top-3 right-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          project.status === 'active' ? 'bg-[#5E6AD2]/20 text-[#5E6AD2] border border-[#5E6AD2]/30' :
          project.status === 'completed' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20' :
          'bg-[#252525] text-[#8A8F98] border border-[#3A3A3A]'
        }`}>
          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <h3 className="text-white font-semibold mb-1 group-hover:text-[#5E6AD2] transition-colors">{project.name}</h3>
      <p className="text-[#6B7280] text-sm mb-3">{project.owner}</p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#8A8F98]">Progress</span>
          <span className="text-white font-medium">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5E6AD2] rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Scope badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.selectedScopes?.map(code => (
          <ScopeBadge key={code} code={code} />
        ))}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-xs text-[#6B7280] pt-3 border-t border-[#2A2A2A]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {project.documentCount}
          </span>
          {project.openIssues > 0 && (
            <span className="flex items-center gap-1 text-[#5E6AD2]">
              <AlertCircle className="w-3.5 h-3.5" />
              {project.openIssues}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {project.lastActive}
        </span>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const icons = {
    conversation: MessageSquare,
    document: FileText,
    issue: AlertCircle
  };

  const Icon = icons[activity.type];

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-[#1A1A1A] rounded-lg transition-colors cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center shrink-0 text-[#8A8F98]">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{activity.title}</p>
        {activity.context && (
          <p className="text-[#6B7280] text-xs truncate mt-0.5">"{activity.context}"</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#5E6AD2] text-xs">{activity.projectName}</span>
          <span className="text-[#3A3A3A]">•</span>
          <span className="text-[#6B7280] text-xs">{activity.timestamp}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#3A3A3A] shrink-0" />
    </div>
  );
};

const QuickActions = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
    <div className="space-y-2">
      <button 
        onClick={onCreateClick}
        className="w-full flex items-center gap-3 p-3 hover:bg-[#252525] rounded-lg transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center">
          <Plus className="w-4 h-4 text-[#8A8F98]" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">New Project</p>
          <p className="text-[#6B7280] text-xs">Start a new estimate</p>
        </div>
      </button>

      <button className="w-full flex items-center gap-3 p-3 hover:bg-[#252525] rounded-lg transition-colors text-left">
        <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center">
          <FileText className="w-4 h-4 text-[#8A8F98]" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">Upload Documents</p>
          <p className="text-[#6B7280] text-xs">Add to existing project</p>
        </div>
      </button>

      <button className="w-full flex items-center gap-3 p-3 hover:bg-[#252525] rounded-lg transition-colors text-left">
        <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-[#8A8F98]" />
        </div>
        <div>
          <p className="text-white text-sm font-medium">View Issues</p>
          <p className="text-[#6B7280] text-xs">12 require attention</p>
        </div>
      </button>
    </div>
  </div>
);

const TradeFilters = () => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mb-6">
    <div className="flex items-center gap-2">
      <Filter className="w-4 h-4 text-[#6B7280]" />
      <span className="text-[#8A8F98] text-sm">Filter by trade:</span>
    </div>
    <div className="flex gap-2 flex-wrap">
      {[
        { code: '21', label: 'Fire' },
        { code: '22', label: 'Plumbing' },
        { code: '26', label: 'Electrical' },
      ].map(trade => (
        <button
          key={trade.code}
          className="px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#8A8F98] text-sm hover:border-[#3A3A3A] hover:text-white transition-colors"
        >
          {trade.label}
        </button>
      ))}
    </div>
  </div>
);

// Create Project Modal Component
function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCreate: (project: Project) => void;
}) {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const newProject = await projectsApi.create({
        name: name.trim(),
        owner: owner.trim() || 'Unknown Owner',
        location: location.trim() || 'Unknown Location'
      });
      onCreate(newProject);
      // Reset form
      setName('');
      setOwner('');
      setLocation('');
      onClose();
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Create project error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
          <h2 className="text-lg font-semibold text-white">Create New Project</h2>
          <button 
            onClick={onClose}
            className="text-[#6B7280] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bellevue Hospital Renovation"
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#5E6AD2] transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
              Owner / Client
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="e.g., NYC Health + Hospitals"
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#5E6AD2] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY"
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2.5 text-white placeholder:text-[#6B7280] focus:outline-none focus:border-[#5E6AD2] transition-colors"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#8A8F98] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-[#5E6AD2] hover:bg-[#4F57B8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Dashboard Component
export function UserHome({ onProjectSelect }: { onProjectSelect?: (project: Project) => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.list();
        // API returns { projects: [...] }
        setProjects(Array.isArray(data) ? data : (data as any).projects ?? []);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  const filteredProjects = projects.filter(p => 
    filter === 'all' ? true : p.status === filter
  );
  
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalIssues = projects.reduce((sum, p) => sum + (p.openIssues || 0), 0);
  
  // Mock activity for now (will come from API later)
  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'conversation',
      projectId: '1',
      projectName: 'Bellevue Hospital',
      title: 'Asked about E-001 - Electrical Plan',
      timestamp: '2 hours ago',
      context: 'How many panels are on this floor?'
    },
    {
      id: '2',
      type: 'issue',
      projectId: '1',
      projectName: 'Bellevue Hospital',
      title: 'New issue flagged: Panel EP-3 feeder size',
      timestamp: '3 hours ago'
    },
    {
      id: '3',
      type: 'document',
      projectId: '2',
      projectName: 'Jacobi Medical Center',
      title: 'Uploaded P-200 Plumbing Plan',
      timestamp: '5 hours ago'
    },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#8A8F98]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#5E6AD2] hover:bg-[#4F57B8] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <WelcomeBanner 
          projectCount={activeProjects} 
          issueCount={totalIssues} 
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
        
        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(newProject) => {
            setProjects(prev => [newProject, ...prev]);
          }}
        />
        
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Projects */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-1">
                {(['all', 'active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-[#5E6AD2] text-white'
                        : 'text-[#8A8F98] hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              
              <span className="text-[#6B7280] text-sm">
                {filteredProjects.length} projects
              </span>
            </div>
            
            <TradeFilters />
            
            {/* Projects Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => onProjectSelect?.(project)}
                />
              ))}
              
              {/* Add New Card */}
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="border-2 border-dashed border-[#2A2A2A] rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 hover:border-[#5E6AD2]/50 hover:bg-[#5E6AD2]/5 transition-all group min-h-[200px] sm:min-h-[280px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#5E6AD2]/50 transition-colors">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B7280] group-hover:text-[#5E6AD2]" />
                </div>
                <span className="text-[#8A8F98] font-medium group-hover:text-[#5E6AD2] text-sm sm:text-base">Create New Project</span>
              </button>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6 order-first lg:order-last">
            <QuickActions onCreateClick={() => setIsCreateModalOpen(true)} />
            
            {/* Recent Activity */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Recent Activity</h3>
                <button className="text-[#5E6AD2] text-sm hover:underline">View all</button>
              </div>
              <div className="space-y-1">
                {mockActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
            
            {/* Getting Started */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Getting Started</h3>
              <p className="text-[#8A8F98] text-sm mb-4">
                New to BuilderBrain? Learn how to organize your projects and start conversations.
              </p>
              <button className="text-[#5E6AD2] text-sm font-medium flex items-center gap-1 hover:underline">
                Watch demo <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserHome;