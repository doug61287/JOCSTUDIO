# Dodge Construction Network Email Campaign

Email outreach system for 998K contractor leads using Resend + React Email + Supabase.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your keys
cp .env.example .env

# Preview email templates
npm run preview

# Set up database (run in Supabase SQL editor)
# → queries/schema.sql

# Start webhook server
npm run webhook

# Run campaign
npm run send          # Initial outreach
npm run send followup1  # Case study follow-up
npm run send followup2  # Breakup email
```

## Setup Checklist

### 1. Resend Account
1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard → API Keys
3. Add to `.env` as `RESEND_API_KEY`

### 2. Domain Verification (Recommended)
For better deliverability, verify your domain in Resend:
1. Dashboard → Domains → Add Domain
2. Add DNS records (SPF, DKIM, DMARC)
3. Wait for verification (~5 min)
4. Update `FROM_EMAIL` in `.env`

Without verification, you can use `@resend.dev` for testing.

### 3. Webhook Setup
1. In Resend dashboard → Webhooks → Add Endpoint
2. URL: `https://yourserver.com/webhooks/resend`
3. Events: Select all (delivered, opened, clicked, bounced, complained)
4. Copy signing secret → `RESEND_WEBHOOK_SECRET` in `.env`

### 4. Database Schema
Run `queries/schema.sql` in Supabase SQL editor to create:
- `email_sends` - Track every email sent
- `email_events` - Detailed engagement events
- `email_suppressions` - Bounces/unsubscribes

## Email Templates

### 1. Initial Outreach (`initial-outreach.tsx`)
- Value prop: X commercial projects in your area
- CTA: View projects button
- Personalized with company name, region, project count

### 2. Follow-up #1 (`followup-case-study.tsx`)
- Social proof: Martinez Construction case study
- Key stat: 3x win rate improvement
- Soft CTA: Reply to schedule call

### 3. Follow-up #2 (`followup-breakup.tsx`)
- Respectful close
- Final stat highlight
- Calendar link for future interest

## Rate Limiting

Default conservative settings:
- **100 emails/hour** (36 sec delay between sends)
- **3,000 emails/day** (Resend free tier)
- **10 emails per batch**

Adjust in `scripts/send-campaign.ts`:
```typescript
const RATE_LIMIT = {
  perHour: 100,
  perDay: 3000,
  delayMs: 36000,
  batchSize: 10,
};
```

## Webhook Events

The server handles:
- `email.sent` → Update status
- `email.delivered` → Confirm delivery
- `email.opened` → Track opens, increment count
- `email.clicked` → Log click + link details
- `email.bounced` → Mark email invalid, add to suppression
- `email.complained` → Immediate suppression, flag company

## Campaign Stats

Run queries from `queries/campaign-stats.sql`:
- Daily metrics (sends, opens, clicks)
- Sequence step performance
- Engagement funnel
- Bounce/complaint rates
- Regional performance
- Hot leads (clicked)
- Health check

## Deployment

### Webhook Server (Railway/Fly.io)
```bash
# Fly.io example
fly launch
fly secrets set RESEND_API_KEY=xxx SUPABASE_URL=xxx ...
fly deploy
```

### Scheduled Sends (cron)
```bash
# Example crontab - send initial outreach at 10am EST
0 10 * * 1-5 cd /path/to/dodge-campaign && npm run send initial
```

## Safety Features

- ✅ Suppression list respected before every send
- ✅ Bounce/complaint auto-suppression
- ✅ One-click unsubscribe headers
- ✅ Daily send limits enforced
- ✅ Engagement-based follow-up (no spam)
- ✅ Webhook signature verification

## Monitoring

Check health endpoint:
```bash
curl https://yourserver.com/health
```

Watch for:
- Bounce rate > 5% → Clean your list
- Complaint rate > 0.1% → Review content
- Open rate < 10% → Test subject lines

## Project Structure

```
dodge-campaign/
├── emails/                 # React Email templates
│   ├── initial-outreach.tsx
│   ├── followup-case-study.tsx
│   └── followup-breakup.tsx
├── webhooks/
│   └── server.ts          # Express webhook handler
├── scripts/
│   └── send-campaign.ts   # Campaign runner
├── queries/
│   ├── schema.sql         # Database setup
│   └── campaign-stats.sql # Analytics queries
├── package.json
└── .env.example
```
