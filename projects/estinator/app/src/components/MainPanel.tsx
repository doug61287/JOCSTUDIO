import type { Project, RFI, ViewType } from '../types';

interface MainPanelProps {
  project: Project;
  rfis: RFI[];
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const statusColors = {
  open: 'bg-[#FBBF24]',
  resolved: 'bg-[#4ADE80]',
  blocked: 'bg-[#EF4444]',
};

export function MainPanel({ project, rfis }: MainPanelProps) {
  const openRFIs = rfis.filter(r => r.status === 'open');
  const blockedRFIs = rfis.filter(r => r.status === 'blocked');
  const resolvedRFIs = rfis.filter(r => r.status === 'resolved');

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0D0D0D]">
      {/* Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex items-center justify-between px-4">
        <div>
          <h1 className="text-[15px] font-semibold">Open RFIs</h1>
          <p className="text-[12px] text-[#8A8F98]">{project.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-[13px] text-[#8A8F98] hover:border-[#3A3A3A] transition-fast">
            <kbd className="text-[10px]">C</kbd>
            Create RFI
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md text-[13px] text-[#8A8F98] hover:border-[#3A3A3A] transition-fast">
            <kbd className="text-[10px]">F</kbd>
            Filter
          </button>
        </div>
      </div>

      {/* RFI List */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Blocked Section */}
        {blockedRFIs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[11px] font-semibold text-[#EF4444] uppercase tracking-wider mb-3 px-1">
              Blocked
            </h2>
            <div className="space-y-2">
              {blockedRFIs.map(rfi => (
                <RFIItem key={rfi.id} rfi={rfi} />
              ))}
            </div>
          </div>
        )}

        {/* Open Section */}
        {openRFIs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[11px] font-semibold text-[#FBBF24] uppercase tracking-wider mb-3 px-1">
              Open
            </h2>
            <div className="space-y-2">
              {openRFIs.map(rfi => (
                <RFIItem key={rfi.id} rfi={rfi} />
              ))}
            </div>
          </div>
        )}

        {/* Resolved Section */}
        {resolvedRFIs.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold text-[#4ADE80] uppercase tracking-wider mb-3 px-1">
              Resolved
            </h2>
            <div className="space-y-2">
              {resolvedRFIs.map(rfi => (
                <RFIItem key={rfi.id} rfi={rfi} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RFIItem({ rfi }: { rfi: RFI }) {
  return (
    <div className="group flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg hover:border-[#3A3A3A] transition-fast cursor-pointer">
      {/* Status Dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColors[rfi.status]}`} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-medium text-white/90 truncate">
            {rfi.title}
          </h3>
          {rfi.priority === 'critical' && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded font-medium uppercase">
              Critical
            </span>
          )}
          {rfi.priority === 'high' && rfi.status !== 'blocked' && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded font-medium uppercase">
              High
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#8A8F98] mt-0.5">
          {rfi.source} • {rfi.createdAt}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-fast">
        <button className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
