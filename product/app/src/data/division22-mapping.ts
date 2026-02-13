/**
 * Division 22 - Plumbing
 * Complete search mapping with synonyms for natural language queries
 * 
 * Total: 6,093 items across 30+ categories
 * Multipliers: 233 items (all in 22111600 steel pipe)
 */

export interface Division22Mapping {
  searchTerms: string[];
  taskCodePrefix: string;
  category: string;
  unit: 'LF' | 'EA' | 'SF';
  workflow: 'measure' | 'count';
  description: string;
  itemCount: number;
  multiplierCount: number;
  hasFittings?: boolean;
}

export const division22Mappings: Division22Mapping[] = [
  // ============================================
  // PIPE - GALVANIZED STEEL (22111600) - THE BIG ONE 💰
  // ============================================
  {
    searchTerms: [
      'galvanized pipe', 'galv pipe', 'steel pipe', 'threaded pipe',
      'galvanized steel', 'schedule 40', 'malleable iron', 
      'water pipe', 'gas pipe', 'black pipe'
    ],
    taskCodePrefix: '22111600',
    category: 'Galvanized Steel Pipe',
    unit: 'LF',
    workflow: 'measure',
    description: 'Schedule 40 threaded galvanized steel pipe with malleable iron fittings (1/2" to 6")',
    itemCount: 1269,
    multiplierCount: 233,
    hasFittings: true
  },

  // ============================================
  // PIPE INSULATION (22071900)
  // ============================================
  {
    searchTerms: [
      'pipe insulation', 'insulation', 'fiberglass insulation',
      'pipe wrap', 'asj', 'all service jacket', 'elastomeric'
    ],
    taskCodePrefix: '22071900',
    category: 'Pipe Insulation',
    unit: 'LF',
    workflow: 'measure',
    description: 'Fiberglass and elastomeric pipe insulation with ASJ jacket',
    itemCount: 1177,
    multiplierCount: 0
  },

  // ============================================
  // CAST IRON SOIL PIPE (22131600)
  // ============================================
  {
    searchTerms: [
      'cast iron', 'soil pipe', 'ci pipe', 'cast iron soil',
      'bell and spigot', 'hub pipe', 'no hub', 'dwv pipe',
      'drain pipe', 'waste pipe', 'vent pipe'
    ],
    taskCodePrefix: '22131600',
    category: 'Cast Iron Soil Pipe',
    unit: 'LF',
    workflow: 'measure',
    description: 'Bell & spigot and no-hub cast iron soil/waste/vent pipe (2" to 15")',
    itemCount: 792,
    multiplierCount: 0,
    hasFittings: true
  },

  // ============================================
  // ACID RESISTANT DWV (22665300)
  // ============================================
  {
    searchTerms: [
      'acid resistant', 'polypropylene', 'lab drain', 'chemical drain',
      'acid waste', 'laboratory', 'pp pipe'
    ],
    taskCodePrefix: '22665300',
    category: 'Acid Resistant DWV',
    unit: 'LF',
    workflow: 'measure',
    description: 'Polypropylene acid-resistant DWV for laboratory/chemical applications',
    itemCount: 676,
    multiplierCount: 0,
    hasFittings: true
  },

  // ============================================
  // FLEXIBLE CONNECTIONS (22111900)
  // ============================================
  {
    searchTerms: [
      'epdm', 'flexible hose', 'rubber hose', 'flex connector',
      'flexible connection', 'vibration isolator'
    ],
    taskCodePrefix: '22111900',
    category: 'EPDM/Flexible Hose',
    unit: 'LF',
    workflow: 'measure',
    description: 'EPDM rubber hose and flexible connections',
    itemCount: 286,
    multiplierCount: 0
  },

  // ============================================
  // ALUMINUM PIPE - MEDICAL GAS (22151300)
  // ============================================
  {
    searchTerms: [
      'aluminum pipe', 'medical gas', 'med gas', 'oxygen pipe',
      'vacuum pipe', 'compressed air', 'rigid aluminum'
    ],
    taskCodePrefix: '22151300',
    category: 'Aluminum Medical Gas Pipe',
    unit: 'LF',
    workflow: 'measure',
    description: 'Blue rigid aluminum pipe for medical gas systems',
    itemCount: 169,
    multiplierCount: 0,
    hasFittings: true
  },

  // ============================================
  // COMMERCIAL WATER HEATERS (22333616)
  // ============================================
  {
    searchTerms: [
      'commercial water heater', 'electric water heater', 'large water heater',
      '480v water heater', 'commercial hot water'
    ],
    taskCodePrefix: '22333616',
    category: 'Commercial Electric Water Heaters',
    unit: 'EA',
    workflow: 'count',
    description: 'Large commercial electric water heaters (15-480 KW, 480V)',
    itemCount: 144,
    multiplierCount: 0
  },

  // ============================================
  // FLOOR DRAINS (22131913)
  // ============================================
  {
    searchTerms: [
      'floor drain', 'drain', 'bronze drain', 'fd',
      'round drain', 'square drain'
    ],
    taskCodePrefix: '22131913',
    category: 'Floor Drains',
    unit: 'EA',
    workflow: 'count',
    description: 'Bronze top floor drains with various outlet sizes',
    itemCount: 116,
    multiplierCount: 0
  },

  // ============================================
  // ZONE VALVES (22631370)
  // ============================================
  {
    searchTerms: [
      'zone valve', 'amico', 'hvac valve', 'balancing valve'
    ],
    taskCodePrefix: '22631370',
    category: 'Zone Valves',
    unit: 'EA',
    workflow: 'count',
    description: 'Single zone valve assemblies with gauge (Amico)',
    itemCount: 91,
    multiplierCount: 0
  },

  // ============================================
  // RESIDENTIAL WATER HEATERS (22333300)
  // ============================================
  {
    searchTerms: [
      'water heater', 'hot water heater', 'electric heater', 'lowboy',
      'residential water heater', 'dhw'
    ],
    taskCodePrefix: '22333300',
    category: 'Residential Electric Water Heaters',
    unit: 'EA',
    workflow: 'count',
    description: 'Residential/small commercial electric water heaters',
    itemCount: 88,
    multiplierCount: 0
  },

  // ============================================
  // KITCHEN FAUCETS (22423900)
  // ============================================
  {
    searchTerms: [
      'kitchen faucet', 'faucet', 'delta', 'single handle faucet',
      'two handle faucet', 'sink faucet'
    ],
    taskCodePrefix: '22423900',
    category: 'Kitchen Faucets',
    unit: 'EA',
    workflow: 'count',
    description: 'Kitchen faucets - Delta and other brands, chrome/SS finish',
    itemCount: 88,
    multiplierCount: 0
  },

  // ============================================
  // WATER CLOSET ROUGH-IN (22131300)
  // ============================================
  {
    searchTerms: [
      'water closet', 'wc', 'toilet', 'rough in', 'rough-in',
      'toilet rough', 'wc rough', 'closet flange'
    ],
    taskCodePrefix: '22131300',
    category: 'Water Closet Rough-In',
    unit: 'EA',
    workflow: 'count',
    description: 'Floor/wall mounted WC single fixture rough-in with CI waste & vent',
    itemCount: 70,
    multiplierCount: 0
  },

  // ============================================
  // FLOOR CLEANOUTS (22057600)
  // ============================================
  {
    searchTerms: [
      'cleanout', 'floor cleanout', 'co', 'clean out',
      'access cover', 'cleanout plug'
    ],
    taskCodePrefix: '22057600',
    category: 'Floor Cleanouts',
    unit: 'EA',
    workflow: 'count',
    description: 'Floor cleanouts with cast bronze screw plug',
    itemCount: 66,
    multiplierCount: 0
  },

  // ============================================
  // SHOWER ENCLOSURES (22422300)
  // ============================================
  {
    searchTerms: [
      'shower', 'shower enclosure', 'shower stall', 'shower unit',
      'baked enamel', 'steel shower'
    ],
    taskCodePrefix: '22422300',
    category: 'Shower Enclosures',
    unit: 'EA',
    workflow: 'count',
    description: 'Baked enamel steel shower enclosures (32" to 40")',
    itemCount: 63,
    multiplierCount: 0
  },

  // ============================================
  // BRONZE GATE VALVES (22052300)
  // ============================================
  {
    searchTerms: [
      'gate valve', 'bronze valve', 'shut off', 'shutoff',
      'isolation valve', 'stop valve'
    ],
    taskCodePrefix: '22052300',
    category: 'Bronze Gate Valves',
    unit: 'EA',
    workflow: 'count',
    description: 'Bronze gate valves, non-rising stem, 200 PSI',
    itemCount: 60,
    multiplierCount: 0
  },

  // ============================================
  // LAVATORIES (22421613)
  // ============================================
  {
    searchTerms: [
      'lavatory', 'lav', 'sink', 'wall hung', 'wall mount sink',
      'bathroom sink', 'pedestal', 'vanity top'
    ],
    taskCodePrefix: '22421613',
    category: 'Lavatories',
    unit: 'EA',
    workflow: 'count',
    description: 'Wall hung and pedestal lavatories - American Standard, Kohler',
    itemCount: 58,
    multiplierCount: 0
  },

  // ============================================
  // ROOF DRAINS (22142613)
  // ============================================
  {
    searchTerms: [
      'roof drain', 'rd', 'cast iron roof drain',
      'dome strainer', 'poly dome'
    ],
    taskCodePrefix: '22142613',
    category: 'Roof Drains',
    unit: 'EA',
    workflow: 'count',
    description: 'Cast iron roof drains with poly dome strainer',
    itemCount: 56,
    multiplierCount: 0
  },

  // ============================================
  // GREASE INTERCEPTORS (22131926)
  // ============================================
  {
    searchTerms: [
      'grease interceptor', 'grease trap', 'grease separator',
      'restaurant drain', 'kitchen grease'
    ],
    taskCodePrefix: '22131926',
    category: 'Grease Interceptors',
    unit: 'EA',
    workflow: 'count',
    description: 'Epoxy coated steel grease interceptors (7-100 GPM)',
    itemCount: 48,
    multiplierCount: 0
  },

  // ============================================
  // FIXTURE ACCESSORIES - R&R (22014081)
  // ============================================
  {
    searchTerms: [
      'supply line', 'shut off valve', 'p trap', 'trap',
      'drain line', 'angle stop', 'compression valve',
      'fixture trim', 'supply tube'
    ],
    taskCodePrefix: '22014081',
    category: 'Fixture Accessories/R&R',
    unit: 'EA',
    workflow: 'count',
    description: 'Removal & replacement of fixture accessories - valves, traps, supply lines',
    itemCount: 44,
    multiplierCount: 0
  },

  // ============================================
  // WATER FILTERS (22321600)
  // ============================================
  {
    searchTerms: [
      'water filter', 'filter cartridge', 'sediment filter',
      'melt blown', 'carbon filter'
    ],
    taskCodePrefix: '22321600',
    category: 'Water Filters',
    unit: 'EA',
    workflow: 'count',
    description: 'Water filter cartridges - melt blown, carbon',
    itemCount: 42,
    multiplierCount: 0
  },

  // ============================================
  // SUMP PUMPS (22132913)
  // ============================================
  {
    searchTerms: [
      'sump pump', 'drainage pump', 'ejector pump',
      'sewage pump', 'submersible pump'
    ],
    taskCodePrefix: '22132913',
    category: 'Sump/Drainage Pumps',
    unit: 'EA',
    workflow: 'count',
    description: 'Vertical sump and drainage pumps',
    itemCount: 37,
    multiplierCount: 0
  },

  // ============================================
  // FLUSH VALVES (22424300)
  // ============================================
  {
    searchTerms: [
      'flush valve', 'sloan', 'flushometer', 'wc flush',
      'urinal flush', 'manual flush'
    ],
    taskCodePrefix: '22424300',
    category: 'Flush Valves',
    unit: 'EA',
    workflow: 'count',
    description: 'Manual water closet flush valves - Sloan',
    itemCount: 34,
    multiplierCount: 0
  },

  // ============================================
  // STORAGE TANKS (22122326)
  // ============================================
  {
    searchTerms: [
      'storage tank', 'poly tank', 'polyethylene tank',
      'water tank', 'expansion tank'
    ],
    taskCodePrefix: '22122326',
    category: 'Storage Tanks',
    unit: 'EA',
    workflow: 'count',
    description: 'Horizontal non-pressurized polyethylene tanks',
    itemCount: 32,
    multiplierCount: 0
  },

  // ============================================
  // KITCHEN SINKS (22421616)
  // ============================================
  {
    searchTerms: [
      'kitchen sink', 'sink', 'stainless sink', 'ss sink',
      'cast iron sink', 'single bowl', 'double bowl'
    ],
    taskCodePrefix: '22421616',
    category: 'Kitchen Sinks',
    unit: 'EA',
    workflow: 'count',
    description: 'Kitchen sinks - stainless steel and cast iron',
    itemCount: 32,
    multiplierCount: 0
  },

  // ============================================
  // BOOSTER PUMPS (22112323)
  // ============================================
  {
    searchTerms: [
      'booster pump', 'circulator pump', 'recirculating pump',
      'domestic pump', 'hot water pump', 'b&g', 'bell gossett'
    ],
    taskCodePrefix: '22112323',
    category: 'Booster/Circulator Pumps',
    unit: 'EA',
    workflow: 'count',
    description: 'Bronze in-line centrifugal domestic water booster pumps',
    itemCount: 31,
    multiplierCount: 0
  },

  // ============================================
  // GAS HOT WATER SYSTEMS (22343623)
  // ============================================
  {
    searchTerms: [
      'gas water heater', 'hot water skid', 'boiler',
      'gas fired', 'mbh', 'domestic hot water'
    ],
    taskCodePrefix: '22343623',
    category: 'Gas Hot Water Skids',
    unit: 'EA',
    workflow: 'count',
    description: 'Gas fired domestic hot water skid packages (400-2000 MBH)',
    itemCount: 30,
    multiplierCount: 0
  },

  // ============================================
  // PIPE REPAIR CLAMPS (22011061)
  // ============================================
  {
    searchTerms: [
      'pipe repair', 'repair clamp', 'pipe clamp',
      'leak repair', 'stainless clamp'
    ],
    taskCodePrefix: '22011061',
    category: 'Pipe Repair Clamps',
    unit: 'EA',
    workflow: 'count',
    description: 'Stainless steel pipe repair clamps',
    itemCount: 29,
    multiplierCount: 0
  },

  // ============================================
  // VERTICAL SUMP PUMPS (22142913)
  // ============================================
  {
    searchTerms: [
      'vertical pump', 'cast iron pump', 'pit pump'
    ],
    taskCodePrefix: '22142913',
    category: 'Vertical Sump Pumps',
    unit: 'EA',
    workflow: 'count',
    description: 'Vertical mounted cast iron sump pumps',
    itemCount: 29,
    multiplierCount: 0
  },

  // ============================================
  // DOMESTIC WATER HEATERS (22333016)
  // ============================================
  {
    searchTerms: [
      'domestic water heater', 'standard water heater',
      '30 gallon', '40 gallon', '50 gallon'
    ],
    taskCodePrefix: '22333016',
    category: 'Domestic Water Heaters',
    unit: 'EA',
    workflow: 'count',
    description: 'Standard domestic electric water heaters (30-50 gallon)',
    itemCount: 26,
    multiplierCount: 0
  },

  // ============================================
  // AIR COMPRESSORS (22151913)
  // ============================================
  {
    searchTerms: [
      'air compressor', 'compressor', 'compressed air',
      'receiver tank'
    ],
    taskCodePrefix: '22151913',
    category: 'Air Compressors',
    unit: 'EA',
    workflow: 'count',
    description: 'Air compressors with receiver tanks',
    itemCount: 23,
    multiplierCount: 0
  }
];

