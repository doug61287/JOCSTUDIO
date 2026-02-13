# JOCHero Demo Script
## Contractor Presentation - Fire Protection & Plumbing

**Duration:** 10-15 minutes  
**Audience:** JOC contractor specializing in plumbing and fire protection  
**Goal:** Show how JOCHero saves time and captures money left on the table

---

## Opening Hook (30 seconds)

> "Quick question - when your estimators do a takeoff, do they manually look up every quantity tier multiplier in the H+H contract? Do they remember to include escutcheons with every sprinkler head? Supply lines with every lavatory?"

*Pause for effect*

> "Most don't. And that's money left on the table - either missed discounts or forgotten accessories that eat into your margins. JOCHero fixes that."

---

## Load the Demo (30 seconds)

1. Go to **jochero.com** → Click "Launch App"
2. Click **🏥 Load Demo Project (FP + Plumbing)**
3. Point out: "This is a real NYC hospital ED renovation - exactly the kind of project you do"

**Say:** 
> "Notice it's already got Fire Protection and Plumbing groups organized. That's intentional - JOCHero speaks your trade."

---

## Fire Protection Workflow (3 minutes)

### Show Existing Pipe Measurement
1. Click on **3" FP Main Pipe** (285 LF)
2. Expand to show the task code and price

**Say:**
> "285 linear feet of 3-inch sprinkler main. But look at what JOCHero did automatically..."

3. Point to the **Counted Fittings** section underneath:
   - 15 elbows
   - 29 couplings

**Say:**
> "It auto-estimated your fittings based on trade rules - one elbow per 20 feet for direction changes, one coupling per 10 feet because pipe comes in 10-foot sticks. These are Math.ceil() rounded UP - you'll never under-count."

### Show the Money Shot: Multipliers
4. Click on **Pendent Sprinkler Head** (47 EA)
5. Point to the cyan **Multiplier** indicator

**Say:**
> "47 sprinkler heads. See that? 'Qty 26-50 tier - Save $158.86'. That's a volume discount buried in the H+H contract that most estimators miss. We parsed 7,940 quantity tier multipliers from the actual contract PDFs."

### Show Head + Escutcheon
6. Expand to show escutcheons nested underneath

**Say:**
> "Every head gets an escutcheon. Always. JOCHero doesn't let you forget - it's automatic."

---

## Plumbing Workflow (3 minutes)

### Show Fixture Assembly
1. Click on **Lavatory** (16 EA)
2. Show the nested items:
   - Faucets (16)
   - Supply Lines (32 - because hot + cold!)
   - P-Traps (16)

**Say:**
> "16 lavatories. But a lavatory isn't just a basin - it needs a faucet, TWO supply lines, a p-trap. JOCHero knows this. That's 80 items captured from one measurement."

### Show Water Closets
3. Click on **Water Closet** (14 EA)
4. Show toilet seats, supply lines nested

**Say:**
> "Same thing with water closets. Seat, supply line, wax ring, flange - all captured."

### The Search Demo
5. Open JOC search (click + Add JOC Item)
6. Type "sprinkler head"

**Say:**
> "Watch what happens when you search. See how the PRODUCTS rank above the services? 'Sprinkler Head - Pendent' shows before 'Relocate Sprinkler Head'. That's intentional - we boosted products because 90% of the time, that's what you want."

---

## The Summary Tab (2 minutes)

1. Click the **Takeoff** tab
2. Scroll through the consolidated line items

**Say:**
> "Here's your complete JOC takeoff - every task code, quantity, unit price, extended. This is what goes into your proposal."

3. Point to the totals at the bottom

**Say:**
> "Subtotal, coefficient, final total. Ready for export."

### Export
4. Click **Export Proposal**
5. Open the CSV

**Say:**
> "Clean CSV, opens in Excel. Task codes, descriptions, quantities, pricing - ready to paste into your proposal template."

---

## Objection Handling

### "We already use Excel"
> "Excel doesn't know about quantity tiers. Does your spreadsheet automatically apply a -$3.38/unit discount when you hit 26 sprinkler heads? JOCHero does."

### "Our estimators know this stuff"
> "Do they apply it consistently every time? On every item? At 3am when they're rushing to submit? JOCHero doesn't get tired, doesn't forget."

### "We have our own system"
> "Does your system auto-populate fittings? Does it know that a lavatory needs two supply lines? Does it flag when you might be missing accessories?"

### "This is NYC-specific"
> "Right now, yes - we built for H+H's CTC contract. But the engine works with any cost book. We're expanding."

---

## The Close (1 minute)

**Pull up the numbers from the demo:**

> "Look at this project: 
> - 47 sprinkler heads saved $158 from tier multipliers alone
> - 16 lavatories with 80 auto-captured accessories  
> - Zero forgotten fittings
> 
> On a real project, how many of those $150 savings add up? How many times have you eaten cost on forgotten fittings?"

**The ask:**

> "We're in beta right now - looking for contractors who want to be heroes to their estimators. Free access during beta, your feedback shapes the product. Want in?"

---

## Demo Checklist

Before presenting, verify:

- [ ] jochero.com loads
- [ ] Demo project loads with all measurements
- [ ] Multiplier savings displays correctly (cyan indicator)
- [ ] Fittings appear nested under pipe measurements
- [ ] Search shows products before services
- [ ] Export downloads CSV

---

## Key Numbers to Remember

- **65,331** items in H+H catalogue
- **7,940** quantity tier multipliers parsed
- **16** assemblies for Fire Protection + Plumbing
- **Division 21**: 1,073 items (Fire Protection)
- **Division 22**: 6,093 items (Plumbing)

---

## Talking Points - Why Trust the Estimates?

**Fittings per Linear Foot:**
| Fitting | Factor | Why |
|---------|--------|-----|
| Elbow | 1 per 20 LF | Pipe changes direction every ~20 feet |
| Coupling | 1 per 10 LF | Pipe comes in 10-foot sticks |
| Tee | 1 per 50 LF | Branch takeoffs less frequent |

**These are estimates, not gospel.** The Hard Count button 🖱️ lets them refine after walking the job.

---

## Emergency Fallbacks

**If demo doesn't load:**
- Use screenshots in `/product/app/screenshots/`
- Walk through the YAML templates instead

**If search seems wrong:**
- "We're continuously improving search ranking based on contractor feedback"
- Pivot to showing the assembly system instead

**If they ask about pricing:**
- "Beta is free. After launch, we're looking at $X/seat/month - but early adopters get locked in rates"
