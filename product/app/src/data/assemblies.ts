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

  // ============================================
  // MASONRY - CMU / BLOCK WALLS
  // ============================================
  {
    id: 'cmu-wall-8',
    name: 'CMU Wall 8"',
    description: '8" concrete block wall with reinforcing and grout',
    category: 'general',
    keywords: ['cmu', 'block', 'masonry', 'concrete block', '8 inch', '8"', 'block wall', 'unit masonry'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '04222313-0006',
          description: '8" x 8" x 16", Cored, Lightweight, Concrete Block',
          unit: 'SF',
          unitCost: 18.38,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '04050519-0012',
          description: 'Mortar for Concrete Block, Type S',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
        notes: 'Mortar included',
      },
      {
        jocItem: {
          taskCode: '04052113-0006',
          description: 'Horizontal Joint Reinforcing, 8" Wall',
          unit: 'LF',
          unitCost: 1.25,
        },
        quantityFactor: 0.75, // ~1 LF per 1.33 SF
        notes: 'Every other course',
      },
    ],
  },
  {
    id: 'cmu-wall-6',
    name: 'CMU Wall 6"',
    description: '6" concrete block wall with reinforcing',
    category: 'general',
    keywords: ['cmu', 'block', 'masonry', 'concrete block', '6 inch', '6"', 'block wall'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '04222313-0005',
          description: '6" x 8" x 16", Cored, Lightweight, Concrete Block',
          unit: 'SF',
          unitCost: 16.99,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '04050519-0012',
          description: 'Mortar for Concrete Block, Type S',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'cmu-wall-4',
    name: 'CMU Wall 4"',
    description: '4" concrete block wall (partition)',
    category: 'general',
    keywords: ['cmu', 'block', 'masonry', 'concrete block', '4 inch', '4"', 'partition', 'block wall'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '04222313-0004',
          description: '4" x 8" x 16", Cored, Lightweight, Concrete Block',
          unit: 'SF',
          unitCost: 15.29,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'cmu-wall-12',
    name: 'CMU Wall 12"',
    description: '12" concrete block wall (structural)',
    category: 'general',
    keywords: ['cmu', 'block', 'masonry', 'concrete block', '12 inch', '12"', 'structural', 'block wall'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '04222313-0008',
          description: '12" x 8" x 16", Cored, Lightweight, Concrete Block',
          unit: 'SF',
          unitCost: 23.82,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '04050519-0012',
          description: 'Mortar for Concrete Block, Type S',
          unit: 'SF',
          unitCost: 1.85,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '04052113-0008',
          description: 'Horizontal Joint Reinforcing, 12" Wall',
          unit: 'LF',
          unitCost: 1.45,
        },
        quantityFactor: 0.75,
      },
    ],
  },
  {
    id: 'cmu-demo',
    name: 'CMU Demo',
    description: 'Demolish concrete block wall',
    category: 'demolition',
    keywords: ['cmu', 'block', 'demo', 'demolition', 'masonry', 'remove', 'tear out'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '02411900-0180',
          description: 'Selective Demolition, Concrete Block Wall',
          unit: 'SF',
          unitCost: 4.85,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // STOREFRONT / GLAZING
  // ============================================
  {
    id: 'storefront-standard',
    name: 'Aluminum Storefront',
    description: 'Standard aluminum storefront system with glazing',
    category: 'general',
    keywords: ['storefront', 'aluminum', 'glazing', 'glass', 'curtain wall', 'window wall'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '08431300-0002',
          description: 'Aluminum Storefront Framing Assembly',
          unit: 'SF',
          unitCost: 64.28,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '08800000-0030',
          description: '1" Insulated Glass Unit, Clear',
          unit: 'SF',
          unitCost: 42.75,
        },
        quantityFactor: 0.85, // Account for frame area
        notes: '~85% glass area',
      },
    ],
  },
  {
    id: 'storefront-door',
    name: 'Storefront Door',
    description: 'Aluminum storefront entrance door',
    category: 'doors',
    keywords: ['storefront', 'door', 'entrance', 'aluminum', 'glass door'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '08110000-0010',
          description: '3\'-0" x 7\'-0" Aluminum Storefront Door, Single',
          unit: 'EA',
          unitCost: 2850.00,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '08710000-0050',
          description: 'Door Hardware Set, Storefront',
          unit: 'SET',
          unitCost: 485.00,
        },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // CONCRETE FLATWORK
  // ============================================
  {
    id: 'concrete-slab-4',
    name: 'Concrete Slab 4"',
    description: '4" concrete slab on grade with reinforcing',
    category: 'general',
    keywords: ['concrete', 'slab', '4 inch', '4"', 'slab on grade', 'sog', 'flatwork'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03300000-0010',
          description: 'Cast-In-Place Concrete, 4" Slab on Grade',
          unit: 'SF',
          unitCost: 12.50,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '03210000-0010',
          description: 'Welded Wire Fabric Reinforcement, 6x6-W1.4xW1.4',
          unit: 'SF',
          unitCost: 2.50,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-slab-6',
    name: 'Concrete Slab 6"',
    description: '6" concrete slab on grade with reinforcing',
    category: 'general',
    keywords: ['concrete', 'slab', '6 inch', '6"', 'slab on grade', 'heavy duty'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03300000-0020',
          description: 'Cast-In-Place Concrete, 6" Slab on Grade',
          unit: 'SF',
          unitCost: 15.75,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '03210000-0010',
          description: 'Welded Wire Fabric Reinforcement, 6x6-W1.4xW1.4',
          unit: 'SF',
          unitCost: 2.50,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'sidewalk',
    name: 'Concrete Sidewalk',
    description: 'Concrete sidewalk with base',
    category: 'general',
    keywords: ['sidewalk', 'walkway', 'concrete walk', 'exterior concrete', 'path'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03300000-0030',
          description: 'Concrete Sidewalk, 4" Thick',
          unit: 'SF',
          unitCost: 11.25,
        },
        quantityFactor: 1.0,
      },
    ],
  },
];

