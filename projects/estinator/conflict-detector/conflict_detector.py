#!/usr/bin/env python3
"""
Conflict Detector for Estinator
Detects discrepancies between construction documents
(drawings vs specs, addenda changes, schedule conflicts)
"""

import re
import json
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict
from datetime import datetime

@dataclass
class Conflict:
    """Represents a detected conflict"""
    type: str  # 'quantity', 'material', 'scope', 'addendum', 'schedule'
    severity: str  # 'critical', 'warning', 'info'
    location: str  # Where the conflict was found
    source_a: str  # First document/source
    source_b: str  # Second document/source
    description: str  # Human-readable description
    value_a: Optional[str] = None
    value_b: Optional[str] = None
    recommendation: Optional[str] = None

class ConflictDetector:
    """
    Detects conflicts in construction documents
    
    Supported conflict types:
    - Drawing vs Spec: Materials don't match
    - Addendum Changes: What's changed from original
    - Schedule Conflicts: Finish schedule vs door schedule mismatches
    - Quantity Discrepancies: Area takeoff vs BOQ mismatch
    - Scope Gaps: Missing details between trades
    """
    
    def __init__(self):
        self.conflicts: List[Conflict] = []
        
    def detect_draw_spec_conflict(self, drawing_text: str, spec_text: str, 
                                   drawing_source: str = "Drawing",
                                   spec_source: str = "Specification") -> List[Conflict]:
        """
        Detect conflicts between drawings and specifications
        
        Example: Drawing says "PVC pipe" but spec says "Cast iron"
        """
        conflicts = []
        
        # Extract materials from both sources
        drawing_materials = self._extract_materials(drawing_text)
        spec_materials = self._extract_materials(spec_text)
        
        # Check for material mismatches
        for material_type, drawing_val in drawing_materials.items():
            if material_type in spec_materials:
                spec_val = spec_materials[material_type]
                if not self._materials_match(drawing_val, spec_val):
                    conflicts.append(Conflict(
                        type="material",
                        severity="critical",
                        location=f"Material: {material_type}",
                        source_a=drawing_source,
                        source_b=spec_source,
                        description=f"Material mismatch for {material_type}",
                        value_a=drawing_val,
                        value_b=spec_val,
                        recommendation=f"Verify correct material. Drawing shows '{drawing_val}', Spec requires '{spec_val}'"
                    ))
        
        # Check for missing in spec
        for material_type in drawing_materials:
            if material_type not in spec_materials:
                conflicts.append(Conflict(
                    type="scope",
                    severity="warning",
                    location=f"Material: {material_type}",
                    source_a=drawing_source,
                    source_b=spec_source,
                    description=f"'{material_type}' in drawing but not specified",
                    value_a=drawing_materials[material_type],
                    value_b=None,
                    recommendation=f"Add {material_type} specification or confirm it's not required"
                ))
        
        self.conflicts.extend(conflicts)
        return conflicts
    
    def detect_addendum_changes(self, original_text: str, addendum_text: str,
                                 addendum_number: str = "Addendum 1") -> List[Conflict]:
        """
        Detect what changed in an addendum
        """
        conflicts = []
        
        # Extract key values (quantities, materials, etc.)
        original_values = self._extract_key_values(original_text)
        addendum_values = self._extract_key_values(addendum_text)
        
        for key in set(original_values.keys()) | set(addendum_values.keys()):
            orig_val = original_values.get(key)
            add_val = addendum_values.get(key)
            
            if orig_val != add_val:
                if orig_val is None:
                    conflicts.append(Conflict(
                        type="addendum",
                        severity="warning",
                        location=key,
                        source_a="Original",
                        source_b=addendum_number,
                        description=f"New requirement added in {addendum_number}",
                        value_a=None,
                        value_b=add_val,
                        recommendation=f"Review new {key} requirement: {add_val}"
                    ))
                elif add_val is None:
                    conflicts.append(Conflict(
                        type="addendum",
                        severity="critical",
                        location=key,
                        source_a="Original",
                        source_b=addendum_number,
                        description=f"Requirement deleted in {addendum_number}",
                        value_a=orig_val,
                        value_b=None,
                        recommendation=f"Confirm deletion of {key} was intentional"
                    ))
                else:
                    conflicts.append(Conflict(
                        type="addendum",
                        severity="critical",
                        location=key,
                        source_a="Original",
                        source_b=addendum_number,
                        description=f"Value changed in {addendum_number}",
                        value_a=orig_val,
                        value_b=add_val,
                        recommendation=f"Update estimate: {key} changed from {orig_val} to {add_val}"
                    ))
        
        self.conflicts.extend(conflicts)
        return conflicts
    
    def detect_schedule_conflicts(self, schedules: Dict[str, dict]) -> List[Conflict]:
        """
        Detect conflicts between different schedules
        
        Example: Door schedule says 5 doors, but room schedule shows 6 rooms
        """
        conflicts = []
        
        # Compare finish schedule vs door schedule per room
        if 'finish' in schedules and 'door' in schedules:
            finish = schedules['finish']
            doors = schedules['door']
            
            for room in finish.get('rooms', []):
                room_num = room.get('room_number')
                
                # Count doors for this room
                room_doors = [d for d in doors.get('doors', []) 
                             if d.get('room') == room_num]
                
                # Check if door count matches room type expectations
                # (e.g., office should have at least 1 door)
                room_type = room.get('room_type', '').lower()
                door_count = len(room_doors)
                
                if room_type in ['office', 'conference', 'classroom'] and door_count == 0:
                    conflicts.append(Conflict(
                        type="schedule",
                        severity="warning",
                        location=f"Room {room_num}",
                        source_a="Finish Schedule",
                        source_b="Door Schedule",
                        description=f"{room_type.title()} has no doors scheduled",
                        value_a=f"Room type: {room_type}",
                        value_b="0 doors",
                        recommendation=f"Verify door count for Room {room_num}"
                    ))
        
        # Compare wall types vs finish schedule
        if 'wall' in schedules and 'finish' in schedules:
            walls = schedules['wall']
            finish = schedules['finish']
            
            # Check for wall types not in finish schedule
            wall_types = set(w.get('type') for w in walls.get('walls', []))
            finish_wall_types = set(f.get('wall_type') for f in finish.get('rooms', []))
            
            for wt in wall_types:
                if wt and wt not in finish_wall_types:
                    conflicts.append(Conflict(
                        type="schedule",
                        severity="info",
                        location=f"Wall Type: {wt}",
                        source_a="Wall Schedule",
                        source_b="Finish Schedule",
                        description=f"Wall type '{wt}' not referenced in finish schedule",
                        value_a=wt,
                        value_b=None,
                        recommendation="Verify wall type usage or remove if not needed"
                    ))
        
        self.conflicts.extend(conflicts)
        return conflicts
    
    def detect_quantity_discrepancy(self, calculated_qty: float, 
                                     boq_qty: float,
                                     item_description: str,
                                     tolerance: float = 0.05) -> Optional[Conflict]:
        """
        Detect when calculated quantity differs from BOQ
        
        tolerance: 5% default (0.05)
        """
        if boq_qty == 0:
            return None
            
        variance = abs(calculated_qty - boq_qty) / boq_qty
        
        if variance > tolerance:
            severity = "critical" if variance > 0.20 else "warning"
            
            conflict = Conflict(
                type="quantity",
                severity=severity,
                location=item_description,
                source_a="Calculated (Takeoff)",
                source_b="Bill of Quantities",
                description=f"Quantity variance of {variance*100:.1f}% detected",
                value_a=f"{calculated_qty:.2f}",
                value_b=f"{boq_qty:.2f}",
                recommendation=f"Recalculate or verify BOQ. Difference: {abs(calculated_qty - boq_qty):.2f}"
            )
            self.conflicts.append(conflict)
            return conflict
        
        return None
    
    def _extract_materials(self, text: str) -> Dict[str, str]:
        """Extract material specifications from text"""
        materials = {}
        
        # Common material patterns
        patterns = {
            'pipe': r'(PVC|CPVC|ABS|Cast Iron|Copper|PEX|Galvanized)\s+(?:pipe|tubing)',
            'conduit': r'(EMT|RMC|PVC|Flexible|IMC)\s+conduit',
            'wire': r'(THHN|THWN|XHHW|MC|Romex)\s+(?:wire|cable)',
            'panel': r'(breaker panel|distribution panel|load center)',
            'fixture': r'(LED|fluorescent|incandescent)\s+(?:fixture|light)',
            'drywall': r'(5/8\"|1/2\")?\s*(type [xy]|fire-rated|moisture-resistant)?\s*drywall',
            'insulation': r'(R-\d+|fiberglass|mineral wool|foam)\s+insulation',
            'flooring': r'(vinyl|tile|carpet|concrete|epoxy)\s+flooring',
            'ceiling': r'(acoustical|gypsum|metal|exposed)\s+ceiling',
            'door': r'(hollow metal|wood|glass|aluminum)\s+door',
        }
        
        text_lower = text.lower()
        for material_type, pattern in patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                materials[material_type] = matches[0] if isinstance(matches[0], str) else ' '.join(matches[0])
        
        return materials
    
    def _materials_match(self, val_a: str, val_b: str) -> bool:
        """Check if two material values are equivalent"""
        # Normalize
        a = val_a.lower().strip()
        b = val_b.lower().strip()
        
        # Exact match
        if a == b:
            return True
        
        # Common equivalents
        equivalents = [
            {'pvc', 'cpvc'},  # Similar
            {'emt', 'electrical metallic tubing'},
            {'rmc', 'rigid metal conduit'},
            {'thhn', 'thwn'},  # Often interchangeable
        ]
        
        for equiv_set in equivalents:
            if a in equiv_set and b in equiv_set:
                return True
        
        return False
    
    def _extract_key_values(self, text: str) -> Dict[str, str]:
        """Extract key-value pairs from document text"""
        values = {}
        
        # Look for patterns like "Quantity: 100" or "Size: 6 inch"
        patterns = [
            r'(\w+)\s*[:=]\s*([\d\w\s/."\'-]+)',
            r'(quantity|qty|count|size|length|width|height|area|volume)\s*[:=]?\s*([\d.,]+\s*\w*)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for key, val in matches:
                values[key.strip().lower()] = val.strip()
        
        return values
    
    def get_summary(self) -> dict:
        """Get summary of all detected conflicts"""
        critical = [c for c in self.conflicts if c.severity == "critical"]
        warnings = [c for c in self.conflicts if c.severity == "warning"]
        info = [c for c in self.conflicts if c.severity == "info"]
        
        return {
            "total": len(self.conflicts),
            "critical": len(critical),
            "warning": len(warnings),
            "info": len(info),
            "by_type": {
                "material": len([c for c in self.conflicts if c.type == "material"]),
                "quantity": len([c for c in self.conflicts if c.type == "quantity"]),
                "schedule": len([c for c in self.conflicts if c.type == "schedule"]),
                "addendum": len([c for c in self.conflicts if c.type == "addendum"]),
                "scope": len([c for c in self.conflicts if c.type == "scope"]),
            }
        }
    
    def export_report(self, output_path: str):
        """Export conflicts to JSON report"""
        report = {
            "generated_at": datetime.now().isoformat(),
            "summary": self.get_summary(),
            "conflicts": [asdict(c) for c in self.conflicts]
        }
        
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        return output_path
    
    def format_report(self) -> str:
        """Format conflicts as human-readable report"""
        summary = self.get_summary()
        
        report = f"""🔍 CONFLICT DETECTION REPORT

SUMMARY:
• Total Conflicts: {summary['total']}
• Critical: {summary['critical']} ⚠️
• Warnings: {summary['warning']} ⚡
• Info: {summary['info']} ℹ️

BY TYPE:
• Material Conflicts: {summary['by_type']['material']}
• Quantity Issues: {summary['by_type']['quantity']}
• Schedule Conflicts: {summary['by_type']['schedule']}
• Addendum Changes: {summary['by_type']['addendum']}
• Scope Gaps: {summary['by_type']['scope']}

"""
        
        if self.conflicts:
            report += "DETAILED FINDINGS:\n"
            report += "=" * 50 + "\n\n"
            
            for i, conflict in enumerate(self.conflicts, 1):
                icon = "🔴" if conflict.severity == "critical" else "🟡" if conflict.severity == "warning" else "🔵"
                report += f"{icon} #{i}: {conflict.type.upper()} - {conflict.location}\n"
                report += f"   Severity: {conflict.severity.upper()}\n"
                report += f"   {conflict.source_a}: {conflict.value_a or 'N/A'}\n"
                report += f"   {conflict.source_b}: {conflict.value_b or 'N/A'}\n"
                report += f"   Issue: {conflict.description}\n"
                if conflict.recommendation:
                    report += f"   💡 {conflict.recommendation}\n"
                report += "\n"
        else:
            report += "✅ No conflicts detected!\n"
        
        return report

# CLI interface
if __name__ == "__main__":
    import sys
    
    detector = ConflictDetector()
    
    if len(sys.argv) < 2:
        print("Conflict Detector for Estinator")
        print()
        print("Usage:")
        print("  python conflict_detector.py test")
        print()
        print("Or use in Python:")
        print("  detector = ConflictDetector()")
        print("  detector.detect_draw_spec_conflict(drawing_text, spec_text)")
        print("  detector.detect_addendum_changes(original, addendum)")
        print("  detector.detect_schedule_conflicts(schedules)")
        sys.exit(0)
    
    if sys.argv[1] == "test":
        # Run demo test
        print("Running demo conflict detection...\n")
        
        # Test 1: Drawing vs Spec conflict
        drawing = """
        Plumbing Riser Diagram:
        - 4 inch PVC soil pipe
        - 2 inch PVC waste lines
        - Copper water supply
        """
        
        spec = """
        Division 22 Plumbing Specifications:
        - All soil pipe shall be Cast Iron, no-hub
        - Waste lines: Cast Iron or PVC
        - Water supply: Type L Copper
        """
        
        detector.detect_draw_spec_conflict(drawing, spec, "Drawing A-101", "Spec 221000")
        
        # Test 2: Addendum change
        original = """
        Window Quantity: 25
        Type: Double-hung, vinyl
        Glazing: Double pane
        """
        
        addendum = """
        REVISED per Addendum 2:
        Window Quantity: 30
        Type: Double-hung, vinyl
        Glazing: Triple pane (energy code update)
        """
        
        detector.detect_addendum_changes(original, addendum, "Addendum 2")
        
        # Test 3: Schedule conflict
        schedules = {
            'finish': {
                'rooms': [
                    {'room_number': '101', 'room_type': 'Office', 'wall_type': 'GYPSUM'},
                    {'room_number': '102', 'room_type': 'Office', 'wall_type': 'GYPSUM'},
                    {'room_number': '103', 'room_type': 'Conference', 'wall_type': 'GYPSUM'},
                ]
            },
            'door': {
                'doors': [
                    {'room': '101', 'type': 'HM-1'},
                    {'room': '102', 'type': 'HM-1'},
                    # Room 103 missing door!
                ]
            },
            'wall': {
                'walls': [
                    {'type': 'GYPSUM', 'thickness': '5/8"'},
                    {'type': 'CMU', 'thickness': '8"'},  # Not in finish schedule
                ]
            }
        }
        
        detector.detect_schedule_conflicts(schedules)
        
        # Test 4: Quantity discrepancy
        detector.detect_quantity_discrepancy(
            calculated_qty=1250.0,
            boq_qty=1000.0,
            item_description="Concrete Slab (CY)"
        )
        
        # Print report
        print(detector.format_report())
        
        # Export
        output = detector.export_report("/Users/baibureh/clawd/projects/estinator/conflict-detector/demo_report.json")
        print(f"\n📄 Report exported to: {output}")
