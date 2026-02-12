import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Flag, FlagType } from '../types';
import { FLAG_COLORS, FLAG_ICONS } from '../types';
import { generateId } from '../utils/geometry';

interface FlagsPanelProps {
  onClose?: () => void;
}

export function FlagsPanel({ onClose }: FlagsPanelProps) {
  const { project, addFlag, updateFlag, deleteFlag, resolveFlag } = useProjectStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFlag, setNewFlag] = useState<Partial<Flag>>({
    type: 'question',
    title: '',
    description: '',
    priority: 'medium',
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolved'>('all');

  if (!project) return null;

  const flags = project.flags || [];
  
  const filteredFlags = flags.filter(f => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'open') return f.status === 'open';
    if (filterStatus === 'resolved') return f.status === 'resolved';
    return true;
  });

  const openCount = flags.filter(f => f.status === 'open').length;
  const resolvedCount = flags.filter(f => f.status === 'resolved').length;

  const handleAddFlag = () => {
    if (!newFlag.title?.trim()) return;
    
    const flag: Flag = {
      id: generateId(),
      type: newFlag.type as FlagType,
      title: newFlag.title,
      description: newFlag.description,
      status: 'open',
      priority: newFlag.priority as 'low' | 'medium' | 'high',
      createdAt: new Date(),
    };
    
    addFlag(flag);
    setNewFlag({ type: 'question', title: '', description: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const handleResolve = (flagId: string) => {
    const resolution = prompt('Enter resolution notes:');
    if (resolution !== null) {
      resolveFlag(flagId, resolution);
    }
  };

  const priorityColors = {
    low: 'bg-gray-500/20 text-gray-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚩</span>
            <h2 className="font-bold text-lg">Flags</h2>
            {openCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {openCount} open
              </span>
            )}
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
          )}
        </div>
        
        <p className="text-xs text-white/50 mb-3">
          "Flag, don't assume!" — Track unknowns, questions, and discrepancies
        </p>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'open', 'resolved'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filterStatus === status
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {status === 'all' ? `All (${flags.length})` :
               status === 'open' ? `Open (${openCount})` :
               `Resolved (${resolvedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Add Flag Button */}
      <div className="p-3 border-b border-white/10">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <span>🚩</span> Add Flag
          </button>
        ) : (
          <div className="space-y-3 bg-white/5 rounded-lg p-3">
            {/* Flag Type */}
            <div className="flex flex-wrap gap-1">
              {(['assumption', 'question', 'rfi', 'discrepancy', 'missing', 'verify'] as FlagType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setNewFlag({ ...newFlag, type })}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    newFlag.type === type
                      ? 'ring-2 ring-white/50'
                      : 'hover:bg-white/10'
                  }`}
                  style={{ 
                    backgroundColor: newFlag.type === type ? FLAG_COLORS[type] + '40' : 'transparent',
                    color: FLAG_COLORS[type]
                  }}
                >
                  {FLAG_ICONS[type]} {type}
                </button>
              ))}
            </div>

            {/* Title */}
            <input
              type="text"
              value={newFlag.title || ''}
              onChange={(e) => setNewFlag({ ...newFlag, title: e.target.value })}
              placeholder="What needs attention?"
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            {/* Description */}
            <textarea
              value={newFlag.description || ''}
              onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
              placeholder="Details (optional)"
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Priority:</span>
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setNewFlag({ ...newFlag, priority: p })}
                  className={`px-2 py-0.5 text-xs rounded ${
                    newFlag.priority === p ? priorityColors[p] : 'bg-white/5 text-white/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAddFlag}
                disabled={!newFlag.title?.trim()}
                className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add Flag
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/10 text-white/70 rounded hover:bg-white/20 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flags List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredFlags.length === 0 ? (
          <div className="text-center text-white/40 py-12">
            <p className="text-4xl mb-3">✓</p>
            <p className="font-medium">
              {filterStatus === 'open' ? 'No open flags!' :
               filterStatus === 'resolved' ? 'No resolved flags' :
               'No flags yet'}
            </p>
            {filterStatus !== 'resolved' && flags.length === 0 && (
              <p className="text-sm mt-2">Add flags to track unknowns and assumptions</p>
            )}
          </div>
        ) : (
          filteredFlags.map(flag => (
            <div
              key={flag.id}
              className={`rounded-lg p-3 border transition-all ${
                flag.status === 'resolved'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <span 
                  className="text-lg"
                  style={{ color: FLAG_COLORS[flag.type] }}
                >
                  {FLAG_ICONS[flag.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[flag.priority]}`}>
                      {flag.priority}
                    </span>
                    <span 
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: FLAG_COLORS[flag.type] + '30', color: FLAG_COLORS[flag.type] }}
                    >
                      {flag.type}
                    </span>
                    {flag.status === 'resolved' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                        ✓ resolved
                      </span>
                    )}
                  </div>
                  <p className={`font-medium mt-1 ${flag.status === 'resolved' ? 'line-through text-white/50' : ''}`}>
                    {flag.title}
                  </p>
                  {flag.description && (
                    <p className="text-sm text-white/60 mt-1">{flag.description}</p>
                  )}
                  {flag.resolution && (
                    <p className="text-sm text-green-400 mt-2 italic">
                      → {flag.resolution}
                    </p>
                  )}
                  <p className="text-xs text-white/30 mt-2">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              {flag.status === 'open' && (
                <div className="flex gap-2 mt-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleResolve(flag.id)}
                    className="flex-1 py-1.5 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                  >
                    ✓ Resolve
                  </button>
                  <button
                    onClick={() => updateFlag(flag.id, { status: 'deferred' })}
                    className="px-3 py-1.5 text-xs bg-white/10 text-white/60 rounded hover:bg-white/20"
                  >
                    Defer
                  </button>
                  <button
                    onClick={() => deleteFlag(flag.id)}
                    className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {flags.length > 0 && (
        <div className="p-3 border-t border-white/10 bg-gray-900/50">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">
              {openCount} open · {resolvedCount} resolved
            </span>
            <span className={openCount > 0 ? 'text-amber-400' : 'text-green-400'}>
              {openCount > 0 ? '⚠️ Review needed' : '✓ All clear'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
