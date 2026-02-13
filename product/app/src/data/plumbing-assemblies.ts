import type { Assembly } from '../types';

// ============================================
// PLUMBING ASSEMBLIES - Division 22
// Comprehensive bundles with all fittings/supports
// ============================================

export const PLUMBING_ASSEMBLIES: Assembly[] = [
  // ============================================
  // COPPER DOMESTIC WATER PIPE
  // ============================================
  {
    id: 'pl-copper-0.5in',
    name: '1/2" Copper Water Line (Complete)',
    description: 'Complete 1/2" Type L copper water line with fittings, hangers, and insulation',
    category: 'plumbing',
    keywords: ['copper', 'pipe', 'water', '1/2 inch', 'domestic', 'type l', 'plumbing'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22111600-0388', description: '1/2" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 7.85 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22111600-0526', description: '1/2" Copper Coupling', unit: 'EA', unitCost: 50.95 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF (pipe joints)',
      },
      {
        jocItem: { taskCode: '22111600-0454', description: '1/2" 90° Copper Elbow', unit: 'EA', unitCost: 51.46 },
        quantityFactor: 0.05,
        notes: 'Direction changes ~every 20 LF',
      },
      {
        jocItem: { taskCode: '22111600-0455', description: '1/2" 45° Copper Elbow', unit: 'EA', unitCost: 48.00 },
        quantityFactor: 0.025,
        notes: 'Offset routing',
      },
      {
        jocItem: { taskCode: '22111600-0490', description: '1/2" Copper Tee', unit: 'EA', unitCost: 55.00 },
        quantityFactor: 0.02,
        notes: 'Branch connections ~every 50 LF',
      },
      {
        jocItem: { taskCode: '22052900-0010', description: '1/2" Copper Pipe Hanger', unit: 'EA', unitCost: 8.50 },
        quantityFactor: 0.125,
        notes: 'Every 8 LF horizontal',
      },
      {
        jocItem: { taskCode: '22071900-0010', description: '1/2" Pipe Insulation, 1" Thick', unit: 'LF', unitCost: 4.25 },
        quantityFactor: 1.0,
        notes: 'Hot and cold water lines',
      },
      {
        jocItem: { taskCode: '22071900-0050', description: '1/2" Insulation Fitting Cover', unit: 'EA', unitCost: 6.00 },
        quantityFactor: 0.15,
        notes: 'Cover each fitting',
      },
    ],
  },
  {
    id: 'pl-copper-0.75in',
    name: '3/4" Copper Water Line (Complete)',
    description: 'Complete 3/4" Type L copper water line with fittings, hangers, and insulation',
    category: 'plumbing',
    keywords: ['copper', 'pipe', 'water', '3/4 inch', 'domestic', 'type l', 'plumbing'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22111600-0389', description: '3/4" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 11.45 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22111600-0527', description: '3/4" Copper Coupling', unit: 'EA', unitCost: 55.00 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF',
      },
      {
        jocItem: { taskCode: '22111600-0456', description: '3/4" 90° Copper Elbow', unit: 'EA', unitCost: 56.00 },
        quantityFactor: 0.05,
        notes: 'Direction changes',
      },
      {
        jocItem: { taskCode: '22111600-0457', description: '3/4" 45° Copper Elbow', unit: 'EA', unitCost: 52.00 },
        quantityFactor: 0.025,
      },
      {
        jocItem: { taskCode: '22111600-0491', description: '3/4" Copper Tee', unit: 'EA', unitCost: 62.00 },
        quantityFactor: 0.02,
      },
      {
        jocItem: { taskCode: '22052900-0011', description: '3/4" Copper Pipe Hanger', unit: 'EA', unitCost: 9.25 },
        quantityFactor: 0.125,
      },
      {
        jocItem: { taskCode: '22071900-0011', description: '3/4" Pipe Insulation, 1" Thick', unit: 'LF', unitCost: 4.85 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22071900-0051', description: '3/4" Insulation Fitting Cover', unit: 'EA', unitCost: 6.50 },
        quantityFactor: 0.15,
      },
    ],
  },
  {
    id: 'pl-copper-1in',
    name: '1" Copper Water Line (Complete)',
    description: 'Complete 1" Type L copper water line with fittings, hangers, and insulation',
    category: 'plumbing',
    keywords: ['copper', 'pipe', 'water', '1 inch', 'domestic', 'type l', 'plumbing'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22111600-0390', description: '1" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 18.25 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22111600-0528', description: '1" Copper Coupling', unit: 'EA', unitCost: 65.00 },
        quantityFactor: 0.10,
      },
      {
        jocItem: { taskCode: '22111600-0458', description: '1" 90° Copper Elbow', unit: 'EA', unitCost: 68.00 },
        quantityFactor: 0.05,
      },
      {
        jocItem: { taskCode: '22111600-0459', description: '1" 45° Copper Elbow', unit: 'EA', unitCost: 62.00 },
        quantityFactor: 0.025,
      },
      {
        jocItem: { taskCode: '22111600-0492', description: '1" Copper Tee', unit: 'EA', unitCost: 75.00 },
        quantityFactor: 0.02,
      },
      {
        jocItem: { taskCode: '22052900-0012', description: '1" Copper Pipe Hanger', unit: 'EA', unitCost: 10.50 },
        quantityFactor: 0.125,
      },
      {
        jocItem: { taskCode: '22071900-0012', description: '1" Pipe Insulation, 1" Thick', unit: 'LF', unitCost: 5.45 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22071900-0052', description: '1" Insulation Fitting Cover', unit: 'EA', unitCost: 7.25 },
        quantityFactor: 0.15,
      },
    ],
  },
  {
    id: 'pl-copper-2in',
    name: '2" Copper Water Line (Complete)',
    description: 'Complete 2" Type L copper water line with fittings, hangers, and insulation',
    category: 'plumbing',
    keywords: ['copper', 'pipe', 'water', '2 inch', 'domestic', 'type l', 'plumbing'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22111600-0392', description: '2" Hard Drawn Type L Copper Tube/Pipe', unit: 'LF', unitCost: 42.50 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22111600-0530', description: '2" Copper Coupling', unit: 'EA', unitCost: 95.00 },
        quantityFactor: 0.10,
      },
      {
        jocItem: { taskCode: '22111600-0462', description: '2" 90° Copper Elbow', unit: 'EA', unitCost: 105.00 },
        quantityFactor: 0.05,
      },
      {
        jocItem: { taskCode: '22111600-0463', description: '2" 45° Copper Elbow', unit: 'EA', unitCost: 95.00 },
        quantityFactor: 0.025,
      },
      {
        jocItem: { taskCode: '22111600-0496', description: '2" Copper Tee', unit: 'EA', unitCost: 125.00 },
        quantityFactor: 0.02,
      },
      {
        jocItem: { taskCode: '22052900-0014', description: '2" Copper Pipe Hanger', unit: 'EA', unitCost: 14.50 },
        quantityFactor: 0.125,
      },
      {
        jocItem: { taskCode: '22071900-0014', description: '2" Pipe Insulation, 1" Thick', unit: 'LF', unitCost: 7.85 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22071900-0054', description: '2" Insulation Fitting Cover', unit: 'EA', unitCost: 9.50 },
        quantityFactor: 0.15,
      },
    ],
  },
  
  // ============================================
  // CAST IRON DWV PIPE
  // ============================================
  {
    id: 'pl-ci-2in',
    name: '2" Cast Iron DWV (Complete)',
    description: 'Complete 2" no-hub cast iron waste pipe with couplings, hangers, and cleanouts',
    category: 'plumbing',
    keywords: ['cast iron', 'ci', 'dwv', 'waste', 'drain', '2 inch', 'no-hub', 'plumbing'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22131100-0020', description: '2" No-Hub Cast Iron Soil Pipe', unit: 'LF', unitCost: 18.50 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131100-0120', description: '2" No-Hub Coupling', unit: 'EA', unitCost: 22.00 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF (5-foot sticks)',
      },
      {
        jocItem: { taskCode: '22131100-0200', description: '2" Cast Iron Cleanout w/ Brass Plug', unit: 'EA', unitCost: 85.00 },
        quantityFactor: 0.01,
        notes: 'Every 100 LF per code',
      },
      {
        jocItem: { taskCode: '22052900-0020', description: '2" Cast Iron Pipe Hanger', unit: 'EA', unitCost: 15.00 },
        quantityFactor: 0.125,
        notes: 'Every 8 LF horizontal',
      },
      {
        jocItem: { taskCode: '22131100-0250', description: '2" Test Tee', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 0.01,
        notes: 'Testing connections',
      },
    ],
  },
  {
    id: 'pl-ci-3in',
    name: '3" Cast Iron DWV (Complete)',
    description: 'Complete 3" no-hub cast iron waste pipe with couplings, hangers, and cleanouts',
    category: 'plumbing',
    keywords: ['cast iron', 'ci', 'dwv', 'waste', 'drain', '3 inch', 'no-hub', 'plumbing'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22131100-0030', description: '3" No-Hub Cast Iron Soil Pipe', unit: 'LF', unitCost: 24.75 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131100-0130', description: '3" No-Hub Coupling', unit: 'EA', unitCost: 28.00 },
        quantityFactor: 0.10,
      },
      {
        jocItem: { taskCode: '22131100-0210', description: '3" Cast Iron Cleanout w/ Brass Plug', unit: 'EA', unitCost: 105.00 },
        quantityFactor: 0.01,
      },
      {
        jocItem: { taskCode: '22052900-0030', description: '3" Cast Iron Pipe Hanger', unit: 'EA', unitCost: 18.00 },
        quantityFactor: 0.125,
      },
      {
        jocItem: { taskCode: '22131100-0260', description: '3" Test Tee', unit: 'EA', unitCost: 55.00 },
        quantityFactor: 0.01,
      },
    ],
  },
  {
    id: 'pl-ci-4in',
    name: '4" Cast Iron DWV (Complete)',
    description: 'Complete 4" no-hub cast iron waste pipe with couplings, hangers, and cleanouts',
    category: 'plumbing',
    keywords: ['cast iron', 'ci', 'dwv', 'waste', 'drain', '4 inch', 'no-hub', 'plumbing', 'stack'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22131100-0040', description: '4" No-Hub Cast Iron Soil Pipe', unit: 'LF', unitCost: 32.50 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131100-0140', description: '4" No-Hub Coupling', unit: 'EA', unitCost: 35.00 },
        quantityFactor: 0.10,
      },
      {
        jocItem: { taskCode: '22131100-0220', description: '4" Cast Iron Cleanout w/ Brass Plug', unit: 'EA', unitCost: 135.00 },
        quantityFactor: 0.01,
      },
      {
        jocItem: { taskCode: '22052900-0040', description: '4" Cast Iron Pipe Hanger', unit: 'EA', unitCost: 22.00 },
        quantityFactor: 0.125,
      },
      {
        jocItem: { taskCode: '22131100-0270', description: '4" Test Tee', unit: 'EA', unitCost: 68.00 },
        quantityFactor: 0.01,
      },
    ],
  },
  
  // ============================================
  // FIXTURES - COMPLETE ROUGH-IN
  // ============================================
  {
    id: 'pl-lavatory-wall',
    name: 'Lavatory (Wall Mount) - Complete',
    description: 'Complete wall-mounted lavatory with rough-in, trim, and accessories',
    category: 'plumbing',
    keywords: ['lavatory', 'lav', 'sink', 'wall mount', 'bathroom', 'plumbing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22421613-0005', description: '20" x 18" Vitreous China Wall Hung Lavatory', unit: 'EA', unitCost: 285.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421613-0100', description: 'Lavatory Faucet, Single Handle, Chrome', unit: 'EA', unitCost: 165.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421613-0110', description: 'Supply Stop, 1/2" x 3/8" Angle', unit: 'EA', unitCost: 28.00 },
        quantityFactor: 2.0,
        notes: 'Hot and cold',
      },
      {
        jocItem: { taskCode: '22421613-0115', description: 'Supply Tube, 3/8" x 12" Braided', unit: 'EA', unitCost: 12.00 },
        quantityFactor: 2.0,
        notes: 'Hot and cold',
      },
      {
        jocItem: { taskCode: '22421613-0120', description: 'P-Trap, 1-1/4" Chrome', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421613-0125', description: 'Drain Tailpiece, 1-1/4"', unit: 'EA', unitCost: 18.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421613-0130', description: 'Escutcheon, Chrome, 1/2"', unit: 'EA', unitCost: 8.00 },
        quantityFactor: 2.0,
        notes: 'Supply line covers',
      },
      {
        jocItem: { taskCode: '22421613-0135', description: 'Wall Carrier, Lavatory', unit: 'EA', unitCost: 185.00 },
        quantityFactor: 1.0,
        notes: 'Concealed support',
      },
    ],
  },
  {
    id: 'pl-wc-floor',
    name: 'Water Closet (Floor Mount) - Complete',
    description: 'Complete floor-mounted water closet with rough-in and trim',
    category: 'plumbing',
    keywords: ['water closet', 'wc', 'toilet', 'floor mount', 'bathroom', 'plumbing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22421316-0010', description: 'Floor Mounted Water Closet, Elongated, 1.28 GPF', unit: 'EA', unitCost: 385.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421316-0100', description: 'Toilet Seat, Elongated, White', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421316-0110', description: 'Supply Stop, 1/2" x 3/8" Angle', unit: 'EA', unitCost: 28.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421316-0115', description: 'Supply Tube, 3/8" x 12" Braided', unit: 'EA', unitCost: 12.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421316-0120', description: 'Wax Ring w/ Flange', unit: 'EA', unitCost: 8.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421316-0125', description: 'Closet Bolts, Brass', unit: 'EA', unitCost: 6.00 },
        quantityFactor: 2.0,
      },
      {
        jocItem: { taskCode: '22421316-0130', description: 'Closet Flange, PVC, 4" x 3"', unit: 'EA', unitCost: 22.00 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'pl-urinal-wall',
    name: 'Urinal (Wall Mount) - Complete',
    description: 'Complete wall-mounted urinal with flush valve and carrier',
    category: 'plumbing',
    keywords: ['urinal', 'wall mount', 'bathroom', 'mens', 'plumbing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22421519-0010', description: 'Wall Mounted Urinal, Vitreous China, 0.5 GPF', unit: 'EA', unitCost: 425.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421519-0100', description: 'Flush Valve, Manual, 0.5 GPF', unit: 'EA', unitCost: 285.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421519-0110', description: 'Urinal Carrier, Concealed', unit: 'EA', unitCost: 245.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421519-0120', description: 'P-Trap, 2" Chrome', unit: 'EA', unitCost: 65.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22421519-0125', description: 'Stop Valve, 1" Angle', unit: 'EA', unitCost: 55.00 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'pl-floor-drain',
    name: 'Floor Drain (Complete)',
    description: 'Complete floor drain with trap primer connection',
    category: 'plumbing',
    keywords: ['floor drain', 'drain', 'fd', 'plumbing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22131600-0010', description: 'Floor Drain, 4" Bronze Top', unit: 'EA', unitCost: 165.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131600-0020', description: 'Floor Drain Strainer, 6" Round', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131600-0030', description: 'P-Trap, 4" Cast Iron', unit: 'EA', unitCost: 85.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131600-0040', description: 'Trap Primer Connection', unit: 'EA', unitCost: 35.00 },
        quantityFactor: 1.0,
        notes: 'Code requirement for floor drains',
      },
    ],
  },
  {
    id: 'pl-cleanout',
    name: 'Cleanout Assembly',
    description: 'Complete cleanout with plug and access cover',
    category: 'plumbing',
    keywords: ['cleanout', 'co', 'access', 'plumbing'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22131700-0010', description: '4" Cleanout Body, Cast Iron', unit: 'EA', unitCost: 65.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131700-0020', description: '4" Cleanout Plug, Brass', unit: 'EA', unitCost: 28.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '22131700-0030', description: 'Cleanout Access Cover, 6" Round', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
    ],
  },
];
