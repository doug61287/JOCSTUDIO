# RSMeans Construction Cost Data - Deep Research Report

## Executive Summary

RSMeans (now owned by Gordian) is North America's leading construction cost estimating database, containing **92,000+ unit line items** and **25,000+ building assemblies**. The data is researched and validated through **30,000+ hours annually** by Gordian's cost research team across **970+ locations** in North America.

---

## 1. ASSEMBLY STRUCTURE

### Pre-Built Assemblies Available

**YES** - RSMeans has extensive pre-built assemblies. These are collections of one or more unit cost lines grouped into functional building elements.

| Dataset | Unit Line Items | Pre-Configured Assemblies |
|---------|-----------------|---------------------------|
| Building Construction | 23,000-25,000 | Thousands |
| Electrical | 14,000+ | ~300 (Complete tier) / 1,500+ (Complete tier) |
| Plumbing | 17,000+ | 1,200+ |
| Mechanical | 18,000+ | 1,200+ |
| Concrete & Masonry | 7,000+ | 1,700+ |
| Site Work & Landscape | 20,000+ | 600+ |
| Facilities Construction | 48,000-49,000 | 1,380-6,000 |
| Commercial Renovation | 20,000+ | 1,500+ |
| Residential | 13,000+ | Nearly 5,000 |
| Interior | 16,000+ | 1,900+ |

### Assembly Structure

- **Organized by Uniformat II** (for assemblies) in addition to **CSI MasterFormat 2018** (for unit costs)
- Assemblies combine multiple unit costs that make up complete components or systems
- Examples: "install fire sprinkler system complete" vs individual pipe/fitting line items
- Assemblies available at **Complete** and **Complete Plus** tiers only

### Programmatic Access

- **Core tier**: Unit costs only, limited export
- **Complete tier**: Unit costs + Assemblies + Square foot models
- **Complete Plus tier**: All of above + Historical data + Predictive cost modeling (3-year forecasts)
- API exists (dataapi-sb.gordian.com) but appears limited/restricted
- Reddit user reported: "deep gate keeping for RS means data accessibility even when willing to pay"

---

## 2. DATA FORMAT & API ACCESS

### Available Formats

| Format | Description | Availability |
|--------|-------------|--------------|
| **RSMeans Data Online** | Web-based application (3 tiers) | Subscription |
| **Cost Books** | Annual printed books | Purchase |
| **CostWorks CDs** | CD-based software | Purchase |
| **Digital Connector** | Integration tool | Enterprise |

### API Access

- **RSMeans API** exists at `dataapi-sb.gordian.com/swagger/ui/index.html`
- Documentation appears to be Swagger/OpenAPI based
- **RESTRICTED**: Terms explicitly prohibit unauthorized third-party use
- License terms: "Customer shall not sell, license, or distribute Estimating Data (including printouts and Downloaded Data) to Third Parties"

### Export Capabilities

- Built-in export functions within RSMeans Data Online
- PDF report generation
- Excel/CSV export (limited by tier)
- **Not permitted**: Bulk data extraction for third-party applications

---

## 3. VALUE BEYOND RAW DATA

### Crew Compositions & Labor Productivity

✅ **INCLUDED** in all tiers:
- Detailed crew listings with composition
- Daily output rates
- Labor hours per unit of measure
- Productivity rates (assume "average conditions")
- Labor cost per UOM calculations

Sample calculation methodology:
- Equipment daily cost = (weekly rental rate ÷ 5) + (hourly operating cost × 8)
- Crew cost per labor hour = (sum of all daily labor rates + equipment) ÷ total labor hours per day

### Regional Adjustment Factors (City Cost Indexes)

✅ **INCLUDED** - Comprehensive location factors:
- **970+ locations** across North America
- **City Cost Index (CCI)** - compares national average to specific locations
- Quarterly updates
- Factors for material, labor, and equipment separately
- Weighted averages for composite adjustments

### Equipment Rates

✅ **INCLUDED**:
- Equipment rental rates (weekly/daily)
- Hourly operating costs
- Bare equipment costs + profit markup (typically 10%)
- 638+ equipment types in database

