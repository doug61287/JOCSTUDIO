#!/usr/bin/env python3
"""
Drawing vs Specification Comparison Engine (Phase 3)

Automatically compares construction drawings against specifications
to find conflicts, omissions, and discrepancies.

This is the #1 source of change orders and disputes.
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

@dataclass
class SpecificationRequirement:
    """A requirement extracted from specifications"""
    spec_section: str
    paragraph: str
    requirement: str
    material: Optional[str] = None
    method: Optional[str] = None
    standard: Optional[str] = None  # ASTM, ANSI, etc.

@dataclass
class DrawingElement:
    """An element shown on drawings"""
    drawing: str
    detail_ref: Optional[str]
    element_type: str
    material: Optional[str]
    location: str
    notes: List[str]

@dataclass
class DrawSpecConflict:
    """A conflict between drawing and specification"""
    element: str
    location: str
    drawing_ref: str
    spec_section: str
    
    drawing_value: str
    spec_value: str
    
    severity: str
    category: str  # 'material', 'method', 'omission', 'addition'
    
    description: str
    recommendation: str


class DrawingSpecComparator:
    """
    Compares drawings against specifications to find conflicts.
    
    Common conflict types:
    1. Material mismatch (Drawing shows X, Spec requires Y)
    2. Method mismatch (Different installation requirements)
    3. Omission on drawings (Required by spec but not shown)
    4. Addition on drawings (Shown but not in spec scope)
    """
    
    def __init__(self):
        self.specs: Dict[str, List[SpecificationRequirement]] = {}
        self.drawings: Dict[str, List[DrawingElement]] = {}
        self.conflicts: List[DrawSpecConflict] = []
        
    def load_specification(self, spec_section: str, text: str):
        """
        Load and parse a specification section.
        
        Example spec_section: "092900 - Gypsum Board"
        """
        requirements = self._parse_specification(text, spec_section)
        self.specs[spec_section] = requirements
        
    def load_drawing(self, drawing_number: str, text: str):
        """
        Load and parse a drawing.
        """
        elements = self._parse_drawing(text, drawing_number)
        self.drawings[drawing_number] = elements
        
    def _parse_specification(self, text: str, section: str) -> List[SpecificationRequirement]:
        """Extract requirements from specification text"""
        requirements = []
        
        # Common patterns in specs
        patterns = {
            'material': r'(?:materials?|products?)\s+(?:shall be|shall conform to|to be)\s+([^.]+)',
            'method': r'(?:installation|application|execution)\s+(?:shall|to be)\s+([^.]+)',
            'standard': r'(ASTM\s+[A-Z]?\d+|ANSI\s+[A-Z]?\d+|NFPA\s+\d+|UL\s+\d+)',
        }
        
        lines = text.split('\n')
        for i, line in enumerate(lines):
            # Look for material requirements
            for pattern_name, pattern in patterns.items():
                matches = re.findall(pattern, line, re.IGNORECASE)
                for match in matches:
                    req = SpecificationRequirement(
                        spec_section=section,
                        paragraph=f"{i+1}",
                        requirement=line.strip(),
                    )
                    if pattern_name == 'material':
                        req.material = match.strip()
                    elif pattern_name == 'method':
                        req.method = match.strip()
                    elif pattern_name == 'standard':
                        req.standard = match.strip()
                    
                    requirements.append(req)
        
        return requirements
    
    def _parse_drawing(self, text: str, drawing: str) -> List[DrawingElement]:
        """Extract elements from drawing text"""
        elements = []
        
        # Pattern matching for common drawing annotations
        lines = text.split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # Look for material callouts
            material_patterns = [
                r'(\d+\s*/\s*\d+"\s+)?(GWB|GYPSUM|CONCRETE|CMU|BRICK|STONE|STEEL|ALUM)',
                r'\b(PVC|CPVC|COPPER|CAST\s+IRON|STEEL)\s+(PIPE|TUBE|CONDUIT)',
            ]
            
            material = None
            for pattern in material_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    material = match.group(0)
                    break
            
            if material or 'NOTE' in line or 'TYP' in line:
                element = DrawingElement(
                    drawing=drawing,
                    detail_ref=self._extract_detail_ref(line),
                    element_type=self._infer_element_type(line),
                    material=material,
                    location=self._extract_location(line, lines, i),
                    notes=[line] if 'NOTE' in line else []
                )
                elements.append(element)
        
        return elements
    
    def compare_all(self) -> List[DrawSpecConflict]:
        """
        Run full comparison between all loaded drawings and specs.
        """
        conflicts = []
        
        # Compare each drawing against relevant specs
        for drawing_num, elements in self.drawings.items():
            for element in elements:
                # Find relevant spec section
                spec_section = self._find_relevant_spec(element)
                
                if spec_section:
                    spec_reqs = self.specs.get(spec_section, [])
                    
                    # Check for material conflicts
                    for spec_req in spec_reqs:
                        if spec_req.material and element.material:
                            conflict = self._check_material_conflict(
                                element, spec_req, drawing_num, spec_section
                            )
                            if conflict:
                                conflicts.append(conflict)
                else:
                    # No spec found for this element type
                    conflicts.append(DrawSpecConflict(
                        element=element.element_type,
                        location=element.location,
                        drawing_ref=drawing_num,
                        spec_section="N/A",
                        drawing_value=element.material or "Shown",
                        spec_value="Not specified",
                        severity="medium",
                        category="omission",
                        description=f"{element.element_type} shown on {drawing_num} but no specification found for this element type.",
                        recommendation="Verify this work is within scope or provide specification."
                    ))
        
        self.conflicts = conflicts
        return conflicts
    
    def _check_material_conflict(self, element: DrawingElement, 
                                  spec_req: SpecificationRequirement,
                                  drawing: str, spec: str) -> Optional[DrawSpecConflict]:
        """Check if drawing material conflicts with spec requirement"""
        
        # Normalize materials for comparison
        drawing_mat = element.material.lower() if element.material else ""
        spec_mat = spec_req.material.lower() if spec_req.material else ""
        
        # Check for direct mismatch
        if drawing_mat and spec_mat and drawing_mat != spec_mat:
            # Check if they're equivalent (e.g., GWB vs Gypsum Board)
            if not self._materials_equivalent(drawing_mat, spec_mat):
                return DrawSpecConflict(
                    element=element.element_type,
                    location=element.location,
                    drawing_ref=drawing,
                    spec_section=spec,
                    drawing_value=element.material,
                    spec_value=spec_req.material,
                    severity="high",
                    category="material",
                    description=f"Drawing {drawing} shows {element.material} but Specification {spec} requires {spec_req.material}.",
                    recommendation="Clarify which material takes precedence and update the conflicting document."
                )
        
        return None
    
    def _materials_equivalent(self, mat1: str, mat2: str) -> bool:
        """Check if two material descriptions are equivalent"""
        # Normalize
        m1 = mat1.lower().replace('-', ' ').replace('/', ' ')
        m2 = mat2.lower().replace('-', ' ').replace('/', ' ')
        
        # Common equivalents
        equivalents = [
            {'gwb', 'gypsum', 'drywall', 'sheetrock'},
            {'pvc', 'cpvc'},
            {'hm', 'hollow metal'},
            {'wd', 'wood'},
            {'alu', 'aluminum'},
        ]
        
        for equiv_set in equivalents:
            if any(e in m1 for e in equiv_set) and any(e in m2 for e in equiv_set):
                return True
        
        return False
    
    def _find_relevant_spec(self, element: DrawingElement) -> Optional[str]:
        """Find specification section relevant to drawing element"""
        # Mapping of element types to spec sections
        spec_mapping = {
            'gypsum': '092900',
            'gwb': '092900',
            'drywall': '092900',
            'door': '081000',
            'window': '085000',
            'concrete': '033000',
            'masonry': '042000',
            'steel': '051000',
            'aluminum': '085000',
            'roofing': '075000',
            'insulation': '072000',
        }
        
        element_type = element.element_type.lower()
        material = (element.material or "").lower()
        
        for key, spec in spec_mapping.items():
            if key in element_type or key in material:
                # Check if we have this spec loaded
                for loaded_spec in self.specs.keys():
                    if spec in loaded_spec:
                        return loaded_spec
        
        return None
    
    def _extract_detail_ref(self, line: str) -> Optional[str]:
        """Extract detail reference from line"""
        match = re.search(r'\b(\d+/[A-Z]-\d+|Det\.?\s*\d+)\b', line)
        return match.group(1) if match else None
    
    def _infer_element_type(self, line: str) -> str:
        """Infer element type from line content"""
        line_lower = line.lower()
        
        if any(w in line_lower for w in ['wall', 'partition']):
            return 'Wall'
        elif any(w in line_lower for w in ['door', 'frame']):
            return 'Door'
        elif any(w in line_lower for w in ['window', 'glazing']):
            return 'Window'
        elif any(w in line_lower for w in ['floor', 'ceiling', 'roof']):
            return 'Horizontal Surface'
        elif any(w in line_lower for w in ['pipe', 'conduit', 'duct']):
            return 'MEP'
        else:
            return 'General'
    
    def _extract_location(self, line: str, all_lines: List[str], index: int) -> str:
        """Extract location context"""
        # Look for room numbers nearby
        for i in range(max(0, index-3), min(len(all_lines), index+3)):
            room_match = re.search(r'\bRoom\s+(\d+)\b', all_lines[i], re.IGNORECASE)
            if room_match:
                return f"Room {room_match.group(1)}"
        
        return "General"
    
    def generate_report(self) -> Dict:
        """Generate comparison report"""
        return {
            'summary': {
                'total_conflicts': len(self.conflicts),
                'by_severity': {
                    'high': len([c for c in self.conflicts if c.severity == 'high']),
                    'medium': len([c for c in self.conflicts if c.severity == 'medium']),
                    'low': len([c for c in self.conflicts if c.severity == 'low']),
                },
                'by_category': {
                    'material': len([c for c in self.conflicts if c.category == 'material']),
                    'method': len([c for c in self.conflicts if c.category == 'method']),
                    'omission': len([c for c in self.conflicts if c.category == 'omission']),
                    'addition': len([c for c in self.conflicts if c.category == 'addition']),
                }
            },
            'conflicts': [
                {
                    'element': c.element,
                    'location': c.location,
                    'drawing': c.drawing_ref,
                    'spec': c.spec_section,
                    'issue': f"{c.drawing_value} vs {c.spec_value}",
                    'severity': c.severity,
                    'description': c.description,
                    'recommendation': c.recommendation
                }
                for c in self.conflicts
            ]
        }


def demo():
    """Demo drawing vs spec comparison"""
    print("=" * 60)
    print("DRAWING VS SPECIFICATION COMPARATOR (Phase 3)")
    print("=" * 60)
    
    comparator = DrawingSpecComparator()
    
    # Load specification
    spec_text = """
    SECTION 092900 - GYPSUM BOARD
    
    2.1 MATERIALS
    A. Gypsum Board: ASTM C1396, 5/8" thick, Type X, fire-rated.
    B. Fasteners: ASTM C1002, corrosion-resistant.
    
    2.2 INSTALLATION
    A. Install gypsum board per GA-216.
    B. All joints to be taped and finished.
    """
    
    comparator.load_specification("092900 - Gypsum Board", spec_text)
    
    # Load drawing (conflicting material)
    drawing_text = """
    INTERIOR WALL SECTION
    Room 101
    
    1/2" GWB on metal studs @ 16" OC
    TYPICAL
    
    Note: Coordinate with electrical
    """
    
    comparator.load_drawing("A-501", drawing_text)
    
    # Load another drawing (correct material)
    drawing_text2 = """
    WALL SECTION - CORRIDOR
    Room 102
    
    5/8" Type X GWB on metal studs @ 16" OC
    Fire-rated per code
    """
    
    comparator.load_drawing("A-502", drawing_text2)
    
    # Run comparison
    print("\n🔍 Comparing drawings against specifications...")
    conflicts = comparator.compare_all()
    
    # Generate report
    report = comparator.generate_report()
    
    print(f"\n✅ Found {report['summary']['total_conflicts']} conflicts")
    print("\n" + "=" * 60)
    
    # Show conflicts
    for conflict in conflicts:
        icon = "🔴" if conflict.severity == 'high' else "🟡" if conflict.severity == 'medium' else "🔵"
        print(f"\n{icon} {conflict.category.upper()} CONFLICT")
        print(f"   Element: {conflict.element} at {conflict.location}")
        print(f"   Drawing: {conflict.drawing_ref}")
        print(f"   Spec: {conflict.spec_section}")
        print(f"   Issue: {conflict.drawing_value} vs {conflict.spec_value}")
        print(f"   {conflict.description}")
        print(f"   💡 {conflict.recommendation}")
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print(f"  High severity: {report['summary']['by_severity']['high']}")
    print(f"  Medium severity: {report['summary']['by_severity']['medium']}")
    print(f"  Material conflicts: {report['summary']['by_category']['material']}")
    print(f"  Omissions: {report['summary']['by_category']['omission']}")


if __name__ == "__main__":
    demo()
