/**
 * JOC Line Item Decision Tree
 * Guides users from general categories to specific line items
 */

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  question?: string; // Question to ask at this node
  children?: TreeNode[];
  // Leaf nodes have JOC items
  jocCodes?: string[]; // Task codes to show at this leaf
  keywords?: string[]; // Keywords for learning/matching
}

export const decisionTree: TreeNode = {
  id: 'root',
  label: 'What are you measuring?',
  question: 'What are you measuring?',
  children: [
    // ============ WALLS ============
    {
      id: 'wall',
      label: 'Wall',
      icon: '🧱',
      question: 'What type of wall work?',
      keywords: ['wall', 'partition', 'drywall', 'gypsum'],
      children: [
        {
          id: 'wall-drywall',
          label: 'Drywall / Gypsum Board',
          icon: '📋',
          question: 'What drywall specification?',
          keywords: ['drywall', 'gypsum', 'gyp', 'sheetrock', 'wallboard'],
          children: [
            {
              id: 'wall-drywall-regular',
              label: '1/2" Regular',
              keywords: ['1/2', 'half inch', 'regular'],
              jocCodes: ['09290500-0001', '09290500-0002', '09290500-0003']
            },
            {
              id: 'wall-drywall-5/8-regular',
              label: '5/8" Regular',
              keywords: ['5/8', 'five eighths'],
              jocCodes: ['09290513-0001', '09290513-0002', '09290513-0003']
            },
            {
              id: 'wall-drywall-5/8-fire',
              label: '5/8" Fire-Rated (Type X)',
              keywords: ['fire', 'rated', 'type x', 'fire-rated'],
              jocCodes: ['09290513-0045', '09290513-0046', '09290513-0047']
            },
            {
              id: 'wall-drywall-moisture',
              label: 'Moisture Resistant (Green Board)',
              keywords: ['moisture', 'green', 'wet', 'bathroom'],
              jocCodes: ['09290513-0060', '09290513-0061', '09290513-0062']
            },
            {
              id: 'wall-drywall-abuse',
              label: 'Abuse/Impact Resistant',
              keywords: ['abuse', 'impact', 'high traffic'],
              jocCodes: ['09290513-0070', '09290513-0071']
            }
          ]
        },
        {
          id: 'wall-framing',
          label: 'Metal Stud Framing',
          icon: '🔩',
          question: 'What stud size?',
          keywords: ['framing', 'stud', 'metal stud', 'steel stud'],
          children: [
            {
              id: 'wall-framing-2.5',
              label: '2-1/2" Studs @ 16" O.C.',
              keywords: ['2.5', '2-1/2'],
              jocCodes: ['09221316-0001', '09221316-0002']
            },
            {
              id: 'wall-framing-3.625',
              label: '3-5/8" Studs @ 16" O.C.',
              keywords: ['3-5/8', '3.625'],
              jocCodes: ['09221316-0010', '09221316-0011']
            },
            {
              id: 'wall-framing-6',
              label: '6" Studs @ 16" O.C.',
              keywords: ['6 inch', '6"'],
              jocCodes: ['09221316-0020', '09221316-0021']
            }
          ]
        },
        {
          id: 'wall-demo',
          label: 'Wall Demolition',
          icon: '🔨',
          question: 'What type of wall to demo?',
          keywords: ['demo', 'demolition', 'remove', 'tear out'],
          children: [
            {
              id: 'wall-demo-drywall',
              label: 'Drywall Demolition',
              keywords: ['drywall', 'gypsum'],
              jocCodes: ['02411916-0001', '02411916-0002', '02411916-0003']
            },
            {
              id: 'wall-demo-plaster',
              label: 'Plaster Demolition',
              keywords: ['plaster', 'lath'],
              jocCodes: ['02411916-0010', '02411916-0011']
            },
            {
              id: 'wall-demo-masonry',
              label: 'Masonry/CMU Demolition',
              keywords: ['masonry', 'cmu', 'block', 'brick'],
              jocCodes: ['02411916-0020', '02411916-0021', '02411916-0022']
            }
          ]
        },
        {
          id: 'wall-paint',
          label: 'Wall Painting',
          icon: '🎨',
          question: 'What paint specification?',
          keywords: ['paint', 'painting', 'primer', 'finish'],
          children: [
            {
              id: 'wall-paint-primer',
              label: 'Primer Only',
              keywords: ['primer', 'prime'],
              jocCodes: ['09911300-0001', '09911300-0002']
            },
            {
              id: 'wall-paint-1coat',
              label: '1 Coat Finish',
              keywords: ['1 coat', 'one coat', 'single'],
              jocCodes: ['09911300-0010', '09911300-0011']
            },
            {
              id: 'wall-paint-2coat',
              label: '2 Coat Finish',
              keywords: ['2 coat', 'two coat', 'double'],
              jocCodes: ['09911300-0020', '09911300-0021']
            },
            {
              id: 'wall-paint-epoxy',
              label: 'Epoxy Paint',
              keywords: ['epoxy', 'hospital', 'clean room'],
              jocCodes: ['09911300-0030', '09911300-0031']
            }
          ]
        }
      ]
    },

    // ============ CEILINGS ============
    {
      id: 'ceiling',
      label: 'Ceiling',
      icon: '⬜',
      question: 'What type of ceiling?',
      keywords: ['ceiling', 'overhead', 'above'],
      children: [
        {
          id: 'ceiling-act',
          label: 'Acoustic Ceiling Tile (ACT)',
          icon: '🔲',
          question: 'What tile size?',
          keywords: ['act', 'acoustic', 'suspended', 'drop', 'tile'],
          children: [
            {
              id: 'ceiling-act-2x2',
              label: '2x2 Lay-in Tile',
              keywords: ['2x2', '24x24'],
              jocCodes: ['09511300-0001', '09511300-0002', '09511300-0003']
            },
            {
              id: 'ceiling-act-2x4',
              label: '2x4 Lay-in Tile',
              keywords: ['2x4', '24x48'],
              jocCodes: ['09511300-0010', '09511300-0011', '09511300-0012']
            },
            {
              id: 'ceiling-act-tegular',
              label: 'Tegular Edge Tile',
              keywords: ['tegular', 'reveal'],
              jocCodes: ['09511300-0020', '09511300-0021']
            }
          ]
        },
        {
          id: 'ceiling-grid',
          label: 'Ceiling Grid Only',
          icon: '📐',
          question: 'What grid type?',
          keywords: ['grid', 't-bar', 'suspension', 'main runner'],
          children: [
            {
              id: 'ceiling-grid-standard',
              label: 'Standard 15/16" Grid',
              keywords: ['standard', '15/16'],
              jocCodes: ['09511300-0050', '09511300-0051']
            },
            {
              id: 'ceiling-grid-narrow',
              label: '9/16" Narrow Profile Grid',
              keywords: ['narrow', '9/16', 'slim'],
              jocCodes: ['09511300-0055', '09511300-0056']
            }
          ]
        },
        {
          id: 'ceiling-drywall',
          label: 'Drywall Ceiling',
          icon: '📋',
          keywords: ['drywall', 'gypsum', 'hard lid'],
          jocCodes: ['09290513-0100', '09290513-0101', '09290513-0102']
        },
        {
          id: 'ceiling-demo',
          label: 'Ceiling Demolition',
          icon: '🔨',
          keywords: ['demo', 'remove', 'demolition'],
          jocCodes: ['02411916-0050', '02411916-0051', '02411916-0052']
        }
      ]
    },

    // ============ FLOORING ============
    {
      id: 'floor',
      label: 'Flooring',
      icon: '🟫',
      question: 'What type of flooring?',
      keywords: ['floor', 'flooring', 'ground'],
      children: [
        {
          id: 'floor-vct',
          label: 'VCT (Vinyl Composition Tile)',
          icon: '🔷',
          keywords: ['vct', 'vinyl', 'tile'],
          jocCodes: ['09651300-0001', '09651300-0002', '09651300-0003']
        },
        {
          id: 'floor-lvt',
          label: 'LVT (Luxury Vinyl Tile)',
          icon: '✨',
          keywords: ['lvt', 'luxury vinyl', 'plank'],
          jocCodes: ['09651300-0020', '09651300-0021', '09651300-0022']
        },
        {
          id: 'floor-carpet',
          label: 'Carpet',
          icon: '🟪',
          question: 'What carpet type?',
          keywords: ['carpet', 'carpeting'],
          children: [
            {
              id: 'floor-carpet-tile',
              label: 'Carpet Tile',
              keywords: ['tile', 'modular', 'square'],
              jocCodes: ['09681300-0001', '09681300-0002']
            },
            {
              id: 'floor-carpet-broadloom',
              label: 'Broadloom Carpet',
              keywords: ['broadloom', 'roll', 'stretched'],
              jocCodes: ['09681300-0010', '09681300-0011']
            }
          ]
        },
        {
          id: 'floor-epoxy',
          label: 'Epoxy Floor Coating',
          icon: '🧪',
          keywords: ['epoxy', 'coating', 'resinous'],
          jocCodes: ['09671300-0001', '09671300-0002', '09671300-0003']
        },
        {
          id: 'floor-ceramic',
          label: 'Ceramic/Porcelain Tile',
          icon: '🔶',
          keywords: ['ceramic', 'porcelain', 'tile'],
          jocCodes: ['09311300-0001', '09311300-0002', '09311300-0003']
        },
        {
          id: 'floor-demo',
          label: 'Floor Demolition',
          icon: '🔨',
          keywords: ['demo', 'remove', 'demolition'],
          jocCodes: ['02411916-0080', '02411916-0081', '02411916-0082']
        }
      ]
    },

    // ============ PLUMBING ============
    {
      id: 'plumbing',
      label: 'Plumbing',
      icon: '🚿',
      question: 'What plumbing work?',
      keywords: ['plumbing', 'pipe', 'water', 'drain'],
      children: [
        {
          id: 'plumbing-pipe-copper',
          label: 'Copper Pipe',
          icon: '🔶',
          question: 'What pipe diameter?',
          keywords: ['copper', 'water', 'supply'],
          children: [
            { id: 'plumbing-copper-1/2', label: '1/2" Copper', keywords: ['1/2', 'half'], jocCodes: ['22111316-0001', '22111316-0002'] },
            { id: 'plumbing-copper-3/4', label: '3/4" Copper', keywords: ['3/4'], jocCodes: ['22111316-0010', '22111316-0011'] },
            { id: 'plumbing-copper-1', label: '1" Copper', keywords: ['1 inch', '1"'], jocCodes: ['22111316-0020', '22111316-0021'] },
            { id: 'plumbing-copper-1.5', label: '1-1/2" Copper', keywords: ['1-1/2', '1.5'], jocCodes: ['22111316-0030', '22111316-0031'] },
            { id: 'plumbing-copper-2', label: '2" Copper', keywords: ['2 inch', '2"'], jocCodes: ['22111316-0040', '22111316-0041'] }
          ]
        },
        {
          id: 'plumbing-pipe-pvc',
          label: 'PVC Pipe (Drain)',
          icon: '⚪',
          question: 'What pipe diameter?',
          keywords: ['pvc', 'drain', 'waste', 'dwv'],
          children: [
            { id: 'plumbing-pvc-2', label: '2" PVC', keywords: ['2 inch', '2"'], jocCodes: ['22131316-0001', '22131316-0002'] },
            { id: 'plumbing-pvc-3', label: '3" PVC', keywords: ['3 inch', '3"'], jocCodes: ['22131316-0010', '22131316-0011'] },
            { id: 'plumbing-pvc-4', label: '4" PVC', keywords: ['4 inch', '4"'], jocCodes: ['22131316-0020', '22131316-0021'] }
          ]
        },
        {
          id: 'plumbing-fixtures',
          label: 'Fixtures',
          icon: '🚽',
          question: 'What fixture type?',
          keywords: ['fixture', 'toilet', 'sink', 'lavatory'],
          children: [
            { id: 'plumbing-fixture-toilet', label: 'Toilet / Water Closet', keywords: ['toilet', 'water closet', 'wc'], jocCodes: ['22411613-0001', '22411613-0002'] },
            { id: 'plumbing-fixture-lav', label: 'Lavatory (Sink)', keywords: ['lav', 'lavatory', 'sink', 'basin'], jocCodes: ['22411613-0010', '22411613-0011'] },
            { id: 'plumbing-fixture-faucet', label: 'Faucet', keywords: ['faucet', 'tap'], jocCodes: ['22411613-0020', '22411613-0021'] }
          ]
        }
      ]
    },

    // ============ FIRE PROTECTION ============
    {
      id: 'fire',
      label: 'Fire Protection',
      icon: '🔥',
      question: 'What fire protection work?',
      keywords: ['fire', 'sprinkler', 'suppression', 'alarm'],
      children: [
        {
          id: 'fire-sprinkler',
          label: 'Sprinkler Heads',
          icon: '💦',
          question: 'What sprinkler type?',
          keywords: ['sprinkler', 'head', 'spray'],
          children: [
            { id: 'fire-sprinkler-pendant', label: 'Pendant Head', keywords: ['pendant', 'drop'], jocCodes: ['21131113-0001', '21131113-0002'] },
            { id: 'fire-sprinkler-upright', label: 'Upright Head', keywords: ['upright'], jocCodes: ['21131113-0010', '21131113-0011'] },
            { id: 'fire-sprinkler-sidewall', label: 'Sidewall Head', keywords: ['sidewall', 'side'], jocCodes: ['21131113-0020', '21131113-0021'] },
            { id: 'fire-sprinkler-concealed', label: 'Concealed Head', keywords: ['concealed', 'hidden', 'flush'], jocCodes: ['21131113-0030', '21131113-0031'] }
          ]
        },
        {
          id: 'fire-pipe',
          label: 'Sprinkler Pipe',
          icon: '🔴',
          question: 'What pipe diameter?',
          keywords: ['pipe', 'main', 'branch'],
          children: [
            { id: 'fire-pipe-1', label: '1" Black Steel', keywords: ['1 inch', '1"'], jocCodes: ['21111316-0001', '21111316-0002'] },
            { id: 'fire-pipe-1.5', label: '1-1/2" Black Steel', keywords: ['1-1/2', '1.5'], jocCodes: ['21111316-0010', '21111316-0011'] },
            { id: 'fire-pipe-2', label: '2" Black Steel', keywords: ['2 inch', '2"'], jocCodes: ['21111316-0020', '21111316-0021'] },
            { id: 'fire-pipe-2.5', label: '2-1/2" Black Steel', keywords: ['2-1/2', '2.5'], jocCodes: ['21111316-0030', '21111316-0031'] },
            { id: 'fire-pipe-4', label: '4" Black Steel', keywords: ['4 inch', '4"'], jocCodes: ['21111316-0040', '21111316-0041'] }
          ]
        },
        {
          id: 'fire-alarm',
          label: 'Fire Alarm',
          icon: '🚨',
          keywords: ['alarm', 'detection', 'notification'],
          children: [
            { id: 'fire-alarm-smoke', label: 'Smoke Detector', keywords: ['smoke', 'detector'], jocCodes: ['28311300-0001', '28311300-0002'] },
            { id: 'fire-alarm-pull', label: 'Pull Station', keywords: ['pull', 'station', 'manual'], jocCodes: ['28311300-0010', '28311300-0011'] },
            { id: 'fire-alarm-horn', label: 'Horn/Strobe', keywords: ['horn', 'strobe', 'notification'], jocCodes: ['28311300-0020', '28311300-0021'] }
          ]
        }
      ]
    },

    // ============ ELECTRICAL ============
    {
      id: 'electrical',
      label: 'Electrical',
      icon: '⚡',
      question: 'What electrical work?',
      keywords: ['electrical', 'electric', 'power', 'wire'],
      children: [
        {
          id: 'electrical-outlet',
          label: 'Outlets / Receptacles',
          icon: '🔌',
          question: 'What outlet type?',
          keywords: ['outlet', 'receptacle', 'plug'],
          children: [
            { id: 'electrical-outlet-duplex', label: 'Duplex Receptacle (20A)', keywords: ['duplex', '20 amp', '20a'], jocCodes: ['26271326-0001', '26271326-0002'] },
            { id: 'electrical-outlet-gfci', label: 'GFCI Receptacle', keywords: ['gfci', 'gfi', 'ground fault'], jocCodes: ['26271326-0010', '26271326-0011'] },
            { id: 'electrical-outlet-dedicated', label: 'Dedicated Circuit', keywords: ['dedicated', 'isolated', 'ig'], jocCodes: ['26271326-0020', '26271326-0021'] }
          ]
        },
        {
          id: 'electrical-switch',
          label: 'Switches',
          icon: '🔘',
          question: 'What switch type?',
          keywords: ['switch', 'wall switch'],
          children: [
            { id: 'electrical-switch-single', label: 'Single Pole Switch', keywords: ['single', 'pole'], jocCodes: ['26271326-0030', '26271326-0031'] },
            { id: 'electrical-switch-3way', label: '3-Way Switch', keywords: ['3-way', '3 way', 'three'], jocCodes: ['26271326-0040', '26271326-0041'] },
            { id: 'electrical-switch-dimmer', label: 'Dimmer Switch', keywords: ['dimmer', 'dim'], jocCodes: ['26271326-0050', '26271326-0051'] }
          ]
        },
        {
          id: 'electrical-conduit',
          label: 'Conduit',
          icon: '🔧',
          question: 'What conduit type?',
          keywords: ['conduit', 'emt', 'pipe'],
          children: [
            { id: 'electrical-conduit-emt-1/2', label: '1/2" EMT', keywords: ['1/2', 'emt'], jocCodes: ['26053313-0001', '26053313-0002'] },
            { id: 'electrical-conduit-emt-3/4', label: '3/4" EMT', keywords: ['3/4', 'emt'], jocCodes: ['26053313-0010', '26053313-0011'] },
            { id: 'electrical-conduit-emt-1', label: '1" EMT', keywords: ['1 inch', 'emt'], jocCodes: ['26053313-0020', '26053313-0021'] }
          ]
        },
        {
          id: 'electrical-wire',
          label: 'Wire / Cable',
          icon: '〰️',
          question: 'What wire gauge?',
          keywords: ['wire', 'cable', 'conductor'],
          children: [
            { id: 'electrical-wire-12', label: '#12 AWG THHN', keywords: ['12', '#12', '20 amp'], jocCodes: ['26051319-0001', '26051319-0002'] },
            { id: 'electrical-wire-10', label: '#10 AWG THHN', keywords: ['10', '#10', '30 amp'], jocCodes: ['26051319-0010', '26051319-0011'] },
            { id: 'electrical-wire-mc', label: 'MC Cable', keywords: ['mc', 'metal clad'], jocCodes: ['26051319-0020', '26051319-0021'] }
          ]
        },
        {
          id: 'electrical-light',
          label: 'Lighting',
          icon: '💡',
          question: 'What fixture type?',
          keywords: ['light', 'lighting', 'fixture', 'luminaire'],
          children: [
            { id: 'electrical-light-2x4', label: '2x4 Troffer LED', keywords: ['2x4', 'troffer', 'led'], jocCodes: ['26511300-0001', '26511300-0002'] },
            { id: 'electrical-light-2x2', label: '2x2 Troffer LED', keywords: ['2x2', 'troffer', 'led'], jocCodes: ['26511300-0010', '26511300-0011'] },
            { id: 'electrical-light-can', label: 'Recessed Can Light', keywords: ['can', 'recessed', 'downlight'], jocCodes: ['26511300-0020', '26511300-0021'] },
            { id: 'electrical-light-exit', label: 'Exit Sign', keywords: ['exit', 'sign', 'egress'], jocCodes: ['26511300-0030', '26511300-0031'] },
            { id: 'electrical-light-emergency', label: 'Emergency Light', keywords: ['emergency', 'egress', 'battery'], jocCodes: ['26511300-0040', '26511300-0041'] }
          ]
        }
      ]
    },

    // ============ HVAC ============
    {
      id: 'hvac',
      label: 'HVAC',
      icon: '❄️',
      question: 'What HVAC work?',
      keywords: ['hvac', 'mechanical', 'duct', 'air'],
      children: [
        {
          id: 'hvac-duct',
          label: 'Ductwork',
          icon: '📦',
          question: 'What duct type?',
          keywords: ['duct', 'ductwork', 'air'],
          children: [
            { id: 'hvac-duct-rect', label: 'Rectangular Duct', keywords: ['rectangular', 'rect', 'square'], jocCodes: ['23311300-0001', '23311300-0002'] },
            { id: 'hvac-duct-round', label: 'Round/Spiral Duct', keywords: ['round', 'spiral'], jocCodes: ['23311300-0010', '23311300-0011'] },
            { id: 'hvac-duct-flex', label: 'Flexible Duct', keywords: ['flex', 'flexible'], jocCodes: ['23311300-0020', '23311300-0021'] }
          ]
        },
        {
          id: 'hvac-diffuser',
          label: 'Diffusers & Grilles',
          icon: '🔲',
          question: 'What diffuser type?',
          keywords: ['diffuser', 'grille', 'register'],
          children: [
            { id: 'hvac-diffuser-supply', label: 'Supply Diffuser', keywords: ['supply', 'ceiling'], jocCodes: ['23371300-0001', '23371300-0002'] },
            { id: 'hvac-diffuser-return', label: 'Return Grille', keywords: ['return', 'exhaust'], jocCodes: ['23371300-0010', '23371300-0011'] },
            { id: 'hvac-diffuser-linear', label: 'Linear Diffuser', keywords: ['linear', 'slot'], jocCodes: ['23371300-0020', '23371300-0021'] }
          ]
        },
        {
          id: 'hvac-vav',
          label: 'VAV Box',
          icon: '📟',
          keywords: ['vav', 'variable air volume', 'terminal'],
          jocCodes: ['23361300-0001', '23361300-0002', '23361300-0003']
        }
      ]
    },

    // ============ DOORS ============
    {
      id: 'door',
      label: 'Doors & Frames',
      icon: '🚪',
      question: 'What door work?',
      keywords: ['door', 'frame', 'hardware', 'opening'],
      children: [
        {
          id: 'door-hollow-metal',
          label: 'Hollow Metal Door & Frame',
          icon: '🚪',
          question: 'What door size?',
          keywords: ['hollow metal', 'hm', 'steel door'],
          children: [
            { id: 'door-hm-3070', label: '3\'0" x 7\'0" Single', keywords: ['3-0', '3070'], jocCodes: ['08111300-0001', '08111300-0002'] },
            { id: 'door-hm-3680', label: '3\'6" x 8\'0" Single', keywords: ['3-6', '3680'], jocCodes: ['08111300-0010', '08111300-0011'] },
            { id: 'door-hm-pair', label: 'Pair of Doors', keywords: ['pair', 'double'], jocCodes: ['08111300-0020', '08111300-0021'] }
          ]
        },
        {
          id: 'door-wood',
          label: 'Wood Door',
          icon: '🪵',
          keywords: ['wood', 'wooden'],
          jocCodes: ['08141300-0001', '08141300-0002', '08141300-0003']
        },
        {
          id: 'door-hardware',
          label: 'Door Hardware',
          icon: '🔐',
          question: 'What hardware?',
          keywords: ['hardware', 'lockset', 'closer'],
          children: [
            { id: 'door-hw-lockset', label: 'Lockset', keywords: ['lockset', 'lock', 'lever'], jocCodes: ['08711300-0001', '08711300-0002'] },
            { id: 'door-hw-closer', label: 'Door Closer', keywords: ['closer'], jocCodes: ['08711300-0010', '08711300-0011'] },
            { id: 'door-hw-hinges', label: 'Hinges', keywords: ['hinge', 'hinges'], jocCodes: ['08711300-0020', '08711300-0021'] },
            { id: 'door-hw-panic', label: 'Panic Hardware', keywords: ['panic', 'exit device', 'crash bar'], jocCodes: ['08711300-0030', '08711300-0031'] }
          ]
        }
      ]
    },

    // ============ DEMOLITION ============
    {
      id: 'demo',
      label: 'Demolition',
      icon: '🔨',
      question: 'What are you demolishing?',
      keywords: ['demo', 'demolition', 'remove', 'tear out', 'rip out'],
      children: [
        {
          id: 'demo-interior',
          label: 'Interior Demolition',
          icon: '🏚️',
          question: 'What interior element?',
          keywords: ['interior', 'inside'],
          children: [
            { id: 'demo-int-drywall', label: 'Drywall / Plaster', keywords: ['drywall', 'plaster', 'wall'], jocCodes: ['02411916-0001', '02411916-0002', '02411916-0003'] },
            { id: 'demo-int-ceiling', label: 'Ceiling (ACT/Drywall)', keywords: ['ceiling', 'act', 'tile'], jocCodes: ['02411916-0050', '02411916-0051'] },
            { id: 'demo-int-floor', label: 'Flooring (VCT/Tile/Carpet)', keywords: ['floor', 'vct', 'tile', 'carpet'], jocCodes: ['02411916-0080', '02411916-0081', '02411916-0082'] },
            { id: 'demo-int-partition', label: 'Partition/Stud Wall', keywords: ['partition', 'stud', 'framing'], jocCodes: ['02411916-0100', '02411916-0101'] },
            { id: 'demo-int-door', label: 'Doors & Frames', keywords: ['door', 'frame', 'hardware'], jocCodes: ['02411916-0120', '02411916-0121'] },
            { id: 'demo-int-fixture', label: 'Plumbing Fixtures', keywords: ['toilet', 'sink', 'fixture'], jocCodes: ['02411916-0150', '02411916-0151'] },
            { id: 'demo-int-cabinets', label: 'Cabinets/Casework', keywords: ['cabinet', 'casework', 'millwork'], jocCodes: ['02411916-0170', '02411916-0171'] }
          ]
        },
        {
          id: 'demo-masonry',
          label: 'Masonry Demolition',
          icon: '🧱',
          keywords: ['masonry', 'brick', 'cmu', 'block', 'concrete block'],
          jocCodes: ['02411916-0020', '02411916-0021', '02411916-0022', '02411916-0023']
        },
        {
          id: 'demo-concrete',
          label: 'Concrete Demolition',
          icon: '🪨',
          question: 'What concrete element?',
          keywords: ['concrete', 'slab', 'foundation'],
          children: [
            { id: 'demo-conc-slab', label: 'Floor Slab', keywords: ['slab', 'floor', 'sog'], jocCodes: ['02411916-0200', '02411916-0201'] },
            { id: 'demo-conc-wall', label: 'Concrete Wall', keywords: ['wall', 'foundation'], jocCodes: ['02411916-0210', '02411916-0211'] },
            { id: 'demo-conc-curb', label: 'Curb/Pad', keywords: ['curb', 'pad', 'housekeeping'], jocCodes: ['02411916-0220', '02411916-0221'] },
            { id: 'demo-conc-sawcut', label: 'Sawcutting', keywords: ['sawcut', 'saw cut', 'cut'], jocCodes: ['03811300-0001', '03811300-0002'] }
          ]
        },
        {
          id: 'demo-hazmat',
          label: 'Hazmat/Abatement',
          icon: '☢️',
          question: 'What type of hazmat?',
          keywords: ['hazmat', 'abatement', 'asbestos', 'lead', 'mold'],
          children: [
            { id: 'demo-hazmat-acm', label: 'Asbestos (ACM)', keywords: ['asbestos', 'acm', 'friable'], jocCodes: ['02821300-0001', '02821300-0002', '02821300-0003'] },
            { id: 'demo-hazmat-lead', label: 'Lead Paint', keywords: ['lead', 'lbp', 'lead paint'], jocCodes: ['02831300-0001', '02831300-0002'] },
            { id: 'demo-hazmat-mold', label: 'Mold Remediation', keywords: ['mold', 'mildew', 'fungus'], jocCodes: ['02871300-0001', '02871300-0002'] }
          ]
        },
        {
          id: 'demo-mep',
          label: 'MEP Demolition',
          icon: '⚡',
          question: 'What MEP system?',
          keywords: ['mep', 'mechanical', 'electrical', 'plumbing'],
          children: [
            { id: 'demo-mep-elec', label: 'Electrical (Conduit/Wire)', keywords: ['electrical', 'conduit', 'wire'], jocCodes: ['02411926-0001', '02411926-0002'] },
            { id: 'demo-mep-plumb', label: 'Plumbing (Pipe)', keywords: ['plumbing', 'pipe', 'drain'], jocCodes: ['02411922-0001', '02411922-0002'] },
            { id: 'demo-mep-hvac', label: 'HVAC (Duct)', keywords: ['hvac', 'duct', 'diffuser'], jocCodes: ['02411923-0001', '02411923-0002'] },
            { id: 'demo-mep-sprinkler', label: 'Sprinkler (Pipe/Heads)', keywords: ['sprinkler', 'fire', 'head'], jocCodes: ['02411921-0001', '02411921-0002'] }
          ]
        }
      ]
    },

    // ============ CONCRETE ============
    {
      id: 'concrete',
      label: 'Concrete',
      icon: '🪨',
      question: 'What concrete work?',
      keywords: ['concrete', 'cement', 'pour', 'slab'],
      children: [
        {
          id: 'concrete-slab',
          label: 'Slab on Grade',
          icon: '⬜',
          question: 'What thickness?',
          keywords: ['slab', 'sog', 'floor', 'grade'],
          children: [
            { id: 'concrete-slab-4', label: '4" Slab', keywords: ['4 inch', '4"'], jocCodes: ['03311300-0001', '03311300-0002'] },
            { id: 'concrete-slab-6', label: '6" Slab', keywords: ['6 inch', '6"'], jocCodes: ['03311300-0010', '03311300-0011'] },
            { id: 'concrete-slab-8', label: '8" Slab', keywords: ['8 inch', '8"'], jocCodes: ['03311300-0020', '03311300-0021'] }
          ]
        },
        {
          id: 'concrete-elevated',
          label: 'Elevated Slab',
          icon: '🏗️',
          keywords: ['elevated', 'suspended', 'deck'],
          jocCodes: ['03311300-0100', '03311300-0101', '03311300-0102']
        },
        {
          id: 'concrete-curb',
          label: 'Curb/Pad/Housekeeping',
          icon: '📐',
          keywords: ['curb', 'pad', 'housekeeping', 'equipment pad'],
          jocCodes: ['03311300-0150', '03311300-0151', '03311300-0152']
        },
        {
          id: 'concrete-repair',
          label: 'Concrete Repair',
          icon: '🔧',
          keywords: ['repair', 'patch', 'spall', 'crack'],
          jocCodes: ['03011300-0001', '03011300-0002', '03011300-0003']
        },
        {
          id: 'concrete-rebar',
          label: 'Reinforcing Steel',
          icon: '🔩',
          keywords: ['rebar', 'reinforcing', 'steel', 'mesh', 'wwf'],
          jocCodes: ['03211300-0001', '03211300-0002', '03211300-0003']
        }
      ]
    },

    // ============ MASONRY ============
    {
      id: 'masonry',
      label: 'Masonry',
      icon: '🧱',
      question: 'What masonry work?',
      keywords: ['masonry', 'brick', 'block', 'cmu', 'stone'],
      children: [
        {
          id: 'masonry-cmu',
          label: 'CMU Block Wall',
          icon: '⬛',
          question: 'What block size?',
          keywords: ['cmu', 'block', 'concrete block'],
          children: [
            { id: 'masonry-cmu-4', label: '4" CMU', keywords: ['4 inch', '4"'], jocCodes: ['04221300-0001', '04221300-0002'] },
            { id: 'masonry-cmu-6', label: '6" CMU', keywords: ['6 inch', '6"'], jocCodes: ['04221300-0010', '04221300-0011'] },
            { id: 'masonry-cmu-8', label: '8" CMU', keywords: ['8 inch', '8"'], jocCodes: ['04221300-0020', '04221300-0021'] },
            { id: 'masonry-cmu-12', label: '12" CMU', keywords: ['12 inch', '12"'], jocCodes: ['04221300-0030', '04221300-0031'] }
          ]
        },
        {
          id: 'masonry-brick',
          label: 'Brick',
          icon: '🟫',
          keywords: ['brick', 'face brick', 'veneer'],
          jocCodes: ['04211300-0001', '04211300-0002', '04211300-0003']
        },
        {
          id: 'masonry-repair',
          label: 'Masonry Repair/Repointing',
          icon: '🔧',
          keywords: ['repair', 'repoint', 'tuckpoint', 'mortar'],
          jocCodes: ['04011300-0001', '04011300-0002', '04011300-0003']
        },
        {
          id: 'masonry-grout',
          label: 'Grout Fill',
          icon: '🫗',
          keywords: ['grout', 'fill', 'solid grout'],
          jocCodes: ['04051600-0001', '04051600-0002']
        }
      ]
    },

    // ============ SPECIALTIES ============
    {
      id: 'specialties',
      label: 'Specialties',
      icon: '🚿',
      question: 'What specialty item?',
      keywords: ['specialties', 'accessory', 'toilet', 'locker'],
      children: [
        {
          id: 'spec-toilet',
          label: 'Toilet Accessories',
          icon: '🧻',
          question: 'What accessory?',
          keywords: ['toilet', 'restroom', 'bathroom', 'accessory'],
          children: [
            { id: 'spec-toilet-dispenser', label: 'Paper Dispenser', keywords: ['paper', 'dispenser', 'toilet paper'], jocCodes: ['10281300-0001', '10281300-0002'] },
            { id: 'spec-toilet-towel', label: 'Paper Towel Dispenser', keywords: ['towel', 'dispenser'], jocCodes: ['10281300-0010', '10281300-0011'] },
            { id: 'spec-toilet-soap', label: 'Soap Dispenser', keywords: ['soap', 'dispenser'], jocCodes: ['10281300-0020', '10281300-0021'] },
            { id: 'spec-toilet-mirror', label: 'Mirror', keywords: ['mirror'], jocCodes: ['10281300-0030', '10281300-0031'] },
            { id: 'spec-toilet-grab', label: 'Grab Bar', keywords: ['grab', 'bar', 'ada', 'handicap'], jocCodes: ['10281300-0040', '10281300-0041'] },
            { id: 'spec-toilet-partition', label: 'Toilet Partition', keywords: ['partition', 'stall'], jocCodes: ['10211300-0001', '10211300-0002'] }
          ]
        },
        {
          id: 'spec-lockers',
          label: 'Lockers',
          icon: '🔐',
          keywords: ['locker', 'storage'],
          jocCodes: ['10511300-0001', '10511300-0002', '10511300-0003']
        },
        {
          id: 'spec-signage',
          label: 'Signage',
          icon: '🪧',
          question: 'What type of sign?',
          keywords: ['sign', 'signage', 'wayfinding'],
          children: [
            { id: 'spec-sign-room', label: 'Room ID Sign', keywords: ['room', 'id', 'ada'], jocCodes: ['10141300-0001', '10141300-0002'] },
            { id: 'spec-sign-directory', label: 'Directory Sign', keywords: ['directory', 'lobby'], jocCodes: ['10141300-0010', '10141300-0011'] },
            { id: 'spec-sign-exit', label: 'Exit/Safety Sign', keywords: ['exit', 'safety', 'egress'], jocCodes: ['10141300-0020', '10141300-0021'] }
          ]
        },
        {
          id: 'spec-corner',
          label: 'Corner Guards',
          icon: '📐',
          keywords: ['corner', 'guard', 'protection'],
          jocCodes: ['10261300-0001', '10261300-0002']
        },
        {
          id: 'spec-extinguisher',
          label: 'Fire Extinguisher Cabinet',
          icon: '🧯',
          keywords: ['extinguisher', 'cabinet', 'fire'],
          jocCodes: ['10441300-0001', '10441300-0002']
        }
      ]
    },

    // ============ INSULATION ============
    {
      id: 'insulation',
      label: 'Insulation',
      icon: '🧊',
      question: 'What insulation type?',
      keywords: ['insulation', 'insulate', 'batt', 'rigid'],
      children: [
        {
          id: 'insul-batt',
          label: 'Batt Insulation',
          icon: '🟨',
          question: 'What R-value?',
          keywords: ['batt', 'fiberglass', 'mineral wool'],
          children: [
            { id: 'insul-batt-r11', label: 'R-11 (3-1/2")', keywords: ['r-11', 'r11'], jocCodes: ['07211300-0001', '07211300-0002'] },
            { id: 'insul-batt-r13', label: 'R-13 (3-1/2")', keywords: ['r-13', 'r13'], jocCodes: ['07211300-0010', '07211300-0011'] },
            { id: 'insul-batt-r19', label: 'R-19 (6")', keywords: ['r-19', 'r19'], jocCodes: ['07211300-0020', '07211300-0021'] },
            { id: 'insul-batt-r30', label: 'R-30 (10")', keywords: ['r-30', 'r30'], jocCodes: ['07211300-0030', '07211300-0031'] }
          ]
        },
        {
          id: 'insul-rigid',
          label: 'Rigid Board',
          icon: '📋',
          keywords: ['rigid', 'board', 'xps', 'eps', 'polyiso'],
          jocCodes: ['07211300-0100', '07211300-0101', '07211300-0102']
        },
        {
          id: 'insul-spray',
          label: 'Spray Foam',
          icon: '🫧',
          keywords: ['spray', 'foam', 'spf', 'closed cell', 'open cell'],
          jocCodes: ['07211300-0150', '07211300-0151']
        },
        {
          id: 'insul-pipe',
          label: 'Pipe Insulation',
          icon: '🔧',
          keywords: ['pipe', 'mechanical', 'fiberglass'],
          jocCodes: ['23071300-0001', '23071300-0002', '23071300-0003']
        }
      ]
    },

    // ============ WINDOWS/GLAZING ============
    {
      id: 'glazing',
      label: 'Windows & Glazing',
      icon: '🪟',
      question: 'What glazing work?',
      keywords: ['window', 'glass', 'glazing', 'storefront'],
      children: [
        {
          id: 'glazing-window',
          label: 'Window (Punched)',
          icon: '🖼️',
          question: 'What window type?',
          keywords: ['window', 'punched', 'opening'],
          children: [
            { id: 'glazing-win-fixed', label: 'Fixed Window', keywords: ['fixed', 'picture'], jocCodes: ['08511300-0001', '08511300-0002'] },
            { id: 'glazing-win-operable', label: 'Operable Window', keywords: ['operable', 'casement', 'awning'], jocCodes: ['08511300-0010', '08511300-0011'] },
            { id: 'glazing-win-slider', label: 'Sliding Window', keywords: ['sliding', 'slider'], jocCodes: ['08511300-0020', '08511300-0021'] }
          ]
        },
        {
          id: 'glazing-storefront',
          label: 'Storefront System',
          icon: '🏪',
          keywords: ['storefront', 'curtain wall', 'aluminum'],
          jocCodes: ['08411300-0001', '08411300-0002', '08411300-0003']
        },
        {
          id: 'glazing-interior',
          label: 'Interior Glazing',
          icon: '🔲',
          keywords: ['interior', 'sidelite', 'borrowed lite', 'relite'],
          jocCodes: ['08811300-0001', '08811300-0002']
        },
        {
          id: 'glazing-repair',
          label: 'Glass Repair/Replacement',
          icon: '🔧',
          keywords: ['repair', 'replace', 'broken'],
          jocCodes: ['08811300-0050', '08811300-0051']
        }
      ]
    },

    // ============ SITE WORK ============
    {
      id: 'sitework',
      label: 'Site Work',
      icon: '🏗️',
      question: 'What site work?',
      keywords: ['site', 'exterior', 'paving', 'landscape'],
      children: [
        {
          id: 'site-paving',
          label: 'Paving',
          icon: '🛣️',
          question: 'What paving type?',
          keywords: ['paving', 'asphalt', 'concrete', 'pavement'],
          children: [
            { id: 'site-pave-asphalt', label: 'Asphalt Paving', keywords: ['asphalt', 'blacktop'], jocCodes: ['32121300-0001', '32121300-0002'] },
            { id: 'site-pave-concrete', label: 'Concrete Paving', keywords: ['concrete', 'sidewalk'], jocCodes: ['32131300-0001', '32131300-0002'] },
            { id: 'site-pave-pavers', label: 'Unit Pavers', keywords: ['paver', 'brick', 'interlock'], jocCodes: ['32141300-0001', '32141300-0002'] }
          ]
        },
        {
          id: 'site-curb',
          label: 'Curb & Gutter',
          icon: '🚧',
          keywords: ['curb', 'gutter', 'edge'],
          jocCodes: ['32161300-0001', '32161300-0002']
        },
        {
          id: 'site-fence',
          label: 'Fencing',
          icon: '🚧',
          question: 'What fence type?',
          keywords: ['fence', 'fencing', 'gate'],
          children: [
            { id: 'site-fence-chain', label: 'Chain Link', keywords: ['chain', 'link', 'cyclone'], jocCodes: ['32311300-0001', '32311300-0002'] },
            { id: 'site-fence-ornamental', label: 'Ornamental Metal', keywords: ['ornamental', 'iron', 'aluminum'], jocCodes: ['32311300-0020', '32311300-0021'] },
            { id: 'site-fence-wood', label: 'Wood Fence', keywords: ['wood', 'privacy'], jocCodes: ['32311300-0030', '32311300-0031'] }
          ]
        },
        {
          id: 'site-landscape',
          label: 'Landscaping',
          icon: '🌳',
          keywords: ['landscape', 'planting', 'tree', 'shrub'],
          jocCodes: ['32911300-0001', '32911300-0002', '32911300-0003']
        }
      ]
    },

    // ============ OTHER ============
    {
      id: 'other',
      label: 'Other / Search',
      icon: '🔍',
      question: 'Describe what you\'re looking for...',
      keywords: [],
      // This triggers the translation machine instead
      jocCodes: []
    }
  ]
};

