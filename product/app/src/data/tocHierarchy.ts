/**
 * NYC H+H CTC Table of Contents Hierarchy
 * Auto-generated from TOC PDF - DO NOT EDIT MANUALLY
 * 
 * Generated: 2026-02-11T19:58:58.408Z
 */

export interface TOCSection {
  name: string;
  subsections: Record<string, string>;
}

export interface TOCDivision {
  name: string;
  sections: Record<string, TOCSection>;
}

export type TOCTree = Record<string, TOCDivision>;

/** Division code -> Division name */
export const DIVISIONS: Record<string, string> = {
  "10": "Specialties",
  "11": "Equipment",
  "12": "Furnishings",
  "13": "Special Construction",
  "14": "Conveying Equipment",
  "21": "Fire Suppression",
  "22": "Plumbing",
  "23": "Heating, Ventilating, and Air-Conditioning (HVAC)",
  "25": "Integrated Automation",
  "26": "Electrical",
  "27": "Communications",
  "28": "Electronic Safety and Security",
  "31": "Earthwork",
  "32": "Exterior Improvements",
  "33": "Utilities",
  "00": "Using The Construction Task Catalog",
  "01": "General Requirements",
  "02": "Existing Conditions",
  "03": "Concrete",
  "04": "Masonry",
  "05": "Metals",
  "06": "Wood, Plastics, and Composites",
  "07": "Thermal And Moisture Protection",
  "08": "Openings",
  "09": "Finishes"
};

/** Section code (e.g., "01 10") -> Section name */
export const SECTIONS: Record<string, string> = {
  "01 10": "Summary",
  "01 20": "Price and Payment Procedures",
  "01 40": "Quality Requirements",
  "01 50": "Temporary Facilities and Controls",
  "01 60": "Product Requirements",
  "01 70": "Execution and Closeout Requirements",
  "02 20": "Assessment",
  "02 40": "Demolition and Structure Moving",
  "02 60": "Contaminated Site Material Removal",
  "02 80": "Facility Remediation",
  "03 01": "Maintenance of Concrete",
  "03 05": "Common Work Results For Concrete",
  "03 10": "Concrete Forming and Accessories",
  "03 20": "Concrete Reinforcing",
  "03 30": "Cast-In-Place Concrete",
  "03 40": "Precast Concrete",
  "03 50": "Cast Decks and Underlayment",
  "03 60": "Grouting",
  "03 80": "Concrete Cutting and Boring",
  "04 01": "Maintenance of Masonry",
  "04 05": "Common Work Results for Masonry",
  "04 20": "Unit Masonry",
  "04 40": "Stone Assemblies",
  "04 50": "Refractory Masonry",
  "04 70": "Manufactured Masonry",
  "05 01": "Maintenance of Metals",
  "05 05": "Common Work Results for Metals",
  "05 10": "Structural Metal Framing",
  "05 20": "Metal Joists",
  "05 30": "Metal Decking",
  "05 40": "Cold-Formed Metal Framing",
  "05 50": "Metal Fabrications",
  "05 70": "Decorative Metal",
  "06 01": "Maintenance of Wood, Plastics, and Composites",
  "06 05": "Common Work Results for Wood, Plastics, and Composites",
  "06 10": "Rough Carpentry",
  "06 20": "Finish Carpentry",
  "06 40": "Architectural Woodwork",
  "06 50": "Structural Plastics",
  "06 60": "Plastic Fabrications",
  "06 70": "Structural Composites",
  "06 80": "Composite Fabrications",
  "07 01": "Operation and Maintenance of Thermal and Moisture Protection",
  "07 05": "Common Work Results for Thermal and Moisture Protection",
  "07 10": "Dampproofing and Waterproofing",
  "07 20": "Thermal Protection",
  "07 25": "Weather Barriers",
  "07 30": "Steep Slope Roofing",
  "07 40": "Roofing and Siding Panels",
  "07 50": "Membrane Roofing",
  "07 60": "Flashing and Sheet Metal",
  "07 70": "Roof and Wall Specialties and Accessories",
  "07 80": "Fire and Smoke Protection",
  "07 90": "Joint Protection",
  "08 01": "Operation and Maintenance of Openings",
  "08 05": "Common Work Results for Openings",
  "08 10": "Doors and Frames",
  "08 30": "Specialty Doors and Frames",
  "08 40": "Entrances, Storefronts, and Curtain Walls",
  "08 50": "Windows",
  "08 60": "Roof Windows and Skylights",
  "08 70": "Hardware",
  "08 80": "Glazing",
  "08 90": "Louvers and Vents",
  "09 01": "Maintenance of Finishes",
  "09 20": "Plaster and Gypsum Board",
  "09 30": "Tiling",
  "09 50": "Ceilings",
  "09 60": "Flooring",
  "09 70": "Wall Finishes",
  "09 80": "Acoustic Treatment",
  "09 90": "Painting and Coating",
  "10 01": "Operation and Maintenance of Specialties",
  "10 10": "Information Specialties",
  "10 20": "Interior Specialties",
  "10 40": "Safety Specialties",
  "10 50": "Storage Specialties",
  "10 70": "Exterior Specialties",
  "10 80": "Other Specialties",
  "11 10": "Vehicle and Pedestrian Equipment",
  "11 20": "Commercial Equipment",
  "11 30": "Residential Equipment",
  "11 40": "Foodservice Equipment",
  "11 50": "Educational and Scientific Equipment",
  "11 70": "Healthcare Equipment",
  "11 80": "Facility Maintenance and Operation Equipment",
  "12 01": "Operation and Maintenance of Furnishings",
  "12 20": "Window Treatments",
  "12 30": "Casework",
  "12 50": "Furniture",
  "12 60": "Multiple Seating",
  "13 20": "Special Purpose Rooms",
  "13 40": "Integrated Construction",
  "14 20": "Elevators",
  "14 40": "Lifts",
  "21 01": "Operation and Maintenance of Fire Suppression",
  "21 05": "Common Work Results for Fire Suppression",
  "21 07": "Fire-Suppression Systems Insulation",
  "21 10": "Water-Based Fire-Suppression Systems",
  "21 20": "Fire-Extinguishing Systems",
  "21 30": "Fire Pumps",
  "22 01": "Operation and Maintenance of Plumbing",
  "22 05": "Common Work Results for Plumbing",
  "22 07": "Plumbing Insulation",
  "22 10": "Plumbing Piping",
  "22 30": "Plumbing Equipment",
  "22 40": "Plumbing Fixtures",
  "22 60": "Gas and Vacuum Systems for Laboratory and Healthcare Facilities",
  "23 01": "Operation and Maintenance of HVAC Systems",
  "23 05": "Common Work Results for HVAC",
  "23 07": "HVAC Insulation",
  "23 08": "Commissioning of HVAC",
  "23 09": "Instrumentation and Control for HVAC",
  "23 10": "Facility Fuel Systems",
  "23 20": "HVAC Piping and Pumps",
  "23 30": "HVAC Air Distribution",
  "23 40": "HVAC Air Cleaning Devices",
  "23 50": "Central Heating Equipment",
  "23 60": "Central Cooling Equipment",
  "23 70": "Central HVAC Equipment",
  "23 80": "Decentralized Unitary HVAC Equipment",
  "25 50": "Integrated Automation Facility Controls",
  "26 01": "Operation and Maintenance of Electrical Systems",
  "26 05": "Common Work Results for Electrical",
  "26 09": "Instrumentation and Control for Electrical Systems",
  "26 10": "Medium-Voltage Electrical Distribution",
  "26 20": "Low-Voltage Electrical Distribution",
  "26 30": "Facility Electrical Power Generating and Storing Equipment",
  "26 40": "Electrical And Cathodic Protection",
  "26 50": "Lighting",
  "27 05": "Common Work Results for Communications",
  "27 10": "Structured Cabling",
  "27 20": "Data Communications",
  "27 30": "Voice Communications",
  "27 50": "Distributed Communications and Monitoring Systems",
  "28 05": "Common Work Results for Electronic Safety and Security",
  "28 10": "Access Control",
  "28 20": "Video Surveillance",
  "28 40": "Life Safety",
  "31 05": "Common Work Results for Earthwork",
  "31 10": "Site Clearing",
  "31 20": "Earth Moving",
  "31 30": "Earthwork Methods",
  "31 40": "Shoring and Underpinning",
  "32 01": "Operation and Maintenance of Exterior Improvements",
  "32 10": "Bases, Ballasts, and Paving",
  "32 30": "Site Improvements",
  "32 90": "Planting",
  "33 01": "Operation and Maintenance of Utilities",
  "33 05": "Common Work Results for Utilities",
  "33 10": "Water Utilities"
};

