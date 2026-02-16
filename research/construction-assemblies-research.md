# Construction Assemblies Research for JOC/Estimating

**Date:** February 12, 2026  
**Purpose:** Research publicly available data on construction assemblies for JOC/construction estimating tool development

---

## 1. RSMeans Assemblies

### What RSMeans Publishes
RSMeans (owned by Gordian) is the leading construction cost database in North America with:
- **92,000+ unit line item costs** spanning all construction work tasks
- **25,000+ building assemblies** for budgetary cost estimating
- **7,000+ pre-configured assemblies** in the Complete tier for alternative material evaluation
- **220+ pre-configured assemblies** in the Green Building Cost Data specifically

### Assembly Categories in RSMeans
RSMeans organizes assemblies by building system type:
- Substructure & Foundations
- Shell (Superstructure, Exterior Enclosure, Roofing)
- Interiors (Partitions, Interior Finishes, Stairs)
- Services (Conveying, Plumbing, HVAC, Fire Protection, Electrical)
- Equipment & Furnishings
- Special Construction
- Building Sitework

### Public Availability
**Not freely available.** RSMeans data requires paid subscription:
- RSMeans Data Online (tiered: Basic, Advanced, Complete)
- Annual books (Building Construction, Plumbing, Electrical, etc.)
- Academic access available through university subscriptions

**Source:** https://www.rsmeans.com/resources/rsmeans-data-packages

---

## 2. Industry Standard Assemblies

### CSI MasterFormat Structure

#### Division 21 - Fire Suppression
```
21 00 00 - Fire Suppression (General)
21 05 00 - Common Work Results for Fire Suppression
21 10 00 - Water-Based Fire-Suppression Systems
21 11 00 - Facility Fire-Suppression Water-Service Piping
21 12 00 - Fire-Suppression Standpipes
21 13 00 - Fire-Suppression Sprinkler Systems
21 20 00 - Fire-Extinguishing Systems
21 30 00 - Fire Pumps
21 40 00 - Fire-Suppression Water Storage
```

#### Division 22 - Plumbing
```
22 00 00 - Plumbing (General)
22 05 00 - Common Work Results for Plumbing
22 10 00 - Facility Water Distribution
22 11 00 - Facility Water Distribution Piping
22 12 00 - Facility Potable Water Storage Tanks
22 13 00 - Facility Sanitary Sewerage
22 14 00 - Facility Storm Drainage
22 30 00 - Facility Gas Systems
22 40 00 - Plumbing Fixtures
22 50 00 - Pool and Fountain Plumbing Systems
22 60 00 - Gas and Vacuum Systems (Lab/Healthcare)
```

**Source:** https://www.arcat.com/content-type/product

---

## 3. Estimating Best Practices - Assembly Breakdowns

### Bathroom Rough-In Assembly
**Typical Components:**

| Component | Description | Unit |
|-----------|-------------|------|
| Supply Lines | Hot/cold water piping (PEX or copper) | LF |
| Drain Lines | ABS/PVC drain piping | LF |
| Vent Stack | DWV piping | LF |
| P-Trap | 1-1/2" or 2" trap assembly | EA |
| Water Supply Valves | Shut-off valves (angle stops) | EA |
| Drain Assembly | Drain body, tailpiece | EA |
| Closet Flange | Toilet flange with bolts | EA |
| Tub/Shower Drain | Drain fitting | EA |
| Fittings | Elbows, tees, couplings, etc. | LOT |
| Hangers/Supports | Pipe hangers, straps | LOT |

**Labor Estimate:** 8-16 hours per full bathroom (rough-in only)

**Industry Standard Pricing:** $4-$12/LF for copper supply (including labor)

### Water Heater Installation Assembly
**Typical Components per Craftsman National Plumbing & HVAC Estimator:**

| Component | Description | Unit |
|-----------|-------------|------|
| Water Heater Unit | Tank or tankless | EA |
| Supply Connection | Hot/cold supply piping | LF |
| Return/Recirculation | Return piping (if applicable) | LF |
| Relief Piping | T&P relief valve discharge | LF |
| Relief Valve | T&P relief valve | EA |
| Isolation Valves | Ball valves for service | EA |
| Expansion Tank | (if required by code) | EA |
| Flex Connectors | Braided stainless connections | PR |
| Gas Connection | Gas flex and fittings (if gas) | LOT |
| Combustion Venting | Vent pipe and fittings (if gas) | LF |
| Drain Pan | (if applicable) | EA |

**Source:** Craftsman National Plumbing & HVAC Estimator

### Sprinkler Head Installation Assembly
**Typical Components:**

| Component | Description | Unit |
|-----------|-------------|------|
| Sprinkler Head | Pendant, upright, or sidewall | EA |
| Drop Pipe/Sprig | 1/2" or 3/4" fitting to main | EA |
| Escutcheon | Decorative plate | EA |
| Branch Line Allocation | Portion of branch line piping | LF |
| Fitting Allocation | Tee, coupling, reducer | EA |
| Hanger Allocation | Pipe support system | EA |
| Testing/Inspection | Per-head allocation | EA |

