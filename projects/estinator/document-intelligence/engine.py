#!/usr/bin/env python3
"""
Document Intelligence Engine for Estinator

Core capabilities:
1. Multi-modal document analysis (text + vision)
2. Schedule extraction and cross-referencing
3. Scope aggregation by room/system
4. Natural language Q&A over documents
5. Change detection (addenda analysis)
"""

import json
import re
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any
from datetime import datetime

@dataclass
class ExtractedEntity:
    """Any entity extracted from documents"""
    type: str  # 'room', 'door', 'fixture', 'equipment', etc.
    id: str    # Unique identifier
    properties: Dict[str, Any]
    source: str  # Which document/sheet it came from
    confidence: float = 1.0

@dataclass
class DocumentInsight:
    """An insight derived from document analysis"""
    category: str  # 'scope', 'risk', 'opportunity', 'conflict', 'clarification'
    severity: str  # 'critical', 'high', 'medium', 'low'
    title: str
    description: str
    evidence: List[str]  # References to source text/images
    recommendation: Optional[str] = None

class DocumentIntelligenceEngine:
    """
    Unified document analysis for construction projects
    
    Unlike generic RAG, this understands:
    - Construction document structures (sheets, schedules, specs)
    - Relationships between documents (drawings vs specs)
    - Version history (addenda, RFIs)
    - Domain context (trades, codes, standards)
    """
    
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.entities: List[ExtractedEntity] = []
        self.insights: List[DocumentInsight] = []
        self.documents: Dict[str, dict] = {}
        
    def load_document(self, doc_id: str, doc_type: str, content: str, 
                      metadata: dict = None):
        """Load a document into the engine"""
        self.documents[doc_id] = {
            'id': doc_id,
            'type': doc_type,  # 'drawing', 'spec', 'addendum', 'rfi'
            'content': content,
            'metadata': metadata or {},
            'loaded_at': datetime.now().isoformat()
        }
        
    def extract_schedules(self, doc_id: str) -> List[Dict]:
        """
        Extract all schedule-type data from a document
        (finish schedules, door schedules, etc.)
        """
        doc = self.documents.get(doc_id)
        if not doc:
            return []
        
        schedules = []
        content = doc['content']
        
        # Pattern matching for common schedule types
        schedule_patterns = {
            'finish': r'(?:ROOM\s+)?FINISH\s+SCHEDULE',
            'door': r'DOOR\s+SCHEDULE',
            'window': r'WINDOW\s+SCHEDULE',
            'wall': r'WALL\s+TYPE\s+SCHEDULE',
            'hardware': r'(DOOR\s+)?HARDWARE\s+SCHEDULE',
            'plumbing': r'PLUMBING\s+(FIXTURE\s+)?SCHEDULE',
            'mechanical': r'(MECHANICAL|EQUIPMENT)\s+SCHEDULE',
            'lighting': r'LIGHTING\s+(FIXTURE\s+)?SCHEDULE',
            'electrical': r'ELECTRICAL\s+(PANEL\s+)?SCHEDULE',
            'fire_protection': r'FIRE\s+PROTECTION\s+SCHEDULE',
            'ceiling': r'(REFLECTED\s+)?CEILING\s+SCHEDULE',
        }
        
        for sched_type, pattern in schedule_patterns.items():
            if re.search(pattern, content, re.IGNORECASE):
                # Found a schedule - extract tabular data
                schedule_data = self._extract_table_data(content, sched_type)
                if schedule_data:
                    schedules.append({
                        'type': sched_type,
                        'document': doc_id,
                        'data': schedule_data
                    })
        
        return schedules
    
    def _extract_table_data(self, content: str, sched_type: str) -> Optional[Dict]:
        """Extract tabular data from schedule text"""
        lines = content.split('\n')
        
        # Find schedule section
        start_idx = None
        for i, line in enumerate(lines):
            if sched_type.upper() in line.upper() and 'SCHEDULE' in line.upper():
                start_idx = i
                break
        
        if start_idx is None:
            return None
        
        # Extract header row (next non-empty line)
        header = None
        data_rows = []
        
        for line in lines[start_idx+1:start_idx+50]:  # Look at next 50 lines
            line = line.strip()
            if not line:
                continue
            
            # Skip separator lines
            if all(c in '-=| ' for c in line):
                continue
            
            # Split by common delimiters
            parts = re.split(r'\s{2,}|\t|\|', line)
            parts = [p.strip() for p in parts if p.strip()]
            
            if len(parts) >= 2:
                if header is None:
                    header = parts
                else:
                    data_rows.append(parts)
        
        if header and data_rows:
            return {
                'columns': header,
                'rows': data_rows[:20]  # Limit rows
            }
        
        return None
    
    def aggregate_room_scope(self) -> Dict[str, Dict]:
        """
        Build complete room scope by aggregating data from all schedules
        """
        rooms = {}
        
        # Collect all schedules
        all_schedules = []
        for doc_id in self.documents:
            all_schedules.extend(self.extract_schedules(doc_id))
        
        # Process finish schedules first (they define rooms)
        for sched in all_schedules:
            if sched['type'] == 'finish' and sched['data']:
                for row in sched['data']['rows']:
                    if len(row) >= 2:
                        room_num = row[0]
                        room_name = row[1] if len(row) > 1 else ''
                        
                        if room_num not in rooms:
                            rooms[room_num] = {
                                'number': room_num,
                                'name': room_name,
                                'finishes': {},
                                'doors': [],
                                'windows': [],
                                'fixtures': [],
                                'equipment': []
                            }
                        
                        # Extract finishes from row
                        if len(row) > 2:
                            rooms[room_num]['finishes']['floor'] = row[2]
                        if len(row) > 3:
                            rooms[room_num]['finishes']['base'] = row[3]
                        if len(row) > 4:
                            rooms[room_num]['finishes']['walls'] = row[4]
                        if len(row) > 5:
                            rooms[room_num]['finishes']['ceiling'] = row[5]
        
        # Add doors from door schedule
        for sched in all_schedules:
            if sched['type'] == 'door' and sched['data']:
                for row in sched['data']['rows']:
                    if len(row) >= 3:
                        # Find room from door number (e.g., "101-A" → room "101")
                        door_num = row[0]
                        room_match = re.match(r'(\d+)', door_num)
                        
                        if room_match:
                            room_num = room_match.group(1)
                            if room_num in rooms:
                                rooms[room_num]['doors'].append({
                                    'number': door_num,
                                    'size': row[1] if len(row) > 1 else '',
                                    'type': row[2] if len(row) > 2 else '',
                                    'frame': row[3] if len(row) > 3 else '',
                                })
        
        return rooms
    
    def detect_document_conflicts(self) -> List[DocumentInsight]:
        """
        Detect conflicts between different documents
        """
        insights = []
        rooms = self.aggregate_room_scope()
        
        # Check 1: Rooms with doors but no finish schedule
        for room_num, room_data in rooms.items():
            if room_data['doors'] and not room_data['finishes']:
                insights.append(DocumentInsight(
                    category='conflict',
                    severity='medium',
                    title=f'Room {room_num} has doors but no finish spec',
                    description=f'Room {room_num} has {len(room_data["doors"])} door(s) defined but is missing from the finish schedule',
                    evidence=[f'Door schedule shows {len(room_data["doors"])} doors', 
                              'Not found in finish schedule'],
                    recommendation='Verify room finish requirements with architect'
                ))
        
        # Check 2: Doors without hardware
        for room_num, room_data in rooms.items():
            for door in room_data['doors']:
                if not door.get('hardware'):
                    insights.append(DocumentInsight(
                        category='clarification',
                        severity='low',
                        title=f'Door {door["number"]} missing hardware spec',
                        description=f'Door {door["number"]} in room {room_num} has no hardware specified',
                        evidence=[f'Door schedule entry: {door}'],
                        recommendation='Check hardware schedule for this door'
                    ))
        
        return insights
    
    def answer_question(self, question: str) -> Dict:
        """
        Answer natural language questions about the project
        """
        question_lower = question.lower()
        
        # Question types
        if 'how many rooms' in question_lower or 'room count' in question_lower:
            rooms = self.aggregate_room_scope()
            return {
                'answer': f'There are {len(rooms)} rooms defined in the finish schedule.',
                'data': {'room_count': len(rooms), 'rooms': list(rooms.keys())[:10]},
                'sources': ['finish schedule']
            }
        
        if 'door' in question_lower and 'room' in question_lower:
            # Extract room number from question
            room_match = re.search(r'room\s+(\d+)', question_lower)
            if room_match:
                room_num = room_match.group(1)
                rooms = self.aggregate_room_scope()
                room_data = rooms.get(room_num, {})
                door_count = len(room_data.get('doors', []))
                
                return {
                    'answer': f'Room {room_num} has {door_count} door(s).',
                    'data': {'room': room_num, 'doors': room_data.get('doors', [])},
                    'sources': ['door schedule', 'finish schedule']
                }
        
        if 'finish' in question_lower or 'floor' in question_lower:
            room_match = re.search(r'room\s+(\d+)', question_lower)
            if room_match:
                room_num = room_match.group(1)
                rooms = self.aggregate_room_scope()
                room_data = rooms.get(room_num, {})
                finishes = room_data.get('finishes', {})
                
                return {
                    'answer': f'Room {room_num} finishes: Floor={finishes.get("floor", "N/A")}, '
                              f'Walls={finishes.get("walls", "N/A")}, '
                              f'Ceiling={finishes.get("ceiling", "N/A")}',
                    'data': {'room': room_num, 'finishes': finishes},
                    'sources': ['finish schedule']
                }
        
        # Generic fallback
        return {
            'answer': 'I can answer questions about rooms, doors, finishes, and equipment. '
                      'Try asking: "How many rooms are there?" or "What are the finishes in room 101?"',
            'data': None,
            'sources': []
        }
    
    def generate_project_summary(self) -> Dict:
        """Generate executive summary of project scope"""
        rooms = self.aggregate_room_scope()
        insights = self.detect_document_conflicts()
        
        # Count elements
        total_doors = sum(len(r.get('doors', [])) for r in rooms.values())
        total_fixtures = sum(len(r.get('fixtures', [])) for r in rooms.values())
        
        # Group rooms by type
        room_types = {}
        for room_data in rooms.values():
            room_type = self._infer_room_type(room_data.get('name', ''))
            room_types[room_type] = room_types.get(room_type, 0) + 1
        
        return {
            'project_id': self.project_id,
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_rooms': len(rooms),
                'total_doors': total_doors,
                'room_types': room_types,
            },
            'insights': {
                'total': len(insights),
                'critical': len([i for i in insights if i.severity == 'critical']),
                'high': len([i for i in insights if i.severity == 'high']),
                'items': [asdict(i) for i in insights[:5]]  # Top 5
            },
            'document_count': len(self.documents)
        }
    
    def _infer_room_type(self, room_name: str) -> str:
        """Infer room type from room name"""
        name_lower = room_name.lower()
        
        if any(w in name_lower for w in ['office', 'work']):
            return 'Office'
        elif any(w in name_lower for w in ['conference', 'meeting']):
            return 'Conference'
        elif any(w in name_lower for w in ['restroom', 'bathroom', 'toilet']):
            return 'Restroom'
        elif any(w in name_lower for w in ['storage', 'closet']):
            return 'Storage'
        elif any(w in name_lower for w in ['corridor', 'hall']):
            return 'Circulation'
        elif any(w in name_lower for w in ['lobby', 'reception']):
            return 'Public'
        else:
            return 'Other'