/** Subsection code (e.g., "01 11" or "03 01 30") -> Subsection name */
export const SUBSECTIONS: Record<string, string> = {
  "01 11": "Summary Of Work",
  "01 22": "Unit Prices",
  "01 41": "Regulatory Requirements",
  "01 42": "References",
  "01 45": "Quality Control",
  "01 51": "Temporary Utilities",
  "01 52": "Construction Facilities",
  "01 53": "Temporary Construction",
  "01 54": "Construction Aids",
  "01 55": "Vehicular Access and Parking",
  "01 56": "Temporary Barriers and Enclosures",
  "01 57": "Temporary Controls",
  "01 58": "Project Identification",
  "01 66": "Product Storage and Handling Requirements",
  "01 71": "Examination and Preparation",
  "01 74": "Cleaning and Waste Management",
  "02 25": "Existing Material Assessment",
  "02 41": "Demolition",
  "02 42": "Removal and Salvage of Construction Materials",
  "02 61": "Removal and Disposal of Contaminated Soils",
  "02 65": "Underground Storage Tank Removal",
  "02 82": "Asbestos Remediation",
  "02 83": "Lead Remediation",
  "02 84": "Polychlorinated Biphenyl Remediation",
  "02 87": "Bio-Hazard Material Remediation",
  "02 89": "Hazmat Ancillary Tasks and Support",
  "03 01 30": "Maintenance of Cast-In-Place Concrete",
  "03 05 13": "Concrete Admixtures",
  "03 11": "Concrete Forming",
  "03 15": "Concrete Accessories",
  "03 21": "Reinforcement Bars",
  "03 22": "Fabric and Grid Reinforcing",
  "03 30 53": "Miscellaneous Cast-in-Place Concrete",
  "03 31": "Structural Concrete",
  "03 35": "Concrete Finishing",
  "03 37": "Specialty Placed Concrete",
  "03 39": "Concrete Curing",
  "03 48": "Precast Concrete Specialties",
  "03 53": "Concrete Topping",
  "03 54": "Cast Underlayment",
  "03 61": "Cementitious Grouting",
  "03 62": "Non-Shrink Grouting",
  "03 63": "Epoxy Grouting",
  "03 64": "Injection Grouting",
  "03 81": "Concrete Cutting",
  "03 82": "Concrete Boring",
  "04 01 20": "Maintenance of Unit Masonry",
  "04 01 50": "Maintenance of Refractory Masonry",
  "04 05 13": "Masonry Mortaring",
  "04 05 16": "Masonry Grouting",
  "04 05 19": "Masonry Anchorage and Reinforcing",
  "04 05 23": "Masonry Accessories",
  "04 21": "Clay Unit Masonry",
  "04 22": "Concrete Unit Masonry",
  "04 23": "Glass Unit Masonry",
  "04 41": "Dry-Placed Stone",
  "04 42": "Exterior Stone Cladding",
  "04 43": "Stone Masonry",
  "04 51": "Flue Liner Masonry",
  "04 72": "Cast Stone Masonry",
  "05 01 50": "Maintenance of Metal Fabrications",
  "05 01 70": "Maintenance of Decorative Metal",
  "05 05 19": "Post-Installed Concrete Anchors",
  "05 05 21": "Fastening Methods for Metal",
  "05 05 23": "Metal Fastenings",
  "05 12": "Structural Steel Framing",
  "05 14": "Structural Aluminum Framing",
  "05 21": "Steel Joist Framing",
  "05 31": "Steel Decking",
  "05 36": "Composite Metal Decking",
  "05 41": "Structural Metal Stud Framing",
  "05 42": "Cold-Formed Metal Joist Framing",
  "05 43": "Slotted Channel Framing",
  "05 51": "Metal Stairs",
  "05 52": "Metal Railings",
  "05 53": "Metal Gratings",
  "05 54": "Metal Floor Plates",
  "05 55": "Metal Stair Treads and Nosings",
  "05 58": "Formed Metal Fabrications",
  "05 59": "Metal Specialties",
  "05 73": "Decorative Metal Railings",
  "05 75": "Decorative Formed Metal",
  "06 01 40": "Maintenance of Architectural Woodwork",
  "06 05 23": "Wood, Plastic, and Composite Fastenings",
  "06 05 73": "Wood Treatment",
  "06 11": "Wood Framing",
  "06 13": "Heavy Timber Construction",
  "06 16": "Sheathing",
  "06 17": "Shop-Fabricated Structural Wood",
  "06 18": "Glued-Laminated Construction",
  "06 22": "Millwork",
  "06 41": "Architectural Wood Casework",
  "06 46": "Wood Trim",
  "06 51": "Structural Plastic Shapes and Plates",
  "06 53": "Plastic Decking",
  "06 65": "Plastic Trim",
  "06 74": "Composite Gratings",
  "06 81": "Composite Railings",
  "06 82": "Composite Trim",
  "06 83": "Composite Paneling",
  "07 01 50": "Maintenance of Membrane Roofing",
  "07 05 13": "Mobilization Of Crew For Small Quantity Of Roof Work",
  "07 11": "Dampproofing",
  "07 13": "Sheet Waterproofing",
  "07 14": "Fluid-Applied Waterproofing",
  "07 16": "Cementitious and Reactive Waterproofing",
  "07 17": "Bentonite Waterproofing",
  "07 19": "Water Repellents",
  "07 21": "Thermal Insulation",
  "07 22": "Roof and Deck Insulation",
  "07 24": "Exterior Insulation and Finish Systems",
  "07 26": "Vapor Retarders",
  "07 27": "Air Barriers",
  "07 31": "Shingles and Shakes",
  "07 34": "Roofing Underlayment",
  "07 41": "Roof Panels",
  "07 42": "Wall Panels",
  "07 46": "Siding",
  "07 51": "Built-Up Bituminous Roofing",
  "07 52": "Modified Bituminous Membrane Roofing",
  "07 53": "Elastomeric Membrane Roofing",
  "07 54": "Thermoplastic Membrane Roofing",
  "07 55": "Protected Membrane Roofing",
  "07 56": "Fluid-Applied Roofing",
  "07 58": "Roll Roofing",
  "07 59": "Membrane Roofing Termination Bar",
  "07 62": "Sheet Metal Flashing and Trim",
  "07 63": "Sheet Metal Roofing Specialties",
  "07 65": "Flexible Flashing",
  "07 71": "Roof Specialties",
  "07 72": "Roof Accessories",
  "07 73": "Roof Protection Board",
  "07 76": "Roof Pavers",
  "07 81": "Applied Fireproofing",
  "07 84": "Firestopping",
  "07 91": "Preformed Joint Seals",
  "07 92": "Joint Sealants",
  "07 95": "Expansion Control",
  "08 01 10": "Operation and Maintenance of Doors and Frames",
  "08 01 50": "Operation and Maintenance of Windows",
  "08 01 80": "Maintenance of Glazing",
  "08 05 13": "Door Options and Modifications",
  "08 11": "Metal Doors and Frames",
  "08 12": "Metal Frames",
  "08 13": "Metal Doors",
  "08 14": "Wood Doors",
  "08 16": "Composite Doors",
  "08 31": "Access Doors and Panels",
  "08 33": "Coiling Doors and Grilles",
  "08 34": "Special Function Doors",
  "08 36": "Panel Doors",
  "08 42": "Entrances",
  "08 43": "Storefronts",
  "08 51": "Metal Windows",
  "08 52": "Wood Windows",
  "08 53": "Plastic Windows",
  "08 56": "Special Function Windows",
  "08 62": "Unit Skylights",
  "08 63": "Metal-Framed Skylights",
  "08 66": "Wood-Framed Skylights",
  "08 71": "Door Hardware",
  "08 72": "Weatherstripping, Thresholds and Seals",
  "08 81": "Glass Glazing",
  "08 83": "Mirrors",
  "08 84": "Plastic Glazing",
  "08 87": "Glazing Surface Films",
  "08 88": "Special Function Glazing",
  "08 91": "Louvers",
  "08 95": "Vents",
  "09 01 20": "Maintenance of Plaster and Gypsum Board",
  "09 01 30": "Maintenance of Tiling",
  "09 01 60": "Maintenance of Flooring",
  "09 01 90": "Maintenance of Painting and Coating",
  "09 22": "Supports for Plaster and Gypsum Board",
  "09 23": "Gypsum Plastering",
  "09 24": "Cement Plastering",
  "09 28": "Backing Boards and Underlayments",
  "09 29": "Gypsum Board",
  "09 30 13": "Ceramic Tiling",
  "09 30 16": "Quarry Tiling",
  "09 31": "Thin-Set Tiling",
  "09 32": "Mortar-Bed Tiling",
  "09 34": "Waterproofing-Membrane Tiling",
  "09 35": "Chemical-Resistant Tiling",
  "09 39": "Tiling Transitions",
  "09 51": "Acoustical Ceilings",
  "09 53": "Acoustical Ceiling Suspension Assemblies",
  "09 57": "Special Function Ceilings",
  "09 61": "Flooring Treatment",
  "09 63": "Masonry Flooring",
  "09 64": "Wood Flooring",
  "09 65": "Resilient Flooring",
  "09 66": "Terrazzo Flooring",
  "09 67": "Fluid-Applied Flooring",
  "09 68": "Carpeting",
  "09 69": "Access Flooring",
  "09 72": "Wall Coverings",
  "09 81": "Acoustic Insulation",
  "09 84": "Acoustic Room Components",
  "09 91": "Painting",
  "09 93": "Staining and Transparent Finishing",
  "09 96": "High-Performance Coatings",
  "09 97": "Special Coatings",
  "10 01 40": "Operation and Maintenance of Safety Specialties",
  "10 01 50": "Operation and Maintenance of Storage Specialties",
  "10 11": "Visual Display Units",
  "10 13": "Directories",
  "10 14": "Signage",
  "10 21": "Compartments and Cubicles",
  "10 22": "Partitions",
  "10 26": "Wall and Door Protection",
  "10 28": "Toilet, Bath, and Laundry Accessories",
  "10 41": "Emergency Access And Information Cabinets",
  "10 44": "Fire Protection Specialties",
  "10 51": "Lockers",
  "10 75": "Flagpoles",
  "10 81": "Pest Control Devices",
  "10 86": "Security Mirrors And Domes",
  "11 13": "Loading Dock Equipment",
  "11 28": "Office Equipment",
  "11 30 13": "Residential Appliances",
  "11 30 33": "Retractable Stairs",
  "11 48": "Foodservice Cleaning and Disposal Equipment",
  "11 52": "Audio-Visual Equipment",
  "11 53": "Laboratory Equipment",
  "11 71": "Medical Sterilizing Equipment",
  "11 72": "Examination and Treatment Equipment",
  "11 73": "Patient Care Equipment",
  "11 78": "Mortuary Equipment",
  "11 81": "Maintenance Equipment",
  "12 01 60": "Operation and Maintenance of Multiple Seating",
  "12 21": "Window Blinds",
  "12 22": "Curtains and Drapes",
  "12 24": "Window Shades",
  "12 31": "Manufactured Metal Casework",
  "12 35": "Specialty Casework",
  "12 36": "Countertops",
  "12 56": "Institutional Furniture",
  "12 61": "Fixed Audience Seating",
  "13 26": "Fabricated Rooms",
  "13 46": "Lightning Protection Systems",
  "13 47": "Facility Protection",
  "13 48": "Sound, Vibration, and Seismic Control",
  "13 49": "Radiation Protection",
  "14 21": "Electric Traction Elevators",
  "14 24": "Hydraulic Elevators",
  "14 26": "Limited-Use/Limited-Application Elevators",
  "14 27": "Custom Elevator Cabs and Doors",
  "14 28": "Elevator Equipment and Controls",
  "14 42": "Wheelchair Lifts",
  "21 01 10": "Operation and Maintenance of Water-Based Fire-Suppression Systems",
  "21 01 30": "Operation and Maintenance of Fire-Suppression Equipment",
  "21 05 13": "Common Motor Requirements for Fire-Suppression Equipment",
  "21 05 16": "Expansion Fittings and Loops for Fire-Suppression Piping",
  "21 05 17": "Sleeves and Sleeve Seals for Fire-Suppression Piping",
  "21 05 19": "Meters and Gages for Fire-Suppression Systems",
  "21 05 23": "General-Duty Valves for Water-Based Fire-Suppression Piping",
  "21 05 29": "Hangers and Supports for Fire-Suppression Piping and Equipment",
  "21 05 33": "Heat Tracing for Fire-Suppression Piping",
  "21 05 48": "Vibration and Seismic Controls for Fire-Suppresion Piping and Equipment",
  "21 05 53": "Identification for Fire-Suppression Piping and Equipment",
  "21 07 16": "Fire-Suppression Equipment Insulation",
  "21 07 19": "Fire-Suppression Piping Insulation",
  "21 11": "Facility Fire-Suppression Water-Service Piping",
  "21 12": "Fire-Suppression Standpipes",
  "21 13": "Fire-Suppression Sprinkler Systems",
  "21 21": "Carbon-Dioxide Fire-Extinguishing Systems",
  "21 22": "Clean-Agent Fire-Extinguishing Systems",
  "21 23": "Wet-Chemical Fire-Extinguishing Systems",
  "21 24": "Dry-Chemical Fire-Extinguishing Systems",
  "21 31": "Centrifugal Fire Pumps",
  "21 34": "Fire Pump Accessories",
  "22 01 10": "Operation and Maintenance of Plumbing Piping and Pumps",
  "22 01 40": "Operation and Maintenance of Plumbing Fixtures",
  "22 05 13": "Common Motor Requirements for Plumbing Equipment",
  "22 05 16": "Expansion Fittings and Loops for Plumbing Piping",
  "22 05 17": "Sleeves and Sleeve Seals for Plumbing Piping",
  "22 05 19": "Meters and Gages for Plumbing Piping",
  "22 05 23": "General-Duty Valves for Plumbing Piping",
  "22 05 29": "Hangers and Supports for Plumbing Piping and Equipment",
  "22 05 33": "Heat Tracing for Plumbing Piping",
  "22 05 48": "Vibration and Seismic Controls for Plumbing Piping and Equipment",
  "22 05 53": "Identification for Plumbing Piping and Equipment",
  "22 05 76": "Facility Drainage Piping Cleanouts",
  "22 07 16": "Plumbing Equipment Insulation",
  "22 07 19": "Plumbing Piping Insulation",
  "22 11": "Facility Water Distribution",
  "22 12": "Facility Potable-Water Storage Tanks",
  "22 13": "Facility Sanitary Sewerage",
  "22 14": "Facility Storm Drainage",
  "22 15": "General Service Compressed-Air Systems",
  "22 32": "Domestic Water Filtration Equipment",
  "22 33": "Electric Domestic Water Heaters",
  "22 34": "Fuel-Fired Domestic Water Heaters",
  "22 35": "Domestic Water Heat Exchangers",
  "22 41": "Residential Plumbing Fixtures",
  "22 42": "Commercial Plumbing Fixtures",
  "22 43": "Healthcare Plumbing Fixtures",
  "22 45": "Emergency Plumbing Fixtures",
  "22 46": "Security Plumbing Fixtures",
  "22 47": "Drinking Fountains and Water Coolers",
  "22 63": "Gas Systems for Laboratory and Healthcare Facilities",
  "22 66": "Chemical-Waste Systems for Laboratory and Healthcare Facilities",
  "23 01 10": "Operation and Maintenance of Facility Fuel Systems",
  "23 01 20": "Operation and Maintenance of HVAC Piping and Pumps",
  "23 01 30": "Operation and Maintenance of HVAC Air Distribution",
  "23 01 50": "Operation and Maintenance of Central Heating Equipment",
  "23 01 60": "Operation and Maintenance of Central Cooling Equipment",
  "23 05 13": "Common Motor Requirements for HVAC Equipment",
  "23 05 16": "Expansion Fittings and Loops for HVAC Piping",
  "23 05 17": "Sleeves and Sleeve Seals for HVAC Piping",
  "23 05 19": "Meters and Gages for HVAC Piping",
  "23 05 23": "General-Duty Valves For HVAC Piping",
  "23 05 29": "Hangers and Supports for HVAC Piping and Equipment",
  "23 05 33": "Heat Tracing for HVAC Piping",
  "23 05 48": "Vibration and Seismic Controls for HVAC",
  "23 05 53": "Identification for HVAC Piping and Equipment",
  "23 05 66": "Anti-Microbial Ultraviolet Emitters for HVAC Ducts and Equipment",
  "23 05 93": "Testing, Adjusting, and Balancing for HVAC",
  "23 07 13": "Duct Insulation",
  "23 07 16": "HVAC Equipment Insulation",
  "23 07 19": "HVAC Piping Insulation",
  "23 09 23": "Direct-Digital Control System for HVAC",
  "23 09 43": "Pneumatic Control System For HVAC",
  "23 11": "Facility Fuel Piping",
  "23 12": "Facility Fuel Pumps",
  "23 13": "Facility Fuel-Storage Tanks",
  "23 21": "Hydronic Piping and Pumps",
  "23 22": "Steam and Condensate Piping and Pumps",
  "23 23": "Refrigerant Piping",
  "23 25": "HVAC Water Treatment",
  "23 31": "HVAC Ducts and Casings",
  "23 33": "Air Duct Accessories",
  "23 34": "HVAC Fans",
  "23 36": "Air Terminal Units",
  "23 37": "Air Outlets and Inlets",
  "23 41": "Particulate Air Filtration",
  "23 42": "Gas-Phase Air Filtration",
  "23 43": "Electronic Air Cleaners",
  "23 51": "Breechings, Chimneys, and Stacks",
  "23 52": "Heating Boilers",
  "23 53": "Heating Boiler Feedwater Equipment",
  "23 54": "Furnaces",
  "23 55": "Fuel-Fired Heaters",
  "23 57": "Heat Exchangers for HVAC",
  "23 61": "Refrigerant Compressors",
  "23 62": "Packaged Compressor and Condenser Units",
  "23 63": "Refrigerant Condensers",
  "23 64": "Packaged Water Chillers",
  "23 65": "Cooling Towers",
  "23 71": "Thermal Storage",
  "23 72": "Air-To-Air Energy Recovery Equipment",
  "23 73": "Indoor Central-Station Air-Handling Units",
  "23 74": "Packaged Outdoor HVAC Equipment",
  "23 81": "Decentralized Unitary HVAC Equipment",
  "23 82": "Convection Heating and Cooling Units",
  "23 83": "Radiant Heating Units",
  "23 84": "Humidity Control Equipment",
  "25 55": "Integrated Automation Control of HVAC",
  "26 01 20": "Operation and Maintenance of Low-Voltage Electrical Distribution",
  "26 01 50": "Operation and Maintenance of Lighting",
  "26 05 13": "Medium-Voltage Cables",
  "26 05 19": "Low-Voltage Electrical Power Conductors and Cables",
  "26 05 23": "Control-Voltage Electrical Power Cables",
  "26 05 26": "Grounding and Bonding for Electrical Systems",
  "26 05 29": "Hangers and Supports for Electrical Systems",
  "26 05 33": "Raceway and Boxes for Electrical Systems",
  "26 05 39": "Underfloor Raceways for Electrical Systems",
  "26 05 53": "Identification for Electrical Systems",
  "26 05 83": "Wiring Connections",
  "26 09 23": "Lighting Control Devices",
  "26 12": "Medium-Voltage Transformers",
  "26 18": "Medium-Voltage Circuit Protection Devices",
  "26 21": "Low-Voltage Electrical Service Entrance",
  "26 22": "Low-Voltage Transformers",
  "26 24": "Switchboards and Panelboards",
  "26 25": "Enclosed Bus Assemblies",
  "26 27": "Low-Voltage Distribution Equipment",
  "26 28": "Low-Voltage Circuit Protective Devices",
  "26 29": "Low-Voltage Controllers",
  "26 31": "Photovoltaic Collectors",
  "26 32": "Packaged Generator Assemblies",
  "26 33": "Battery Equipment",
  "26 35": "Power Filters and Conditioners",
  "26 36": "Transfer Switches",
  "26 43": "Surge Protective Devices",
  "26 51": "Interior Lighting",
  "26 52": "Safety Lighting",
  "26 55": "Special Purpose Lighting",
  "26 56": "Exterior Lighting",
  "27 05 26": "Grounding and Bonding for Communications Systems",
  "27 05 29": "Hangers and Supports for Communications Systems",
  "27 05 33": "Conduits and Backboxes for Communications Systems",
  "27 05 39": "Surface Raceways for Communications Systems",
  "27 05 53": "Identification for Communications Systems",
  "27 11": "Communications Equipment Room Fittings",
  "27 13": "Communications Backbone Cabling",
  "27 15": "Communications Horizontal Cabling",
  "27 16": "Communications Connecting Cords, Devices, and Adapters",
  "27 21": "Data Communications Network Equipment",
  "27 32": "Voice Communications Terminal Equipment",
  "27 51": "Distributed Audio-Video Communications Systems",
  "27 52": "Healthcare Communications and Monitoring Systems",
  "27 53": "Distributed Systems",
  "28 05 26": "Grounding and Bonding for Electronic Safety and Security",
  "28 05 53": "Identification for Electronic Safety and Security",
  "28 15": "Integrated Access Control Hardware Devices",
  "28 16": "Access Control Interfaces",
  "28 21": "Surveillance Cameras",
  "28 42": "Gas Detection and Alarm",
  "28 46": "Fire Detection and Alarm",
  "28 47": "Mass Notification",
  "28 49": "Electronic Personal Protection Systems",
  "31 05 13": "Soils for Earthwork",
  "31 05 16": "Aggregates for Earthwork",
  "31 13": "Selective Tree and Shrub Removal and Trimming",
  "31 22": "Grading",
  "31 23": "Excavation and Fill",
  "31 24": "Embankments",
  "31 25": "Erosion and Sedimentation Controls",
  "31 32": "Soil Stabilization",
  "31 35": "Slope Protection",
  "31 36": "Gabions",
  "31 37": "Riprap",
  "31 41": "Shoring",
  "31 43": "Concrete Raising",
  "32 01 11": "Paving Cleaning",
  "32 01 13": "Flexible Paving Surface Treatment",
  "32 01 16": "Flexible Paving Rehabilitation",
  "32 01 17": "Flexible Paving Repair",
  "32 01 26": "Rigid Paving Rehabilitation",
  "32 01 29": "Rigid Paving Repair",
  "32 01 90": "Operation and Maintenance of Planting",
  "32 11": "Base Courses",
  "32 12": "Flexible Paving",
  "32 13": "Rigid Paving",
  "32 14": "Unit Paving",
  "32 16": "Curbs, Gutters, Sidewalks, and Driveways",
  "32 17": "Paving Specialties",
  "32 18": "Athletic and Recreational Surfacing",
  "32 31": "Fences and Gates",
  "32 32": "Retaining Walls",
  "32 39": "Manufactured Site Specialties",
  "32 91": "Planting Preparation",
  "32 92": "Turf and Grasses",
  "32 93": "Plants",
  "32 94": "Planting Accessories",
  "32 96": "Transplanting",
  "33 01 10": "Operation and Maintenance of Water Utilities",
  "33 01 30": "Operation and Maintenance of Sewer Utilities",
  "33 01 70": "Operation and Maintenance of Electrical Utilities",
  "33 05 09": "Piping Specials for Utilities",
  "33 05 16": "Cast-Iron Utility Pipe",
  "33 05 17": "Copper Utility Pipe and Tubing",
  "33 05 19": "Ductile-Iron Utility Pipe",
  "33 05 24": "Steel Utility Pipe",
  "33 05 27": "Corrugated Metal Utility Pipe",
  "33 05 31": "Thermoplastic Utility Pipe",
  "33 05 33": "Polyethylene Utility Pipe",
  "33 05 39": "Concrete Pipe",
  "33 05 41": "Vitrified Clay Utility Pipe",
  "33 05 97": "Identification and Signage for Utilities"
};

