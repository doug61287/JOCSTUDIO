# JOCstudio Heroes — Discord Server Setup Guide

Complete configuration guide for building the JOCstudio contractor community on Discord.

---

## Server Name

**"JOCstudio Heroes"** or **"JOC Heroes HQ"**

---

## Channel Structure

### 📢 WELCOME (Read-Only)

| Channel | Purpose |
|---------|---------|
| `#welcome` | Rules + intro |
| `#announcements` | Product updates |
| `#hero-spotlight` | Weekly featured heroes |

### 🦸 HERO JOURNEY

| Channel | Purpose |
|---------|---------|
| `#rookie-zone` | New members ask anything |
| `#rising-stars` | 3+ projects completed |
| `#hero-hall` | Proven winners only |
| `#legend-lounge` | VIPs + advisory board |

### 💬 COMMUNITY

| Channel | Purpose |
|---------|---------|
| `#wins` | Celebrate every win (big or small) |
| `#help` | Ask questions |
| `#showcase` | Share proposals, get feedback |
| `#market-intel` | Hot contracts, pricing trends |
| `#templates` | Share/download templates |
| `#off-topic` | General construction chat |

### 🎙️ VOICE CHANNELS

| Channel | Schedule |
|---------|----------|
| **Office Hours** | Weekly Q&A |
| **Hero Summit** | Quarterly strategy |
| **Water Cooler** | Always open |

---

## Roles & Permissions

| Role | Access Level |
|------|--------------|
| `@Founder` | Full admin (you) |
| `@Moderator` | Manage channels, kick/ban |
| `@Legend` | Access to legend-lounge, advisory board |
| `@Hero` | Access to hero-hall, beta features |
| `@Rising Star` | Access to rising-stars |
| `@Rookie` | Basic channels only |
| `@Bot` | MEE6 or Carl-bot |

### Permission Matrix

```
Channel             Rookie  Rising Star  Hero  Legend  Mod  Founder
──────────────────────────────────────────────────────────────────
#welcome              ✓R       ✓R        ✓R     ✓R     ✓W    ✓W
#announcements        ✓R       ✓R        ✓R     ✓R     ✓W    ✓W
#hero-spotlight       ✓R       ✓R        ✓R     ✓R     ✓W    ✓W
#rookie-zone          ✓        ✓         ✓      ✓      ✓     ✓
#rising-stars         ✗        ✓         ✓      ✓      ✓     ✓
#hero-hall            ✗        ✗         ✓      ✓      ✓     ✓
#legend-lounge        ✗        ✗         ✗      ✓      ✓     ✓
#wins                 ✓        ✓         ✓      ✓      ✓     ✓
#help                 ✓        ✓         ✓      ✓      ✓     ✓
#showcase             ✓        ✓         ✓      ✓      ✓     ✓
#market-intel         ✓        ✓         ✓      ✓      ✓     ✓
#templates            ✓        ✓         ✓      ✓      ✓     ✓
#off-topic            ✓        ✓         ✓      ✓      ✓     ✓

✓ = Read/Write | ✓R = Read Only | ✗ = No Access | ✓W = Write
```

---

## Bot Setup

### MEE6 Bot

