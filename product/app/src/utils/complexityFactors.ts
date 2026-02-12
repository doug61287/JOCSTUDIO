/**
 * Complexity Factors System
 * 
 * "Let's handle these separately at the end for potential
 *  local/global adjustments to the estimate"
 * 
 * Project-level toggles that apply multipliers to the estimate:
 * - Night/Weekend Work (+25-50%)
 * - Occupied Space Premium (+10-25%)
 * - Phased Work / Limited Access (+15-30%)
 * - Infection Control (medical facilities) (+15-35%)
 * - Security Clearance Required (+10-20%)
 * - Historic Preservation (+20-40%)
 */

// ============================================
// TYPES
// ============================================

export interface ComplexityFactor {
  id: string;
  name: string;
  description: string;
  category: 'schedule' | 'access' | 'environment' | 'compliance';
  icon: string;  // Lucide icon name
  defaultMultiplier: number;  // Default percentage (e.g., 0.35 = +35%)
  minMultiplier: number;
  maxMultiplier: number;
  enabled: boolean;
  multiplier: number;  // Current selected multiplier
  appliesTo?: string[];  // Optional: specific task code prefixes this applies to
  notes?: string;
}

export interface ProjectComplexity {
  factors: ComplexityFactor[];
  globalNotes?: string;
}

// ============================================
// DEFAULT COMPLEXITY FACTORS
// ============================================

export const DEFAULT_COMPLEXITY_FACTORS: ComplexityFactor[] = [
  // Schedule Factors
  {
    id: 'night-work',
    name: 'Night/Weekend Work',
    description: 'Work performed outside normal business hours (6PM-6AM or weekends)',
    category: 'schedule',
    icon: 'Moon',
    defaultMultiplier: 0.35,
    minMultiplier: 0.25,
    maxMultiplier: 0.50,
    enabled: false,
    multiplier: 0.35,
  },
  {
    id: 'overtime',
    name: 'Overtime Premium',
    description: 'Extended shifts or accelerated schedule requiring overtime labor',
    category: 'schedule',
    icon: 'Clock',
    defaultMultiplier: 0.25,
    minMultiplier: 0.15,
    maxMultiplier: 0.50,
    enabled: false,
    multiplier: 0.25,
  },
  
  // Access Factors
  {
    id: 'occupied-space',
    name: 'Occupied Space',
    description: 'Work in areas with ongoing operations, requiring coordination and protection',
    category: 'access',
    icon: 'Users',
    defaultMultiplier: 0.15,
    minMultiplier: 0.10,
    maxMultiplier: 0.25,
    enabled: false,
    multiplier: 0.15,
  },
  {
    id: 'limited-access',
    name: 'Limited Access / Phased Work',
    description: 'Restricted work areas, small work windows, or phased construction',
    category: 'access',
    icon: 'DoorClosed',
    defaultMultiplier: 0.20,
    minMultiplier: 0.15,
    maxMultiplier: 0.35,
    enabled: false,
    multiplier: 0.20,
  },
  {
    id: 'high-rise',
    name: 'High-Rise Premium',
    description: 'Work above 6 floors, requiring hoisting and vertical logistics',
    category: 'access',
    icon: 'Building2',
    defaultMultiplier: 0.15,
    minMultiplier: 0.10,
    maxMultiplier: 0.30,
    enabled: false,
    multiplier: 0.15,
  },
  
  // Environment Factors
  {
    id: 'infection-control',
    name: 'Infection Control (ICRA)',
    description: 'Healthcare facility requirements: barriers, HEPA, negative pressure',
    category: 'environment',
    icon: 'ShieldPlus',
    defaultMultiplier: 0.25,
    minMultiplier: 0.15,
    maxMultiplier: 0.40,
    enabled: false,
    multiplier: 0.25,
  },
  {
    id: 'hazmat',
    name: 'Hazardous Materials',
    description: 'Work involving or adjacent to hazardous materials (non-abatement)',
    category: 'environment',
    icon: 'AlertTriangle',
    defaultMultiplier: 0.20,
    minMultiplier: 0.10,
    maxMultiplier: 0.35,
    enabled: false,
    multiplier: 0.20,
  },
  {
    id: 'clean-room',
    name: 'Clean Room / Sensitive Area',
    description: 'Data centers, labs, or other sensitive environments',
    category: 'environment',
    icon: 'Sparkles',
    defaultMultiplier: 0.20,
    minMultiplier: 0.15,
    maxMultiplier: 0.30,
    enabled: false,
    multiplier: 0.20,
  },
  
  // Compliance Factors
  {
    id: 'security-clearance',
    name: 'Security Clearance Required',
    description: 'Background checks, escorts, or restricted access protocols',
    category: 'compliance',
    icon: 'KeyRound',
    defaultMultiplier: 0.15,
    minMultiplier: 0.10,
    maxMultiplier: 0.25,
    enabled: false,
    multiplier: 0.15,
  },
  {
    id: 'historic',
    name: 'Historic Preservation',
    description: 'Landmark building with preservation requirements',
    category: 'compliance',
    icon: 'Landmark',
    defaultMultiplier: 0.25,
    minMultiplier: 0.15,
    maxMultiplier: 0.45,
    enabled: false,
    multiplier: 0.25,
  },
  {
    id: 'prevailing-wage',
    name: 'Prevailing Wage',
    description: 'Project requires prevailing wage rates (if not already in base)',
    category: 'compliance',
    icon: 'BadgeDollarSign',
    defaultMultiplier: 0.20,
    minMultiplier: 0.10,
    maxMultiplier: 0.35,
    enabled: false,
    multiplier: 0.20,
  },
];

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate total complexity multiplier from enabled factors
 * Factors are additive (not compounding)
 */
