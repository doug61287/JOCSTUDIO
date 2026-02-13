# Construction Expert Skill

AI-powered assembly generation for JOC estimating.

## What It Does

Generates **assembly templates** that bundle related JOC line items. Instead of manually adding pipe + fittings + hangers + insulation, the estimator selects "Install 2" copper water line" and gets everything with trade-accurate quantities.

## Key Features

- **Trade-Accurate Factors**: Fitting ratios based on real-world knowledge (10-foot pipe sticks = 0.10 couplings/LF)
- **H+H Catalogue Integration**: Uses real NYC H+H CTC task codes
- **AI Generation**: LLM searches catalogue and builds assemblies with correct relationships
- **Self-Improving**: Track edits, learn from contractor feedback

## Files

```
construction-expert/
├── SKILL.md           # Main instructions + trade knowledge
├── README.md          # This file
├── trade-factors.json # Empirical quantity factors by trade
├── scripts/
│   └── generate.js    # Node.js batch generator
└── generated/         # AI-generated assembly output
    ├── plumbing-assemblies.ts
    └── fire-protection-assemblies.ts
```

## Usage

### 1. AI Generation (via sub-agent)
Spawn a sub-agent with the SKILL.md loaded to generate assemblies:
```
"Generate 20 plumbing assemblies for Division 22 using the H+H catalogue"
```

### 2. Script Generation (local)
```bash
node scripts/generate.js --batch --division 22 --output plumbing.json
```

### 3. Manual Generation
Read SKILL.md, search catalogue, apply trade factors, write assembly.

## Trade Factors Reference

| Trade | Item | Factor | Rationale |
|-------|------|--------|-----------|
| Plumbing | Coupling | 0.10/LF | 10-foot pipe sticks |
| Plumbing | Elbow 90° | 0.05/LF | Turn every ~20 LF |
| Plumbing | Tee | 0.02/LF | Branch every ~50 LF |
| Plumbing | Hanger | 0.125/LF | Code minimum 8 LF |
| Fire Protection | Coupling | 0.10/LF | Same as plumbing |
| Fire Protection | Tee | 0.08/LF | More branches for heads |
| Fire Protection | Head | 0.0056/SF | 180 SF coverage |

See `trade-factors.json` for complete data.

## Integration with JOCHero

Generated assemblies go into:
```
/projects/jocstudio/product/app/src/data/assemblies.ts
```

Merge generated assemblies with existing library.

## Quality Assurance

1. **Real codes only** - Every task code must exist in H+H catalogue
2. **Sensible factors** - Compare against trade-factors.json
3. **Complete scope** - Don't forget supports, testing, cleanup
4. **Contractor validation** - Get feedback and adjust

## Roadmap

- [x] Skill structure + trade factors
- [x] AI generation prompts
- [ ] Division 22 assemblies (in progress)
- [ ] Division 21 assemblies (in progress)
- [ ] Division 23 HVAC assemblies
- [ ] Division 26 Electrical assemblies
- [ ] Validation script
- [ ] Feedback loop integration
