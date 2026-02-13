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
  // CONCRETE FLATWORK - All standard thicknesses
  // Using actual JOC catalogue items (03311300 series)
  // ============================================
  {
    id: 'concrete-slab-4',
    name: 'Concrete Slab 4"',
    description: '4" concrete slab on grade (3,000 PSI)',
    category: 'general',
    keywords: ['concrete', 'slab', '4 inch', '4"', 'slab on grade', 'sog', 'flatwork', 'four'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03311300-0003',
          description: '4" 3,000 PSI Slab On Grade Concrete Slab Assembly',
          unit: 'SF',
          unitCost: 9.07,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-slab-5',
    name: 'Concrete Slab 5"',
    description: '5" concrete slab on grade (3,000 PSI)',
    category: 'general',
    keywords: ['concrete', 'slab', '5 inch', '5"', 'slab on grade', 'sog', 'five'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03311300-0004',
          description: '5" 3,000 PSI Slab On Grade Concrete Slab Assembly',
          unit: 'SF',
          unitCost: 9.80,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-slab-6',
    name: 'Concrete Slab 6"',
    description: '6" concrete slab on grade (3,000 PSI)',
    category: 'general',
    keywords: ['concrete', 'slab', '6 inch', '6"', 'slab on grade', 'sog', 'six'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03311300-0005',
          description: '6" 3,000 PSI Slab On Grade Concrete Slab Assembly',
          unit: 'SF',
          unitCost: 10.89,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-slab-8',
    name: 'Concrete Slab 8"',
    description: '8" concrete slab on grade (3,000 PSI)',
    category: 'general',
    keywords: ['concrete', 'slab', '8 inch', '8"', 'slab on grade', 'sog', 'eight', 'heavy'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03311300-0007',
          description: '8" 3,000 PSI Slab On Grade Concrete Slab Assembly',
          unit: 'SF',
          unitCost: 12.71,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-slab-10',
    name: 'Concrete Slab 10"',
    description: '10" concrete slab on grade (3,000 PSI)',
    category: 'general',
    keywords: ['concrete', 'slab', '10 inch', '10"', 'slab on grade', 'sog', 'ten', 'heavy duty'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03311300-0008',
          description: '10" 3,000 PSI Slab On Grade Concrete Slab Assembly',
          unit: 'SF',
          unitCost: 14.83,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-slab-12',
    name: 'Concrete Slab 12"',
    description: '12" concrete slab on grade (3,000 PSI)',
    category: 'general',
    keywords: ['concrete', 'slab', '12 inch', '12"', 'slab on grade', 'sog', 'twelve', 'structural'],
    applicableTo: ['area'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '03311300-0009',
          description: '12" 3,000 PSI Slab On Grade Concrete Slab Assembly',
          unit: 'SF',
          unitCost: 16.58,
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
  
  // ============================================
  // DIVISION 21 - FIRE PROTECTION 🔥
  // ============================================
  
  // --- SPRINKLER PIPE ASSEMBLIES (per LF, includes fittings allowance) ---
  {
    id: 'fp-pipe-3',
    name: '3" Sprinkler Main',
    description: '3" CPVC fire sprinkler main with fittings allowance',
    category: 'fire-protection',
    keywords: ['3 inch', '3"', 'sprinkler', 'main', 'pipe', 'cpvc', 'fire', 'fp'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21134100-0009',
          description: '3" Schedule 40 Chlorinated Polyvinyl Chloride (CPVC) Fire Sprinkler Pipe',
          unit: 'LF',
          unitCost: 28.69,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '21134100-0017',
          description: '3" Schedule 80 CPVC 90 Degree Elbow, Fire Sprinkler Piping',
          unit: 'EA',
          unitCost: 117.82,
        },
        quantityFactor: 0.05, // 1 elbow per 20 LF average
        notes: 'Fitting allowance: 1 elbow per 20 LF',
      },
      {
        jocItem: {
          taskCode: '21134100-0033',
          description: '3" Schedule 80 CPVC Tee, Fire Sprinkler Piping',
          unit: 'EA',
          unitCost: 172.62,
        },
        quantityFactor: 0.033, // 1 tee per 30 LF average
        notes: 'Fitting allowance: 1 tee per 30 LF',
      },
    ],
  },
  {
    id: 'fp-pipe-1.5',
    name: '1-1/2" Sprinkler Branch',
    description: '1-1/2" CPVC fire sprinkler branch line with fittings',
    category: 'fire-protection',
    keywords: ['1-1/2', '1.5 inch', 'sprinkler', 'branch', 'pipe', 'cpvc', 'fire', 'fp'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21134100-0006',
          description: '1-1/2" Schedule 40 Chlorinated Polyvinyl Chloride (CPVC) Fire Sprinkler Pipe',
          unit: 'LF',
          unitCost: 12.70,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '21134100-0014',
          description: '1-1/2" Schedule 80 CPVC 90 Degree Elbow, Fire Sprinkler Piping',
          unit: 'EA',
          unitCost: 69.89,
        },
        quantityFactor: 0.1, // 1 elbow per 10 LF average
        notes: 'Fitting allowance',
      },
    ],
  },
  {
    id: 'fp-pipe-1.25',
    name: '1-1/4" Sprinkler Branch',
    description: '1-1/4" CPVC fire sprinkler branch line with fittings',
    category: 'fire-protection',
    keywords: ['1-1/4', '1.25 inch', 'sprinkler', 'branch', 'pipe', 'cpvc', 'fire', 'fp'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21134100-0005',
          description: '1-1/4" Schedule 40 Chlorinated Polyvinyl Chloride (CPVC) Fire Sprinkler Pipe',
          unit: 'LF',
          unitCost: 10.58,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '21134100-0013',
          description: '1-1/4" Schedule 40 CPVC 90 Degree Elbow, Fire Sprinkler Piping',
          unit: 'EA',
          unitCost: 61.71,
        },
        quantityFactor: 0.1,
        notes: 'Fitting allowance',
      },
    ],
  },
  
  // --- SPRINKLER HEAD ASSEMBLIES (per EA, includes escutcheon) ---
  {
    id: 'fp-head-pendent',
    name: 'Pendent Sprinkler Head',
    description: 'Pendent (ceiling) sprinkler head with escutcheon',
    category: 'fire-protection',
    keywords: ['sprinkler head', 'pendent', 'pendant', 'head', 'ceiling', 'drop'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21131300-0074',
          description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Pendent Brass Wet Pipe Sprinkler Head',
          unit: 'EA',
          unitCost: 101.97,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '21131300-0211',
          description: '2-7/8" Diameter x 1-1/8" Depth, Two Piece, 1/2" NPT Escutcheon, Chrome',
          unit: 'EA',
          unitCost: 18.53,
        },
        quantityFactor: 1.0,
        notes: 'Escutcheon plate',
      },
    ],
  },
  {
    id: 'fp-head-upright',
    name: 'Upright Sprinkler Head',
    description: 'Upright sprinkler head with escutcheon',
    category: 'fire-protection',
    keywords: ['sprinkler head', 'upright', 'head', 'standing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21131300-0026',
          description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Upright Brass Wet Pipe Sprinkler Head',
          unit: 'EA',
          unitCost: 101.97,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '21131300-0210',
          description: '2-7/8" Diameter x 1-1/8" Depth, Two Piece, 1/2" NPT Escutcheon, Brass',
          unit: 'EA',
          unitCost: 25.94,
        },
        quantityFactor: 1.0,
        notes: 'Escutcheon plate',
      },
    ],
  },
  {
    id: 'fp-head-sidewall',
    name: 'Sidewall Sprinkler Head',
    description: 'Sidewall sprinkler head with escutcheon',
    category: 'fire-protection',
    keywords: ['sprinkler head', 'sidewall', 'wall mount', 'horizontal'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21131300-0122',
          description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Sidewall Brass Wet Pipe Sprinkler Head',
          unit: 'EA',
          unitCost: 119.55,
        },
        quantityFactor: 1.0,
      },
      {
        jocItem: {
          taskCode: '21131300-0211',
          description: '2-7/8" Diameter x 1-1/8" Depth, Two Piece, 1/2" NPT Escutcheon, Chrome',
          unit: 'EA',
          unitCost: 18.53,
        },
        quantityFactor: 1.0,
        notes: 'Escutcheon plate',
      },
    ],
  },
  
  // --- SPRINKLER HEAD RELOCATION ---
  {
    id: 'fp-relocate-head',
    name: 'Relocate Sprinkler Head',
    description: 'Relocate existing sprinkler head and branch piping',
    category: 'fire-protection',
    keywords: ['relocate', 'move', 'sprinkler', 'head', 'modify', 'existing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21011091-0002',
          description: 'Relocate 1 Existing Sprinkler Head And Branch Piping',
          unit: 'EA',
          unitCost: 751.19,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  
  // --- FIRE DEPARTMENT CONNECTION ---
  {
    id: 'fp-fdc',
    name: 'Fire Department Connection',
    description: 'Siamese FDC connection, polished brass',
    category: 'fire-protection',
    keywords: ['fdc', 'siamese', 'fire department', 'connection', 'standpipe'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21111900-0002',
          description: '4" x 2-1/2" x 2-1/2" Siamese Connection, Polished Brass',
          unit: 'EA',
          unitCost: 1198.63,
        },
        quantityFactor: 1.0,
      },
    ],
  },
  
  // --- FLOW SWITCH ---
  {
    id: 'fp-flow-switch',
    name: 'Flow Switch',
    description: 'Fire riser flow switch (NFPA 13)',
    category: 'fire-protection',
    keywords: ['flow switch', 'flow', 'detector', 'alarm', 'riser'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: {
          taskCode: '21122900-0004',
          description: 'Fire Riser Flow Switch (National Fire Protection Association 13)',
          unit: 'EA',
          unitCost: 1560.46,
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
  
  // Concrete patterns - ALL thicknesses (4", 5", 6", 8", 10", 12")
  { pattern: /\b(4|four)[\s"']*(?:inch|in|")?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-4'], boost: 100 },
  { pattern: /\b(5|five)[\s"']*(?:inch|in|")?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-5'], boost: 100 },
  { pattern: /\b(6|six)[\s"']*(?:inch|in|")?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-6'], boost: 100 },
  { pattern: /\b(8|eight)[\s"']*(?:inch|in|")?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-8'], boost: 100 },
  { pattern: /\b(10|ten)[\s"']*(?:inch|in|")?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-10'], boost: 100 },
  { pattern: /\b(12|twelve)[\s"']*(?:inch|in|")?\s*(concrete|slab)/i, assemblyIds: ['concrete-slab-12'], boost: 100 },
  // Also match "concrete slab X"" or "slab X""
  { pattern: /(?:concrete\s*)?slab[\s,]*(\d+)[\s"']/i, assemblyIds: [], boost: 0 }, // Dynamic - handled specially
  { pattern: /\bslab\s*on\s*grade/i, assemblyIds: ['concrete-slab-4', 'concrete-slab-6', 'concrete-slab-8'], boost: 70 },
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
  
  // ============================================
  // DIVISION 21 - FIRE PROTECTION PATTERNS 🔥
  // ============================================
  
  // Sprinkler pipe by size
  { pattern: /\b(3|three)[\s"']*(?:inch|in|")?\s*(sprinkler|cpvc|fire)\s*(pipe|main)?/i, assemblyIds: ['fp-pipe-3'], boost: 100 },
  { pattern: /\b(1-?1\/2|one\s*and\s*a\s*half)[\s"']*(?:inch|in|")?\s*(sprinkler|cpvc|branch)/i, assemblyIds: ['fp-pipe-1.5'], boost: 100 },
  { pattern: /\b(1-?1\/4|one\s*and\s*a\s*quarter)[\s"']*(?:inch|in|")?\s*(sprinkler|cpvc|branch)/i, assemblyIds: ['fp-pipe-1.25'], boost: 100 },
  { pattern: /\bsprinkler\s*(main|riser)/i, assemblyIds: ['fp-pipe-3'], boost: 80 },
  { pattern: /\bbranch\s*(line|pipe)/i, assemblyIds: ['fp-pipe-1.5', 'fp-pipe-1.25'], boost: 75 },
  
  // Sprinkler heads by type
  { pattern: /\b(pendent|pendant)\s*(sprinkler\s*)?(head)?/i, assemblyIds: ['fp-head-pendent'], boost: 95 },
  { pattern: /\bupright\s*(sprinkler\s*)?(head)?/i, assemblyIds: ['fp-head-upright'], boost: 95 },
  { pattern: /\bsidewall\s*(sprinkler\s*)?(head)?/i, assemblyIds: ['fp-head-sidewall'], boost: 95 },
  { pattern: /\bsprinkler\s*head/i, assemblyIds: ['fp-head-pendent', 'fp-head-upright', 'fp-head-sidewall'], boost: 80 },
  
  // Head relocation
  { pattern: /\b(relocate|move)\s*(sprinkler\s*)?(head)?/i, assemblyIds: ['fp-relocate-head'], boost: 90 },
  { pattern: /\bhead\s*relocation/i, assemblyIds: ['fp-relocate-head'], boost: 90 },
  
  // Fire department connection
  { pattern: /\b(fdc|siamese)/i, assemblyIds: ['fp-fdc'], boost: 95 },
  { pattern: /\bfire\s*department\s*connection/i, assemblyIds: ['fp-fdc'], boost: 90 },
  
  // Flow switch
  { pattern: /\bflow\s*(switch|detector)/i, assemblyIds: ['fp-flow-switch'], boost: 90 },
  
  // ============================================
  // DIVISION 22 - PLUMBING PATTERNS 🚿
  // ============================================
  
  // Lavatory patterns
  { pattern: /\blavatory\s*(installation|install)/i, assemblyIds: ['lav-installation'], boost: 95 },
  { pattern: /\b(lav|sink)\s*(installation|install|complete)/i, assemblyIds: ['lav-installation'], boost: 90 },
  { pattern: /\bbathroom\s*sink\s*(install|complete)/i, assemblyIds: ['lav-installation'], boost: 85 },
  
  // Water closet / toilet rough-in patterns
  { pattern: /\bwater\s*closet\s*(rough|roughin)/i, assemblyIds: ['wc-roughin-complete'], boost: 95 },
  { pattern: /\bwc\s*(rough|roughin)/i, assemblyIds: ['wc-roughin-complete'], boost: 95 },
  { pattern: /\btoilet\s*(rough|roughin)/i, assemblyIds: ['wc-roughin-complete'], boost: 90 },
  
  // Floor drain patterns
  { pattern: /\bfloor\s*drain\s*(installation|install|complete)/i, assemblyIds: ['floor-drain-complete'], boost: 95 },
  { pattern: /\bfd\s*(installation|install)/i, assemblyIds: ['floor-drain-complete'], boost: 90 },
  { pattern: /\binstall\s*floor\s*drain/i, assemblyIds: ['floor-drain-complete'], boost: 90 },
  
  // Roof drain patterns
  { pattern: /\broof\s*drain\s*(installation|install|complete)/i, assemblyIds: ['roof-drain-complete'], boost: 95 },
  { pattern: /\brd\s*(installation|install)/i, assemblyIds: ['roof-drain-complete'], boost: 85 },
  { pattern: /\binstall\s*roof\s*drain/i, assemblyIds: ['roof-drain-complete'], boost: 90 },
  
  // Galvanized pipe patterns
  { pattern: /\bgalvanized\s*(steel\s*)?(pipe|piping)/i, assemblyIds: ['galv-pipe-assembly'], boost: 95 },
  { pattern: /\bgalv\s*(steel\s*)?(pipe|piping)/i, assemblyIds: ['galv-pipe-assembly'], boost: 95 },
  { pattern: /\b(1"|1\s*inch)\s*galv/i, assemblyIds: ['galv-pipe-assembly'], boost: 90 },
  
  // Cast iron soil pipe patterns
  { pattern: /\bcast\s*iron\s*(soil\s*)?(pipe|piping)/i, assemblyIds: ['cast-iron-soil-pipe'], boost: 95 },
  { pattern: /\bci\s*(soil\s*)?(pipe|piping)/i, assemblyIds: ['cast-iron-soil-pipe'], boost: 90 },
  { pattern: /\bno[\s-]?hub\s*(pipe|piping)/i, assemblyIds: ['cast-iron-soil-pipe'], boost: 90 },
  { pattern: /\bsoil\s*pipe\s*assembly/i, assemblyIds: ['cast-iron-soil-pipe'], boost: 85 },
  
  // Water heater patterns
  { pattern: /\bwater\s*heater\s*(installation|install|complete)/i, assemblyIds: ['water-heater-complete'], boost: 95 },
  { pattern: /\bhwh\s*(installation|install)/i, assemblyIds: ['water-heater-complete'], boost: 90 },
  { pattern: /\binstall\s*water\s*heater/i, assemblyIds: ['water-heater-complete'], boost: 90 },
  { pattern: /\bnew\s*water\s*heater/i, assemblyIds: ['water-heater-complete'], boost: 85 },
  { pattern: /\b(40|50)\s*gallon\s*(water\s*)?heater/i, assemblyIds: ['water-heater-complete'], boost: 80 },
];

// ============================================
// SEARCH / MATCHING FUNCTIONS
// ============================================

// Number word to digit mapping
const NUMBER_WORDS: Record<string, string> = {
  'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8',
  'ten': '10', 'twelve': '12',
};

/**
 * Extract thickness/dimension from query
 * "8" concrete slab" → "8"
 * "eight inch block" → "8"
 * "12 inch slab" → "12"
 */
function extractThickness(query: string): string | null {
  // Match patterns like: 8", 8 inch, 8in, eight, etc.
  const patterns = [
    /\b(\d+)[\s"']*(?:inch|in|")?/i,                    // "8", "8 inch", "8""
    /\b(four|five|six|seven|eight|ten|twelve)\b/i,      // number words
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      const value = match[1].toLowerCase();
      return NUMBER_WORDS[value] || value;
    }
  }
  return null;
}

/**
 * Check if query mentions concrete/slab
 */
function isConcreteSlab(query: string): boolean {
  return /\b(concrete|slab|sog)\b/i.test(query);
}

/**
 * Check if query mentions CMU/block/masonry
 */
function isCMUBlock(query: string): boolean {
  return /\b(cmu|block|masonry)\b/i.test(query);
}

/**
 * Smart Assembly Search - The Magic! ✨
 * 
 * Uses pattern matching to understand what you're measuring:
 * - "8" concrete slab" → Concrete Slab 8"
 * - "8 inch block wall" → CMU Wall 8"
 * - "storefront" → Aluminum Storefront + Storefront Door
 */
export function searchAssemblies(query: string, measurementType?: string): Assembly[] {
  if (!query || query.length < 2) return [];
  
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  
  // Score each assembly
  const scored: { assembly: Assembly; score: number }[] = [];
  
  // SMART THICKNESS MATCHING - Extract dimension and match to correct assembly
  const thickness = extractThickness(query);
  if (thickness) {
    // Concrete slab with specific thickness
    if (isConcreteSlab(query)) {
      const slabId = `concrete-slab-${thickness}`;
      const slabAssembly = ASSEMBLY_LIBRARY.find(a => a.id === slabId);
      if (slabAssembly) {
        if (!measurementType || slabAssembly.applicableTo.includes(measurementType as any)) {
          scored.push({ assembly: slabAssembly, score: 200 }); // Exact thickness match = highest score
        }
      }
    }
    
    // CMU/Block wall with specific thickness
    if (isCMUBlock(query)) {
      const cmuId = `cmu-wall-${thickness}`;
      const cmuAssembly = ASSEMBLY_LIBRARY.find(a => a.id === cmuId);
      if (cmuAssembly) {
        if (!measurementType || cmuAssembly.applicableTo.includes(measurementType as any)) {
          scored.push({ assembly: cmuAssembly, score: 200 }); // Exact thickness match = highest score
        }
      }
    }
  }
  
  // Check pattern matches (high priority)
  const patternMatches = new Set<string>();
  for (const { pattern, assemblyIds, boost } of ASSEMBLY_PATTERNS) {
    if (pattern.test(query) && assemblyIds.length > 0) {
      assemblyIds.forEach(id => {
        patternMatches.add(id);
        const assembly = ASSEMBLY_LIBRARY.find(a => a.id === id);
        if (assembly) {
          // Check measurement type compatibility
          if (measurementType && !assembly.applicableTo.includes(measurementType as any)) {
            return;
          }
          // Don't add if we already have an exact thickness match
          if (!scored.some(s => s.assembly.id === id)) {
            scored.push({ assembly, score: boost + 50 });
          }
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
