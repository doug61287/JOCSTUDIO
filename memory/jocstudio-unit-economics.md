# JOCstudio Unit Economics Model
*Created: 2026-02-08*

## Executive Summary

This model projects JOCstudio's path from launch to profitability over 24 months. Key findings:
- **Break-even MRR:** ~$8,500/month (covering estimated monthly costs)
- **Time to break-even:** Month 8-9
- **Time to $50K MRR:** Month 18-20
- **Runway needed:** $35-45K to reach profitability (comfortable with $50K)
- **LTV:CAC ratio:** 4.2:1 at maturity (healthy)

---

## 1. Pricing Structure

| Tier | Monthly | Annual | Effective Monthly | Notes |
|------|---------|--------|-------------------|-------|
| **Starter** | Free | - | $0 | 3 projects/month limit |
| **Pro** | $29 | $299 | $24.92 | Individual creators |
| **Team** | $79/seat | $799/seat | $66.58/seat | Small teams (avg 3 seats) |
| **Enterprise** | $200/seat | Custom | $200/seat | Large orgs (avg 10 seats) |

### Revenue Mix Assumptions
- 60% monthly billing, 40% annual (improves to 50/50 by Month 12)
- Team tier average: 3 seats = $237/month effective
- Enterprise average: 10 seats = $2,000/month

### Blended ARPU Calculation
| Tier | Mix | Effective Price | Weighted ARPU |
|------|-----|-----------------|---------------|
| Pro | 70% | $27.36* | $19.15 |
| Team | 25% | $237 | $59.25 |
| Enterprise | 5% | $2,000 | $100.00 |
| **Blended ARPU** | | | **$178.40** |

*Pro blended: 60% × $29 + 40% × $24.92 = $27.36

---

## 2. Month-by-Month P&L (Months 1-24)

### Growth Assumptions
| Metric | M1-3 | M4-6 | M7-9 | M10-12 | M13-18 | M19-24 |
|--------|------|------|------|--------|--------|--------|
| New Signups/mo | 200 | 400 | 800 | 1,200 | 1,500 | 2,000 |
| Conversion Rate | 8% | 9% | 10% | 12% | 13% | 15% |
| Monthly Churn | 8% | 6% | 5% | 3% | 3% | 2.5% |

### Detailed 24-Month Model

| Month | New Signups | Total Users | Conversions | Paid Customers | MRR | Churned MRR | Net MRR | Cumulative Rev |
|-------|-------------|-------------|-------------|----------------|-----|-------------|---------|----------------|
| 1 | 200 | 200 | 16 | 16 | $2,854 | $0 | $2,854 | $2,854 |
| 2 | 200 | 400 | 16 | 31 | $5,480 | $228 | $5,251 | $8,106 |
| 3 | 200 | 600 | 16 | 45 | $7,877 | $420 | $7,457 | $15,563 |
| 4 | 400 | 1,000 | 36 | 77 | $13,419 | $597 | $12,822 | $28,385 |
| 5 | 400 | 1,400 | 36 | 107 | $18,575 | $769 | $17,806 | $46,190 |
| 6 | 400 | 1,800 | 36 | 136 | $23,344 | $1,068 | $22,276 | $68,467 |
| 7 | 800 | 2,600 | 80 | 203 | $35,238 | $1,114 | $34,125 | $102,592 |
| 8 | 800 | 3,400 | 80 | 268 | $46,426 | $1,706 | $44,720 | $147,312 |
| 9 | 800 | 4,200 | 80 | 330 | $56,908 | $2,236 | $54,672 | $201,983 |
| 10 | 1,200 | 5,400 | 144 | 449 | $77,538 | $1,640 | $75,898 | $277,881 |
| 11 | 1,200 | 6,600 | 144 | 563 | $96,836 | $2,277 | $94,559 | $372,441 |
| 12 | 1,200 | 7,800 | 144 | 673 | $114,802 | $2,837 | $111,965 | $484,405 |
| 13 | 1,500 | 9,300 | 195 | 820 | $139,759 | $3,359 | $136,400 | $620,805 |
| 14 | 1,500 | 10,800 | 195 | 961 | $162,783 | $4,092 | $158,691 | $779,496 |
| 15 | 1,500 | 12,300 | 195 | 1,097 | $184,074 | $4,764 | $179,310 | $958,806 |
| 16 | 1,500 | 13,800 | 195 | 1,228 | $203,833 | $5,378 | $198,455 | $1,157,261 |
| 17 | 1,500 | 15,300 | 195 | 1,354 | $222,159 | $5,936 | $216,223 | $1,373,484 |
| 18 | 1,500 | 16,800 | 195 | 1,475 | $239,149 | $6,487 | $232,662 | $1,606,146 |
| 19 | 2,000 | 18,800 | 300 | 1,681 | $270,619 | $5,821 | $264,798 | $1,870,944 |
| 20 | 2,000 | 20,800 | 300 | 1,879 | $299,808 | $6,620 | $293,188 | $2,164,132 |
| 21 | 2,000 | 22,800 | 300 | 2,069 | $326,817 | $7,330 | $319,487 | $2,483,619 |
| 22 | 2,000 | 24,800 | 300 | 2,252 | $351,743 | $7,962 | $343,781 | $2,827,400 |
| 23 | 2,000 | 26,800 | 300 | 2,428 | $374,679 | $8,544 | $366,135 | $3,193,535 |
| 24 | 2,000 | 28,800 | 300 | 2,597 | $395,716 | $9,083 | $386,633 | $3,580,168 |

