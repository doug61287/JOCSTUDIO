import { useState, useMemo } from 'react';
import type { JOCItem, Measurement } from '../types';
import { searchJOCItems, jocCatalogue } from '../data/jocCatalogue';
import { HeightSelector } from './HeightSelector';
import { getItemsWithHeightOptions } from '../utils/heightPremiums';
import { 
  Package, 
  Check, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Calculator,
  ArrowUpFromLine,
  AlertTriangle,
} from 'lucide-react';

// ============================================
// UNIT MISMATCH DETECTION
// "Flag it, don't assume!"
// ============================================

interface UnitMismatch {
  itemUnit: string;
  measurementUnit: string;
  needsConversion: boolean;
  suggestedPrompt?: string;
}

// Map measurement units to expected item units
const UNIT_COMPATIBILITY: Record<string, string[]> = {
  'SF': ['SF', 'SY', 'EA'], // Area measurements - SF, SY, and EA (per-each) are compatible
  'LF': ['LF', 'EA'], // Linear measurements
  'EA': ['EA', 'SF', 'LF'], // Count can work with anything
};

function checkUnitMismatch(itemUnit: string, measurementUnit: string): UnitMismatch {
  const compatibleUnits = UNIT_COMPATIBILITY[measurementUnit] || [];
  const isCompatible = compatibleUnits.includes(itemUnit);
  
  if (isCompatible) {
    return { itemUnit, measurementUnit, needsConversion: false };
  }
  
  // Generate helpful prompt based on mismatch type
  let suggestedPrompt = '';
  if (measurementUnit === 'SF' && itemUnit === 'LF') {
    suggestedPrompt = `How many LF of this item per SF? (e.g., rebar spacing: 0.5 LF/SF for 2' O.C.)`;
  } else if (measurementUnit === 'LF' && itemUnit === 'SF') {
    suggestedPrompt = `What's the width in feet? (LF × width = SF)`;
  } else {
    suggestedPrompt = `Enter conversion: ${itemUnit} per ${measurementUnit}`;
  }
  
  return { 
    itemUnit, 
    measurementUnit, 
    needsConversion: true,
    suggestedPrompt,
  };
}

// ============================================
// ASSEMBLY CONFIGURATOR
// "Don't let them miss anything"
// ============================================

interface ConfigurableItem {
  id: string;
  jocItem: JOCItem;
  category: 'primary' | 'typical' | 'optional';
  checked: boolean;
  quantityFactor: number; // Multiplier on measurement value
  needsInput?: 'perimeter' | 'count' | 'custom' | 'conversion'; // Some items need additional input
  inputValue?: number;
  inputUnit?: string;
  note?: string;
  unitMismatch?: UnitMismatch; // Track if item unit doesn't match measurement unit
}

interface AssemblyConfig {
  id: string;
  name: string;
  matchPatterns: string[]; // Patterns to match user input
  measurementTypes: string[]; // What measurement types this applies to
  items: Omit<ConfigurableItem, 'checked' | 'inputValue'>[];
}

// ============================================
// ASSEMBLY CONFIGURATIONS
// These define what items belong together
// ============================================

