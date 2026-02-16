import React, { useState } from 'react';
import '../styles/design-system.css';
import './EnhancedDashboard.css';

// Types
interface Room {
  number: string;
  name: string;
  area?: number;
  finishes: {
    floor?: string;
    walls?: string;
    ceiling?: string;
  };
  doors: Array<{
    number: string;
    size: string;
    type: string;
    hardware?: string;
  }>;
  issues: number;
  thumbnail?: string;
}

interface Insight {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: string;
  title: string;
  description: string;
  roomNumber?: string;
  action?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'addendum';
  status: 'processing' | 'analyzed' | 'error';
  issues?: number;
  size?: string;
  thumbnail?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  rooms: number;
  doors: number;
  issues: number;
  documents: number;
  lastUpdated: string;
  thumbnail?: string;
  status: 'active' | 'completed' | 'archived';
}

// Mock Data
const MOCK_PROJECT: Project = {
  id: '1',
  name: 'Bellevue Hospital Renovation',
  description: '15th Floor Cardiology Wing',
  rooms: 25,
  doors: 48,
  issues: 7,
  documents: 12,
  lastUpdated: '2 hours ago',
  status: 'active',
  thumbnail: '🏥'
};

const MOCK_ROOMS: Room[] = [
  { number: '101', name: 'Patient Room', area: 180, finishes: { floor: 'VCT', walls: 'Painted GWB', ceiling: 'ACT' }, doors: [{ number: '101-A', size: "3'6\"×7'0\"", type: 'HM' }, { number: '101-B', size: "3'0\"×7'0\"", type: 'HM' }], issues: 2, thumbnail: '🛏️' },
  { number: '102', name: 'Patient Room', area: 180, finishes: { floor: 'VCT', walls: 'Painted GWB', ceiling: 'ACT' }, doors: [{ number: '102-A', size: "3'6\"×7'0\"", type: 'HM', hardware: 'Set 1' }, { number: '102-B', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 2' }], issues: 0, thumbnail: '🛏️' },
  { number: '103', name: 'Nurse Station', area: 320, finishes: { floor: 'Resilient', walls: 'Painted GWB', ceiling: 'ACT' }, doors: [{ number: '103-A', size: "4'0\"×7'0\"", type: 'HM' }, { number: '103-B', size: "3'0\"×7'0\"", type: 'HM' }, { number: '103-C', size: "3'0\"×7'0\"", type: 'HM' }], issues: 3, thumbnail: '👩‍⚕️' },
  { number: '104', name: 'Exam Room', area: 120, finishes: { floor: 'VCT', walls: 'Painted GWB', ceiling: 'ACT' }, doors: [{ number: '104-A', size: "3'6\"×7'0\"", type: 'HM' }], issues: 1, thumbnail: '🩺' },
  { number: '105', name: 'Storage', area: 80, finishes: { floor: 'Concrete', walls: 'Painted CMU', ceiling: 'Exposed' }, doors: [{ number: '105-A', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 3' }], issues: 0, thumbnail: '📦' },
  { number: '106', name: 'Restroom', area: 60, finishes: { floor: 'Tile', walls: 'Tile', ceiling: 'GWB' }, doors: [{ number: '106-A', size: "2'8\"×7'0\"", type: 'HM' }], issues: 1, thumbnail: '🚻' },
];

const MOCK_INSIGHTS: Insight[] = [
  { id: '1', severity: 'critical', category: 'Missing Hardware', title: '3 Doors Missing Hardware Specs', description: 'Doors 101-A, 101-B, and 103-A have no hardware set assigned in the hardware schedule.', roomNumber: '101, 103', action: 'Generate RFI' },
  { id: '2', severity: 'warning', category: 'Scope Gap', title: 'Plumbing Fixtures Missing', description: 'Room 106 (Restroom) has no plumbing fixtures scheduled despite being a restroom.', roomNumber: '106', action: 'Generate RFI' },
  { id: '3', severity: 'warning', category: 'Finish Mismatch', title: 'Ceiling Type Conflict', description: 'Room 103 ceiling specified as ACT in finish schedule but GWB in reflected ceiling plan.', roomNumber: '103', action: 'View Conflict' },
  { id: '4', severity: 'info', category: 'Addendum', title: 'Addendum 2 Detected', title: 'Window quantity changed from 25 to 32. Review impact on aluminum work.', action: 'View Changes' },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'A-101 First Floor Plan.pdf', type: 'drawing', status: 'analyzed', size: '2.4 MB', thumbnail: '📐' },
  { id: '2', name: 'A-102 Finish Schedule.pdf', type: 'drawing', status: 'analyzed', size: '1.1 MB', thumbnail: '📋' },
  { id: '3', name: 'A-103 Door Schedule.pdf', type: 'drawing', status: 'analyzed', issues: 3, size: '0.8 MB', thumbnail: '🚪' },
  { id: '4', name: '087100 Door Hardware.pdf', type: 'spec', status: 'analyzed', issues: 3, size: '1.5 MB', thumbnail: '🔧' },
  { id: '5', name: 'Addendum 2.pdf', type: 'addendum', status: 'analyzed', size: '0.3 MB', thumbnail: '📝' },
];

// Icons
const Icons = {
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Door: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 11v6"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  File: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Building: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 11v6M12 11v6M16 11v6"/></svg>,
  Layers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

// Components
const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; badge?: number; onClick?: () => void }> = ({ 
  icon, label, active, badge, onClick 
}) => (
  <button className={`sidebar-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="sidebar-icon">{icon}</span>
    <span className="sidebar-label">{label}</span>
    {badge !== undefined && badge > 0 && (
      <span className={`sidebar-badge ${badge > 5 ? 'critical' : badge > 0 ? 'warning' : ''}`}>{badge}</span>
    )}
  </button>
);

const StatCard: React.FC<{ 
  value: string | number; 
  label: string; 
  trend?: string; 
  variant?: 'default' | 'critical' | 'warning' | 'success';
  icon?: React.ReactNode;
}> = ({ value, label, trend, variant = 'default', icon }) => (
  <div className={`stat-card-v2 ${variant}`}>
    <div className="stat-card-header">
      <span className="stat-label">{label}</span>
      {icon && <span className="stat-icon">{icon}</span>}
    </div>
    <div className="stat-value-v2">{value}</div>
    {trend && <div className={`stat-trend ${trend.startsWith('+') ? 'up' : 'down'}`}>{trend}</div>}
  </div>
);

const InsightCard: React.FC<{ insight: Insight; onAction: () => void }> = ({ insight, onAction }) => {
  const severityConfig = {
    critical: { icon: '🔴', color: 'critical' },
    warning: { icon: '🟡', color: 'warning' },
    info: { icon: '🔵', color: 'info' },
    success: { icon: '🟢', color: 'success' },
  };
  
  return (
    <div className={`insight-card-v2 ${severityConfig[insight.severity].color}`}>
      <div className="insight-card-content">
        <div className="insight-card-header">
          <span className="insight-icon">{severityConfig[insight.severity].icon}</span>
          <span className="insight-category">{insight.category}</span>
        </div>
        <h4 className="insight-title-v2">{insight.title}</h4>
        <p className="insight-description-v2">{insight.description}</p>
        {insight.roomNumber && (
          <div className="insight-rooms">Rooms: {insight.roomNumber}</div>
        )}
      </div>
      <button className="insight-action-btn" onClick={onAction}>
        {insight.action} <Icons.ChevronRight />
      </button>
    </div>
  );
};

const RoomCard: React.FC<{ room: Room; onClick: () => void; viewMode: 'grid' | 'list' }> = ({ room, onClick, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className={`room-row ${room.issues > 0 ? 'has-issues' : ''}`} onClick={onClick}>
        <div className="room-row-thumbnail">{room.thumbnail}</div>
        <div className="room-row-info">
          <div className="room-row-primary">
            <strong>Room {room.number}</strong>
            <span className="room-row-name">{room.name}</span>
          </div>
          <div className="room-row-meta">
            <span>{room.area} SF</span>
            <span>•</span>
            <span>{room.doors.length} doors</span>
            <span>•</span>
            <span>{Object.values(room.finishes).filter(Boolean).length} finishes</span>
          </div>
        </div>
        <div className="room-row-actions">
          {room.issues > 0 ? (
            <span className="issue-badge-v2">{room.issues} issues</span>
          ) : (
            <span className="verified-badge"><Icons.Check /> Verified</span>
          )}
          <Icons.ChevronRight />
        </div>
      </div>
    );
  }

  return (
    <div className={`room-card-v2 ${room.issues > 0 ? 'has-issues' : ''}`} onClick={onClick}>
      <div className="room-card-thumbnail">{room.thumbnail}</div>
      <div className="room-card-body">
        <div className="room-card-header">
          <div>
            <h4 className="room-card-title">Room {room.number}</h4>
            <p className="room-card-subtitle">{room.name}</p>
          </div>
          {room.issues > 0 && (
            <span className="issue-badge-v2">{room.issues}</span>
          )}
        </div>
        <div className="room-card-stats">
          <div className="room-stat">
            <span className="room-stat-value">{room.area}</span>
            <span className="room-stat-label">SF</span>
          </div>
          <div className="room-stat">
            <span className="room-stat-value">{room.doors.length}</span>
            <span className="room-stat-label">Doors</span>
          </div>
        </div>
        <div className="room-card-finishes">
          {room.finishes.floor && <span className="finish-tag-v2">{room.finishes.floor}</span>}
          {room.finishes.walls && <span className="finish-tag-v2">{room.finishes.walls}</span>}
          {room.finishes.ceiling && <span className="finish-tag-v2">{room.finishes.ceiling}</span>}
        </div>
      </div>
    </div>
  );
};

const DocumentCard: React.FC<{ doc: Document }> = ({ doc }) => (
  <div className={`document-card ${doc.issues ? 'has-issues' : ''}`}>
    <div className="document-thumbnail">{doc.thumbnail}</div>
    <div className="document-info">
      <h4 className="document-name">{doc.name}</h4>
      <p className="document-meta">{doc.size} • Analyzed</p>
    </div>
    <div className="document-status">
      {doc.issues ? (
        <span className="issue-badge-v2 small">{doc.issues}</span>
      ) : (
        <span className="verified-badge"><Icons.Check /></span>
      )}
    </div>
  </div>
);

// Main Dashboard
export const EnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'documents' | 'insights'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Icons.Home />, badge: 0 },
    { id: 'rooms', label: 'Rooms', icon: <Icons.Building />, badge: MOCK_ROOMS.filter(r => r.issues > 0).length },
    { id: 'documents', label: 'Documents', icon: <Icons.File />, badge: MOCK_DOCUMENTS.filter(d => d.issues).reduce((a, d) => a + (d.issues || 0), 0) },
    { id: 'insights', label: 'Insights', icon: <Icons.Layers />, badge: MOCK_INSIGHTS.length },
  ];

  if (selectedRoom) {
    return (
      <div className="enhanced-dashboard">
        {/* Header */}
        <header className="dashboard-header-v2">
          <div className="header-left">
            <button className="btn btn-ghost" onClick={() => setSelectedRoom(null)}>
              ← Back to Rooms
            </button>
            <div className="header-title">
              <h1>Room {selectedRoom.number}</h1>
              <span className="header-subtitle">{selectedRoom.name} • {selectedRoom.area} SF</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">Export</button>
            <button className="btn btn-primary">Generate RFI</button>
          </div>
        </header>

        {/* Room Detail Content */}
        <div className="dashboard-content">
          <div className="detail-layout">
            <div className="detail-main">
              {/* Finishes */}
              <div className="detail-card">
                <h3 className="detail-card-title">🔨 Finishes</h3>
                <div className="finishes-grid">
                  {Object.entries(selectedRoom.finishes).map(([key, value]) => (
                    <div key={key} className="finish-detail-item">
                      <span className="finish-label">{key}</span>
                      <span className="finish-value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doors */}
              <div className="detail-card">
                <h3 className="detail-card-title">🚪 Doors ({selectedRoom.doors.length})</h3>
                <div className="doors-list">
                  {selectedRoom.doors.map(door => (
                    <div key={door.number} className={`door-detail-item ${!door.hardware ? 'missing' : ''}`}>
                      <div className="door-primary">
                        <strong>{door.number}</strong>
                        <span>{door.size} • {door.type}</span>
                      </div>
                      <div className="door-status">
                        {door.hardware ? (
                          <span className="hardware-badge">{door.hardware}</span>
                        ) : (
                          <span className="missing-badge">No Hardware Spec</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="detail-sidebar">
              <div className="detail-card">
                <h4 className="detail-card-title-small">Quick Actions</h4>
                <button className="btn btn-primary btn-full">Generate RFI</button>
                <button className="btn btn-secondary btn-full">Add to Takeoff</button>
                <button className="btn btn-ghost btn-full">Export Room Data</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      {/* Sidebar */}
      <aside className="sidebar-v2">
        <div className="sidebar-brand">
          <span className="brand-icon">📐</span>
          <span className="brand-text">Estinator</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              badge={item.badge}
              onClick={() => setActiveTab(item.id as any)}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <SidebarItem icon={<Icons.Settings />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="search-box">
            <Icons.Search />
            <input type="text" placeholder="Search rooms, doors, specs..." />
          </div>
          <div className="top-bar-actions">
            <button className="btn btn-secondary btn-icon">
              <Icons.Bell />
              {MOCK_INSIGHTS.length > 0 && <span className="notification-dot" />}
            </button>
            <button className="btn btn-primary">
              <Icons.Plus /> New Project
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {/* Project Header */}
          <div className="project-header">
            <div className="project-thumbnail">{MOCK_PROJECT.thumbnail}</div>
            <div className="project-info">
              <h1>{MOCK_PROJECT.name}</h1>
              <p>{MOCK_PROJECT.description}</p>
            </div>
            <div className="project-meta">
              <span>Last updated {MOCK_PROJECT.lastUpdated}</span>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Row */}
              <div className="stats-row">
                <StatCard 
                  value={MOCK_PROJECT.rooms} 
                  label="Total Rooms" 
                  trend="All analyzed"
                  variant="success"
                  icon="🏢"
                />
                <StatCard 
                  value={MOCK_PROJECT.doors} 
                  label="Doors" 
                  icon="🚪"
                />
                <StatCard 
                  value={MOCK_PROJECT.issues} 
                  label="Issues Found" 
                  variant="critical"
                  icon="⚠️"
                />
                <StatCard 
                  value={MOCK_PROJECT.documents} 
                  label="Documents" 
                  icon="📄"
                />
              </div>

              {/* Two Column Layout */}
              <div className="dashboard-columns">
                {/* Left: Critical Issues */}
                <div className="dashboard-column">
                  <div className="column-header">
                    <h2>⚠️ Critical Issues</h2>
                    <a href="#" className="link">View all {MOCK_INSIGHTS.length}</a>
                  </div>
                  <div className="insights-stack">
                    {MOCK_INSIGHTS.slice(0, 3).map(insight => (
                      <InsightCard 
                        key={insight.id} 
                        insight={insight} 
                        onAction={() => alert(insight.action)} 
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Recent Documents */}
                <div className="dashboard-column">
                  <div className="column-header">
                    <h2>📄 Documents</h2>
                    <a href="#" className="link">View all</a>
                  </div>
                  <div className="documents-stack">
                    {MOCK_DOCUMENTS.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <>
              <div className="section-header">
                <div>
                  <h2>Rooms</h2>
                  <p className="text-muted">{MOCK_ROOMS.length} rooms • {MOCK_ROOMS.filter(r => r.issues > 0).length} with issues</p>
                </div>
                <div className="view-toggle">
                  <button 
                    className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Icons.Grid />
                  </button>
                  <button 
                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <Icons.List />
                  </button>
                </div>
              </div>

              <div className={viewMode === 'grid' ? 'rooms-grid-v2' : 'rooms-list-v2'}>
                {MOCK_ROOMS.map(room => (
                  <RoomCard 
                    key={room.number} 
                    room={room} 
                    onClick={() => setSelectedRoom(room)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <>
              <div className="section-header">
                <h2>Documents</h2>
              </div>
              <div className="documents-grid">
                {MOCK_DOCUMENTS.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <>
              <div className="section-header">
                <h2>All Insights</h2>
                <p className="text-muted">{MOCK_INSIGHTS.length} items detected</p>
              </div>
              <div className="insights-full">
                {MOCK_INSIGHTS.map(insight => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onAction={() => alert(insight.action)} 
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EnhancedDashboard;
