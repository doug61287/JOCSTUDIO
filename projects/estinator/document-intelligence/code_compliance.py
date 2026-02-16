#!/usr/bin/env python3
"""
Code Compliance Checker for Estinator (Phase 3)

Checks construction documents against building code requirements.

Currently supports:
- NYC Building Code (selected chapters)
- IBC (International Building Code) - general provisions
- ADA/Accessibility requirements

This is a knowledge-based system, not a replacement for code consultants,
but catches common issues early.
"""

import re
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class CodeRequirement:
    """A building code requirement"""
    code: str  # 'NYC_BC', 'IBC', 'ADA'
    chapter: str
    section: str
    description: str
    applicability: List[str]  # When this applies
    minimum_value: Optional[str] = None
    maximum_value: Optional[str] = None

@dataclass
class ComplianceIssue:
    """A potential code compliance issue"""
    severity: str  # 'violation', 'warning', 'info'
    code: str
    section: str
    description: str
    document_ref: str
    issue_details: str
    recommendation: str


class CodeComplianceChecker:
    """
    Checks construction documents for code compliance.
    
    Not exhaustive - focuses on common issues that are:
    1. Easy to detect from documents
    2. Frequently missed during design
    3. Expensive to fix if caught late
    """
    
    def __init__(self, jurisdiction: str = 'NYC'):
        self.jurisdiction = jurisdiction
        self.code_database = self._load_code_requirements()
        self.issues: List[ComplianceIssue] = []
        
    def _load_code_requirements(self) -> List[CodeRequirement]:
        """Load applicable code requirements"""
        
        requirements = []
        
        # NYC Building Code - Chapter 10 (Means of Egress)
        requirements.extend([
            CodeRequirement(
                code='NYC_BC',
                chapter='10',
                section='1006.2.1',
                description='Minimum corridor width',
                applicability=['corridor', 'egress_path'],
                minimum_value='44 inches'
            ),
            CodeRequirement(
                code='NYC_BC',
                chapter='10',
                section='1008.1.1',
                description='Door width for egress',
                applicability=['door', 'egress_door'],
                minimum_value='32 inches clear'
            ),
            CodeRequirement(
                code='NYC_BC',
                chapter='10',
                section='1010.1.1',
                description='Maximum dead end corridor length',
                applicability=['corridor'],
                maximum_value='20 feet'
            ),
        ])
        
        # NYC Building Code - Chapter 7 (Fire Resistance)
        requirements.extend([
            CodeRequirement(
                code='NYC_BC',
                chapter='7',
                section='716.2.2',
                description='Fire door rating',
                applicability=['fire_door', 'fire_rated_door'],
                minimum_value='20 minutes'
            ),
            CodeRequirement(
                code='NYC_BC',
                chapter='7',
                section='714.3',
                description='Fire damper at rated partitions',
                applicability=['duct', 'fire_rated_wall'],
            ),
        ])
        
        # ADA / Accessibility
        requirements.extend([
            CodeRequirement(
                code='ADA',
                chapter='4',
                section='4.13.5',
                description='Maximum door opening force',
                applicability=['door', 'accessible_door'],
                maximum_value='5 lbf'
            ),
            CodeRequirement(
                code='ADA',
                chapter='4',
                section='4.13.9',
                description='Door threshold height',
                applicability=['door', 'accessible_route'],
                maximum_value='1/2 inch'
            ),
            CodeRequirement(
                code='ADA',
                chapter='4',
                section='4.3.3',
                description='Accessible route width',
                applicability=['accessible_route', 'corridor'],
                minimum_value='36 inches'
            ),
        ])
        
        # Energy Code (NYC ECC)
        requirements.extend([
            CodeRequirement(
                code='NYC_ECC',
                chapter='5',
                section='502.1',
                description='Wall insulation R-value',
                applicability=['exterior_wall', 'insulation'],
                minimum_value='R-13'
            ),
            CodeRequirement(
                code='NYC_ECC',
                chapter='5',
                section='503.2',
                description='Roof insulation R-value',
                applicability=['roof', 'insulation'],
                minimum_value='R-30'
            ),
        ])
        
        return requirements
    
    def check_room(self, room_data: Dict) -> List[ComplianceIssue]:
        """Check a room for code compliance"""
        issues = []
        
        room_num = room_data.get('number', 'Unknown')
        room_name = room_data.get('name', '').lower()
        
        # Check accessibility for restrooms
        if 'restroom' in room_name or 'toilet' in room_name:
            # Check if accessible
            if not room_data.get('accessible', False):
                # Note: Not necessarily a violation - depends on total count
                issues.append(ComplianceIssue(
                    severity='info',
                    code='ADA',
                    section='4.22',
                    description='Toilet room accessibility',
                    document_ref=f'Room {room_num}',
                    issue_details=f'Room {room_num} ({room_data.get("name")}) - verify if accessible unit is required.',
                    recommendation='Confirm number of toilet rooms and accessibility requirements per ADA Table 4.1.6(1).'
                ))
        
        # Check door widths
        for door in room_data.get('doors', []):
            size = door.get('size', '')
            # Parse size like "3'x7'" or "36\"x84\""
            width_match = re.search(r"(\d+)'|(\d+)\"", size)
            if width_match:
                width_inches = int(width_match.group(1) or width_match.group(2))
                if width_match.group(1):  # Feet
                    width_inches *= 12
                
                if width_inches < 32:
                    issues.append(ComplianceIssue(
                        severity='violation',
                        code='NYC_BC',
                        section='1008.1.1',
                        description='Minimum door width for egress',
                        document_ref=f'Door {door.get("number")}',
                        issue_details=f'Door {door.get("number")} is {width_inches}" wide. Minimum clear width is 32".',
                        recommendation='Increase door width to minimum 32" clear (typically 3\'0" door).'
                    ))
        
        return issues
    
    def check_door_schedule(self, doors: List[Dict]) -> List[ComplianceIssue]:
        """Check door schedule for code compliance"""
        issues = []
        
        # Check for fire-rated doors without ratings
        for door in doors:
            if door.get('fire_rated', False) and not door.get('fire_rating'):
                issues.append(ComplianceIssue(
                    severity='warning',
                    code='NYC_BC',
                    section='716.2.2',
                    description='Fire door rating required',
                    document_ref=f'Door {door.get("number")}',
                    issue_details=f'Door {door.get("number")} marked as fire-rated but no rating specified.',
                    recommendation='Specify fire rating (20, 45, 60, 90 minutes) per occupancy and wall rating.'
                ))
        
        # Check for accessible doors
        for door in doors:
            if door.get('accessible', False):
                # Check threshold
                if door.get('threshold_height'):
                    try:
                        height = float(door.get('threshold_height').replace('"', ''))
                        if height > 0.5:
                            issues.append(ComplianceIssue(
                                severity='violation',
                                code='ADA',
                                section='4.13.9',
                                description='Door threshold height',
                                document_ref=f'Door {door.get("number")}',
                                issue_details=f'Threshold height of {height}" exceeds ADA maximum of 1/2".',
                                recommendation='Reduce threshold height or provide beveled edge.'
                            ))
                    except:
                        pass
        
        return issues
    
    def check_wall_types(self, walls: List[Dict]) -> List[ComplianceIssue]:
        """Check wall types for code compliance"""
        issues = []
        
        for wall in walls:
            # Check fire-rated walls for fire dampers in ducts
            if wall.get('fire_rating'):
                rating = wall.get('fire_rating', '')
                if 'hr' in rating.lower() or 'minute' in rating.lower():
                    # Check if ducts penetrating
                    if wall.get('has_ducts', False) and not wall.get('fire_dampers', False):
                        issues.append(ComplianceIssue(
                            severity='violation',
                            code='NYC_BC',
                            section='714.3',
                            description='Fire damper at rated partitions',
                            document_ref=f'Wall Type {wall.get("type")}',
                            issue_details=f'Wall Type {wall.get("type")} is {rating} fire-rated with duct penetrations.',
                            recommendation='Provide fire dampers at all duct penetrations of rated walls.'
                        ))
        
        return issues
    
    def check_insulation(self, building_envelope: Dict) -> List[ComplianceIssue]:
        """Check envelope insulation for energy code compliance"""
        issues = []
        
        # Check wall insulation
        wall_r_value = building_envelope.get('wall_insulation_r_value', '')
        if wall_r_value:
            try:
                r_val = int(re.search(r'R-?(\d+)', wall_r_value).group(1))
                if r_val < 13:
                    issues.append(ComplianceIssue(
                        severity='violation',
                        code='NYC_ECC',
                        section='502.1',
                        description='Wall insulation R-value',
                        document_ref='Wall Assembly',
                        issue_details=f'Wall insulation R-{r_val} below minimum R-13.',
                        recommendation='Increase wall insulation to minimum R-13 (typically R-13 batt or R-15 continuous).'
                    ))
            except:
                pass
        
        # Check roof insulation
        roof_r_value = building_envelope.get('roof_insulation_r_value', '')
        if roof_r_value:
            try:
                r_val = int(re.search(r'R-?(\d+)', roof_r_value).group(1))
                if r_val < 30:
                    issues.append(ComplianceIssue(
                        severity='violation',
                        code='NYC_ECC',
                        section='503.2',
                        description='Roof insulation R-value',
                        document_ref='Roof Assembly',
                        issue_details=f'Roof insulation R-{r_val} below minimum R-30.',
                        recommendation='Increase roof insulation to minimum R-30.'
                    ))
            except:
                pass
        
        return issues
    
    def run_full_check(self, project_data: Dict) -> List[ComplianceIssue]:
        """Run complete code compliance check"""
        all_issues = []
        
        # Check rooms
        for room in project_data.get('rooms', []):
            all_issues.extend(self.check_room(room))
        
        # Check door schedule
        if 'door_schedule' in project_data:
            all_issues.extend(self.check_door_schedule(project_data['door_schedule']))
        
        # Check walls
        if 'wall_types' in project_data:
            all_issues.extend(self.check_wall_types(project_data['wall_types']))
        
        # Check envelope
        if 'building_envelope' in project_data:
            all_issues.extend(self.check_insulation(project_data['building_envelope']))
        
        self.issues = all_issues
        return all_issues
    
    def generate_report(self) -> Dict:
        """Generate compliance report"""
        return {
            'jurisdiction': self.jurisdiction,
            'summary': {
                'total_issues': len(self.issues),
                'violations': len([i for i in self.issues if i.severity == 'violation']),
                'warnings': len([i for i in self.issues if i.severity == 'warning']),
                'info': len([i for i in self.issues if i.severity == 'info']),
            },
            'by_code': self._group_by_code(),
            'issues': [
                {
                    'severity': i.severity,
                    'code': i.code,
                    'section': i.section,
                    'description': i.description,
                    'location': i.document_ref,
                    'details': i.issue_details,
                    'recommendation': i.recommendation
                }
                for i in self.issues
            ]
        }
    
    def _group_by_code(self) -> Dict:
        """Group issues by code"""
        groups = {}
        for issue in self.issues:
            code = issue.code
            if code not in groups:
                groups[code] = []
            groups[code].append(issue)
        
        return {code: len(issues) for code, issues in groups.items()}


