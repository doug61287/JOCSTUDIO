#!/usr/bin/env python3
"""
Vision-Based Document Extractor for Estinator (Phase 2)

Uses Claude Vision to extract structured data from PDF images/drawings.
Handles:
- Schedule tables in drawing sheets
- Equipment tags and callouts
- Dimensions and annotations
- Handwritten notes
- Poor scan quality
"""

import os
import json
import base64
from pathlib import Path
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import anthropic

@dataclass
class VisionExtractedTable:
    """A table extracted from an image via vision"""
    table_type: str  # 'schedule', 'legend', 'note_block', etc.
    title: str
    headers: List[str]
    rows: List[Dict[str, str]]
    bbox: Optional[tuple] = None  # (x1, y1, x2, y2) if available
    confidence: float = 1.0

@dataclass
class EquipmentTag:
    """Equipment tag detected in drawing"""
    tag_number: str
    equipment_type: str
    location: str  # Room number or drawing coordinates
    description: Optional[str] = None
    schedule_reference: Optional[str] = None  # Link to equipment schedule

@dataclass
class Dimension:
    """Dimension annotation detected"""
    value: str
    unit: str
    context: str  # What is being dimensioned
    location: str  # Where on the drawing

class VisionDocumentExtractor:
    """
    Extract structured data from construction drawings using vision models.
    
    Unlike text-based extraction, this works with:
    - Raster PDFs (scanned drawings)
    - Complex table layouts
    - Handwritten annotations
    - Symbols and graphics
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        self.client = anthropic.Anthropic(api_key=self.api_key) if self.api_key else None
        
    def extract_from_image(self, image_path: str, extraction_type: str = 'auto') -> Dict:
        """
        Extract structured data from an image using Claude Vision.
        
        Args:
            image_path: Path to image file (PNG, JPG) or PDF page
            extraction_type: 'schedule', 'equipment_tags', 'dimensions', 'general_notes', 'auto'
        """
        if not self.client:
            return {'error': 'Anthropic API key not configured'}
        
        # Convert PDF to image if needed
        if image_path.endswith('.pdf'):
            image_path = self._pdf_page_to_image(image_path, page_num=0)
        
        # Read and encode image
        with open(image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode()
        
        # Build prompt based on extraction type
        prompt = self._build_extraction_prompt(extraction_type)
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_data
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }]
            )
            
            # Parse structured response
            return self._parse_vision_response(response.content[0].text, extraction_type)
            
        except Exception as e:
            return {'error': str(e), 'image_path': image_path}
    
    def extract_schedule_from_drawing(self, image_path: str, schedule_type: str) -> VisionExtractedTable:
        """
        Specialized extraction for schedule tables on drawings.
        
        Args:
            schedule_type: 'finish', 'door', 'window', 'equipment', etc.
        """
        prompt = f"""Analyze this construction drawing and extract the {schedule_type.upper()} SCHEDULE table.

Return ONLY a JSON object in this exact format:
{{
    "title": "schedule title",
    "headers": ["column1", "column2", ...],
    "rows": [
        {{"column1": "value1", "column2": "value2"}},
        {{"column1": "value3", "column2": "value4"}}
    ],
    "notes": "any footnotes or special instructions"
}}

Important:
- Include ALL rows visible in the schedule
- Preserve exact values as shown
- If a cell is empty, use empty string ""
- Handle merged cells appropriately
"""
        
        result = self.extract_from_image(image_path, 'schedule')
        
        if 'error' in result:
            return VisionExtractedTable(
                table_type=schedule_type,
                title="Error",
                headers=[],
                rows=[],
                confidence=0.0
            )
        
        return VisionExtractedTable(
            table_type=schedule_type,
            title=result.get('title', ''),
            headers=result.get('headers', []),
            rows=result.get('rows', []),
            confidence=0.9  # Claude is generally high confidence
        )
    
    def detect_equipment_tags(self, image_path: str, equipment_types: List[str] = None) -> List[EquipmentTag]:
        """
        Detect and read equipment tags/callouts on drawings.
        
        Common formats: V-1, P-102, EF-1, H-1, etc.
        """
        type_list = ', '.join(equipment_types) if equipment_types else 'V (ventilation), P (plumbing), H (heating), EF (exhaust fan), etc.'
        
        prompt = f"""Analyze this construction drawing and identify ALL equipment tags/callouts.

