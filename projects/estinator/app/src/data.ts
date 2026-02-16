import type { Room, Insight, Document, Project } from './types';

export const mockProject: Project = {
  id: '1',
  name: 'Bellevue Hospital Renovation',
  description: '15th Floor Cardiology Wing',
  rooms: 25,
  doors: 48,
  issues: 7,
  documents: 12,
  lastUpdated: '2 hours ago',
  thumbnail: '🏥',
};

export const mockRooms: Room[] = [
  {
    id: '101',
    number: '101',
    name: 'Patient Room',
    area: 180,
    finishes: {
      floor: 'VCT',
      walls: 'Painted GWB',
      ceiling: 'ACT',
    },
    doors: [
      { id: '101-a', number: '101-A', size: "3'6\"×7'0\"", type: 'HM' },
      { id: '101-b', number: '101-B', size: "3'0\"×7'0\"", type: 'HM' },
    ],
    issues: 2,
    thumbnail: '🛏️',
  },
  {
    id: '102',
    number: '102',
    name: 'Patient Room',
    area: 180,
    finishes: {
      floor: 'VCT',
      walls: 'Painted GWB',
      ceiling: 'ACT',
    },
    doors: [
      { id: '102-a', number: '102-A', size: "3'6\"×7'0\"", type: 'HM', hardware: 'Set 1' },
      { id: '102-b', number: '102-B', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 2' },
    ],
    issues: 0,
    thumbnail: '🛏️',
  },
  {
    id: '103',
    number: '103',
    name: 'Nurse Station',
    area: 320,
    finishes: {
      floor: 'Resilient',
      walls: 'Painted GWB',
      ceiling: 'ACT',
    },
    doors: [
      { id: '103-a', number: '103-A', size: "4'0\"×7'0\"", type: 'HM' },
      { id: '103-b', number: '103-B', size: "3'0\"×7'0\"", type: 'HM' },
      { id: '103-c', number: '103-C', size: "3'0\"×7'0\"", type: 'HM' },
    ],
    issues: 3,
    thumbnail: '👩‍⚕️',
  },
  {
    id: '104',
    number: '104',
    name: 'Exam Room',
    area: 120,
    finishes: {
      floor: 'VCT',
      walls: 'Painted GWB',
      ceiling: 'ACT',
    },
    doors: [
      { id: '104-a', number: '104-A', size: "3'6\"×7'0\"", type: 'HM' },
    ],
    issues: 1,
    thumbnail: '🩺',
  },
  {
    id: '105',
    number: '105',
    name: 'Storage',
    area: 80,
    finishes: {
      floor: 'Concrete',
      walls: 'Painted CMU',
      ceiling: 'Exposed',
    },
    doors: [
      { id: '105-a', number: '105-A', size: "3'0\"×7'0\"", type: 'HM', hardware: 'Set 3' },
    ],
    issues: 0,
    thumbnail: '📦',
  },
  {
    id: '106',
    number: '106',
    name: 'Restroom',
    area: 60,
    finishes: {
      floor: 'Tile',
      walls: 'Tile',
      ceiling: 'GWB',
    },
    doors: [
      { id: '106-a', number: '106-A', size: "2'8\"×7'0\"", type: 'HM' },
    ],
    issues: 1,
    thumbnail: '🚻',
  },
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    severity: 'critical',
    category: 'Missing Hardware',
    title: '3 Doors Missing Hardware Specs',
    description: 'Doors 101-A, 101-B, and 103-A have no hardware set assigned in the hardware schedule.',
    roomNumbers: ['101', '103'],
    action: 'Generate RFI',
  },
  {
    id: '2',
    severity: 'warning',
    category: 'Scope Gap',
    title: 'Plumbing Fixtures Missing',
    description: 'Room 106 (Restroom) has no plumbing fixtures scheduled despite being a restroom.',
    roomNumbers: ['106'],
    action: 'Generate RFI',
  },
  {
    id: '3',
    severity: 'warning',
    category: 'Finish Mismatch',
    title: 'Ceiling Type Conflict',
    description: 'Room 103 ceiling specified as ACT in finish schedule but GWB in reflected ceiling plan.',
    roomNumbers: ['103'],
    action: 'View Conflict',
  },
  {
    id: '4',
    severity: 'info',
    category: 'Addendum',
    title: 'Addendum 2 Detected',
    description: 'Window quantity changed from 25 to 32. Review impact on aluminum work.',
    action: 'View Changes',
  },
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'A-101 First Floor Plan.pdf',
    type: 'drawing',
    status: 'analyzed',
    size: '2.4 MB',
    thumbnail: '📐',
  },
  {
    id: '2',
    name: 'A-102 Finish Schedule.pdf',
    type: 'drawing',
    status: 'analyzed',
    size: '1.1 MB',
    thumbnail: '📋',
  },
  {
    id: '3',
    name: 'A-103 Door Schedule.pdf',
    type: 'drawing',
    status: 'analyzed',
    size: '0.8 MB',
    issues: 3,
    thumbnail: '🚪',
  },
  {
    id: '4',
    name: '087100 Door Hardware.pdf',
    type: 'spec',
    status: 'analyzed',
    size: '1.5 MB',
    issues: 3,
    thumbnail: '🔧',
  },
  {
    id: '5',
    name: 'Addendum 2.pdf',
    type: 'addendum',
    status: 'analyzed',
    size: '0.3 MB',
    thumbnail: '📝',
  },
];
