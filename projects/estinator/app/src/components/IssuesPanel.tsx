import { useState } from 'react';
import type { Issue, IssueStatus, Project } from '../types';

interface IssuesPanelProps {
  issues: Issue[];
  activeProject: Project;
  onIssueStatusChange: (issueId: string, status: IssueStatus) => void;
}

const statusColors: Record<IssueStatus, { bg: string; text: string; dot: string }> = {
  open: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', dot: 'bg-[#FBBF24]' },
  blocked: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
  resolved: { bg: 'bg-[#4ADE80]/10', text: 'text-[#4ADE80]', dot: 'bg-[#4ADE80]' },
};

const tradeEmojis: Record<string, string> = {
  Electrical: '⚡',
  Mechanical: '🌡️',
  Plumbing: '🚿',
  Structural: '🏗️',
  Hardware: '🚪',
  General: '📋',
};

export function IssuesPanel({ issues, activeProject, onIssueStatusChange }: IssuesPanelProps) {
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const projectIssues = issues.filter(i => i.projectId === activeProject.id);
  const filteredIssues = filterStatus === 'all' 
    ? projectIssues 
    : projectIssues.filter(i => i.status === filterStatus);
  
  const openCount = projectIssues.filter(i => i.status === 'open').length;
  const blockedCount = projectIssues.filter(i => i.status === 'blocked').length;
  const resolvedCount = projectIssues.filter(i => i.status === 'resolved').length;

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  return (
    <div className="w-[320px] min-w-[320px] bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚩</span>
          <div>
            <h2 className="text-[15px] font-semibold text-white/90">Issues</h2>
            <p className="text-[12px] text-[#8A8F98]">{projectIssues.length} total</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#2A2A2A] text-[#8A8F98] transition-fast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#2A2A2A]">
        <FilterTab 
          label="Blocked" 
          count={blockedCount} 
          color="text-[#EF4444]"
          isActive={filterStatus === 'blocked'}
          onClick={() => setFilterStatus('blocked')}
        />
        <FilterTab 
          label="Open" 
          count={openCount} 
          color="text-[#FBBF24]"
          isActive={filterStatus === 'open'}
          onClick={() => setFilterStatus('open')}
        />
        <FilterTab 
          label="Resolved" 
          count={resolvedCount} 
          color="text-[#4ADE80]"
          isActive={filterStatus === 'resolved'}
          onClick={() => setFilterStatus('resolved')}
        />
        <FilterTab 
          label="All" 
          count={projectIssues.length} 
          color="text-[#8A8F98]"
          isActive={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
        />
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#8A8F98]">
            <span className="text-3xl mb-2">✅</span>
            <p className="text-[14px]">No {filterStatus !== 'all' ? filterStatus : ''} issues</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredIssues.map(issue => (
              <IssueCard 
                key={issue.id}
                issue={issue}
                isSelected={issue.id === selectedIssueId}
                onClick={() => setSelectedIssueId(issue.id === selectedIssueId ? null : issue.id)}
                onStatusChange={onIssueStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* By Trade Summary */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2">
          By Trade
        </div>
        <div className="space-y-1">
          {['Electrical', 'Mechanical', 'Hardware'].map(trade => {
            const count = projectIssues.filter(i => i.trade === trade && i.status !== 'resolved').length;
            if (count === 0) return null;
            return (
              <div key={trade} className="flex items-center justify-between text-[13px]">
                <span className="text-[#8A8F98]">{tradeEmojis[trade]} {trade}</span>
                <span className="text-white/90">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal 
          issue={selectedIssue}
          onClose={() => setSelectedIssueId(null)}
          onStatusChange={onIssueStatusChange}
        />
      )}
    </div>
  );
}

interface FilterTabProps {
  label: string;
  count: number;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterTab({ label, count, color, isActive, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-2 text-[12px] font-medium transition-fast border-b-2 ${
        isActive 
          ? `border-[#5E6AD2] text-white` 
          : 'border-transparent text-[#8A8F98] hover:text-white/90'
      }`}
    >
      <span className={isActive ? color : ''}>{label}</span>
      <span className="ml-1.5 text-[#6B7280]">({count})</span>
    </button>
  );
}

interface IssueCardProps {
  issue: Issue;
  isSelected: boolean;
  onClick: () => void;
  onStatusChange: (issueId: string, status: IssueStatus) => void;
}

function IssueCard({ issue, isSelected, onClick, onStatusChange }: IssueCardProps) {
  const colors = statusColors[issue.status];
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-fast ${
        isSelected 
          ? 'bg-[#5E6AD2]/10 border-[#5E6AD2]' 
          : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${colors.dot}`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-medium text-white/90 leading-snug line-clamp-2">
            {issue.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-[#8A8F98]">{tradeEmojis[issue.trade]} {issue.trade}</span>
            {issue.sourceDocument && (
              <>
                <span className="text-[#2A2A2A]">•</span>
                <span className="text-[11px] text-[#8A8F98] truncate">{issue.sourceDocument}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#2A2A2A]">
        {issue.status !== 'resolved' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(issue.id, 'resolved');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[11px] text-[#8A8F98] transition-fast"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Resolve
          </button>
        )}
        {issue.status === 'open' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(issue.id, 'blocked');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[11px] text-[#8A8F98] transition-fast"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Block
          </button>
        )}
        <button className="flex items-center gap-1 px-2 py-1 rounded bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[11px] text-[#8A8F98] transition-fast ml-auto">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Draft RFI
        </button>
      </div>
    </div>
  );
}

interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
  onStatusChange: (issueId: string, status: IssueStatus) => void;
}

function IssueDetailModal({ issue, onClose, onStatusChange }: IssueDetailModalProps) {
  const colors = statusColors[issue.status];
  
  return (
    <div className="absolute inset-0 z-20 bg-[#0D0D0D]/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${colors.text}`}>
              {issue.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <h3 className="text-[16px] font-semibold text-white/90 mb-3">{issue.title}</h3>
        
        <div className="space-y-3 text-[13px]">
          <div>
            <span className="text-[#8A8F98]">Trade: </span>
            <span>{tradeEmojis[issue.trade]} {issue.trade}</span>
          </div>
          {issue.sourceDocument && (
            <div>
              <span className="text-[#8A8F98]">Source: </span>
              <span>{issue.sourceDocument}</span>
            </div>
          )}
          <div>
            <span className="text-[#8A8F98]">Created: </span>
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
          {issue.conversationId && (
            <div>
              <span className="text-[#8A8F98]">From: </span>
              <button className="text-[#5E6AD2] hover:underline">Chat conversation</button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          {issue.status !== 'resolved' && (
            <button
              onClick={() => {
                onStatusChange(issue.id, 'resolved');
                onClose();
              }}
              className="flex-1 py-2 bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 border border-[#4ADE80]/30 rounded-lg text-[13px] font-medium text-[#4ADE80] transition-fast"
            >
              Mark Resolved
            </button>
          )}
          <button className="flex-1 py-2 bg-[#5E6AD2] hover:bg-[#6872E3] rounded-lg text-[13px] font-medium text-white transition-fast">
            Draft RFI
          </button>
        </div>
      </div>
    </div>
  );
}
