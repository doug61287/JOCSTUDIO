import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { RoomCard } from './components/RoomCard';
import { InsightCard } from './components/InsightCard';
import { DocumentCard } from './components/DocumentCard';
import { RoomDetail } from './components/RoomDetail';
import { Icon } from './components/Icon';
import { mockProject, mockRooms, mockInsights, mockDocuments } from './data';
import type { Room, TabType, ViewMode } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms based on search
  const filteredRooms = useMemo(() => {
    if (!searchQuery) return mockRooms;
    const query = searchQuery.toLowerCase();
    return mockRooms.filter(room => 
      room.number.toLowerCase().includes(query) ||
      room.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Calculate counts
  const roomIssueCount = mockRooms.filter(r => r.issues > 0).length;
  const documentIssueCount = mockDocuments.reduce((acc, doc) => acc + (doc.issues || 0), 0);
  const insightCount = mockInsights.length;

  // If a room is selected, show room detail
  if (selectedRoom) {
    return <RoomDetail room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        roomIssueCount={roomIssueCount}
        documentIssueCount={documentIssueCount}
        insightCount={insightCount}
      />

      {/* Main Content */}
      <main className="flex-1 ml-[260px] flex flex-col">
        {/* Top Bar */}
        <header className="h-[72px] bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-3 w-[400px] px-4 py-2.5 bg-gray-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-200 transition-all">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms, doors, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
              <Icon name="bell" className="w-5 h-5 text-gray-600" />
              {insightCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error-500 rounded-full border-2 border-white" />
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-b from-primary-600 to-primary-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
              <Icon name="plus" className="w-5 h-5" />
              New Project
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Project Header */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-200">
              <div className="w-[72px] h-[72px] bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-primary-500/25">
                {mockProject.thumbnail}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{mockProject.name}</h1>
                <p className="text-base text-gray-500">{mockProject.description}</p>
              </div>
              <div className="text-sm text-gray-400">
                Last updated {mockProject.lastUpdated}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-5 mb-8">
                  <StatCard
                    value={mockProject.rooms}
                    label="Total Rooms"
                    trend="✓ All analyzed"
                    variant="success"
                    icon="🏢"
                  />
                  <StatCard
                    value={mockProject.doors}
                    label="Doors"
                    icon="🚪"
                  />
                  <StatCard
                    value={mockProject.issues}
                    label="Issues Found"
                    trend="↑ 2 critical"
                    variant="critical"
                    icon="⚠️"
                  />
                  <StatCard
                    value={mockProject.documents}
                    label="Documents"
                    icon="📄"
                  />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Critical Issues */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">⚠️ Critical Issues</h2>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                        View all {insightCount}
                      </a>
                    </div>
                    <div className="space-y-3">
                      {mockInsights.slice(0, 3).map(insight => (
                        <InsightCard
                          key={insight.id}
                          insight={insight}
                          onAction={() => alert(insight.action)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">📄 Documents</h2>
                      <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                        View all
                      </a>
                    </div>
                    <div className="space-y-3">
                      {mockDocuments.map(doc => (
                        <DocumentCard key={doc.id} document={doc} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
              <>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Rooms</h2>
                    <p className="text-sm text-gray-500">
                      {filteredRooms.length} rooms • {filteredRooms.filter(r => r.issues > 0).length} with issues
                    </p>
                  </div>
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon name="grid" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === 'list'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon name="list" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>

                {/* Rooms Grid/List */}
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' 
                  : 'flex flex-col gap-3'
                }>
                  {filteredRooms.map(room => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onClick={() => setSelectedRoom(room)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {filteredRooms.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No rooms found matching "{searchQuery}"</p>
                  </div>
                )}
              </>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Documents</h2>
                  <p className="text-sm text-gray-500">{mockDocuments.length} documents analyzed</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {mockDocuments.map(doc => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                  <StatCard
                    value={mockInsights.filter(i => i.severity === 'critical').length}
                    label="Critical"
                    variant="critical"
                  />
                  <StatCard
                    value={mockInsights.filter(i => i.severity === 'warning').length}
                    label="Warnings"
                    variant="warning"
                  />
                  <StatCard
                    value={mockInsights.filter(i => i.severity === 'info').length}
                    label="Informational"
                    variant="default"
                  />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Insights</h2>
                <div className="space-y-4 max-w-3xl">
                  {mockInsights.map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      onAction={() => alert(insight.action)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
