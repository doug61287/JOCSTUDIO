# Multi-Agent Architecture — Chief of Staff Model

**Adopted:** 2026-02-08
**Pattern:** Supervisor/Orchestrator (Option 1 - Telegram-based)

## Architecture

```
Doug (User)
    ↓
Chief of Staff (Main Agent — Telegram)
    ↓ (spawns sub-agents via sessions_spawn)
    ├─→ Code Agent — Development, scripts, automation
    ├─→ Research Agent — Market analysis, competitors, trends
    ├─→ Marketing Expert Agent — Strategy, positioning, campaigns ⭐
    ├─→ Content Agent — Copywriting, proposals, documents
    ├─→ Data Agent — Spreadsheets, analysis, calculations
    └─→ Ops Agent — Reminders, monitoring, system checks

    Marketing Expert ↔ Content Agent (strategy + execution)
    Marketing Expert ↔ Research Agent (insights + strategy)
    Marketing Expert ↔ Data Agent (metrics + optimization)
```

## How It Works

1. **Single Interface** — Doug messages Chief of Staff (me) in main Telegram chat
2. **Task Analysis** — I assess complexity and decide if sub-agents needed
3. **Delegation** — I spawn specialist sub-agents for parallel processing
4. **Synthesis** — I aggregate results and present unified response
5. **Iteration** — We refine based on feedback

## When Sub-Agents Are Spawned

**Always spawn for:**
- Research tasks (>5 min of web searching)
- Content writing (blogs, proposals, emails)
- Code development (>50 lines or complex logic)
- Data analysis (spreadsheets, calculations)
- Multi-step workflows

**Handle directly:**
- Quick lookups (<2 min)
- Simple Q&A
- Status checks
- Routine system commands

## Communication Flow

```
Doug: "Research competitor pricing for takeoff software"
  ↓
Chief: Spawns Research Agent → returns findings in 5 min
  ↓
Chief: Synthesizes + presents key insights to Doug
  ↓
Doug: "Now write a comparison blog post"
  ↓
Chief: Spawns Content Agent with research context
  ↓
Chief: Reviews draft, suggests edits, delivers final
```

## Benefits

- ✅ Simple: One chat interface
- ✅ Efficient: Parallel processing via sub-agents
- ✅ Coordinated: No conflicting advice
- ✅ Cost-effective: Sub-agents use cheaper models (Kimi), Chief uses premium (Claude)
- ✅ Persistent: Sub-agent results logged to memory

## Specialist Agent Profiles

### Code Agent
- **Model:** Kimi or Claude (depending on complexity)
- **Use for:** JOCstudio features, scripts, automation, debugging
- **Context:** Receives relevant code files, returns working solutions

### Research Agent
- **Model:** Kimi (good for web search + synthesis)
- **Use for:** Competitor analysis, market trends, technology evaluation
- **Context:** Receives research questions, returns structured findings

### Marketing Expert Agent ⭐ NEW
- **Model:** Claude (strategic thinking + creativity)
- **Use for:** 
  - Go-to-market strategy
  - Positioning & messaging
  - Campaign planning
  - Pricing strategy
  - Customer personas
  - Marketing funnel optimization
  - Channel strategy (SEO, paid, content, partnerships)
  - Launch planning
- **Context:** Receives product info + goals, returns strategic marketing plans
- **Key Strength:** Combines research insights with actionable marketing tactics

### Content Agent
- **Model:** Claude (best writing quality)
- **Use for:** Marketing copy, proposals, blog posts, documentation
- **Context:** Receives brief + research, returns polished content
- **Works with:** Marketing Expert Agent (strategy → execution)

### Data Agent
- **Model:** Kimi
- **Use for:** Spreadsheet analysis, financial modeling, calculations
- **Context:** Receives data + objectives, returns analysis + visualizations

### Ops Agent
- **Model:** Kimi
- **Use for:** Monitoring, reminders, system checks, maintenance
- **Context:** Scheduled tasks or on-demand system operations

## Example Workflows

### JOCstudio Feature Development
1. Doug: "Add CSV export to JOCstudio"
2. Chief → Code Agent: Implement feature
3. Code Agent returns code
4. Chief: Deploy + confirm working

### Marketing Campaign
1. Doug: "Create competitor comparison for JOCstudio"
2. Chief → Research Agent: Analyze Kreo, PlanSwift, Bluebeam
3. Chief → Content Agent: Write comparison blog
4. Chief → Code Agent: Create pricing calculator
5. Chief: Deliver complete campaign package

### Business Development
1. Doug: "Prepare pitch for GC meeting Thursday"
2. Chief → Research Agent: Analyze target GC's portfolio
3. Chief → Data Agent: Calculate ROI/savings metrics
4. Chief → Content Agent: Create pitch deck
5. Chief: Schedule practice run, set reminders

### Go-to-Market Campaign (Multi-Agent Collaboration)
1. **Doug:** "Launch JOCstudio — need full GTM strategy"
2. **Chief → Research Agent:** Analyze competitor pricing, positioning, gaps
3. **Chief → Marketing Expert Agent:** Develop GTM strategy with:
   - Target customer personas
   - Positioning vs competitors
   - Pricing strategy
   - Channel recommendations
   - Launch timeline
4. **Chief → Content Agent:** Create campaign assets (landing page, ads, emails)
5. **Chief → Data Agent:** Build financial model (CAC, LTV, break-even)
6. **Chief → Code Agent:** Implement landing page, tracking, signup flow
7. **Chief:** Deliver complete launch package with execution timeline

**Result:** Doug gets a complete, coordinated launch plan instead of piecemeal work

## Notes

- Sub-agents run in isolated sessions (no access to full context)
- Chief of Staff maintains continuity across all interactions
- Results from sub-agents are logged to memory for future reference
- Doug can always ask "what did the Research Agent find about X?"
