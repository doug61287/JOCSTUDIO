# Agent Templates for JOCHero

Quick-copy templates for spawning agents. Copy, customize, deploy.

---

## 🎬 Demo Animation Template

```markdown
Create a [X]-second animated demo for JOCHero landing page.

**Demo Name:** [Name]
**Focus:** [What it demonstrates]
**Hook:** [One-line hook]

## Storyboard
[Scene-by-scene breakdown]

## Visual Style
- Background: #0F172A
- Accents: #1E40AF (Trust Blue), #FFD700 (Gold)
- Typography: Inter (headers), JetBrains Mono (data)
- Cursor: Gold circle with glow

## Technical
- Tech: HTML/CSS/JS + GSAP
- Resolution: 1920×1080 (responsive)
- Loop: Seamless
- Duration: [X] seconds

## Deliverables
1. [name].html
2. [name].css
3. [name].js
4. README.md

## Save To
~/clawd/projects/jocstudio/product/landing/demo/

## Post-Completion
- [ ] Test locally
- [ ] git add .
- [ ] git commit -m "Add [name] demo"
- [ ] git push
- [ ] Update landing page to include
- [ ] Test on jochero.com
```

---

## 📝 Content/Blog Template

```markdown
Create a blog post for JOCHero.

**Title:** [Title]
**Target Keyword:** [Primary SEO keyword]
**Audience:** [Who is this for?]
**Goal:** [What should reader do?]

## Structure
- Hook (first 100 words)
- Problem statement
- Solution/education
- JOCHero connection
- CTA

## SEO Requirements
- Title: [Title] | JOCHero
- Meta description: [155 chars]
- Headers: H1, H2, H3 hierarchy
- Internal links: 2-3 minimum
- Image alt text

## Deliverables
1. /blog/[slug]/index.html
2. Update /blog/index.html
3. Update main nav if needed

## Save To
~/clawd/projects/jocstudio/product/landing/blog/
```

---

## 🎨 UI Component Template

```markdown
Create a [component name] for JOCHero landing page.

**Type:** [Button/Card/Form/Modal/etc]
**Location:** [Where it appears]
**Purpose:** [What it does]

## Design Specs
- Colors: Trust Blue theme
- Size: [dimensions]
- Responsive: Mobile + desktop
- Animation: [hover states, transitions]

## Deliverables
1. HTML structure
2. CSS styles
3. JS interaction (if needed)
4. Integration instructions

## Save To
~/clawd/projects/jocstudio/product/landing/components/
```

---

## 🔧 Backend Feature Template

```markdown
Implement [feature] for JOCHero backend.

**Endpoint:** [API route]
**Method:** [GET/POST/PUT/DELETE]
**Auth Required:** [Yes/No]

## Requirements
- Input validation
- Error handling
- Response format
- Database changes

## Deliverables
1. Route handler
2. Service function
3. Database migration (if needed)
4. Tests
5. API documentation

## Save To
~/clawd/projects/jocstudio/product/backend/
```

---

## 📊 Research/Analysis Template

```markdown
Research [topic] for JOCHero strategy.

**Scope:** [What to research]
**Sources:** [Where to look]
**Deliverable:** [Format]

## Key Questions
1. [Question 1]
2. [Question 2]
3. [Question 3]

## Output Format
- Executive summary (3 bullets)
- Detailed findings
- Recommendations
- Source links

## Save To
~/clawd/projects/jocstudio/docs/research/
```

---

## 🚀 Quick-Spawn Aliases

Add to your shell:

```bash
# Content
alias joc-blog="sessions_spawn --task 'Create blog post:' --label joc-blog"

# Demos
alias joc-demo="sessions_spawn --task 'Create demo animation:' --label joc-demo"

# Code
alias joc-code="sessions_spawn --task 'Build feature:' --label joc-code"

# Research
alias joc-research="sessions_spawn --task 'Research:' --label joc-research"
```

---

## ✅ Agent Handoff Checklist

Every agent should return:

```markdown
## Task Complete ✅

### Deliverables
- [ ] File 1: [path]
- [ ] File 2: [path]
- [ ] File 3: [path]

### Status
- [ ] Tested locally
- [ ] Added to git
- [ ] Committed
- [ ] Pushed to GitHub
- [ ] Integration needed: YES/NO

### Blockers
- [ ] None / [list if any]

### Next Steps
- [What should happen next]
```

---

## 📁 File Structure Reference

```
~/clawd/projects/jocstudio/
├── product/
│   ├── landing/
│   │   ├── index.html (main)
│   │   ├── demo/ (animations)
│   │   ├── blog/ (posts)
│   │   └── components/ (reusable UI)
│   ├── backend/ (API)
│   └── shared/ (common code)
├── docs/ (documentation)
├── marketing/ (content assets)
└── memory/ (agent state)
```

---

*Copy, customize, deploy!* 🚀
