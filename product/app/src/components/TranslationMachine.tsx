/**
 * Translation Machine - The core of JOCHero
 * Plain English → JOC Line Items
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';

const API_URL = 'https://web-production-309c2.up.railway.app';

interface JOCItem {
  taskCode: string;
  description: string;
  unit: string;
  unitCost: number;
  score?: number;
  matchedKeywords?: string[];
}

interface SearchResult {
  items: JOCItem[];
  total: number;
  query: string;
  took: number;
}

interface TranslateResult {
  items: JOCItem[];
  keywords: string[];
  took: number;
}

interface DivisionInfo {
  code: string;
  name: string;
  count: number;
}

type Mode = 'search' | 'translate' | 'browse';

interface TranslationMachineProps {
  onSelectItem?: (item: JOCItem) => void;
  className?: string;
}

export function TranslationMachine({ onSelectItem, className = '' }: TranslationMachineProps) {
  const [mode, setMode] = useState<Mode>('translate');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JOCItem[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [divisions, setDivisions] = useState<DivisionInfo[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; took: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load divisions on mount
  useEffect(() => {
    fetch(`${API_URL}/catalogue/divisions`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDivisions(data.data);
        }
      })
      .catch(err => console.error('Failed to load divisions:', err));
  }, []);

  // Debounced search/translate
  const performSearch = useCallback(
    debounce(async (q: string, currentMode: Mode) => {
      if (!q.trim()) {
        setResults([]);
        setKeywords([]);
        setStats(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let endpoint: string;
        let options: RequestInit = {};

        if (currentMode === 'translate') {
          endpoint = `${API_URL}/catalogue/translate`;
          options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: q, limit: 20 }),
          };
        } else {
          const params = new URLSearchParams({ q, limit: '50' });
          if (selectedDivision) params.set('division', selectedDivision);
          endpoint = `${API_URL}/catalogue/search?${params}`;
        }

        const res = await fetch(endpoint, options);
        const data = await res.json();

        if (data.success) {
          // Sort helper - sequential by task code (e.g., 08121313-0013)
          const sortByTaskCode = (items: JOCItem[]) => {
            return [...items].sort((a, b) => {
              const [prefixA, itemA] = a.taskCode.split('-');
              const [prefixB, itemB] = b.taskCode.split('-');
              
              // Compare prefix first
              if (prefixA !== prefixB) {
                return prefixA.localeCompare(prefixB);
              }
              
              // Same prefix - compare item numbers numerically
              const numA = parseInt(itemA || '0', 10);
              const numB = parseInt(itemB || '0', 10);
              return numA - numB;
            });
          };
          
          if (currentMode === 'translate') {
            const result = data.data as TranslateResult;
            // Keep translate results in score order (relevance)
            setResults(result.items);
            setKeywords(result.keywords);
            setStats({ total: result.items.length, took: result.took });
          } else {
            const result = data.data as SearchResult;
            // Sort search results by task code sequentially
            setResults(sortByTaskCode(result.items));
            setKeywords([]);
            setStats({ total: result.total, took: result.took });
          }
        } else {
          setError(data.error?.message || 'Search failed');
        }
      } catch (err) {
        setError('Failed to connect to API');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [selectedDivision]
  );

  // Trigger search when query or mode changes
  useEffect(() => {
    if (mode !== 'browse') {
      performSearch(query, mode);
    }
  }, [query, mode, performSearch]);

  // Load division items when browsing
  useEffect(() => {
    if (mode === 'browse' && selectedDivision) {
      setLoading(true);
      fetch(`${API_URL}/catalogue/divisions/${selectedDivision}?limit=100`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Sort by task code sequentially
            const sortedItems = [...data.data.items].sort((a: JOCItem, b: JOCItem) => {
              const [prefixA, itemA] = a.taskCode.split('-');
              const [prefixB, itemB] = b.taskCode.split('-');
              if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
              return parseInt(itemA || '0', 10) - parseInt(itemB || '0', 10);
            });
            setResults(sortedItems);
            setStats({ total: data.data.count, took: 0 });
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [mode, selectedDivision]);

  const handleSelect = (item: JOCItem) => {
    onSelectItem?.(item);
  };

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            Translation Machine
          </h2>
          
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
            {(['translate', 'search', 'browse'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  mode === m
                    ? 'bg-amber-500 text-black font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m === 'translate' ? '✨ Translate' : m === 'search' ? '🔍 Search' : '📁 Browse'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Input */}
        {mode !== 'browse' && (
          <div className="mt-3 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'translate'
                  ? 'Describe the work... (e.g., "install 10 sprinkler heads in corridor")'
                  : 'Search by task code or keywords...'
              }
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Division Selector (Browse mode) */}
        {mode === 'browse' && (
          <div className="mt-3 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {divisions.map((div) => (
              <button
                key={div.code}
                onClick={() => setSelectedDivision(div.code)}
                className={`px-2 py-1.5 text-xs rounded-lg text-left transition-colors ${
                  selectedDivision === div.code
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <span className="font-mono font-bold">{div.code}</span>
                <span className="ml-1 truncate">{div.name}</span>
                <span className="block text-zinc-500 text-[10px]">{div.count.toLocaleString()} items</span>
              </button>
            ))}
          </div>
        )}

        {/* Keywords (Translate mode) */}
        {mode === 'translate' && keywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-zinc-500">Keywords:</span>
            {keywords.map((kw, i) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-2 text-xs text-zinc-500">
            {stats.total.toLocaleString()} results {stats.took > 0 && `in ${stats.took}ms`}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {error && (
          <div className="p-4 text-red-400 text-sm">{error}</div>
        )}

        {results.length === 0 && !loading && query && (
          <div className="p-8 text-center text-zinc-500">
            No results found. Try different keywords.
          </div>
        )}

        {results.map((item, i) => (
          <div
            key={item.taskCode}
            onClick={() => handleSelect(item)}
            className={`px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors ${
              i === 0 ? 'bg-amber-500/5' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {item.taskCode}
                  </span>
                  {item.score && (
                    <span className="text-[10px] text-green-400">
                      {Math.round(item.score * 100)}% match
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white truncate">
                  {item.description}
                </p>
                {item.matchedKeywords && item.matchedKeywords.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {item.matchedKeywords.map((kw, j) => (
                      <span key={j} className="text-[10px] text-amber-400">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-medium text-white">
                  ${item.unitCost.toFixed(2)}
                </div>
                <div className="text-xs text-zinc-500">
                  per {item.unit}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/50">
        <p className="text-xs text-zinc-500 text-center">
          NYC H+H Construction Task Catalog • 65,331 line items • 2024
        </p>
      </div>
    </div>
  );
}

export default TranslationMachine;
