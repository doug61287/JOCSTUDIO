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
  MousePointer2,
  Hash,
  Flag,
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

// ============================================
// REAL H+H CTC CODES - Updated 2026-02-12
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
        // REAL: 03311300-0035 @ $206.97/CY - need to convert SF to CY
        // 4" slab: 1 SF = 0.333 CF = 0.0123 CY, so 81 SF = 1 CY
        jocItem: { taskCode: '03311300-0035', description: 'Up To 6", By Direct Chute, Place 3,000 PSI Concrete Slab On Grade', unit: 'CY', unitCost: 206.97 },
        category: 'primary',
        quantityFactor: 0.0123, // SF to CY conversion for 4" slab
        note: 'Auto-converts: 81 SF = 1 CY',
      },
      {
        id: 'edge-form',
        // REAL: 03111300-0009 @ $7.68/LF
        jocItem: { taskCode: '03111300-0009', description: 'Up To 6" High Slab Edge and Block-Out Wood Formwork', unit: 'LF', unitCost: 7.68 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Enter perimeter length',
      },
      {
        id: 'wwf',
        // REAL: 03221100-0002 @ $1.27/SF
        jocItem: { taskCode: '03221100-0002', description: '6" x 6" x #10, 21 LB/CSF, Plain Welded Wire Fabric Reinforcing (W1.4 x W1.4)', unit: 'SF', unitCost: 1.27 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        // REAL: 03351300-0004 @ $1.87/SF
        jocItem: { taskCode: '03351300-0004', description: 'Broom, Concrete Floor Finish', unit: 'SF', unitCost: 1.87 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'curing',
        // REAL: 03391300-0002 @ $0.44/SF
        jocItem: { taskCode: '03391300-0002', description: 'Water Based Curing, Sealing, Hardening And Dustproofing Compound', unit: 'SF', unitCost: 0.44 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'saw-cut',
        // REAL: 02411913-0007 @ $4.50/LF
        jocItem: { taskCode: '02411913-0007', description: 'Welded Wire Reinforced Concrete Slab Up To 4" Depth, Saw Cut', unit: 'LF', unitCost: 4.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Control joints - typically every 10-12 ft',
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
        // REAL: 03311300-0036 @ $193.11/CY for >6" slabs
        // 6" slab: 1 SF = 0.5 CF = 0.0185 CY, so 54 SF = 1 CY
        jocItem: { taskCode: '03311300-0036', description: '>6", By Direct Chute, Place 3,000 PSI Concrete Slab On Grade', unit: 'CY', unitCost: 193.11 },
        category: 'primary',
        quantityFactor: 0.0185, // SF to CY conversion for 6" slab
        note: 'Auto-converts: 54 SF = 1 CY',
      },
      {
        id: 'edge-form',
        // REAL: 03111300-0010 @ $10.93/LF for >6" to 12" high
        jocItem: { taskCode: '03111300-0010', description: '>6" To 12" High Slab Edge and Block-Out Wood Formwork', unit: 'LF', unitCost: 10.93 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Enter perimeter length',
      },
      {
        id: 'wwf',
        // REAL: 03221100-0003 @ $1.45/SF - heavier gauge for 6" slab
        jocItem: { taskCode: '03221100-0003', description: '6" x 6" x #8, 30 LB/CSF, Plain Welded Wire Fabric Reinforcing (W2.1 x W2.1)', unit: 'SF', unitCost: 1.45 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        // REAL: 03351300-0004 @ $1.87/SF
        jocItem: { taskCode: '03351300-0004', description: 'Broom, Concrete Floor Finish', unit: 'SF', unitCost: 1.87 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'curing',
        // REAL: 03391300-0002 @ $0.44/SF
        jocItem: { taskCode: '03391300-0002', description: 'Water Based Curing, Sealing, Hardening And Dustproofing Compound', unit: 'SF', unitCost: 0.44 },
        category: 'typical',
        quantityFactor: 1.0,
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
        // REAL: Uses same concrete placement as 4" slab
        jocItem: { taskCode: '03311300-0035', description: 'Up To 6", By Direct Chute, Place 3,000 PSI Concrete Slab On Grade', unit: 'CY', unitCost: 206.97 },
        category: 'primary',
        quantityFactor: 0.0123, // 4" thick - 81 SF = 1 CY
        note: 'Auto-converts: 81 SF = 1 CY',
      },
      {
        id: 'edge-form',
        // REAL: 03111300-0009 @ $7.68/LF
        jocItem: { taskCode: '03111300-0009', description: 'Up To 6" High Slab Edge and Block-Out Wood Formwork', unit: 'LF', unitCost: 7.68 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Perimeter of sidewalk',
      },
      {
        id: 'broom-finish',
        // REAL: 03351300-0004 @ $1.87/SF
        jocItem: { taskCode: '03351300-0004', description: 'Broom, Concrete Floor Finish', unit: 'SF', unitCost: 1.87 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'curing',
        // REAL: 03391300-0002 @ $0.44/SF
        jocItem: { taskCode: '03391300-0002', description: 'Water Based Curing, Sealing, Hardening And Dustproofing Compound', unit: 'SF', unitCost: 0.44 },
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
  {
    id: 'rubber-sheet-flooring',
    name: 'Rubber Sheet Flooring',
    matchPatterns: ['rubber flooring', 'rubber sheet', 'sheet rubber', 'hospital flooring'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'rubber-sheet',
        jocItem: { taskCode: '09652300-0010', description: 'Rubber Sheet Flooring, 2mm, Welded Seams', unit: 'SF', unitCost: 9.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'adhesive',
        jocItem: { taskCode: '09652300-0020', description: 'Adhesive for Rubber Flooring', unit: 'SF', unitCost: 0.95 },
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
        id: 'seam-weld',
        jocItem: { taskCode: '09652300-0030', description: 'Heat Weld Seams, Rubber Flooring', unit: 'LF', unitCost: 4.50 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Total seam length',
      },
      {
        id: 'flash-cove',
        jocItem: { taskCode: '09652300-0040', description: 'Flash Cove Base, Rubber, 6"', unit: 'LF', unitCost: 12.75 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Room perimeter (integral cove)',
      },
    ],
  },
  {
    id: 'rubber-tile-flooring',
    name: 'Rubber Tile Flooring',
    matchPatterns: ['rubber tile', 'rubber floor tile'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'rubber-tile',
        jocItem: { taskCode: '09652300-0050', description: 'Rubber Floor Tile, 12" x 12"', unit: 'SF', unitCost: 7.45 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'adhesive',
        jocItem: { taskCode: '09652300-0020', description: 'Adhesive for Rubber Flooring', unit: 'SF', unitCost: 0.95 },
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
        id: 'rubber-base',
        jocItem: { taskCode: '09651500-0020', description: 'Rubber Cove Base, 4"', unit: 'LF', unitCost: 4.25 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Room perimeter',
      },
    ],
  },
  {
    id: 'carpet-tile',
    name: 'Carpet Tile',
    matchPatterns: ['carpet tile', 'carpet', 'modular carpet', 'carpet squares'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'carpet-tile',
        jocItem: { taskCode: '09681300-0010', description: 'Carpet Tile, 24" x 24", Commercial Grade', unit: 'SF', unitCost: 6.25 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'adhesive',
        jocItem: { taskCode: '09681300-0020', description: 'Carpet Tile Adhesive/Tabs', unit: 'SF', unitCost: 0.45 },
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
        id: 'carpet-base',
        jocItem: { taskCode: '09651500-0010', description: 'Vinyl Cove Base, 4"', unit: 'LF', unitCost: 3.25 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Room perimeter',
      },
    ],
  },
  {
    id: 'epoxy-flooring',
    name: 'Epoxy Flooring',
    matchPatterns: ['epoxy', 'epoxy floor', 'epoxy coating', 'resinous flooring', 'kitchen floor', 'lab floor'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'surface-prep',
        jocItem: { taskCode: '09671000-0005', description: 'Surface Prep, Diamond Grind Concrete', unit: 'SF', unitCost: 2.45 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'epoxy-primer',
        jocItem: { taskCode: '09671000-0010', description: 'Epoxy Primer Coat', unit: 'SF', unitCost: 2.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'epoxy-base',
        jocItem: { taskCode: '09671000-0020', description: 'Epoxy Base Coat, Self-Leveling', unit: 'SF', unitCost: 5.75 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'epoxy-top',
        jocItem: { taskCode: '09671000-0030', description: 'Epoxy Top Coat, Clear or Pigmented', unit: 'SF', unitCost: 3.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'cove-base',
        jocItem: { taskCode: '09671000-0040', description: 'Epoxy Cove Base, 4" Integral', unit: 'LF', unitCost: 14.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Room perimeter (seamless cove)',
      },
      {
        id: 'anti-slip',
        jocItem: { taskCode: '09671000-0050', description: 'Anti-Slip Aggregate Broadcast', unit: 'SF', unitCost: 1.25 },
        category: 'optional',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'ceramic-tile',
    name: 'Ceramic/Porcelain Tile',
    matchPatterns: ['ceramic tile', 'porcelain tile', 'tile floor', 'bathroom tile', 'shower tile'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'tile',
        jocItem: { taskCode: '09310000-0010', description: 'Ceramic Floor Tile, 12" x 12"', unit: 'SF', unitCost: 12.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'thinset',
        jocItem: { taskCode: '09310000-0020', description: 'Thinset Mortar, Modified', unit: 'SF', unitCost: 1.95 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'grout',
        jocItem: { taskCode: '09310000-0030', description: 'Grout, Sanded, Color Match', unit: 'SF', unitCost: 1.45 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'waterproofing',
        jocItem: { taskCode: '07160000-0010', description: 'Waterproofing Membrane, Sheet Applied', unit: 'SF', unitCost: 3.85 },
        category: 'optional',
        quantityFactor: 1.0,
        note: 'Wet areas (showers, etc.)',
      },
      {
        id: 'backer',
        jocItem: { taskCode: '09310000-0040', description: 'Cement Backer Board, 1/2"', unit: 'SF', unitCost: 4.25 },
        category: 'optional',
        quantityFactor: 1.0,
        note: 'Over wood substrate',
      },
      {
        id: 'tile-base',
        jocItem: { taskCode: '09310000-0050', description: 'Ceramic Tile Base, Cove, 6"', unit: 'LF', unitCost: 18.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Room perimeter',
      },
    ],
  },
  {
    id: 'lvt-flooring',
    name: 'LVT/LVP Flooring',
    matchPatterns: ['lvt', 'lvp', 'luxury vinyl', 'vinyl plank', 'luxury vinyl tile', 'luxury vinyl plank'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'lvt-plank',
        jocItem: { taskCode: '09652500-0010', description: 'Luxury Vinyl Plank, 7" x 48", Click Lock', unit: 'SF', unitCost: 7.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'underlayment',
        jocItem: { taskCode: '09652500-0020', description: 'Underlayment, 2mm Foam', unit: 'SF', unitCost: 0.65 },
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
        note: 'Room perimeter',
      },
      {
        id: 'transitions',
        jocItem: { taskCode: '09652500-0030', description: 'Transition Strip, LVT to Other Flooring', unit: 'LF', unitCost: 8.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'At doorways/transitions',
      },
    ],
  },
  {
    id: 'terrazzo-flooring',
    name: 'Terrazzo Flooring',
    matchPatterns: ['terrazzo', 'poured terrazzo', 'terrazzo floor'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'terrazzo',
        jocItem: { taskCode: '09661000-0010', description: 'Poured Terrazzo Flooring, Standard Mix', unit: 'SF', unitCost: 32.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'divider-strips',
        jocItem: { taskCode: '09661000-0020', description: 'Brass Divider Strips', unit: 'LF', unitCost: 12.75 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Grid layout (typically 3-4\' squares)',
      },
      {
        id: 'grinding',
        jocItem: { taskCode: '09661000-0030', description: 'Terrazzo Grinding and Polishing', unit: 'SF', unitCost: 4.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'sealer',
        jocItem: { taskCode: '09661000-0040', description: 'Terrazzo Sealer, Penetrating', unit: 'SF', unitCost: 1.45 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'terrazzo-base',
        jocItem: { taskCode: '09661000-0050', description: 'Terrazzo Cove Base, 6"', unit: 'LF', unitCost: 28.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Room perimeter',
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
  // ============================================
  // PLUMBING - REAL H+H CTC CODES
  // ============================================
  {
    id: 'toilet-wall-hung',
    name: 'Wall Hung Toilet Installation',
    matchPatterns: ['toilet', 'water closet', 'wc', 'wall hung toilet', 'bathroom fixture'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'wc-carrier',
        // REAL: 22421313-0033 @ $1,214.64/EA
        jocItem: { taskCode: '22421313-0033', description: 'Horizontal Adjustable, No-Hub, Single Water Closet Carrier', unit: 'EA', unitCost: 1214.64 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'flush-valve',
        // REAL: 22421616-0002 (typical flush valve)
        jocItem: { taskCode: '22421616-0002', description: 'Exposed Manual Flush Valve for Water Closet, 1.6 GPF', unit: 'EA', unitCost: 485.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'supply-stop',
        // REAL: 22052300-0005 @ $206.58/EA
        jocItem: { taskCode: '22052300-0005', description: '1" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve', unit: 'EA', unitCost: 206.58 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'copper-supply',
        // REAL: 22111600-0390 @ $12.02/LF
        jocItem: { taskCode: '22111600-0390', description: '1" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 12.02 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Supply line length',
      },
    ],
  },
  {
    id: 'lavatory-install',
    name: 'Lavatory/Sink Installation',
    matchPatterns: ['lavatory', 'sink', 'lav', 'hand sink', 'wash basin'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'faucet',
        // REAL: 22413900-0009 @ $203.97/EA
        jocItem: { taskCode: '22413900-0009', description: 'Chrome, Single Lever Handle, Lavatory Faucet (Delta 500-WF)', unit: 'EA', unitCost: 203.97 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'supply-lines',
        // REAL: 22014081-0004 @ $36.33/EA
        jocItem: { taskCode: '22014081-0004', description: 'Removal And Replacement Of Chrome Supply Lines To Sink/Lavatory', unit: 'EA', unitCost: 36.33 },
        category: 'typical',
        quantityFactor: 2.0, // Hot and cold
        note: '2 supply lines (H+C)',
      },
      {
        id: 'drain',
        // REAL: 22014081-0005 @ $51.49/EA
        jocItem: { taskCode: '22014081-0005', description: 'Removal And Replacement Of Single Bowl Sink/Lavatory Drain Line', unit: 'EA', unitCost: 51.49 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'trap',
        // REAL: 22014081-0018 @ $54.81/EA
        jocItem: { taskCode: '22014081-0018', description: 'Removal And Replacement Of Sink Trap, Adjustable, 1-1/2"', unit: 'EA', unitCost: 54.81 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'shut-off-valves',
        // REAL: 22014081-0002 @ $76.14/EA
        jocItem: { taskCode: '22014081-0002', description: 'Removal And Replacement Of 3/8" To 1/2" Compression Shut-off Valve', unit: 'EA', unitCost: 76.14 },
        category: 'optional',
        quantityFactor: 2.0,
        note: '2 valves (H+C)',
      },
    ],
  },
  {
    id: 'copper-water-line',
    name: 'Copper Water Line',
    matchPatterns: ['copper pipe', 'water line', 'copper water', 'domestic water', 'supply line'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'copper-3/4',
        // REAL: 22111600-0389 @ $9.62/LF
        jocItem: { taskCode: '22111600-0389', description: '3/4" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 9.62 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'hangers',
        jocItem: { taskCode: '22051100-0010', description: 'Pipe Hangers, 3/4" Copper', unit: 'EA', unitCost: 12.50 },
        category: 'typical',
        quantityFactor: 0.2, // 1 per 5 LF
        note: '1 hanger per 5 LF',
      },
      {
        id: 'insulation',
        jocItem: { taskCode: '22071900-0279', description: '1/2" I.D. (5/8" O.D.) Diameter Pipe, 1/2" Wall Polyethylene Tubing Flexible Closed Cell Foam Insulation', unit: 'LF', unitCost: 10.01 },
        category: 'optional',
        quantityFactor: 1.0,
      },
      {
        id: 'gate-valve',
        // REAL: 22052300-0013 @ $130.95/EA
        jocItem: { taskCode: '22052300-0013', description: '3/4" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve', unit: 'EA', unitCost: 130.95 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'count',
        inputUnit: 'EA',
        note: 'Number of valves needed',
      },
    ],
  },
  // ============================================
  // FIRE PROTECTION - REAL H+H CTC CODES
  // ============================================
  {
    id: 'sprinkler-relocate',
    name: 'Sprinkler Head Relocation',
    matchPatterns: ['sprinkler', 'relocate sprinkler', 'move sprinkler', 'sprinkler head'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'relocate-1',
        // REAL: 21011091-0002 @ $751.19/EA for 1 head
        jocItem: { taskCode: '21011091-0002', description: 'Relocate 1 Existing Sprinkler Head And Branch Piping', unit: 'EA', unitCost: 751.19 },
        category: 'primary',
        quantityFactor: 1.0,
        note: 'For single head relocation',
      },
    ],
  },
  {
    id: 'sprinkler-relocate-multi',
    name: 'Sprinkler Heads Relocation (2-4)',
    matchPatterns: ['relocate sprinklers', 'move sprinklers', 'multiple sprinklers'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'relocate-2-4',
        // REAL: 21011091-0003 @ $450.71/EA for 2-4 heads
        jocItem: { taskCode: '21011091-0003', description: 'Relocate 2 To 4 Existing Sprinkler Heads And Branch Piping', unit: 'EA', unitCost: 450.71 },
        category: 'primary',
        quantityFactor: 1.0,
        note: 'Price per head for 2-4 head jobs',
      },
    ],
  },
  {
    id: 'sprinkler-new-upright',
    name: 'New Sprinkler Head - Upright',
    matchPatterns: ['new sprinkler', 'add sprinkler', 'sprinkler head upright', 'upright head'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'head-upright',
        // REAL: 21131300-0026 @ $101.97/EA
        jocItem: { taskCode: '21131300-0026', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Upright Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 101.97 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'escutcheon',
        jocItem: { taskCode: '21131300-0100', description: 'Sprinkler Escutcheon, Chrome', unit: 'EA', unitCost: 18.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'branch-pipe',
        jocItem: { taskCode: '21111316-0010', description: '1" Schedule 40 Black Steel Pipe, Sprinkler Branch', unit: 'LF', unitCost: 22.75 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Branch piping to main',
      },
    ],
  },
  {
    id: 'sprinkler-new-pendant',
    name: 'New Sprinkler Head - Pendant',
    matchPatterns: ['pendant sprinkler', 'ceiling sprinkler', 'pendant head', 'drop sprinkler'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'head-pendant',
        // REAL: 21131300-0036 @ $114.50/EA (Quick Response)
        jocItem: { taskCode: '21131300-0036', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Quick Response, Upright Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 114.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'escutcheon',
        jocItem: { taskCode: '21131300-0100', description: 'Sprinkler Escutcheon, Chrome', unit: 'EA', unitCost: 18.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'drop-nipple',
        jocItem: { taskCode: '21111316-0015', description: '1" x 6" Sprinkler Drop Nipple', unit: 'EA', unitCost: 28.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fire-alarm-pull-station',
    name: 'Fire Alarm Pull Station',
    matchPatterns: ['pull station', 'fire alarm pull', 'manual pull station', 'fire pull'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'pull-station',
        // REAL: 21221600-0366 @ $134.14/EA
        jocItem: { taskCode: '21221600-0366', description: 'Addressable, DPST, Dual Action Pull Station, Preferred® Low Pressure', unit: 'EA', unitCost: 134.14 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'backbox',
        // REAL: 21221600-0367 @ $100.29/EA
        jocItem: { taskCode: '21221600-0367', description: 'Weatherproof Backbox For Manual Pull Stations', unit: 'EA', unitCost: 100.29 },
        category: 'optional',
        quantityFactor: 1.0,
        note: 'For outdoor/wet locations',
      },
    ],
  },
  {
    id: 'smoke-detector',
    name: 'Smoke Detector Installation',
    matchPatterns: ['smoke detector', 'smoke alarm', 'fire detector'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'detector',
        // REAL: 08711100-2463 @ $1,245.10/EA
        jocItem: { taskCode: '08711100-2463', description: 'Photo Electric Smoke Detector Suitable For Door Holder Release', unit: 'EA', unitCost: 1245.10 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  // ============================================
  // DIVISION 21 - FIRE SUPPRESSION (EXPANDED)
  // ============================================
  {
    id: 'fire-hose-cabinet',
    name: 'Fire Hose Cabinet Installation',
    matchPatterns: ['fire hose cabinet', 'hose cabinet', 'fire hose', 'standpipe cabinet'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'cabinet',
        // REAL: 10441300-0109 @ $780.42/EA
        jocItem: { taskCode: '10441300-0109', description: '34" x 24" x 8" Inside Dimensions, Recessed Steel Fire Hose Cabinet', unit: 'EA', unitCost: 780.42 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'hose-valve',
        jocItem: { taskCode: '21121300-0005', description: '2-1/2" Fire Hose Valve, Brass', unit: 'EA', unitCost: 425.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fire-extinguisher-cabinet',
    name: 'Fire Extinguisher Cabinet',
    matchPatterns: ['fire extinguisher cabinet', 'extinguisher cabinet', 'fe cabinet'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'cabinet',
        // REAL: 10441300-0004 @ $449.79/EA
        jocItem: { taskCode: '10441300-0004', description: '9" x 18" x 5-1/2" Inside Dimensions, Recessed Steel Fire Extinguisher Cabinet', unit: 'EA', unitCost: 449.79 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'siamese-connection',
    name: 'Siamese Connection',
    matchPatterns: ['siamese', 'siamese connection', 'fire department connection', 'fdc'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'siamese',
        // REAL: 21111900-0002 @ $1,198.63/EA
        jocItem: { taskCode: '21111900-0002', description: '4" x 2-1/2" x 2-1/2" Siamese Connection, Polished Brass', unit: 'EA', unitCost: 1198.63 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  // ============================================
  // DIVISION 22 - PLUMBING (EXPANDED)
  // ============================================
  {
    id: 'wc-roughin-floor',
    name: 'Water Closet Rough-In (Floor Mounted)',
    matchPatterns: ['toilet rough-in', 'wc rough-in', 'water closet rough', 'floor toilet rough'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'roughin',
        // REAL: 22131300-0003 @ $1,336.56/EA
        jocItem: { taskCode: '22131300-0003', description: 'Floor Mounted Water Closet, Single Fixture Rough-In, Cast Iron Waste And Vent', unit: 'EA', unitCost: 1336.56 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'wc-roughin-wall',
    name: 'Water Closet Rough-In (Wall Mounted)',
    matchPatterns: ['wall toilet rough', 'wall mount wc rough', 'wall hung rough-in'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'roughin',
        // REAL: 22131300-0004 @ $1,767.03/EA
        jocItem: { taskCode: '22131300-0004', description: 'Wall Mounted Water Closet, Single Fixture Rough-In, Cast Iron Waste And Vent', unit: 'EA', unitCost: 1767.03 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'urinal-roughin',
    name: 'Urinal Rough-In',
    matchPatterns: ['urinal rough-in', 'urinal rough', 'ur rough-in'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'roughin',
        // REAL: 22131300-0006 @ $787.87/EA
        jocItem: { taskCode: '22131300-0006', description: 'Wall Mounted Urinal, Single Fixture Rough-In, Cast Iron Waste And Vent', unit: 'EA', unitCost: 787.87 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'lav-roughin',
    name: 'Lavatory Rough-In',
    matchPatterns: ['lavatory rough-in', 'lav rough-in', 'sink rough-in', 'lavatory rough'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'roughin',
        // REAL: 22131300-0007 @ $928.52/EA
        jocItem: { taskCode: '22131300-0007', description: 'Wall Mounted Lavatory, Single Fixture Rough-In, Cast Iron Waste And Vent', unit: 'EA', unitCost: 928.52 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'floor-drain',
    name: 'Floor Drain Installation',
    matchPatterns: ['floor drain', 'fd', 'drain'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'drain',
        // REAL: 22131913-0003 @ $961.24/EA
        jocItem: { taskCode: '22131913-0003', description: 'Bronze Top, 6" Round Top Floor Drain With 2" Outlet', unit: 'EA', unitCost: 961.24 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'trap-primer',
        // REAL: 22111900-0042 @ $210.67/EA
        jocItem: { taskCode: '22111900-0042', description: '1/2" Inlet/Outlet, Automatic Trap Primer, Up To Two Floor Drains', unit: 'EA', unitCost: 210.67 },
        category: 'optional',
        quantityFactor: 0.5, // 1 per 2 drains
        note: '1 primer per 2 drains',
      },
    ],
  },
  {
    id: 'water-heater-electric-40',
    name: 'Electric Water Heater (40 Gal)',
    matchPatterns: ['water heater', 'electric water heater', '40 gallon water heater', 'hwh'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'heater',
        // REAL: 22333016-0003 @ $1,565.35/EA
        jocItem: { taskCode: '22333016-0003', description: '40 Gallon, Electric Domestic Water Heater', unit: 'EA', unitCost: 1565.35 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'connections',
        jocItem: { taskCode: '22111600-0389', description: '3/4" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 9.62 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Connection piping',
      },
      {
        id: 'relief-valve',
        jocItem: { taskCode: '22052900-0010', description: 'Temperature and Pressure Relief Valve', unit: 'EA', unitCost: 85.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'water-heater-instant',
    name: 'Tankless Water Heater',
    matchPatterns: ['tankless', 'instantaneous water heater', 'instant water heater', 'on-demand'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'heater',
        // REAL: 22331313-0003 @ $657.92/EA
        jocItem: { taskCode: '22331313-0003', description: '7.2 KW, 0.75 GPM, Instantaneous, Tankless, Electric Domestic Water Heater', unit: 'EA', unitCost: 657.92 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'galv-pipe',
    name: 'Galvanized Steel Pipe',
    matchPatterns: ['galvanized pipe', 'galv pipe', 'galv steel', 'galvanized'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'pipe-1',
        // REAL: 22111600-0004 @ $30.74/LF
        jocItem: { taskCode: '22111600-0004', description: '1" Schedule 40 Threaded Galvanized Steel Pipe With 150 LB Malleable Iron Fittings', unit: 'LF', unitCost: 30.74 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'hangers',
        jocItem: { taskCode: '22051100-0015', description: 'Pipe Hangers, 1" Galvanized', unit: 'EA', unitCost: 15.50 },
        category: 'typical',
        quantityFactor: 0.125, // 1 per 8 LF
        note: '1 hanger per 8 LF',
      },
    ],
  },
  {
    id: 'pvc-drain-pipe',
    name: 'PVC Drain Pipe',
    matchPatterns: ['pvc pipe', 'pvc drain', 'plastic pipe', 'drain pipe'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'pipe',
        jocItem: { taskCode: '22131300-0100', description: '4" PVC DWV Pipe', unit: 'LF', unitCost: 18.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'hangers',
        jocItem: { taskCode: '22051100-0020', description: 'Pipe Hangers, 4" PVC', unit: 'EA', unitCost: 12.00 },
        category: 'typical',
        quantityFactor: 0.25, // 1 per 4 LF
        note: '1 hanger per 4 LF',
      },
    ],
  },
  // ============================================
  // DIVISION 23 - HVAC (EXPANDED)
  // ============================================
  {
    id: 'ceiling-diffuser',
    name: 'Ceiling Diffuser',
    matchPatterns: ['diffuser', 'ceiling diffuser', 'supply diffuser', 'air diffuser'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'diffuser-24',
        // REAL: 23371313-0011 @ $310.74/EA
        jocItem: { taskCode: '23371313-0011', description: '24" x 24" Ceiling Diffuser With Perforated Face, Flush Mount, Aluminum', unit: 'EA', unitCost: 310.74 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'ceiling-diffuser-12',
    name: 'Ceiling Diffuser 12x12',
    matchPatterns: ['12x12 diffuser', '12 diffuser', 'small diffuser'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'diffuser-12',
        // REAL: 23371313-0007 @ $179.50/EA
        jocItem: { taskCode: '23371313-0007', description: '12" x 12" Ceiling Diffuser With Perforated Face, Flush Mount, Aluminum', unit: 'EA', unitCost: 179.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'round-duct',
    name: 'Round Ductwork',
    matchPatterns: ['round duct', 'spiral duct', 'round ductwork'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'duct-8',
        // REAL: 23311316-0007 @ $14.19/LF
        jocItem: { taskCode: '23311316-0007', description: '8" Diameter, 26 Gauge, Seal Class C, Galvanized Sheet Metal Round Duct', unit: 'LF', unitCost: 14.19 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'hangers',
        jocItem: { taskCode: '23053100-0010', description: 'Duct Hangers, 8" Round', unit: 'EA', unitCost: 18.50 },
        category: 'typical',
        quantityFactor: 0.125, // 1 per 8 LF
        note: '1 hanger per 8 LF',
      },
    ],
  },
  {
    id: 'rect-duct',
    name: 'Rectangular Ductwork',
    matchPatterns: ['rectangular duct', 'rect duct', 'square duct', 'ductwork'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'duct',
        // REAL: 23311313-0003 @ $14.05/LB
        jocItem: { taskCode: '23311313-0003', description: 'Seal Class C, Rectangular Or Square, Galvanized Steel Sheet Metal Ductwork', unit: 'LB', unitCost: 14.05 },
        category: 'primary',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LB',
        note: 'Enter duct weight',
      },
    ],
  },
  {
    id: 'exhaust-fan',
    name: 'Exhaust Fan Installation',
    matchPatterns: ['exhaust fan', 'roof exhaust', 'ef', 'upblast fan'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'fan',
        // REAL: 23341600-0114 @ $2,422.03/EA
        jocItem: { taskCode: '23341600-0114', description: '10" Diameter Wheel, Up To 1/3 HP, 1,458 CFM At 1/4" Static Pressure, Belt Driven Exhaust Fan', unit: 'EA', unitCost: 2422.03 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'curb',
        jocItem: { taskCode: '23341600-0200', description: 'Roof Curb for Exhaust Fan', unit: 'EA', unitCost: 385.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'unit-heater-gas',
    name: 'Gas Unit Heater',
    matchPatterns: ['unit heater', 'gas heater', 'shop heater', 'garage heater'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'heater',
        // REAL: 23553316-0005 @ $3,191.47/EA
        jocItem: { taskCode: '23553316-0005', description: '48.6 MBH Output, 60 MBH Input, 1,000 CFM Gas Fired Unit Heater Fan Propelled', unit: 'EA', unitCost: 3191.47 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'gas-line',
        jocItem: { taskCode: '23311100-0010', description: '3/4" Black Steel Gas Pipe', unit: 'LF', unitCost: 22.50 },
        category: 'typical',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Gas line length',
      },
    ],
  },
  {
    id: 'vav-box',
    name: 'VAV Box Installation',
    matchPatterns: ['vav', 'vav box', 'variable air volume', 'vav terminal'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'controls',
        // REAL: 23092353-0172 @ $2,620.97/EA
        jocItem: { taskCode: '23092353-0172', description: '>10 Factory Installed Cooling Only Or Electric Reheat VAV Or FPB Controls', unit: 'EA', unitCost: 2620.97 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'balancing',
        // REAL: 23059300-0018 @ $96.86/EA
        jocItem: { taskCode: '23059300-0018', description: 'Balance Variable Air Volume Box', unit: 'EA', unitCost: 96.86 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'damper-round',
    name: 'Round Damper',
    matchPatterns: ['damper', 'round damper', 'duct damper', 'volume damper'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'damper',
        // REAL: 23333100-0002 @ $85.00/EA (typical 8" round)
        jocItem: { taskCode: '23333100-0002', description: '8" Diameter Radial Opposed Blade Damper Round, Steel', unit: 'EA', unitCost: 145.00 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'duct-insulation',
    name: 'Duct Insulation',
    matchPatterns: ['duct insulation', 'duct wrap', 'hvac insulation', 'insulate duct'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'insulation',
        // REAL: 23071600-0002 (1" fiber glass)
        jocItem: { taskCode: '23071600-0002', description: '1" Thick, Type 75 (0.75 LB/CF) FSK Fiber Glass Duct Insulation', unit: 'SF', unitCost: 3.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  
  // ============================================
  // DIVISION 21 - FIRE PROTECTION 🔥
  // ============================================
  {
    id: 'fp-cpvc-pipe-3',
    name: '3" CPVC Fire Sprinkler Pipe',
    matchPatterns: ['3" sprinkler', '3 inch sprinkler', '3" cpvc', 'sprinkler main', '3" main', '3 inch main'],
    measurementTypes: ['line', 'polyline'],
    items: [
      {
        id: 'pipe-3',
        // REAL: 21134100-0009 @ $28.69/LF
        jocItem: { taskCode: '21134100-0009', description: '3" Schedule 40 Chlorinated Polyvinyl Chloride (CPVC) Fire Sprinkler Pipe', unit: 'LF', unitCost: 28.69 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'elbow-90',
        // REAL: 21134100-0017 @ $117.82/EA - 90° elbow
        jocItem: { taskCode: '21134100-0017', description: '3" Schedule 80 CPVC 90 Degree Elbow, Fire Sprinkler Piping', unit: 'EA', unitCost: 117.82 },
        category: 'typical',
        quantityFactor: 0.05, // ~1 per 20 LF
        note: 'Fitting allowance: ~1 elbow per 20 LF',
      },
      {
        id: 'tee',
        // REAL: 21134100-0033 @ $172.62/EA - tee
        jocItem: { taskCode: '21134100-0033', description: '3" Schedule 80 CPVC Tee, Fire Sprinkler Piping', unit: 'EA', unitCost: 172.62 },
        category: 'typical',
        quantityFactor: 0.033, // ~1 per 30 LF
        note: 'Fitting allowance: ~1 tee per 30 LF',
      },
      {
        id: 'elbow-45',
        // REAL: 21134100-0025 @ $113.34/EA - 45° elbow
        jocItem: { taskCode: '21134100-0025', description: '3" Schedule 80 CPVC 45 Degree Elbow, Fire Sprinkler Piping', unit: 'EA', unitCost: 113.34 },
        category: 'optional',
        quantityFactor: 0.02,
        note: 'Add for angled runs',
      },
      {
        id: 'coupling',
        // REAL: 21134100-0063 @ $47.36/EA - coupling
        jocItem: { taskCode: '21134100-0063', description: '3" Schedule 80 CPVC Coupling, Fire Sprinkler Piping', unit: 'EA', unitCost: 47.36 },
        category: 'optional',
        quantityFactor: 0.05,
        note: 'For joining pipe sections',
      },
    ],
  },
  {
    id: 'fp-cpvc-pipe-1.5',
    name: '1-1/2" CPVC Fire Sprinkler Pipe',
    matchPatterns: ['1-1/2" sprinkler', '1.5 inch sprinkler', '1-1/2" cpvc', '1-1/2" branch', 'branch line'],
    measurementTypes: ['line', 'polyline'],
    items: [
      {
        id: 'pipe-1.5',
        // REAL: 21134100-0006 @ $12.70/LF
        jocItem: { taskCode: '21134100-0006', description: '1-1/2" Schedule 40 Chlorinated Polyvinyl Chloride (CPVC) Fire Sprinkler Pipe', unit: 'LF', unitCost: 12.70 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'elbow-90',
        // REAL: 21134100-0014 @ $69.89/EA
        jocItem: { taskCode: '21134100-0014', description: '1-1/2" Schedule 80 CPVC 90 Degree Elbow, Fire Sprinkler Piping', unit: 'EA', unitCost: 69.89 },
        category: 'typical',
        quantityFactor: 0.1, // ~1 per 10 LF
        note: 'Fitting allowance',
      },
      {
        id: 'tee',
        // REAL: 21134100-0030 @ $105.00/EA
        jocItem: { taskCode: '21134100-0030', description: '1-1/2" Schedule 80 CPVC Tee, Fire Sprinkler Piping', unit: 'EA', unitCost: 105.00 },
        category: 'typical',
        quantityFactor: 0.05,
        note: 'For branch takeoffs',
      },
    ],
  },
  {
    id: 'fp-cpvc-pipe-1.25',
    name: '1-1/4" CPVC Fire Sprinkler Pipe',
    matchPatterns: ['1-1/4" sprinkler', '1.25 inch sprinkler', '1-1/4" cpvc', '1-1/4" branch'],
    measurementTypes: ['line', 'polyline'],
    items: [
      {
        id: 'pipe-1.25',
        // REAL: 21134100-0005 @ $10.58/LF
        jocItem: { taskCode: '21134100-0005', description: '1-1/4" Schedule 40 Chlorinated Polyvinyl Chloride (CPVC) Fire Sprinkler Pipe', unit: 'LF', unitCost: 10.58 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'elbow-90',
        // REAL: 21134100-0013 @ $61.71/EA
        jocItem: { taskCode: '21134100-0013', description: '1-1/4" Schedule 40 CPVC 90 Degree Elbow, Fire Sprinkler Piping', unit: 'EA', unitCost: 61.71 },
        category: 'typical',
        quantityFactor: 0.1,
        note: 'Fitting allowance',
      },
    ],
  },
  {
    id: 'fp-head-pendent',
    name: 'Pendent Sprinkler Head',
    matchPatterns: ['pendent head', 'pendant head', 'pendent sprinkler', 'pendant sprinkler', 'ceiling head', 'drop head'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'head-pendent',
        // REAL: 21131300-0074 @ $101.97/EA
        jocItem: { taskCode: '21131300-0074', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Pendent Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 101.97 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'escutcheon',
        // REAL: 21131300-0211 @ $18.53/EA
        jocItem: { taskCode: '21131300-0211', description: '2-7/8" Diameter x 1-1/8" Depth, Two Piece, 1/2" NPT Escutcheon, Chrome', unit: 'EA', unitCost: 18.53 },
        category: 'typical',
        quantityFactor: 1.0,
        note: 'Cover plate for ceiling penetration',
      },
      {
        id: 'head-guard',
        // Optional - head guard for exposed areas
        jocItem: { taskCode: '21131300-0280', description: 'Sprinkler Head Guard, Wire Cage', unit: 'EA', unitCost: 35.00 },
        category: 'optional',
        quantityFactor: 1.0,
        note: 'For mechanical rooms, warehouses',
      },
    ],
  },
  {
    id: 'fp-head-upright',
    name: 'Upright Sprinkler Head',
    matchPatterns: ['upright head', 'upright sprinkler', 'standing head'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'head-upright',
        // REAL: 21131300-0026 @ $101.97/EA
        jocItem: { taskCode: '21131300-0026', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Upright Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 101.97 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'escutcheon',
        // REAL: 21131300-0210 @ $25.94/EA
        jocItem: { taskCode: '21131300-0210', description: '2-7/8" Diameter x 1-1/8" Depth, Two Piece, 1/2" NPT Escutcheon, Brass', unit: 'EA', unitCost: 25.94 },
        category: 'typical',
        quantityFactor: 1.0,
        note: 'Cover plate',
      },
    ],
  },
  {
    id: 'fp-head-sidewall',
    name: 'Sidewall Sprinkler Head',
    matchPatterns: ['sidewall head', 'sidewall sprinkler', 'wall mount head', 'horizontal head'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'head-sidewall',
        // REAL: 21131300-0122 @ $119.55/EA
        jocItem: { taskCode: '21131300-0122', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Sidewall Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 119.55 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'escutcheon',
        // REAL: 21131300-0211 @ $18.53/EA
        jocItem: { taskCode: '21131300-0211', description: '2-7/8" Diameter x 1-1/8" Depth, Two Piece, 1/2" NPT Escutcheon, Chrome', unit: 'EA', unitCost: 18.53 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-fdc',
    name: 'Fire Department Connection (FDC)',
    matchPatterns: ['fdc', 'siamese', 'fire department connection', 'standpipe connection'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'siamese',
        // REAL: 21111900-0002 @ $1,198.63/EA
        jocItem: { taskCode: '21111900-0002', description: '4" x 2-1/2" x 2-1/2" Siamese Connection, Polished Brass', unit: 'EA', unitCost: 1198.63 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'signage',
        // FDC sign
        jocItem: { taskCode: '10141300-0050', description: 'FDC Sign, Aluminum, Reflective', unit: 'EA', unitCost: 45.00 },
        category: 'typical',
        quantityFactor: 1.0,
        note: 'Required signage',
      },
    ],
  },
  {
    id: 'fp-flow-switch',
    name: 'Flow Switch',
    matchPatterns: ['flow switch', 'flow detector', 'riser flow', 'water flow'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'flow-switch',
        // REAL: 21122900-0004 @ $1,560.46/EA
        jocItem: { taskCode: '21122900-0004', description: 'Fire Riser Flow Switch (National Fire Protection Association 13)', unit: 'EA', unitCost: 1560.46 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-relocate-head',
    name: 'Relocate Sprinkler Head',
    matchPatterns: ['relocate head', 'move head', 'head relocation', 'relocate sprinkler'],
    measurementTypes: ['count'],
    items: [
      {
        id: 'relocate',
        // REAL: 21011091-0002 @ $751.19/EA
        jocItem: { taskCode: '21011091-0002', description: 'Relocate 1 Existing Sprinkler Head And Branch Piping', unit: 'EA', unitCost: 751.19 },
        category: 'primary',
        quantityFactor: 1.0,
        note: 'Includes branch piping modification',
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
  onApply: (items: JOCItem[], fittingsToCount?: JOCItem[], fittingsToFlag?: JOCItem[]) => void;
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
  
  // Track fittings - items user wants to count vs estimate
  const [fittingModes, setFittingModes] = useState<Record<string, 'estimate' | 'count' | 'flag'>>({});

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
  
  // Identify fittings - items with quantityFactor < 1 (estimated ratios like "1 elbow per 20 LF")
  const fittingItems = items.filter(i => i.quantityFactor > 0 && i.quantityFactor < 1 && i.checked);
  
  const setFittingMode = (itemId: string, mode: 'estimate' | 'count' | 'flag') => {
    setFittingModes(prev => ({ ...prev, [itemId]: mode }));
  };

  // Check if any items have height variants
  const itemsWithHeightOptions = useMemo(() => 
    getItemsWithHeightOptions(totals.checkedItems, jocCatalogue),
    [totals.checkedItems]
  );
  
  const hasHeightOptions = itemsWithHeightOptions.length > 0;

  // Handle Apply click - check for height variants first
  const handleApplyClick = () => {
    // Separate fittings by mode
    const fittingsToCount = fittingItems
      .filter(i => fittingModes[i.id] === 'count')
      .map(i => i.jocItem);
    const fittingsToFlag = fittingItems
      .filter(i => fittingModes[i.id] === 'flag')
      .map(i => i.jocItem);
    
    if (hasHeightOptions) {
      setPendingItems(totals.checkedItems);
      setShowHeightSelector(true);
    } else {
      onApply(totals.checkedItems, fittingsToCount, fittingsToFlag);
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
    
    // Get fittings selections
    const fittingsToCount = fittingItems
      .filter(i => fittingModes[i.id] === 'count')
      .map(i => i.jocItem);
    const fittingsToFlag = fittingItems
      .filter(i => fittingModes[i.id] === 'flag')
      .map(i => i.jocItem);
    
    setShowHeightSelector(false);
    onApply(finalItems, fittingsToCount, fittingsToFlag);
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

          {/* 🔧 FITTINGS SECTION - Count or Estimate */}
          {fittingItems.length > 0 && (
            <div className="border border-amber-500/30 rounded-xl overflow-hidden">
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/20">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <MousePointer2 className="w-3 h-3" /> Fittings &amp; Accessories
                </h3>
                <p className="text-[10px] text-white/50 mt-1">
                  Choose: use estimate, count on drawing, or flag for later
                </p>
              </div>
              <div className="p-3 space-y-3">
                {fittingItems.map(item => {
                  const mode = fittingModes[item.id] || 'estimate';
                  const estQty = (measurement.value * item.quantityFactor).toFixed(1);
                  
                  return (
                    <div key={item.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80">{item.jocItem.description.split(',')[0]}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            Est: ~{estQty} {item.jocItem.unit} @ ${item.jocItem.unitCost.toFixed(2)} 
                            {item.note && <span className="text-white/30"> • {item.note}</span>}
                          </p>
                        </div>
                        <p className="text-sm text-amber-400/80 font-medium">
                          ${(measurement.value * item.quantityFactor * item.jocItem.unitCost).toFixed(0)}
                        </p>
                      </div>
                      
                      {/* Mode Toggle Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFittingMode(item.id, 'estimate')}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            mode === 'estimate' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          Use Estimate
                        </button>
                        <button
                          onClick={() => setFittingMode(item.id, 'count')}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            mode === 'count' 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <Hash className="w-3 h-3" />
                          Count Now
                        </button>
                        <button
                          onClick={() => setFittingMode(item.id, 'flag')}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                            mode === 'flag' 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <Flag className="w-3 h-3" />
                          Later
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
