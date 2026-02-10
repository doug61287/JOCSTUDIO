# Agent Workflow Guide for JOCHero

## Quick Start

1. **Check manifest:** `cat manifest.json | grep status`
2. **Pick template:** Copy from `docs/agent-templates.md`
3. **Spawn agent:** Customize template, deploy
4. **Update manifest:** Add to `agents.active`
5. **Wait for completion**
6. **Verify & integrate**
7. **Move to `agents.completed`**

---

## File Structure

```
~/clawd/projects/jocstudio/
├── product/landing/     # Website files
│   ├── index.html       # Main landing
│   ├── demo/            # Animations
│   └── blog/            # Blog posts
├── docs/                # Documentation
│   ├── agent-templates.md
│   └── [other docs]
├── manifest.json        # Project state
└── memory/              # Daily logs
```

---

## Agent Spawning Best Practices

### 1. Always Use Templates
**Don't write from scratch.** Copy from `docs/agent-templates.md`, customize.

### 2. Define Deliverables Clearly
Agents should know EXACTLY what files to create.

### 3. Specify Save Location
Prevent "where do I put this?" confusion.

### 4. Require Checklist Return
Agents must confirm: tested, git added, committed, pushed.

### 5. Keep Tasks Chunked
One agent = one focused task. Chain multiple for complex work.

---

## Post-Agent Checklist

When agent reports complete:

- [ ] Verify files exist at specified paths
- [ ] Test locally (if possible)
- [ ] Check git status
- [ ] Review quality
- [ ] Integrate into main project
- [ ] Deploy to production
- [ ] Update manifest.json
- [ ] Log any errors to `memory/errors-YYYY-MM-DD.md`

---

## Common Patterns

### Pattern 1: Parallel Work
```
Agent A: Blog post
Agent B: Demo video
Agent C: Research
```
All at same time. Total time = longest task.

### Pattern 2: Chained Work
```
Agent A: Design → Save to file
Agent B: Read design → Build code
Agent C: Read code → Integrate
```
Sequential dependencies. Total time = sum of tasks.

### Pattern 3: Review Loop
```
Agent A: Create draft
Human: Review
Agent A: Revise based on feedback
```
For high-stakes deliverables.

---

## Error Prevention

### Always Include:
```
Before finishing:
1. Test the file opens without errors
2. Verify all links work
3. Confirm file is in git status
4. Ensure mobile responsive (if UI)
```

### Common Issues:
- **404 errors:** Folder not in git
- **Broken links:** Hardcoded paths
- **Style conflicts:** CSS not scoped
- **Mobile issues:** Not tested on small screens

---

## Template Quick Reference

| Task Type | Template Location | Example Command |
|-----------|-------------------|-----------------|
| Demo Animation | `docs/agent-templates.md` | `sessions_spawn --task '[paste template]' --label demo-x` |
| Blog Post | `docs/agent-templates.md` | `sessions_spawn --task '[paste template]' --label blog-x` |
| UI Component | `docs/agent-templates.md` | `sessions_spawn --task '[paste template]' --label ui-x` |
| Backend Feature | `docs/agent-templates.md` | `sessions_spawn --task '[paste template]' --label api-x` |
| Research | `docs/agent-templates.md` | `sessions_spawn --task '[paste template]' --label research-x` |

---

## Status Check Commands

```bash
# Check project status
cat ~/clawd/projects/jocstudio/manifest.json | jq '.agents'

# Check git status
cd ~/clawd/projects/jocstudio/product/landing && git status

# Check running agents
sessions_list | grep jochero

# View recent memory
cat ~/clawd/projects/jocstudio/memory/$(date +%Y-%m-%d).md
```

---

## Success Metrics

Track in `manifest.json`:
- Agents spawned today
- Tasks completed
- Time saved vs manual
- Error rate

---

*Optimize, automate, accelerate!* 🚀
