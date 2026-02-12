import type { Assembly, AssemblyCategory } from '../types';

// ============================================
// JOCHero Assembly Library
// "Type what you're measuring. We translate it."
// ============================================

export const ASSEMBLY_LIBRARY: Assembly[] = [
  // ============================================
  // DRYWALL / WALL REPAIRS
  // ============================================
  {
    id: 'wall-patch-small',
    name: 'Wall Patch (Small)',
    description: 'Patch small hole in gypsum board, tape, finish, prime, and paint',
    category: 'drywall',
    keywords: ['wall', 'patch', 'drywall', 'gypsum', 'repair', 'hole', 'small'],
    applicableTo: ['count', 'area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 01 20 91-0006',
          description: 'Cut and Patch Hole in Gypsum Board to Match Existing, >16-32 SF',
          unit: 'SF',
          unitCost: 12.50,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 29 10 00-0038',
          description: 'Tape, Spackle, and Finish Gypsum Board, up to 10\' high',
          unit: 'SF',
          unitCost: 3.25,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 91 23 00-0058',
          description: 'Primer, brush work, interior drywall (2 coats)',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
        notes: '2 coats',
      },
      {
        jocItem: {
          taskCode: '09 91 23 99-0060',
          description: 'Paint, brush work, interior drywall walls (2 coats)',
          unit: 'SF',
          unitCost: 2.10,
        },
        quantityFactor: 1.0,
        notes: '2 coats',
      },
    ],
  },
  {
    id: 'wall-demo-full',
    name: 'Wall Demo (Full)',
    description: 'Complete demolition of gypsum board wall to studs',
    category: 'demolition',
    keywords: ['wall', 'demo', 'demolition', 'remove', 'tear out', 'drywall', 'gypsum'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '02 41 19 00-0200',
          description: 'Selective Demolition, Gypsum Board, 1/2" - 5/8"',
          unit: 'SF',
          unitCost: 2.45,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '02 41 19 00-0010',
          description: 'Debris Removal, Load and Haul',
          unit: 'CY',
          unitCost: 85.00,
        },
        quantityFactor: 0.01, // Rough conversion SF to CY
        notes: 'Estimate 1 CY per 100 SF',
      },
    ],
  },
  {
    id: 'new-gypsum-wall',
    name: 'New Gypsum Wall',
    description: 'Install new gypsum board on existing studs, tape, finish, prime, paint',
    category: 'drywall',
    keywords: ['new', 'wall', 'gypsum', 'drywall', 'install', 'sheetrock'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 29 10 00-0010',
          description: 'Gypsum Board, 5/8", Fire-Rated, Walls',
          unit: 'SF',
          unitCost: 4.85,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 29 10 00-0038',
          description: 'Tape, Spackle, and Finish Gypsum Board, up to 10\' high',
          unit: 'SF',
          unitCost: 3.25,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 91 23 00-0058',
          description: 'Primer, brush work, interior drywall (2 coats)',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 91 23 99-0060',
          description: 'Paint, brush work, interior drywall walls (2 coats)',
          unit: 'SF',
          unitCost: 2.10,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // DOORS
  // ============================================
  {
    id: 'door-install-hollow',
    name: 'Door Install (Hollow Metal)',
    description: 'Install hollow metal door and frame, including hardware',
    category: 'doors',
    keywords: ['door', 'install', 'hollow', 'metal', 'hm', 'frame'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '08 11 13 00-0100',
          description: 'Hollow Metal Door Frame, 3\'0" x 7\'0", 16 ga',
          unit: 'EA',
          unitCost: 425.00,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '08 11 13 00-0200',
          description: 'Hollow Metal Door, 3\'0" x 7\'0", 18 ga, Flush',
          unit: 'EA',
          unitCost: 385.00,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '08 71 00 00-0050',
          description: 'Door Hardware Set, Commercial Grade',
          unit: 'SET',
          unitCost: 275.00,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'door-demo',
    name: 'Door Demo',
    description: 'Remove existing door, frame, and hardware',
    category: 'demolition',
    keywords: ['door', 'demo', 'remove', 'demolition', 'tear out'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '02 41 19 00-0400',
          description: 'Selective Demolition, Door and Frame',
          unit: 'EA',
          unitCost: 125.00,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // CEILINGS
  // ============================================
  {
    id: 'act-ceiling-replace',
    name: 'ACT Ceiling Replace',
    description: 'Replace acoustic ceiling tiles in existing grid',
    category: 'ceiling',
    keywords: ['ceiling', 'act', 'acoustic', 'tile', 'replace', 'drop'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 51 00 00-0100',
          description: 'Acoustic Ceiling Tile, 2x4, Standard',
          unit: 'SF',
          unitCost: 4.50,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'act-ceiling-new',
    name: 'ACT Ceiling (New)',
    description: 'New suspended acoustic ceiling with grid',
    category: 'ceiling',
    keywords: ['ceiling', 'act', 'acoustic', 'new', 'install', 'grid', 'suspended', 'drop'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 51 00 00-0010',
          description: 'Suspended Ceiling Grid, 2x4',
          unit: 'SF',
          unitCost: 3.25,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 51 00 00-0100',
          description: 'Acoustic Ceiling Tile, 2x4, Standard',
          unit: 'SF',
          unitCost: 4.50,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // FLOORING
  // ============================================
  {
    id: 'vct-flooring',
    name: 'VCT Flooring',
    description: 'Vinyl composition tile flooring installed',
    category: 'flooring',
    keywords: ['floor', 'vct', 'vinyl', 'tile', 'flooring'],
    applicableTo: ['area', 'space'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 65 19 00-0100',
          description: 'Vinyl Composition Tile (VCT), 12x12, Standard',
          unit: 'SF',
          unitCost: 5.75,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'carpet-tile',
    name: 'Carpet Tile',
    description: 'Modular carpet tile flooring installed',
    category: 'flooring',
    keywords: ['floor', 'carpet', 'tile', 'modular', 'flooring'],
    applicableTo: ['area', 'space'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 68 13 00-0100',
          description: 'Carpet Tile, 24x24, Commercial Grade',
          unit: 'SF',
          unitCost: 8.25,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'floor-demo',
    name: 'Floor Demo',
    description: 'Remove existing floor finish',
    category: 'demolition',
    keywords: ['floor', 'demo', 'remove', 'demolition', 'tear out', 'flooring'],
    applicableTo: ['area', 'space'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '02 41 19 00-0500',
          description: 'Selective Demolition, Floor Finish',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // PAINTING
  // ============================================
  {
    id: 'paint-walls',
    name: 'Paint Walls',
    description: 'Prime and paint interior walls (2 coats each)',
    category: 'painting',
    keywords: ['paint', 'wall', 'interior', 'prime', 'finish'],
    applicableTo: ['area', 'space'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 91 23 00-0058',
          description: 'Primer, brush work, interior drywall (2 coats)',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 91 23 99-0060',
          description: 'Paint, brush work, interior drywall walls (2 coats)',
          unit: 'SF',
          unitCost: 2.10,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'paint-ceiling',
    name: 'Paint Ceiling',
    description: 'Prime and paint ceiling (2 coats each)',
    category: 'painting',
    keywords: ['paint', 'ceiling', 'interior', 'prime'],
    applicableTo: ['area', 'space'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 91 23 00-0062',
          description: 'Primer, roller work, interior ceiling',
          unit: 'SF',
          unitCost: 1.45,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '09 91 23 99-0064',
          description: 'Paint, roller work, interior ceiling (2 coats)',
          unit: 'SF',
          unitCost: 1.75,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // BASE / TRIM
  // ============================================
  {
    id: 'rubber-base',
    name: 'Rubber Base',
    description: 'Install 4" rubber wall base',
    category: 'flooring',
    keywords: ['base', 'rubber', 'cove', 'wall base', 'trim'],
    applicableTo: ['line', 'space'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '09 65 13 00-0100',
          description: 'Rubber Wall Base, 4" Cove',
          unit: 'LF',
          unitCost: 4.25,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // ELECTRICAL (Common items)
  // ============================================
  {
    id: 'outlet-install',
    name: 'Electrical Outlet',
    description: 'Install duplex receptacle outlet',
    category: 'electrical',
    keywords: ['outlet', 'receptacle', 'electrical', 'duplex', 'plug'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '26 27 26 00-0100',
          description: 'Duplex Receptacle, 20A, Commercial Grade',
          unit: 'EA',
          unitCost: 165.00,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'light-fixture-2x4',
    name: 'Light Fixture (2x4 LED)',
    description: 'Install 2x4 LED troffer light fixture',
    category: 'electrical',
    keywords: ['light', 'fixture', 'led', 'troffer', '2x4', 'lighting'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '26 51 13 00-0200',
          description: 'LED Troffer, 2x4, 40W',
          unit: 'EA',
          unitCost: 385.00,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // PLUMBING (Common items)
  // ============================================
  {
    id: 'sink-install',
    name: 'Lavatory Sink',
    description: 'Install wall-hung lavatory with faucet',
    category: 'plumbing',
    keywords: ['sink', 'lavatory', 'lav', 'bathroom', 'faucet'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '22 42 13 00-0100',
          description: 'Wall-Hung Lavatory, Vitreous China',
          unit: 'EA',
          unitCost: 425.00,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '22 42 13 00-0150',
          description: 'Lavatory Faucet, Commercial Grade',
          unit: 'EA',
          unitCost: 185.00,
        },
        quantityFactor: 1.0,
      },
    ],
  },
];

// ============================================
// SEARCH / MATCHING FUNCTIONS
// ============================================

// Find assemblies matching a search query
export function searchAssemblies(query: string, measurementType?: string): Assembly[] {
  if (!query || query.length < 2) return [];
  
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  
  return ASSEMBLY_LIBRARY
    .filter(assembly => {
      // Filter by measurement type if specified
      if (measurementType && !assembly.applicableTo.includes(measurementType as any)) {
        return false;
      }
      
      // Check name match
      if (assembly.name.toLowerCase().includes(q)) return true;
      
      // Check keyword matches
      const keywordMatches = words.filter(word => 
        assembly.keywords.some(kw => kw.includes(word) || word.includes(kw))
      );
      
      // Require at least 1 keyword match for multi-word queries
      return keywordMatches.length >= Math.min(words.length, 1);
    })
    .sort((a, b) => {
      // Exact name match first
      const aExact = a.name.toLowerCase().includes(q) ? 0 : 1;
      const bExact = b.name.toLowerCase().includes(q) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      
      // Then by usage count
      return (b.usageCount || 0) - (a.usageCount || 0);
    })
    .slice(0, 6);
}

// Get assembly by ID
export function getAssemblyById(id: string): Assembly | undefined {
  return ASSEMBLY_LIBRARY.find(a => a.id === id);
}

// Get assemblies by category
export function getAssembliesByCategory(category: AssemblyCategory): Assembly[] {
  return ASSEMBLY_LIBRARY.filter(a => a.category === category);
}

// Calculate total cost for an assembly given a quantity
export function calculateAssemblyCost(assembly: Assembly, quantity: number): number {
  return assembly.items.reduce((sum, item) => 
    sum + (quantity * item.quantityFactor * item.jocItem.unitCost), 0
  );
}
