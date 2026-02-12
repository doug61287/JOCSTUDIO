/**
 * Division 21 - Fire Suppression
 * Complete search mapping with synonyms for natural language queries
 * 
 * Structure:
 * - searchTerms: What an estimator might type
 * - taskCodePrefix: The H+H catalogue prefix
 * - category: Logical grouping
 * - unit: Expected measurement unit
 * - workflow: How this fits into takeoff
 */

export interface Division21Mapping {
  searchTerms: string[];
  taskCodePrefix: string;
  category: string;
  unit: 'LF' | 'EA' | 'SF' | 'HR';
  workflow: 'measure' | 'count' | 'lump';
  description: string;
}

export const division21Mappings: Division21Mapping[] = [
  // ============================================
  // SPRINKLER PIPE (21134100) - THE CORE WORKFLOW
  // ============================================
  {
    searchTerms: [
      'sprinkler pipe', 'fp pipe', 'fire pipe', 'cpvc', 'cpvc pipe',
      'fire sprinkler pipe', 'schedule 40 cpvc', 'sprinkler main',
      'branch pipe', 'branch line', 'main pipe', 'riser pipe'
    ],
    taskCodePrefix: '21134100',
    category: 'Sprinkler Pipe',
    unit: 'LF',
    workflow: 'measure',
    description: 'CPVC Fire Sprinkler Pipe - Schedule 40 (3/4" to 3")'
  },

  // ============================================
  // SPRINKLER HEADS (21131300) - COUNT WORKFLOW
  // ============================================
  {
    searchTerms: [
      'sprinkler head', 'head', 'sprinkler', 'upright head', 
      'pendent head', 'pendant head', // Both spellings!
      'sidewall head', 'concealed head',
      'quick response', 'qr head', 'standard response',
      'brass head', 'chrome head', 'white head',
      'k factor', 'k=5.6', 'k=8.0', 'k=4.2'
    ],
    taskCodePrefix: '21131300',
    category: 'Sprinkler Heads',
    unit: 'EA',
    workflow: 'count',
    description: 'Wet Pipe Sprinkler Heads - Upright, Pendent, Sidewall, Concealed'
  },

  // ============================================
  // WET PIPE ASSEMBLIES (21131300) - PER HEAD
  // ============================================
  {
    searchTerms: [
      'wet pipe assembly', 'wet system assembly', 'sprinkler assembly',
      'complete sprinkler', 'light hazard', 'ordinary hazard', 'extra hazard',
      'per head assembly'
    ],
    taskCodePrefix: '21131300',
    category: 'Wet Pipe Assemblies',
    unit: 'EA',
    workflow: 'count',
    description: 'Complete Wet-Pipe Sprinkler System Assembly (per head, includes piping)'
  },

  // ============================================
  // WET PIPE VALVES & TRIM (21131300)
  // ============================================
  {
    searchTerms: [
      'alarm check valve', 'check valve', 'wet pipe valve',
      'valve trim', 'riser trim', 'system riser'
    ],
    taskCodePrefix: '21131300',
    category: 'Valves & Trim',
    unit: 'EA',
    workflow: 'count',
    description: 'Wet Pipe Alarm Check Valves and Trim (2-1/2" to 8")'
  },

  // ============================================
  // DRY PIPE SYSTEMS (21131600)
  // ============================================
  {
    searchTerms: [
      'dry pipe', 'dry system', 'dry sprinkler', 'dry pipe assembly',
      'dry pipe head', 'freezer sprinkler', 'cold storage sprinkler',
      'parking garage sprinkler', 'unheated area'
    ],
    taskCodePrefix: '21131600',
    category: 'Dry Pipe Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Dry-Pipe Sprinkler Systems (unheated/freezing areas)'
  },

  // ============================================
  // PREACTION SYSTEMS (21131900)
  // ============================================
  {
    searchTerms: [
      'preaction', 'pre-action', 'preaction system', 'data center sprinkler',
      'server room sprinkler', 'double interlock'
    ],
    taskCodePrefix: '21131900',
    category: 'Preaction Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Preaction Sprinkler Systems (data centers, sensitive areas)'
  },

  // ============================================
  // DELUGE SYSTEMS (21132600)
  // ============================================
  {
    searchTerms: [
      'deluge', 'deluge valve', 'deluge system', 'open head system',
      'high hazard sprinkler'
    ],
    taskCodePrefix: '21132600',
    category: 'Deluge Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Deluge Valves with Trim and Release Equipment'
  },

  // ============================================
  // STANDPIPE - SIAMESE/FDC (21111900)
  // ============================================
  {
    searchTerms: [
      'siamese', 'fdc', 'fire department connection', 'siamese connection',
      'fire connection', 'standpipe connection'
    ],
    taskCodePrefix: '21111900',
    category: 'Siamese/FDC',
    unit: 'EA',
    workflow: 'count',
    description: 'Fire Department Siamese Connections'
  },

  // ============================================
  // STANDPIPE - FIRE HOSE (21121300)
  // ============================================
  {
    searchTerms: [
      'fire hose', 'hose', 'standpipe hose', 'linen hose', 'cotton hose',
      'polyester hose', 'hose rack'
    ],
    taskCodePrefix: '21121300',
    category: 'Fire Hose',
    unit: 'LF',
    workflow: 'measure',
    description: 'Fire Hose - Linen, Cotton, Polyester (1-1/2" to 3")'
  },

  // ============================================
  // STANDPIPE - FD VALVES (21122300)
  // ============================================
  {
    searchTerms: [
      'fire department valve', 'fd valve', 'hose valve', 'standpipe valve',
      'hose connection', '2-1/2 valve'
    ],
    taskCodePrefix: '21122300',
    category: 'FD Valves',
    unit: 'EA',
    workflow: 'count',
    description: 'Fire Department Valves and Hose Connections'
  },

  // ============================================
  // FLOW DETECTION (21122900)
  // ============================================
  {
    searchTerms: [
      'flow switch', 'flow detector', 'water flow', 'tamper switch',
      'water motor gong', 'gong', 'alarm bell', 'manifold'
    ],
    taskCodePrefix: '21122900',
    category: 'Flow Detection',
    unit: 'EA',
    workflow: 'count',
    description: 'Flow Switches, Water Motor Gongs, Manifolds'
  },

  // ============================================
  // RELOCATION WORK (21011091)
  // ============================================
  {
    searchTerms: [
      'relocate head', 'move head', 'relocate sprinkler', 'move sprinkler',
      'head relocation', 'purge', 'drain system', 'purge system'
    ],
    taskCodePrefix: '21011091',
    category: 'Relocation/Modification',
    unit: 'EA',
    workflow: 'count',
    description: 'Relocate Sprinkler Heads & Branch Piping, Purge Systems'
  },

  // ============================================
  // INSPECTION/RECHARGE (21013091)
  // ============================================
  {
    searchTerms: [
      'inspection', 'inspect', 'recharge', 'refill', 'test',
      'system test', 'hydrostatic test'
    ],
    taskCodePrefix: '21013091',
    category: 'Inspection/Recharge',
    unit: 'EA',
    workflow: 'count',
    description: 'System Inspections and Agent Recharge'
  },

  // ============================================
  // PRESSURE GAUGES (21051900)
  // ============================================
  {
    searchTerms: [
      'pressure gauge', 'gauge', 'psi gauge', 'water gauge'
    ],
    taskCodePrefix: '21051900',
    category: 'Gauges',
    unit: 'EA',
    workflow: 'count',
    description: 'Water Pressure Gauges (0-200 PSI to 0-600 PSI)'
  },

  // ============================================
  // KITCHEN SUPPRESSION (21231600)
  // ============================================
  {
    searchTerms: [
      'kitchen suppression', 'ansul', 'kitchen hood', 'hood suppression',
      'wet chemical', 'restaurant suppression', 'cooking suppression',
      'range hood', 'grease hood'
    ],
    taskCodePrefix: '21231600',
    category: 'Kitchen Suppression',
    unit: 'EA',
    workflow: 'count',
    description: 'Kitchen Fire Suppression Systems (Ansul, Pyro-Chem)'
  },

  // ============================================
  // CLEAN AGENT SYSTEMS (21221600)
  // ============================================
  {
    searchTerms: [
      'clean agent', 'sapphire', 'novec', 'fm200', 'fm-200',
      'server room suppression', 'data center suppression',
      'electrical room suppression', 'computer room'
    ],
    taskCodePrefix: '21221600',
    category: 'Clean Agent Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Clean Agent Fire Suppression (Sapphire, Novec, FM-200)'
  },

  // ============================================
  // CO2 SYSTEMS (21211600)
  // ============================================
  {
    searchTerms: [
      'co2', 'carbon dioxide', 'co2 system', 'co2 cylinder'
    ],
    taskCodePrefix: '21211600',
    category: 'CO2 Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Carbon Dioxide Fire Suppression Systems'
  },

  // ============================================
  // DRY CHEMICAL SYSTEMS (21241600)
  // ============================================
  {
    searchTerms: [
      'dry chemical', 'dry chem', 'abc dry chemical', 'industrial suppression'
    ],
    taskCodePrefix: '21241600',
    category: 'Dry Chemical Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Dry Chemical Fire Suppression Systems'
  },

  // ============================================
  // FIRE PUMPS (21311300, 21311600, 21341300)
  // ============================================
  {
    searchTerms: [
      'fire pump', 'electric fire pump', 'pump'
    ],
    taskCodePrefix: '21311300',
    category: 'Electric Fire Pumps',
    unit: 'EA',
    workflow: 'count',
    description: 'Electric-Drive Fire Pumps (20-200 HP)'
  },
  {
    searchTerms: [
      'diesel fire pump', 'diesel pump', 'emergency pump'
    ],
    taskCodePrefix: '21311600',
    category: 'Diesel Fire Pumps',
    unit: 'EA',
    workflow: 'count',
    description: 'Diesel-Driven Fire Pumps (30-200 HP)'
  },
  {
    searchTerms: [
      'jockey pump', 'pressure maintenance pump', 'jockey'
    ],
    taskCodePrefix: '21341300',
    category: 'Jockey Pumps',
    unit: 'EA',
    workflow: 'count',
    description: 'Jockey/Pressure Maintenance Pumps'
  },

  // ============================================
  // FOAM SYSTEMS (21133900)
  // ============================================
  {
    searchTerms: [
      'foam', 'foam system', 'afff', 'foam suppression',
      'foam proportioner', 'foam valve'
    ],
    taskCodePrefix: '21133900',
    category: 'Foam Systems',
    unit: 'EA',
    workflow: 'count',
    description: 'Foam Fire Suppression Systems'
  }
];