### Kitchen Sink Package Assembly
**Typical Components:**

| Component | Description | Unit |
|-----------|-------------|------|
| Sink | Single/double bowl | EA |
| Faucet | Kitchen faucet with spray | EA |
| Disposal Connection | Waste fitting | EA |
| Supply Lines | Hot/cold flex or rigid | PR |
| Drain Assembly | Strainer, tailpiece | EA |
| P-Trap | 1-1/2" trap | EA |
| Supply Valves | Angle stops | PR |
| Mounting Hardware | Clips, sealant | LOT |

---

## 4. Open Data Sources

### Government/Agency Resources

#### USACE (U.S. Army Corps of Engineers) - TRACES
- **PACES (Parametric Cost Engineering System)** - Uses assemblies for parametric estimating
- **MII (Micro-Computer Aided Cost Estimating System)** - ~70,000 cost tasks
- **DoD Cost Book** - Updated annually with military construction costs
- Assemblies organized by MWBS (Military Work Breakdown Structure)

**Not publicly downloadable** but referenced in UFC 3-740-05 Handbook

**Source:** https://www.hnc.usace.army.mil/Media/Fact-Sheets/

#### GSA (General Services Administration)
- **P100 Facilities Standards** - Design requirements (not cost data)
- **Pricing Desk Guide** - Internal pricing methodologies
- **Technical Procedures** - Repair/maintenance specs for historic buildings

**Source:** https://www.gsa.gov/real-estate/design-and-construction

### Open Source Estimating Software
- **Estimate (SourceForge)** - Web-based construction estimating for EPC companies
- GNU Affero licensed options exist but lack pre-built assemblies

**Source:** https://sourceforge.net/projects/estimate/

---

## 5. Trade Association Resources

### NFPA (National Fire Protection Association)
- **NFPA 13** - Standard for Installation of Sprinkler Systems
  - Provides design requirements, not direct assembly/cost data
  - References system components, materials, spacing requirements
  - Does NOT publish standard assembly compositions

### ASPE (American Society of Plumbing Engineers)
- **Plumbing Engineering Design Handbook** (4 volumes, 50+ chapters)
  - Volume 1: Fundamentals (includes Chapter 4: Plumbing Cost Estimation)
  - Volume 2: Plumbing Systems
  - Volume 3: Special Plumbing Systems
  - Volume 4: Plumbing Components and Equipment (2024)
- Provides design criteria and accepted practices
- Does NOT publish free assembly databases

**Source:** https://aspe.org/publications-news/aspe-plumbing-engineering-design-handbooks/

---

## 6. Software Documentation - Default Assemblies

### PlanSwift
- **Customizable assemblies feature** - users create and save templates
- "Parts and Assemblies" panel allows drag-and-drop assembly application
- **No pre-built assembly database published publicly**
- Trade-specific plugins available (drywall, concrete, etc.)

**Source:** https://www.planswift.com/blog/use-takeoff-assemblies/

### Bluebeam Revu
- PDF-based takeoff and estimation
- Tool Sets can include assembly definitions
- **No public assembly database** - user-defined

### eTakeoff / On-Screen Takeoff
- Assembly functionality exists but no public documentation of defaults

### ConEst
- Used for MEP assemblies with unit pricing
- Integration with takeoff tools

**Source:** Reddit r/estimators discussions

---

## 7. Gordian/JOC Unit Price Books

### Construction Task Catalog (CTC)
The most comprehensive commercially available assembly database:

- **275,000+ construction work tasks**
- Each task includes:
  - Detailed description
  - Unit of measurement
  - Unit price (material + labor)
  - Demolition cost (where applicable)
  - Technical specifications
- Locally researched pricing (not national averages)
- Updated annually

### JOC-Specific Structure
Tasks organized to support Job Order Contracting workflow:
- Pre-priced line items eliminate negotiation
- Assembly groupings for common repair/renovation work
- Coefficient/adjustment factor applied to base prices

**Not publicly available** - requires JOC program participation

### Alternative: 4BT Unit Price Book
- **30,000+ unit price line items**
- Material, equipment, and labor details
- Locally researched cost data
- Designed for JOC programs

**Source:** https://4bt.us/unit-price-book/joc-unit-price-book-upb/

---

## 8. Practical Assembly Templates

Based on research, here are recommended assembly structures for a JOC estimating tool:

### Division 21 - Fire Protection Assemblies

#### Assembly: Wet Sprinkler Head Installation
```yaml
assembly_id: 21-13-001
name: Wet Sprinkler Head Installation - Pendant
unit: EA
components:
  - item: Pendant Sprinkler Head (K-factor 5.6)
    unit: EA
    qty: 1
  - item: Sprig/Drop (3/4" x 6")
    unit: EA
    qty: 1
  - item: Escutcheon - Standard
    unit: EA
    qty: 1
  - item: Branch Line Allocation (1" Sch 40 Black Steel)
    unit: LF
    qty: 4
  - item: Tee Fitting (1" x 1" x 3/4")
    unit: EA
    qty: 1
  - item: Pipe Hanger Allocation
    unit: EA
    qty: 0.5
labor_hours: 0.5
```