### Historical Cost Trending

✅ **Complete Plus tier only**:
- Historical Cost Index (quarterly data points)
- Actual historical values published (e.g., Jan 2025 = 293.9, Oct 2025 = 304.2)
- Track trends back multiple years

### AI/Estimation Tools

✅ **Complete Plus tier**:
- **Predictive Cost Data**: Algorithm-driven forecasts up to **3 years** into future
- Uses historical data + economic indicators + advanced algorithms
- Life Cycle Costing (LCC) Estimator
- Square foot estimators

### Additional Tools (Complete/Complete Plus)

- eTakeoff Dimension integration (connected takeoff)
- Square foot models (100+ building types)
- Change order best practices
- Project costs and modifiers

---

## 4. PRICING & LICENSING

### Subscription Tiers (Annual Pricing)

| Tier | Starting Price | What's Included |
|------|---------------|-----------------|
| **Core** | $356.40-$404.10/yr (with 10% discount) | Unit costs only, basic export, single dataset |
| **Complete** | $917.10-$4,254.30/yr | Unit + Assemblies + Square foot models, full library |
| **Complete Plus** | Premium pricing | All above + Historical data + 3-year predictive modeling |

### Specific Package Pricing (Complete Tier)

| Package | Regular Price | Discounted Price |
|---------|--------------|------------------|
| Full Library (Complete) | $4,727.00 | $4,254.30 |
| Commercial Package | $2,292.00 | $2,062.80 |
| Civil Package | $2,228.00 | $2,005.20 |
| Master Union Package | $2,999.00 | $2,699.10 |
| Facilities w/ Life Cycle | $4,828.00 | $4,345.20 |
| Single Dataset (e.g., Electrical) | $1,019.00 | $917.10 |

### Core Tier Single Dataset Pricing

| Dataset | Price |
|---------|-------|
| Building Construction | $404.10 |
| Electrical/Plumbing/Mechanical | $356.40 each |
| Commercial Renovation | $356.40 |

### Licensing Restrictions (CRITICAL)

- **Single-seat licenses** (per user)
- Enterprise options available for 1,000+ users (custom pricing)
- **NO third-party redistribution allowed**
- **NO sublicensing or service bureau use**
- **NO archival/searchable database creation** without permission
- Data remains exclusive property of Gordian
- All copyrights owned by Gordian

### Third-Party Application Use

❌ **NOT LEGALLY PERMITTED** under standard terms:
- Cannot use data to provide processing services to third parties
- Cannot incorporate into third-party applications for redistribution
- Cannot expose data via APIs to external users

For legitimate integration, would require **custom licensing agreement** with Gordian.

---

## 5. COMPETITIVE INTELLIGENCE

### RSMeans vs Competitors

| Competitor | Positioning | Key Differentiator |
|------------|-------------|-------------------|
| **Gordian** | Owner of RSMeans; JOC specialist | Integrated JOC + cost data + procurement |
| **Craftsman Book Co.** | Lower-cost alternative | Better for residential/remodel; simpler interface; less detail |
| **BNi Building News** | Regional/california focus | Cost data + building codes |
| **Richardson Engineering** | Process plant/industrial specialization | 193,000 items; heavy industrial focus; labor rates for 130+ markets |

### Detailed Comparison

#### RSMeans vs Craftsman Book Company

| Factor | RSMeans | Craftsman |
|--------|---------|-----------|
| Price | Higher ($356-$4,700+) | Lower |
| Best For | Commercial, federal, institutional | Residential, remodeling, small contractors |
| Data Depth | 92,000+ items, extensive assemblies | Less granular |
| Federal Work | Required/accepted standard | Less common |
| Ease of Use | More complex, comprehensive | Simpler, more approachable |
| Regional Data | 970+ locations | Limited regional adjustment |

**User Quote**: "RSMeans doesn't do it for me, it's geared toward new construction... I do mostly residential remodeling and repair." - Contractor Talk Forum