export function calculateComplexityMultiplier(factors: ComplexityFactor[]): number {
  const enabledFactors = factors.filter(f => f.enabled);
  if (enabledFactors.length === 0) return 1.0;
  
  const totalPremium = enabledFactors.reduce((sum, f) => sum + f.multiplier, 0);
  return 1.0 + totalPremium;
}

/**
 * Get breakdown of complexity adjustments
 */
export function getComplexityBreakdown(
  factors: ComplexityFactor[], 
  subtotal: number
): { factor: ComplexityFactor; amount: number }[] {
  return factors
    .filter(f => f.enabled)
    .map(f => ({
      factor: f,
      amount: subtotal * f.multiplier
    }));
}

/**
 * Calculate total with complexity factors applied
 */
export function applyComplexityFactors(
  subtotal: number, 
  factors: ComplexityFactor[]
): { 
  subtotal: number; 
  complexityTotal: number; 
  adjustedTotal: number;
  breakdown: { factor: ComplexityFactor; amount: number }[];
} {
  const breakdown = getComplexityBreakdown(factors, subtotal);
  const complexityTotal = breakdown.reduce((sum, b) => sum + b.amount, 0);
  
  return {
    subtotal,
    complexityTotal,
    adjustedTotal: subtotal + complexityTotal,
    breakdown
  };
}

// ============================================
// CATEGORY HELPERS
// ============================================

export const CATEGORY_INFO: Record<string, { name: string; color: string; icon: string }> = {
  schedule: { name: 'Schedule', color: 'amber', icon: 'Calendar' },
  access: { name: 'Access', color: 'blue', icon: 'DoorOpen' },
  environment: { name: 'Environment', color: 'emerald', icon: 'Shield' },
  compliance: { name: 'Compliance', color: 'purple', icon: 'FileCheck' },
};

export function getFactorsByCategory(factors: ComplexityFactor[]): Record<string, ComplexityFactor[]> {
  return factors.reduce((acc, factor) => {
    if (!acc[factor.category]) acc[factor.category] = [];
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<string, ComplexityFactor[]>);
}

/**
 * Create initial complexity state for a new project
 */
export function createDefaultComplexity(): ProjectComplexity {
  return {
    factors: DEFAULT_COMPLEXITY_FACTORS.map(f => ({ ...f })),
    globalNotes: '',
  };
}