### Monthly Expense Assumptions

| Category | M1-6 | M7-12 | M13-18 | M19-24 |
|----------|------|-------|--------|--------|
| Hosting/Infrastructure | $500 | $1,500 | $3,000 | $5,000 |
| Marketing/CAC Spend | $3,000 | $8,000 | $15,000 | $25,000 |
| Tools/Software | $300 | $500 | $800 | $1,000 |
| Contractors/Support | $0 | $2,000 | $5,000 | $10,000 |
| Misc/Buffer | $200 | $500 | $1,200 | $2,000 |
| **Total Monthly Costs** | **$4,000** | **$12,500** | **$25,000** | **$43,000** |

### Net Profit Timeline

| Month | MRR | Expenses | Net Profit | Cumulative P&L |
|-------|-----|----------|------------|----------------|
| 3 | $7,457 | $4,000 | $3,457 | -$7,086 |
| 6 | $22,276 | $4,000 | $18,276 | $37,053 |
| 9 | $54,672 | $12,500 | $42,172 | $125,011 |
| 12 | $111,965 | $12,500 | $99,465 | $382,458 |
| 18 | $232,662 | $25,000 | $207,662 | $1,096,339 |
| 24 | $386,633 | $43,000 | $343,633 | $2,464,581 |

---

## 3. Unit Economics by Channel

### CAC by Acquisition Channel

| Channel | Estimated CAC | % of Signups | Quality Score | Notes |
|---------|---------------|--------------|---------------|-------|
| **LinkedIn Ads** | $180 | 30% | High | Decision-makers, high intent |
| **Association Partnerships** | $120 | 25% | Very High | Warm intros, credibility |
| **Organic/Content** | $40 | 25% | Medium | Blog, SEO, thought leadership |
| **Referral Program** | $80 | 15% | Very High | $40 credit × 2 parties |
| **Direct/Brand** | $20 | 5% | High | Word of mouth, PR |
| **Blended CAC** | **$108** | 100% | | |

### CAC Calculation Details
```
LinkedIn: $180 (ad spend + management) / conversion
Association: $120 (partnership fees + time) / lead
Organic: $40 (content creation cost amortized)
Referral: $80 ($40 giver + $40 receiver credit)
Direct: $20 (minimal, brand awareness spillover)

Blended = (0.30×180) + (0.25×120) + (0.25×40) + (0.15×80) + (0.05×20)
        = 54 + 30 + 10 + 12 + 1 = $107
```

