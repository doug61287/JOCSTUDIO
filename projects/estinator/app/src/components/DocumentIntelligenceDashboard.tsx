/**
 * Document Intelligence Dashboard
 * 
 * Shows:
 * - Project summary (rooms, doors, equipment counts)
 * - Room-by-room scope breakdown
 * - Detected insights/conflicts
 * - Natural language query interface
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Room {
  number: string;
  name: string;
  finishes: {
    floor?: string;
    walls?: string;
    ceiling?: string;
    base?: string;
  };
  doors: Array<{
    number: string;
    size: string;
    type: string;
  }>;
}

interface Insight {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation?: string;
}

export const DocumentIntelligenceDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'insights' | 'query'>('overview');
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load project data
  useEffect(() => {
    if (!projectId) return;
    
    fetch(`/api/documents/${projectId}/summary`)
      .then(r => r.json())
      .then(setSummary);
    
    fetch(`/api/documents/${projectId}/rooms`)
      .then(r => r.json())
      .then(data => setRooms(data.rooms));
    
    fetch(`/api/documents/${projectId}/insights`)
      .then(r => r.json())
      .then(data => setInsights(data.insights));
  }, [projectId]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${projectId}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      const data = await res.json();
      setQueryResult(data);
    } finally {
      setLoading(false);
    }
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '🔵';
    }
  };

  return (
    <div className="document-intelligence-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📄 Document Intelligence</h1>
        <div className="tab-nav">
          {['overview', 'rooms', 'insights', 'query'].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div className="overview-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{summary.summary?.total_rooms || 0}</div>
              <div className="stat-label">Rooms</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.summary?.total_doors || 0}</div>
              <div className="stat-label">Doors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{insights.filter(i => i.severity === 'critical').length}</div>
              <div className="stat-label">Critical Issues</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.document_count || 0}</div>
              <div className="stat-label">Documents</div>
            </div>
          </div>

          <div className="room-types">
            <h3>Room Types</h3>
            <div className="type-bars">
              {Object.entries(summary.summary?.room_types || {}).map(([type, count]) => (
                <div key={type} className="type-bar">
                  <span className="type-name">{type}</span>
                  <div className="type-progress">
                    <div 
                      className="type-fill" 
                      style={{ width: `${(count as number / summary.summary?.total_rooms) * 100}%` }}
                    />
                  </div>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="rooms-panel">
          <div className="rooms-list">
            {Object.values(rooms).map(room => (
              <div key={room.number} className="room-card">
                <div className="room-header">
                  <span className="room-number">Room {room.number}</span>
                  <span className="room-name">{room.name}</span>
                </div>
                
                <div className="room-details">
                  <div className="detail-section">
                    <h4>Finishes</h4>
                    <div className="finish-grid">
                      {room.finishes?.floor && (
                        <div className="finish-item">
                          <label>Floor</label>
                          <span>{room.finishes.floor}</span>
                        </div>
                      )}
                      {room.finishes?.walls && (
                        <div className="finish-item">
                          <label>Walls</label>
                          <span>{room.finishes.walls}</span>
                        </div>
                      )}
                      {room.finishes?.ceiling && (
                        <div className="finish-item">
                          <label>Ceiling</label>
                          <span>{room.finishes.ceiling}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {room.doors?.length > 0 && (
                    <div className="detail-section">
                      <h4>Doors ({room.doors.length})</h4>
                      <ul className="door-list">
                        {room.doors.map(door => (
                          <li key={door.number}>
                            <strong>{door.number}</strong>
                            <span>{door.size} {door.type}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="insights-panel">
          <div className="insights-summary">
            <div className="severity-counts">
              {['critical', 'high', 'medium', 'low'].map(severity => {
                const count = insights.filter(i => i.severity === severity).length;
                return count > 0 ? (
                  <div key={severity} className={`severity-badge ${severity}`}>
                    {severityIcon(severity)} {count} {severity}
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="insights-list">
            {insights.map((insight, idx) => (
              <div key={idx} className={`insight-card ${insight.severity}`}>
                <div className="insight-header">
                  <span className="severity-icon">{severityIcon(insight.severity)}</span>
                  <span className="insight-category">{insight.category}</span>
                </div>
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
                {insight.recommendation && (
                  <div className="recommendation">
                    <strong>💡 Recommendation:</strong> {insight.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <div className="query-panel">
          <div className="query-input">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask about the project... (e.g., 'How many rooms are there?')"
              onKeyPress={e => e.key === 'Enter' && handleQuery()}
            />
            <button onClick={handleQuery} disabled={loading}>
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>

          {queryResult && (
            <div className="query-result">
              <div className="answer">{queryResult.answer}</div>
              {queryResult.sources?.length > 0 && (
                <div className="sources">
                  <strong>Sources:</strong> {queryResult.sources.join(', ')}
                </div>
              )}
              {queryResult.data && (
                <pre className="data">{JSON.stringify(queryResult.data, null, 2)}</pre>
              )}
            </div>
          )}

          <div className="query-suggestions">
            <h4>Try asking:</h4>
            <ul>
              <li onClick={() => { setQuery('How many rooms are there?'); handleQuery(); }}>
                "How many rooms are there?"
              </li>
              <li onClick={() => { setQuery('What doors are in room 101?'); handleQuery(); }}>
                "What doors are in room 101?"
              </li>
              <li onClick={() => { setQuery('What are the finishes in the conference room?'); handleQuery(); }}>
                "What are the finishes in the conference room?"
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentIntelligenceDashboard;
