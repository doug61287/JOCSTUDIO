import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import {
  extractSchedulesFromPDF,
  findSchedulePages,
  type ExtractedSchedules,
  type DoorScheduleEntry,
  type FinishScheduleEntry,
  type PartitionScheduleEntry,
} from '../utils/scheduleExtractor';

export function SchedulePanel() {
  const { project } = useProjectStore();
  const [schedules, setSchedules] = useState<ExtractedSchedules | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doors' | 'finishes' | 'partitions'>('doors');
  const [schedulePages, setSchedulePages] = useState<{ page: number; type: string }[]>([]);

  // Scan for schedules when PDF changes
  useEffect(() => {
    if (project?.pdfUrl) {
      scanForSchedules();
    }
  }, [project?.pdfUrl]);

  const scanForSchedules = async () => {
    if (!project?.pdfUrl) return;
    
    try {
      const pages = await findSchedulePages(project.pdfUrl);
      setSchedulePages(pages);
    } catch (err) {
      console.error('Error scanning for schedules:', err);
    }
  };

  const extractAll = async () => {
    if (!project?.pdfUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await extractSchedulesFromPDF(project.pdfUrl);
      setSchedules(result);
      
      if (result.doors.length === 0 && result.finishes.length === 0 && result.partitions.length === 0) {
        setError('No schedules detected. Try uploading a drawing with door, finish, or partition schedules.');
      }
    } catch (err) {
      setError('Failed to extract schedules. Make sure the PDF contains readable text.');
      console.error('Extraction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDoorSchedule = (doors: DoorScheduleEntry[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left p-2 text-white/60">Mark</th>
            <th className="text-left p-2 text-white/60">Size</th>
            <th className="text-left p-2 text-white/60">Type</th>
            <th className="text-left p-2 text-white/60">Material</th>
            <th className="text-left p-2 text-white/60">Fire</th>
            <th className="text-left p-2 text-white/60">Hardware</th>
          </tr>
        </thead>
        <tbody>
          {doors.map((door, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-2 font-mono text-blue-400">{door.mark}</td>
              <td className="p-2">{door.width} × {door.height}</td>
              <td className="p-2">{door.type}</td>
              <td className="p-2">{door.material}</td>
              <td className="p-2">
                {door.fireRating && (
                  <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-xs">
                    {door.fireRating}
                  </span>
                )}
              </td>
              <td className="p-2 text-white/60">{door.hardware || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderFinishSchedule = (finishes: FinishScheduleEntry[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left p-2 text-white/60">Room</th>
            <th className="text-left p-2 text-white/60">Name</th>
            <th className="text-left p-2 text-white/60">Floor</th>
            <th className="text-left p-2 text-white/60">Base</th>
            <th className="text-left p-2 text-white/60">Walls</th>
            <th className="text-left p-2 text-white/60">Ceiling</th>
          </tr>
        </thead>
        <tbody>
          {finishes.map((finish, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-2 font-mono text-green-400">{finish.roomNumber}</td>
              <td className="p-2">{finish.roomName}</td>
              <td className="p-2">{finish.floor || '-'}</td>
              <td className="p-2">{finish.base || '-'}</td>
              <td className="p-2">{finish.walls || '-'}</td>
              <td className="p-2">{finish.ceiling || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPartitionSchedule = (partitions: PartitionScheduleEntry[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left p-2 text-white/60">Type</th>
            <th className="text-left p-2 text-white/60">Description</th>
            <th className="text-left p-2 text-white/60">Studs</th>
            <th className="text-left p-2 text-white/60">Layers</th>
            <th className="text-left p-2 text-white/60">Fire</th>
            <th className="text-left p-2 text-white/60">STC</th>
          </tr>
        </thead>
        <tbody>
          {partitions.map((part, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              <td className="p-2 font-mono text-purple-400">{part.type}</td>
              <td className="p-2 max-w-xs truncate">{part.description}</td>
              <td className="p-2">{part.studs || '-'}</td>
              <td className="p-2">{part.layers || '-'}</td>
              <td className="p-2">
                {part.fireRating && (
                  <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-xs">
                    {part.fireRating}
                  </span>
                )}
              </td>
              <td className="p-2">{part.stcRating || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!project?.pdfUrl) {
    return (
      <div className="h-full flex items-center justify-center text-white/40 p-8">
        <div className="text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="font-medium">No PDF loaded</p>
          <p className="text-sm mt-2">Upload a drawing to extract schedules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="font-bold text-lg">Schedules</h2>
          </div>
        </div>
        
        <p className="text-xs text-white/50 mb-3">
          Extract door, finish, and partition schedules from PDF drawings
        </p>

        {/* Schedule pages found */}
        {schedulePages.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {schedulePages.map(({ page, type }) => (
              <span 
                key={page}
                className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400"
              >
                Page {page}: {type}
              </span>
            ))}
          </div>
        )}

        {/* Extract button */}
        <button
          onClick={extractAll}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Extracting...
            </>
          ) : (
            <>
              <span>🔍</span> Extract Schedules
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {schedules && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('doors')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'doors'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🚪 Doors ({schedules.doors.length})
            </button>
            <button
              onClick={() => setActiveTab('finishes')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'finishes'
                  ? 'text-white border-b-2 border-green-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🎨 Finishes ({schedules.finishes.length})
            </button>
            <button
              onClick={() => setActiveTab('partitions')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'partitions'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              🧱 Partitions ({schedules.partitions.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-3">
            {activeTab === 'doors' && (
              schedules.doors.length > 0 ? (
                renderDoorSchedule(schedules.doors)
              ) : (
                <div className="text-center text-white/40 py-12">
                  <p className="text-4xl mb-3">🚪</p>
                  <p>No door schedule found</p>
                </div>
              )
            )}
            
            {activeTab === 'finishes' && (
              schedules.finishes.length > 0 ? (
                renderFinishSchedule(schedules.finishes)
              ) : (
                <div className="text-center text-white/40 py-12">
                  <p className="text-4xl mb-3">🎨</p>
                  <p>No finish schedule found</p>
                </div>
              )
            )}
            
            {activeTab === 'partitions' && (
              schedules.partitions.length > 0 ? (
                renderPartitionSchedule(schedules.partitions)
              ) : (
                <div className="text-center text-white/40 py-12">
                  <p className="text-4xl mb-3">🧱</p>
                  <p>No partition schedule found</p>
                </div>
              )
            )}
          </div>

          {/* Summary footer */}
          <div className="p-3 border-t border-white/10 bg-gray-900/50">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">
                {schedules.doors.length} doors · {schedules.finishes.length} rooms · {schedules.partitions.length} partitions
              </span>
              <button className="text-blue-400 hover:text-blue-300 text-xs">
                Export JSON
              </button>
            </div>
          </div>
        </>
      )}

      {/* Initial state */}
      {!schedules && !loading && !error && (
        <div className="flex-1 flex items-center justify-center text-white/40 p-8">
          <div className="text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-medium">Ready to extract</p>
            <p className="text-sm mt-2">Click "Extract Schedules" to scan the PDF</p>
          </div>
        </div>
      )}
    </div>
  );
}