/** Full nested tree structure for navigation */
export const TOC_TREE: TOCTree = {
  "10": {
    "name": "Specialties",
    "sections": {
      "10 01": {
        "name": "Operation and Maintenance of Specialties",
        "subsections": {
          "10 01 40": "Operation and Maintenance of Safety Specialties",
          "10 01 50": "Operation and Maintenance of Storage Specialties"
        }
      },
      "10 10": {
        "name": "Information Specialties",
        "subsections": {
          "10 11": "Visual Display Units",
          "10 13": "Directories",
          "10 14": "Signage"
        }
      },
      "10 20": {
        "name": "Interior Specialties",
        "subsections": {
          "10 21": "Compartments and Cubicles",
          "10 22": "Partitions",
          "10 26": "Wall and Door Protection",
          "10 28": "Toilet, Bath, and Laundry Accessories"
        }
      },
      "10 40": {
        "name": "Safety Specialties",
        "subsections": {
          "10 41": "Emergency Access And Information Cabinets",
          "10 44": "Fire Protection Specialties"
        }
      },
      "10 50": {
        "name": "Storage Specialties",
        "subsections": {
          "10 51": "Lockers"
        }
      },
      "10 70": {
        "name": "Exterior Specialties",
        "subsections": {
          "10 75": "Flagpoles"
        }
      },
      "10 80": {
        "name": "Other Specialties",
        "subsections": {
          "10 81": "Pest Control Devices",
          "10 86": "Security Mirrors And Domes"
        }
      }
    }
  },
  "11": {
    "name": "Equipment",
    "sections": {
      "11 10": {
        "name": "Vehicle and Pedestrian Equipment",
        "subsections": {
          "11 13": "Loading Dock Equipment"
        }
      },
      "11 20": {
        "name": "Commercial Equipment",
        "subsections": {
          "11 28": "Office Equipment"
        }
      },
      "11 30": {
        "name": "Residential Equipment",
        "subsections": {
          "11 30 13": "Residential Appliances",
          "11 30 33": "Retractable Stairs"
        }
      },
      "11 40": {
        "name": "Foodservice Equipment",
        "subsections": {
          "11 48": "Foodservice Cleaning and Disposal Equipment"
        }
      },
      "11 50": {
        "name": "Educational and Scientific Equipment",
        "subsections": {
          "11 52": "Audio-Visual Equipment",
          "11 53": "Laboratory Equipment"
        }
      },
      "11 70": {
        "name": "Healthcare Equipment",
        "subsections": {
          "11 71": "Medical Sterilizing Equipment",
          "11 72": "Examination and Treatment Equipment",
          "11 73": "Patient Care Equipment",
          "11 78": "Mortuary Equipment"
        }
      },
      "11 80": {
        "name": "Facility Maintenance and Operation Equipment",
        "subsections": {
          "11 81": "Maintenance Equipment"
        }
      }
    }
  },
  "12": {
    "name": "Furnishings",
    "sections": {
      "12 01": {
        "name": "Operation and Maintenance of Furnishings",
        "subsections": {
          "12 01 60": "Operation and Maintenance of Multiple Seating"
        }
      },
      "12 20": {
        "name": "Window Treatments",
        "subsections": {
          "12 21": "Window Blinds",
          "12 22": "Curtains and Drapes",
          "12 24": "Window Shades"
        }
      },
      "12 30": {
        "name": "Casework",
        "subsections": {
          "12 31": "Manufactured Metal Casework",
          "12 35": "Specialty Casework",
          "12 36": "Countertops"
        }
      },
      "12 50": {
        "name": "Furniture",
        "subsections": {
          "12 56": "Institutional Furniture"
        }
      },
      "12 60": {
        "name": "Multiple Seating",
        "subsections": {
          "12 61": "Fixed Audience Seating"
        }
      }
    }
  },
  "13": {
    "name": "Special Construction",
    "sections": {
      "13 20": {
        "name": "Special Purpose Rooms",
        "subsections": {
          "13 26": "Fabricated Rooms"
        }
      },
      "13 40": {
        "name": "Integrated Construction",
        "subsections": {
          "13 46": "Lightning Protection Systems",
          "13 47": "Facility Protection",
          "13 48": "Sound, Vibration, and Seismic Control",
          "13 49": "Radiation Protection"
        }
      }
    }
  },
  "14": {
    "name": "Conveying Equipment",
    "sections": {
      "14 20": {
        "name": "Elevators",
        "subsections": {
          "14 21": "Electric Traction Elevators",
          "14 24": "Hydraulic Elevators",
          "14 26": "Limited-Use/Limited-Application Elevators",
          "14 27": "Custom Elevator Cabs and Doors",
          "14 28": "Elevator Equipment and Controls"
        }
      },
      "14 40": {
        "name": "Lifts",
        "subsections": {
          "14 42": "Wheelchair Lifts"
        }
      }
    }
  },
  "21": {
    "name": "Fire Suppression",
    "sections": {
      "21 01": {
        "name": "Operation and Maintenance of Fire Suppression",
        "subsections": {
          "21 01 10": "Operation and Maintenance of Water-Based Fire-Suppression Systems",
          "21 01 30": "Operation and Maintenance of Fire-Suppression Equipment"
        }
      },
      "21 05": {
        "name": "Common Work Results for Fire Suppression",
        "subsections": {
          "21 05 13": "Common Motor Requirements for Fire-Suppression Equipment",
          "21 05 16": "Expansion Fittings and Loops for Fire-Suppression Piping",
          "21 05 17": "Sleeves and Sleeve Seals for Fire-Suppression Piping",
          "21 05 19": "Meters and Gages for Fire-Suppression Systems",
          "21 05 23": "General-Duty Valves for Water-Based Fire-Suppression Piping",
          "21 05 29": "Hangers and Supports for Fire-Suppression Piping and Equipment",
          "21 05 33": "Heat Tracing for Fire-Suppression Piping",
          "21 05 48": "Vibration and Seismic Controls for Fire-Suppresion Piping and Equipment",
          "21 05 53": "Identification for Fire-Suppression Piping and Equipment"
        }
      },
      "21 07": {
        "name": "Fire-Suppression Systems Insulation",
        "subsections": {
          "21 07 16": "Fire-Suppression Equipment Insulation",
          "21 07 19": "Fire-Suppression Piping Insulation"
        }
      },
      "21 10": {
        "name": "Water-Based Fire-Suppression Systems",
        "subsections": {
          "21 11": "Facility Fire-Suppression Water-Service Piping",
          "21 12": "Fire-Suppression Standpipes",
          "21 13": "Fire-Suppression Sprinkler Systems"
        }
      },
      "21 20": {
        "name": "Fire-Extinguishing Systems",
        "subsections": {
          "21 21": "Carbon-Dioxide Fire-Extinguishing Systems",
          "21 22": "Clean-Agent Fire-Extinguishing Systems",
          "21 23": "Wet-Chemical Fire-Extinguishing Systems",
          "21 24": "Dry-Chemical Fire-Extinguishing Systems"
        }
      },
      "21 30": {
        "name": "Fire Pumps",
        "subsections": {
          "21 31": "Centrifugal Fire Pumps",
          "21 34": "Fire Pump Accessories"
        }
      }
    }
  },
  "22": {
    "name": "Plumbing",
    "sections": {
      "22 01": {
        "name": "Operation and Maintenance of Plumbing",
        "subsections": {
          "22 01 10": "Operation and Maintenance of Plumbing Piping and Pumps",
          "22 01 40": "Operation and Maintenance of Plumbing Fixtures"
        }
      },
      "22 05": {
        "name": "Common Work Results for Plumbing",
        "subsections": {
          "22 05 13": "Common Motor Requirements for Plumbing Equipment",
          "22 05 16": "Expansion Fittings and Loops for Plumbing Piping",
          "22 05 17": "Sleeves and Sleeve Seals for Plumbing Piping",
          "22 05 19": "Meters and Gages for Plumbing Piping",
          "22 05 23": "General-Duty Valves for Plumbing Piping",
          "22 05 29": "Hangers and Supports for Plumbing Piping and Equipment",
          "22 05 33": "Heat Tracing for Plumbing Piping",
          "22 05 48": "Vibration and Seismic Controls for Plumbing Piping and Equipment",
          "22 05 53": "Identification for Plumbing Piping and Equipment",
          "22 05 76": "Facility Drainage Piping Cleanouts"
        }
      },
      "22 07": {
        "name": "Plumbing Insulation",
        "subsections": {
          "22 07 16": "Plumbing Equipment Insulation",
          "22 07 19": "Plumbing Piping Insulation"
        }
      },
      "22 10": {
        "name": "Plumbing Piping",
        "subsections": {
          "22 11": "Facility Water Distribution",
          "22 12": "Facility Potable-Water Storage Tanks",
          "22 13": "Facility Sanitary Sewerage",
          "22 14": "Facility Storm Drainage",
          "22 15": "General Service Compressed-Air Systems"
        }
      },
      "22 30": {
        "name": "Plumbing Equipment",
        "subsections": {
          "22 32": "Domestic Water Filtration Equipment",
          "22 33": "Electric Domestic Water Heaters",
          "22 34": "Fuel-Fired Domestic Water Heaters",
          "22 35": "Domestic Water Heat Exchangers"
        }
      },
      "22 40": {
        "name": "Plumbing Fixtures",
        "subsections": {
          "22 41": "Residential Plumbing Fixtures",
          "22 42": "Commercial Plumbing Fixtures",
          "22 43": "Healthcare Plumbing Fixtures",
          "22 45": "Emergency Plumbing Fixtures",
          "22 46": "Security Plumbing Fixtures",
          "22 47": "Drinking Fountains and Water Coolers"
        }
      },
      "22 60": {
        "name": "Gas and Vacuum Systems for Laboratory and Healthcare Facilities",
        "subsections": {
          "22 63": "Gas Systems for Laboratory and Healthcare Facilities",
          "22 66": "Chemical-Waste Systems for Laboratory and Healthcare Facilities"
        }
      }
    }
  },
  "23": {
    "name": "Heating, Ventilating, and Air-Conditioning (HVAC)",
    "sections": {
      "23 01": {
        "name": "Operation and Maintenance of HVAC Systems",
        "subsections": {
          "23 01 10": "Operation and Maintenance of Facility Fuel Systems",
          "23 01 20": "Operation and Maintenance of HVAC Piping and Pumps",
          "23 01 30": "Operation and Maintenance of HVAC Air Distribution",
          "23 01 50": "Operation and Maintenance of Central Heating Equipment",
          "23 01 60": "Operation and Maintenance of Central Cooling Equipment"
        }
      },
      "23 05": {
        "name": "Common Work Results for HVAC",
        "subsections": {
          "23 05 13": "Common Motor Requirements for HVAC Equipment",
          "23 05 16": "Expansion Fittings and Loops for HVAC Piping",
          "23 05 17": "Sleeves and Sleeve Seals for HVAC Piping",
          "23 05 19": "Meters and Gages for HVAC Piping",
          "23 05 23": "General-Duty Valves For HVAC Piping",
          "23 05 29": "Hangers and Supports for HVAC Piping and Equipment",
          "23 05 33": "Heat Tracing for HVAC Piping",
          "23 05 48": "Vibration and Seismic Controls for HVAC",
          "23 05 53": "Identification for HVAC Piping and Equipment",
          "23 05 66": "Anti-Microbial Ultraviolet Emitters for HVAC Ducts and Equipment",
          "23 05 93": "Testing, Adjusting, and Balancing for HVAC"
        }
      },
      "23 07": {
        "name": "HVAC Insulation",
        "subsections": {
          "23 07 13": "Duct Insulation",
          "23 07 16": "HVAC Equipment Insulation",
          "23 07 19": "HVAC Piping Insulation"
        }
      },
      "23 08": {
        "name": "Commissioning of HVAC",
        "subsections": {}
      },
      "23 09": {
        "name": "Instrumentation and Control for HVAC",
        "subsections": {
          "23 09 23": "Direct-Digital Control System for HVAC",
          "23 09 43": "Pneumatic Control System For HVAC"
        }
      },
      "23 10": {
        "name": "Facility Fuel Systems",
        "subsections": {
          "23 11": "Facility Fuel Piping",
          "23 12": "Facility Fuel Pumps",
          "23 13": "Facility Fuel-Storage Tanks"
        }
      },
      "23 20": {
        "name": "HVAC Piping and Pumps",
        "subsections": {
          "23 21": "Hydronic Piping and Pumps",
          "23 22": "Steam and Condensate Piping and Pumps",
          "23 23": "Refrigerant Piping",
          "23 25": "HVAC Water Treatment"
        }
      },
      "23 30": {
        "name": "HVAC Air Distribution",
        "subsections": {
          "23 31": "HVAC Ducts and Casings",
          "23 33": "Air Duct Accessories",
          "23 34": "HVAC Fans",
          "23 36": "Air Terminal Units",
          "23 37": "Air Outlets and Inlets"
        }
      },
      "23 40": {
        "name": "HVAC Air Cleaning Devices",
        "subsections": {
          "23 41": "Particulate Air Filtration",
          "23 42": "Gas-Phase Air Filtration",
          "23 43": "Electronic Air Cleaners"
        }
      },
      "23 50": {
        "name": "Central Heating Equipment",
        "subsections": {
          "23 51": "Breechings, Chimneys, and Stacks",
          "23 52": "Heating Boilers",
          "23 53": "Heating Boiler Feedwater Equipment",
          "23 54": "Furnaces",
          "23 55": "Fuel-Fired Heaters",
          "23 57": "Heat Exchangers for HVAC"
        }
      },
      "23 60": {
        "name": "Central Cooling Equipment",
        "subsections": {
          "23 61": "Refrigerant Compressors",
          "23 62": "Packaged Compressor and Condenser Units",
          "23 63": "Refrigerant Condensers",
          "23 64": "Packaged Water Chillers",
          "23 65": "Cooling Towers"
        }
      },
      "23 70": {
        "name": "Central HVAC Equipment",
        "subsections": {
          "23 71": "Thermal Storage",
          "23 72": "Air-To-Air Energy Recovery Equipment",
          "23 73": "Indoor Central-Station Air-Handling Units",
          "23 74": "Packaged Outdoor HVAC Equipment"
        }
      },
      "23 80": {
        "name": "Decentralized Unitary HVAC Equipment",
        "subsections": {
          "23 81": "Decentralized Unitary HVAC Equipment",
          "23 82": "Convection Heating and Cooling Units",
          "23 83": "Radiant Heating Units",
          "23 84": "Humidity Control Equipment"
        }
      }
    }
  },
  "25": {
    "name": "Integrated Automation",
    "sections": {
      "25 50": {
        "name": "Integrated Automation Facility Controls",
        "subsections": {
          "25 55": "Integrated Automation Control of HVAC"
        }
      }
    }
  },
  "26": {
    "name": "Electrical",
    "sections": {
      "26 01": {
        "name": "Operation and Maintenance of Electrical Systems",
        "subsections": {
          "26 01 20": "Operation and Maintenance of Low-Voltage Electrical Distribution",
          "26 01 50": "Operation and Maintenance of Lighting"
        }
      },
      "26 05": {
        "name": "Common Work Results for Electrical",
        "subsections": {
          "26 05 13": "Medium-Voltage Cables",
          "26 05 19": "Low-Voltage Electrical Power Conductors and Cables",
          "26 05 23": "Control-Voltage Electrical Power Cables",
          "26 05 26": "Grounding and Bonding for Electrical Systems",
          "26 05 29": "Hangers and Supports for Electrical Systems",
          "26 05 33": "Raceway and Boxes for Electrical Systems",
          "26 05 39": "Underfloor Raceways for Electrical Systems",
          "26 05 53": "Identification for Electrical Systems",
          "26 05 83": "Wiring Connections"
        }
      },
      "26 09": {
        "name": "Instrumentation and Control for Electrical Systems",
        "subsections": {
          "26 09 23": "Lighting Control Devices"
        }
      },
      "26 10": {
        "name": "Medium-Voltage Electrical Distribution",
        "subsections": {
          "26 12": "Medium-Voltage Transformers",
          "26 18": "Medium-Voltage Circuit Protection Devices"
        }
      },
      "26 20": {
        "name": "Low-Voltage Electrical Distribution",
        "subsections": {
          "26 21": "Low-Voltage Electrical Service Entrance",
          "26 22": "Low-Voltage Transformers",
          "26 24": "Switchboards and Panelboards",
          "26 25": "Enclosed Bus Assemblies",
          "26 27": "Low-Voltage Distribution Equipment",
          "26 28": "Low-Voltage Circuit Protective Devices",
          "26 29": "Low-Voltage Controllers"
        }
      },
      "26 30": {
        "name": "Facility Electrical Power Generating and Storing Equipment",
        "subsections": {
          "26 31": "Photovoltaic Collectors",
          "26 32": "Packaged Generator Assemblies",
          "26 33": "Battery Equipment",
          "26 35": "Power Filters and Conditioners",
          "26 36": "Transfer Switches"
        }
      },
      "26 40": {
        "name": "Electrical And Cathodic Protection",
        "subsections": {
          "26 43": "Surge Protective Devices"
        }
      },
      "26 50": {
        "name": "Lighting",
        "subsections": {
          "26 51": "Interior Lighting",
          "26 52": "Safety Lighting",
          "26 55": "Special Purpose Lighting",
          "26 56": "Exterior Lighting"
        }
      }
    }
  },
  "27": {
    "name": "Communications",
    "sections": {
      "27 05": {
        "name": "Common Work Results for Communications",
        "subsections": {
          "27 05 26": "Grounding and Bonding for Communications Systems",
          "27 05 29": "Hangers and Supports for Communications Systems",
          "27 05 33": "Conduits and Backboxes for Communications Systems",
          "27 05 39": "Surface Raceways for Communications Systems",
          "27 05 53": "Identification for Communications Systems"
        }
      },
      "27 10": {
        "name": "Structured Cabling",
        "subsections": {
          "27 11": "Communications Equipment Room Fittings",
          "27 13": "Communications Backbone Cabling",
          "27 15": "Communications Horizontal Cabling",
          "27 16": "Communications Connecting Cords, Devices, and Adapters"
        }
      },
      "27 20": {
        "name": "Data Communications",
        "subsections": {
          "27 21": "Data Communications Network Equipment"
        }
      },
      "27 30": {
        "name": "Voice Communications",
        "subsections": {
          "27 32": "Voice Communications Terminal Equipment"
        }
      },
      "27 50": {
        "name": "Distributed Communications and Monitoring Systems",
        "subsections": {
          "27 51": "Distributed Audio-Video Communications Systems",
          "27 52": "Healthcare Communications and Monitoring Systems",
          "27 53": "Distributed Systems"
        }
      }
    }
  },
  "28": {
    "name": "Electronic Safety and Security",
    "sections": {
      "28 05": {
        "name": "Common Work Results for Electronic Safety and Security",
        "subsections": {
          "28 05 26": "Grounding and Bonding for Electronic Safety and Security",
          "28 05 53": "Identification for Electronic Safety and Security"
        }
      },
      "28 10": {
        "name": "Access Control",
        "subsections": {
          "28 15": "Integrated Access Control Hardware Devices",
          "28 16": "Access Control Interfaces"
        }
      },
      "28 20": {
        "name": "Video Surveillance",
        "subsections": {
          "28 21": "Surveillance Cameras"
        }
      },
      "28 40": {
        "name": "Life Safety",
        "subsections": {
          "28 42": "Gas Detection and Alarm",
          "28 46": "Fire Detection and Alarm",
          "28 47": "Mass Notification",
          "28 49": "Electronic Personal Protection Systems"
        }
      }
    }
  },
  "31": {
    "name": "Earthwork",
    "sections": {
      "31 05": {
        "name": "Common Work Results for Earthwork",
        "subsections": {
          "31 05 13": "Soils for Earthwork",
          "31 05 16": "Aggregates for Earthwork"
        }
      },
      "31 10": {
        "name": "Site Clearing",
        "subsections": {
          "31 13": "Selective Tree and Shrub Removal and Trimming"
        }
      },
      "31 20": {
        "name": "Earth Moving",
        "subsections": {
          "31 22": "Grading",
          "31 23": "Excavation and Fill",
          "31 24": "Embankments",
          "31 25": "Erosion and Sedimentation Controls"
        }
      },
      "31 30": {
        "name": "Earthwork Methods",
        "subsections": {
          "31 32": "Soil Stabilization",
          "31 35": "Slope Protection",
          "31 36": "Gabions",
          "31 37": "Riprap"
        }
      },
      "31 40": {
        "name": "Shoring and Underpinning",
        "subsections": {
          "31 41": "Shoring",
          "31 43": "Concrete Raising"
        }
      }
    }
  },
  "32": {
    "name": "Exterior Improvements",
    "sections": {
      "32 01": {
        "name": "Operation and Maintenance of Exterior Improvements",
        "subsections": {
          "32 01 11": "Paving Cleaning",
          "32 01 13": "Flexible Paving Surface Treatment",
          "32 01 16": "Flexible Paving Rehabilitation",
          "32 01 17": "Flexible Paving Repair",
          "32 01 26": "Rigid Paving Rehabilitation",
          "32 01 29": "Rigid Paving Repair",
          "32 01 90": "Operation and Maintenance of Planting"
        }
      },
      "32 10": {
        "name": "Bases, Ballasts, and Paving",
        "subsections": {
          "32 11": "Base Courses",
          "32 12": "Flexible Paving",
          "32 13": "Rigid Paving",
          "32 14": "Unit Paving",
          "32 16": "Curbs, Gutters, Sidewalks, and Driveways",
          "32 17": "Paving Specialties",
          "32 18": "Athletic and Recreational Surfacing"
        }
      },
      "32 30": {
        "name": "Site Improvements",
        "subsections": {
          "32 31": "Fences and Gates",
          "32 32": "Retaining Walls",
          "32 39": "Manufactured Site Specialties"
        }
      },
      "32 90": {
        "name": "Planting",
        "subsections": {
          "32 91": "Planting Preparation",
          "32 92": "Turf and Grasses",
          "32 93": "Plants",
          "32 94": "Planting Accessories",
          "32 96": "Transplanting"
        }
      }
    }
  },
  "33": {
    "name": "Utilities",
    "sections": {
      "33 01": {
        "name": "Operation and Maintenance of Utilities",
        "subsections": {
          "33 01 10": "Operation and Maintenance of Water Utilities",
          "33 01 30": "Operation and Maintenance of Sewer Utilities",
          "33 01 70": "Operation and Maintenance of Electrical Utilities"
        }
      },
      "33 05": {
        "name": "Common Work Results for Utilities",
        "subsections": {
          "33 05 09": "Piping Specials for Utilities",
          "33 05 16": "Cast-Iron Utility Pipe",
          "33 05 17": "Copper Utility Pipe and Tubing",
          "33 05 19": "Ductile-Iron Utility Pipe",
          "33 05 24": "Steel Utility Pipe",
          "33 05 27": "Corrugated Metal Utility Pipe",
          "33 05 31": "Thermoplastic Utility Pipe",
          "33 05 33": "Polyethylene Utility Pipe",
          "33 05 39": "Concrete Pipe",
          "33 05 41": "Vitrified Clay Utility Pipe",
          "33 05 97": "Identification and Signage for Utilities"
        }
      },
      "33 10": {
        "name": "Water Utilities",
        "subsections": {}
      }
    }
  },
  "00": {
    "name": "Using The Construction Task Catalog",
    "sections": {}
  },
  "01": {
    "name": "General Requirements",
    "sections": {
      "01 10": {
        "name": "Summary",
        "subsections": {
          "01 11": "Summary Of Work"
        }
      },
      "01 20": {
        "name": "Price and Payment Procedures",
        "subsections": {
          "01 22": "Unit Prices"
        }
      },
      "01 40": {
        "name": "Quality Requirements",
        "subsections": {
          "01 41": "Regulatory Requirements",
          "01 42": "References",
          "01 45": "Quality Control"
        }
      },
      "01 50": {
        "name": "Temporary Facilities and Controls",
        "subsections": {
          "01 51": "Temporary Utilities",
          "01 52": "Construction Facilities",
          "01 53": "Temporary Construction",
          "01 54": "Construction Aids",
          "01 55": "Vehicular Access and Parking",
          "01 56": "Temporary Barriers and Enclosures",
          "01 57": "Temporary Controls",
          "01 58": "Project Identification"
        }
      },
      "01 60": {
        "name": "Product Requirements",
        "subsections": {
          "01 66": "Product Storage and Handling Requirements"
        }
      },
      "01 70": {
        "name": "Execution and Closeout Requirements",
        "subsections": {
          "01 71": "Examination and Preparation",
          "01 74": "Cleaning and Waste Management"
        }
      }
    }
  },
  "02": {
    "name": "Existing Conditions",
    "sections": {
      "02 20": {
        "name": "Assessment",
        "subsections": {
          "02 25": "Existing Material Assessment"
        }
      },
      "02 40": {
        "name": "Demolition and Structure Moving",
        "subsections": {
          "02 41": "Demolition",
          "02 42": "Removal and Salvage of Construction Materials"
        }
      },
      "02 60": {
        "name": "Contaminated Site Material Removal",
        "subsections": {
          "02 61": "Removal and Disposal of Contaminated Soils",
          "02 65": "Underground Storage Tank Removal"
        }
      },
      "02 80": {
        "name": "Facility Remediation",
        "subsections": {
          "02 82": "Asbestos Remediation",
          "02 83": "Lead Remediation",
          "02 84": "Polychlorinated Biphenyl Remediation",
          "02 87": "Bio-Hazard Material Remediation",
          "02 89": "Hazmat Ancillary Tasks and Support"
        }
      }
    }
  },
  "03": {
    "name": "Concrete",
    "sections": {
      "03 01": {
        "name": "Maintenance of Concrete",
        "subsections": {
          "03 01 30": "Maintenance of Cast-In-Place Concrete"
        }
      },
      "03 05": {
        "name": "Common Work Results For Concrete",
        "subsections": {
          "03 05 13": "Concrete Admixtures"
        }
      },
      "03 10": {
        "name": "Concrete Forming and Accessories",
        "subsections": {
          "03 11": "Concrete Forming",
          "03 15": "Concrete Accessories"
        }
      },
      "03 20": {
        "name": "Concrete Reinforcing",
        "subsections": {
          "03 21": "Reinforcement Bars",
          "03 22": "Fabric and Grid Reinforcing"
        }
      },
      "03 30": {
        "name": "Cast-In-Place Concrete",
        "subsections": {
          "03 30 53": "Miscellaneous Cast-in-Place Concrete",
          "03 31": "Structural Concrete",
          "03 35": "Concrete Finishing",
          "03 37": "Specialty Placed Concrete",
          "03 39": "Concrete Curing"
        }
      },
      "03 40": {
        "name": "Precast Concrete",
        "subsections": {
          "03 48": "Precast Concrete Specialties"
        }
      },
      "03 50": {
        "name": "Cast Decks and Underlayment",
        "subsections": {
          "03 53": "Concrete Topping",
          "03 54": "Cast Underlayment"
        }
      },
      "03 60": {
        "name": "Grouting",
        "subsections": {
          "03 61": "Cementitious Grouting",
          "03 62": "Non-Shrink Grouting",
          "03 63": "Epoxy Grouting",
          "03 64": "Injection Grouting"
        }
      },
      "03 80": {
        "name": "Concrete Cutting and Boring",
        "subsections": {
          "03 81": "Concrete Cutting",
          "03 82": "Concrete Boring"
        }
      }
    }
  },
  "04": {
    "name": "Masonry",
    "sections": {
      "04 01": {
        "name": "Maintenance of Masonry",
        "subsections": {
          "04 01 20": "Maintenance of Unit Masonry",
          "04 01 50": "Maintenance of Refractory Masonry"
        }
      },
      "04 05": {
        "name": "Common Work Results for Masonry",
        "subsections": {
          "04 05 13": "Masonry Mortaring",
          "04 05 16": "Masonry Grouting",
          "04 05 19": "Masonry Anchorage and Reinforcing",
          "04 05 23": "Masonry Accessories"
        }
      },
      "04 20": {
        "name": "Unit Masonry",
        "subsections": {
          "04 21": "Clay Unit Masonry",
          "04 22": "Concrete Unit Masonry",
          "04 23": "Glass Unit Masonry"
        }
      },
      "04 40": {
        "name": "Stone Assemblies",
        "subsections": {
          "04 41": "Dry-Placed Stone",
          "04 42": "Exterior Stone Cladding",
          "04 43": "Stone Masonry"
        }
      },
      "04 50": {
        "name": "Refractory Masonry",
        "subsections": {
          "04 51": "Flue Liner Masonry"
        }
      },
      "04 70": {
        "name": "Manufactured Masonry",
        "subsections": {
          "04 72": "Cast Stone Masonry"
        }
      }
    }
  },
  "05": {
    "name": "Metals",
    "sections": {
      "05 01": {
        "name": "Maintenance of Metals",
        "subsections": {
          "05 01 50": "Maintenance of Metal Fabrications",
          "05 01 70": "Maintenance of Decorative Metal"
        }
      },
      "05 05": {
        "name": "Common Work Results for Metals",
        "subsections": {
          "05 05 19": "Post-Installed Concrete Anchors",
          "05 05 21": "Fastening Methods for Metal",
          "05 05 23": "Metal Fastenings"
        }
      },
      "05 10": {
        "name": "Structural Metal Framing",
        "subsections": {
          "05 12": "Structural Steel Framing",
          "05 14": "Structural Aluminum Framing"
        }
      },
      "05 20": {
        "name": "Metal Joists",
        "subsections": {
          "05 21": "Steel Joist Framing"
        }
      },
      "05 30": {
        "name": "Metal Decking",
        "subsections": {
          "05 31": "Steel Decking",
          "05 36": "Composite Metal Decking"
        }
      },
      "05 40": {
        "name": "Cold-Formed Metal Framing",
        "subsections": {
          "05 41": "Structural Metal Stud Framing",
          "05 42": "Cold-Formed Metal Joist Framing",
          "05 43": "Slotted Channel Framing"
        }
      },
      "05 50": {
        "name": "Metal Fabrications",
        "subsections": {
          "05 51": "Metal Stairs",
          "05 52": "Metal Railings",
          "05 53": "Metal Gratings",
          "05 54": "Metal Floor Plates",
          "05 55": "Metal Stair Treads and Nosings",
          "05 58": "Formed Metal Fabrications",
          "05 59": "Metal Specialties"
        }
      },
      "05 70": {
        "name": "Decorative Metal",
        "subsections": {
          "05 73": "Decorative Metal Railings",
          "05 75": "Decorative Formed Metal"
        }
      }
    }
  },
  "06": {
    "name": "Wood, Plastics, and Composites",
    "sections": {
      "06 01": {
        "name": "Maintenance of Wood, Plastics, and Composites",
        "subsections": {
          "06 01 40": "Maintenance of Architectural Woodwork"
        }
      },
      "06 05": {
        "name": "Common Work Results for Wood, Plastics, and Composites",
        "subsections": {
          "06 05 23": "Wood, Plastic, and Composite Fastenings",
          "06 05 73": "Wood Treatment"
        }
      },
      "06 10": {
        "name": "Rough Carpentry",
        "subsections": {
          "06 11": "Wood Framing",
          "06 13": "Heavy Timber Construction",
          "06 16": "Sheathing",
          "06 17": "Shop-Fabricated Structural Wood",
          "06 18": "Glued-Laminated Construction"
        }
      },
      "06 20": {
        "name": "Finish Carpentry",
        "subsections": {
          "06 22": "Millwork"
        }
      },
      "06 40": {
        "name": "Architectural Woodwork",
        "subsections": {
          "06 41": "Architectural Wood Casework",
          "06 46": "Wood Trim"
        }
      },
      "06 50": {
        "name": "Structural Plastics",
        "subsections": {
          "06 51": "Structural Plastic Shapes and Plates",
          "06 53": "Plastic Decking"
        }
      },
      "06 60": {
        "name": "Plastic Fabrications",
        "subsections": {
          "06 65": "Plastic Trim"
        }
      },
      "06 70": {
        "name": "Structural Composites",
        "subsections": {
          "06 74": "Composite Gratings"
        }
      },
      "06 80": {
        "name": "Composite Fabrications",
        "subsections": {
          "06 81": "Composite Railings",
          "06 82": "Composite Trim",
          "06 83": "Composite Paneling"
        }
      }
    }
  },
  "07": {
    "name": "Thermal And Moisture Protection",
    "sections": {
      "07 01": {
        "name": "Operation and Maintenance of Thermal and Moisture Protection",
        "subsections": {
          "07 01 50": "Maintenance of Membrane Roofing"
        }
      },
      "07 05": {
        "name": "Common Work Results for Thermal and Moisture Protection",
        "subsections": {
          "07 05 13": "Mobilization Of Crew For Small Quantity Of Roof Work"
        }
      },
      "07 10": {
        "name": "Dampproofing and Waterproofing",
        "subsections": {
          "07 11": "Dampproofing",
          "07 13": "Sheet Waterproofing",
          "07 14": "Fluid-Applied Waterproofing",
          "07 16": "Cementitious and Reactive Waterproofing",
          "07 17": "Bentonite Waterproofing",
          "07 19": "Water Repellents"
        }
      },
      "07 20": {
        "name": "Thermal Protection",
        "subsections": {
          "07 21": "Thermal Insulation",
          "07 22": "Roof and Deck Insulation",
          "07 24": "Exterior Insulation and Finish Systems"
        }
      },
      "07 25": {
        "name": "Weather Barriers",
        "subsections": {
          "07 26": "Vapor Retarders",
          "07 27": "Air Barriers"
        }
      },
      "07 30": {
        "name": "Steep Slope Roofing",
        "subsections": {
          "07 31": "Shingles and Shakes",
          "07 34": "Roofing Underlayment"
        }
      },
      "07 40": {
        "name": "Roofing and Siding Panels",
        "subsections": {
          "07 41": "Roof Panels",
          "07 42": "Wall Panels",
          "07 46": "Siding"
        }
      },
      "07 50": {
        "name": "Membrane Roofing",
        "subsections": {
          "07 51": "Built-Up Bituminous Roofing",
          "07 52": "Modified Bituminous Membrane Roofing",
          "07 53": "Elastomeric Membrane Roofing",
          "07 54": "Thermoplastic Membrane Roofing",
          "07 55": "Protected Membrane Roofing",
          "07 56": "Fluid-Applied Roofing",
          "07 58": "Roll Roofing",
          "07 59": "Membrane Roofing Termination Bar"
        }
      },
      "07 60": {
        "name": "Flashing and Sheet Metal",
        "subsections": {
          "07 62": "Sheet Metal Flashing and Trim",
          "07 63": "Sheet Metal Roofing Specialties",
          "07 65": "Flexible Flashing"
        }
      },
      "07 70": {
        "name": "Roof and Wall Specialties and Accessories",
        "subsections": {
          "07 71": "Roof Specialties",
          "07 72": "Roof Accessories",
          "07 73": "Roof Protection Board",
          "07 76": "Roof Pavers"
        }
      },
      "07 80": {
        "name": "Fire and Smoke Protection",
        "subsections": {
          "07 81": "Applied Fireproofing",
          "07 84": "Firestopping"
        }
      },
      "07 90": {
        "name": "Joint Protection",
        "subsections": {
          "07 91": "Preformed Joint Seals",
          "07 92": "Joint Sealants",
          "07 95": "Expansion Control"
        }
      }
    }
  },
  "08": {
    "name": "Openings",
    "sections": {
      "08 01": {
        "name": "Operation and Maintenance of Openings",
        "subsections": {
          "08 01 10": "Operation and Maintenance of Doors and Frames",
          "08 01 50": "Operation and Maintenance of Windows",
          "08 01 80": "Maintenance of Glazing"
        }
      },
      "08 05": {
        "name": "Common Work Results for Openings",
        "subsections": {
          "08 05 13": "Door Options and Modifications"
        }
      },
      "08 10": {
        "name": "Doors and Frames",
        "subsections": {
          "08 11": "Metal Doors and Frames",
          "08 12": "Metal Frames",
          "08 13": "Metal Doors",
          "08 14": "Wood Doors",
          "08 16": "Composite Doors"
        }
      },
      "08 30": {
        "name": "Specialty Doors and Frames",
        "subsections": {
          "08 31": "Access Doors and Panels",
          "08 33": "Coiling Doors and Grilles",
          "08 34": "Special Function Doors",
          "08 36": "Panel Doors"
        }
      },
      "08 40": {
        "name": "Entrances, Storefronts, and Curtain Walls",
        "subsections": {
          "08 42": "Entrances",
          "08 43": "Storefronts"
        }
      },
      "08 50": {
        "name": "Windows",
        "subsections": {
          "08 51": "Metal Windows",
          "08 52": "Wood Windows",
          "08 53": "Plastic Windows",
          "08 56": "Special Function Windows"
        }
      },
      "08 60": {
        "name": "Roof Windows and Skylights",
        "subsections": {
          "08 62": "Unit Skylights",
          "08 63": "Metal-Framed Skylights",
          "08 66": "Wood-Framed Skylights"
        }
      },
      "08 70": {
        "name": "Hardware",
        "subsections": {
          "08 71": "Door Hardware",
          "08 72": "Weatherstripping, Thresholds and Seals"
        }
      },
      "08 80": {
        "name": "Glazing",
        "subsections": {
          "08 81": "Glass Glazing",
          "08 83": "Mirrors",
          "08 84": "Plastic Glazing",
          "08 87": "Glazing Surface Films",
          "08 88": "Special Function Glazing"
        }
      },
      "08 90": {
        "name": "Louvers and Vents",
        "subsections": {
          "08 91": "Louvers",
          "08 95": "Vents"
        }
      }
    }
  },
  "09": {
    "name": "Finishes",
    "sections": {
      "09 01": {
        "name": "Maintenance of Finishes",
        "subsections": {
          "09 01 20": "Maintenance of Plaster and Gypsum Board",
          "09 01 30": "Maintenance of Tiling",
          "09 01 60": "Maintenance of Flooring",
          "09 01 90": "Maintenance of Painting and Coating"
        }
      },
      "09 20": {
        "name": "Plaster and Gypsum Board",
        "subsections": {
          "09 22": "Supports for Plaster and Gypsum Board",
          "09 23": "Gypsum Plastering",
          "09 24": "Cement Plastering",
          "09 28": "Backing Boards and Underlayments",
          "09 29": "Gypsum Board"
        }
      },
      "09 30": {
        "name": "Tiling",
        "subsections": {
          "09 30 13": "Ceramic Tiling",
          "09 30 16": "Quarry Tiling",
          "09 31": "Thin-Set Tiling",
          "09 32": "Mortar-Bed Tiling",
          "09 34": "Waterproofing-Membrane Tiling",
          "09 35": "Chemical-Resistant Tiling",
          "09 39": "Tiling Transitions"
        }
      },
      "09 50": {
        "name": "Ceilings",
        "subsections": {
          "09 51": "Acoustical Ceilings",
          "09 53": "Acoustical Ceiling Suspension Assemblies",
          "09 57": "Special Function Ceilings"
        }
      },
      "09 60": {
        "name": "Flooring",
        "subsections": {
          "09 61": "Flooring Treatment",
          "09 63": "Masonry Flooring",
          "09 64": "Wood Flooring",
          "09 65": "Resilient Flooring",
          "09 66": "Terrazzo Flooring",
          "09 67": "Fluid-Applied Flooring",
          "09 68": "Carpeting",
          "09 69": "Access Flooring"
        }
      },
      "09 70": {
        "name": "Wall Finishes",
        "subsections": {
          "09 72": "Wall Coverings"
        }
      },
      "09 80": {
        "name": "Acoustic Treatment",
        "subsections": {
          "09 81": "Acoustic Insulation",
          "09 84": "Acoustic Room Components"
        }
      },
      "09 90": {
        "name": "Painting and Coating",
        "subsections": {
          "09 91": "Painting",
          "09 93": "Staining and Transparent Finishing",
          "09 96": "High-Performance Coatings",
          "09 97": "Special Coatings"
        }
      }
    }
  }
};

