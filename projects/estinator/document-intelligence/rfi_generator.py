#!/usr/bin/env python3
"""
RFI (Request for Information) Generator for Estinator (Phase 3)

Automatically generates RFIs based on:
- Missing information in documents
- Conflicts between drawings and specs
- Ambiguous specifications
- Incomplete scope
"""

import json
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from datetime import datetime

@dataclass
class RFI:
    """Request for Information"""
    id: str
    title: str
    category: str  # 'missing_info', 'conflict', 'clarification', 'incomplete'
    severity: str  # 'bid_critical', 'contractual', 'informational'
    
    # The question
    question: str
    
    # Context
    background: str
    references: List[str]  # Drawing refs, spec sections, etc.
    
    # Impact
    impact_description: str
    potential_cost_impact: Optional[str] = None
    potential_schedule_impact: Optional[str] = None
    
    # Suggested response format
    suggested_response_format: Optional[str] = None
    
    # Metadata
    created_at: str = None
    status: str = "draft"  # draft, submitted, answered, closed
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()


class RFIGenerator:
    """
    Generates RFIs automatically by analyzing project documents.
    
    Key insight: Most RFIs submitted during bidding are predictable.
    This catches them BEFORE bid day.
    """
    
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.rfis: List[RFI] = []
        
    def generate_from_conflicts(self, conflicts: List[Dict]) -> List[RFI]:
        """
        Convert detected conflicts into draft RFIs.
        """
        rfis = []
        
        for i, conflict in enumerate(conflicts):
            rfi = RFI(
                id=f"RFI-AUTO-{i+1:03d}",
                title=conflict.get('title', 'Clarification Required'),
                category='conflict',
                severity=self._map_severity(conflict.get('severity', 'medium')),
                question=self._generate_question(conflict),
                background=conflict.get('description', ''),
                references=conflict.get('evidence', []),
                impact_description=self._assess_impact(conflict),
                suggested_response_format=self._suggest_format(conflict)
            )
            rfis.append(rfi)
        
        self.rfis.extend(rfis)
        return rfis
    
    def generate_missing_info_rfis(self, room_scope: Dict) -> List[RFI]:
        """
        Generate RFIs for missing information in room scope.
        """
        rfis = []
        
        for room_num, room_data in room_scope.items():
            # Check for missing finishes
            finishes = room_data.get('finishes', {})
            if not finishes.get('floor'):
                rfis.append(RFI(
                    id=f"RFI-MISSING-{room_num}-FLOOR",
                    title=f"Room {room_num} - Floor Finish Not Specified",
                    category='missing_info',
                    severity='bid_critical',
                    question=f"What is the floor finish for Room {room_num} ({room_data.get('name', 'Unknown')})?",
                    background=f"Room {room_num} appears in the finish schedule but has no floor finish specified.",
                    references=[f"Finish Schedule - Room {room_num}"],
                    impact_description="Cannot price flooring work without specification.",
                    suggested_response_format="Provide floor material, manufacturer, product, and installation requirements."
                ))
            
            # Check for rooms with doors but no hardware
            for door in room_data.get('doors', []):
                if not door.get('hardware'):
                    rfis.append(RFI(
                        id=f"RFI-MISSING-{door.get('number', 'UNKNOWN')}-HARDWARE",
                        title=f"Door {door.get('number')} - Hardware Set Not Specified",
                        category='missing_info',
                        severity='bid_critical',
                        question=f"What hardware set is assigned to Door {door.get('number')}?",
                        background=f"Door {door.get('number')} in Room {room_num} is shown on the door schedule but has no hardware set reference.",
                        references=[f"Door Schedule - {door.get('number')}", f"Finish Schedule - Room {room_num}"],
                        impact_description="Cannot price door hardware without hardware set assignment.",
                        suggested_response_format="Reference hardware set number from Hardware Schedule."
                    ))
            
            # Check for restrooms without plumbing fixtures
            if 'restroom' in room_data.get('name', '').lower():
                if not room_data.get('plumbingFixtures'):
                    rfis.append(RFI(
                        id=f"RFI-MISSING-{room_num}-PLUMBING",
                        title=f"Room {room_num} - Plumbing Fixtures Not Scheduled",
                        category='missing_info',
                        severity='bid_critical',
                        question=f"What plumbing fixtures are required in Room {room_num} ({room_data.get('name')})?",
                        background=f"Room {room_num} is identified as a restroom in the finish schedule but no plumbing fixtures are scheduled.",
                        references=[f"Finish Schedule - Room {room_num}", "Plumbing Fixture Schedule"],
                        impact_description="Cannot price plumbing rough-in or fixtures without fixture schedule.",
                        suggested_response_format="List fixture types, manufacturers, model numbers, and mounting heights."
                    ))
        
        self.rfis.extend(rfis)
        return rfis
    
    def generate_drawing_spec_mismatch_rfi(self, drawing_info: Dict, spec_info: Dict) -> Optional[RFI]:
        """
        Generate RFI when drawing contradicts specification.
        """
        if drawing_info.get('material') != spec_info.get('material'):
            return RFI(
                id=f"RFI-CONFLICT-DS-{datetime.now().strftime('%Y%m%d')}",
                title=f"Material Conflict: {drawing_info.get('element', 'Element')}",
                category='conflict',
                severity='contractual',
                question=f"Does {drawing_info.get('element')} require {drawing_info.get('material')} (per Drawing {drawing_info.get('drawing')}) or {spec_info.get('material')} (per Spec Section {spec_info.get('section')})?",
                background=f"Drawing {drawing_info.get('drawing')} shows {drawing_info.get('material')} but Specification Section {spec_info.get('section')} requires {spec_info.get('material')}.",
                references=[
                    f"Drawing {drawing_info.get('drawing')}",
                    f"Spec Section {spec_info.get('section')}"
                ],
                impact_description=f"Material selection affects pricing by approximately ${self._estimate_cost_difference(drawing_info, spec_info)}.",
                suggested_response_format="Specify which material takes precedence and update the conflicting document accordingly."
            )
        return None
    
    def generate_dimension_clarification_rfi(self, element: str, conflicting_dims: List[str], 
                                              locations: List[str]) -> RFI:
        """
        Generate RFI for conflicting dimensions.
        """
        return RFI(
            id=f"RFI-DIM-{datetime.now().strftime('%Y%m%d')}",
            title=f"Dimension Conflict: {element}",
            category='conflict',
            severity='bid_critical',
            question=f"What is the correct dimension for {element}?",
            background=f"Multiple dimensions shown for {element}: {', '.join(conflicting_dims)} at locations: {', '.join(locations)}.",
            references=locations,
            impact_description="Quantity calculation dependent on correct dimension.",
            suggested_response_format="Provide correct dimension and issue addendum to correct conflicting drawings."
        )
    
    def generate_scope_gap_rfi(self, element_type: str, location: str, 
                                shown_on: str, specified_on: Optional[str] = None) -> RFI:
        """
        Generate RFI when element is shown but not specified.
        """
        return RFI(
            id=f"RFI-SCOPE-{datetime.now().strftime('%Y%m%d')}",
            title=f"{element_type} at {location} - Specification Required",
            category='incomplete',
            severity='bid_critical',
            question=f"What are the specifications for the {element_type} shown at {location}?",
            background=f"{element_type} is shown on {shown_on} but {'not found in specifications' if not specified_on else f'specification incomplete on {specified_on}'}.",
            references=[shown_on] + ([specified_on] if specified_on else []),
            impact_description=f"Cannot price {element_type} without material and installation specifications.",
            suggested_response_format=f"Provide complete specifications for {element_type} including material, size, mounting, and finish requirements."
        )
    
    def prioritize_rfis(self) -> List[RFI]:
        """
        Sort RFIs by severity and bid impact.
        """
        severity_order = {
            'bid_critical': 0,
            'contractual': 1,
            'informational': 2
        }
        
        return sorted(self.rfis, key=lambda r: severity_order.get(r.severity, 3))
    
    def export_to_excel(self, output_path: str):
        """
        Export RFIs to Excel format for submission.
        """
        import pandas as pd
        
        data = [asdict(rfi) for rfi in self.prioritize_rfis()]
        df = pd.DataFrame(data)
        df.to_excel(output_path, index=False)
        return output_path
    
    def format_for_email(self, rfi: RFI) -> str:
        """
        Format RFI as email text for architect/consultant.
        """
        references_formatted = '\n'.join(f'  • {ref}' for ref in rfi.references)
        cost_line = f"COST IMPACT: {rfi.potential_cost_impact}" if rfi.potential_cost_impact else ""
        schedule_line = f"SCHEDULE IMPACT: {rfi.potential_schedule_impact}" if rfi.potential_schedule_impact else ""
        format_line = f"SUGGESTED RESPONSE FORMAT:\n{rfi.suggested_response_format}" if rfi.suggested_response_format else ""
        
        return f"""REQUEST FOR INFORMATION (RFI)

Project: {self.project_id}
RFI Number: {rfi.id}
Date: {rfi.created_at[:10]}

SEVERITY: {rfi.severity.upper()}

QUESTION:
{rfi.question}

BACKGROUND:
{rfi.background}

REFERENCES:
{references_formatted}

IMPACT:
{rfi.impact_description}

{cost_line}
{schedule_line}

{format_line}

---
Generated by Estinator Document Intelligence
"""
    
    def _map_severity(self, conflict_severity: str) -> str:
        """Map conflict severity to RFI severity"""
        mapping = {
            'critical': 'bid_critical',
            'high': 'contractual',
            'medium': 'informational',
            'low': 'informational'
        }
        return mapping.get(conflict_severity, 'informational')
    
    def _generate_question(self, conflict: Dict) -> str:
        """Generate appropriate question from conflict"""
        return f"Please clarify: {conflict.get('description', 'Issue requires clarification')}"
    
    def _assess_impact(self, conflict: Dict) -> str:
        """Assess bid/contract impact"""
        severity = conflict.get('severity', 'medium')
        if severity == 'critical':
            return "This issue may significantly impact bid pricing and contract scope."
        elif severity == 'high':
            return "This issue should be resolved before contract award."
        return "Clarification requested for completeness."
    
    def _suggest_format(self, conflict: Dict) -> str:
        """Suggest response format"""
        return "Please provide written clarification with reference to applicable specification sections or drawing details."
    
    def _estimate_cost_difference(self, drawing_info: Dict, spec_info: Dict) -> str:
        """Estimate cost impact of material difference (placeholder)"""
        # In real implementation, would query pricing engine
        return "TBD - pending material pricing"


