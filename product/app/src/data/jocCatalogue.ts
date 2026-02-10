import type { JOCItem } from '../types';

export const jocCatalogue: JOCItem[] = [
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 21 - FIRE SUPPRESSION
  // ═══════════════════════════════════════════════════════════════
  
  // Sprinkler Heads
  { code: '21 13 13.10 0020', description: 'Sprinkler Head, Pendant, 1/2" Standard', unit: 'EA', unitPrice: 115.00, division: '21' },
  { code: '21 13 13.10 0025', description: 'Sprinkler Head, Pendant, 1/2" Quick Response', unit: 'EA', unitPrice: 135.00, division: '21' },
  { code: '21 13 13.10 0030', description: 'Sprinkler Head, Upright, 1/2"', unit: 'EA', unitPrice: 115.00, division: '21' },
  { code: '21 13 13.10 0040', description: 'Sprinkler Head, Sidewall, 1/2"', unit: 'EA', unitPrice: 125.00, division: '21' },
  { code: '21 13 13.10 0050', description: 'Sprinkler Head, Concealed, 1/2"', unit: 'EA', unitPrice: 165.00, division: '21' },
  { code: '21 13 13.10 0060', description: 'Sprinkler Head, Dry Pendant, 1/2"', unit: 'EA', unitPrice: 185.00, division: '21' },
  
  // Fire Suppression Pipe - Steel
  { code: '21 11 13.10 0100', description: 'Steel Pipe, Schedule 40, 1"', unit: 'LF', unitPrice: 11.00, division: '21' },
  { code: '21 11 13.10 0120', description: 'Steel Pipe, Schedule 40, 1-1/4"', unit: 'LF', unitPrice: 13.00, division: '21' },
  { code: '21 11 13.10 0140', description: 'Steel Pipe, Schedule 40, 1-1/2"', unit: 'LF', unitPrice: 15.00, division: '21' },
  { code: '21 11 13.10 0160', description: 'Steel Pipe, Schedule 40, 2"', unit: 'LF', unitPrice: 18.00, division: '21' },
  { code: '21 11 13.10 0180', description: 'Steel Pipe, Schedule 40, 2-1/2"', unit: 'LF', unitPrice: 22.00, division: '21' },
  { code: '21 11 13.10 0200', description: 'Steel Pipe, Schedule 40, 3"', unit: 'LF', unitPrice: 28.00, division: '21' },
  { code: '21 11 13.10 0220', description: 'Steel Pipe, Schedule 40, 4"', unit: 'LF', unitPrice: 36.00, division: '21' },
  { code: '21 11 13.10 0240', description: 'Steel Pipe, Schedule 10, 4"', unit: 'LF', unitPrice: 28.00, division: '21' },
  { code: '21 11 13.10 0260', description: 'Steel Pipe, Schedule 10, 6"', unit: 'LF', unitPrice: 42.00, division: '21' },
  
  // Fire Suppression Pipe - CPVC
  { code: '21 11 16.10 0100', description: 'CPVC Pipe, 3/4"', unit: 'LF', unitPrice: 6.50, division: '21' },
  { code: '21 11 16.10 0120', description: 'CPVC Pipe, 1"', unit: 'LF', unitPrice: 8.00, division: '21' },
  { code: '21 11 16.10 0140', description: 'CPVC Pipe, 1-1/4"', unit: 'LF', unitPrice: 10.00, division: '21' },
  { code: '21 11 16.10 0160', description: 'CPVC Pipe, 1-1/2"', unit: 'LF', unitPrice: 12.00, division: '21' },
  { code: '21 11 16.10 0180', description: 'CPVC Pipe, 2"', unit: 'LF', unitPrice: 15.00, division: '21' },
  
  // Fire Suppression Fittings & Accessories
  { code: '21 11 19.10 0100', description: 'Grooved Coupling, 2"', unit: 'EA', unitPrice: 28.00, division: '21' },
  { code: '21 11 19.10 0120', description: 'Grooved Coupling, 4"', unit: 'EA', unitPrice: 45.00, division: '21' },
  { code: '21 11 19.10 0140', description: 'Grooved Elbow, 90°, 2"', unit: 'EA', unitPrice: 42.00, division: '21' },
  { code: '21 11 19.10 0160', description: 'Grooved Tee, 2"', unit: 'EA', unitPrice: 55.00, division: '21' },
  { code: '21 11 19.10 0200', description: 'Pipe Hanger, Adjustable, 1"', unit: 'EA', unitPrice: 18.00, division: '21' },
  { code: '21 11 19.10 0220', description: 'Pipe Hanger, Adjustable, 2"', unit: 'EA', unitPrice: 24.00, division: '21' },
  { code: '21 11 19.10 0240', description: 'Pipe Hanger, Adjustable, 4"', unit: 'EA', unitPrice: 38.00, division: '21' },
  { code: '21 11 19.10 0300', description: 'Escutcheon, Chrome, 1/2"', unit: 'EA', unitPrice: 8.00, division: '21' },
  
  // Fire Suppression Valves & Equipment
  { code: '21 12 13.10 0100', description: 'Alarm Check Valve, 4"', unit: 'EA', unitPrice: 1850.00, division: '21' },
  { code: '21 12 13.10 0120', description: 'Alarm Check Valve, 6"', unit: 'EA', unitPrice: 2450.00, division: '21' },
  { code: '21 12 13.10 0200', description: 'OS&Y Gate Valve, 4"', unit: 'EA', unitPrice: 485.00, division: '21' },
  { code: '21 12 13.10 0220', description: 'OS&Y Gate Valve, 6"', unit: 'EA', unitPrice: 725.00, division: '21' },
  { code: '21 12 13.10 0300', description: 'Fire Department Connection (FDC)', unit: 'EA', unitPrice: 650.00, division: '21' },
  { code: '21 12 13.10 0320', description: 'Post Indicator Valve (PIV)', unit: 'EA', unitPrice: 1250.00, division: '21' },
  { code: '21 12 13.10 0400', description: 'Flow Switch', unit: 'EA', unitPrice: 285.00, division: '21' },
  { code: '21 12 13.10 0420', description: 'Tamper Switch', unit: 'EA', unitPrice: 145.00, division: '21' },
  { code: '21 12 13.10 0500', description: 'Inspector Test Connection', unit: 'EA', unitPrice: 185.00, division: '21' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 22 - PLUMBING
  // ═══════════════════════════════════════════════════════════════
  
  // Copper Pipe
  { code: '22 11 13.10 0100', description: 'Copper Pipe, Type L, 1/2"', unit: 'LF', unitPrice: 8.50, division: '22' },
  { code: '22 11 13.10 0120', description: 'Copper Pipe, Type L, 3/4"', unit: 'LF', unitPrice: 11.00, division: '22' },
  { code: '22 11 13.10 0140', description: 'Copper Pipe, Type L, 1"', unit: 'LF', unitPrice: 14.50, division: '22' },
  { code: '22 11 13.10 0160', description: 'Copper Pipe, Type L, 1-1/2"', unit: 'LF', unitPrice: 22.00, division: '22' },
  { code: '22 11 13.10 0180', description: 'Copper Pipe, Type L, 2"', unit: 'LF', unitPrice: 32.00, division: '22' },
  
  // PVC DWV Pipe
  { code: '22 11 16.10 0100', description: 'PVC DWV Pipe, 2"', unit: 'LF', unitPrice: 5.50, division: '22' },
  { code: '22 11 16.10 0120', description: 'PVC DWV Pipe, 3"', unit: 'LF', unitPrice: 7.50, division: '22' },
  { code: '22 11 16.10 0140', description: 'PVC DWV Pipe, 4"', unit: 'LF', unitPrice: 10.00, division: '22' },
  { code: '22 11 16.10 0160', description: 'PVC DWV Pipe, 6"', unit: 'LF', unitPrice: 16.00, division: '22' },
  
  // Cast Iron Pipe
  { code: '22 11 19.10 0100', description: 'Cast Iron Pipe, No-Hub, 2"', unit: 'LF', unitPrice: 14.00, division: '22' },
  { code: '22 11 19.10 0120', description: 'Cast Iron Pipe, No-Hub, 3"', unit: 'LF', unitPrice: 18.00, division: '22' },
  { code: '22 11 19.10 0140', description: 'Cast Iron Pipe, No-Hub, 4"', unit: 'LF', unitPrice: 24.00, division: '22' },
  { code: '22 11 19.10 0160', description: 'Cast Iron Pipe, No-Hub, 6"', unit: 'LF', unitPrice: 38.00, division: '22' },
  
  // Plumbing Valves
  { code: '22 05 23.10 0100', description: 'Ball Valve, 1/2"', unit: 'EA', unitPrice: 28.00, division: '22' },
  { code: '22 05 23.10 0120', description: 'Ball Valve, 3/4"', unit: 'EA', unitPrice: 35.00, division: '22' },
  { code: '22 05 23.10 0140', description: 'Ball Valve, 1"', unit: 'EA', unitPrice: 48.00, division: '22' },
  { code: '22 05 23.10 0200', description: 'Gate Valve, 2"', unit: 'EA', unitPrice: 85.00, division: '22' },
  { code: '22 05 23.10 0300', description: 'Check Valve, 1"', unit: 'EA', unitPrice: 65.00, division: '22' },
  { code: '22 05 23.10 0400', description: 'PRV (Pressure Reducing Valve), 1"', unit: 'EA', unitPrice: 285.00, division: '22' },
  { code: '22 05 23.10 0500', description: 'Backflow Preventer, 1"', unit: 'EA', unitPrice: 425.00, division: '22' },
  
  // Plumbing Fixtures
  { code: '22 41 13.10 0100', description: 'Water Closet, Floor Mount, Standard', unit: 'EA', unitPrice: 450.00, division: '22' },
  { code: '22 41 13.10 0120', description: 'Water Closet, Floor Mount, ADA', unit: 'EA', unitPrice: 550.00, division: '22' },
  { code: '22 41 13.10 0140', description: 'Water Closet, Wall Hung', unit: 'EA', unitPrice: 680.00, division: '22' },
  { code: '22 41 16.10 0100', description: 'Urinal, Wall Hung', unit: 'EA', unitPrice: 380.00, division: '22' },
  { code: '22 41 16.10 0120', description: 'Urinal, Waterless', unit: 'EA', unitPrice: 485.00, division: '22' },
  { code: '22 41 19.10 0100', description: 'Lavatory, Wall Mount', unit: 'EA', unitPrice: 320.00, division: '22' },
  { code: '22 41 19.10 0120', description: 'Lavatory, Countertop', unit: 'EA', unitPrice: 285.00, division: '22' },
  { code: '22 41 19.10 0140', description: 'Lavatory, Undermount', unit: 'EA', unitPrice: 350.00, division: '22' },
  { code: '22 41 19.10 0200', description: 'Sink, Stainless Steel, Single Bowl', unit: 'EA', unitPrice: 425.00, division: '22' },
  { code: '22 41 19.10 0220', description: 'Sink, Stainless Steel, Double Bowl', unit: 'EA', unitPrice: 550.00, division: '22' },
  { code: '22 41 19.10 0300', description: 'Mop Sink, Floor Mount', unit: 'EA', unitPrice: 485.00, division: '22' },
  { code: '22 41 23.10 0100', description: 'Drinking Fountain, Wall Mount', unit: 'EA', unitPrice: 850.00, division: '22' },
  { code: '22 41 23.10 0120', description: 'Drinking Fountain, ADA w/ Bottle Filler', unit: 'EA', unitPrice: 1450.00, division: '22' },
  { code: '22 41 36.10 0100', description: 'Shower, Single Stall', unit: 'EA', unitPrice: 1250.00, division: '22' },
  { code: '22 41 36.10 0120', description: 'Shower, ADA Compliant', unit: 'EA', unitPrice: 1650.00, division: '22' },
  
  // Plumbing Equipment
  { code: '22 33 00.10 0100', description: 'Water Heater, Electric, 40 Gal', unit: 'EA', unitPrice: 1250.00, division: '22' },
  { code: '22 33 00.10 0120', description: 'Water Heater, Electric, 80 Gal', unit: 'EA', unitPrice: 1850.00, division: '22' },
  { code: '22 33 00.10 0200', description: 'Water Heater, Gas, 40 Gal', unit: 'EA', unitPrice: 1450.00, division: '22' },
  { code: '22 33 00.10 0300', description: 'Tankless Water Heater', unit: 'EA', unitPrice: 2250.00, division: '22' },
  { code: '22 11 23.10 0100', description: 'Sump Pump, 1/3 HP', unit: 'EA', unitPrice: 485.00, division: '22' },
  { code: '22 11 23.10 0120', description: 'Sewage Ejector Pump', unit: 'EA', unitPrice: 1250.00, division: '22' },
  { code: '22 13 16.10 0100', description: 'Floor Drain, 4"', unit: 'EA', unitPrice: 185.00, division: '22' },
  { code: '22 13 16.10 0120', description: 'Floor Drain, 4" w/ Trap Primer', unit: 'EA', unitPrice: 265.00, division: '22' },
  { code: '22 13 16.10 0200', description: 'Cleanout, 4"', unit: 'EA', unitPrice: 125.00, division: '22' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 23 - HVAC / MECHANICAL
  // ═══════════════════════════════════════════════════════════════
  
  // Ductwork - Rectangular
  { code: '23 31 13.10 0100', description: 'Ductwork, Galv, 8"x8"', unit: 'LF', unitPrice: 18.00, division: '23' },
  { code: '23 31 13.10 0120', description: 'Ductwork, Galv, 12"x12"', unit: 'LF', unitPrice: 28.00, division: '23' },
  { code: '23 31 13.10 0140', description: 'Ductwork, Galv, 16"x12"', unit: 'LF', unitPrice: 32.00, division: '23' },
  { code: '23 31 13.10 0160', description: 'Ductwork, Galv, 20"x12"', unit: 'LF', unitPrice: 38.00, division: '23' },
  { code: '23 31 13.10 0180', description: 'Ductwork, Galv, 24"x16"', unit: 'LF', unitPrice: 48.00, division: '23' },
  { code: '23 31 13.10 0200', description: 'Ductwork, Galv, 30"x20"', unit: 'LF', unitPrice: 62.00, division: '23' },
  
  // Ductwork - Round & Flex
  { code: '23 31 16.10 0100', description: 'Round Duct, 6"', unit: 'LF', unitPrice: 12.00, division: '23' },
  { code: '23 31 16.10 0120', description: 'Round Duct, 8"', unit: 'LF', unitPrice: 15.00, division: '23' },
  { code: '23 31 16.10 0140', description: 'Round Duct, 10"', unit: 'LF', unitPrice: 18.00, division: '23' },
  { code: '23 31 16.10 0160', description: 'Round Duct, 12"', unit: 'LF', unitPrice: 22.00, division: '23' },
  { code: '23 31 19.10 0100', description: 'Flex Duct, Insulated, 6"', unit: 'LF', unitPrice: 8.50, division: '23' },
  { code: '23 31 19.10 0120', description: 'Flex Duct, Insulated, 8"', unit: 'LF', unitPrice: 10.50, division: '23' },
  { code: '23 31 19.10 0140', description: 'Flex Duct, Insulated, 10"', unit: 'LF', unitPrice: 13.00, division: '23' },
  
  // Duct Insulation
  { code: '23 07 13.10 0100', description: 'Duct Insulation, 1" Fiberglass', unit: 'SF', unitPrice: 3.25, division: '23' },
  { code: '23 07 13.10 0120', description: 'Duct Insulation, 2" Fiberglass', unit: 'SF', unitPrice: 4.50, division: '23' },
  { code: '23 07 13.10 0200', description: 'Duct Wrap, External', unit: 'SF', unitPrice: 2.85, division: '23' },
  
  // Air Terminals
  { code: '23 37 13.10 0100', description: 'Diffuser, Ceiling, 24"x24"', unit: 'EA', unitPrice: 145.00, division: '23' },
  { code: '23 37 13.10 0120', description: 'Diffuser, Ceiling, 12"x12"', unit: 'EA', unitPrice: 95.00, division: '23' },
  { code: '23 37 13.10 0140', description: 'Diffuser, Linear Slot, 4"x48"', unit: 'EA', unitPrice: 185.00, division: '23' },
  { code: '23 37 13.10 0200', description: 'Register, Wall, 12"x6"', unit: 'EA', unitPrice: 65.00, division: '23' },
  { code: '23 37 13.10 0220', description: 'Register, Wall, 14"x8"', unit: 'EA', unitPrice: 75.00, division: '23' },
  { code: '23 37 13.10 0300', description: 'Return Grille, 24"x24"', unit: 'EA', unitPrice: 85.00, division: '23' },
  { code: '23 37 13.10 0320', description: 'Return Grille, 20"x20"', unit: 'EA', unitPrice: 72.00, division: '23' },
  { code: '23 37 13.10 0400', description: 'Exhaust Grille, 12"x12"', unit: 'EA', unitPrice: 55.00, division: '23' },
  
  // HVAC Dampers & Accessories
  { code: '23 33 13.10 0100', description: 'Volume Damper, 8"', unit: 'EA', unitPrice: 85.00, division: '23' },
  { code: '23 33 13.10 0120', description: 'Volume Damper, 12"', unit: 'EA', unitPrice: 115.00, division: '23' },
  { code: '23 33 13.10 0200', description: 'Fire Damper, 12"x12"', unit: 'EA', unitPrice: 285.00, division: '23' },
  { code: '23 33 13.10 0220', description: 'Fire Damper, 24"x12"', unit: 'EA', unitPrice: 385.00, division: '23' },
  { code: '23 33 13.10 0300', description: 'Smoke Damper, 12"x12"', unit: 'EA', unitPrice: 485.00, division: '23' },
  { code: '23 33 13.10 0400', description: 'Backdraft Damper, 12"', unit: 'EA', unitPrice: 145.00, division: '23' },
  
  // HVAC Equipment
  { code: '23 74 13.10 0100', description: 'Exhaust Fan, Inline, 200 CFM', unit: 'EA', unitPrice: 285.00, division: '23' },
  { code: '23 74 13.10 0120', description: 'Exhaust Fan, Inline, 400 CFM', unit: 'EA', unitPrice: 425.00, division: '23' },
  { code: '23 74 13.10 0200', description: 'Exhaust Fan, Roof Mount, 500 CFM', unit: 'EA', unitPrice: 850.00, division: '23' },
  { code: '23 74 13.10 0220', description: 'Exhaust Fan, Roof Mount, 1000 CFM', unit: 'EA', unitPrice: 1250.00, division: '23' },
  { code: '23 81 26.10 0100', description: 'Split System, 2 Ton', unit: 'EA', unitPrice: 4500.00, division: '23' },
  { code: '23 81 26.10 0120', description: 'Split System, 3 Ton', unit: 'EA', unitPrice: 5500.00, division: '23' },
  { code: '23 81 26.10 0140', description: 'Split System, 5 Ton', unit: 'EA', unitPrice: 7500.00, division: '23' },
  { code: '23 73 13.10 0100', description: 'VAV Box, 8"', unit: 'EA', unitPrice: 850.00, division: '23' },
  { code: '23 73 13.10 0120', description: 'VAV Box, 10"', unit: 'EA', unitPrice: 1050.00, division: '23' },
  { code: '23 73 13.10 0140', description: 'VAV Box, 12" w/ Reheat', unit: 'EA', unitPrice: 1450.00, division: '23' },
  { code: '23 82 19.10 0100', description: 'Unit Heater, Gas, 45 MBH', unit: 'EA', unitPrice: 1250.00, division: '23' },
  { code: '23 82 19.10 0120', description: 'Unit Heater, Gas, 75 MBH', unit: 'EA', unitPrice: 1650.00, division: '23' },
  { code: '23 82 33.10 0100', description: 'Cabinet Unit Heater', unit: 'EA', unitPrice: 1850.00, division: '23' },
  
  // HVAC Controls
  { code: '23 09 23.10 0100', description: 'Thermostat, Programmable', unit: 'EA', unitPrice: 185.00, division: '23' },
  { code: '23 09 23.10 0120', description: 'Thermostat, Smart/WiFi', unit: 'EA', unitPrice: 285.00, division: '23' },
  { code: '23 09 23.10 0200', description: 'Temperature Sensor', unit: 'EA', unitPrice: 85.00, division: '23' },
  { code: '23 09 23.10 0220', description: 'Humidity Sensor', unit: 'EA', unitPrice: 125.00, division: '23' },
  { code: '23 09 23.10 0300', description: 'CO2 Sensor', unit: 'EA', unitPrice: 285.00, division: '23' },
  { code: '23 09 23.10 0400', description: 'Duct Smoke Detector', unit: 'EA', unitPrice: 385.00, division: '23' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 26 - ELECTRICAL
  // ═══════════════════════════════════════════════════════════════
  
  // Conduit - EMT
  { code: '26 05 33.10 0100', description: 'Conduit, EMT, 1/2"', unit: 'LF', unitPrice: 4.50, division: '26' },
  { code: '26 05 33.10 0120', description: 'Conduit, EMT, 3/4"', unit: 'LF', unitPrice: 5.50, division: '26' },
  { code: '26 05 33.10 0140', description: 'Conduit, EMT, 1"', unit: 'LF', unitPrice: 7.00, division: '26' },
  { code: '26 05 33.10 0160', description: 'Conduit, EMT, 1-1/4"', unit: 'LF', unitPrice: 9.50, division: '26' },
  { code: '26 05 33.10 0180', description: 'Conduit, EMT, 1-1/2"', unit: 'LF', unitPrice: 11.00, division: '26' },
  { code: '26 05 33.10 0200', description: 'Conduit, EMT, 2"', unit: 'LF', unitPrice: 14.00, division: '26' },
  
  // Conduit - Rigid & IMC
  { code: '26 05 33.20 0100', description: 'Conduit, Rigid, 1/2"', unit: 'LF', unitPrice: 8.50, division: '26' },
  { code: '26 05 33.20 0120', description: 'Conduit, Rigid, 3/4"', unit: 'LF', unitPrice: 10.50, division: '26' },
  { code: '26 05 33.20 0140', description: 'Conduit, Rigid, 1"', unit: 'LF', unitPrice: 13.00, division: '26' },
  { code: '26 05 33.20 0160', description: 'Conduit, Rigid, 2"', unit: 'LF', unitPrice: 22.00, division: '26' },
  
  // Conduit - PVC
  { code: '26 05 33.30 0100', description: 'Conduit, PVC, 1/2"', unit: 'LF', unitPrice: 3.00, division: '26' },
  { code: '26 05 33.30 0120', description: 'Conduit, PVC, 3/4"', unit: 'LF', unitPrice: 3.75, division: '26' },
  { code: '26 05 33.30 0140', description: 'Conduit, PVC, 1"', unit: 'LF', unitPrice: 4.50, division: '26' },
  { code: '26 05 33.30 0160', description: 'Conduit, PVC, 2"', unit: 'LF', unitPrice: 7.00, division: '26' },
  
  // Flexible Conduit
  { code: '26 05 34.10 0100', description: 'Flex Conduit, MC Cable, 12/2', unit: 'LF', unitPrice: 4.25, division: '26' },
  { code: '26 05 34.10 0120', description: 'Flex Conduit, MC Cable, 12/3', unit: 'LF', unitPrice: 5.50, division: '26' },
  { code: '26 05 34.10 0140', description: 'Flex Conduit, Liquid-tight, 1/2"', unit: 'LF', unitPrice: 6.50, division: '26' },
  { code: '26 05 34.10 0160', description: 'Flex Conduit, Liquid-tight, 3/4"', unit: 'LF', unitPrice: 8.00, division: '26' },
  
  // Wire & Cable
  { code: '26 05 19.10 0100', description: 'Wire, THHN, #12', unit: 'LF', unitPrice: 0.45, division: '26' },
  { code: '26 05 19.10 0120', description: 'Wire, THHN, #10', unit: 'LF', unitPrice: 0.65, division: '26' },
  { code: '26 05 19.10 0140', description: 'Wire, THHN, #8', unit: 'LF', unitPrice: 1.05, division: '26' },
  { code: '26 05 19.10 0160', description: 'Wire, THHN, #6', unit: 'LF', unitPrice: 1.65, division: '26' },
  { code: '26 05 19.10 0180', description: 'Wire, THHN, #4', unit: 'LF', unitPrice: 2.45, division: '26' },
  { code: '26 05 19.10 0200', description: 'Wire, THHN, #2', unit: 'LF', unitPrice: 3.85, division: '26' },
  
  // Panels & Breakers
  { code: '26 24 16.10 0100', description: 'Panel, 100A, 20 Space', unit: 'EA', unitPrice: 485.00, division: '26' },
  { code: '26 24 16.10 0120', description: 'Panel, 200A, 30 Space', unit: 'EA', unitPrice: 685.00, division: '26' },
  { code: '26 24 16.10 0140', description: 'Panel, 200A, 42 Space', unit: 'EA', unitPrice: 850.00, division: '26' },
  { code: '26 24 16.10 0160', description: 'Panel, 400A', unit: 'EA', unitPrice: 2450.00, division: '26' },
  { code: '26 24 16.20 0100', description: 'Breaker, 1P, 20A', unit: 'EA', unitPrice: 18.00, division: '26' },
  { code: '26 24 16.20 0120', description: 'Breaker, 2P, 20A', unit: 'EA', unitPrice: 42.00, division: '26' },
  { code: '26 24 16.20 0140', description: 'Breaker, 2P, 30A', unit: 'EA', unitPrice: 48.00, division: '26' },
  { code: '26 24 16.20 0160', description: 'Breaker, 2P, 50A', unit: 'EA', unitPrice: 65.00, division: '26' },
  { code: '26 24 16.20 0180', description: 'Breaker, 3P, 100A', unit: 'EA', unitPrice: 185.00, division: '26' },
  
  // Receptacles
  { code: '26 27 26.10 0100', description: 'Receptacle, Duplex, 15A', unit: 'EA', unitPrice: 75.00, division: '26' },
  { code: '26 27 26.10 0120', description: 'Receptacle, Duplex, 20A', unit: 'EA', unitPrice: 85.00, division: '26' },
  { code: '26 27 26.10 0140', description: 'Receptacle, GFCI, 20A', unit: 'EA', unitPrice: 125.00, division: '26' },
  { code: '26 27 26.10 0160', description: 'Receptacle, Isolated Ground', unit: 'EA', unitPrice: 145.00, division: '26' },
  { code: '26 27 26.10 0180', description: 'Receptacle, Hospital Grade', unit: 'EA', unitPrice: 165.00, division: '26' },
  { code: '26 27 26.10 0200', description: 'Receptacle, 30A, 250V', unit: 'EA', unitPrice: 185.00, division: '26' },
  { code: '26 27 26.10 0220', description: 'Receptacle, 50A, Range', unit: 'EA', unitPrice: 225.00, division: '26' },
  { code: '26 27 26.10 0300', description: 'USB Receptacle, Duplex', unit: 'EA', unitPrice: 145.00, division: '26' },
  
  // Switches
  { code: '26 27 23.10 0100', description: 'Switch, Single Pole', unit: 'EA', unitPrice: 55.00, division: '26' },
  { code: '26 27 23.10 0120', description: 'Switch, 3-Way', unit: 'EA', unitPrice: 65.00, division: '26' },
  { code: '26 27 23.10 0140', description: 'Switch, 4-Way', unit: 'EA', unitPrice: 85.00, division: '26' },
  { code: '26 27 23.10 0160', description: 'Dimmer, Single Pole', unit: 'EA', unitPrice: 95.00, division: '26' },
  { code: '26 27 23.10 0180', description: 'Dimmer, 3-Way', unit: 'EA', unitPrice: 115.00, division: '26' },
  { code: '26 27 23.10 0200', description: 'Occupancy Sensor, Wall', unit: 'EA', unitPrice: 145.00, division: '26' },
  { code: '26 27 23.10 0220', description: 'Occupancy Sensor, Ceiling', unit: 'EA', unitPrice: 185.00, division: '26' },
  
  // Light Fixtures
  { code: '26 51 13.10 0100', description: 'Light Fixture, 2x4 LED Troffer', unit: 'EA', unitPrice: 185.00, division: '26' },
  { code: '26 51 13.10 0120', description: 'Light Fixture, 2x2 LED Troffer', unit: 'EA', unitPrice: 145.00, division: '26' },
  { code: '26 51 13.10 0140', description: 'Light Fixture, 1x4 LED Strip', unit: 'EA', unitPrice: 125.00, division: '26' },
  { code: '26 51 13.10 0160', description: 'Light Fixture, LED Downlight, 6"', unit: 'EA', unitPrice: 95.00, division: '26' },
  { code: '26 51 13.10 0180', description: 'Light Fixture, LED Downlight, 8"', unit: 'EA', unitPrice: 125.00, division: '26' },
  { code: '26 51 13.10 0200', description: 'Light Fixture, Wall Sconce', unit: 'EA', unitPrice: 185.00, division: '26' },
  { code: '26 51 13.10 0220', description: 'Light Fixture, Pendant', unit: 'EA', unitPrice: 285.00, division: '26' },
  { code: '26 56 13.10 0100', description: 'Exit Sign, LED', unit: 'EA', unitPrice: 125.00, division: '26' },
  { code: '26 56 13.10 0120', description: 'Exit Sign, LED w/ Emergency', unit: 'EA', unitPrice: 185.00, division: '26' },
  { code: '26 56 13.10 0200', description: 'Emergency Light, LED', unit: 'EA', unitPrice: 145.00, division: '26' },
  { code: '26 56 13.10 0220', description: 'Emergency Light, Twin Head', unit: 'EA', unitPrice: 185.00, division: '26' },
  
  // Boxes & Fittings
  { code: '26 05 39.10 0100', description: 'Junction Box, 4" Square', unit: 'EA', unitPrice: 18.00, division: '26' },
  { code: '26 05 39.10 0120', description: 'Junction Box, 4-11/16"', unit: 'EA', unitPrice: 24.00, division: '26' },
  { code: '26 05 39.10 0140', description: 'Device Box, Single Gang', unit: 'EA', unitPrice: 12.00, division: '26' },
  { code: '26 05 39.10 0160', description: 'Device Box, Double Gang', unit: 'EA', unitPrice: 18.00, division: '26' },
  { code: '26 05 39.10 0200', description: 'Pull Box, 8x8x4"', unit: 'EA', unitPrice: 45.00, division: '26' },
  { code: '26 05 39.10 0220', description: 'Pull Box, 12x12x6"', unit: 'EA', unitPrice: 85.00, division: '26' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 27 - COMMUNICATIONS (LOW VOLTAGE)
  // ═══════════════════════════════════════════════════════════════
  
  // Data Cable
  { code: '27 15 01.10 0100', description: 'Cable, Cat6, Plenum', unit: 'LF', unitPrice: 0.85, division: '27' },
  { code: '27 15 01.10 0120', description: 'Cable, Cat6A, Plenum', unit: 'LF', unitPrice: 1.25, division: '27' },
  { code: '27 15 01.10 0140', description: 'Cable, Fiber, 6-Strand SM', unit: 'LF', unitPrice: 2.50, division: '27' },
  { code: '27 15 01.10 0160', description: 'Cable, Fiber, 12-Strand SM', unit: 'LF', unitPrice: 3.50, division: '27' },
  
  // Data Outlets & Jacks
  { code: '27 15 01.20 0100', description: 'Data Jack, Cat6, Single', unit: 'EA', unitPrice: 65.00, division: '27' },
  { code: '27 15 01.20 0120', description: 'Data Jack, Cat6, Dual', unit: 'EA', unitPrice: 95.00, division: '27' },
  { code: '27 15 01.20 0140', description: 'Data Jack, Cat6A, Single', unit: 'EA', unitPrice: 85.00, division: '27' },
  { code: '27 15 01.20 0160', description: 'Fiber Outlet, Duplex', unit: 'EA', unitPrice: 145.00, division: '27' },
  
  // Data Equipment
  { code: '27 15 01.30 0100', description: 'Patch Panel, 24-Port Cat6', unit: 'EA', unitPrice: 285.00, division: '27' },
  { code: '27 15 01.30 0120', description: 'Patch Panel, 48-Port Cat6', unit: 'EA', unitPrice: 385.00, division: '27' },
  { code: '27 15 01.30 0200', description: 'Network Rack, 42U', unit: 'EA', unitPrice: 850.00, division: '27' },
  { code: '27 15 01.30 0220', description: 'Wall Mount Cabinet, 12U', unit: 'EA', unitPrice: 485.00, division: '27' },
  
  // Access Control
  { code: '27 32 13.10 0100', description: 'Card Reader, Proximity', unit: 'EA', unitPrice: 385.00, division: '27' },
  { code: '27 32 13.10 0120', description: 'Card Reader, Keypad', unit: 'EA', unitPrice: 485.00, division: '27' },
  { code: '27 32 13.10 0200', description: 'Electric Strike', unit: 'EA', unitPrice: 285.00, division: '27' },
  { code: '27 32 13.10 0220', description: 'Mag Lock, 1200 lb', unit: 'EA', unitPrice: 385.00, division: '27' },
  { code: '27 32 13.10 0300', description: 'Door Contact, Surface Mount', unit: 'EA', unitPrice: 45.00, division: '27' },
  { code: '27 32 13.10 0320', description: 'Request to Exit, Motion', unit: 'EA', unitPrice: 145.00, division: '27' },
  
  // Security/CCTV
  { code: '27 32 23.10 0100', description: 'Camera, IP, Fixed Dome', unit: 'EA', unitPrice: 485.00, division: '27' },
  { code: '27 32 23.10 0120', description: 'Camera, IP, PTZ', unit: 'EA', unitPrice: 1250.00, division: '27' },
  { code: '27 32 23.10 0200', description: 'NVR, 16-Channel', unit: 'EA', unitPrice: 1850.00, division: '27' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 28 - FIRE ALARM
  // ═══════════════════════════════════════════════════════════════
  
  // Fire Alarm Cable
  { code: '28 31 11.10 0100', description: 'Fire Alarm Cable, 2-Cond, 14 AWG', unit: 'LF', unitPrice: 0.65, division: '28' },
  { code: '28 31 11.10 0120', description: 'Fire Alarm Cable, 2-Cond, 16 AWG', unit: 'LF', unitPrice: 0.55, division: '28' },
  { code: '28 31 11.10 0140', description: 'Fire Alarm Cable, 4-Cond, 18 AWG', unit: 'LF', unitPrice: 0.75, division: '28' },
  
  // Fire Alarm Devices
  { code: '28 31 46.10 0100', description: 'Smoke Detector, Addressable', unit: 'EA', unitPrice: 145.00, division: '28' },
  { code: '28 31 46.10 0120', description: 'Smoke Detector, Conventional', unit: 'EA', unitPrice: 85.00, division: '28' },
  { code: '28 31 46.10 0140', description: 'Heat Detector, Addressable', unit: 'EA', unitPrice: 125.00, division: '28' },
  { code: '28 31 46.10 0160', description: 'Duct Detector, Addressable', unit: 'EA', unitPrice: 385.00, division: '28' },
  { code: '28 31 46.10 0200', description: 'Pull Station, Addressable', unit: 'EA', unitPrice: 145.00, division: '28' },
  { code: '28 31 46.10 0220', description: 'Pull Station, Conventional', unit: 'EA', unitPrice: 85.00, division: '28' },
  
  // Fire Alarm Notification
  { code: '28 31 43.10 0100', description: 'Horn/Strobe, Wall Mount', unit: 'EA', unitPrice: 125.00, division: '28' },
  { code: '28 31 43.10 0120', description: 'Horn/Strobe, Ceiling Mount', unit: 'EA', unitPrice: 145.00, division: '28' },
  { code: '28 31 43.10 0140', description: 'Strobe Only, Wall Mount', unit: 'EA', unitPrice: 95.00, division: '28' },
  { code: '28 31 43.10 0160', description: 'Speaker/Strobe', unit: 'EA', unitPrice: 185.00, division: '28' },
  { code: '28 31 43.10 0200', description: 'Chime', unit: 'EA', unitPrice: 85.00, division: '28' },
  
  // Fire Alarm Equipment
  { code: '28 31 00.10 0100', description: 'Fire Alarm Panel, Addressable', unit: 'EA', unitPrice: 4500.00, division: '28' },
  { code: '28 31 00.10 0120', description: 'Fire Alarm Panel, Conventional, 4-Zone', unit: 'EA', unitPrice: 1250.00, division: '28' },
  { code: '28 31 00.10 0200', description: 'Annunciator, Remote', unit: 'EA', unitPrice: 850.00, division: '28' },
  { code: '28 31 00.10 0300', description: 'NAC Power Extender', unit: 'EA', unitPrice: 650.00, division: '28' },
  { code: '28 31 00.10 0400', description: 'Monitor Module', unit: 'EA', unitPrice: 145.00, division: '28' },
  { code: '28 31 00.10 0420', description: 'Control Module', unit: 'EA', unitPrice: 165.00, division: '28' },
  { code: '28 31 00.10 0440', description: 'Relay Module', unit: 'EA', unitPrice: 125.00, division: '28' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 09 - FINISHES (for Spaces)
  // ═══════════════════════════════════════════════════════════════
  
  // Gypsum Board
  { code: '09 29 00.10 0100', description: 'Gypsum Board, 5/8" Type X', unit: 'SF', unitPrice: 2.85, division: '09' },
  { code: '09 29 00.10 0120', description: 'Gypsum Board, 1/2" Regular', unit: 'SF', unitPrice: 2.25, division: '09' },
  { code: '09 29 00.10 0140', description: 'Gypsum Board, Moisture Resistant', unit: 'SF', unitPrice: 3.25, division: '09' },
  
  // Flooring
  { code: '09 65 13.10 0100', description: 'Resilient Flooring, VCT', unit: 'SF', unitPrice: 4.50, division: '09' },
  { code: '09 65 19.10 0100', description: 'Resilient Flooring, Rubber', unit: 'SF', unitPrice: 8.75, division: '09' },
  { code: '09 65 19.10 0120', description: 'Resilient Flooring, LVT', unit: 'SF', unitPrice: 6.50, division: '09' },
  { code: '09 68 13.10 0100', description: 'Carpet Tile, Commercial', unit: 'SF', unitPrice: 6.50, division: '09' },
  { code: '09 64 23.10 0100', description: 'Wood Flooring, Oak Strip', unit: 'SF', unitPrice: 12.00, division: '09' },
  { code: '09 30 13.10 0100', description: 'Ceramic Tile, Floor', unit: 'SF', unitPrice: 14.00, division: '09' },
  { code: '09 30 13.10 0120', description: 'Porcelain Tile, Floor', unit: 'SF', unitPrice: 18.00, division: '09' },
  
  // Paint
  { code: '09 91 23.10 0100', description: 'Paint, Interior, 2 Coats', unit: 'SF', unitPrice: 1.85, division: '09' },
  { code: '09 91 23.10 0120', description: 'Paint, Interior, Primer + 2 Coats', unit: 'SF', unitPrice: 2.45, division: '09' },
  { code: '09 91 23.10 0140', description: 'Paint, Epoxy', unit: 'SF', unitPrice: 4.50, division: '09' },
  
  // Ceiling
  { code: '09 51 23.10 0100', description: 'Acoustical Ceiling Tile, 2x2', unit: 'SF', unitPrice: 5.25, division: '09' },
  { code: '09 51 23.10 0120', description: 'Acoustical Ceiling Tile, 2x4', unit: 'SF', unitPrice: 4.75, division: '09' },
  { code: '09 51 23.10 0140', description: 'Ceiling Grid, Exposed', unit: 'SF', unitPrice: 2.25, division: '09' },
  
  // Base
  { code: '09 65 66.10 0100', description: 'Resilient Base, 4" Rubber', unit: 'LF', unitPrice: 3.50, division: '09' },
  { code: '09 65 66.10 0120', description: 'Resilient Base, 6" Rubber', unit: 'LF', unitPrice: 4.25, division: '09' },
  { code: '09 65 66.10 0140', description: 'Wood Base, 4"', unit: 'LF', unitPrice: 5.50, division: '09' },
  
  // ═══════════════════════════════════════════════════════════════
  // DIVISION 10 - SPECIALTIES
  // ═══════════════════════════════════════════════════════════════
  
  { code: '10 21 13.10 0100', description: 'Toilet Compartment, Floor Mounted', unit: 'EA', unitPrice: 850.00, division: '10' },
  { code: '10 21 13.10 0120', description: 'Toilet Compartment, Ceiling Hung', unit: 'EA', unitPrice: 1050.00, division: '10' },
  { code: '10 21 13.10 0140', description: 'Toilet Compartment, ADA', unit: 'EA', unitPrice: 1250.00, division: '10' },
  { code: '10 28 13.10 0100', description: 'Toilet Accessories, Basic Set', unit: 'EA', unitPrice: 185.00, division: '10' },
  { code: '10 28 13.10 0120', description: 'Toilet Accessories, Full Set', unit: 'EA', unitPrice: 285.00, division: '10' },
  { code: '10 28 13.10 0200', description: 'Mirror, 18x24"', unit: 'EA', unitPrice: 125.00, division: '10' },
  { code: '10 28 13.10 0220', description: 'Mirror, 24x36"', unit: 'EA', unitPrice: 185.00, division: '10' },
  { code: '10 44 13.10 0100', description: 'Fire Extinguisher, 5 lb', unit: 'EA', unitPrice: 85.00, division: '10' },
  { code: '10 44 13.10 0120', description: 'Fire Extinguisher Cabinet, Recessed', unit: 'EA', unitPrice: 185.00, division: '10' },
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

export function getItemsByDivision(division: string): JOCItem[] {
  return jocCatalogue.filter(item => item.division === division);
}

export const divisionNames: Record<string, string> = {
  '09': 'Finishes',
  '10': 'Specialties',
  '21': 'Fire Suppression',
  '22': 'Plumbing',
  '23': 'HVAC',
  '26': 'Electrical',
  '27': 'Communications',
  '28': 'Fire Alarm',
};
