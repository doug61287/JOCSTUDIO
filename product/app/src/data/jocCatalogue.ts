// NYC H+H Construction Task Catalog - Curated for MVP Demo
// Full catalogue: 65,331 items (projects/jocstudio/product/data/nyc-hh-ctc-2024.json)

export interface JOCItem {
  taskCode: string;
  description: string;
  unit: string;
  unitCost: number;
}

/**
 * Search JOC catalogue by task code or description keywords
 * Uses local curated subset (417 items) for instant search
 */
export function searchJOCItems(query: string): JOCItem[] {
  if (!query.trim()) return [];
  
  const q = query.toLowerCase();
  
  // If looks like a task code, search by code prefix
  if (/^\d{2}/.test(query)) {
    return jocCatalogue.filter(item => 
      item.taskCode.toLowerCase().startsWith(q.replace(/\s/g, ''))
    );
  }
  
  // Search by description keywords
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  
  return jocCatalogue.filter(item => {
    const desc = item.description.toLowerCase();
    return words.every(word => desc.includes(word));
  }).sort((a, b) => {
    // Exact match first
    const aExact = a.description.toLowerCase().includes(q) ? 0 : 1;
    const bExact = b.description.toLowerCase().includes(q) ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    // Then by cost (higher first)
    return b.unitCost - a.unitCost;
  });
}

