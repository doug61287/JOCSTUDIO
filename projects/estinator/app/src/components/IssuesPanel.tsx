import { useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, Filter } from 'lucide-react';
import type { Issue, IssueStatus } from '../types';

interface IssuesPanelProps {
  issues: Issue[];
  onIssueStatusChange: (issueId: string, status: IssueStatus) => void;
  onIssueClick?: (issue: Issue) => void;
  onDraftRFI?: (issueId: string) => void;
}

const statusColors: Record<IssueStatus, { bg: string; text: string; dot: string; border: string }> = {
  open: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', dot: 'bg-[#FBBF24]', border: 'border-[#FBBF24]/30' },
  blocked: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]', border: 'border-[#EF4444]/30' },
  resolved: { bg: 'bg-[#4ADE80]/10', text: 'text-[#4ADE80]', dot: 'bg-[#4ADE80]', border: 'border-[#4ADE80]/30' },
};

const tradeEmojis: Record<string, string> = {
  Electrical: '⚡',
  Mechanical: '🌡️',
  Plumbing: '🚿',
  Structural: '🏗️',
  Hardware: '🚪',
  Fire: '🔥',
  General: '📋',
};

export function IssuesPanel({ issues, onIssueStatusChange, onIssueClick, onDraftRFI }: IssuesPanelProps) {
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all' | 'rfi'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Separate issues and RFIs
  const regularIssues = issues.filter(i => !i.isRFI);
  const rfis = issues.filter(i => i.isRFI);
  
  // Apply filters
  let filteredItems = filterStatus === 'rfi' 
    ? rfis 
    : filterStatus === 'all' 
      ? regularIssues 
      : regularIssues.filter(i => i.status === filterStatus);

  const openCount = regularIssues.filter(i => i.status === 'open').length;
  const blockedCount = regularIssues.filter(i => i.status === 'blocked').length;
  const rfiCount = rfis.length;

  return (
    <div className="w-[320px] min-w-[320px] bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#FBBF24]" />
          <div>
            <h2 className="text-[15px] font-semibold text-white/90">Issues & RFIs</h2>
            <p className="text-[12px] text-[#8A8F98]">{regularIssues.length} issues, {rfiCount} RFIs</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-[#2A2A2A] text-[#8A8F98] transition-fast">
          <Filter className="w-4 h-4" />
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
          label="RFIs" 
          count={rfiCount} 
          color="text-[#5E6AD2]"
          isActive={filterStatus === 'rfi'}
          onClick={() => setFilterStatus('rfi')}
        />
        <FilterTab 
          label="All" 
          count={regularIssues.length} 
          color="text-[#8A8F98]"
          isActive={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
        />
      </div>

      {/* Issues/RFIs List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#8A8F98]">
            <CheckCircle2 className="w-10 h-10 mb-3 text-[#4ADE80]" />
            <p className="text-[14px]">No {filterStatus !== 'all' ? filterStatus : ''} items</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => (
              <IssueCard 
                key={item.id}
                issue={item}
                isSelected={item.id === selectedIssueId}
                onClick={() => {
                  setSelectedIssueId(item.id === selectedIssueId ? null : item.id);
                  onIssueClick?.(item);
                }}
                onStatusChange={onIssueStatusChange}
                onDraftRFI={onDraftRFI}
              />
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="p-3 border-t border-[#2A2A2A]">
        <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2">
          By Trade
        </div>
        <div className="space-y-1">
          {['Electrical', 'Plumbing', 'Fire'].map(trade => {
            const count = regularIssues.filter(i => i.trade === trade && i.status !== 'resolved').length;
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
  onDraftRFI?: (issueId: string) => void;
}

function IssueCard({ issue, isSelected, onClick, onStatusChange, onDraftRFI }: IssueCardProps) {
  const colors = statusColors[issue.status];
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-fast ${
        isSelected 
          ? 'bg-[#5E6AD2]/10 border-[#5E6AD2]' 
          : `bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]`
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${colors.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-medium text-white/90 leading-snug line-clamp-2 flex-1">
              {issue.title}
            </h4>
            {issue.isRFI && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#5E6AD2]/20 text-[#5E6AD2] rounded">
                RFI
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-[#8A8F98]">{tradeEmojis[issue.trade]} {issue.trade}</span>
            {issue.sourceDocument && (
              <>
                <span className="text-[#2A2A2A]">•</span>
                <span className="text-[11px] text-[#8A8F98] truncate">{issue.sourceDocument}</span>
              </>
            )}
          </div>
          {issue.description && (
            <p className="text-[11px] text-[#6B7280] mt-1 line-clamp-2">
              {issue.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#2A2A2A]">
        {!issue.isRFI && issue.status !== 'resolved' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(issue.id, 'resolved');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[11px] text-[#8A8F98] transition-fast"
          >
            <CheckCircle2 className="w-3 h-3" />
            Resolve
          </button>
        )}
        {!issue.isRFI && issue.status === 'open' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDraftRFI?.(issue.id);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#5E6AD2]/20 hover:bg-[#5E6AD2]/30 text-[11px] text-[#5E6AD2] transition-fast"
          >
            <MessageSquare className="w-3 h-3" />
            Draft RFI
          </button>
        )}
      </div>
    </div>
  );
}

export default IssuesPanel;
