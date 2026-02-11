/**
 * Guided Estimation Assistant
 * Conversational line item selection with learning
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { decisionTree, findNode, getNodePath, matchKeywords, TreeNode } from '../data/decisionTree';
import { jocCatalogue, JOCItem, searchJOCItems } from '../data/jocCatalogue';

interface Message {
  id: string;
  type: 'assistant' | 'user' | 'options' | 'result';
  content: string;
  options?: TreeNode[];
  items?: JOCItem[];
  timestamp: Date;
}

interface SelectionLog {
  measurementId: string;
  measurementType: string;
  measurementValue: number;
  path: string[];
  selectedItem: JOCItem;
  timestamp: Date;
}

interface GuidedAssistantProps {
  measurementId: string;
  measurementType: 'line' | 'count' | 'area' | 'space';
  measurementValue: number;
  measurementLabel?: string;
  onSelect: (item: JOCItem) => void;
  onClose: () => void;
}

const API_URL = 'https://web-production-309c2.up.railway.app';

export function GuidedAssistant({
  measurementId,
  measurementType,
  measurementValue,
  measurementLabel,
  onSelect,
  onClose,
}: GuidedAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentNode, setCurrentNode] = useState<TreeNode>(decisionTree);
  const [path, setPath] = useState<TreeNode[]>([decisionTree]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const unitLabel = measurementType === 'line' ? 'LF' : measurementType === 'area' ? 'SF' : 'EA';
    const greeting = measurementLabel 
      ? `I see you have "${measurementLabel}" - ${measurementValue.toFixed(1)} ${unitLabel}. Let's find the right JOC item!`
      : `I see you have a ${measurementType} measurement of ${measurementValue.toFixed(1)} ${unitLabel}. Let's find the right JOC item!`;
    
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: greeting,
        timestamp: new Date(),
      },
      {
        id: '2',
        type: 'options',
        content: decisionTree.question || 'What are you measuring?',
        options: decisionTree.children,
        timestamp: new Date(),
      },
    ]);
  }, [measurementType, measurementValue, measurementLabel]);

  // Handle option selection
  const handleOptionSelect = useCallback((node: TreeNode) => {
    // Add user selection message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: `${node.icon || ''} ${node.label}`.trim(),
      timestamp: new Date(),
    }]);

    const newPath = [...path, node];
    setPath(newPath);
    setCurrentNode(node);

    // If node has children, show next question
    if (node.children && node.children.length > 0) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `options-${Date.now()}`,
          type: 'options',
          content: node.question || 'What type?',
          options: node.children,
          timestamp: new Date(),
        }]);
      }, 300);
    }
    // If node has JOC codes, fetch and show items
    else if (node.jocCodes && node.jocCodes.length > 0) {
      showJOCItems(node.jocCodes, newPath);
    }
    // If it's the "Other" option, prompt for search
    else if (node.id === 'other') {
      setMessages(prev => [...prev, {
        id: `search-${Date.now()}`,
        type: 'assistant',
        content: 'Type what you\'re looking for and I\'ll search the catalogue...',
        timestamp: new Date(),
      }]);
    }
  }, [path]);

  // Show JOC items for selected codes
  const showJOCItems = async (jocCodes: string[], nodePath: TreeNode[]) => {
    setLoading(true);
    
    // First try to find items in local catalogue
    let items: JOCItem[] = jocCatalogue.filter(item => 
      jocCodes.some(code => item.taskCode.startsWith(code.replace(/-\d+$/, '')))
    );

    // If not found locally, search via API
    if (items.length === 0) {
      try {
        // Get keywords from path
        const keywords = nodePath.flatMap(n => n.keywords || []).join(' ');
        const res = await fetch(`${API_URL}/catalogue/search?q=${encodeURIComponent(keywords)}&limit=10`);
        const data = await res.json();
        if (data.success) {
          items = data.data.items;
        }
      } catch (e) {
        console.error('API search failed:', e);
      }
    }

    setLoading(false);

    if (items.length > 0) {
      setMessages(prev => [...prev, {
        id: `result-${Date.now()}`,
        type: 'result',
        content: `Found ${items.length} matching items:`,
        items,
        timestamp: new Date(),
      }]);
    } else {
      setMessages(prev => [...prev, {
        id: `noresult-${Date.now()}`,
        type: 'assistant',
        content: 'No exact matches found. Try describing what you need:',
        timestamp: new Date(),
      }]);
    }
  };

  // Handle free-text search
  const handleSearch = async () => {
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    setInputValue('');

    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date(),
    }]);

    // Check if keywords match any tree node
    const matchedNodes = matchKeywords(query);
    if (matchedNodes.length > 0 && matchedNodes[0].jocCodes) {
      // Found a specific match in tree
      const node = matchedNodes[0];
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `match-${Date.now()}`,
          type: 'assistant',
          content: `Looks like "${node.label}"! Let me find those items...`,
          timestamp: new Date(),
        }]);
        showJOCItems(node.jocCodes!, [...path, node]);
      }, 300);
      return;
    }

    // Otherwise, use translation API
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/catalogue/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: query, limit: 10 }),
      });
      const data = await res.json();
      
      if (data.success && data.data.items.length > 0) {
        setMessages(prev => [...prev, {
          id: `result-${Date.now()}`,
          type: 'result',
          content: `Found ${data.data.items.length} items matching "${query}":`,
          items: data.data.items,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `noresult-${Date.now()}`,
          type: 'assistant',
          content: 'No matches found. Try different keywords or select from the categories above.',
          timestamp: new Date(),
        }]);
      }
    } catch (e) {
      console.error('Translation API failed:', e);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, search failed. Please try selecting from the categories.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle item selection
  const handleItemSelect = async (item: JOCItem) => {
    // Generate or get session ID
    let sessionId = localStorage.getItem('jochero_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('jochero_session_id', sessionId);
    }
    
    // Calculate time to select (from component mount)
    const timeToSelect = Date.now() - (window as any).__assistantStartTime || 0;
    
    // Build training data
    const trainingData = {
      sessionId,
      measurementId,
      measurementType,
      measurementValue,
      measurementLabel: measurementLabel || undefined,
      path: path.map(n => n.id),
      keywords: inputValue ? inputValue.split(/\s+/).filter(w => w.length >= 2) : [],
      selectedTaskCode: item.taskCode,
      selectedDescription: item.description,
      selectedUnit: item.unit,
      selectedUnitCost: item.unitCost,
      alternativesShown: messages
        .filter(m => m.type === 'result' && m.items)
        .flatMap(m => m.items?.map(i => i.taskCode) || [])
        .slice(0, 10),
      timeToSelect,
    };
    
    // Store locally as backup
    const logs = JSON.parse(localStorage.getItem('jochero_selections') || '[]');
    logs.push({ ...trainingData, timestamp: new Date().toISOString() });
    localStorage.setItem('jochero_selections', JSON.stringify(logs.slice(-100))); // Keep last 100
    
    // Send to backend API (fire and forget)
    try {
      fetch(`${API_URL}/training/selections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingData),
      }).catch(e => console.warn('Training API error:', e));
    } catch (e) {
      // Silently fail - training is not critical
    }
    
    console.log('Training selection logged:', trainingData);
    
    // Call the onSelect callback
    onSelect(item);
  };
  
  // Track start time for timing
  useEffect(() => {
    (window as any).__assistantStartTime = Date.now();
  }, []);

  // Go back in the path
  const handleBack = () => {
    if (path.length > 1) {
      const newPath = path.slice(0, -1);
      const parentNode = newPath[newPath.length - 1];
      setPath(newPath);
      setCurrentNode(parentNode);
      
      // Remove last assistant/options message and show parent options
      setMessages(prev => {
        const filtered = prev.slice(0, -2);
        return [...filtered, {
          id: `options-${Date.now()}`,
          type: 'options',
          content: parentNode.question || 'What are you measuring?',
          options: parentNode.children,
          timestamp: new Date(),
        }];
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="text-sm font-semibold text-white">Estimation Assistant</h2>
            <p className="text-xs text-zinc-500">
              {path.map(n => n.label).slice(1).join(' → ') || 'Select a category'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {path.length > 1 && (
            <button
              onClick={handleBack}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
            >
              ← Back
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'assistant' && (
              <div className="max-w-[80%] bg-zinc-800 rounded-lg px-4 py-2 text-white text-sm">
                {msg.content}
              </div>
            )}
            
            {msg.type === 'user' && (
              <div className="max-w-[80%] bg-amber-500 rounded-lg px-4 py-2 text-black text-sm font-medium">
                {msg.content}
              </div>
            )}
            
            {msg.type === 'options' && (
              <div className="w-full space-y-2">
                <p className="text-sm text-zinc-300">{msg.content}</p>
                <div className="grid grid-cols-2 gap-2">
                  {msg.options?.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt)}
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left transition-colors group"
                    >
                      <span className="text-xl">{opt.icon || '📦'}</span>
                      <span className="text-sm text-white group-hover:text-amber-400">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {msg.type === 'result' && msg.items && (
              <div className="w-full space-y-2">
                <p className="text-sm text-zinc-300">{msg.content}</p>
                <div className="space-y-2">
                  {msg.items.map((item, i) => (
                    <button
                      key={item.taskCode}
                      onClick={() => handleItemSelect(item)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all hover:border-amber-500 ${
                        i === 0 
                          ? 'bg-amber-500/10 border-amber-500/50' 
                          : 'bg-zinc-800 border-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-mono text-amber-500">{item.taskCode}</span>
                          <p className="text-sm text-white truncate">{item.description}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-sm font-medium text-white">${item.unitCost.toFixed(2)}</div>
                          <div className="text-xs text-zinc-500">/{item.unit}</div>
                        </div>
                      </div>
                      {i === 0 && (
                        <div className="mt-1 text-xs text-amber-400">⭐ Best match</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-lg px-4 py-2 text-zinc-400 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Or type to search..."
            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-black text-sm font-medium transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuidedAssistant;
