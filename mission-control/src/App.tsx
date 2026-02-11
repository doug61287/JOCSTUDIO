import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Search, Calendar, Activity, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Fuse from 'fuse.js';

// Types
interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'command' | 'file' | 'message' | 'task' | 'cron';
  description: string;
  details?: string;
  status: 'success' | 'pending' | 'error';
}

interface ScheduledTask {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'cron' | 'reminder' | 'deadline';
  description?: string;
}

interface SearchResult {
  id: string;
  type: 'memory' | 'document' | 'task' | 'activity';
  title: string;
  content: string;
  date: string;
  path?: string;
}

// Mock data - in production this would come from files/API
const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', timestamp: new Date().toISOString(), type: 'command', description: 'Started JOCstudio server', status: 'success' },
  { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'file', description: 'Created Mac Mini Status Dashboard', details: '~/clawd/mac-status/server.js', status: 'success' },
  { id: '3', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'task', description: 'Set up OpenClaw on Mac Mini', status: 'success' },
  { id: '4', timestamp: new Date(Date.now() - 10800000).toISOString(), type: 'message', description: 'Morning surprise delivered', details: 'Empire Command Center dashboard', status: 'success' },
  { id: '5', timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'cron', description: 'Sasha job scan completed', details: 'Found 3 matching positions', status: 'success' },
];

const MOCK_TASKS: ScheduledTask[] = [
  { id: '1', title: 'Heartbeat check', date: new Date(Date.now() + 3600000).toISOString(), type: 'cron', description: 'Check whale trades and system status' },
  { id: '2', title: 'Sasha Job Scan', date: new Date(Date.now() + 86400000).toISOString(), time: '07:00', type: 'cron', description: 'Weekday morning job search' },
  { id: '3', title: 'Review Nassau County RFP', date: new Date(Date.now() + 172800000).toISOString(), type: 'deadline' },
  { id: '4', title: 'Jacobi FP Takeoff', date: new Date(Date.now() + 259200000).toISOString(), type: 'reminder', description: 'Complete sprinkler head count' },
];