#### RSMeans vs Richardson Engineering

| Factor | RSMeans | Richardson |
|--------|---------|------------|
| Focus | General construction, commercial | Process plants, industrial, heavy construction |
| Items | 92,000+ | 193,000+ |
| Markets | 970+ US/Canada | 130+ North American labor markets |
| International | Limited | 30+ international currency markets |
| Best For | Buildings, infrastructure | Refineries, chemical plants, industrial |

#### Gordian Relationship

Gordian now owns RSMeans and offers:
- RSMeans Data Online (cost data)
- Job Order Contracting (JOC) programs
- eTakeoff Dimension (takeoff software)
- Sightlines (facility management)
- Integrated platform approach

---

## 6. JOCHERO RELEVANCE

### NYC H+H JOC Catalogue Context

NYC Health + Hospitals (H+H) operates one of the largest municipal JOC programs. JOC programs typically use:
- **Construction Task Catalogs (CTC)** - custom Unit Price Books
- Locally-adjusted material, labor, equipment costs
- Pre-negotiated unit prices for rapid procurement

### RSMeans vs JOC Catalogue - Complementary or Overlap?

| Aspect | RSMeans | JOC Hero/NYC H+H |
|--------|---------|------------------|
| **Purpose** | Cost estimation reference | Active procurement/pricing mechanism |
| **Price Type** | Estimated costs | Negotiated/contracted prices |
| **Updates** | Quarterly | Contract-specific |
| **Scope** | National with local factors | Specific to agency/contract |

### Unique Value Add for JOCHero

✅ **RSMeans would COMPLEMENT (not replace) NYC H+H JOC catalogue**:

1. **Validation Baseline**
   - Independent third-party cost validation
   - Verify JOC unit prices are reasonable
   - "RSMeans Data is accepted as an impartial industry standard" - State of Virginia

2. **Missing Line Items**
   - JOC catalogs may have gaps for unusual work
   - RSMeans has 92,000+ items for reference pricing

3. **Regional Adjustment Expertise**
   - NYC-specific cost factors from 970+ location database
   - Historical trending for escalation

4. **Predictive Planning**
   - 3-year cost forecasting (Complete Plus)
   - Budget planning for multi-year capital programs

5. **Negotiation Support**
   - Objective benchmark for contractor negotiations
   - Backup for price challenges

6. **Non-JOC Work**
   - Capital projects outside JOC scope
   - Preliminary estimates before JOC contract award

### Overlap Considerations

- Both provide unit pricing for construction tasks
- Both organized by MasterFormat
- **Risk**: Using RSMeans for JOC pricing could create conflicts since RSMeans is "estimated" vs JOC "negotiated" prices

### Recommendation

RSMeans would be valuable as:
- **Reference/validation tool** - not replacement for JOC catalogue
- **Budget development** - before JOC contract exists
- **Dispute resolution** - independent third-party standard
- **Gap filling** - unusual items not in JOC catalog
- **Trend analysis** - escalation and market forecasting

---

## KEY CONTACTS & RESOURCES

- **Main Site**: rsmeans.com
- **Gordian**: gordian.com
- **API Explorer**: dataapi-sb.gordian.com/swagger/ui/index.html
- **Support**: Available through Gordian Cloud Platform

---

## CONCLUSIONS

1. **Assemblies**: Yes, extensive - 25,000+ pre-built systems at Complete tier
2. **API**: Exists but heavily restricted; no easy third-party integration
3. **Pricing**: $356-$4,700+ per year depending on tier and scope
4. **Unique Value**: Crew data, 970+ location factors, predictive modeling, 30,000 hrs annual research
5. **Competitive**: Industry standard for commercial/federal; Craftsman for residential; Richardson for industrial
6. **JOC Relevance**: Excellent complement for validation, forecasting, and gap-filling - NOT a replacement for negotiated JOC unit prices

**Bottom Line**: RSMeans is the gold standard for construction cost data in North America, but licensing restrictions make it suitable primarily for internal estimation and validation use, not as a data source for third-party applications without custom agreements.