/**
 * Pipe size synonyms - map natural language to exact sizes
 */
export const pipeSizeSynonyms: Record<string, string> = {
  // 3/4"
  '3/4': '3/4"',
  '3/4 inch': '3/4"',
  '.75': '3/4"',
  '0.75': '3/4"',
  
  // 1"
  '1 inch': '1"',
  '1"': '1"',
  
  // 1-1/4"
  '1-1/4': '1-1/4"',
  '1 1/4': '1-1/4"',
  '1.25': '1-1/4"',
  'inch and a quarter': '1-1/4"',
  
  // 1-1/2"
  '1-1/2': '1-1/2"',
  '1 1/2': '1-1/2"',
  '1.5': '1-1/2"',
  'inch and a half': '1-1/2"',
  
  // 2"
  '2 inch': '2"',
  '2"': '2"',
  
  // 2-1/2"
  '2-1/2': '2-1/2"',
  '2 1/2': '2-1/2"',
  '2.5': '2-1/2"',
  
  // 3"
  '3 inch': '3"',
  '3"': '3"',
  
  // 4"
  '4 inch': '4"',
  '4"': '4"',
  
  // 6"
  '6 inch': '6"',
  '6"': '6"',
  
  // 8"
  '8 inch': '8"',
  '8"': '8"',
};