def demo():
    """Demo RFI generation"""
    print("=" * 60)
    print("RFI GENERATOR (Phase 3)")
    print("=" * 60)
    
    generator = RFIGenerator("Bellevue-Hospital-Renovation")
    
    # Sample room scope with gaps
    room_scope = {
        "101": {
            "name": "Office 1",
            "finishes": {
                "floor": "Carpet",
                "walls": "Painted GWB",
                "ceiling": "ACT"
            },
            "doors": [
                {"number": "101-A", "size": "3'x7'", "type": "HM", "hardware": ""},
                {"number": "101-B", "size": "3'x7'", "type": "HM", "hardware": ""}
            ]
        },
        "102": {
            "name": "Office 2",
            "finishes": {
                "floor": "",  # MISSING
                "walls": "Painted GWB",
                "ceiling": "ACT"
            },
            "doors": [
                {"number": "102-A", "size": "3'x7'", "type": "HM", "hardware": "Set 1"}
            ]
        },
        "103": {
            "name": "Restroom",
            "finishes": {
                "floor": "Tile",
                "walls": "Tile",
                "ceiling": "GWB"
            },
            "doors": [
                {"number": "103-A", "size": "2'6\"x7'", "type": "HM", "hardware": ""}
            ],
            "plumbingFixtures": []  # MISSING
        }
    }
    
    # Generate RFIs for missing info
    print("\n🔍 Analyzing room scope for missing information...")
    rfis = generator.generate_missing_info_rfis(room_scope)
    
    print(f"\n✅ Generated {len(rfis)} RFIs")
    print("\n" + "=" * 60)
    
    # Show prioritized RFIs
    for rfi in generator.prioritize_rfis():
        icon = "🔴" if rfi.severity == 'bid_critical' else "🟡" if rfi.severity == 'contractual' else "🔵"
        print(f"\n{icon} {rfi.id} [{rfi.severity.upper()}]")
        print(f"   Title: {rfi.title}")
        print(f"   Question: {rfi.question}")
        print(f"   Impact: {rfi.impact_description}")
    
    # Show email format
    print("\n" + "=" * 60)
    print("SAMPLE EMAIL FORMAT:")
    print("=" * 60)
    if rfis:
        print(generator.format_for_email(rfis[0]))
    
    print("\n💾 Export Options:")
    print("  • export_to_excel('rfis.xlsx') - Excel format")
    print("  • format_for_email(rfi) - Email text")
    print("  • JSON export for project management systems")


if __name__ == "__main__":
    demo()
