/**
 * Recommendations Panel
 * Analyzes training data and generates actionable insights
 */

import React, { useState, useEffect, useMemo } from 'react';

const API_URL = 'https://web-production-309c2.up.railway.app';

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

interface Recommendation {
  id: string;
  type: 'shortcut' | 'keyword' | 'slow_path' | 'popular' | 'missing' | 'improvement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  data?: any;
  icon: string;
}

interface RecommendationsPanelProps {
  className?: string;
}

export function RecommendationsPanel({ className = '' }: RecommendationsPanelProps) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  // Fetch selection data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_URL}/training/selections?limit=100`);
        const data = await res.json();
        if (data.success) {
          setSelections(data.data);
        }
      } catch (e) {
        // Fall back to localStorage
        const local = JSON.parse(localStorage.getItem('jochero_selections') || '[]');
        setSelections(local);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generate recommendations based on data
  const recommendations = useMemo(() => {
    if (selections.length === 0) return [];

    const recs: Recommendation[] = [];

    // 1. Find frequently selected items → Suggest shortcuts
    const itemCounts: Record<string, { count: number; desc: string; paths: string[][] }> = {};
    selections.forEach(s => {
      if (!itemCounts[s.selectedTaskCode]) {
        itemCounts[s.selectedTaskCode] = { count: 0, desc: s.selectedDescription, paths: [] };
      }
      itemCounts[s.selectedTaskCode].count++;
      itemCounts[s.selectedTaskCode].paths.push(s.path);
    });

    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    if (topItems.length > 0 && topItems[0][1].count >= 3) {
      const [code, data] = topItems[0];
      recs.push({
        id: 'shortcut-1',
        type: 'shortcut',
        priority: 'high',
        icon: '⚡',
        title: 'Create Quick Access Shortcut',
        description: `"${data.desc.slice(0, 50)}..." is selected ${data.count} times. Add it to quick access for faster selection.`,
        action: `Add ${code} to favorites`,
        data: { taskCode: code, count: data.count },
      });
    }

    // 2. Find slow paths → Suggest optimization
    const pathTimes: Record<string, { times: number[]; count: number }> = {};
    selections.forEach(s => {
      if (s.timeToSelect && s.path.length > 0) {
        const pathKey = s.path.join(' → ');
        if (!pathTimes[pathKey]) {
          pathTimes[pathKey] = { times: [], count: 0 };
        }
        pathTimes[pathKey].times.push(s.timeToSelect);
        pathTimes[pathKey].count++;
      }
    });

    const slowPaths = Object.entries(pathTimes)
      .map(([path, data]) => ({
        path,
        avgTime: data.times.reduce((a, b) => a + b, 0) / data.times.length,
        count: data.count,
      }))
      .filter(p => p.avgTime > 10000 && p.count >= 2) // > 10 seconds avg
      .sort((a, b) => b.avgTime - a.avgTime);

    if (slowPaths.length > 0) {
      const slowest = slowPaths[0];
      recs.push({
        id: 'slow-path-1',
        type: 'slow_path',
        priority: 'medium',
        icon: '🐢',
        title: 'Slow Navigation Detected',
        description: `Path "${slowest.path}" takes ${(slowest.avgTime / 1000).toFixed(1)}s on average. Consider adding a shortcut or simplifying.`,
        action: 'Review and optimize this path',
        data: slowest,
      });
    }

    // 3. Find keyword patterns → Suggest translation improvements
    const keywordToItems: Record<string, Record<string, number>> = {};
    selections.forEach(s => {
      if (s.keywords && s.keywords.length > 0) {
        s.keywords.forEach(kw => {
          if (!keywordToItems[kw]) keywordToItems[kw] = {};
          keywordToItems[kw][s.selectedTaskCode] = (keywordToItems[kw][s.selectedTaskCode] || 0) + 1;
        });
      }
    });

    const strongKeywords = Object.entries(keywordToItems)
      .map(([keyword, items]) => {
        const sorted = Object.entries(items).sort((a, b) => b[1] - a[1]);
        const topItem = sorted[0];
        const total = sorted.reduce((sum, [, count]) => sum + count, 0);
        return {
          keyword,
          topItem: topItem[0],
          confidence: topItem[1] / total,
          count: total,
        };
      })
      .filter(k => k.confidence >= 0.7 && k.count >= 2)
      .sort((a, b) => b.confidence - a.confidence);

    if (strongKeywords.length > 0) {
      const best = strongKeywords[0];
      recs.push({
        id: 'keyword-1',
        type: 'keyword',
        priority: 'high',
        icon: '🎯',
        title: 'High-Confidence Keyword Match',
        description: `When users type "${best.keyword}", they select ${best.topItem} ${(best.confidence * 100).toFixed(0)}% of the time. Consider auto-suggesting this item.`,
        action: 'Add to translation synonyms',
        data: best,
      });
    }

    // 4. Find measurement type patterns → Suggest defaults
    const typePatterns: Record<string, Record<string, number>> = {};
    selections.forEach(s => {
      if (!typePatterns[s.measurementType]) typePatterns[s.measurementType] = {};
      typePatterns[s.measurementType][s.selectedTaskCode] = 
        (typePatterns[s.measurementType][s.selectedTaskCode] || 0) + 1;
    });

    Object.entries(typePatterns).forEach(([type, items]) => {
      const sorted = Object.entries(items).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0 && sorted[0][1] >= 3) {
        const [code, count] = sorted[0];
        const item = selections.find(s => s.selectedTaskCode === code);
        recs.push({
          id: `type-${type}`,
          type: 'popular',
          priority: 'medium',
          icon: type === 'line' ? '📏' : type === 'area' ? '⬛' : type === 'count' ? '🔢' : '🏠',
          title: `Popular ${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
          description: `For ${type} measurements, "${item?.selectedDescription.slice(0, 40)}..." is selected ${count} times. Consider showing it first.`,
          action: `Set as default for ${type}`,
          data: { type, taskCode: code, count },
        });
      }
    });

    // 5. Check if any deep paths could be shortened
    const deepPaths = selections
      .filter(s => s.path.length >= 4)
      .reduce((acc, s) => {
        const key = s.path.join(' → ');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const frequentDeepPaths = Object.entries(deepPaths)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1]);

    if (frequentDeepPaths.length > 0) {
      const [path, count] = frequentDeepPaths[0];
      recs.push({
        id: 'deep-path-1',
        type: 'improvement',
        priority: 'low',
        icon: '🔧',
        title: 'Consider Flattening Deep Path',
        description: `"${path}" requires ${path.split(' → ').length} clicks and is used ${count} times. Consider adding a shortcut.`,
        action: 'Add to quick categories',
        data: { path, depth: path.split(' → ').length, count },
      });
    }

    // 6. Look for items selected from "Other/Search" → Suggest adding to tree
    const searchSelections = selections.filter(s => 
      s.path.includes('other') || (s.keywords && s.keywords.length > 0)
    );

    if (searchSelections.length >= 3) {
      const searchItems: Record<string, number> = {};
      searchSelections.forEach(s => {
        searchItems[s.selectedTaskCode] = (searchItems[s.selectedTaskCode] || 0) + 1;
      });

      const topSearchItem = Object.entries(searchItems)
        .sort((a, b) => b[1] - a[1])[0];

      if (topSearchItem && topSearchItem[1] >= 2) {
        const item = searchSelections.find(s => s.selectedTaskCode === topSearchItem[0]);
        recs.push({
          id: 'missing-1',
          type: 'missing',
          priority: 'high',
          icon: '➕',
          title: 'Missing Category Detected',
          description: `"${item?.selectedDescription.slice(0, 40)}..." is found via search ${topSearchItem[1]} times. Consider adding it to the decision tree.`,
          action: 'Add to appropriate category',
          data: { taskCode: topSearchItem[0], count: topSearchItem[1] },
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [selections]);

  // Calculate learning health score
  const healthScore = useMemo(() => {
    if (selections.length === 0) return 0;
    
    let score = 0;
    
    // Base score from number of selections
    score += Math.min(selections.length / 50, 1) * 30;
    
    // Score from unique sessions
    const uniqueSessions = new Set(selections.map(s => s.sessionId)).size;
    score += Math.min(uniqueSessions / 10, 1) * 20;
    
    // Score from path diversity
    const uniquePaths = new Set(selections.map(s => s.path.join('→'))).size;
    score += Math.min(uniquePaths / 20, 1) * 20;
    
    // Score from keyword data
    const withKeywords = selections.filter(s => s.keywords && s.keywords.length > 0).length;
    score += Math.min(withKeywords / 20, 1) * 15;
    
    // Score from timing data
    const withTiming = selections.filter(s => s.timeToSelect).length;
    score += Math.min(withTiming / selections.length, 1) * 15;
    
    return Math.round(score);
  }, [selections]);

  if (loading) {
    return (
      <div className={`bg-zinc-900 rounded-xl border border-zinc-800 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧠</span>
          <div className="text-left">
            <h3 className="font-semibold text-white">AI Recommendations</h3>
            <p className="text-sm text-zinc-500">
              {recommendations.length} suggestions based on {selections.length} selections
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Health Score */}
          <div className="text-right">
            <div className="text-sm text-zinc-500">Learning Health</div>
            <div className={`text-lg font-bold ${
              healthScore >= 70 ? 'text-green-400' :
              healthScore >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {healthScore}%
            </div>
          </div>
          
          <span className="text-zinc-400 text-xl">{expanded ? '▼' : '▶'}</span>
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-zinc-800">
          {recommendations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-zinc-400">Not enough data yet for recommendations.</p>
              <p className="text-sm text-zinc-500 mt-2">
                Use the Guided Assistant to select JOC items and build training data.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                      rec.priority === 'high' ? 'bg-red-500/20' :
                      rec.priority === 'medium' ? 'bg-amber-500/20' : 'bg-zinc-700'
                    }`}>
                      {rec.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{rec.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-zinc-700 text-zinc-400'
                        }`}>
                          {rec.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-zinc-400 mb-2">
                        {rec.description}
                      </p>
                      
                      {rec.action && (
                        <button className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1">
                          <span>→</span>
                          <span>{rec.action}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="p-4 bg-zinc-800/30 border-t border-zinc-800">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-white">{selections.length}</div>
                <div className="text-zinc-500">Selections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(selections.map(s => s.sessionId)).size}
                </div>
                <div className="text-zinc-500">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(selections.map(s => s.selectedTaskCode)).size}
                </div>
                <div className="text-zinc-500">Unique Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(selections.map(s => s.path.join('→'))).size}
                </div>
                <div className="text-zinc-500">Paths Used</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationsPanel;
