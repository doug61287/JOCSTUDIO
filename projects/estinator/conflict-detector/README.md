# Conflict Detector for Estinator

Detects discrepancies between construction documents before they become expensive problems.

## 🎯 What It Detects

### 1. Drawing vs Specification Conflicts
- Material mismatches (PVC pipe in drawing, Cast Iron in spec)
- Missing specifications for shown elements
- Dimensional discrepancies

### 2. Addendum Changes
- Quantity changes (25 windows → 30 windows)
- Material upgrades (double pane → triple pane)
- Deleted or added requirements
- Cost impact flags

### 3. Schedule Conflicts
- Room schedule vs door schedule mismatches
- Wall types not in finish schedule
- Equipment shown but not specified

### 4. Quantity Discrepancies
- Takeoff vs BOQ variance > tolerance
- Automatic flagging of >20% variance as critical

## 🚀 Usage

### Command Line
```bash
# Run demo test
cd /Users/baibureh/clawd/projects/estinator/conflict-detector
python3 conflict_detector.py test

# Use in Python
from conflict_detector import ConflictDetector

detector = ConflictDetector()

# Check drawing vs spec
conflicts = detector.detect_draw_spec_conflict(
    drawing_text="4 inch PVC pipe",
    spec_text="Cast iron pipe per spec 221000",
    drawing_source="Drawing A-101",
    spec_source="Spec Section 22"
)

# Check addendum changes
conflicts = detector.detect_addendum_changes(
    original_text="Window quantity: 25",
    addendum_text="Window quantity: 30 (REVISED)",
    addendum_number="Addendum 2"
)

# Generate report
print(detector.format_report())
```

### API Integration
```typescript
import { ConflictDetectionService } from './services/conflictDetection';

const service = new ConflictDetectionService(projectBrain);

// Analyze entire project
const result = await service.analyzeProject({
  projectId: 'proj-123',
  documentIds: ['doc-1', 'doc-2', 'doc-3'],
  analysisType: 'all'  // 'draw-spec' | 'addendum' | 'schedule' | 'quantity' | 'all'
});

// Real-time check during takeoff
const conflict = await service.checkMeasurementConflict(projectId, {
  itemCode: '221116',
  description: 'Domestic Water Piping',
  quantity: 1250,
  unit: 'LF'
});

// Check on document upload
const conflicts = await service.checkDocumentConflicts(projectId, newDocId);
```

## 📊 Output Format

```json
{
  "generated_at": "2026-02-16T10:15:00",
  "summary": {
    "total": 7,
    "critical": 3,
    "warning": 3,
    "info": 1
  },
  "conflicts": [
    {
      "type": "material",
      "severity": "critical",
      "location": "Material: pipe",
      "source_a": "Drawing A-101",
      "source_b": "Spec 221000",
      "description": "Material mismatch for pipe",
      "value_a": "PVC",
      "value_b": "Cast Iron",
      "recommendation": "Verify correct material..."
    }
  ]
}
```

## 🔧 Configuration

### Tolerance Settings
```python
# Default: 5% variance triggers warning
detector.detect_quantity_discrepancy(
    calculated_qty=1250.0,
    boq_qty=1000.0,
    item_description="Concrete",
    tolerance=0.05  # 5%
)
```

### Severity Levels
- **Critical**: Requires immediate action (cost/schedule impact)
- **Warning**: Should be verified (potential issue)
- **Info**: FYI (document for record)

## 🏗️ Integration with Estinator

The Conflict Detector plugs into the Project Brain workflow:

1. **Document Upload** → Auto-check for conflicts
2. **Takeoff Entry** → Real-time quantity validation
3. **Pre-Bid Review** → Full project conflict scan
4. **Addendum Processing** → Change impact analysis

## 📁 Files

```
conflict-detector/
├── conflict_detector.py       # Core detection engine
├── demo_report.json           # Example output
└── README.md                  # This file

server/src/services/
└── conflictDetection.ts       # Estinator service integration
```

## 🎯 Next Steps

- [ ] Add NLP for better material extraction
- [ ] Machine learning for conflict prediction
- [ ] Integration with pricing engine (cost impact calc)
- [ ] Export to RFQ format for architect clarification