/**
 * Pipe size synonyms - same as Division 21
 */
export const pipeSizeSynonyms: Record<string, string> = {
  '1/2': '1/2"',
  '.5': '1/2"',
  'half inch': '1/2"',
  
  '3/4': '3/4"',
  '.75': '3/4"',
  
  '1 inch': '1"',
  
  '1-1/4': '1-1/4"',
  '1 1/4': '1-1/4"',
  '1.25': '1-1/4"',
  
  '1-1/2': '1-1/2"',
  '1 1/2': '1-1/2"',
  '1.5': '1-1/2"',
  
  '2 inch': '2"',
  
  '2-1/2': '2-1/2"',
  '2 1/2': '2-1/2"',
  '2.5': '2-1/2"',
  
  '3 inch': '3"',
  '4 inch': '4"',
  '6 inch': '6"',
};

/**
 * Fixture type synonyms
 */
export const fixtureTypeSynonyms: Record<string, string[]> = {
  'lavatory': ['lavatory', 'lav', 'bathroom sink', 'vanity'],
  'water closet': ['water closet', 'wc', 'toilet', 'commode'],
  'urinal': ['urinal', 'pissoir'],
  'kitchen sink': ['kitchen sink', 'k sink', 'scullery'],
  'floor drain': ['floor drain', 'fd', 'area drain'],
  'roof drain': ['roof drain', 'rd'],
};

