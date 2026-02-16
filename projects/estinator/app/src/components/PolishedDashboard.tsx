import React, { useState } from 'react';
import '../styles/design-system.css';
import './PolishedDashboard.css';

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
}

// Mock Data
const MOCK_ROOMS: Room[] = [
  { number: '101', name: 'Office', area: 120, finishes: { floor: 'Carpet', walls: 'Painted GWB', ceiling: 'ACT' }, doors: [{ number: '101-A', size: "3'0\"×7'0\"", type: 'HM' }, { number: '101-B', size: "3'0\"×7'0\"", type: 'HM' }], issues: 2 },
  { number: '102', name: 'Office', area: 120, finishes: { floor: 'Carpet', walls: 'Painted GWB', ceiling: 'ACT' }, doors: [{ number: '102-A', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 1' }], issues: 0 },
  { number: '103', name: 'Conference', area: 240, finishes: { floor: 'VCT', walls: 'Fabric Wrapped', ceiling: 'ACT' }, doors: [{ number: '103-A', size: "3'6\"×7'0\"", type: 'HM' }, { number: '103-B', size: "3'6\"×7'0\"", type: 'HM' }], issues: 2 },
  { number: '104', name: 'Restroom', area: 80, finishes: { floor: 'Tile', walls: 'Tile', ceiling: 'GWB' }, doors: [{ number: '104-A', size: "2'6\"×7'0\"", type: 'HM' }], issues: 1 },
  { number: '105', name: 'Storage', area: 60, finishes: { floor: 'Concrete', walls: 'Painted CMU', ceiling: 'Exposed' }, doors: [{ number: '105-A', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 3' }], issues: 0 },
];

const MOCK_INSIGHTS: Insight[] = [
  { id: '1', severity: 'critical', category: 'Missing Spec', title: 'Hardware Not Assigned', description: 'Door 101-A has no hardware set assigned in the hardware schedule.', roomNumber: '101', action: 'Generate RFI' },
  { id: '2', severity: 'critical', category: 'Missing Spec', title: 'Hardware Not Assigned', description: 'Door 101-B has no hardware set assigned in the hardware schedule.', roomNumber: '101', action: 'Generate RFI' },
  { id: '3', severity: 'warning', category: 'Scope Gap', title: 'Plumbing Fixtures Missing', description: 'Room 104 is a restroom but no plumbing fixtures are scheduled.', roomNumber: '104', action: 'Generate RFI' },
  { id: '4', severity: 'info', category: 'Addendum', title: 'Addendum 1 Detected', description: 'Window quantity changed from 25 to 30. Review impact on aluminum work.', action: 'View Changes' },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'A-101 First Floor Plan.pdf', type: 'drawing', status: 'analyzed', size: '2.4 MB' },
  { id: '2', name: 'A-102 Finish Schedule.pdf', type: 'drawing', status: 'analyzed', size: '1.1 MB' },
  { id: '3', name: 'A-103 Door Schedule.pdf', type: 'drawing', status: 'analyzed', issues: 2, size: '0.8 MB' },
  { id: '4', name: '260000 Electrical Spec.pdf', type: 'spec', status: 'analyzed', size: '4.2 MB' },
  { id: '5', name: 'Addendum 1.pdf', type: 'addendum', status: 'analyzed', size: '0.3 MB' },
];

// Icons (simplified as components)
const Icons = {
  Document: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Drawing: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Spec: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Addendum: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Door: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 11v6"/></svg>,
  Area: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>,
  Alert: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
};

// Components
const Badge: React.FC<{ severity: string; children: React.ReactNode }> = ({ severity, children }) => {
  const variants: Record<string, string> = {
    critical: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info',
    success: 'badge-success',
  };
  return <span className={`badge ${variants[severity] || 'badge-gray'}`}>{children}</span>;
};

const StatCard: React.FC<{ value: string | number; label: string; trend?: string; variant?: 'default' | 'alert' | 'success' }> = ({ 
  value, label, trend, variant = 'default' 
}) => (
  <div className={`stat-card ${variant}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {trend && <div className={`stat-change ${trend.startsWith('+') ? 'positive' : 'negative'}`}>{trend}</div>}
  </div>
);

const InsightCard: React.FC<{ insight: Insight; onAction: () => void }> = ({ insight, onAction }) => (
  <div className={`insight-card ${insight.severity} animate-slide-in`}>
    <div className="insight-header">
      <Badge severity={insight.severity}>{insight.category}</Badge>
      {insight.roomNumber && <span className="insight-room">Room {insight.roomNumber}</span>}
    </div>
    <div className="insight-title">{insight.title}</div>
    <div className="insight-description">{insight.description}</div>
    <div className="insight-footer">
      <button className="btn btn-sm btn-primary" onClick={onAction}>
        {insight.action}
      </button>
    </div>
  </div>
);

const RoomCard: React.FC<{ room: Room; onClick: () => void }> = ({ room, onClick }) => (
  <div className={`room-card ${room.issues > 0 ? 'has-issues' : ''}`} onClick={onClick}>
    {room.issues > 0 && <div className="room-issue-indicator">{room.issues}</div>}
    <div className="room-header">
      <div className="room-number-badge">{room.number}</div>
      <div className="room-info">
        <div className="room-name">{room.name}</div>
        <div className="room-meta">
          <span><Icons.Area /> {room.area} SF</span>
          <span><Icons.Door /> {room.doors.length} doors</span>
        </div>
      </div>
    </div>
    <div className="room-finishes">
      {room.finishes.floor && <span className="finish-tag">{room.finishes.floor}</span>}
      {room.finishes.walls && <span className="finish-tag">{room.finishes.walls}</span>}
    </div>
  </div>
);

const DocumentItem: React.FC<{ doc: Document }> = ({ doc }) => {
  const icons = { drawing: <Icons.Drawing />, spec: <Icons.Spec />, addendum: <Icons.Addendum /> };
  return (
    <div className="document-item">
      <div className={`document-icon ${doc.type}`}>{icons[doc.type]}</div>
      <div className="document-info">
        <div className="document-name">{doc.name}</div>
        <div className="document-meta">{doc.size} • Analyzed just now</div>
      </div>
      <div className="document-status">
        {doc.issues ? (
          <Badge severity="warning">{doc.issues} issues</Badge>
        ) : (
          <div className="status-indicator">
            <span className="status-dot success" />
            <Icons.Check />
          </div>
        )}
      </div>
    </div>
  );
};

const QueryBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const suggestions = ['How many rooms?', 'What doors are missing hardware?', 'Show me all restrooms', 'Compare room 101 vs 102'];
  
  return (
    <div className="query-container">
      <div className="query-input-wrapper">
        <Icons.Search />
        <input 
          type="text" 
          className="query-input" 
          placeholder="Ask anything about your project..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary">Ask</button>
      </div>
      <div className="query-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} className="suggestion-chip" onClick={() => setQuery(s)}>{s}</button>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard
export const PolishedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'insights'>('overview');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const stats = {
    rooms: MOCK_ROOMS.length,
    doors: MOCK_ROOMS.reduce((acc, r) => acc + r.doors.length, 0),
    issues: MOCK_INSIGHTS.filter(i => i.severity === 'critical').length,
    documents: MOCK_DOCUMENTS.length,
  };

  if (selectedRoom) {
    return (
      <div className="app-shell">
        <nav className="top-nav">
          <div className="nav-content">
            <div className="nav-brand">
              <button className="btn btn-ghost" onClick={() => setSelectedRoom(null)}>← Back</button>
              <span className="nav-brand-icon">📐</span>
              <span>Estinator</span>
            </div>
          </div>
        </nav>
        
        <main className="content-area">
          <div className="container">
            <div className="room-detail-header">
              <div>
                <h1>Room {selectedRoom.number}</h1>
                <p className="text-muted">{selectedRoom.name} • {selectedRoom.area} SF</p>
              </div>
              <div className="detail-actions">
                <button className="btn btn-secondary">Export</button>
                <button className="btn btn-primary">Generate RFI</button>
              </div>
            </div>

            <div className="detail-grid">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🔨 Finishes</h3>
                </div>
                <div className="card-body">
                  <div className="finish-grid">
                    {Object.entries(selectedRoom.finishes).map(([key, value]) => (
                      <div key={key} className="finish-item">
                        <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                        <span>{value || 'Not specified'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">🚪 Doors ({selectedRoom.doors.length})</h3>
                </div>
                <div className="card-body">
                  {selectedRoom.doors.map(door => (
                    <div key={door.number} className={`door-row ${!door.hardware ? 'missing' : ''}`}>
                      <div className="door-info">
                        <strong>{door.number}</strong>
                        <span>{door.size} • {door.type}</span>
                      </div>
                      {door.hardware ? (
                        <Badge severity="success">{door.hardware}</Badge>
                      ) : (
                        <Badge severity="critical">No Hardware</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Navigation */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <span className="nav-brand-icon">📐</span>
            <span>Estinator</span>
          </div>
          <div className="nav-actions">
            <button className="btn btn-secondary">
              <Icons.Search /> Search
            </button>
            <button className="btn btn-primary">
              <Icons.Upload /> Upload
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Project</div>
            <div className="card" style={{ padding: '16px' }}>
              <strong>Bellevue Hospital</strong>
              <p className="text-small text-muted">Renovation Project</p>
            </div>
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-title">Quick Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="document-item" style={{ background: 'transparent', padding: '8px 0' }}>
                <span>🏢 Rooms</span>
                <strong>{stats.rooms}</strong>
              </div>
              <div className="document-item" style={{ background: 'transparent', padding: '8px 0' }}>
                <span>🚪 Doors</span>
                <strong>{stats.doors}</strong>
              </div>
              <div className="document-item" style={{ background: 'transparent', padding: '8px 0' }}>
                <span>⚠️ Issues</span>
                <strong style={{ color: stats.issues > 0 ? 'var(--error-600)' : 'inherit' }}>{stats.issues}</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="content-area">
          <div className="container">
            {/* Query Bar */}
            <QueryBar />

            {/* Tabs */}
            <div className="tabs">
              {['overview', 'rooms', 'insights'].map(tab => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <div className="stats-grid">
                  <StatCard value={stats.rooms} label="Total Rooms" trend="+3 this week" />
                  <StatCard value={stats.doors} label="Doors" />
                  <StatCard value={stats.issues} label="Critical Issues" variant="alert" />
                  <StatCard value={stats.documents} label="Documents" variant="success" />
                </div>

                {/* Two Column Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Documents */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">📁 Documents</h3>
                      <button className="btn btn-sm btn-ghost">View all</button>
                    </div>
                    <div className="card-body">
                      <div className="document-list">
                        {MOCK_DOCUMENTS.map(doc => <DocumentItem key={doc.id} doc={doc} />)}
                      </div>
                    </div>
                  </div>

                  {/* Critical Issues */}
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">⚠️ Critical Issues</h3>
                      <Badge severity="error">{stats.issues}</Badge>
                    </div>
                    <div className="card-body">
                      <div className="insights-list">
                        {MOCK_INSIGHTS.filter(i => i.severity === 'critical').map(insight => (
                          <InsightCard 
                            key={insight.id} 
                            insight={insight} 
                            onAction={() => alert(`RFI created for ${insight.title}`)} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'rooms' && (
              <div>
                <h2 style={{ marginBottom: '24px' }}>🏢 Rooms ({MOCK_ROOMS.length})</h2>
                <div className="rooms-grid">
                  {MOCK_ROOMS.map(room => (
                    <RoomCard key={room.number} room={room} onClick={() => setSelectedRoom(room)} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div>
                <div className="stats-grid" style={{ marginBottom: '32px' }}>
                  <StatCard value={MOCK_INSIGHTS.filter(i => i.severity === 'critical').length} label="Critical" variant="alert" />
                  <StatCard value={MOCK_INSIGHTS.filter(i => i.severity === 'warning').length} label="Warnings" variant="default" />
                  <StatCard value={MOCK_INSIGHTS.filter(i => i.severity === 'info').length} label="Informational" variant="success" />
                </div>
                
                <h2 style={{ marginBottom: '24px' }}>All Insights</h2>
                <div className="insights-list">
                  {MOCK_INSIGHTS.map(insight => (
                    <InsightCard 
                      key={insight.id} 
                      insight={insight} 
                      onAction={() => alert(`${insight.action} for ${insight.title}`)} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PolishedDashboard;