### LTV by Tier

| Tier | ARPU | Avg Lifespan | Gross Margin | LTV | CAC | LTV:CAC |
|------|------|--------------|--------------|-----|-----|---------|
| **Pro** | $27 | 14 months | 85% | $321 | $108 | 2.97:1 |
| **Team** | $237 | 24 months | 80% | $4,550 | $350* | 13.0:1 |
| **Enterprise** | $2,000 | 36 months | 75% | $54,000 | $2,500* | 21.6:1 |
| **Blended** | $178 | 18 months | 82% | $2,628 | $108 | **24.3:1** |

*Team/Enterprise CAC includes sales time and longer cycles

### LTV Formula
```
LTV = ARPU × Average Lifespan (months) × Gross Margin

Pro LTV = $27 × 14 × 0.85 = $321
Team LTV = $237 × 24 × 0.80 = $4,550  
Enterprise LTV = $2,000 × 36 × 0.75 = $54,000
```

### Payback Period

| Tier | CAC | Monthly GM | Payback Period |
|------|-----|------------|----------------|
| Pro | $108 | $22.95 | **4.7 months** |
| Team | $350 | $189.60 | **1.8 months** |
| Enterprise | $2,500 | $1,500 | **1.7 months** |
| Blended | $108 | $146.09 | **0.7 months** |

**Key Insight:** Excellent payback periods across all tiers. Even Pro recovers CAC in under 5 months.

---

## 4. Sensitivity Analysis

### Conversion Rate Sensitivity

| Scenario | Conv Rate | M12 Paid Customers | M12 MRR | M24 MRR |
|----------|-----------|-------------------|---------|---------|
| Pessimistic | 6% | 505 | $83,851 | $297,287 |
| Base Case | 10% | 673 | $111,965 | $386,633 |
| Optimistic | 14% | 942 | $156,751 | $541,286 |

**Impact:** Every 1% conversion improvement = ~$16K more MRR at Month 12

### Churn Rate Sensitivity

| Scenario | Churn Rate | M12 Retention | M12 MRR | M24 MRR |
|----------|------------|---------------|---------|---------|
| High Churn | 8% | 36% | $84,726 | $251,232 |
| Base Case | 5%→3% | 55% | $111,965 | $386,633 |
| Low Churn | 3% | 70% | $142,138 | $542,845 |

**Impact:** Reducing churn from 5% to 3% = 27% more MRR at Month 12

### CAC Sensitivity

| Scenario | Blended CAC | M12 Marketing Spend | LTV:CAC | Break-even |
|----------|-------------|---------------------|---------|------------|
| Efficient | $100 | $67,300 | 26.3:1 | Month 5 |
| Base Case | $108 | $72,684 | 24.3:1 | Month 6 |
| Expensive | $150 | $100,950 | 17.5:1 | Month 7 |
| Very Expensive | $250 | $168,250 | 10.5:1 | Month 9 |

### Combined Scenario Matrix (M12 MRR)

|  | Churn 3% | Churn 5% | Churn 8% |
|--|----------|----------|----------|
| **Conv 6%** | $106,604 | $83,851 | $63,545 |
| **Conv 10%** | $142,138 | $111,965 | $84,726 |
| **Conv 14%** | $198,993 | $156,751 | $118,616 |

**Best Case (14% conv, 3% churn):** $199K MRR at Month 12
**Worst Case (6% conv, 8% churn):** $64K MRR at Month 12

---

## 5. Cash Flow Projection

### MRR Milestones

| Milestone | Month | Cumulative Revenue | Cumulative Spend | Net Position |
|-----------|-------|-------------------|------------------|--------------|
| **$10K MRR** | Month 4-5 | $28,385 | $16,000 | +$12,385 |
| **$25K MRR** | Month 6-7 | $68,467 | $24,000 | +$44,467 |
| **$50K MRR** | Month 8-9 | $147,312 | $52,500 | +$94,812 |
| **$100K MRR** | Month 11-12 | $372,441 | $90,000 | +$282,441 |
| **$250K MRR** | Month 19 | $1,870,944 | $425,000 | +$1,445,944 |