const ASSEMBLY_CONFIGS: AssemblyConfig[] = [
  {
    id: 'concrete-slab-4',
    name: 'Concrete Slab on Grade, 4"',
    matchPatterns: ['concrete slab', '4" concrete', '4 inch concrete', 'new concrete slab', 'slab on grade'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'concrete-4',
        jocItem: { taskCode: '03300000-0010', description: 'Cast-In-Place Concrete, 4" Slab on Grade', unit: 'SF', unitCost: 12.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'edge-form',
        jocItem: { taskCode: '03110000-0010', description: 'Edge Formwork for Slab on Grade', unit: 'LF', unitCost: 8.50 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Enter perimeter length (typically included)',
      },
      {
        id: 'wwf',
        jocItem: { taskCode: '03210000-0010', description: 'Welded Wire Fabric Reinforcement, 6x6-W1.4xW1.4', unit: 'SF', unitCost: 2.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'vapor-barrier',
        jocItem: { taskCode: '07260000-0010', description: 'Vapor Barrier, 10 mil Polyethylene', unit: 'SF', unitCost: 0.80 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        jocItem: { taskCode: '03350000-0010', description: 'Broom Finish, Concrete Flatwork', unit: 'SF', unitCost: 1.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'curing',
        jocItem: { taskCode: '03390000-0010', description: 'Curing Compound, Concrete', unit: 'SF', unitCost: 0.50 },
        category: 'optional',
        quantityFactor: 1.0,
      },
      {
        id: 'control-joints',
        jocItem: { taskCode: '03150000-0010', description: 'Control Joint Sawcuts', unit: 'LF', unitCost: 4.25 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Typically every 10-12 ft',
      },
      {
        id: 'rebar',
        jocItem: { taskCode: '03210000-0020', description: 'Reinforcing Steel, #4 Bars', unit: 'LF', unitCost: 3.75 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Additional rebar as needed',
      },
    ],
  },
  {
    id: 'concrete-slab-6',
    name: 'Concrete Slab on Grade, 6"',
    matchPatterns: ['6" concrete', '6 inch concrete', '6" slab'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'concrete-6',
        jocItem: { taskCode: '03300000-0020', description: 'Cast-In-Place Concrete, 6" Slab on Grade', unit: 'SF', unitCost: 15.75 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'edge-form',
        jocItem: { taskCode: '03110000-0020', description: 'Edge Formwork for Slab on Grade, 6"', unit: 'LF', unitCost: 10.25 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Enter perimeter length (typically included)',
      },
      {
        id: 'wwf',
        jocItem: { taskCode: '03210000-0010', description: 'Welded Wire Fabric Reinforcement, 6x6-W1.4xW1.4', unit: 'SF', unitCost: 2.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'vapor-barrier',
        jocItem: { taskCode: '07260000-0010', description: 'Vapor Barrier, 10 mil Polyethylene', unit: 'SF', unitCost: 0.80 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        jocItem: { taskCode: '03350000-0010', description: 'Broom Finish, Concrete Flatwork', unit: 'SF', unitCost: 1.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'rebar',
        jocItem: { taskCode: '03210000-0030', description: 'Reinforcing Steel, #5 Bars', unit: 'LF', unitCost: 4.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Additional rebar as needed',
      },
    ],
  },
  {
    id: 'concrete-sidewalk',
    name: 'Concrete Sidewalk',
    matchPatterns: ['sidewalk', 'concrete walk', 'walkway'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'sidewalk',
        jocItem: { taskCode: '03300000-0030', description: 'Concrete Sidewalk, 4" Thick', unit: 'SF', unitCost: 11.25 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'base',
        jocItem: { taskCode: '31230000-0010', description: 'Aggregate Base Course, 4"', unit: 'SF', unitCost: 2.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        jocItem: { taskCode: '03350000-0010', description: 'Broom Finish, Concrete Flatwork', unit: 'SF', unitCost: 1.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'storefront-system',
    name: 'Aluminum Storefront System',
    matchPatterns: ['storefront', 'aluminum storefront', 'storefront system', 'storefront glazing'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'storefront-frame',
        jocItem: { taskCode: '08431300-0002', description: 'Aluminum Storefront Framing Assembly', unit: 'SF', unitCost: 64.28 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'glazing',
        jocItem: { taskCode: '08800000-0030', description: '1" Insulated Glass Unit, Clear', unit: 'SF', unitCost: 42.75 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'door-single',
        jocItem: { taskCode: '08110000-0010', description: '3\'-0" x 7\'-0" Aluminum Storefront Door, Single', unit: 'EA', unitCost: 2850.00 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'count',
        inputUnit: 'EA',
        note: 'Number of doors',
      },
    ],
  },
  {
    id: 'ballistic-storefront',
    name: 'Ballistic Resistant Storefront',
    matchPatterns: ['ballistic', 'ballistic storefront', 'bullet resistant', 'security glazing'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'storefront-frame',
        jocItem: { taskCode: '08431300-0002', description: 'Aluminum Storefront Framing Assembly', unit: 'SF', unitCost: 64.28 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'ballistic-glass',
        jocItem: { taskCode: '08800000-0050', description: 'Ballistic Resistant Glass, Level 3', unit: 'SF', unitCost: 185.00 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'ballistic-door',
        jocItem: { taskCode: '08700000-0010', description: 'Ballistic Resistant Door and Frame Assembly', unit: 'EA', unitCost: 8500.00 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'count',
        inputUnit: 'EA',
        note: 'Number of doors',
      },
    ],
  },
  {
    id: 'wall-patch',
    name: 'Wall Patch & Repair',
    matchPatterns: ['wall patch', 'drywall patch', 'gypsum patch', 'patch wall', 'wall repair'],
    measurementTypes: ['area', 'count'],
    items: [
      {
        id: 'patch',
        jocItem: { taskCode: '09013091-0005', description: 'Cut and Patch Hole in Gypsum Board to Match Existing', unit: 'SF', unitCost: 15.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'tape-finish',
        jocItem: { taskCode: '09291000-0038', description: 'Tape, Spackle, and Finish Gypsum Board', unit: 'SF', unitCost: 3.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'primer',
        jocItem: { taskCode: '09911300-0047', description: 'Primer, Brush Work, Interior Drywall', unit: 'SF', unitCost: 1.19 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'paint',
        jocItem: { taskCode: '09911300-0049', description: 'Paint, 2 Coats, Brush Work, Interior Drywall', unit: 'SF', unitCost: 2.34 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'act-ceiling',
    name: 'Acoustic Ceiling Tile',
    matchPatterns: ['act', 'acoustic ceiling', 'ceiling tile', 'drop ceiling', 'suspended ceiling'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'grid',
        jocItem: { taskCode: '09511000-0010', description: 'Suspended Ceiling Grid System, 2x4', unit: 'SF', unitCost: 4.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'tile',
        jocItem: { taskCode: '09511000-0020', description: 'Acoustic Ceiling Tile, 2x4, Standard', unit: 'SF', unitCost: 3.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'flood-barrier',
    name: 'Deployable Flood Barrier',
    matchPatterns: ['flood barrier', 'flood protection', 'flood panel', 'flood defense'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'barrier',
        jocItem: { taskCode: '10400000-0030', description: 'Deployable Flood Barrier System, 2\' High', unit: 'LF', unitCost: 285.00 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'anchors',
        jocItem: { taskCode: '10400000-0040', description: 'Flood Barrier Anchor Points, Wall Mounted', unit: 'EA', unitCost: 125.00 },
        category: 'typical',
        quantityFactor: 0.25, // Roughly 1 anchor per 4 LF
        note: 'Approx 1 per 4 LF',
      },
    ],
  },
  // ============================================
  // PARTITION WALLS
  // ============================================
  {
    id: 'partition-wall',
    name: 'Metal Stud Partition Wall',
    matchPatterns: ['partition wall', 'partition', 'stud wall', 'drywall wall', 'new wall', 'metal stud'],
    measurementTypes: ['area', 'line'],
    items: [
      {
        id: 'studs',
        jocItem: { taskCode: '09211600-0010', description: 'Metal Stud Framing, 3-5/8" @ 16" O.C., Non-Load Bearing', unit: 'SF', unitCost: 4.25 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'gyp-side1',
        jocItem: { taskCode: '09290513-0020', description: 'Gypsum Board, 5/8" Type X, One Side', unit: 'SF', unitCost: 3.85 },
        category: 'typical',
        quantityFactor: 1.0,
        note: 'Side 1',
      },
      {
        id: 'gyp-side2',
        jocItem: { taskCode: '09290513-0020', description: 'Gypsum Board, 5/8" Type X, One Side', unit: 'SF', unitCost: 3.85 },
        category: 'typical',
        quantityFactor: 1.0,
        note: 'Side 2',
      },
      {
        id: 'tape-finish',
        jocItem: { taskCode: '09291000-0038', description: 'Tape, Spackle, and Finish Gypsum Board, Level 4', unit: 'SF', unitCost: 2.75 },
        category: 'typical',
        quantityFactor: 2.0, // Both sides
        note: 'Both sides',
      },
      {
        id: 'insulation',
        jocItem: { taskCode: '07210000-0010', description: 'Batt Insulation, 3-1/2" Fiberglass, R-13', unit: 'SF', unitCost: 1.45 },
        category: 'optional',
        quantityFactor: 1.0,
      },
      {
        id: 'primer',
        jocItem: { taskCode: '09911300-0047', description: 'Primer, Brush Work, Interior Drywall', unit: 'SF', unitCost: 1.19 },
        category: 'optional',
        quantityFactor: 2.0, // Both sides
        note: 'Both sides',
      },
      {
        id: 'paint',
        jocItem: { taskCode: '09911300-0049', description: 'Paint, 2 Coats, Brush Work, Interior Drywall', unit: 'SF', unitCost: 2.34 },
        category: 'optional',
        quantityFactor: 2.0, // Both sides
        note: 'Both sides',
      },
    ],
  },
  // ============================================
  // VCT FLOORING
  // ============================================
  {
    id: 'vct-flooring',
    name: 'VCT Flooring',
    matchPatterns: ['vct', 'vinyl tile', 'vinyl composition tile', 'floor tile', 'vct flooring'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'vct-tile',
        jocItem: { taskCode: '09651000-0010', description: 'VCT Flooring, 12" x 12", Standard Colors', unit: 'SF', unitCost: 4.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'adhesive',
        jocItem: { taskCode: '09651000-0020', description: 'Floor Adhesive for VCT', unit: 'SF', unitCost: 0.65 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'floor-prep',
        jocItem: { taskCode: '09051000-0010', description: 'Floor Prep, Skim Coat Leveler', unit: 'SF', unitCost: 1.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'vinyl-base',
        jocItem: { taskCode: '09651500-0010', description: 'Vinyl Cove Base, 4"', unit: 'LF', unitCost: 3.25 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Enter room perimeter',
      },
      {
        id: 'wax',
        jocItem: { taskCode: '09651000-0030', description: 'Initial Wax and Buff, VCT', unit: 'SF', unitCost: 0.85 },
        category: 'optional',
        quantityFactor: 1.0,
      },
    ],
  },
  // ============================================
  // DEMOLITION PACKAGES
  // ============================================
  {
    id: 'demo-wall',
    name: 'Wall Demolition',
    matchPatterns: ['demo wall', 'wall demo', 'remove wall', 'demolish wall', 'tear out wall'],
    measurementTypes: ['area', 'line'],
    items: [
      {
        id: 'demo-gyp',
        jocItem: { taskCode: '02411900-0010', description: 'Selective Demolition, Gypsum Board Wall Assembly', unit: 'SF', unitCost: 3.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'haul',
        jocItem: { taskCode: '02411900-0050', description: 'Debris Removal and Disposal, Light Construction', unit: 'SF', unitCost: 1.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'patch-ceiling',
        jocItem: { taskCode: '09013091-0005', description: 'Cut and Patch Ceiling at Wall Demo', unit: 'LF', unitCost: 18.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Length of wall at ceiling',
      },
      {
        id: 'patch-floor',
        jocItem: { taskCode: '09013091-0010', description: 'Cut and Patch Floor at Wall Demo', unit: 'LF', unitCost: 22.75 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Length of wall at floor',
      },
    ],
  },
  {
    id: 'demo-flooring',
    name: 'Flooring Demolition',
    matchPatterns: ['demo floor', 'floor demo', 'remove flooring', 'tear out floor', 'flooring removal'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'demo-vct',
        jocItem: { taskCode: '02411900-0020', description: 'Selective Demolition, Resilient Flooring', unit: 'SF', unitCost: 2.15 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'haul',
        jocItem: { taskCode: '02411900-0050', description: 'Debris Removal and Disposal, Light Construction', unit: 'SF', unitCost: 1.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'adhesive-removal',
        jocItem: { taskCode: '02411900-0025', description: 'Adhesive/Mastic Removal from Concrete', unit: 'SF', unitCost: 2.85 },
        category: 'optional',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'demo-ceiling',
    name: 'Ceiling Demolition',
    matchPatterns: ['demo ceiling', 'ceiling demo', 'remove ceiling', 'tear out ceiling', 'act removal'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'demo-act',
        jocItem: { taskCode: '02411900-0030', description: 'Selective Demolition, Acoustic Ceiling System', unit: 'SF', unitCost: 2.45 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'haul',
        jocItem: { taskCode: '02411900-0050', description: 'Debris Removal and Disposal, Light Construction', unit: 'SF', unitCost: 1.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'above-ceiling',
        jocItem: { taskCode: '02411900-0035', description: 'Above Ceiling Work, Clear Abandoned Items', unit: 'SF', unitCost: 1.75 },
        category: 'optional',
        quantityFactor: 1.0,
      },
    ],
  },
  // ============================================
  // CMU / BLOCK WALL
  // ============================================
  {
    id: 'cmu-wall-8',
    name: 'CMU Block Wall, 8"',
    matchPatterns: ['cmu', 'cmu wall', 'block wall', 'concrete block', 'masonry wall', '8 block', '8" block'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'cmu-block',
        jocItem: { taskCode: '04222313-0006', description: '8" x 8" x 16", Cored, Lightweight, Concrete Block', unit: 'SF', unitCost: 14.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'mortar',
        jocItem: { taskCode: '04050000-0010', description: 'Mortar, Type S, for CMU', unit: 'SF', unitCost: 2.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'rebar-vert',
        jocItem: { taskCode: '03210000-0020', description: 'Vertical Reinforcing, #5 @ 48" O.C.', unit: 'SF', unitCost: 1.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'grout',
        jocItem: { taskCode: '04050000-0020', description: 'Grout, CMU Cores, Full Height', unit: 'SF', unitCost: 3.45 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'bond-beam',
        jocItem: { taskCode: '04222313-0010', description: 'Bond Beam, 8" CMU with Horizontal Rebar', unit: 'LF', unitCost: 18.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'At top of wall and every 4\' height',
      },
      {
        id: 'wall-ties',
        jocItem: { taskCode: '04050000-0030', description: 'Wall Ties, CMU to Structure', unit: 'EA', unitCost: 8.75 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'count',
        inputUnit: 'EA',
        note: '@ 32" O.C. vertically',
      },
    ],
  },
  {
    id: 'cmu-wall-12',
    name: 'CMU Block Wall, 12"',
    matchPatterns: ['12 block', '12" block', '12 cmu', '12" cmu'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'cmu-block',
        jocItem: { taskCode: '04222313-0008', description: '12" x 8" x 16", Cored, Heavyweight, Concrete Block', unit: 'SF', unitCost: 19.25 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'mortar',
        jocItem: { taskCode: '04050000-0010', description: 'Mortar, Type S, for CMU', unit: 'SF', unitCost: 2.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'rebar-vert',
        jocItem: { taskCode: '03210000-0030', description: 'Vertical Reinforcing, #6 @ 32" O.C.', unit: 'SF', unitCost: 2.65 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'grout',
        jocItem: { taskCode: '04050000-0025', description: 'Grout, CMU Cores, Full Height, 12" Wall', unit: 'SF', unitCost: 4.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
];

// ============================================
// MATCHING FUNCTIONS
// ============================================

export function findMatchingAssembly(input: string, measurementType: string): AssemblyConfig | null {
  const normalized = input.toLowerCase().trim();
  
  for (const config of ASSEMBLY_CONFIGS) {
    // Check if measurement type is applicable
    if (!config.measurementTypes.includes(measurementType)) continue;
    
    // Check patterns
    for (const pattern of config.matchPatterns) {
      if (normalized.includes(pattern) || pattern.includes(normalized)) {
        return config;
      }
    }
  }
  
  return null;
}

// ============================================
// CONFIGURATOR COMPONENT
// ============================================

interface AssemblyConfiguratorProps {
  measurement: Measurement;
  matchedAssembly: AssemblyConfig;
  onApply: (items: JOCItem[]) => void;
  onCancel: () => void;
}

export function AssemblyConfigurator({ 
  measurement, 
  matchedAssembly, 
  onApply, 
  onCancel 
}: AssemblyConfiguratorProps) {
  // Initialize items with default checked states
  const [items, setItems] = useState<ConfigurableItem[]>(() => 
    matchedAssembly.items.map(item => ({
      ...item,
      checked: item.category === 'primary' || item.category === 'typical',
      inputValue: item.needsInput ? 0 : undefined,
    }))
  );
  
  const [showOptional, setShowOptional] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JOCItem[]>([]);
  const [showHeightSelector, setShowHeightSelector] = useState(false);
  const [pendingItems, setPendingItems] = useState<JOCItem[]>([]);

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    const checkedItems: JOCItem[] = [];
    let hasUnresolvedMismatch = false;
    
    items.forEach(item => {
      if (!item.checked) return;
      
      let qty = measurement.value * item.quantityFactor;
      
      // Handle conversion factor items (unit mismatch)
      if (item.needsInput === 'conversion') {
        if (item.inputValue && item.inputValue > 0) {
          qty = measurement.value * item.inputValue;
        } else {
          // Unresolved mismatch - don't include in total yet
          hasUnresolvedMismatch = true;
          checkedItems.push(item.jocItem); // Still track the item
          return; // Skip adding to subtotal
        }
      } else if (item.needsInput && item.inputValue) {
        // Regular input items (perimeter, count, custom)
        qty = item.inputValue;
      }
      
      subtotal += qty * item.jocItem.unitCost;
      checkedItems.push(item.jocItem);
    });
    
    return { subtotal, checkedItems, hasUnresolvedMismatch };
  }, [items, measurement.value]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const updateInputValue = (id: string, value: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, inputValue: value } : item
    ));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setSearchResults(searchJOCItems(query, 5));
    } else {
      setSearchResults([]);
    }
  };

  const addCustomItem = (jocItem: JOCItem) => {
    // Check for unit mismatch
    const mismatch = checkUnitMismatch(jocItem.unit, measurement.unit);
    
    const newItem: ConfigurableItem = {
      id: `custom-${Date.now()}`,
      jocItem,
      category: 'optional',
      checked: true,
      quantityFactor: mismatch.needsConversion ? 0 : 1.0, // Start at 0 if needs conversion input
      needsInput: mismatch.needsConversion ? 'conversion' : undefined,
      inputUnit: mismatch.needsConversion ? `${jocItem.unit}/${measurement.unit}` : undefined,
      note: mismatch.suggestedPrompt,
      unitMismatch: mismatch.needsConversion ? mismatch : undefined,
    };
    setItems(prev => [...prev, newItem]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const primaryItems = items.filter(i => i.category === 'primary');
  const typicalItems = items.filter(i => i.category === 'typical');
  const optionalItems = items.filter(i => i.category === 'optional');

  // Check if any items have height variants
  const itemsWithHeightOptions = useMemo(() => 
    getItemsWithHeightOptions(totals.checkedItems, jocCatalogue),
    [totals.checkedItems]
  );
  
  const hasHeightOptions = itemsWithHeightOptions.length > 0;

  // Handle Apply click - check for height variants first
  const handleApplyClick = () => {
    if (hasHeightOptions) {
      setPendingItems(totals.checkedItems);
      setShowHeightSelector(true);
    } else {
      onApply(totals.checkedItems);
    }
  };

  // Handle height selection confirmation
  const handleHeightConfirm = (_ceilingHeight: number, adjustedItems: JOCItem[]) => {
    // Replace height-tiered items with correct tier, keep others unchanged
    const finalItems = pendingItems.map(item => {
      const adjusted = adjustedItems.find(a => 
        a.taskCode.replace(/-\d{4}$/, '') === item.taskCode.replace(/-\d{4}$/, '')
      );
      return adjusted || item;
    });
    
    setShowHeightSelector(false);
    onApply(finalItems);
  };

  // Show HeightSelector if needed
  if (showHeightSelector && hasHeightOptions) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg">
          <HeightSelector
            families={itemsWithHeightOptions}
            quantity={measurement.value}
            catalogue={jocCatalogue}
            onConfirm={handleHeightConfirm}
            onCancel={() => setShowHeightSelector(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{matchedAssembly.name}</h2>
              <p className="text-xs text-white/50">
                {measurement.value.toFixed(1)} {measurement.unit} measured
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-auto space-y-4">
          {/* Primary Items */}
          {primaryItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Check className="w-3 h-3" /> Primary Items
              </h3>
              <div className="space-y-2">
                {primaryItems.map(item => (
                  <ItemRow 
                    key={item.id} 
                    item={item} 
                    measurementValue={measurement.value}
                    onToggle={() => toggleItem(item.id)}
                    onInputChange={(v) => updateInputValue(item.id, v)}
                    locked
                  />
                ))}
              </div>
            </div>
          )}

          {/* Typical Items */}
          {typicalItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Typically Included
              </h3>
              <div className="space-y-2">
                {typicalItems.map(item => (
                  <ItemRow 
                    key={item.id} 
                    item={item}
                    measurementValue={measurement.value}
                    onToggle={() => toggleItem(item.id)}
                    onInputChange={(v) => updateInputValue(item.id, v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional Items */}
          {optionalItems.length > 0 && (
            <div>
              <button 
                onClick={() => setShowOptional(!showOptional)}
                className="w-full flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 hover:text-white/60"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Optional / As Needed
                </span>
                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showOptional && (
                <div className="space-y-2">
                  {optionalItems.map(item => (
                    <ItemRow 
                      key={item.id} 
                      item={item}
                      measurementValue={measurement.value}
                      onToggle={() => toggleItem(item.id)}
                      onInputChange={(v) => updateInputValue(item.id, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Custom Item */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Search className="w-3 h-3" /> Add More Items
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search JOC catalogue..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map(item => (
                  <button
                    key={item.taskCode}
                    onClick={() => addCustomItem(item)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-xs transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="text-white/50 font-mono">{item.taskCode.slice(0, 11)}</span>
                      <span className="text-emerald-400">${item.unitCost.toFixed(2)}/{item.unit}</span>
                    </div>
                    <p className="truncate text-white/70">{item.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/60">
              <Calculator className="w-4 h-4" />
              <span className="text-sm">{totals.checkedItems.length} items selected</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Estimated Total</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          
          {/* Unit Mismatch Warning */}
          {totals.hasUnresolvedMismatch && (
            <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300">
                Some items have unit mismatches. Enter conversion factors above to include them in the total.
              </span>
            </div>
          )}
          
          {/* Height Premium Indicator */}
          {hasHeightOptions && (
            <div className="mb-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg flex items-center gap-2">
              <ArrowUpFromLine className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-300">
                {itemsWithHeightOptions.length} item{itemsWithHeightOptions.length > 1 ? 's have' : ' has'} height-based pricing. 
                You'll select ceiling height next.
              </span>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyClick}
              className="flex-1 py-2.5 px-4 text-sm font-semibold text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {hasHeightOptions ? (
                <>
                  <ArrowUpFromLine className="w-4 h-4" />
                  Continue to Height
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply {totals.checkedItems.length} Items
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ITEM ROW COMPONENT
// ============================================

interface ItemRowProps {
  item: ConfigurableItem;
  measurementValue: number;
  onToggle: () => void;
  onInputChange: (value: number) => void;
  locked?: boolean;
}

function ItemRow({ item, measurementValue, onToggle, onInputChange, locked }: ItemRowProps) {
  // For conversion items, inputValue is the conversion factor (LF/SF)
  // quantity = measurementValue (SF) * conversionFactor (LF/SF) = total LF
  const quantity = item.needsInput === 'conversion' && item.inputValue
    ? measurementValue * item.inputValue
    : item.needsInput && item.inputValue 
      ? item.inputValue 
      : measurementValue * item.quantityFactor;
  
  const cost = quantity * item.jocItem.unitCost;
  
  const hasUnitMismatch = item.unitMismatch?.needsConversion;
  const needsConversionInput = item.needsInput === 'conversion' && !item.inputValue;
  
  return (
    <div className={`
      p-3 rounded-lg border transition-all
      ${hasUnitMismatch && needsConversionInput
        ? 'bg-amber-500/10 border-amber-500/30' 
        : item.checked 
          ? 'bg-white/5 border-white/10' 
          : 'bg-transparent border-white/5 opacity-50'
      }
    `}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          disabled={locked}
          className={`
            w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
            ${item.checked 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white/10 text-transparent hover:bg-white/20'
            }
            ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Check className="w-3 h-3" />
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-tight">{item.jocItem.description}</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">{item.jocItem.taskCode}</p>
            </div>
            <p className={`text-sm font-medium flex-shrink-0 ${
              needsConversionInput ? 'text-amber-400' : 
              item.checked ? 'text-emerald-400' : 'text-white/30'
            }`}>
              {needsConversionInput ? '⚠️ Set factor' : `$${cost.toFixed(0)}`}
            </p>
          </div>
          
          {/* Unit Mismatch Warning */}
          {hasUnitMismatch && (
            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="text-amber-300 font-medium">
                    Unit mismatch: {item.unitMismatch?.itemUnit} item on {item.unitMismatch?.measurementUnit} measurement
                  </p>
                  <p className="text-white/50 mt-1">{item.note}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.1"
                  value={item.inputValue || ''}
                  onChange={(e) => onInputChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.0"
                  className="w-20 px-2 py-1 text-xs bg-white/10 border border-amber-500/30 rounded focus:outline-none focus:border-amber-500/50"
                />
                <span className="text-xs text-amber-300/80">{item.inputUnit}</span>
                {item.inputValue && item.inputValue > 0 && (
                  <span className="text-xs text-white/40">
                    = {quantity.toFixed(1)} {item.jocItem.unit}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Regular Quantity / Input (non-mismatch items) */}
          {!hasUnitMismatch && (
            <div className="flex items-center gap-2 mt-2">
              {item.needsInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={item.inputValue || ''}
                    onChange={(e) => onInputChange(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-20 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-white/20"
                  />
                  <span className="text-xs text-white/40">{item.inputUnit}</span>
                  {item.note && (
                    <span className="text-[10px] text-white/30">({item.note})</span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40">
                  {quantity.toFixed(1)} {item.jocItem.unit} × ${item.jocItem.unitCost.toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ASSEMBLY_CONFIGS };
export type { AssemblyConfig };
