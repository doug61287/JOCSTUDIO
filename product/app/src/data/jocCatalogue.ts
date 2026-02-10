import type { JOCItem } from '../types';

export const jocCatalogue: JOCItem[] = [
  // Division 21 - Fire Suppression
  { code: '21 31 13.13 0020', description: 'Sprinkler Head, Pendant, 1/2"', unit: 'EA', unitPrice: 115.00, division: '21' },
  { code: '21 31 13.13 0030', description: 'Sprinkler Head, Upright, 1/2"', unit: 'EA', unitPrice: 115.00, division: '21' },
  { code: '21 31 13.13 0040', description: 'Sprinkler Head, Sidewall, 1/2"', unit: 'EA', unitPrice: 125.00, division: '21' },
  { code: '21 31 13.13 0050', description: 'Sprinkler Head, Concealed, 1/2"', unit: 'EA', unitPrice: 145.00, division: '21' },
  { code: '21 13 13.10 0100', description: 'Steel Pipe, Schedule 40, 1"', unit: 'LF', unitPrice: 11.00, division: '21' },
  { code: '21 13 13.10 0120', description: 'Steel Pipe, Schedule 40, 1-1/4"', unit: 'LF', unitPrice: 13.00, division: '21' },
  { code: '21 13 13.10 0140', description: 'Steel Pipe, Schedule 40, 1-1/2"', unit: 'LF', unitPrice: 15.00, division: '21' },
  { code: '21 13 13.10 0160', description: 'Steel Pipe, Schedule 40, 2"', unit: 'LF', unitPrice: 18.00, division: '21' },
  { code: '21 13 13.10 0180', description: 'Steel Pipe, Schedule 40, 2-1/2"', unit: 'LF', unitPrice: 22.00, division: '21' },
  { code: '21 13 16.10 0200', description: 'Pipe Fittings, Elbows & Tees', unit: 'LS', unitPrice: 1200.00, division: '21' },
  { code: '21 13 19.10 0100', description: 'Pipe Hangers & Supports', unit: 'EA', unitPrice: 32.00, division: '21' },
  
  // Division 22 - Plumbing
  { code: '22 11 13.10 0100', description: 'Copper Pipe, Type L, 1/2"', unit: 'LF', unitPrice: 8.50, division: '22' },
  { code: '22 11 13.10 0120', description: 'Copper Pipe, Type L, 3/4"', unit: 'LF', unitPrice: 11.00, division: '22' },
  { code: '22 11 13.10 0140', description: 'Copper Pipe, Type L, 1"', unit: 'LF', unitPrice: 14.50, division: '22' },
  { code: '22 41 13.10 0100', description: 'Water Closet, Floor Mount', unit: 'EA', unitPrice: 450.00, division: '22' },
  { code: '22 41 16.10 0100', description: 'Urinal, Wall Hung', unit: 'EA', unitPrice: 380.00, division: '22' },
  { code: '22 41 19.10 0100', description: 'Lavatory, Wall Mount', unit: 'EA', unitPrice: 320.00, division: '22' },
  
  // Division 23 - HVAC
  { code: '23 31 13.10 0100', description: 'Ductwork, Galvanized, 12"x12"', unit: 'LF', unitPrice: 28.00, division: '23' },
  { code: '23 31 13.10 0120', description: 'Ductwork, Galvanized, 16"x12"', unit: 'LF', unitPrice: 32.00, division: '23' },
  { code: '23 31 13.10 0140', description: 'Ductwork, Galvanized, 20"x12"', unit: 'LF', unitPrice: 38.00, division: '23' },
  { code: '23 37 13.10 0100', description: 'Diffuser, Ceiling, 24"x24"', unit: 'EA', unitPrice: 145.00, division: '23' },
  { code: '23 37 13.10 0120', description: 'Register, Wall, 12"x6"', unit: 'EA', unitPrice: 65.00, division: '23' },
  
  // Division 26 - Electrical
  { code: '26 05 19.10 0100', description: 'Conduit, EMT, 1/2"', unit: 'LF', unitPrice: 4.50, division: '26' },
  { code: '26 05 19.10 0120', description: 'Conduit, EMT, 3/4"', unit: 'LF', unitPrice: 5.50, division: '26' },
  { code: '26 05 19.10 0140', description: 'Conduit, EMT, 1"', unit: 'LF', unitPrice: 7.00, division: '26' },
  { code: '26 27 26.10 0100', description: 'Receptacle, Duplex, 20A', unit: 'EA', unitPrice: 85.00, division: '26' },
  { code: '26 27 26.10 0120', description: 'Receptacle, GFI, 20A', unit: 'EA', unitPrice: 125.00, division: '26' },
  { code: '26 51 13.10 0100', description: 'Light Fixture, 2x4 LED', unit: 'EA', unitPrice: 185.00, division: '26' },
  { code: '26 51 13.10 0120', description: 'Light Fixture, 2x2 LED', unit: 'EA', unitPrice: 145.00, division: '26' },
];

export function searchJOCItems(query: string): JOCItem[] {
  const q = query.toLowerCase();
  return jocCatalogue.filter(
    (item) =>
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.division.includes(q)
  );
}
