# First Win Email Sequence

## Overview
Automated email sequence triggered when customer wins their first JOC contract using JOCstudio.

**Trigger:** Customer marks project as "Won" OR manually submit win

---

## EMAIL 1: Immediate Celebration (Send instantly)

**Subject:** 🎉 HERO ALERT! You just crushed your first JOC contract

**From:** Doug @ JOCstudio (founder)

**Preview Text:** This is what being a hero looks like...

**Body:**
```
Subject: 🎉 HERO ALERT! You just crushed your first JOC contract

Hey [First Name],

STOP EVERYTHING.

You just did something incredible.

You won your first JOC contract using JOCstudio. 

Let that sink in.

[Time Saved] hours of manual Excel work → eliminated.
[Error Rate] of costly mistakes → gone.
Your first win using the only tool built for JOC contractors.

🏆 You're officially a RISING STAR.

Here's what happens next:

1. **Claim your badge** → [Discord Link]
   Join our private community of JOC heroes. Introduce yourself!

2. **Get featured** → Reply with your story
   Want to be in our Weekly Hero Spotlight? Just hit reply and tell me:
   - What was the project?
   - How much time did you save?
   - What would you tell other contractors?

3. **Keep winning** → [Link to templates]
   Download the NYC HHC Fire Protection template pack. Make proposal #2 even faster.

The best part? This is just the beginning.

Most of our heroes win 5+ contracts in their first 60 days.

You're on your way to becoming a JOC LEGEND.

Proud of you,
Doug
Founder, JOCstudio

P.S. — Your RISING STAR badge is waiting in Discord. Come claim it!

---

[Share on LinkedIn] [Tweet This] [Forward to a Friend]
```

**Design:**
- Hero badge image (large)
- Confetti animation (if supported)
- Big CTA buttons
- Social sharing links

---

## EMAIL 2: Case Study Request (Send 24 hours later, if no reply)

**Subject:** Quick favor? (2 min read)

**Body:**
```
Subject: Quick favor? (2 min read)

Hey [First Name],

Yesterday you won your first JOC contract with JOCstudio. 

I'm still celebrating over here 🎉

Quick question:

Would you be open to a 10-minute interview about your experience?

I want to feature your success story in our Weekly Hero Spotlight.

Here's what I need:
- 10 minutes on Zoom (or phone if easier)
- Just 3 questions about your experience
- Your photo + company logo

What you get:
- Feature sent to 2,000+ contractors
- Backlink to your company website
- "Featured Hero" badge for your profile
- Eternal gratitude from me 😊

Interested? Just reply "YES" and I'll send you my Calendly link.

No pressure if you're swamped — your win is celebration enough!

Talk soon,
Doug
```

---

## EMAIL 3: Template Pack (Send 3 days later)

**Subject:** Want to win 5 more contracts this month?

**Body:**
```
Subject: Want to win 5 more contracts this month?

Hey [First Name],

You've got one win under your belt.

Now let's make it 5.

Here's your secret weapon:

🎁 NYC HHC Fire Protection Template Pack

Includes:
✓ Pre-formatted proposal template
✓ 50 most common UPB line items
✓ Coefficient cheat sheet by borough
✓ Sample scope language

Download here → [Link]

This is the same template our Heroes use to submit proposals in 90 minutes (not 8 hours).

Pro tip: Customize the scope language for your specialty, then save it as your own template in JOCstudio.

You're already a Rising Star.

Let's make you a HERO.

Doug

P.S. — Questions? Just reply. I read every email.
```

---

## EMAIL 4: Community Invitation (Send 7 days later, if not joined Discord)

**Subject:** 127 contractors are talking about this inside...

**Body:**
```
Subject: 127 contractors are talking about this inside...

Hey [First Name],

Quick question:

Have you joined the JOCstudio Heroes Discord yet?

Here's what you're missing:

🔥 This week's hot contracts (members-only intel)
💰 Pricing discussions — "What would you charge for...?"
🏆 Real wins being posted daily
🤝 Subcontractor connections
📚 Template sharing

Most importantly?

You're missing your people.

Contractors who get it. Who understand the 2 AM proposal panic. The coefficient confusion. The thrill of winning a big JOC contract.

Join here → [Discord Link]

Your @Rising Star badge is waiting.

See you inside,
Doug

P.S. — I host Office Hours every Wednesday at 3 PM ET. Bring your hardest JOC questions.
```

---

## EMAIL 5: Referral Ask (Send 14 days later)

**Subject:** Know another contractor who needs this?

**Body:**
```
Subject: Know another contractor who needs this?

Hey [First Name],

Two weeks ago, you won your first contract with JOCstudio.

Since then?

[If they won more: X more contracts, Y hours saved]
[If not: Still crushing those proposals faster]

Either way, you're a believer.

So here's my ask:

Do you know another contractor who spends 8+ hours on JOC proposals?

Someone who'd love to cut that to 90 minutes?

Forward them this email.

Or send them here → [Referral Link]

If they sign up for Pro, you both get a free month.

Help a fellow contractor become a hero.

Thanks for being part of this journey,
Doug

P.S. — Our best Heroes came from referrals. Just saying 😊
```

---

## Automation Setup

### Email Platform Options:

**Option 1: ConvertKit (Recommended)**
- Visual automation builder
- Tag-based triggers
- Easy to set up
- $29/mo for 1,000 subscribers

**Option 2: Mailchimp**
- Free up to 500 contacts
- Automation included
- More complex UI

**Option 3: Postmark (Transactional)**
- Better deliverability
- Event-based triggers
- Requires more dev work

### Trigger Logic:

```
IF user.status = "first_win" AND first_win_email_sent = false:
    SEND Email 1 (immediate)
    SET first_win_email_sent = true
    
IF 24 hours passed AND case_study_reply = false:
    SEND Email 2
    
IF 3 days passed:
    SEND Email 3
    
IF 7 days passed AND discord_joined = false:
    SEND Email 4
    
IF 14 days passed:
    SEND Email 5
```

### Integration Points:

**From JOCstudio App:**
- When user marks project "Won" → Trigger webhook
- When user joins Discord → Update tag
- When user replies → Stop sequence

**To JOCstudio App:**
- Show celebration modal in app
- Unlock Rising Star badge
- Add to community leaderboard

---

## Metrics to Track

| Metric | Target |
|--------|--------|
| Open rate | 50%+ |
| Click rate | 20%+ |
| Discord join rate | 40%+ |
| Case study reply rate | 15%+ |
| Referral rate | 10%+ |

---

## A/B Testing Ideas

**Subject Lines:**
- A: "🎉 HERO ALERT! You just..."
- B: "You won! Here's what happens next..."

**CTAs:**
- A: "Join Discord"
- B: "Claim Your Badge"

**Timing:**
- A: Immediate send
- B: 1 hour delay

---

## Sequence Timeline

```
Day 0 (Immediate)  → Email 1: Celebration + Discord invite
Day 1              → Email 2: Case study request (if no reply)
Day 3              → Email 3: Template pack
Day 7              → Email 4: Community push (if not in Discord)
Day 14             → Email 5: Referral ask
```

---

## Placeholders to Replace

Before going live, replace these placeholders:

- `[First Name]` → Merge tag (e.g., `{{subscriber.first_name}}`)
- `[Time Saved]` → Dynamic or average value
- `[Error Rate]` → Dynamic or average value
- `[Discord Link]` → Actual Discord invite URL
- `[Link to templates]` → Template download URL
- `[Referral Link]` → Referral program URL
- `[If they won more...]` → Conditional content block

---

*Created: 2026-02-08*
*Part of: JOCstudio Hero Strategy*
