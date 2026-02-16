import React, { useState, useEffect } from 'react';
import './Dashboard.css';

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
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  roomNumber?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'addendum';
  status: 'processing' | 'analyzed' | 'error';
  issues?: number;
}

// Mock data
const MOCK_ROOMS: Room[] = [
  {
    number: '101',
    name: 'Office',
    area: 120,
    finishes: { floor: 'Carpet', walls: 'Painted GWB', ceiling: 'ACT' },
    doors: [
      { number: '101-A', size: "3'0\"×7'0\"", type: 'HM' },
      { number: '101-B', size: "3'0\"×7'0\"", type: 'HM' },
    ],
    issues: 2,
  },
  {
    number: '102',
    name: 'Office',
    area: 120,
    finishes: { floor: 'Carpet', walls: 'Painted GWB', ceiling: 'ACT' },
    doors: [{ number: '102-A', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 1' }],
    issues: 0,
  },
  {
    number: '103',
    name: 'Conference',
    area: 240,
    finishes: { floor: 'VCT', walls: 'Fabric Wrapped', ceiling: 'ACT' },
    doors: [
      { number: '103-A', size: "3'6\"×7'0\"", type: 'HM' },
      { number: '103-B', size: "3'6\"×7'0\"", type: 'HM' },
    ],
    issues: 2,
  },
  {
    number: '104',
    name: 'Restroom',
    area: 80,
    finishes: { floor: 'Tile', walls: 'Tile', ceiling: 'GWB' },
    doors: [{ number: '104-A', size: "2'6\"×7'0\"", type: 'HM' }],
    issues: 1,
  },
];

const MOCK_INSIGHTS: Insight[] = [
  {
    id: '1',
    severity: 'critical',
    title: 'Missing Hardware Specification',
    description: 'Door 101-A has no hardware set assigned',
    roomNumber: '101',
  },
  {
    id: '2',
    severity: 'critical',
    title: 'Missing Hardware Specification',
    description: 'Door 101-B has no hardware set assigned',
    roomNumber: '101',
  },
  {
    id: '3',
    severity: 'warning',
    title: 'Missing Plumbing Fixtures',
    description: 'Room 104 (Restroom) has no fixtures scheduled',
    roomNumber: '104',
  },
];

const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'A-101 First Floor Plan.pdf', type: 'drawing', status: 'analyzed' },
  { id: '2', name: 'A-102 Finish Schedule.pdf', type: 'drawing', status: 'analyzed' },
  { id: '3', name: 'A-103 Door Schedule.pdf', type: 'drawing', status: 'analyzed', issues: 2 },
  { id: '4', name: '260000 Electrical Spec.pdf', type: 'spec', status: 'analyzed' },
  { id: '5', name: 'Addendum 1.pdf', type: 'addendum', status: 'analyzed' },
];

// Components
const StatCard: React.FC<{ value: number | string; label: string; alert?: boolean }> = ({
  value,
  label,
  alert,
}) => (
  <div className={`stat-card ${alert ? 'alert' : ''}`}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const IssueBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const icons = { critical: '🔴', warning: '🟡', info: '🔵' };
  return <span className={`issue-badge ${severity}`}>{icons[severity as keyof typeof icons]}</span>;
};

const RoomCard: React.FC<{ room: Room; onClick: () => void }> = ({ room, onClick }) => (
  <div className="room-card" onClick={onClick}>
    <div className="room-header">
      <div className="room-number">{room.number}</div>
      <div className="room-name">{room.name}</div>
      {room.issues > 0 && <span className="room-issues">{room.issues}</span>}
    </div>
    <div className="room-details">
      <div className="room-stat">
        <span className="stat-icon">🚪</span>
        {room.doors.length} doors
      </div>
      <div className="room-stat">
        <span className="stat-icon">📐</span>
        {room.area} SF
      </div>
    </div>
    <div className="room-finishes">
      {room.finishes.floor && <span className="finish-tag">{room.finishes.floor}</span>}
    </div>
  </div>
);

const InsightCard: React.FC<{ insight: Insight; onAction: () => void }> = ({ insight, onAction }) => (
  <div className={`insight-card ${insight.severity}`}>
    <div className="insight-header">
      <IssueBadge severity={insight.severity} />
      <span className="insight-room">{insight.roomNumber ? `Room ${insight.roomNumber}` : 'General'}</span>
    </div>
    <div className="insight-title">{insight.title}</div>
    <div className="insight-description">{insight.description}</div>
    <button className="insight-action" onClick={onAction}>
      Generate RFI →
    </button>
  </div>
);

const DocumentItem: React.FC<{ doc: Document }> = ({ doc }) => {
  const icons = { drawing: '📄', spec: '📋', addendum: '📝' };
  const statusIcons = { processing: '⏳', analyzed: '✓', error: '❌' };
  
  return (
    <div className={`document-item ${doc.status}`}>
      <span className="doc-icon">{icons[doc.type]}</span>
      <span className="doc-name">{doc.name}</span>
      <span className="doc-status">{statusIcons[doc.status]}</span>
      {doc.issues && <span className="doc-issues">{doc.issues} issues</span>}
    </div>
  );
};