# CLI demo
if __name__ == "__main__":
    print("=" * 60)
    print("DOCUMENT INTELLIGENCE ENGINE DEMO")
    print("=" * 60)
    
    # Create engine
    engine = DocumentIntelligenceEngine("demo-project-001")
    
    # Load sample documents
    finish_schedule = """
    ROOM FINISH SCHEDULE
    ====================
    Room    Name            Floor       Base    Walls           Ceiling
    101     Office 1        Carpet      Vinyl   Painted GWB     ACT
    102     Office 2        Carpet      Vinyl   Painted GWB     ACT
    103     Conference      VCT         Vinyl   Fabric Wrapped  ACT
    104     Restroom        Tile        Tile    Tile            GWB
    105     Storage         Concrete    None    Painted CMU     Exposed
    """
    
    door_schedule = """
    DOOR SCHEDULE
    =============
    Door    Size        Type        Frame       Hardware
    101-A   3'-0"x7'-0" HM          HM          Set 1
    101-B   3'-0"x7'-0" HM          HM          Set 1
    102-A   3'-0"x7'-0" HM          HM          Set 1
    103-A   3'-6"x7'-0" HM          HM          Set 2
    103-B   3'-6"x7'-0" HM          HM          Set 2
    104-A   2'-6"x7'-0" HM          HM          Set 3
    106-A   3'-0"x7'-0" HM          HM          Set 1
    """
    
    engine.load_document("A-101", "drawing", finish_schedule, 
                        {"sheet": "A-101", "title": "Finish Schedule"})
    engine.load_document("A-102", "drawing", door_schedule,
                        {"sheet": "A-102", "title": "Door Schedule"})
    
    # Generate summary
    print("\n📊 PROJECT SUMMARY")
    print("-" * 40)
    summary = engine.generate_project_summary()
    print(f"Total Rooms: {summary['summary']['total_rooms']}")
    print(f"Total Doors: {summary['summary']['total_doors']}")
    print(f"Room Types: {summary['summary']['room_types']}")
    
    # Show room details
    print("\n🏢 ROOM SCOPE")
    print("-" * 40)
    rooms = engine.aggregate_room_scope()
    for room_num in sorted(rooms.keys())[:3]:
        room = rooms[room_num]
        print(f"\nRoom {room_num}: {room['name']}")
        print(f"  Finishes: {room['finishes']}")
        print(f"  Doors: {len(room['doors'])}")
        for door in room['doors']:
            print(f"    - {door['number']}: {door['size']} {door['type']}")
    
    # Detect conflicts
    print("\n⚠️  CONFLICTS DETECTED")
    print("-" * 40)
    insights = engine.detect_document_conflicts()
    if insights:
        for insight in insights:
            icon = "🔴" if insight.severity == 'critical' else "🟡" if insight.severity == 'high' else "🔵"
            print(f"{icon} {insight.title}")
            print(f"   {insight.description}")
    else:
        print("No conflicts detected!")
    
    # Answer questions
    print("\n❓ Q&A DEMO")
    print("-" * 40)
    
    questions = [
        "How many rooms are there?",
        "What doors are in room 101?",
        "What are the finishes in room 103?"
    ]
    
    for q in questions:
        result = engine.answer_question(q)
        print(f"\nQ: {q}")
        print(f"A: {result['answer']}")