#### Assembly: Fire Department Connection (FDC)
```yaml
assembly_id: 21-12-001
name: Fire Department Connection - Siamese
unit: EA
components:
  - item: FDC Body - Wall Mount
    unit: EA
    qty: 1
  - item: Knox Lock Caps
    unit: PR
    qty: 1
  - item: Check Valve (4")
    unit: EA
    qty: 1
  - item: Connection Piping (4" Sch 40)
    unit: LF
    qty: 10
  - item: Fittings - 4" (elbows, couplings)
    unit: LOT
    qty: 1
  - item: Escutcheon/Trim
    unit: EA
    qty: 1
labor_hours: 8
```

### Division 22 - Plumbing Assemblies

#### Assembly: Full Bathroom Rough-In
```yaml
assembly_id: 22-40-001
name: Full Bathroom Rough-In (Toilet, Lavatory, Tub/Shower)
unit: EA
components:
  - item: Supply Piping - 1/2" PEX
    unit: LF
    qty: 40
  - item: Supply Piping - 3/4" PEX (main)
    unit: LF
    qty: 15
  - item: DWV Piping - 2" PVC
    unit: LF
    qty: 20
  - item: DWV Piping - 3" PVC
    unit: LF
    qty: 15
  - item: DWV Piping - 4" PVC
    unit: LF
    qty: 10
  - item: Vent Piping - 1-1/2" PVC
    unit: LF
    qty: 15
  - item: Closet Flange - 4" PVC
    unit: EA
    qty: 1
  - item: Closet Bend - 4" x 3"
    unit: EA
    qty: 1
  - item: Tub/Shower Drain
    unit: EA
    qty: 1
  - item: Lavatory Drain Assembly
    unit: EA
    qty: 1
  - item: P-Traps (1-1/2")
    unit: EA
    qty: 2
  - item: Supply Valves (Angle Stops)
    unit: EA
    qty: 4
  - item: Fittings Allowance
    unit: LOT
    qty: 1
  - item: Hangers and Supports
    unit: LOT
    qty: 1
labor_hours: 14
```

#### Assembly: Water Heater Installation - Gas Tank
```yaml
assembly_id: 22-10-001
name: Gas Water Heater Installation (40-50 gal)
unit: EA
components:
  - item: Water Heater Unit (40-50 gal, gas)
    unit: EA
    qty: 1
  - item: T&P Relief Valve
    unit: EA
    qty: 1
  - item: Relief Discharge Piping - 3/4" Copper
    unit: LF
    qty: 6
  - item: Water Supply Connections - 3/4" Copper
    unit: LF
    qty: 6
  - item: Flex Connectors - 3/4"
    unit: PR
    qty: 1
  - item: Ball Valves - 3/4"
    unit: EA
    qty: 2
  - item: Dielectric Unions
    unit: PR
    qty: 1
  - item: Gas Flex Connector
    unit: EA
    qty: 1
  - item: Gas Shutoff Valve
    unit: EA
    qty: 1
  - item: Vent Pipe - B-Vent (3")
    unit: LF
    qty: 12
  - item: Vent Cap
    unit: EA
    qty: 1
  - item: Drain Pan (if required)
    unit: EA
    qty: 1
  - item: Earthquake Straps (if required)
    unit: SET
    qty: 1
labor_hours: 4
```

---

## 9. Key Recommendations

### For Building a JOC Estimating Tool:

1. **Structure assemblies by CSI MasterFormat** - Industry standard organization
2. **Include component-level detail** - Material, labor, equipment separately
3. **Use parametric quantities** - Allow scaling based on fixture count, area, etc.
4. **Support local cost adjustment** - Regional labor/material factors
5. **Build from unit costs up** - Assemblies should be sums of line items
6. **Include demolition variants** - Many JOC tasks are R&R (remove & replace)

### Data Sources to Consider:
- **Craftsman Book Company** - Publishes estimating guides with assembly breakdowns
- **HomeWyse.com** - Publicly visible cost calculators with component breakdowns
- **Trade contractor input** - Best source for realistic assembly compositions

### Gaps in Public Data:
- No free, comprehensive assembly database exists
- RSMeans/Gordian dominates the paid market
- Government databases (USACE) not publicly downloadable
- Trade associations focus on standards, not costs

---

## Sources Consulted

1. RSMeans.com - https://www.rsmeans.com
2. Gordian JOC Resources - https://www.gordian.com/resources/joc-best-practices-unit-price-book/
3. ARCAT MasterFormat - https://www.arcat.com/content-type/product
4. ASPE Publications - https://aspe.org/publications-news/
5. USACE Cost Engineering - https://www.usace.army.mil/Cost-Engineering/
6. GSA Facilities Standards - https://www.gsa.gov/real-estate/design-and-construction
7. PlanSwift Documentation - https://www.planswift.com/blog/use-takeoff-assemblies/
8. NFPA 13 References - https://www.nfpa.org/product/nfpa-13
9. Craftsman Book Company - https://www.craftsman-book.com
10. 4BT Unit Price Book - https://4bt.us/unit-price-book/