// Main Dashboard
export const EstinatorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'insights'>('overview');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showQuery, setShowQuery] = useState(false);
  const [query, setQuery] = useState('');

  const stats = {
    rooms: MOCK_ROOMS.length,
    doors: MOCK_ROOMS.reduce((acc, r) => acc + r.doors.length, 0),
    issues: MOCK_INSIGHTS.length,
    critical: MOCK_INSIGHTS.filter(i => i.severity === 'critical').length,
  };

  const handleQuerySubmit = () => {
    if (query.toLowerCase().includes('how many rooms')) {
      alert(`There are ${MOCK_ROOMS.length} rooms in this project.`);
    } else if (query.toLowerCase().includes('doors')) {
      const totalDoors = MOCK_ROOMS.reduce((acc, r) => acc + r.doors.length, 0);
      alert(`There are ${totalDoors} doors total.`);
    } else {
      alert('Try asking: "How many rooms are there?" or "How many doors?"');
    }
    setQuery('');
  };

  if (selectedRoom) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <button className="back-btn" onClick={() => setSelectedRoom(null)}>← Back</button>
          <h1>Room {selectedRoom.number} - {selectedRoom.name}</h1>
        </header>
        
        <div className="room-detail">
          <div className="detail-section">
            <h3>📐 Area</h3>
            <div className="big-number">{selectedRoom.area} SF</div>
          </div>
          
          <div className="detail-section">
            <h3>🔨 Finishes</h3>
            <div className="finish-grid">
              <div className="finish-item">
                <label>Floor</label>
                <span>{selectedRoom.finishes.floor || 'Not specified'}</span>
              </div>
              <div className="finish-item">
                <label>Walls</label>
                <span>{selectedRoom.finishes.walls || 'Not specified'}</span>
              </div>
              <div className="finish-item">
                <label>Ceiling</label>
                <span>{selectedRoom.finishes.ceiling || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>🚪 Doors ({selectedRoom.doors.length})</h3>
            {selectedRoom.doors.map(door => (
              <div key={door.number} className={`door-item ${!door.hardware ? 'missing' : ''}`}>
                <div className="door-number">{door.number}</div>
                <div className="door-specs">
                  <span>{door.size}</span>
                  <span>{door.type}</span>
                  {door.hardware ? (
                    <span className="hardware-set">{door.hardware}</span>
                  ) : (
                    <span className="hardware-missing">⚠️ No hardware</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="detail-actions">
            <button className="btn-primary">Generate RFI</button>
            <button className="btn-secondary">Add to Takeoff</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📄 Estinator</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowQuery(!showQuery)}>
            💬 Ask
          </button>
          <button className="btn-primary">+ Upload</button>
        </div>
      </header>

      {showQuery && (
        <div className="query-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about your project..."
            onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
          />
          <button onClick={handleQuerySubmit}>Ask</button>
        </div>
      )}

      <nav className="tab-nav">
        {['overview', 'rooms', 'insights'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <StatCard value={stats.rooms} label="Rooms" />
              <StatCard value={stats.doors} label="Doors" />
              <StatCard value={stats.issues} label="Issues" alert={stats.critical > 0} />
              <StatCard value={MOCK_DOCUMENTS.length} label="Documents" />
            </div>

            <div className="dashboard-grid">
              <section className="panel">
                <h2>📁 Documents</h2>
                <div className="document-list">
                  {MOCK_DOCUMENTS.map(doc => (
                    <DocumentItem key={doc.id} doc={doc} />
                  ))}
                </div>
              </section>

              <section className="panel">
                <h2>⚠️ Critical Issues ({stats.critical})</h2>
                <div className="insights-list compact">
                  {MOCK_INSIGHTS.filter(i => i.severity === 'critical').map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onAction={() => alert(`RFI generated for ${insight.title}`)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'rooms' && (
          <section className="rooms-panel">
            <h2>🏢 Rooms ({MOCK_ROOMS.length})</h2>
            <div className="rooms-grid">
              {MOCK_ROOMS.map(room => (
                <RoomCard
                  key={room.number}
                  room={room}
                  onClick={() => setSelectedRoom(room)}
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'insights' && (
          <section className="insights-panel">
            <div className="insights-summary">
              <StatCard value={stats.critical} label="Critical" alert />
              <StatCard value={MOCK_INSIGHTS.filter(i => i.severity === 'warning').length} label="Warnings" />
              <StatCard value={MOCK_INSIGHTS.filter(i => i.severity === 'info').length} label="Info" />
            </div>
            <h2>All Issues</h2>
            <div className="insights-list">
              {MOCK_INSIGHTS.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onAction={() => alert(`RFI generated for ${insight.title}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default EstinatorDashboard;