Look for tags like: {type_list}

Return a JSON array of objects:
[
    {{
        "tag_number": "V-1",
        "equipment_type": "Supply Air Diffuser",
        "location": "Room 101",
        "description": "Ceiling mounted supply diffuser"
    }},
    ...
]

For each tag:
- Read the exact tag number shown
- Identify what type of equipment it is
- Note the location (room number or area name)
- Include any visible description text
"""
        
        result = self.extract_from_image(image_path, 'equipment_tags')
        
        if 'error' in result:
            return []
        
        tags = []
        for tag_data in result.get('tags', result.get('equipment_tags', [])):
            tags.append(EquipmentTag(
                tag_number=tag_data.get('tag_number', ''),
                equipment_type=tag_data.get('equipment_type', ''),
                location=tag_data.get('location', ''),
                description=tag_data.get('description'),
                schedule_reference=tag_data.get('schedule_reference')
            ))
        
        return tags
    
    def extract_dimensions(self, image_path: str) -> List[Dimension]:
        """
        Extract dimension annotations from drawings.
        """
        prompt = """Analyze this construction drawing and extract ALL dimension annotations.

Return a JSON array:
[
    {
        "value": "10'-6\"",
        "unit": "feet-inches",
        "context": "Room 101 width",
        "location": "North wall"
    },
    ...
]

Include:
- Linear dimensions (length, width, height)
- Room dimensions
- Ceiling heights
- Door/window sizes
- Any other numerical annotations with units
"""
        
        result = self.extract_from_image(image_path, 'dimensions')
        
        if 'error' in result:
            return []
        
        dimensions = []
        for dim_data in result.get('dimensions', []):
            dimensions.append(Dimension(
                value=dim_data.get('value', ''),
                unit=dim_data.get('unit', ''),
                context=dim_data.get('context', ''),
                location=dim_data.get('location', '')
            ))
        
        return dimensions
    
    def extract_general_notes(self, image_path: str) -> List[Dict]:
        """
        Extract general notes section from drawings.
        """
        prompt = """Analyze this construction drawing and extract the GENERAL NOTES or NOTES section.

Return a JSON object:
{
    "title": "GENERAL NOTES",
    "notes": [
        {
            "number": "1",
            "text": "Coordinate all work with other trades.",
            "importance": "standard"
        },
        {
            "number": "2", 
            "text": "All work to comply with NYC Building Code.",
            "importance": "critical"
        }
    ]
}

Mark importance as 'critical' if the note relates to:
- Code compliance
- Safety
- Structural requirements
- Fire ratings
Otherwise mark as 'standard'.
"""
        
        return self.extract_from_image(image_path, 'general_notes')
    
    def analyze_drawing_sheet(self, image_path: str) -> Dict:
        """
        Complete analysis of a drawing sheet - extracts everything.
        """
        prompt = """Analyze this construction drawing sheet completely.

Extract and return a comprehensive JSON object:

{
    "sheet_info": {
        "sheet_number": "A-101",
        "sheet_title": "FIRST FLOOR PLAN",
        "discipline": "architectural",
        "scale": "1/8" = 1'-0\"",
        "drawing_date": "2024-01-15",
        "revision": "Rev 2"
    },
    "schedules_found": [
        {
            "type": "door_schedule",
            "title": "DOOR SCHEDULE",
            "row_count": 12
        }
    ],
    "equipment_tags": [
        {"tag": "V-1", "type": "diffuser", "location": "Room 101"}
    ],
    "key_dimensions": [
        {"value": "20'-0\"", "description": "Building width"}
    ],
    "general_notes_present": true,
    "legend_present": true,
    "north_arrow_present": true,
    "section_markers": ["A-A", "B-B"],
    "detail_callouts": ["1", "2", "3"]
}