/**
 * Search function to find relevant task codes
 */
export function searchDivision22(query: string): {
  mapping: Division22Mapping | null;
  suggestedFilters: string[];
} {
  const normalizedQuery = query.toLowerCase().trim();
  
  for (const mapping of division22Mappings) {
    for (const term of mapping.searchTerms) {
      if (normalizedQuery.includes(term.toLowerCase())) {
        const suggestedFilters: string[] = [];
        
        // Check for pipe sizes
        for (const [synonym, size] of Object.entries(pipeSizeSynonyms)) {
          if (normalizedQuery.includes(synonym.toLowerCase())) {
            suggestedFilters.push(size);
          }
        }
        
        return { mapping, suggestedFilters };
      }
    }
  }
  
  return { mapping: null, suggestedFilters: [] };
}

/**
 * Get categories by workflow type
 */
export function getByWorkflow(workflow: 'measure' | 'count'): Division22Mapping[] {
  return division22Mappings.filter(m => m.workflow === workflow);
}

/**
 * Get categories with multipliers
 */
export function getCategoriesWithMultipliers(): Division22Mapping[] {
  return division22Mappings.filter(m => m.multiplierCount > 0);
}

/**
 * Get categories with fittings
 */
export function getCategoriesWithFittings(): Division22Mapping[] {
  return division22Mappings.filter(m => m.hasFittings);
}