def demo():
    """Demo code compliance checking"""
    print("=" * 60)
    print("CODE COMPLIANCE CHECKER (Phase 3)")
    print("=" * 60)
    
    checker = CodeComplianceChecker(jurisdiction='NYC')
    
    # Sample project data
    project_data = {
        'rooms': [
            {
                'number': '101',
                'name': 'Office',
                'doors': [
                    {'number': '101-A', 'size': "2'8\"x7'0\""}  # Too narrow!
                ]
            },
            {
                'number': '103',
                'name': 'Restroom',
                'accessible': False
            }
        ],
        'door_schedule': [
            {'number': '101-A', 'fire_rated': True, 'fire_rating': ''},
            {'number': '102-A', 'accessible': True, 'threshold_height': '3/4"'}
        ],
        'wall_types': [
            {'type': 'A', 'fire_rating': '1-hour', 'has_ducts': True, 'fire_dampers': False}
        ],
        'building_envelope': {
            'wall_insulation_r_value': 'R-11',
            'roof_insulation_r_value': 'R-25'
        }
    }
    
    print("\n🔍 Running code compliance check...")
    issues = checker.run_full_check(project_data)
    
    report = checker.generate_report()
    
    print(f"\n✅ Found {len(issues)} code issues")
    print("\n" + "=" * 60)
    
    # Show violations first
    for issue in sorted(issues, key=lambda x: 0 if x.severity == 'violation' else 1):
        icon = "🔴" if issue.severity == 'violation' else "🟡" if issue.severity == 'warning' else "🔵"
        print(f"\n{icon} {issue.code} {issue.section} [{issue.severity.upper()}]")
        print(f"   {issue.description}")
        print(f"   Location: {issue.document_ref}")
        print(f"   Issue: {issue.issue_details}")
        print(f"   💡 {issue.recommendation}")
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print(f"  Violations: {report['summary']['violations']}")
    print(f"  Warnings: {report['summary']['warnings']}")
    print(f"  Info: {report['summary']['info']}")
    print(f"\nBy Code:")
    for code, count in report['by_code'].items():
        print(f"  {code}: {count} issues")


if __name__ == "__main__":
    demo()
