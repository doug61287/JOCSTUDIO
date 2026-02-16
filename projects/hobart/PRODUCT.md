# Hobart 🦞 - Product Plan

## Vision
The job search assistant for exhausted people. Passive discovery, smart prep, zero guilt.

## Distribution
- **Landing page** with invite code access (organic friend-to-friend)
- **WhatsApp bot** - all interaction happens in chat
- No app, no account, no password

---

## Core Features

### 1. 🔍 Silent Scout (Discovery)
**What:** Scans job boards daily based on your preferences

**How:**
- Brave Search API → LinkedIn, Indeed, Glassdoor
- Filter ruthlessly (90% of jobs are noise)
- Score by relevance to your profile
- Research companies (Glassdoor reviews, news, layoffs)

**Delivers:**
- Weekly digest (not daily - respects energy)
- 3-5 high-quality matches, not 50 maybes
- Company snapshot with each listing

### 2. 📋 Profile (One-Time Setup)
**Collected once via conversational onboarding:**
- Job titles / keywords
- Industries
- Salary range
- Location + remote preference
- Dealbreakers (company size, industries to avoid)
- Dream companies (auto-watch their careers pages)

**Not collected:**
- Resume (optional for now - they manage their own)

### 3. 📬 Weekly Digest
**Sunday morning delivery (configurable)**

```
☕ Good morning Sarah!

Found 3 roles worth your time this week:

━━━━━━━━━━━━━━━━━━━━

1️⃣ Senior PM @ Stripe
   📍 SF/Remote | 💰 $180-220k
   
   Why this fits:
   • Your fintech experience matches
   • They're scaling payments infra (your specialty)
   • Remote-friendly culture
   
   ⚠️ One note: Fast-paced, high-burn culture per Glassdoor
   
   🔗 linkedin.com/jobs/...
   
━━━━━━━━━━━━━━━━━━━━

[Full list] | [Not interested in any] | [Pause for 2 weeks]
```

### 4. 🎤 Interview Prep
**Triggered when user says "I have an interview with X"**

Delivers:
- Company deep-dive (what they do, recent news, funding, culture)
- Role analysis (what they're really looking for)
- Likely questions based on role + company
- Your talking points mapped to their needs
- Salary benchmarks for negotiation

```
🎯 Interview Prep: Stripe PM Role

**The Company**
Stripe processes $800B+ annually. They're expanding into...

**Recent News**
• Raised $6.5B at $50B valuation (Mar 2023)
• Launched Stripe Tax last quarter
• No recent layoffs (good sign!)

**What They Want**
Based on the JD, they're looking for someone who can:
• Own payment product roadmap
• Work cross-functionally with eng
• Handle ambiguity (startup DNA)

**Questions to Expect**
1. "Tell me about a product you shipped from 0 to 1"
2. "How do you prioritize competing requests?"
3. "Describe a time you influenced without authority"

**Your STAR Stories**
• Shipped X at Y company → maps to their "0 to 1" question
• ...

**Salary Intel**
• Glassdoor: $175-225k for this level
• Levels.fyi: $195k median
• Recommendation: Anchor at $210k

Ready for your interview! 💪
```

### 5. 🫂 Emotional Support Layer
**Gentle, human touches:**

- Weekly check-in: "How are you feeling about the search?"
- Reframe rejections: "They passed, but you're still active at 4 places"
- Progress visibility: "This month: 8 apps → 2 screens → 1 final. 25% hit rate!"
- Celebrate wins: "YOU GOT THE INTERVIEW! 🎉"
- Respect silence: "Haven't heard from you in 2 weeks. Taking a break? No pressure."

### 6. 📊 Simple Tracking
**Auto-tracked, surfaced on request:**

- Jobs discovered
- Jobs you showed interest in
- Applications sent (self-reported)
- Interviews scheduled
- Outcomes

"Show me my progress" →
```
📊 Your Search Stats

🔍 Jobs Discovered: 47
👀 Interested: 12  
📝 Applied: 8
🎤 Interviews: 2
⏳ Pending: 3 companies
❌ Passed: 2

You're doing great - 25% interview rate is above average!
```

---

## What Hobart Does NOT Do

❌ Auto-apply (people want control over this)  
❌ Write resumes/cover letters (for now)  
❌ Spam you daily  
❌ Make you feel guilty  
❌ Share your data  

---

## Invite System

### Landing Page (hobart.app or similar)
- Simple: Hobart logo, one-liner, invite code input
- No signup, no email capture
- Enter code → redirects to WhatsApp deep link with pre-filled message

### Invite Codes
- Each user gets 3 invite codes after onboarding
- Codes are simple (e.g., "SARAH-2847")
- Track: who invited whom (for gratitude, not spam)

### First Message Flow
```
User clicks link → WhatsApp opens → Pre-filled: "Hi Hobart! Invite: SARAH-2847"
↓
Hobart: "Hey! 👋 Welcome to Hobart. Sarah sent you - she's got great taste.

I help people find jobs without the soul-crushing scroll. Let me learn a bit about what you're looking for..."
```

---

## Technical Stack

| Component | Tech |
|-----------|------|
| Bot runtime | OpenClaw (existing infra) |
| Messaging | WhatsApp via OpenClaw |
| Job search | Brave Search API |
| User data | JSON files (memory/users/) |
| Landing page | Simple HTML/Vercel |
| Company research | Web scraping + AI |

---

## User Journey

```
1. Friend sends invite link
         ↓
2. Landing page → Enter code → WhatsApp
         ↓
3. Onboarding chat (2 min)
         ↓
4. "Your first digest arrives Sunday!"
         ↓
5. Weekly digest every Sunday AM
         ↓
6. User expresses interest → Interview prep
         ↓
7. User gets offer → Celebration + ask for referrals
```

---

## Metrics That Matter

- **Activation:** % who complete onboarding
- **Retention:** % who open digest 3+ weeks
- **Quality:** % of surfaced jobs user clicks "interested"
- **Outcome:** Interviews scheduled, offers received
- **NPS:** Would you recommend Hobart?

---

## Phase 1 MVP (2 weeks)

- [ ] Landing page with invite code
- [ ] WhatsApp onboarding flow
- [ ] User preference storage
- [ ] Weekly job digest (Brave search)
- [ ] Basic interview prep (company + questions)
- [ ] 5 beta users (friends)

---

## Open Questions

1. **Digest timing:** Sunday? Configurable per user?
2. **Resume:** Skip for MVP? Or light parsing for keyword extraction?
3. **Tracking:** Self-reported applications, or trust the flow?
4. **Company research depth:** How deep? Glassdoor + news? LinkedIn employee count?