/** Get division name by code */
export function getDivisionName(code: string): string | undefined {
  return DIVISIONS[code.padStart(2, '0')];
}

/** Get section name by code */
export function getSectionName(code: string): string | undefined {
  return SECTIONS[code];
}

/** Get subsection name by code */
export function getSubsectionName(code: string): string | undefined {
  return SUBSECTIONS[code];
}

/** Get all sections for a division */
export function getSectionsForDivision(divCode: string): Record<string, TOCSection> {
  const div = TOC_TREE[divCode.padStart(2, '0')];
  return div?.sections || {};
}

/** Get all subsections for a section */
export function getSubsectionsForSection(divCode: string, sectionCode: string): Record<string, string> {
  const div = TOC_TREE[divCode.padStart(2, '0')];
  const section = div?.sections[sectionCode];
  return section?.subsections || {};
}

/** Parse a task code and return hierarchy info */
export function parseTaskCode(taskCode: string): {
  division: string;
  divisionName?: string;
  section?: string;
  sectionName?: string;
  subsection?: string;
  subsectionName?: string;
} {
  // Task code format: DDSSSSNN-IIII or variations
  const clean = taskCode.replace(/[^0-9]/g, '');
  const division = clean.substring(0, 2);
  const section = clean.length >= 4 ? `${division} ${clean.substring(2, 4)}` : undefined;
  const subsection = clean.length >= 6 ? `${division} ${clean.substring(2, 4)} ${clean.substring(4, 6)}` : undefined;
  
  return {
    division,
    divisionName: DIVISIONS[division],
    section,
    sectionName: section ? SECTIONS[section] : undefined,
    subsection,
    subsectionName: subsection ? SUBSECTIONS[subsection] : undefined
  };
}