// ============================================
// SMART MATCHING - The Magic! ✨
// ============================================

// Pattern-based assembly suggestions
const ASSEMBLY_PATTERNS: { pattern: RegExp; assemblyIds: string[]; boost: number }[] = [
  // CMU/Block patterns
  { pattern: /\b(8|eight)[\s"']*(?:inch|in)?\s*(cmu|block|masonry)/i, assemblyIds: ['cmu-wall-8'], boost: 100 },
  { pattern: /\b(6|six)[\s"']*(?:inch|in)?\s*(cmu|block|masonry)/i, assemblyIds: ['cmu-wall-6'], boost: 100 },
  { pattern: /\b(4|four)[\s"']*(?:inch|in)?\s*(cmu|block|masonry)/i, assemblyIds: ['cmu-wall-4'], boost: 100 },
  { pattern: /\b(12|twelve)[\s"']*(?:inch|in)?\s*(cmu|block|masonry)/i, assemblyIds: ['cmu-wall-12'], boost: 100 },
  { pattern: /\b(cmu|block)\s*(wall|partition)/i, assemblyIds: ['cmu-wall-8', 'cmu-wall-6'], boost: 80 },
  { pattern: /\bmasonry\s*(wall|partition)/i, assemblyIds: ['cmu-wall-8', 'cmu-wall-6'], boost: 70 },
  { pattern: /\b(cmu|block|masonry)\s*(demo|demolition)/i, assemblyIds: ['cmu-demo'], boost: 90 },
  
  // Storefront patterns
  { pattern: /\bstorefront/i, assemblyIds: ['storefront-standard', 'storefront-door'], boost: 90 },
  { pattern: /\baluminum\s*(storefront|glazing)/i, assemblyIds: ['storefront-standard'], boost: 85 },
  { pattern: /\b(entrance|entry)\s*door/i, assemblyIds: ['storefront-door', 'door-install-hollow'], boost: 70 },
  
  // Concrete patterns
  { pattern: /\b(4|four)[\s"']*(?:inch|in)?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-4'], boost: 90 },
  { pattern: /\b(6|six)[\s"']*(?:inch|in)?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-6'], boost: 90 },
  { pattern: /\bslab\s*on\s*grade/i, assemblyIds: ['concrete-slab-4', 'concrete-slab-6'], boost: 80 },
  { pattern: /\bsidewalk/i, assemblyIds: ['sidewalk'], boost: 95 },
  
  // Drywall patterns
  { pattern: /\b(wall|drywall|gypsum)\s*(patch|repair)/i, assemblyIds: ['wall-patch-small'], boost: 90 },
  { pattern: /\bnew\s*(drywall|gypsum|wall)/i, assemblyIds: ['new-gypsum-wall'], boost: 85 },
  { pattern: /\b(drywall|gypsum|wall)\s*demo/i, assemblyIds: ['wall-demo-full'], boost: 90 },
  
  // Ceiling patterns
  { pattern: /\b(act|acoustic|drop)\s*ceiling/i, assemblyIds: ['act-ceiling-new', 'act-ceiling-replace'], boost: 90 },
  { pattern: /\bceiling\s*(tile|replace)/i, assemblyIds: ['act-ceiling-replace'], boost: 85 },
  
  // Flooring patterns
  { pattern: /\bvct\s*(floor|tile)?/i, assemblyIds: ['vct-flooring'], boost: 95 },
  { pattern: /\bcarpet\s*(tile)?/i, assemblyIds: ['carpet-tile'], boost: 90 },
  { pattern: /\brubber\s*base/i, assemblyIds: ['rubber-base'], boost: 95 },
  
  // Paint patterns
  { pattern: /\bpaint\s*(wall|interior)/i, assemblyIds: ['paint-walls'], boost: 85 },
  { pattern: /\bpaint\s*ceiling/i, assemblyIds: ['paint-ceiling'], boost: 90 },
  
  // MEP patterns
  { pattern: /\b(outlet|receptacle|plug)/i, assemblyIds: ['outlet-install'], boost: 90 },
  { pattern: /\b(light|troffer|led)\s*(fixture)?/i, assemblyIds: ['light-fixture-2x4'], boost: 80 },
  { pattern: /\b(sink|lavatory|lav)/i, assemblyIds: ['sink-install'], boost: 85 },
  
  // Door patterns
  { pattern: /\b(hollow\s*metal|hm)\s*door/i, assemblyIds: ['door-install-hollow'], boost: 90 },
  { pattern: /\bdoor\s*(demo|remove)/i, assemblyIds: ['door-demo'], boost: 90 },
];

// ============================================
// SEARCH / MATCHING FUNCTIONS
// ============================================

/**
 * Smart Assembly Search - The Magic! ✨
 * 
 * Uses pattern matching to understand what you're measuring:
 * - "8 inch block wall" → CMU Wall 8"
 * - "storefront" → Aluminum Storefront + Storefront Door
 * - "wall patch" → Wall Patch assembly
 */
export function searchAssemblies(query: string, measurementType?: string): Assembly[] {
  if (!query || query.length < 2) return [];
  
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  
  // Score each assembly
  const scored: { assembly: Assembly; score: number }[] = [];
  
  // First, check pattern matches (highest priority)
  const patternMatches = new Set<string>();
  for (const { pattern, assemblyIds, boost } of ASSEMBLY_PATTERNS) {
    if (pattern.test(query)) {
      assemblyIds.forEach(id => {
        patternMatches.add(id);
        const assembly = ASSEMBLY_LIBRARY.find(a => a.id === id);
        if (assembly) {
          // Check measurement type compatibility
          if (measurementType && !assembly.applicableTo.includes(measurementType as any)) {
            return;
          }
          scored.push({ assembly, score: boost + 50 }); // Pattern matches get big boost
        }
      });
    }
  }
  
  // Then check regular keyword/name matches
  for (const assembly of ASSEMBLY_LIBRARY) {
    // Skip if already added via pattern match
    if (patternMatches.has(assembly.id)) continue;
    
    // Filter by measurement type if specified
    if (measurementType && !assembly.applicableTo.includes(measurementType as any)) {
      continue;
    }
    
    let score = 0;
    
    // Exact name match = high score
    if (assembly.name.toLowerCase().includes(q)) {
      score += 80;
    }
    
    // Name starts with query
    if (assembly.name.toLowerCase().startsWith(q)) {
      score += 40;
    }
    
    // Check keyword matches
    const keywordMatches = words.filter(word => 
      assembly.keywords.some(kw => kw.includes(word) || word.includes(kw))
    );
    
    // More keyword matches = higher score
    score += keywordMatches.length * 25;
    
    // All words match keywords = bonus
    if (keywordMatches.length === words.length && words.length > 0) {
      score += 30;
    }
    
    // Description match
    if (assembly.description?.toLowerCase().includes(q)) {
      score += 15;
    }
    
    // Usage count bonus
    score += Math.min(10, (assembly.usageCount || 0) / 5);
    
    if (score > 0) {
      scored.push({ assembly, score });
    }
  }
  
  // Sort by score and dedupe
  const seen = new Set<string>();
  return scored
    .sort((a, b) => b.score - a.score)
    .filter(({ assembly }) => {
      if (seen.has(assembly.id)) return false;
      seen.add(assembly.id);
      return true;
    })
    .slice(0, 8)
    .map(s => s.assembly);
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
