import type { Assembly } from '../types';

// ============================================
// FIRE PROTECTION ASSEMBLIES - Division 21
// Comprehensive bundles with all fittings/supports
// ============================================

export const FIRE_PROTECTION_ASSEMBLIES: Assembly[] = [
  // ============================================
  // BLACK STEEL SPRINKLER PIPE
  // ============================================
  {
    id: 'fp-black-steel-1in',
    name: '1" Black Steel Sprinkler Main',
    description: 'Complete 1" Schedule 40 black steel sprinkler pipe with fittings, hangers, and seismic bracing',
    category: 'fire-protection',
    keywords: ['sprinkler', 'pipe', 'black steel', '1 inch', 'fire protection', 'fp', 'main'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0019', description: '1" Schedule 40, Threaded And Coupled, Black Steel Pipe', unit: 'LF', unitCost: 19.45 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0200', description: '1" Black Steel Coupling', unit: 'EA', unitCost: 12.50 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF (pipe joints)',
      },
      {
        jocItem: { taskCode: '23211323-0210', description: '1" Black Steel 90° Elbow', unit: 'EA', unitCost: 15.00 },
        quantityFactor: 0.04,
        notes: 'Direction changes ~every 25 LF',
      },
      {
        jocItem: { taskCode: '23211323-0220', description: '1" Black Steel Tee', unit: 'EA', unitCost: 18.00 },
        quantityFactor: 0.08,
        notes: 'Branch connections for heads',
      },
      {
        jocItem: { taskCode: '23052900-0006', description: '1" Steel Clevis Hanger', unit: 'EA', unitCost: 31.43 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
      {
        jocItem: { taskCode: '23052900-0050', description: 'Seismic Sway Brace, 1" - 2"', unit: 'EA', unitCost: 85.00 },
        quantityFactor: 0.025,
        notes: 'Every 40 LF lateral bracing',
      },
    ],
  },
  {
    id: 'fp-black-steel-1.5in',
    name: '1-1/2" Black Steel Sprinkler Main',
    description: 'Complete 1-1/2" Schedule 40 black steel sprinkler pipe with fittings, hangers, and seismic bracing',
    category: 'fire-protection',
    keywords: ['sprinkler', 'pipe', 'black steel', '1-1/2 inch', 'fire protection', 'fp', 'main'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0021', description: '1-1/2" Schedule 40, Threaded And Coupled, Black Steel Pipe', unit: 'LF', unitCost: 26.85 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0201', description: '1-1/2" Black Steel Coupling', unit: 'EA', unitCost: 16.00 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF (pipe joints)',
      },
      {
        jocItem: { taskCode: '23211323-0211', description: '1-1/2" Black Steel 90° Elbow', unit: 'EA', unitCost: 22.00 },
        quantityFactor: 0.04,
        notes: 'Direction changes',
      },
      {
        jocItem: { taskCode: '23211323-0221', description: '1-1/2" Black Steel Tee', unit: 'EA', unitCost: 28.00 },
        quantityFactor: 0.08,
        notes: 'Branch connections',
      },
      {
        jocItem: { taskCode: '23052900-0008', description: '1-1/2" Steel Clevis Hanger', unit: 'EA', unitCost: 34.67 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
      {
        jocItem: { taskCode: '23052900-0050', description: 'Seismic Sway Brace, 1" - 2"', unit: 'EA', unitCost: 85.00 },
        quantityFactor: 0.025,
        notes: 'Every 40 LF lateral bracing',
      },
    ],
  },
  {
    id: 'fp-black-steel-2in',
    name: '2" Black Steel Sprinkler Main',
    description: 'Complete 2" Schedule 40 black steel sprinkler pipe with fittings, hangers, and seismic bracing',
    category: 'fire-protection',
    keywords: ['sprinkler', 'pipe', 'black steel', '2 inch', 'fire protection', 'fp', 'main'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0022', description: '2" Schedule 40, Threaded And Coupled, Black Steel Pipe', unit: 'LF', unitCost: 32.45 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0202', description: '2" Black Steel Coupling', unit: 'EA', unitCost: 22.00 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF',
      },
      {
        jocItem: { taskCode: '23211323-0212', description: '2" Black Steel 90° Elbow', unit: 'EA', unitCost: 32.00 },
        quantityFactor: 0.04,
        notes: 'Direction changes',
      },
      {
        jocItem: { taskCode: '23211323-0222', description: '2" Black Steel Tee', unit: 'EA', unitCost: 38.00 },
        quantityFactor: 0.08,
        notes: 'Branch connections',
      },
      {
        jocItem: { taskCode: '23052900-0009', description: '2" Steel Clevis Hanger', unit: 'EA', unitCost: 36.89 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
      {
        jocItem: { taskCode: '23052900-0050', description: 'Seismic Sway Brace, 1" - 2"', unit: 'EA', unitCost: 85.00 },
        quantityFactor: 0.025,
        notes: 'Every 40 LF lateral bracing',
      },
    ],
  },
  {
    id: 'fp-black-steel-4in',
    name: '4" Black Steel Sprinkler Main',
    description: 'Complete 4" Schedule 40 black steel sprinkler pipe with fittings, hangers, and seismic bracing',
    category: 'fire-protection',
    keywords: ['sprinkler', 'pipe', 'black steel', '4 inch', 'fire protection', 'fp', 'main', 'riser'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0024', description: '4" Schedule 40, Threaded And Coupled, Black Steel Pipe', unit: 'LF', unitCost: 58.75 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0204', description: '4" Black Steel Coupling', unit: 'EA', unitCost: 65.00 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF',
      },
      {
        jocItem: { taskCode: '23211323-0214', description: '4" Black Steel 90° Elbow', unit: 'EA', unitCost: 95.00 },
        quantityFactor: 0.04,
        notes: 'Direction changes',
      },
      {
        jocItem: { taskCode: '23211323-0224', description: '4" Black Steel Tee', unit: 'EA', unitCost: 125.00 },
        quantityFactor: 0.08,
        notes: 'Branch connections',
      },
      {
        jocItem: { taskCode: '23052900-0012', description: '4" Steel Clevis Hanger', unit: 'EA', unitCost: 52.34 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
      {
        jocItem: { taskCode: '23052900-0052', description: 'Seismic Sway Brace, 3" - 4"', unit: 'EA', unitCost: 145.00 },
        quantityFactor: 0.025,
        notes: 'Every 40 LF lateral bracing',
      },
    ],
  },
  
  // ============================================
  // SPRINKLER HEADS
  // ============================================
  {
    id: 'fp-head-pendent',
    name: 'Pendent Sprinkler Head (Complete)',
    description: 'Pendent sprinkler head with escutcheon, drop nipple, and head guard',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'pendent', 'pendant', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0040', description: 'Sprinkler Head, Pendent, 1/2" NPT, Standard Response, 155°F', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131300-0120', description: 'Escutcheon, Chrome, Adjustable', unit: 'EA', unitCost: 8.50 },
        quantityFactor: 1.0,
        notes: 'One per head',
      },
      {
        jocItem: { taskCode: '21131300-0130', description: 'Sprinkler Drop Nipple, 1/2" x 4"', unit: 'EA', unitCost: 12.00 },
        quantityFactor: 1.0,
        notes: 'Drop from branch line',
      },
      {
        jocItem: { taskCode: '21131300-0150', description: 'Sprinkler Head Guard, Chrome', unit: 'EA', unitCost: 18.00 },
        quantityFactor: 0.1,
        notes: 'Optional - high traffic areas',
      },
    ],
  },
  {
    id: 'fp-head-upright',
    name: 'Upright Sprinkler Head (Complete)',
    description: 'Upright sprinkler head with escutcheon and reducer',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'upright', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0042', description: 'Sprinkler Head, Upright, 1/2" NPT, Standard Response, 155°F', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131300-0120', description: 'Escutcheon, Chrome, Adjustable', unit: 'EA', unitCost: 8.50 },
        quantityFactor: 1.0,
        notes: 'One per head',
      },
      {
        jocItem: { taskCode: '21131300-0155', description: 'Reducer, 1" x 1/2"', unit: 'EA', unitCost: 8.00 },
        quantityFactor: 1.0,
        notes: 'Branch to head connection',
      },
    ],
  },
  {
    id: 'fp-head-sidewall',
    name: 'Sidewall Sprinkler Head (Complete)',
    description: 'Sidewall sprinkler head with escutcheon and horizontal arm',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'sidewall', 'side wall', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0044', description: 'Sprinkler Head, Sidewall, 1/2" NPT, Standard Response', unit: 'EA', unitCost: 55.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131300-0122', description: 'Escutcheon, Chrome, Sidewall', unit: 'EA', unitCost: 12.00 },
        quantityFactor: 1.0,
        notes: 'One per head',
      },
      {
        jocItem: { taskCode: '21131300-0135', description: 'Horizontal Arm, 1/2" x 6"', unit: 'EA', unitCost: 15.00 },
        quantityFactor: 1.0,
        notes: 'Wall to head connection',
      },
    ],
  },
  {
    id: 'fp-head-concealed',
    name: 'Concealed Sprinkler Head (Complete)',
    description: 'Concealed sprinkler head with cover plate and recessed escutcheon',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'concealed', 'hidden', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0046', description: 'Sprinkler Head, Concealed, 1/2" NPT, Quick Response', unit: 'EA', unitCost: 85.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131300-0125', description: 'Cover Plate, Concealed, White', unit: 'EA', unitCost: 15.00 },
        quantityFactor: 1.0,
        notes: 'Decorative cover',
      },
      {
        jocItem: { taskCode: '21131300-0130', description: 'Sprinkler Drop Nipple, 1/2" x 4"', unit: 'EA', unitCost: 12.00 },
        quantityFactor: 1.0,
      },
    ],
  },
  
  // ============================================
  // FIRE PROTECTION SPECIALTIES
  // ============================================
  {
    id: 'fp-fdc',
    name: 'Fire Department Connection (FDC)',
    description: 'Complete FDC assembly with siamese, check valves, and PIV',
    category: 'fire-protection',
    keywords: ['fdc', 'fire department connection', 'siamese', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131900-0010', description: 'Fire Department Connection, Wall Mount, 2-1/2" x 2-1/2" x 4"', unit: 'EA', unitCost: 485.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131900-0020', description: 'Check Valve, 4" Swing Type', unit: 'EA', unitCost: 325.00 },
        quantityFactor: 1.0,
        notes: 'Backflow prevention',
      },
      {
        jocItem: { taskCode: '21131900-0025', description: 'FDC Sign, Reflective', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131900-0030', description: 'PIV, Post Indicator Valve, 4"', unit: 'EA', unitCost: 650.00 },
        quantityFactor: 1.0,
        notes: 'System isolation',
      },
    ],
  },
  {
    id: 'fp-alarm-valve',
    name: 'Alarm Valve Assembly',
    description: 'Complete alarm valve with pressure switch, flow switch, and trim',
    category: 'fire-protection',
    keywords: ['alarm', 'valve', 'wet', 'riser', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131600-0010', description: 'Alarm Check Valve, 4"', unit: 'EA', unitCost: 1250.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131600-0020', description: 'Pressure Switch, System', unit: 'EA', unitCost: 185.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131600-0025', description: 'Water Flow Switch, Vane Type', unit: 'EA', unitCost: 225.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131600-0030', description: 'Alarm Valve Trim Kit', unit: 'EA', unitCost: 350.00 },
        quantityFactor: 1.0,
        notes: 'Gauges, drains, test connections',
      },
      {
        jocItem: { taskCode: '21131600-0040', description: 'Water Motor Gong', unit: 'EA', unitCost: 275.00 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-standpipe',
    name: 'Standpipe Riser (Per Floor)',
    description: 'Complete standpipe riser with hose valve, cabinet, and signage',
    category: 'fire-protection',
    keywords: ['standpipe', 'riser', 'hose', 'valve', 'cabinet', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0024', description: '4" Schedule 40, Black Steel Pipe', unit: 'LF', unitCost: 58.75 },
        quantityFactor: 12.0,
        notes: 'Typical floor height',
      },
      {
        jocItem: { taskCode: '21131700-0010', description: 'Hose Valve, 2-1/2" Angle', unit: 'EA', unitCost: 185.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131700-0020', description: 'Fire Hose Cabinet, Recessed, 24" x 30"', unit: 'EA', unitCost: 425.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21131700-0030', description: 'Standpipe Sign', unit: 'EA', unitCost: 35.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23052900-0012', description: '4" Riser Clamp', unit: 'EA', unitCost: 52.34 },
        quantityFactor: 2.0,
        notes: 'Top and bottom support',
      },
    ],
  },
];
