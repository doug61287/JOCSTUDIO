/**
 * Learning Insights Dashboard
 * Visualizes training data to understand user behavior and improve the model
 */

import React, { useState, useEffect } from 'react';
import { RecommendationsPanel } from '../components/RecommendationsPanel';

const API_URL = 'https://web-production-309c2.up.railway.app';

interface TrainingStats {
  totalSelections: number;
  uniqueSessions: number;
  topPaths: Array<{ path: string; count: number }>;
  topItems: Array<{ taskCode: string; description: string; count: number }>;
  avgTimeToSelect: number;
}

interface Selection {
  sessionId: string;
  measurementType: string;
  measurementValue: number;
  path: string[];
  keywords?: string[];
  selectedTaskCode: string;
  selectedDescription: string;
  selectedUnit: string;
  selectedUnitCost: number;
  timeToSelect?: number;
}

interface KeywordAssociations {
  [keyword: string]: Array<{ taskCode: string; count: number }>;
}

export function InsightsDashboard() {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [recentSelections, setRecentSelections] = useState<Selection[]>([]);
  const [keywords, setKeywords] = useState<KeywordAssociations>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'paths' | 'items' | 'keywords' | 'timeline'>('overview');

  // Fetch all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const [statsRes, selectionsRes, keywordsRes] = await Promise.all([
          fetch(`${API_URL}/training/stats`),
          fetch(`${API_URL}/training/selections?limit=50`),
          fetch(`${API_URL}/training/keywords`),
        ]);

        if (!statsRes.ok || !selectionsRes.ok || !keywordsRes.ok) {
          throw new Error('Failed to fetch training data');
        }

        const [statsData, selectionsData, keywordsData] = await Promise.all([
          statsRes.json(),
          selectionsRes.json(),
          keywordsRes.json(),
        ]);

        if (statsData.success) setStats(statsData.data);
        if (selectionsData.success) setRecentSelections(selectionsData.data);
        if (keywordsData.success) setKeywords(keywordsData.data);
      } catch (e) {
        console.error('Failed to fetch insights:', e);
        setError('Failed to load training data. The API may still be deploying.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Also load local selections as fallback
  const localSelections = JSON.parse(localStorage.getItem('jochero_selections') || '[]');

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading insights...</p>
        </div>
      </div>
    );
  }

  const displayStats = stats || {
    totalSelections: localSelections.length,
    uniqueSessions: new Set(localSelections.map((s: any) => s.sessionId)).size,
    topPaths: [],
    topItems: [],
    avgTimeToSelect: 0,
  };

  const displaySelections = recentSelections.length > 0 ? recentSelections : localSelections;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-xl font-bold">Learning Insights</h1>
              <p className="text-sm text-zinc-500">Training data from the Guided Assistant</p>
            </div>
          </div>
          
          <a 
            href="/"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            ← Back to App
          </a>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 -mb-px">
            {(['overview', 'paths', 'items', 'keywords', 'timeline'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg px-4 py-3 text-amber-400 text-sm">
            ⚠️ {error} Showing local data as fallback.
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon="📝"
                label="Total Selections"
                value={displayStats.totalSelections}
                color="blue"
              />
              <StatCard
                icon="👤"
                label="Unique Sessions"
                value={displayStats.uniqueSessions}
                color="green"
              />
              <StatCard
                icon="⏱️"
                label="Avg Time to Select"
                value={displayStats.avgTimeToSelect > 0 
                  ? `${(displayStats.avgTimeToSelect / 1000).toFixed(1)}s` 
                  : 'N/A'}
                color="amber"
              />
              <StatCard
                icon="🎯"
                label="Conversion Rate"
                value={displayStats.totalSelections > 0 ? '100%' : 'N/A'}
                color="purple"
                subtitle="Users who complete selection"
              />
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Paths */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🛤️</span> Top Navigation Paths
                </h3>
                {displayStats.topPaths.length > 0 ? (
                  <div className="space-y-3">
                    {displayStats.topPaths.slice(0, 5).map((path, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-amber-500 font-mono text-sm w-6">{i + 1}.</span>
                          <span className="text-sm truncate text-zinc-300">{path.path}</span>
                        </div>
                        <span className="text-sm bg-zinc-800 px-2 py-0.5 rounded font-medium">
                          {path.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No path data yet. Start using the Guided Assistant!" />
                )}
              </div>

              {/* Top Items */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>⭐</span> Most Selected Items
                </h3>
                {displayStats.topItems.length > 0 ? (
                  <div className="space-y-3">
                    {displayStats.topItems.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-mono text-amber-500">{item.taskCode}</div>
                          <div className="text-sm truncate text-zinc-300">{item.description}</div>
                        </div>
                        <span className="text-sm bg-zinc-800 px-2 py-0.5 rounded font-medium shrink-0">
                          {item.count}×
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No item selections yet." />
                )}
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30 p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>🧠</span> Learning Progress
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                The more selections you make, the smarter the Translation Machine becomes.
              </p>
              <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(displayStats.totalSelections * 2, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-zinc-500">
                <span>0 selections</span>
                <span>{displayStats.totalSelections} / 50 for initial training</span>
              </div>
            </div>

            {/* AI Recommendations */}
            <RecommendationsPanel />
          </div>
        )}

        {activeTab === 'paths' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold mb-6">All Navigation Paths</h3>
            {displayStats.topPaths.length > 0 ? (
              <div className="space-y-4">
                {displayStats.topPaths.map((path, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-500 w-12 text-center">{path.count}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        {path.path.split(' → ').map((step, j) => (
                          <React.Fragment key={j}>
                            {j > 0 && <span className="text-zinc-600">→</span>}
                            <span className="px-2 py-1 bg-zinc-700 rounded text-sm">{step}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-400">
                        {((path.count / displayStats.totalSelections) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No path data yet." />
            )}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold mb-6">All Selected Items</h3>
            {displayStats.topItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                      <th className="pb-3 pr-4">Rank</th>
                      <th className="pb-3 pr-4">Task Code</th>
                      <th className="pb-3 pr-4">Description</th>
                      <th className="pb-3 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayStats.topItems.map((item, i) => (
                      <tr key={i} className="border-b border-zinc-800/50">
                        <td className="py-3 pr-4 text-amber-500 font-bold">{i + 1}</td>
                        <td className="py-3 pr-4 font-mono text-sm">{item.taskCode}</td>
                        <td className="py-3 pr-4 text-sm">{item.description}</td>
                        <td className="py-3 text-right font-medium">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No item selections yet." />
            )}
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold mb-2">Keyword Associations</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Keywords users typed → Items they selected. This trains the Translation Machine.
            </p>
            {Object.keys(keywords).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(keywords).map(([keyword, items]) => (
                  <div key={keyword} className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="text-amber-500 font-medium mb-2">"{keyword}"</div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-zinc-400 truncate flex-1">{item.taskCode}</span>
                          <span className="text-zinc-500 ml-2">{item.count}×</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No keyword data yet. Try typing to search in the Guided Assistant!" />
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold mb-6">Recent Selections</h3>
            {displaySelections.length > 0 ? (
              <div className="space-y-4">
                {displaySelections.slice(0, 20).map((selection: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 bg-zinc-800/50 rounded-lg">
                    <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center text-xl shrink-0">
                      {selection.measurementType === 'line' ? '📏' : 
                       selection.measurementType === 'area' ? '⬛' :
                       selection.measurementType === 'count' ? '🔢' : '🏠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-amber-500">{selection.selectedTaskCode}</span>
                        {selection.timeToSelect && (
                          <span className="text-xs text-zinc-500">
                            ⏱️ {(selection.timeToSelect / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 truncate">{selection.selectedDescription}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span>{selection.measurementValue?.toFixed(1)} {selection.selectedUnit}</span>
                        <span>•</span>
                        <span>${selection.selectedUnitCost?.toFixed(2)}/{selection.selectedUnit}</span>
                        {selection.path && (
                          <>
                            <span>•</span>
                            <span className="truncate">{selection.path.join(' → ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No selections yet. Start using the Guided Assistant!" />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color, 
  subtitle 
}: { 
  icon: string; 
  label: string; 
  value: string | number; 
  color: 'blue' | 'green' | 'amber' | 'purple';
  subtitle?: string;
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-zinc-500">
      <div className="text-4xl mb-2">📭</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default InsightsDashboard;
