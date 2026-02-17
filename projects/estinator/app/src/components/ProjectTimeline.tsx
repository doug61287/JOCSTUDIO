import { useState } from 'react';
import { Icon } from './Icon';

interface TimelineEvent {
  id: string;
  date: string;
  week: number;
  type: 'upload' | 'conflict' | 'rfi' | 'resolution' | 'milestone';
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
}

const MOCK_TIMELINE: TimelineEvent[] = [
  {
    id: '1',
    date: 'Feb 3',
    week: 1,
    type: 'upload',
    title: 'Initial drawings uploaded',
    description: 'A-101, A-102, A-103, and 5 specs added to project',
    status: 'completed',
  },
  {
    id: '2',
    date: 'Feb 4',
    week: 1,
    type: 'conflict',
    title: '3 conflicts detected',
    description: 'Missing hardware specs for doors 101-A, 101-B, 103-A',
    status: 'completed',
  },
  {
    id: '3',
    date: 'Feb 5',
    week: 1,
    type: 'conflict',
    title: 'Scope gap identified',
    description: 'Room 106 (restroom) has no plumbing fixtures scheduled',
    status: 'completed',
  },
  {
    id: '4',
    date: 'Feb 6',
    week: 2,
    type: 'rfi',
    title: 'RFI #1 sent to architect',
    description: 'Requested hardware specifications for 3 doors',
    status: 'completed',
  },
  {
    id: '5',
    date: 'Feb 10',
    week: 2,
    type: 'upload',
    title: 'Addendum 1 received',
    description: 'Window quantities increased from 25 to 32',
    status: 'completed',
  },
  {
    id: '6',
    date: 'Feb 12',
    week: 2,
    type: 'resolution',
    title: 'RFI #1 resolved',
    description: 'Hardware Set 4 confirmed for all patient room doors',
    status: 'completed',
  },
  {
    id: '7',
    date: 'Feb 14',
    week: 3,
    type: 'milestone',
    title: 'Takeoff 60% complete',
    description: 'Architectural and structural quantities verified',
    status: 'active',
  },
  {
    id: '8',
    date: 'Feb 17',
    week: 3,
    type: 'rfi',
    title: 'RFI #2 pending',
    description: 'Awaiting clarification on ceiling type in Room 103',
    status: 'active',
  },
  {
    id: '9',
    date: 'Feb 24',
    week: 5,
    type: 'milestone',
    title: 'Bid submission',
    description: 'Final estimate due',
    status: 'pending',
  },
];

interface ProjectTimelineProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectTimeline = ({ isOpen, onClose }: ProjectTimelineProps) => {
  const [filter, setFilter] = useState<'all' | 'conflicts' | 'rfis' | 'milestones'>('all');

  const filteredEvents = filter === 'all' 
    ? MOCK_TIMELINE 
    : MOCK_TIMELINE.filter(e => {
        if (filter === 'conflicts') return e.type === 'conflict';
        if (filter === 'rfis') return e.type === 'rfi' || e.type === 'resolution';
        if (filter === 'milestones') return e.type === 'milestone';
        return true;
      });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'upload': return '📤';
      case 'conflict': return '⚠️';
      case 'rfi': return '📧';
      case 'resolution': return '✅';
      case 'milestone': return '🎯';
      default: return '📌';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-primary-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const stats = {
    total: MOCK_TIMELINE.length,
    conflicts: MOCK_TIMELINE.filter(e => e.type === 'conflict').length,
    rfis: MOCK_TIMELINE.filter(e => e.type === 'rfi').length,
    resolved: MOCK_TIMELINE.filter(e => e.type === 'resolution').length,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Timeline</h2>
            <p className="text-sm text-gray-500">6 weeks to bid submission</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon name="close" className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.conflicts}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Conflicts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.rfis}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">RFIs Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total Events</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-200">
          {(['all', 'conflicts', 'rfis', 'milestones'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="relative flex gap-4">
                  {/* Week Badge */}
                  {index === 0 || filteredEvents[index - 1].week !== event.week ? (
                    <div className="absolute -left-2 -top-1 px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded">
                      Week {event.week}
                    </div>
                  ) : null}

                  {/* Icon */}
                  <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                    event.status === 'completed' ? 'bg-green-50 border-2 border-green-200' :
                    event.status === 'active' ? 'bg-primary-50 border-2 border-primary-200' :
                    'bg-gray-50 border-2 border-gray-200'
                  }`}>
                    {getEventIcon(event.type)}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(event.status)}`}></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400">{event.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'completed' ? 'bg-green-100 text-green-700' :
                        event.status === 'active' ? 'bg-primary-100 text-primary-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>

                    {/* Action buttons for active items */}
                    {event.status === 'active' && event.type === 'rfi' && (
                      <div className="mt-3 flex gap-2">
                        <button className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors">
                          Send Reminder
                        </button>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          Update Status
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="check" className="w-4 h-4 text-green-500" />
              <span>2 of 3 critical issues resolved</span>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Export Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