const MOCK_SEARCH_INDEX: SearchResult[] = [
  { id: '1', type: 'memory', title: 'JOCstudio MEP Edition', content: 'Pivoted to Fire Protection + Electrical focus with 717 items and 18,657 multipliers', date: '2026-02-06', path: 'memory/2026-02-05.md' },
  { id: '2', type: 'memory', title: 'Mac Mini Setup', content: 'Successfully migrated from EC2 to Mac Mini M4 with 16GB RAM', date: '2026-02-06', path: 'memory/2026-02-06.md' },
  { id: '3', type: 'document', title: 'Nassau County RFP', content: 'Building Construction Requirements Contract B90400-05G with $5M estimated value', date: '2026-02-05', path: 'projects/jocstudio/jacobi-fp/' },
  { id: '4', type: 'task', title: 'JOC Line Item Picker', content: 'Built conversational multiplier wizard for MEP catalog', date: '2026-02-06', status: 'completed' },
  { id: '5', type: 'document', title: 'Jacobi FP Drawings', content: '87 drawing sheets for Building 4 Fire Alarm and Sprinkler Project', date: '2026-02-06', path: 'projects/jocstudio/jacobi-fp-drawings/' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'search'>('activity');
  const [activities, setActivities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Initialize Fuse for search
  const fuse = useMemo(() => new Fuse(MOCK_SEARCH_INDEX, {
    keys: ['title', 'content', 'type'],
    threshold: 0.4,
  }), []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = fuse.search(searchQuery);
      setSearchResults(results.map(r => r.item));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, fuse]);

  // Activity Feed Component
  const ActivityFeed = () => (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#c9a227', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Activity size={24} />
        Activity Feed
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activities.map(activity => (
          <div key={activity.id} style={{
            padding: 16,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            borderLeft: `4px solid ${activity.status === 'success' ? '#22c55e' : activity.status === 'error' ? '#ef4444' : '#eab308'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {activity.type === 'command' && <span style={{ color: '#3b82f6' }}>⚡</span>}
                  {activity.type === 'file' && <FileText size={16} style={{ color: '#8b5cf6' }} />}
                  {activity.type === 'message' && <span style={{ color: '#22c55e' }}>💬</span>}
                  {activity.type === 'task' && <CheckCircle size={16} style={{ color: '#eab308' }} />}
                  {activity.type === 'cron' && <Clock size={16} style={{ color: '#f97316' }} />}
                  <span style={{ color: '#e8f1f5', fontWeight: 500 }}>{activity.description}</span>
                </div>
                {activity.details && (
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginLeft: 24 }}>{activity.details}</p>
                )}
              </div>
              <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                {format(parseISO(activity.timestamp), 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Calendar Component
  const CalendarView = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getTasksForDay = (date: Date) => {
      return MOCK_TASKS.filter(task => {
        const taskDate = parseISO(task.date);
        return isSameDay(taskDate, date);
      });
    };

    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ color: '#c9a227', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={24} />
          Weekly Schedule
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {weekDays.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, today);
            return (
              <div key={idx} style={{
                background: isToday ? 'rgba(201, 162, 39, 0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isToday ? '#c9a227' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                padding: 12,
                minHeight: 120
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  paddingBottom: 8, 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: 8
                }}>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{format(day, 'EEE')}</div>
                  <div style={{ 
                    color: isToday ? '#c9a227' : '#e8f1f5', 
                    fontSize: '1.25rem', 
                    fontWeight: 'bold' 
                  }}>
                    {format(day, 'd')}
                  </div>
                </div>
                {dayTasks.map(task => (
                  <div key={task.id} style={{
                    padding: 8,
                    background: task.type === 'cron' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                    borderRadius: 6,
                    marginBottom: 4,
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ color: '#e8f1f5', fontWeight: 500 }}>{task.title}</div>
                    {task.time && <div style={{ color: '#6b7280' }}>{task.time}</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Upcoming Tasks List */}
        <div style={{ marginTop: 30 }}>
          <h3 style={{ color: '#8b9dc3', marginBottom: 16 }}>All Scheduled Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOCK_TASKS.map(task => (
              <div key={task.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8
              }}>
                <span style={{ 
                  padding: '4px 8px', 
                  background: task.type === 'cron' ? '#22c55e' : '#eab308',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: '#000'
                }}>
                  {task.type.toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#e8f1f5', fontWeight: 500 }}>{task.title}</div>
                  {task.description && <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{task.description}</div>}
                </div>
                <div style={{ color: '#8b9dc3', fontSize: '0.85rem' }}>
                  {format(parseISO(task.date), 'MMM d')}
                  {task.time && ` @ ${task.time}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Search Component
  const SearchView = () => (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#c9a227', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Search size={24} />
        Global Search
      </h2>
      
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
        <input
          type="text"
          placeholder="Search memories, documents, tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 16px 16px 48px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            color: '#fff',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {searchResults.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ color: '#6b7280' }}>{searchResults.length} results found</p>
          {searchResults.map(result => (
            <div key={result.id} style={{
              padding: 16,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 12,
              borderLeft: `4px solid ${
                result.type === 'memory' ? '#c9a227' : 
                result.type === 'document' ? '#3b82f6' : 
                result.type === 'task' ? '#22c55e' : '#8b5cf6'
              }`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ 
                  padding: '2px 8px', 
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase'
                }}>
                  {result.type}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{result.date}</span>
              </div>
              <h3 style={{ color: '#e8f1f5', margin: '8px 0' }}>{result.title}</h3>
              <p style={{ color: '#8b9dc3', fontSize: '0.9rem' }}>{result.content}</p>
              {result.path && (
                <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 8 }}>📁 {result.path}</p>
              )}
            </div>
          ))}
        </div>
      ) : searchQuery ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>No results found for "{searchQuery}"</p>
      ) : (
        <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
          <Search size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <p>Start typing to search across all your data</p>
          <p style={{ fontSize: '0.85rem', marginTop: 8 }}>Searches: memories, documents, tasks, activities</p>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1a', color: '#e8f1f5' }}>
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(90deg, #1a1f2e 0%, #0f1419 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '20px 30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: 'linear-gradient(135deg, #c9a227, #e8c547)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🎯
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#c9a227' }}>Mission Control</h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Doug's Command Center</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: 20, fontSize: '0.8rem' }}>
            ● Online
          </span>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        gap: 4, 
        padding: '0 30px',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {[
          { id: 'activity', label: 'Activity Feed', icon: Activity },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'search', label: 'Global Search', icon: Search },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 24px',
              background: activeTab === tab.id ? 'rgba(201, 162, 39, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#c9a227' : 'transparent'}`,
              color: activeTab === tab.id ? '#c9a227' : '#8b9dc3',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'search' && <SearchView />}
      </main>
    </div>
  );
}