/**
 * Find a node by ID
 */
export function findNode(nodeId: string, tree: TreeNode = decisionTree): TreeNode | null {
  if (tree.id === nodeId) return tree;
  if (!tree.children) return null;
  
  for (const child of tree.children) {
    const found = findNode(nodeId, child);
    if (found) return found;
  }
  return null;
}

/**
 * Get the path to a node
 */
export function getNodePath(nodeId: string, tree: TreeNode = decisionTree, path: TreeNode[] = []): TreeNode[] | null {
  if (tree.id === nodeId) return [...path, tree];
  if (!tree.children) return null;
  
  for (const child of tree.children) {
    const found = getNodePath(nodeId, child, [...path, tree]);
    if (found) return found;
  }
  return null;
}

/**
 * Match keywords to find best node
 */
export function matchKeywords(text: string, tree: TreeNode = decisionTree): TreeNode[] {
  const words = text.toLowerCase().split(/\s+/);
  const matches: Array<{ node: TreeNode; score: number }> = [];
  
  function traverse(node: TreeNode) {
    if (node.keywords && node.keywords.length > 0) {
      const score = node.keywords.filter(kw => 
        words.some(w => w.includes(kw) || kw.includes(w))
      ).length;
      
      if (score > 0) {
        matches.push({ node, score });
      }
    }
    
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  traverse(tree);
  
  return matches
    .sort((a, b) => b.score - a.score)
    .map(m => m.node);
}