Be thorough - this is for construction document analysis.
"""
        
        return self.extract_from_image(image_path, 'complete_analysis')
    
    def _build_extraction_prompt(self, extraction_type: str) -> str:
        """Build appropriate prompt for extraction type"""
        
        prompts = {
            'schedule': """Extract the table/schedule from this image.
Return JSON with: title, headers (array), rows (array of objects).""",
            
            'equipment_tags': """Find all equipment tags (like V-1, P-101, H-1) in this drawing.
Return JSON array with: tag_number, equipment_type, location.""",
            
            'dimensions': """Extract all dimension annotations from this drawing.
Return JSON array with: value, unit, context, location.""",
            
            'general_notes': """Extract the General Notes section.
Return JSON with: title, notes (array of objects with number, text, importance).""",
            
            'auto': """Analyze this construction document image.
Extract any schedules, notes, tags, dimensions, or other structured data.
Return comprehensive JSON with all findings."""
        }
        
        return prompts.get(extraction_type, prompts['auto'])
    
    def _parse_vision_response(self, text: str, extraction_type: str) -> Dict:
        """Parse Claude's response into structured data"""
        
        # Try to find JSON in the response
        try:
            # Look for JSON code block
            if '```json' in text:
                json_str = text.split('```json')[1].split('```')[0].strip()
            elif '```' in text:
                json_str = text.split('```')[1].split('```')[0].strip()
            else:
                json_str = text.strip()
            
            return json.loads(json_str)
        except json.JSONDecodeError:
            # Return raw text if JSON parsing fails
            return {
                'raw_response': text,
                'extraction_type': extraction_type,
                'parsed': False
            }
    
    def _pdf_page_to_image(self, pdf_path: str, page_num: int = 0) -> str:
        """Convert PDF page to image for vision analysis"""
        try:
            import pdf2image
            images = pdf2image.convert_from_path(pdf_path, first_page=page_num+1, last_page=page_num+1, dpi=150)
            if images:
                temp_path = f"/tmp/vision_extract_{os.path.basename(pdf_path)}_{page_num}.png"
                images[0].save(temp_path, 'PNG')
                return temp_path
        except ImportError:
            # Fallback: use poppler/pdftoppm
            import subprocess
            temp_path = f"/tmp/vision_extract_{os.path.basename(pdf_path)}_{page_num}.png"
            subprocess.run([
                'pdftoppm', pdf_path, temp_path.replace('.png', ''), 
                '-png', '-f', str(page_num+1), '-l', str(page_num+1)
            ], check=True)
            return temp_path.replace('.png', f'-{page_num+1}.png')
        
        return pdf_path  # Return original if conversion fails


# Demo
if __name__ == "__main__":
    print("=" * 60)
    print("VISION DOCUMENT EXTRACTOR (Phase 2)")
    print("=" * 60)
    
    extractor = VisionDocumentExtractor()
    
    if not extractor.client:
        print("\n⚠️  ANTHROPIC_API_KEY not set")
        print("Set it to test vision extraction:")
        print("  export ANTHROPIC_API_KEY='your-key'")
        print("\nDemo mode - showing structure only")
    
    print("\n✅ VisionDocumentExtractor initialized")
    print("\nCapabilities:")
    print("  • extract_schedule_from_drawing() - Pull tables from PDF images")
    print("  • detect_equipment_tags() - Find V-1, P-101, etc.")
    print("  • extract_dimensions() - Get measurements")
    print("  • extract_general_notes() - Parse notes section")
    print("  • analyze_drawing_sheet() - Complete sheet analysis")
    
    print("\n📋 Usage:")
    print("""
    extractor = VisionDocumentExtractor()
    
    # Extract finish schedule from scanned PDF
    schedule = extractor.extract_schedule_from_drawing(
        "drawing_sheet_A101.pdf", 
        schedule_type="finish"
    )
    
    # Find all equipment tags
    tags = extractor.detect_equipment_tags(
        "MEP_plan.pdf",
        equipment_types=["V", "P", "H", "EF", "RF"]
    )
    
    # Get dimensions
    dims = extractor.extract_dimensions("floor_plan.pdf")
    """)