### Monthly Cash Flow (First 12 Months)

| Month | Revenue | Expenses | Net Cash | Running Balance* |
|-------|---------|----------|----------|------------------|
| 1 | $2,854 | $4,000 | -$1,146 | $48,854 |
| 2 | $5,251 | $4,000 | +$1,251 | $50,106 |
| 3 | $7,457 | $4,000 | +$3,457 | $53,563 |
| 4 | $12,822 | $4,000 | +$8,822 | $62,385 |
| 5 | $17,806 | $4,000 | +$13,806 | $76,190 |
| 6 | $22,276 | $4,000 | +$18,276 | $94,467 |
| 7 | $34,125 | $12,500 | +$21,625 | $116,092 |
| 8 | $44,720 | $12,500 | +$32,220 | $148,312 |
| 9 | $54,672 | $12,500 | +$42,172 | $190,483 |
| 10 | $75,898 | $12,500 | +$63,398 | $253,881 |
| 11 | $94,559 | $12,500 | +$82,059 | $335,941 |
| 12 | $111,965 | $12,500 | +$99,465 | $435,405 |

*Starting with $50K initial investment

### Profitability Timeline

| Metric | Timeline |
|--------|----------|
| First profitable month | **Month 2** |
| Sustainable profitability | **Month 4** |
| $10K+ monthly profit | **Month 6** |
| $50K+ monthly profit | **Month 9** |
| $100K+ monthly profit | **Month 12** |

### Runway Analysis

| Scenario | Initial Investment | Runway | Notes |
|----------|-------------------|--------|-------|
| Lean Start | $25K | 3 months | Risk: any delay is fatal |
| Comfortable | $50K | 6+ months | Recommended minimum |
| Growth Mode | $100K | 12+ months | Allows aggressive marketing |

**Recommendation:** $50K provides comfortable runway with buffer for slower-than-expected growth.

---

## 6. Break-Even Analysis

### Fixed Monthly Costs (Estimated)

| Category | Early Stage | Growth Stage | Scale Stage |
|----------|-------------|--------------|-------------|
| Hosting | $500 | $2,000 | $5,000 |
| Tools | $300 | $600 | $1,000 |
| Marketing (fixed) | $1,000 | $3,000 | $10,000 |
| Support | $0 | $2,000 | $8,000 |
| Admin/Legal | $200 | $500 | $1,000 |
| **Total Fixed** | **$2,000** | **$8,100** | **$25,000** |

### Break-Even Calculations

```
Break-Even MRR = Fixed Costs / Gross Margin
Early Stage: $2,000 / 0.82 = $2,439 MRR
Growth Stage: $8,100 / 0.82 = $9,878 MRR  
Scale Stage: $25,000 / 0.82 = $30,488 MRR
```

### Customers Needed to Break Even

| Stage | Break-Even MRR | Blended ARPU | Customers Needed |
|-------|----------------|--------------|------------------|
| Early (M1-6) | $2,439 | $178 | **14 paid customers** |
| Growth (M7-12) | $9,878 | $178 | **56 paid customers** |
| Scale (M13+) | $30,488 | $178 | **171 paid customers** |

### Break-Even Timeline

| Milestone | When Achieved | Customers at Time |
|-----------|---------------|-------------------|
| Early stage break-even | **Month 1** | 16 customers |
| Growth stage break-even | **Month 5** | 77 customers |
| Scale stage break-even | **Month 10** | 449 customers |

---

## 7. Key Insights & Recommendations

### 🟢 Strengths

1. **Excellent unit economics** - LTV:CAC of 24:1 is exceptional (3:1 is considered healthy)
2. **Fast payback** - CAC recovered in < 5 months even for lowest tier
3. **Strong ARPU** - $178 blended exceeds $80 target by 2x
4. **Natural virality** - Job postings showcase platform to candidates
5. **Low churn potential** - Switching costs increase with usage

