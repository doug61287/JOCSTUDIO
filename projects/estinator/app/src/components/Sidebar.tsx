import { Icon } from './Icon';
import type { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  roomIssueCount: number;
  documentIssueCount: number;
  insightCount: number;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
  badge?: number;
  badgeVariant?: 'default' | 'warning' | 'critical';
}

export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  roomIssueCount, 
  documentIssueCount,
  insightCount 
}: SidebarProps) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { 
      id: 'rooms', 
      label: 'Rooms', 
      icon: 'building', 
      badge: roomIssueCount,
      badgeVariant: roomIssueCount > 0 ? 'critical' : undefined
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: 'file', 
      badge: documentIssueCount,
      badgeVariant: documentIssueCount > 0 ? 'warning' : undefined
    },
    { 
      id: 'insights', 
      label: 'Insights', 
      icon: 'layers', 
      badge: insightCount,
      badgeVariant: insightCount > 0 ? 'default' : undefined
    },
  ];

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'critical':
        return 'bg-error-500 text-white';
      case 'warning':
        return 'bg-warning-500 text-white';
      default:
        return 'bg-white/20 text-white';
    }
  };

  return (
    <aside className="w-[260px] bg-sidebar-bg text-white flex flex-col fixed h-screen z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
          📐
        </div>
        <span className="text-xl font-bold tracking-tight">Estinator</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              transition-all duration-200 ease-smooth
              ${activeTab === item.id 
                ? 'bg-sidebar-active text-white shadow-[inset_2px_0_0_#3B82F6]' 
                : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              }
            `}
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <Icon name={item.icon} className="w-5 h-5" />
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full min-w-[24px] text-center ${getBadgeClasses(item.badgeVariant)}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-all duration-200 w-full">
          <span className="w-5 h-5 flex items-center justify-center">
            <Icon name="settings" className="w-5 h-5" />
          </span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