export const jocCatalogue: JOCItem[] = [
  {
    "taskCode": "08011161-0004",
    "description": "Patch Deep Scrapes Or Cuts In Doors",
    "unit": "LF",
    "unitCost": 74.44
  },
  {
    "taskCode": "08051300-0041",
    "description": "Factory Prepare Wood Door (Rated Or Non-Rated) For Mortise Lockset Hardware",
    "unit": "EA",
    "unitCost": 102.51
  },
  {
    "taskCode": "08051300-0042",
    "description": "Prepare Existing Wood Door (Rated) For Mortise Lockset Hardware",
    "unit": "EA",
    "unitCost": 252.85
  },
  {
    "taskCode": "08051300-0043",
    "description": "Prepare Existing Wood Door (Non-Rated) For Mortise Lockset Hardware",
    "unit": "EA",
    "unitCost": 116.18
  },
  {
    "taskCode": "08051300-0044",
    "description": "Prepare Existing Wood Door (Rated) For Cylindrical Lockset Hardware",
    "unit": "EA",
    "unitCost": 205.03
  },
  {
    "taskCode": "08051300-0045",
    "description": "Prepare Existing Wood Door (Non-Rated) For Cylindrical Lockset Hardware",
    "unit": "EA",
    "unitCost": 34.17
  },
  {
    "taskCode": "08051300-0046",
    "description": "Prepare Existing Wood Door (Rated) For Concealed Vertical Rod",
    "unit": "EA",
    "unitCost": 375.91
  },
  {
    "taskCode": "08051300-0047",
    "description": "Prepare Existing Wood Door (Non-Rated) For Concealed Vertical Rod",
    "unit": "EA",
    "unitCost": 239.19
  },
  {
    "taskCode": "08051300-0048",
    "description": "Prepare Existing Wood Door (Rated) For Electric Hardware",
    "unit": "EA",
    "unitCost": 252.85
  },
  {
    "taskCode": "08051300-0049",
    "description": "Prepare Existing Door (Non-Rated) For Electric Hardware",
    "unit": "EA",
    "unitCost": 116.18
  },
  {
    "taskCode": "08051300-0051",
    "description": "Factory Installed Sound Proofing (STC 28) In Metal Door",
    "unit": "EA",
    "unitCost": 114.95
  },
  {
    "taskCode": "08051300-0052",
    "description": "For 16 Gauge Steel Metal Plate Bolted On Door",
    "unit": "SF",
    "unitCost": 26.69
  },
  {
    "taskCode": "08051300-0053",
    "description": "Trim Bottom Of Existing Steel Door For Installation Of Carpet Or Tile",
    "unit": "EA",
    "unitCost": 123.08
  },
  {
    "taskCode": "08051300-0054",
    "description": "Trim Bottom Of Existing Wood Door For Installation Of Carpet Or Tile",
    "unit": "EA",
    "unitCost": 61.85
  },
  {
    "taskCode": "08051300-0055",
    "description": "Modify Metal Door Frame For Door Swing",
    "unit": "EA",
    "unitCost": 1493.65
  },
  {
    "taskCode": "08051300-0057",
    "description": "Removal And Reinstallation Of Metal Door Frame",
    "unit": "EA",
    "unitCost": 227.92
  },
  {
    "taskCode": "08051300-0058",
    "description": "Removal And Reinstallation Of Wood Door Frame",
    "unit": "EA",
    "unitCost": 137.44
  },
  {
    "taskCode": "08121313-0003",
    "description": "2' x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 640.28
  },
  {
    "taskCode": "08121313-0004",
    "description": "2'-4\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 743.68
  },
  {
    "taskCode": "08121313-0005",
    "description": "2'-6\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 765.64
  },
  {
    "taskCode": "08121313-0006",
    "description": "2'-8\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 786.15
  },
  {
    "taskCode": "08121313-0007",
    "description": "2'-10\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 801.28
  },
  {
    "taskCode": "08121313-0008",
    "description": "3' x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 816.41
  },
  {
    "taskCode": "08121313-0009",
    "description": "3'-4\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 867.38
  },
  {
    "taskCode": "08121313-0010",
    "description": "3'-6\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 881.05
  },
  {
    "taskCode": "08121313-0011",
    "description": "4' x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 915.44
  },
  {
    "taskCode": "08121313-0012",
    "description": "5' x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 949.84
  },
  {
    "taskCode": "08121313-0013",
    "description": "5'-4\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 963.51
  },
  {
    "taskCode": "08121313-0014",
    "description": "5'-8\" x 6'-8\" Through 7'-2\" High, 4-3/4\" Deep, 16 Gauge, Knock Down Hollow Metal Door Frame",
    "unit": "EA",
    "unitCost": 980.71
  },
  {
    "taskCode": "08711100-2043",
    "description": "3-1/2\" x 15\" Aluminum Pull Plate Door Hardware (Ives 8302)",
    "unit": "EA",
    "unitCost": 104.23
  },
  {
    "taskCode": "08711100-2044",
    "description": "4\" x 16\" Aluminum Pull Plate Door Hardware (Ives 8302)",
    "unit": "EA",
    "unitCost": 106.67
  },
  {
    "taskCode": "08711100-2045",
    "description": "6\" x 16\" Aluminum Pull Plate Door Hardware (Ives 8302)",
    "unit": "EA",
    "unitCost": 112.22
  },
  {
    "taskCode": "08711100-2055",
    "description": "3\" x 12\", Clear Anodized Finish, Aluminum Push Plate Door Hardware",
    "unit": "EA",
    "unitCost": 51.79
  },
  {
    "taskCode": "08711100-2056",
    "description": "4\" x 16\", Clear Anodized Finish, Aluminum Push Plate Door Hardware",
    "unit": "EA",
    "unitCost": 51.79
  },
  {
    "taskCode": "08711100-2057",
    "description": "6\" x 16\", Clear Anodized Finish, Aluminum Push Plate Door Hardware",
    "unit": "EA",
    "unitCost": 51.79
  },
  {
    "taskCode": "08711100-2058",
    "description": "8\" x 16\", Clear Anodized Finish, Aluminum Push Plate Door Hardware",
    "unit": "EA",
    "unitCost": 56.24
  },
  {
    "taskCode": "08711100-2061",
    "description": "3\" x 12\", Satin Finish, Stainless Steel Push Plate Door Hardware",
    "unit": "EA",
    "unitCost": 51.79
  },
  {
    "taskCode": "09013091-0001",
    "description": "Regrout Floor Tile Including Removal Of Loose Grout",
    "unit": "SF",
    "unitCost": 10.53
  },
  {
    "taskCode": "09013091-0002",
    "description": "Regrout Wall Tile Including Removal Of Loose Grout",
    "unit": "SF",
    "unitCost": 13.15
  },
  {
    "taskCode": "09013091-0003",
    "description": "Up To 1 SF, Cut And Patch Hole In Wall Tile To Match Existing",
    "unit": "SF",
    "unitCost": 66.69
  },
  {
    "taskCode": "09016091-0002",
    "description": "Grinding Of Existing Concrete Floor Prior To Installation Of Flooring",
    "unit": "SY",
    "unitCost": 12.89
  },
  {
    "taskCode": "09016091-0003",
    "description": "Up To 6\" Wide, Hand Detail Work/Grinding At Wall Of Existing Concrete Floor Prior To Installation Of Flooring",
    "unit": "LF",
    "unitCost": 24.93
  },
  {
    "taskCode": "09016091-0004",
    "description": "Chemical Prepare Existing Concrete Floor Prior To Installation Of Flooring",
    "unit": "SY",
    "unitCost": 10.46
  },
  {
    "taskCode": "09016091-0006",
    "description": "Water-Based Emulsion, Masonry/Tile/Stone/Terrazzo Floor Sealant/Finish, Per Coat",
    "unit": "SF",
    "unitCost": 1.79
  },
  {
    "taskCode": "09016091-0007",
    "description": "Water-Based, Clear Acrylic, Concrete Floor Sealant/Finish, Per Coat",
    "unit": "SF",
    "unitCost": 1.97
  },
  {
    "taskCode": "09016091-0008",
    "description": "Fluorochemical Acrylate Copolymer Masonry/Tile/Stone/Terrazzo Floor Sealant",
    "unit": "SF",
    "unitCost": 1.93
  },
  {
    "taskCode": "09016091-0009",
    "description": "Masonry/Tile/Stone/Terrazzo Floor Sealant (Extra To Be Provided To Owner)",
    "unit": "GAL",
    "unitCost": 50.82
  },
  {
    "taskCode": "09019052-0013",
    "description": "Hand Scrape, Repair And Sand Severely Damaged Drywall Surfaces, Surface Preparation",
    "unit": "SF",
    "unitCost": 1.44
  },
  {
    "taskCode": "09019052-0030",
    "description": "Trisodium Phosphate (TSP), Clean Tile Surfaces, Surface Preparation",
    "unit": "SF",
    "unitCost": 0.52
  },
  {
    "taskCode": "09019052-0032",
    "description": "2,000 To 5,000 PSI, Pressure Wash Tile Surfaces, Surface Preparation",
    "unit": "SF",
    "unitCost": 0.49
  },
  {
    "taskCode": "09019052-0034",
    "description": "Prepare New Wood Floor For Finish, Multi Grit Sanding/Screening",
    "unit": "SF",
    "unitCost": 1.8
  },
  {
    "taskCode": "09019052-0043",
    "description": "Paint Wood Surfaces With Linseed Oil, 1 Coat, Surface Preparation",
    "unit": "SF",
    "unitCost": 1.11
  },
  {
    "taskCode": "09019091-0002",
    "description": "Flat Surfaces, Paint Removal, Strip To Bare Wood",
    "unit": "SF",
    "unitCost": 9.46
  },
  {
    "taskCode": "09019091-0003",
    "description": "Cornices And Decorative Trim To 12\" Wide, Paint Removal, Strip To Bare Wood",
    "unit": "SF",
    "unitCost": 10.08
  },
  {
    "taskCode": "09221313-0009",
    "description": "7/8\", 25 Gauge, 16\" On Center, Installed On Ceilings, Hat Furring Channel",
    "unit": "SF",
    "unitCost": 6.75
  },
  {
    "taskCode": "09221313-0010",
    "description": "1-1/2\", 25 Gauge, 16\" On Center, Installed On Ceilings, Hat Furring Channel",
    "unit": "SF",
    "unitCost": 7.18
  },
  {
    "taskCode": "09221323-0005",
    "description": "25 Gauge, 16\" On Center, Installed On Ceilings, Single-Leg Resilient Channel, RC1 Furring Channel",
    "unit": "SF",
    "unitCost": 5.64
  },
  {
    "taskCode": "09221323-0010",
    "description": "25 Gauge, 16\" On Center, Installed On Ceilings, Double-Leg Resilient Channel, RC2 Furring Channel",
    "unit": "SF",
    "unitCost": 5.89
  },
  {
    "taskCode": "09223613-0005",
    "description": "3/8\" Thick, Installed On Ceiling, Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 2.11
  },
  {
    "taskCode": "09223613-0006",
    "description": "1/2\" Thick, Installed On Ceiling, Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 2.82
  },
  {
    "taskCode": "09223613-0007",
    "description": "5/8\" Thick, Installed On Ceiling, Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 3.54
  },
  {
    "taskCode": "09223613-0014",
    "description": "3/8\" Thick, Installed On Ceilings, Firestop Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 2.78
  },
  {
    "taskCode": "09223613-0015",
    "description": "1/2\" Thick, Installed On Ceilings, Firestop Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 3.23
  },
  {
    "taskCode": "09223613-0021",
    "description": "3/8\" Thick, Installed On Ceiling, Foil Back Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 2.78
  },
  {
    "taskCode": "09223613-0022",
    "description": "1/2\" Thick, Installed On Ceiling, Foil Back Plaster Base Gypsum Panel",
    "unit": "SF",
    "unitCost": 3.23
  },
  {
    "taskCode": "09223623-0006",
    "description": "1.75 LB/SY, Installed On Ceiling, Flat Diamond, Expanded Metal Lath",
    "unit": "SF",
    "unitCost": 2.96
  },
  {
    "taskCode": "09223623-0007",
    "description": "2 LB/SY, Installed On Ceiling, Flat Diamond, Expanded Metal Lath",
    "unit": "SF",
    "unitCost": 3.09
  },
  {
    "taskCode": "09223623-0008",
    "description": "2.5 LB/SY, Installed On Ceiling, Flat Diamond, Expanded Metal Lath",
    "unit": "SF",
    "unitCost": 3.22
  },
  {
    "taskCode": "09223623-0009",
    "description": "3.4 LB/SY, Installed On Ceiling, Flat Diamond, Expanded Metal Lath",
    "unit": "SF",
    "unitCost": 3.56
  },
  {
    "taskCode": "09281300-0002",
    "description": "1/4\" Cementitious Backer Units For Installation On Floors",
    "unit": "SF",
    "unitCost": 4.68
  },
  {
    "taskCode": "09281300-0003",
    "description": "1/2\" Cementitious Backer Units For Installation On Floors",
    "unit": "SF",
    "unitCost": 5.4
  },
  {
    "taskCode": "09281300-0004",
    "description": "5/8\" Cementitious Backer Units For Installation On Floors",
    "unit": "SF",
    "unitCost": 6.62
  },
  {
    "taskCode": "09281600-0002",
    "description": "1/2\" DensShield Tile Backer For Installation On Floors",
    "unit": "SF",
    "unitCost": 3.92
  },
  {
    "taskCode": "09281600-0003",
    "description": "5/8\" DensShield Tile Backer For Installation On Floors",
    "unit": "SF",
    "unitCost": 4.88
  },
  {
    "taskCode": "09301300-0002",
    "description": "2\" x 2\" x 1/4\" Thick, Mounted, Unpolished Ceramic Floor Tile",
    "unit": "SF",
    "unitCost": 19.28
  },
  {
    "taskCode": "09301300-0003",
    "description": "Less Than 8\" x 8\", Mounted, Ceramic Floor Tile",
    "unit": "SF",
    "unitCost": 15.01
  },
  {
    "taskCode": "09301300-0004",
    "description": "8\" x 8\" And Larger Unmounted Ceramic Floor Tile",
    "unit": "SF",
    "unitCost": 17.05
  },
  {
    "taskCode": "09301300-0005",
    "description": "2\" x 2\" x 1/4\" Thick, Mounted, Unpolished Ceramic Wall Tile",
    "unit": "SF",
    "unitCost": 21.01
  },
  {
    "taskCode": "09301300-0006",
    "description": "Less than 8\" x 8\" Mounted Ceramic Wall Tile",
    "unit": "SF",
    "unitCost": 16.74
  },
  {
    "taskCode": "09513323-0003",
    "description": "24\" x 24\", Unperforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 18.71
  },
  {
    "taskCode": "09513323-0006",
    "description": "24\" x 24\", Perforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 26.48
  },
  {
    "taskCode": "09513323-0009",
    "description": "30\" x 30\", Unperforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 27.99
  },
  {
    "taskCode": "09513323-0010",
    "description": "30\" x 30\", Perforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 34.74
  },
  {
    "taskCode": "09513323-0011",
    "description": "48\" x 48\", Unperforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 28.14
  },
  {
    "taskCode": "09513323-0012",
    "description": "48\" x 48\", Perforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 34.94
  },
  {
    "taskCode": "09513323-0013",
    "description": "12\" x 48\", Unperforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 28.28
  },
  {
    "taskCode": "09513323-0014",
    "description": "12\" x 48\", Perforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 34.81
  },
  {
    "taskCode": "09513323-0015",
    "description": "24\" x 48\", Unperforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 28.28
  },
  {
    "taskCode": "09513323-0016",
    "description": "24\" x 48\", Perforated, Painted Aluminum, Acoustical Lay-In Metal Ceiling Panel (USG Panz\u2122)",
    "unit": "SF",
    "unitCost": 35.08
  },
  {
    "taskCode": "09681300-0003",
    "description": "18 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 43.06
  },
  {
    "taskCode": "09681300-0004",
    "description": "20 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 44.48
  },
  {
    "taskCode": "09681300-0005",
    "description": "22 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 48.99
  },
  {
    "taskCode": "09681300-0006",
    "description": "24 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 53.39
  },
  {
    "taskCode": "09681300-0007",
    "description": "26 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 55.96
  },
  {
    "taskCode": "09681300-0008",
    "description": "28 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 58.6
  },
  {
    "taskCode": "09681300-0009",
    "description": "30 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 59.38
  },
  {
    "taskCode": "09681300-0010",
    "description": "32 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 59.87
  },
  {
    "taskCode": "09681300-0011",
    "description": "34 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 60.28
  },
  {
    "taskCode": "09681300-0012",
    "description": "36 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 61.68
  },
  {
    "taskCode": "09681300-0013",
    "description": "38 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 64.46
  },
  {
    "taskCode": "09681300-0014",
    "description": "40 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 67.45
  },
  {
    "taskCode": "09681300-0015",
    "description": "42 Ounce, Non-Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 73.19
  },
  {
    "taskCode": "09681300-0016",
    "description": "Installation Of Owner Provided Non-Patterned Carpet Tiles",
    "unit": "SY",
    "unitCost": 19.18
  },
  {
    "taskCode": "09681300-0018",
    "description": "15 Ounce, Patterned, Nylon Carpet Tile",
    "unit": "SY",
    "unitCost": 44.61
  },
  {
    "taskCode": "09911300-0003",
    "description": "1 Coat Filler, Brush Work, Paint Exterior Brick Walls",
    "unit": "SF",
    "unitCost": 1.39
  },
  {
    "taskCode": "09911300-0004",
    "description": "1 Coat Paint, Brush Work, Paint Exterior Brick Walls",
    "unit": "SF",
    "unitCost": 1.92
  },
  {
    "taskCode": "09911300-0047",
    "description": "1 Coat Primer, Brush Work, Paint Exterior Drywall/Plaster Wall",
    "unit": "SF",
    "unitCost": 1.19
  },
  {
    "taskCode": "09911300-0048",
    "description": "1 Coat Paint, Brush Work, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 1.26
  },
  {
    "taskCode": "09911300-0049",
    "description": "2 Coats Paint, Brush Work, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 2.34
  },
  {
    "taskCode": "09911300-0050",
    "description": "1 Coat Primer, Brush/Roller Work, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 0.98
  },
  {
    "taskCode": "09911300-0051",
    "description": "1 Coat Paint, Brush/Roller Work, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 0.95
  },
  {
    "taskCode": "09911300-0052",
    "description": "2 Coats Paint, Brush/Roller Work, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 1.79
  },
  {
    "taskCode": "09911300-0053",
    "description": "1 Coat Primer, Sprayed, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 0.97
  },
  {
    "taskCode": "09911300-0054",
    "description": "1 Coat Paint, Sprayed, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 1.0
  },
  {
    "taskCode": "09911300-0055",
    "description": "2 Coats Paint, Sprayed, Paint Exterior Drywall/Plaster Walls",
    "unit": "SF",
    "unitCost": 1.68
  },
  {
    "taskCode": "09911300-0140",
    "description": "1 Coat Primer, Brush Work, Paint Exterior Drywall/Plaster Ceiling",
    "unit": "SF",
    "unitCost": 1.32
  },
  {
    "taskCode": "09911300-0141",
    "description": "1 Coat Paint, Brush Work, Paint Exterior Drywall/Plaster Ceiling",
    "unit": "SF",
    "unitCost": 1.38
  },
  {
    "taskCode": "09911300-0142",
    "description": "2 Coats Paint, Brush Work, Paint Exterior Drywall/Plaster Ceiling",
    "unit": "SF",
    "unitCost": 2.49
  },
  {
    "taskCode": "09911300-0143",
    "description": "1 Coat Primer, Brush/Roller Work, Paint Exterior Drywall/Plaster Ceiling",
    "unit": "SF",
    "unitCost": 1.02
  },
  {
    "taskCode": "09911300-0144",
    "description": "1 Coat Paint, Brush/Roller Work, Paint Exterior Drywall/Plaster Ceiling",
    "unit": "SF",
    "unitCost": 1.1
  },
  {
    "taskCode": "21011091-0002",
    "description": "Relocate 1 Existing Sprinkler Head And Branch Piping",
    "unit": "EA",
    "unitCost": 751.19
  },
  {
    "taskCode": "21011091-0003",
    "description": "Relocate 2 To 4 Existing Sprinkler Heads And Branch Piping",
    "unit": "EA",
    "unitCost": 450.71
  },
  {
    "taskCode": "21011091-0004",
    "description": "Relocate >4 To 10 Existing Sprinkler Heads And Branch Piping",
    "unit": "EA",
    "unitCost": 180.28
  },
  {
    "taskCode": "21011091-0005",
    "description": "Relocate >10 Existing Sprinkler Heads And Branch Piping",
    "unit": "EA",
    "unitCost": 90.14
  },
  {
    "taskCode": "21011091-0007",
    "description": "Up To 100', Up To 1-1/2\" Diameter Pipe, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 497.28
  },
  {
    "taskCode": "21011091-0008",
    "description": ">100 To 250', Up To 1-1/2\" Diameter Pipe, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 710.21
  },
  {
    "taskCode": "21011091-0009",
    "description": ">250 To 500', Up To 1-1/2\" Diameter Pipe, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 850.97
  },
  {
    "taskCode": "21011091-0010",
    "description": ">500 To 1,000', Up To 1-1/2\" Diameter Pipe, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 1063.72
  },
  {
    "taskCode": "21011091-0011",
    "description": ">1,000 To 2,000', Up To 1-1/2\" Diameter Pipe, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 1382.84
  },
  {
    "taskCode": "21011091-0012",
    "description": ">2,000', Up To 1-1/2\" Diameter Pipe, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "LF",
    "unitCost": 0.7
  },
  {
    "taskCode": "21011091-0013",
    "description": "Up To 100', >1-1/2\" To 3\" Diameter Branch Piping, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 696.2
  },
  {
    "taskCode": "21011091-0014",
    "description": ">100 To 250', >1-1/2\" To 3\" Diameter Branch Piping, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 994.31
  },
  {
    "taskCode": "21011091-0015",
    "description": ">250 To 500', >1-1/2\" To 3\" Diameter Branch Piping, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 1191.37
  },
  {
    "taskCode": "21011091-0016",
    "description": ">500 To 1,000', >1-1/2\" To 3\" Diameter Branch Piping, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 1489.21
  },
  {
    "taskCode": "21011091-0017",
    "description": ">1,000 To 2,000', >1-1/2\" To 3\" Diameter Branch Piping, Purge Liquid System (For Sprinkler Upgrades)",
    "unit": "EA",
    "unitCost": 1935.98
  },
  {
    "taskCode": "21051900-0008",
    "description": "3\" Diameter, 0 - 600 GPM Fire Service Meter Flanged, With Cast Iron Housing",
    "unit": "EA",
    "unitCost": 7561.51
  },
  {
    "taskCode": "21051900-0009",
    "description": "4\" Diameter, 0 - 1,000 GPM Fire Service Meter Flanged, With Cast Iron Housing",
    "unit": "EA",
    "unitCost": 15422.77
  },
  {
    "taskCode": "21051900-0010",
    "description": "6\" Diameter, 0 - 2,000 GPM Fire Service Meter Flanged, With Cast Iron Housing",
    "unit": "EA",
    "unitCost": 20891.18
  },
  {
    "taskCode": "21051900-0011",
    "description": "8\" Diameter, 0 - 4,000 GPM Fire Service Meter Flanged, With Cast Iron Housing",
    "unit": "EA",
    "unitCost": 27247.36
  },
  {
    "taskCode": "21051900-0012",
    "description": "10\" Diameter, 0 - 6,200 GPM Fire Service Meter Flanged, With Cast Iron Housing",
    "unit": "EA",
    "unitCost": 38387.39
  },
  {
    "taskCode": "21121300-0003",
    "description": "1-1/2\" Linen Fire Hose With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 3.71
  },
  {
    "taskCode": "21121300-0004",
    "description": "2-1/2\" Linen Fire Hose With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 4.27
  },
  {
    "taskCode": "21121300-0005",
    "description": "2\" Linen Fire Hose With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 3.94
  },
  {
    "taskCode": "21121300-0006",
    "description": "3\" Linen Fire Hose With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 4.55
  },
  {
    "taskCode": "21121300-0007",
    "description": "1-1/2\" Cotton Fire Hose, 300 LB Test With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 4.04
  },
  {
    "taskCode": "21121300-0008",
    "description": "2-1/2\" Cotton Fire Hose, 300 LB Test With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 4.87
  },
  {
    "taskCode": "21121300-0009",
    "description": "1-1/2\" Cotton Fire Hose, 400 LB Test With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 4.13
  },
  {
    "taskCode": "21121300-0010",
    "description": "2-1/2\" Cotton Fire Hose, 400 LB Test With 1-1/2\" Rubber Lining Without Couplings",
    "unit": "LF",
    "unitCost": 5.07
  },
  {
    "taskCode": "21121300-0012",
    "description": "1-3/4\" Polyester Fire Hose With Rubber Lining With Aluminum Couplings",
    "unit": "LF",
    "unitCost": 9.14
  },
  {
    "taskCode": "21121300-0013",
    "description": "2-1/2\" Polyester Fire Hose With Rubber Lining With Aluminum Couplings",
    "unit": "LF",
    "unitCost": 11.38
  },
  {
    "taskCode": "21121300-0014",
    "description": "3-1/2\" Polyester Fire Hose With Rubber Lining With Aluminum Couplings",
    "unit": "LF",
    "unitCost": 19.12
  },
  {
    "taskCode": "21121300-0016",
    "description": "Hose Coupling With 1-1/2\" Pin Lug",
    "unit": "EA",
    "unitCost": 293.02
  },
  {
    "taskCode": "21121300-0017",
    "description": "Hose Coupling With 2-1/2\" Pin Lug",
    "unit": "EA",
    "unitCost": 459.84
  },
  {
    "taskCode": "21121300-0022",
    "description": "1-1/2\" Brass 100' Hose Rack",
    "unit": "EA",
    "unitCost": 383.15
  },
  {
    "taskCode": "21121300-0023",
    "description": "2-1/2\" Brass 100' Hose Rack",
    "unit": "EA",
    "unitCost": 504.83
  },
  {
    "taskCode": "22011061-0002",
    "description": "1/2\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 49.86
  },
  {
    "taskCode": "22011061-0003",
    "description": "3/4\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 52.16
  },
  {
    "taskCode": "22011061-0004",
    "description": "1\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 57.4
  },
  {
    "taskCode": "22011061-0005",
    "description": "1-1/4\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 61.36
  },
  {
    "taskCode": "22011061-0006",
    "description": "1-1/2\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 66.68
  },
  {
    "taskCode": "22011061-0007",
    "description": "2\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 85.23
  },
  {
    "taskCode": "22011061-0008",
    "description": "2-1/2\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 109.53
  },
  {
    "taskCode": "22011061-0009",
    "description": "3\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 128.0
  },
  {
    "taskCode": "22011061-0010",
    "description": "4\" Diameter x 3\" Stainless Steel Pipe Repair Clamp, Single Bolt",
    "unit": "EA",
    "unitCost": 146.93
  },
  {
    "taskCode": "22011061-0011",
    "description": "1/2\" Diameter x 6\" Stainless Steel Pipe Repair Clamp, Double Bolt",
    "unit": "EA",
    "unitCost": 78.05
  },
  {
    "taskCode": "22011061-0012",
    "description": "3/4\" Diameter x 6\" Stainless Steel Pipe Repair Clamp, Double Bolt",
    "unit": "EA",
    "unitCost": 82.56
  },
  {
    "taskCode": "22011061-0013",
    "description": "1\" Diameter x 6\" Stainless Steel Pipe Repair Clamp, Double Bolt",
    "unit": "EA",
    "unitCost": 91.41
  },
  {
    "taskCode": "22011061-0014",
    "description": "1-1/4\" Diameter x 6\" Stainless Steel Pipe Repair Clamp, Double Bolt",
    "unit": "EA",
    "unitCost": 100.48
  },
  {
    "taskCode": "22011061-0015",
    "description": "1-1/2\" Diameter x 6\" Stainless Steel Pipe Repair Clamp, Double Bolt",
    "unit": "EA",
    "unitCost": 110.95
  },
  {
    "taskCode": "22011061-0016",
    "description": "2\" Diameter x 6\" Stainless Steel Pipe Repair Clamp, Double Bolt",
    "unit": "EA",
    "unitCost": 143.47
  },
  {
    "taskCode": "22014081-0002",
    "description": "Removal And Replacement Of 3/8\" To 1/2\" Compression Shut-off Valve With 15\" Polybutylene Supply Tube",
    "unit": "EA",
    "unitCost": 76.14
  },
  {
    "taskCode": "22014081-0004",
    "description": "Removal And Replacement Of Chrome Supply Lines To Sink/Lavatory, Pair",
    "unit": "EA",
    "unitCost": 36.33
  },
  {
    "taskCode": "22014081-0005",
    "description": "Removal And Replacement Of Single Bowl Sink/Lavatory Drain Line",
    "unit": "EA",
    "unitCost": 51.49
  },
  {
    "taskCode": "22014081-0006",
    "description": "Removal And Replacement Of Double Bowl Sink/Lavatory Drain Line",
    "unit": "EA",
    "unitCost": 79.42
  },
  {
    "taskCode": "22014081-0012",
    "description": "Removal And Replacement Of Sink Basket Strainer",
    "unit": "EA",
    "unitCost": 35.46
  },
  {
    "taskCode": "22014081-0013",
    "description": "Removal And Replacement Of 1-1/2\" Sink Drain Without Stopper",
    "unit": "EA",
    "unitCost": 19.74
  },
  {
    "taskCode": "22014081-0014",
    "description": "Removal And Replacement Of 4-1/2\" Sink Drain Without Stopper",
    "unit": "EA",
    "unitCost": 20.66
  },
  {
    "taskCode": "22014081-0015",
    "description": "Removal And Replacement Of 1-1/2\" Sink Drain With Stopper",
    "unit": "EA",
    "unitCost": 19.74
  },
  {
    "taskCode": "22014081-0016",
    "description": "Removal And Replacement Of 1\" Sink Rubber Stopper",
    "unit": "EA",
    "unitCost": 11.49
  },
  {
    "taskCode": "22014081-0017",
    "description": "Removal And Replacement Of Sink Tailpiece Extension, 1-1/2\" x 8\"",
    "unit": "EA",
    "unitCost": 34.17
  },
  {
    "taskCode": "22014081-0018",
    "description": "Removal And Replacement Of Sink Trap, Adjustable, 1-1/2\"",
    "unit": "EA",
    "unitCost": 54.81
  },
  {
    "taskCode": "22014081-0020",
    "description": "Removal And Replacement Of Lavatory Pop-up Drain Stopper",
    "unit": "EA",
    "unitCost": 39.78
  },
  {
    "taskCode": "22014081-0021",
    "description": "Removal And Replacement Of Faucet Handle",
    "unit": "EA",
    "unitCost": 44.17
  },
  {
    "taskCode": "22014081-0022",
    "description": "Removal And Replacement Of Faucet O-Ring",
    "unit": "EA",
    "unitCost": 34.48
  },
  {
    "taskCode": "22014081-0023",
    "description": "Removal And Replacement Of 1-1/2\" Faucet Hole Cover",
    "unit": "EA",
    "unitCost": 24.44
  },
  {
    "taskCode": "22014081-0024",
    "description": "Removal And Replacement Of Toilet Ballcock",
    "unit": "EA",
    "unitCost": 47.36
  },
  {
    "taskCode": "22014081-0025",
    "description": "Removal And Replacement Of Toilet Bowl Ring, Flat Wax",
    "unit": "EA",
    "unitCost": 9.13
  },
  {
    "taskCode": "22014081-0026",
    "description": "Removal And Replacement Of Toilet Tank",
    "unit": "EA",
    "unitCost": 180.52
  },
  {
    "taskCode": "22014081-0027",
    "description": "Removal And Replacement Of 10\" Toilet Bowl",
    "unit": "EA",
    "unitCost": 236.38
  },
  {
    "taskCode": "22014081-0028",
    "description": "Removal And Replacement Of 10\", Low-Flush Watersaver, Toilet Bowl",
    "unit": "EA",
    "unitCost": 250.79
  },
  {
    "taskCode": "22014081-0029",
    "description": "Removal And Replacement Of 12\" Toilet Bowl",
    "unit": "EA",
    "unitCost": 264.7
  },
  {
    "taskCode": "22014081-0030",
    "description": "Removal And Replacement Of 18\", Elongated, Toilet Bowl",
    "unit": "EA",
    "unitCost": 241.23
  },
  {
    "taskCode": "22014081-0031",
    "description": "Removal And Replacement Of Toilet Closet Bolt, 5/16\" x 3\" With Nuts And Washers",
    "unit": "EA",
    "unitCost": 30.93
  },
  {
    "taskCode": "22014081-0032",
    "description": "Removal And Replacement Of Toilet Flapper With Chain",
    "unit": "EA",
    "unitCost": 21.21
  },
  {
    "taskCode": "22014081-0033",
    "description": "Removal And Replacement Of Toilet Flush Tank Lever",
    "unit": "EA",
    "unitCost": 23.47
  },
  {
    "taskCode": "22014081-0034",
    "description": "Removal And Replacement Of Elongated Toilet Seat With Lid",
    "unit": "EA",
    "unitCost": 111.21
  },
  {
    "taskCode": "22014081-0035",
    "description": "Removal And Replacement Of Elongated Toilet Seat Without Lid",
    "unit": "EA",
    "unitCost": 120.86
  },
  {
    "taskCode": "22014081-0036",
    "description": "Removal And Replacement Of Handicap Toilet Seat, Complete With Rails",
    "unit": "EA",
    "unitCost": 163.7
  },
  {
    "taskCode": "22014081-0042",
    "description": "Removal And Replacement Of Faucet Bonnet",
    "unit": "EA",
    "unitCost": 52.86
  },
  {
    "taskCode": "22014081-0043",
    "description": "Removal And Replacement Of Faucet Diverter Stem",
    "unit": "EA",
    "unitCost": 33.59
  },
  {
    "taskCode": "22014081-0044",
    "description": "Removal And Replacement Of Faucet Diverter Stem And Bonnet",
    "unit": "EA",
    "unitCost": 44.02
  },
  {
    "taskCode": "22014081-0045",
    "description": "Removal And Replacement Of Faucet Spout",
    "unit": "EA",
    "unitCost": 48.77
  },
  {
    "taskCode": "22014081-0046",
    "description": "Removal And Replacement Of Faucet Stem",
    "unit": "EA",
    "unitCost": 36.44
  },
  {
    "taskCode": "22052300-0003",
    "description": "1/2\" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 140.03
  },
  {
    "taskCode": "22052300-0004",
    "description": "3/4\" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 157.77
  },
  {
    "taskCode": "22052300-0005",
    "description": "1\" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 206.58
  },
  {
    "taskCode": "22052300-0006",
    "description": "1-1/4\" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 279.66
  },
  {
    "taskCode": "22052300-0007",
    "description": "1-1/2\" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 323.79
  },
  {
    "taskCode": "22052300-0008",
    "description": "2\" Diameter, 200 PSI, Non-Rising Stem, Crimped Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 444.0
  },
  {
    "taskCode": "22052300-0010",
    "description": "1/4\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 104.31
  },
  {
    "taskCode": "22052300-0011",
    "description": "3/8\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 106.62
  },
  {
    "taskCode": "22052300-0012",
    "description": "1/2\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 109.41
  },
  {
    "taskCode": "22052300-0013",
    "description": "3/4\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 130.95
  },
  {
    "taskCode": "22052300-0014",
    "description": "1\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 159.46
  },
  {
    "taskCode": "22052300-0015",
    "description": "1-1/4\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 231.14
  },
  {
    "taskCode": "22052300-0016",
    "description": "1-1/2\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 257.98
  },
  {
    "taskCode": "22052300-0017",
    "description": "2\" Diameter, 125 LB Brazed Or Soldered Bronze Gate Valve",
    "unit": "EA",
    "unitCost": 309.09
  },
  {
    "taskCode": "22111600-0469",
    "description": "1/2\" Flanged Sink 90 Degree Brass Elbow",
    "unit": "EA",
    "unitCost": 66.29
  },
  {
    "taskCode": "22111600-1356",
    "description": "1/2\" Polypropylene, Heat Fusion, Draining Branch",
    "unit": "EA",
    "unitCost": 40.62
  },
  {
    "taskCode": "22111600-1357",
    "description": "3/4\" Polypropylene, Heat Fusion, Draining Branch",
    "unit": "EA",
    "unitCost": 41.6
  },
  {
    "taskCode": "22111600-1358",
    "description": "1\" Polypropylene, Heat Fusion, Draining Branch",
    "unit": "EA",
    "unitCost": 47.71
  },
  {
    "taskCode": "22111600-1359",
    "description": "1-1/4\" Polypropylene, Heat Fusion, Draining Branch",
    "unit": "EA",
    "unitCost": 49.54
  },
  {
    "taskCode": "22111600-1360",
    "description": "1-1/2\" Polypropylene, Heat Fusion, Draining Branch",
    "unit": "EA",
    "unitCost": 54.37
  },
  {
    "taskCode": "22111600-1361",
    "description": "2\" Polypropylene, Heat Fusion, Draining Branch",
    "unit": "EA",
    "unitCost": 58.42
  },
  {
    "taskCode": "22111900-0042",
    "description": "1/2\" Inlet/Outlet, Automatic Trap Primer, Up To Two Floor Drains (PPP PR-500)",
    "unit": "EA",
    "unitCost": 210.67
  },
  {
    "taskCode": "22111900-0043",
    "description": "1/2\" Inlet/Outlet, Automatic Trap Primer, Up To Four Floor Drains (PPP PO-500)",
    "unit": "EA",
    "unitCost": 204.24
  },
  {
    "taskCode": "22111900-0133",
    "description": "1/2\" Inlets, 1/2\" Outlet Sink/Faucet Point-Of-Use Thermostatic Mixing Valve (Bradley S59-2007)",
    "unit": "EA",
    "unitCost": 601.48
  },
  {
    "taskCode": "22111900-0435",
    "description": "4\" Long, 1/2\" Antisiphon Freezeless Wall Faucet",
    "unit": "EA",
    "unitCost": 164.37
  },
  {
    "taskCode": "22111900-0436",
    "description": "6\" Long, 1/2\" Antisiphon Freezeless Wall Faucet",
    "unit": "EA",
    "unitCost": 178.84
  },
  {
    "taskCode": "22111900-0437",
    "description": "8\" Long, 1/2\" Antisiphon Freezeless Wall Faucet",
    "unit": "EA",
    "unitCost": 189.51
  },
  {
    "taskCode": "22111900-0438",
    "description": "10\" Long, 1/2\" Antisiphon Freezeless Wall Faucet",
    "unit": "EA",
    "unitCost": 200.17
  },
  {
    "taskCode": "22111900-0439",
    "description": "12\" Long, 1/2\" Antisiphon Freezeless Wall Faucet",
    "unit": "EA",
    "unitCost": 211.0
  },
  {
    "taskCode": "22131300-0008",
    "description": "Countertop Kitchen Sink, Single Fixture Rough-In, Cast Iron Waste And Vent Pipe",
    "unit": "EA",
    "unitCost": 1185.4
  },
  {
    "taskCode": "22131300-0011",
    "description": "Floor Mounted Service Sink, Single Fixture Rough-In, Cast Iron Waste And Vent Pipe",
    "unit": "EA",
    "unitCost": 1217.53
  },
  {
    "taskCode": "22131300-0012",
    "description": "Wall Mounted Service Sink, Single Fixture Rough-In, Cast Iron Waste And Vent Pipe",
    "unit": "EA",
    "unitCost": 1253.51
  },
  {
    "taskCode": "22131913-0002",
    "description": "Bronze Top, 6\" Round Top Floor Drain With 1-1/2\" Outlet",
    "unit": "EA",
    "unitCost": 873.67
  },
  {
    "taskCode": "22413900-0002",
    "description": "Chrome Single Handle Kitchen Faucet (Delta 100LF-WF)",
    "unit": "EA",
    "unitCost": 228.14
  },
  {
    "taskCode": "22423900-0140",
    "description": "12\" Long, 3/8\" OD x 7/8\" BC, Stainless Steel Braided Toilet Supply Line",
    "unit": "EA",
    "unitCost": 27.79
  },
  {
    "taskCode": "22423900-0141",
    "description": "12\" Long, 1/2\" OD x 7/8\" BC, Stainless Steel Braided Toilet Supply Line",
    "unit": "EA",
    "unitCost": 28.5
  },
  {
    "taskCode": "23013051-0002",
    "description": "Up To 2 SF Cross Section, Clean Supply/Return Ductwork",
    "unit": "LF",
    "unitCost": 4.25
  },
  {
    "taskCode": "23013051-0003",
    "description": ">2 SF To 4 SF Cross Section, Clean Supply/Return Ductwork",
    "unit": "LF",
    "unitCost": 5.34
  },
  {
    "taskCode": "23013051-0004",
    "description": ">4 SF To 8 SF Cross Section, Clean Supply/Return Ductwork",
    "unit": "LF",
    "unitCost": 7.16
  },
  {
    "taskCode": "23013051-0005",
    "description": ">8 SF Cross Section, Clean Supply/Return Ductwork",
    "unit": "LF",
    "unitCost": 10.14
  },
  {
    "taskCode": "23013051-0008",
    "description": "Clean Duct Dampers",
    "unit": "SF",
    "unitCost": 14.32
  },
  {
    "taskCode": "23013051-0009",
    "description": "Clean Duct Fire Dampers",
    "unit": "SF",
    "unitCost": 28.66
  },
  {
    "taskCode": "23013051-0012",
    "description": "Clean Grille/Diffuser/Register",
    "unit": "EA",
    "unitCost": 34.39
  },
  {
    "taskCode": "23013051-0013",
    "description": "Clean Linear Diffuser",
    "unit": "LF",
    "unitCost": 8.59
  },
  {
    "taskCode": "23013051-0014",
    "description": "Cut Access For Cleaning Duct And Install Duct Insulated Access Doors",
    "unit": "EA",
    "unitCost": 114.41
  },
  {
    "taskCode": "23013051-0016",
    "description": "Clean Fan Powered Induction Unit (PIU) Unit",
    "unit": "EA",
    "unitCost": 137.53
  },
  {
    "taskCode": "23013051-0017",
    "description": "Clean Fan Coil Unit (FCU)",
    "unit": "EA",
    "unitCost": 137.53
  },
  {
    "taskCode": "23013051-0019",
    "description": "Clean Supply Or Return Fan",
    "unit": "EA",
    "unitCost": 275.07
  },
  {
    "taskCode": "23013051-0020",
    "description": "Clean Exhaust Fan",
    "unit": "EA",
    "unitCost": 240.68
  },
  {
    "taskCode": "23013051-0021",
    "description": "Clean Duct Coil",
    "unit": "EA",
    "unitCost": 206.3
  },
  {
    "taskCode": "23013051-0023",
    "description": "Clean Air Handling Unit Fan",
    "unit": "EA",
    "unitCost": 275.07
  },
  {
    "taskCode": "23013051-0024",
    "description": "Clean Air Handling Unit Coil",
    "unit": "EA",
    "unitCost": 412.59
  },
  {
    "taskCode": "23013051-0028",
    "description": "Cleaning Of Ductwork Minimum Set-up Charge",
    "unit": "EA",
    "unitCost": 1021.46
  },
  {
    "taskCode": "23013051-0029",
    "description": "Apply Anti-microbial Agent To Ductwork And Surfaces After Cleaning",
    "unit": "SF",
    "unitCost": 0.61
  },
  {
    "taskCode": "23013061-0002",
    "description": "Repair And Sealing Of Ductwork",
    "unit": "SF",
    "unitCost": 2.49
  },
  {
    "taskCode": "23051700-0003",
    "description": "3\" Ductile Iron Wall Sleeve With Rubber Gasket Seal",
    "unit": "EA",
    "unitCost": 186.28
  },
  {
    "taskCode": "23051700-0004",
    "description": "4\" Ductile Iron Wall Sleeve With Rubber Gasket Seal",
    "unit": "EA",
    "unitCost": 236.22
  },
  {
    "taskCode": "23051700-0005",
    "description": "6\" Ductile Iron Wall Sleeve With Rubber Gasket Seal",
    "unit": "EA",
    "unitCost": 291.29
  },
  {
    "taskCode": "23056600-0030",
    "description": "16\" Fan Coil Unit Ultraviolet Microbial Control Fixture (Steril-Aire)",
    "unit": "EA",
    "unitCost": 665.69
  },
  {
    "taskCode": "23056600-0031",
    "description": "20\" Fan Coil Unit Ultraviolet Microbial Control Fixture (Steril-Aire)",
    "unit": "EA",
    "unitCost": 680.99
  },
  {
    "taskCode": "23056600-0032",
    "description": "24\" Fan Coil Unit Ultraviolet Microbial Control Fixture (Steril-Aire)",
    "unit": "EA",
    "unitCost": 696.29
  },
  {
    "taskCode": "23056600-0033",
    "description": "30\" Fan Coil Unit Ultraviolet Microbial Control Fixture (Steril-Aire)",
    "unit": "EA",
    "unitCost": 716.52
  },
  {
    "taskCode": "23056600-0034",
    "description": "36\" Fan Coil Unit Ultraviolet Microbial Control Fixture (Steril-Aire)",
    "unit": "EA",
    "unitCost": 742.36
  },
  {
    "taskCode": "23056600-0035",
    "description": "42\" Fan Coil Unit Ultraviolet Microbial Control Fixture (Steril-Aire)",
    "unit": "EA",
    "unitCost": 765.26
  },
  {
    "taskCode": "23059300-0002",
    "description": "Balancing Centrifugal Fans",
    "unit": "EA",
    "unitCost": 550.13
  },
  {
    "taskCode": "23059300-0004",
    "description": "Balancing In Line Fan",
    "unit": "EA",
    "unitCost": 618.9
  },
  {
    "taskCode": "23059300-0005",
    "description": "Balancing Propeller And Wall Fan",
    "unit": "EA",
    "unitCost": 137.53
  },
  {
    "taskCode": "23059300-0006",
    "description": "Balancing Roof Exhaust Fan",
    "unit": "EA",
    "unitCost": 412.56
  },
  {
    "taskCode": "23059300-0015",
    "description": "Balancing HVAC Duct System, Ceiling Height To 12' Supply, Return, Exhaust, Register And Diffuser",
    "unit": "EA",
    "unitCost": 103.15
  },
  {
    "taskCode": "23059300-0016",
    "description": "Balancing HVAC Duct System, Ceiling Height >12' Supply, Return, Exhaust, Register And Diffuser",
    "unit": "EA",
    "unitCost": 171.92
  },
  {
    "taskCode": "23059300-0017",
    "description": "Balancing HVAC Duct System, Floor Height Supply, Return, Exhaust, Register And Diffuser",
    "unit": "EA",
    "unitCost": 89.39
  },
  {
    "taskCode": "23059300-0026",
    "description": "Balance Dampers",
    "unit": "EA",
    "unitCost": 38.31
  },
  {
    "taskCode": "23059300-0034",
    "description": "Water Balance, Fan Coil And Vent",
    "unit": "EA",
    "unitCost": 139.29
  },
  {
    "taskCode": "23059300-0036",
    "description": "Water Balance, Main And Duct Re-Heat Coil",
    "unit": "EA",
    "unitCost": 153.13
  },
  {
    "taskCode": "23092312-0002",
    "description": "8\" x 8\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-008X008)",
    "unit": "EA",
    "unitCost": 223.17
  },
  {
    "taskCode": "23092312-0003",
    "description": "10\" x 10\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-010X010)",
    "unit": "EA",
    "unitCost": 251.55
  },
  {
    "taskCode": "23092312-0004",
    "description": "12\" x 12\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-012X012)",
    "unit": "EA",
    "unitCost": 281.28
  },
  {
    "taskCode": "23092312-0005",
    "description": "14\" x 14\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-014X014)",
    "unit": "EA",
    "unitCost": 325.21
  },
  {
    "taskCode": "23092312-0006",
    "description": "16\" x 16\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-016X016)",
    "unit": "EA",
    "unitCost": 367.77
  },
  {
    "taskCode": "23092312-0007",
    "description": "18\" x 18\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-018X018)",
    "unit": "EA",
    "unitCost": 371.94
  },
  {
    "taskCode": "23092312-0008",
    "description": "20\" x 20\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-020X020)",
    "unit": "EA",
    "unitCost": 456.49
  },
  {
    "taskCode": "23092312-0009",
    "description": "24\" x 24\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-024X024)",
    "unit": "EA",
    "unitCost": 545.17
  },
  {
    "taskCode": "23092312-0010",
    "description": "32\" x 32\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-032X032)",
    "unit": "EA",
    "unitCost": 700.1
  },
  {
    "taskCode": "23092312-0011",
    "description": "48\" x 48\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-048X048)",
    "unit": "EA",
    "unitCost": 1039.66
  },
  {
    "taskCode": "23092312-0012",
    "description": "60\" x 60\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-060X060)",
    "unit": "EA",
    "unitCost": 1907.07
  },
  {
    "taskCode": "23092312-0013",
    "description": "72\" x 72\" Low Leakage Volume Control Damper (Johnson Controls VOPSN-072X072)",
    "unit": "EA",
    "unitCost": 2422.6
  },
  {
    "taskCode": "23092353-0183",
    "description": "Up To 10 Factory Installed Application Specific Fan Coil Unit Controller Assemblies",
    "unit": "EA",
    "unitCost": 3744.66
  },
  {
    "taskCode": "23092353-0184",
    "description": ">10 Factory Installed Application Specific Fan Coil Unit Controller Assemblies",
    "unit": "EA",
    "unitCost": 3153.91
  },
  {
    "taskCode": "23092353-0185",
    "description": "Up To 10 Field Installed Application Specific Fan Coil Unit Controller Assemblies",
    "unit": "EA",
    "unitCost": 4063.26
  },
  {
    "taskCode": "23092353-0186",
    "description": ">10 Field Installed Application Specific Fan Coil Unit Controller Assemblies",
    "unit": "EA",
    "unitCost": 3472.37
  },
  {
    "taskCode": "23211323-1999",
    "description": "2-1/2\" Grooved x 2\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 5146.97
  },
  {
    "taskCode": "23211323-2000",
    "description": "3\" Grooved x 2\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 5464.39
  },
  {
    "taskCode": "23211323-2001",
    "description": "3\" Grooved x 2-1/2\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 3954.25
  },
  {
    "taskCode": "23211323-2002",
    "description": "3\" Grooved x 3\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 4011.16
  },
  {
    "taskCode": "23211323-2003",
    "description": "4\" Grooved x 2-1/2\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 4343.53
  },
  {
    "taskCode": "23211323-2004",
    "description": "4\" Grooved x 3\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 4686.11
  },
  {
    "taskCode": "23211323-2005",
    "description": "4\" Grooved x 4\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 5415.08
  },
  {
    "taskCode": "23211323-2006",
    "description": "5\" Grooved x 4\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 6049.04
  },
  {
    "taskCode": "23211323-2007",
    "description": "5\" Grooved x 5\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 6356.49
  },
  {
    "taskCode": "23211323-2008",
    "description": "6\" Grooved x 4\" Flanged Suction Diffuser",
    "unit": "EA",
    "unitCost": 6459.65
  },
  {
    "taskCode": "23341600-0235",
    "description": "50 CFM, Ceiling/Wall Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan Without Light (Broan\u00ae 670)",
    "unit": "EA",
    "unitCost": 178.15
  },
  {
    "taskCode": "23341600-0236",
    "description": "70 CFM, Ceiling/Wall Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan Without Light (Broan\u00ae 671)",
    "unit": "EA",
    "unitCost": 187.27
  },
  {
    "taskCode": "23341600-0242",
    "description": "50 CFM, Ceiling Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan With Light (Broan\u00ae 678)",
    "unit": "EA",
    "unitCost": 226.93
  },
  {
    "taskCode": "23341600-0243",
    "description": "70 CFM, Ceiling Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan With Light (Broan\u00ae 679)",
    "unit": "EA",
    "unitCost": 249.78
  },
  {
    "taskCode": "23341600-0244",
    "description": "100 CFM, Ceiling Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan With Light (Broan\u00ae 680)",
    "unit": "EA",
    "unitCost": 450.71
  },
  {
    "taskCode": "23341600-0246",
    "description": "70 CFM, Ceiling Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan With Heater Bulb (Broan\u00ae 162)",
    "unit": "EA",
    "unitCost": 231.88
  },
  {
    "taskCode": "23341600-0247",
    "description": "70 CFM, Ceiling Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan With Heater (Broan\u00ae 658)",
    "unit": "EA",
    "unitCost": 357.16
  },
  {
    "taskCode": "23341600-0249",
    "description": "70 CFM, Ceiling Mounted, Polymeric Intake Grille, Light Duty Exhaust Fan With Heater And Light (Broan\u00ae 655)",
    "unit": "EA",
    "unitCost": 378.88
  },
  {
    "taskCode": "23341600-0282",
    "description": "90 CFM, Polymeric Grilles, Wall Mounted, Room-To-Room Exhaust Fan (Broan\u00ae 512)",
    "unit": "EA",
    "unitCost": 220.78
  },
  {
    "taskCode": "23341600-0283",
    "description": "180 CFM, Polymeric Grilles, Wall Mounted, Room-To-Room Exhaust Fan (Broan\u00ae 511)",
    "unit": "EA",
    "unitCost": 353.75
  },
  {
    "taskCode": "23341600-0284",
    "description": "380 CFM, Polymeric Grilles, Wall Mounted, Room-To-Room Exhaust Fan (Broan\u00ae 510)",
    "unit": "EA",
    "unitCost": 402.21
  },
  {
    "taskCode": "23341600-0286",
    "description": "250 CFM, Wall Mounted, Polymeric Intake Grille, Chain Operated, Through Wall Exhaust Fan (Broan\u00ae 507)",
    "unit": "EA",
    "unitCost": 376.88
  },
  {
    "taskCode": "23341600-0287",
    "description": "470 CFM, Wall Mounted, Polymeric Intake Grille, Chain Operated, Through Wall Exhaust Fan (Broan\u00ae 506)",
    "unit": "EA",
    "unitCost": 443.66
  },
  {
    "taskCode": "23341600-0288",
    "description": "180 CFM, Wall Mounted, Polymeric Intake Grille, Through-Wall Exhaust Fan (Broan\u00ae 509)",
    "unit": "EA",
    "unitCost": 330.95
  },
  {
    "taskCode": "26012091-0008",
    "description": "Lighting, Existing Circuit Tracing Per Circuit",
    "unit": "EA",
    "unitCost": 32.11
  },
  {
    "taskCode": "26015051-0028",
    "description": "Convert Exit Light Lamps To Red LED Lamps",
    "unit": "EA",
    "unitCost": 80.4
  },
  {
    "taskCode": "26015051-0029",
    "description": "Fluorescent Lamp For Exit Light",
    "unit": "EA",
    "unitCost": 23.53
  },
  {
    "taskCode": "26015051-0030",
    "description": "Lamp Replacement For Emergency Lights On Exit Sign",
    "unit": "EA",
    "unitCost": 39.0
  },
  {
    "taskCode": "26015051-0313",
    "description": "24 Watt, 3000K CCT, Mogul Base E39, LED Lamp (Light Efficient Design LED-8029M30-A)",
    "unit": "EA",
    "unitCost": 58.44
  },
  {
    "taskCode": "26015051-0314",
    "description": "24 Watt, 4000K CCT, Mogul Base E39, LED Lamp (Light Efficient Design LED-8029M40-A)",
    "unit": "EA",
    "unitCost": 58.44
  },
  {
    "taskCode": "26015051-0315",
    "description": "24 Watt, 5700K CCT, Mogul Base E39, LED Lamp (Light Efficient Design LED-8029M57-A)",
    "unit": "EA",
    "unitCost": 58.44
  },
  {
    "taskCode": "26015051-0360",
    "description": "5.5\" Diameter, 17 Watt, 3000K CCT, Round LED Light Engine (Maxlite LER5.5A1730)",
    "unit": "EA",
    "unitCost": 48.28
  },
  {
    "taskCode": "26015053-0003",
    "description": "Removal And Replacement Of Visor For Fixtures",
    "unit": "EA",
    "unitCost": 221.06
  },
  {
    "taskCode": "26015053-0005",
    "description": "Removal And Replacement Of Lenses For Flat Top Pole Fixtures",
    "unit": "EA",
    "unitCost": 106.04
  },
  {
    "taskCode": "26015053-0015",
    "description": "Removal And Replacement Of Exterior Light Globes",
    "unit": "EA",
    "unitCost": 67.43
  },
  {
    "taskCode": "26015081-0004",
    "description": "Retrofit An Existing 4' (T12) Strip Style Fixture Without Reflector To Operate One 4' (T8) Lamp",
    "unit": "EA",
    "unitCost": 124.02
  },
  {
    "taskCode": "26015081-0005",
    "description": "Retrofit An Existing 4' (T12) Strip Style Fixture Without Reflector To Operate Two 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 130.95
  },
  {
    "taskCode": "26015081-0006",
    "description": "Retrofit An Existing 8' (T12) Strip Style Fixture Without Reflector To Operate Two 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 173.26
  },
  {
    "taskCode": "26015081-0007",
    "description": "Retrofit An Existing 8' (T12) Strip Style Fixture Without Reflector To Operate Four 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 198.54
  },
  {
    "taskCode": "26015081-0009",
    "description": "Retrofit An Existing 4' (T12) Strip Style Fixture With Reflector To Operate One 4' (T8) Lamp",
    "unit": "EA",
    "unitCost": 130.24
  },
  {
    "taskCode": "26015081-0010",
    "description": "Retrofit An Existing 4' (T12) Strip Style Fixture With Reflector To Operate Two 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 137.92
  },
  {
    "taskCode": "26015081-0011",
    "description": "Retrofit An Existing 8' (T12) Strip Style Fixture With Reflector To Operate Two 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 181.97
  },
  {
    "taskCode": "26015081-0012",
    "description": "Retrofit An Existing 8' (T12) Strip Style Fixture With Reflector To Operate Four 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 232.41
  },
  {
    "taskCode": "26015081-0014",
    "description": "Retrofit An Existing 1 x 4 (T12) Troffer Style Fixture To Operate One 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 161.86
  },
  {
    "taskCode": "26015081-0015",
    "description": "Retrofit An Existing 1 x 4 (T12) Troffer Style Fixture To Operate Two 4' (T8) Lamps",
    "unit": "EA",
    "unitCost": 168.79
  },
  {
    "taskCode": "26015081-0016",
    "description": "Retrofit An Existing 2 x 2 (T12) Troffer Style Fixture To Operate Two 2' (T8) Lamps",
    "unit": "EA",
    "unitCost": 171.59
  },
  {
    "taskCode": "26015081-0017",
    "description": "Retrofit An Existing 2 x 2 (T12) Troffer Style Fixture To Operate Three 2' (T8) Lamps",
    "unit": "EA",
    "unitCost": 190.84
  },
  {
    "taskCode": "26015081-0018",
    "description": "Retrofit An Existing 2 x 2 (T12) Troffer Style Fixture To Operate Four 2' (T8) Lamps",
    "unit": "EA",
    "unitCost": 231.05
  },
  {
    "taskCode": "26051316-0159",
    "description": "#4 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 4208.9
  },
  {
    "taskCode": "26051316-0160",
    "description": "#2 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 4944.49
  },
  {
    "taskCode": "26051316-0161",
    "description": "#1 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 5872.74
  },
  {
    "taskCode": "26051316-0162",
    "description": "1/0 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 7576.08
  },
  {
    "taskCode": "26051316-0163",
    "description": "2/0 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 8619.49
  },
  {
    "taskCode": "26051316-0164",
    "description": "3/0 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 10515.28
  },
  {
    "taskCode": "26051316-0165",
    "description": "4/0 AWG, Type URD (XLPE), 15 KV, Shielded, Single Conductor Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 11811.62
  },
  {
    "taskCode": "26051316-0199",
    "description": "#6 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 98.33
  },
  {
    "taskCode": "26051316-0200",
    "description": "#4 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 109.2
  },
  {
    "taskCode": "26051316-0201",
    "description": "#3 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 127.28
  },
  {
    "taskCode": "26051316-0202",
    "description": "#2 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 143.63
  },
  {
    "taskCode": "26051316-0203",
    "description": "#1 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 162.42
  },
  {
    "taskCode": "26051316-0204",
    "description": "1/0 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 180.25
  },
  {
    "taskCode": "26051316-0205",
    "description": "2/0 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 197.67
  },
  {
    "taskCode": "26051316-0206",
    "description": "3/0 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 216.75
  },
  {
    "taskCode": "26051316-0207",
    "description": "4/0 AWG Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 234.83
  },
  {
    "taskCode": "26051316-0208",
    "description": "250 MCM Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 253.66
  },
  {
    "taskCode": "26051316-0209",
    "description": "300 MCM Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 273.44
  },
  {
    "taskCode": "26051316-0210",
    "description": "350 MCM Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 290.94
  },
  {
    "taskCode": "26051316-0211",
    "description": "400 MCM Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 329.91
  },
  {
    "taskCode": "26051316-0212",
    "description": "500 MCM Crimp Compression Connection For Bare Copper Wire",
    "unit": "EA",
    "unitCost": 371.17
  },
  {
    "taskCode": "26051316-0214",
    "description": "#6 AWG Crimp Compression Connection For Bare Aluminum Wire",
    "unit": "EA",
    "unitCost": 102.76
  },
  {
    "taskCode": "26051916-0003",
    "description": "Pull String Installed To Remain In Place, In Existing Conduit",
    "unit": "LF",
    "unitCost": 0.48
  },
  {
    "taskCode": "26051916-0004",
    "description": "Pull String Installed To Remain In Place, In New Conduits",
    "unit": "LF",
    "unitCost": 0.25
  },
  {
    "taskCode": "26051916-0005",
    "description": "1/4\" Nylon Pull Cord Installed To Remain In Place, In Existing Conduit",
    "unit": "LF",
    "unitCost": 0.8
  },
  {
    "taskCode": "26051916-0006",
    "description": "1/4\" Nylon Pull Cord Installed To Remain In Place, In New Conduits",
    "unit": "LF",
    "unitCost": 0.49
  },
  {
    "taskCode": "26051916-0008",
    "description": "Bore 1\" To 4\" Conduit Into Dirt Or Sand",
    "unit": "LF",
    "unitCost": 4.32
  },
  {
    "taskCode": "26051916-0009",
    "description": "Bore 5\" To 8\" Conduit Into Dirt Or Sand",
    "unit": "LF",
    "unitCost": 5.5
  },
  {
    "taskCode": "26051916-0013",
    "description": "#14 AWG,Type THHN-THWN, 600 Volt, Copper, Single Solid Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 811.29
  },
  {
    "taskCode": "26051916-0014",
    "description": "#12 AWG, Type THHN-THWN, 600 Volt, Copper, Single Solid Cable, Installed In Conduit",
    "unit": "MLF",
    "unitCost": 1005.89
  },
  {
    "taskCode": "26052600-0208",
    "description": "Switch Rating 30 Ground Bar Kit",
    "unit": "EA",
    "unitCost": 42.62
  },
  {
    "taskCode": "26052600-0209",
    "description": "Switch Rating 60 Ground Bar Kit",
    "unit": "EA",
    "unitCost": 53.32
  },
  {
    "taskCode": "26052600-0210",
    "description": "Switch Rating 100 Ground Bar Kit",
    "unit": "EA",
    "unitCost": 61.94
  },
  {
    "taskCode": "26052600-0211",
    "description": "Switch Rating 200 Ground Bar Kit",
    "unit": "EA",
    "unitCost": 103.2
  },
  {
    "taskCode": "26052600-0213",
    "description": "Panelboard Ground Bar Kit",
    "unit": "EA",
    "unitCost": 143.76
  },
  {
    "taskCode": "26052900-0242",
    "description": "1/4\" To 3/4\" Drywall Thickness, Adjustable Switch And Outlet Box Support (Caddy MFS)",
    "unit": "EA",
    "unitCost": 7.58
  },
  {
    "taskCode": "26052900-0243",
    "description": "1/2\" Drywall Thickness, Riveted Switch And Outlet Box Support (Caddy MF500)",
    "unit": "EA",
    "unitCost": 6.47
  },
  {
    "taskCode": "26052900-0244",
    "description": "Flush, Riveted Switch And Outlet Box Support (Caddy MFO)",
    "unit": "EA",
    "unitCost": 7.42
  },
  {
    "taskCode": "26052900-0245",
    "description": "Snap On, Switch And Outlet Box Support (Caddy MSF)",
    "unit": "EA",
    "unitCost": 4.89
  },
  {
    "taskCode": "26052900-0246",
    "description": "1/4-20 Thread Impression, Switch And Outlet Box Support (Caddy MFI)",
    "unit": "EA",
    "unitCost": 5.09
  },
  {
    "taskCode": "26052900-0249",
    "description": "Support Bars For Recessed \"High Hat\" Light Fixtures (Caddy 517)",
    "unit": "PR",
    "unitCost": 23.71
  },
  {
    "taskCode": "26052900-0250",
    "description": "Support Bars For Recessed \"Lightolier\" Light Fixtures (Caddy 520)",
    "unit": "PR",
    "unitCost": 32.35
  },
  {
    "taskCode": "26053316-0022",
    "description": "One Toggle Switch, 4\" Square Steel Exposed Work Cover",
    "unit": "EA",
    "unitCost": 17.47
  },
  {
    "taskCode": "26053316-0023",
    "description": "Two Toggle Switches, 4\" Square Steel Exposed Work Cover",
    "unit": "EA",
    "unitCost": 17.6
  },
  {
    "taskCode": "26053316-0026",
    "description": "One Toggle Switch And One Duplex Receptacle, 4\" Square Steel Exposed Work Cover",
    "unit": "EA",
    "unitCost": 18.11
  },
  {
    "taskCode": "26053316-0027",
    "description": "One Toggle Switch And One 1.406\" Diameter Receptacle, 4\" Square Steel Exposed Work Cover",
    "unit": "EA",
    "unitCost": 21.91
  },
  {
    "taskCode": "26053316-0055",
    "description": "One Toggle Switch, 4-11/16\" Square Steel Exposed Work Cover",
    "unit": "EA",
    "unitCost": 24.68
  },
  {
    "taskCode": "26053316-0056",
    "description": "Two Toggle Switches, 4-11/16\" Square Steel Exposed Work Cover",
    "unit": "EA",
    "unitCost": 25.72
  },
  {
    "taskCode": "26053316-0229",
    "description": "1/2\" Depth, Type GRSS, 7 Opening, Cast Aluminum Explosion Proof Outlet Body",
    "unit": "EA",
    "unitCost": 220.62
  },
  {
    "taskCode": "26053316-0230",
    "description": "3/4\" Depth, Type GRSS, 7 Opening, Cast Aluminum Explosion Proof Outlet Body",
    "unit": "EA",
    "unitCost": 270.65
  },
  {
    "taskCode": "26053316-0231",
    "description": "1\" Depth, Type GRSS, 7 Opening, Cast Aluminum Explosion Proof Outlet Body",
    "unit": "EA",
    "unitCost": 252.97
  },
  {
    "taskCode": "26053316-0232",
    "description": "1/2\" Depth, Type GRSSA, 13 Opening, Cast Aluminum Explosion Proof Outlet Body",
    "unit": "EA",
    "unitCost": 244.91
  },
  {
    "taskCode": "26053316-0233",
    "description": "3/4\" Depth, 13 Hubs, Explosion Proof Conduit Outlet Box With Cover Cast Aluminum, Type GRSSA",
    "unit": "EA",
    "unitCost": 295.63
  },
  {
    "taskCode": "26053323-0007",
    "description": "2-1/2\" x 2-1/2\", Panel Adapter For Surface Mounted Wireway With Screw Cover",
    "unit": "EA",
    "unitCost": 66.41
  },
  {
    "taskCode": "26053323-0016",
    "description": "4\" x 4\", Panel Adapter For Surface Mounted Wireway With Screw Cover",
    "unit": "EA",
    "unitCost": 78.89
  },
  {
    "taskCode": "26053323-0025",
    "description": "6\" x 6\", Panel Adapter For Surface Mounted Wireway With Screw Cover",
    "unit": "EA",
    "unitCost": 108.1
  },
  {
    "taskCode": "26053323-0034",
    "description": "8\" x 8\", Panel Adapter For Surface Mounted Wireway With Screw Cover",
    "unit": "EA",
    "unitCost": 120.43
  },
  {
    "taskCode": "26053323-0043",
    "description": "10\" x 10\", Panel Adapter For Surface Mounted Wireway With Screw Cover",
    "unit": "EA",
    "unitCost": 156.42
  },
  {
    "taskCode": "26053323-0052",
    "description": "12\" x 12\", Panel Adapter For Surface Mounted Wireway With Screw Cover",
    "unit": "EA",
    "unitCost": 201.03
  },
  {
    "taskCode": "26053323-0087",
    "description": "3\" Diameter, Outlet Box (Wiremold #5733)",
    "unit": "EA",
    "unitCost": 28.61
  },
  {
    "taskCode": "26053323-0130",
    "description": "Combination Connector, To Any 3-1/4\" Or 4\" Outlet Box (Wiremold #5785)",
    "unit": "EA",
    "unitCost": 13.36
  },
  {
    "taskCode": "26053323-0279",
    "description": "Single Locking Receptacle And Two RJ11/45 Modulaular Connectors Outlet Cover (Wiremold #4046ARJ)",
    "unit": "EA",
    "unitCost": 91.46
  },
  {
    "taskCode": "26053323-0280",
    "description": "Double Duplex Receptacle Outlet Cover (Wiremold #4046B-2)",
    "unit": "EA",
    "unitCost": 96.77
  },
  {
    "taskCode": "26053323-0284",
    "description": "Combination Single Receptacle And Phone Outlet Center (Wiremold #4046JRJ)",
    "unit": "EA",
    "unitCost": 81.61
  },
  {
    "taskCode": "26053323-0292",
    "description": "Panel Connector (Wiremold #4086A)",
    "unit": "EA",
    "unitCost": 116.18
  },
  {
    "taskCode": "26053323-0314",
    "description": "Panel Connector (Wiremold #6086)",
    "unit": "EA",
    "unitCost": 126.0
  },
  {
    "taskCode": "26092300-0005",
    "description": "20 Amperes, 2 Pole, NEMA 1 Enclosure, Electrically Held, Lighting Contactor",
    "unit": "EA",
    "unitCost": 588.1
  },
  {
    "taskCode": "26092300-0006",
    "description": "30 Amperes, 2 Pole, NEMA 1 Enclosure, Electrically Held, Lighting Contactor",
    "unit": "EA",
    "unitCost": 724.03
  },
  {
    "taskCode": "26092300-0007",
    "description": "60 Amperes, 2 Pole, NEMA 1 Enclosure, Electrically Held, Lighting Contactor",
    "unit": "EA",
    "unitCost": 1346.33
  },
  {
    "taskCode": "26092300-0008",
    "description": "100 Amperes, 2 Pole, NEMA 1 Enclosure, Electrically Held, Lighting Contactor",
    "unit": "EA",
    "unitCost": 2087.77
  },
  {
    "taskCode": "26092300-0154",
    "description": "4 Relays, Surface Mount, Lighting Control Panel (Watt Stopper LP8S-4)",
    "unit": "EA",
    "unitCost": 2041.02
  },
  {
    "taskCode": "26092300-0155",
    "description": "8 Relays, Surface Mount, Lighting Control Panel (Watt Stopper LP8S-8)",
    "unit": "EA",
    "unitCost": 1925.58
  },
  {
    "taskCode": "26092300-0156",
    "description": "8 Relays, Surface Mount, Lighting Control Panel With Group Switching Card (Watt Stopper LP8S-8-G)",
    "unit": "EA",
    "unitCost": 2154.17
  },
  {
    "taskCode": "26092300-0157",
    "description": "8 Relays, Surface Mount, Lighting Control Panel With DIN Rail (Watt Stopper LP24S-8)",
    "unit": "EA",
    "unitCost": 3177.15
  },
  {
    "taskCode": "26092300-0159",
    "description": "4 Relays, Flush Mount, Lighting Control Panel (Watt Stopper LP8F-4)",
    "unit": "EA",
    "unitCost": 2260.86
  },
  {
    "taskCode": "26092300-0160",
    "description": "8 Relays, Flush Mount, Lighting Control Panel (Watt Stopper LP8F-8)",
    "unit": "EA",
    "unitCost": 2425.81
  }
];