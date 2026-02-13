import type { Assembly } from '../types';

// ============================================
// FIRE PROTECTION ASSEMBLIES - Division 21
// Updated with verified H+H catalogue codes
// Based on real FP contractor takeoff methodology
// ============================================

export const FIRE_PROTECTION_ASSEMBLIES: Assembly[] = [
  // ============================================
  // BLACK STEEL SPRINKLER PIPE
  // ============================================
  {
    id: 'fp-black-steel-1in',
    name: '1" Black Steel Sprinkler Pipe',
    description: 'Complete 1" Schedule 40 black steel sprinkler pipe with fittings and hangers',
    category: 'fire-protection',
    keywords: ['sprinkler', 'pipe', 'black steel', '1 inch', 'fire protection', 'fp', 'branch'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0019', description: '1" Schedule 40, Threaded And Coupled, Black Steel Pipe', unit: 'LF', unitCost: 19.45 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0175', description: '1" x Close, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 24.60 },
        quantityFactor: 0.10,
        notes: 'Joints every 10 LF',
      },
      {
        jocItem: { taskCode: '23052900-0006', description: '1" Steel Clevis Hanger', unit: 'EA', unitCost: 31.43 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
    ],
  },
  {
    id: 'fp-black-steel-2in',
    name: '2" Black Steel Sprinkler Pipe',
    description: 'Complete 2" Schedule 40 black steel sprinkler main with fittings and hangers',
    category: 'fire-protection',
    keywords: ['sprinkler', 'pipe', 'black steel', '2 inch', 'fire protection', 'fp', 'main'],
    applicableTo: ['line', 'polyline'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0022', description: '2" Schedule 40, Threaded And Coupled, Black Steel Pipe', unit: 'LF', unitCost: 35.20 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0178', description: '2" x Close, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 28.50 },
        quantityFactor: 0.10,
        notes: 'Joints every 10 LF',
      },
      {
        jocItem: { taskCode: '23052900-0010', description: '2" Steel Clevis Hanger', unit: 'EA', unitCost: 38.52 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
    ],
  },
  {
    id: 'fp-black-steel-4in',
    name: '4" Black Steel Sprinkler Main',
    description: 'Complete 4" Schedule 40 black steel sprinkler main with fittings and hangers',
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
        jocItem: { taskCode: '23211323-0181', description: '4" x Close, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 45.00 },
        quantityFactor: 0.10,
        notes: 'Joints every 10 LF',
      },
      {
        jocItem: { taskCode: '23052900-0012', description: '4" Steel Clevis Hanger', unit: 'EA', unitCost: 52.34 },
        quantityFactor: 0.10,
        notes: 'Every 10 LF per NFPA 13',
      },
    ],
  },
  
  // ============================================
  // SPRINKLER HEADS (with drops - per real FP takeoff)
  // ============================================
  {
    id: 'fp-head-pendent',
    name: 'Pendent Sprinkler Head (Complete)',
    description: 'Pendent sprinkler head with drop nipple - includes all labor',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'pendent', 'pendant', 'fire', 'fp', 'drop'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0074', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Pendent Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 101.97 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0183', description: '1/2" x 1-1/2" Long, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 24.60 },
        quantityFactor: 1.0,
        notes: 'Drop nipple from branch line',
      },
    ],
  },
  {
    id: 'fp-head-upright',
    name: 'Upright Sprinkler Head (Complete)',
    description: 'Upright sprinkler head - typically direct to branch, no drop needed',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'upright', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0024', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Upright Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 100.49 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-head-sidewall',
    name: 'Sidewall Sprinkler Head (Complete)',
    description: 'Sidewall sprinkler head with arm-over piping',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'sidewall', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0094', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Horizontal Sidewall Brass Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 104.49 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0183', description: '1/2" x 1-1/2" Long, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 24.60 },
        quantityFactor: 2.0,
        notes: 'Arm-over requires 2 nipples',
      },
    ],
  },
  {
    id: 'fp-head-concealed',
    name: 'Concealed Sprinkler Head (Complete)',
    description: 'Concealed sprinkler head with cover plate and drop',
    category: 'fire-protection',
    keywords: ['sprinkler', 'head', 'concealed', 'hidden', 'fire', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0115', description: '1/2" NPT Thread, 1/2" Orifice, K=5.6, Quick Response, Concealed White Wet Pipe Sprinkler Head', unit: 'EA', unitCost: 149.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '23211323-0183', description: '1/2" x 1-1/2" Long, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 24.60 },
        quantityFactor: 1.0,
        notes: 'Drop nipple',
      },
    ],
  },

  // ============================================
  // VALVES & DEVICES (from real FP takeoff)
  // ============================================
  {
    id: 'fp-alarm-check-valve',
    name: '4" Alarm Check Valve Assembly',
    description: 'Wet pipe alarm check valve with trim - main riser',
    category: 'fire-protection',
    keywords: ['alarm', 'check', 'valve', 'riser', 'fire', 'fp', 'wet pipe'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21131300-0015', description: '4" Wet Pipe Alarm Check Valve', unit: 'EA', unitCost: 2634.10 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21122900-0004', description: 'Fire Riser Flow Switch (National Fire Protection Association 13)', unit: 'EA', unitCost: 1560.46 },
        quantityFactor: 1.0,
        notes: 'Required per NFPA 13',
      },
    ],
  },
  {
    id: 'fp-flow-switch',
    name: 'Water Flow Switch',
    description: 'Flow switch for sprinkler system monitoring',
    category: 'fire-protection',
    keywords: ['flow', 'switch', 'water', 'fire', 'alarm', 'fp', 'wf'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21122900-0004', description: 'Fire Riser Flow Switch (National Fire Protection Association 13)', unit: 'EA', unitCost: 1560.46 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-tamper-switch',
    name: 'Tamper Switch (Valve Supervisory)',
    description: 'Supervisory tamper switch for valve position monitoring',
    category: 'fire-protection',
    keywords: ['tamper', 'switch', 'supervisory', 'valve', 'fire', 'alarm', 'fp', 'os&y'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21122900-0005', description: 'Water Flow Supervisory (Tamper) Switch Mounted On Valve', unit: 'EA', unitCost: 274.79 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-osny-valve-4in',
    name: '4" OS&Y Gate Valve w/Tamper',
    description: 'Outside Screw & Yoke gate valve with tamper switch',
    category: 'fire-protection',
    keywords: ['os&y', 'gate', 'valve', 'tamper', 'fire', 'fp', 'control'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22052300-0020', description: '4" Diameter, 125 LB Flanged Cast Iron Gate Valve', unit: 'EA', unitCost: 892.00 },
        quantityFactor: 1.0,
      },
      {
        jocItem: { taskCode: '21122900-0005', description: 'Water Flow Supervisory (Tamper) Switch Mounted On Valve', unit: 'EA', unitCost: 274.79 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-prv',
    name: 'Pressure Reducing Valve (2")',
    description: '2" Water pressure reducing valve for high-rise zones',
    category: 'fire-protection',
    keywords: ['pressure', 'reducing', 'valve', 'prv', 'fire', 'fp', 'zone'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '22113400-0006', description: '2" Screwed Ends, Iron Construction, Water Pressure Reducing Valve', unit: 'EA', unitCost: 1245.00 },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // FIRE DEPARTMENT CONNECTION
  // ============================================
  {
    id: 'fp-fdc',
    name: 'Fire Department Connection (FDC)',
    description: 'Siamese connection with check valves for fire department use',
    category: 'fire-protection',
    keywords: ['fdc', 'siamese', 'fire department', 'connection', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '21111913-0025', description: 'Wall Mounted, Two Way, Clapper Type, Fire Department Siamese', unit: 'EA', unitCost: 1856.00 },
        quantityFactor: 1.0,
      },
    ],
  },

  // ============================================
  // SPRINKLER DROP (standalone for custom drops)
  // Used when measuring individual drops like FP contractor
  // ============================================
  {
    id: 'fp-drop-short',
    name: 'Sprinkler Drop (Short 4"-8")',
    description: 'Short drop nipple from branch to head - typical ceiling height',
    category: 'fire-protection',
    keywords: ['drop', 'nipple', 'short', 'u', 'upright', 'sprinkler', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0183', description: '1/2" x 1-1/2" Long, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 24.60 },
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'fp-drop-medium',
    name: 'Sprinkler Drop (Medium 8"-18")',
    description: 'Medium drop from branch to head - high ceilings',
    category: 'fire-protection',
    keywords: ['drop', 'nipple', 'medium', 'u', 'sprinkler', 'fp'],
    applicableTo: ['count'],
    createdBy: 'system',
    items: [
      {
        jocItem: { taskCode: '23211323-0173', description: '1/2" x Close, Schedule 40 Black Steel Nipple', unit: 'EA', unitCost: 24.60 },
        quantityFactor: 2.0,
        notes: 'Two nipples with coupling for 8-18" drop',
      },
    ],
  },
];

export default FIRE_PROTECTION_ASSEMBLIES;