**Website:** [mee6.xyz](https://mee6.xyz)

**Features to enable:**
- ✅ Auto-moderation (no spam)
- ✅ Leveling system (XP for participation)
- ✅ Welcome messages
- ✅ Custom commands

**Custom Commands:**

| Command | Response |
|---------|----------|
| `!help` | Post link to help resources |
| `!pricing` | Link to JOCstudio pricing guide |
| `!templates` | Redirect to #templates |
| `!rules` | Post community rules |

### Carl-bot

**Website:** [carl.gg](https://carl.gg)

**Features to enable:**
- ✅ Reaction roles (self-assign trade specialties)
- ✅ Auto-responses
- ✅ Logging (all mod actions)

---

## Welcome Message Template

```
🦸 Welcome to JOCstudio Heroes, @user!

You're now part of a community of elite JOC contractors.

👋 **Introduce yourself in #rookie-zone:**
- Name & company
- Trade specialty
- Years in JOC
- Your biggest challenge

🏆 **Earn your stripes:**
- Post your wins in #wins
- Ask questions in #help
- Share templates in #templates

🎯 **Next step:** Complete your first project → Become a Rising Star!

Questions? Tag @Moderator
```

---

## Rituals Schedule

### Daily
- Moderator check-ins (morning scan for questions/issues)

### Weekly

| Day | Ritual | Description |
|-----|--------|-------------|
| **Monday** | New Member Monday | Welcome new members, encourage intros |
| **Tuesday** | Tip Tuesday | Share one JOC tip or lesson learned |
| **Wednesday** | Win Wednesday | Celebrate wins in #wins |
| **Friday** | Help Friday | Post challenges, get community help |

### Monthly
- **Hero Awards Ceremony** — Voice channel recognition event
- **AMA with Special Guest** — Industry expert or top Hero

### Quarterly
- **Hero Summit** — Strategy session, roadmap preview, community feedback

---

## Auto-Moderation Rules

### Community Guidelines

1. **No spam/promo** without permission
2. **Be helpful and constructive** — we lift each other up
3. **Celebrate others' wins** — react, comment, encourage
4. **Keep it professional but fun** — this is work, but we enjoy it
5. **No politics/religion** — keep focus on JOC and business

### MEE6 Auto-Mod Settings

- Block excessive caps (70%+)
- Block repeated messages (3+ identical)
- Block external Discord invites
- Warn on first offense, timeout on second
- Log all actions in mod channel

---

## Integration with JOCstudio

### Automation Triggers

**When user signs up for JOCstudio:**
1. Send Discord invite link (in welcome email)
2. Auto-assign `@Rookie` role via webhook
3. Welcome message posted in #welcome

**When user wins first contract:**
1. Auto-promote to `@Rising Star`
2. Post celebration in #hero-spotlight
3. Unlock #rising-stars channel access

**When user reaches Hero status:**
1. Auto-promote to `@Hero`
2. Post celebration with stats
3. Unlock #hero-hall channel access

### Technical Implementation

```javascript
// Webhook payload for role assignment
{
  "user_id": "discord_user_id",
  "role": "rookie|rising_star|hero|legend",
  "achievement": "First signup|First win|10th win|Legend status",
  "spotlight_message": "🎉 @user just won their first JOC contract!"
}
```

---

## Growth Strategy

| Timeline | Goal | Action |
|----------|------|--------|
| **Month 1** | Seed community | Invite 20 beta testers (top users) |
| **Month 2** | Controlled growth | Open to all Pro users |
| **Month 3** | Quality filter | Require 1+ project to join |
| **Month 6** | Monetize? | Evaluate paid community add-on |

### Beta Tester Criteria
- Active JOCstudio user
- At least 3 projects completed
- Positive engagement history
- Willing to provide feedback

---

## Metrics to Track

### Weekly Dashboard

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Daily Active Users | 30%+ of members | Discord analytics |
| Messages per channel | 50+/week in active channels | MEE6 stats |
| New members | 5-10/week | Server insights |
| Win posts | 10+/week | Manual count |
| Support tickets deflected | Track #help → support ratio | Compare to email volume |

### Health Indicators

- ✅ **Healthy:** Multiple messages daily, new wins posted, questions answered quickly
- ⚠️ **Warning:** < 5 messages/day, no wins in a week, unanswered questions
- 🚨 **Critical:** Dead channels, spam appearing, member complaints

---

## Setup Checklist

### Phase 1: Create Server
- [ ] Create server at discord.com
- [ ] Set server name: "JOCstudio Heroes"
- [ ] Upload server icon (JOCstudio logo variant)
- [ ] Set server banner image

### Phase 2: Channels
- [ ] Create WELCOME category (read-only)
  - [ ] #welcome
  - [ ] #announcements
  - [ ] #hero-spotlight
- [ ] Create HERO JOURNEY category
  - [ ] #rookie-zone
  - [ ] #rising-stars
  - [ ] #hero-hall
  - [ ] #legend-lounge
- [ ] Create COMMUNITY category
  - [ ] #wins
  - [ ] #help
  - [ ] #showcase
  - [ ] #market-intel
  - [ ] #templates
  - [ ] #off-topic
- [ ] Create VOICE category
  - [ ] Office Hours
  - [ ] Hero Summit
  - [ ] Water Cooler

### Phase 3: Roles
- [ ] Create @Founder role (full admin)
- [ ] Create @Moderator role
- [ ] Create @Legend role
- [ ] Create @Hero role
- [ ] Create @Rising Star role
- [ ] Create @Rookie role
- [ ] Create @Bot role
- [ ] Set role colors (progression from gray → gold)
- [ ] Configure permissions per channel

### Phase 4: Bots
- [ ] Invite MEE6 bot (mee6.xyz)
- [ ] Configure MEE6 welcome message
- [ ] Set up MEE6 leveling
- [ ] Configure MEE6 auto-mod
- [ ] Invite Carl-bot (carl.gg)
- [ ] Set up reaction roles
- [ ] Enable logging

### Phase 5: Launch
- [ ] Write welcome channel content
- [ ] Post community rules
- [ ] Invite first 5 beta heroes
- [ ] Seed #wins with founder's first win
- [ ] Schedule first Office Hours

---

## Quick Reference Links

- **Create Discord Server:** https://discord.com/
- **MEE6 Bot:** https://mee6.xyz
- **Carl-bot:** https://carl.gg
- **Discord Developer Portal:** https://discord.com/developers
- **Server Templates:** https://discord.com/template

---

*Last updated: February 2026*
*Version: 1.0*