/**
 * Head type synonyms
 */
export const headTypeSynonyms: Record<string, string[]> = {
  'upright': ['upright', 'up', 'standing'],
  'pendent': ['pendent', 'pendant', 'hanging', 'drop', 'ceiling'],
  'sidewall': ['sidewall', 'side wall', 'wall mount', 'horizontal'],
  'concealed': ['concealed', 'hidden', 'flush', 'recessed'],
};

/**
 * Hazard classification synonyms
 */
export const hazardSynonyms: Record<string, string> = {
  'light': 'Light Hazard',
  'light hazard': 'Light Hazard',
  'office': 'Light Hazard',
  
  'ordinary': 'Ordinary Hazard',
  'ordinary hazard': 'Ordinary Hazard',
  'commercial': 'Ordinary Hazard',
  
  'extra': 'Extra Hazard',
  'extra hazard': 'Extra Hazard',
  'high hazard': 'Extra Hazard',
  'industrial': 'Extra Hazard',
};

/**
 * Search function to find relevant task codes
 */
export function searchDivision21(query: string): {
  mapping: Division21Mapping | null;
  suggestedFilters: string[];
} {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Find matching mapping
  for (const mapping of division21Mappings) {
    for (const term of mapping.searchTerms) {
      if (normalizedQuery.includes(term.toLowerCase())) {
        // Extract potential filters from query
        const suggestedFilters: string[] = [];
        
        // Check for pipe sizes
        for (const [synonym, size] of Object.entries(pipeSizeSynonyms)) {
          if (normalizedQuery.includes(synonym.toLowerCase())) {
            suggestedFilters.push(size);
          }
        }
        
        // Check for head types
        for (const [type, synonyms] of Object.entries(headTypeSynonyms)) {
          if (synonyms.some(s => normalizedQuery.includes(s.toLowerCase()))) {
            suggestedFilters.push(type);
          }
        }
        
        // Check for hazard levels
        for (const [synonym, hazard] of Object.entries(hazardSynonyms)) {
          if (normalizedQuery.includes(synonym.toLowerCase())) {
            suggestedFilters.push(hazard);
          }
        }
        
        return { mapping, suggestedFilters };
      }
    }
  }
  
  return { mapping: null, suggestedFilters: [] };
}

/**
 * Get all items for a workflow step
 */
export function getWorkflowItems(workflow: 'pipe' | 'heads' | 'valves' | 'accessories'): Division21Mapping[] {
  switch (workflow) {
    case 'pipe':
      return division21Mappings.filter(m => m.taskCodePrefix === '21134100');
    case 'heads':
      return division21Mappings.filter(m => 
        m.taskCodePrefix === '21131300' && m.category === 'Sprinkler Heads'
      );
    case 'valves':
      return division21Mappings.filter(m => 
        m.category.includes('Valve') || m.taskCodePrefix === '21122900'
      );
    case 'accessories':
      return division21Mappings.filter(m => 
        ['Gauges', 'Flow Detection', 'Siamese/FDC'].includes(m.category)
      );
    default:
      return [];
  }
}