### 🟡 Key Metrics to Watch

| Metric | Target | Red Flag | Action if Red |
|--------|--------|----------|---------------|
| Free→Paid Conversion | 10%+ | < 6% | Improve onboarding, add trial features |
| Monthly Churn | < 5% | > 8% | Customer success, feature gaps |
| Blended CAC | < $150 | > $200 | Shift to organic, partnerships |
| ARPU | > $150 | < $100 | Push Team tier, seat expansion |
| Trial-to-Paid | > 25% | < 15% | Trial experience, pricing |

### 🔴 Risk Factors

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slower conversion than projected | Medium | High | A/B test onboarding, add premium trial features |
| Higher churn than expected | Medium | High | Invest in CS early, sticky integrations |
| CAC inflation (competition) | Medium | Medium | Double down on organic, partnerships |
| Market timing (economic downturn) | Low | Medium | Position as cost-savings tool |
| Technical issues at scale | Low | High | Invest in infrastructure early |

### 📊 Recommendations

1. **Prioritize Team tier conversions**
   - LTV:CAC of 13:1 vs Pro's 2.97:1
   - Target small creative agencies (2-5 person teams)
   - Consider "Team trial" with 2-3 free seats for 14 days

2. **Invest heavily in organic/content**
   - $40 CAC vs $180 for LinkedIn
   - Build SEO moat: job description templates, hiring guides
   - Target: 40% organic by Month 12

3. **Build expansion revenue engine**
   - Seat additions should be frictionless
   - Usage-based pricing for AI features
   - Target: 25% of MRR from expansion by Month 12

4. **Reduce churn proactively**
   - Monthly check-ins for Team+ customers
   - Track leading indicators: login frequency, jobs posted
   - Save offers for churning customers

5. **Optimize pricing annually**
   - Test $39 Pro tier at Month 6
   - Consider usage tiers for high-volume users
   - Annual discounts should be 15-20%, not 2 months free

---

## 8. Model Assumptions & Limitations

### Key Assumptions

| Assumption | Value | Confidence | Notes |
|------------|-------|------------|-------|
| Pricing holds | Stable | High | May need to test |
| Conversion rates improve | 8%→12% | Medium | Depends on product |
| Churn decreases | 8%→3% | Medium | Requires investment |
| CAC stays stable | ~$108 | Medium | Competition risk |
| ARPU grows | $178→$200 | Medium | Mix shift to Team |
| No major competitors | 12 months | Low | Unknown entrants |

### Model Limitations

1. **Linear growth assumed** - Reality is more volatile
2. **No seasonal adjustment** - Hiring is seasonal
3. **Single product** - Doesn't account for future products
4. **No discounting** - Enterprise deals may require discounts
5. **USD only** - International pricing may differ

### Recommended Model Updates

- Refresh monthly with actual data
- Add cohort analysis after Month 3
- Build retention curves after Month 6
- Segment by industry/company size after Month 9

---

## 9. Quick Reference

### Key Numbers to Remember

| Metric | Value |
|--------|-------|
| Break-even customers | 56 (growth stage) |
| Break-even MRR | $9,878 |
| Target CAC | < $150 blended |
| Target LTV:CAC | > 3:1 |
| Target ARPU | > $150 |
| Target churn | < 5% monthly |
| Payback period | < 6 months |
| Runway needed | $50K minimum |
| Path to $100K MRR | Month 11-12 |
| Path to $1M ARR | Month 8-9 |

### Decision Framework

**When to increase marketing spend:**
- CAC < $120 AND conversion > 10% AND churn < 5%

**When to raise prices:**
- Churn < 3% AND NPS > 50 AND waitlist forming

**When to hire:**
- MRR > $50K AND growth > 20% MoM AND support tickets > capacity

---

*Model version: 1.0 | Last updated: 2026-02-08*
*Next review: After Month 3 actual data*
