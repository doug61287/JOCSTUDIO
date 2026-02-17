# Estinator Beta Deployment Guide

## Overview
Deploy the Estinator React app for beta testing with invited users.

---

## Phase 1: Production Build (5 minutes)

### Step 1: Create Production Build
```bash
cd projects/estinator/app
npm run build
```

This creates a `dist/` folder with optimized assets.

### Step 2: Test Production Build Locally
```bash
npm run preview
# http://localhost:4173/
```

Verify everything works before deploying.

---

## Phase 2: Choose Hosting Platform

### Option A: Vercel (Recommended - Easiest)

**Why Vercel:**
- Zero-config React deployment
- Automatic HTTPS
- Preview deployments for PRs
- Free tier: 100GB bandwidth

**Deploy Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd projects/estinator/app
vercel

# Follow prompts:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? [your-username]
# ? Link to existing project? [y/N] N
# ? What's your project name? [estinator]
```

**Production Domain:**
```bash
vercel --prod
# https://estinator.vercel.app
```

**Connect Custom Domain:**
```bash
vercel domains add app.estinator.com
# Then update DNS records
```

---

### Option B: Netlify (Alternative)

**Deploy Steps:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd projects/estinator/app
netlify deploy --prod --dir=dist

# Or drag-and-drop dist folder to Netlify UI
```

---

### Option C: AWS S3 + CloudFront (Enterprise)

**For scale/control:**
```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://estinator-app --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id XYZ \
  --paths "/*"
```

---

## Phase 3: Backend Integration

### Current State
Frontend: ✅ Ready (localhost:5173)
Backend: ✅ Running (localhost:3001)

### Deployment Options

#### Option 1: Vercel Serverless Functions
Move Express routes to `/api` folder for serverless:
```
api/
├── documents.ts      # Serverless function
├── insights.ts
└── query.ts
```

**Pros:** Single platform, auto-scaling
**Cons:** Cold starts, limited execution time

#### Option 2: Railway/Render (Recommended)
Deploy backend separately:

**Railway:**
```bash
cd projects/estinator/server
railway login
railway init
railway up
# https://estinator-api.up.railway.app
```

**Render:**
1. Push server code to GitHub
2. Connect Render dashboard
3. Auto-deploy on push

#### Option 3: Fly.io
```bash
cd projects/estinator/server
flyctl launch
flyctl deploy
# https://estinator-api.fly.dev
```

---

## Phase 4: Environment Configuration

### Frontend Environment Variables
Create `app/.env.production`:
```bash
# API Base URL
VITE_API_URL=https://estinator-api.up.railway.app

# Analytics (optional)
VITE_MIXPANEL_TOKEN=your_token

# Feature flags
VITE_ENABLE_BETA=true
```

### Backend Environment Variables
Set in hosting platform dashboard:
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://estinator.vercel.app
```

---

## Phase 5: Beta Access Control

### Simple Approach: Password Protection
Add to `app/src/App.tsx`:
```tsx
const [isAuthenticated, setIsAuthenticated] = useState(false);

if (!isAuthenticated) {
  return <BetaLogin onLogin={() => setIsAuthenticated(true)} />;
}
```

### Better Approach: Invite Codes
Create `app/src/components/BetaGate.tsx`:
```tsx
const VALID_CODES = ['EST2026', 'HERO', 'JOC'];

export const BetaGate = ({ children }) => {
  const [code, setCode] = useState('');
  const [isValid, setIsValid] = useState(
    localStorage.getItem('estinator-beta') === 'true'
  );

  const validate = () => {
    if (VALID_CODES.includes(code.toUpperCase())) {
      localStorage.setItem('estinator-beta', 'true');
      setIsValid(true);
    }
  };

  if (isValid) return children;

  return (
    <div className="beta-gate">
      <h1>Estinator Beta</h1>
      <input 
        value={code}
        onChange={e => setCode(e.target.value)}
        placeholder="Enter invite code"
      />
      <button onClick={validate}>Enter</button>
    </div>
  );
};
```

### Advanced: Backend Validation
Store codes in database:
```typescript
// server/src/routes/beta.ts
router.post('/validate-code', async (req, res) => {
  const { code } = req.body;
  const valid = await db.codes.findOne({ code, used: false });
  if (valid) {
    await db.codes.updateOne({ code }, { used: true });
    res.json({ valid: true, token: generateJWT(code) });
  } else {
    res.status(400).json({ valid: false });
  }
});
```

---

## Phase 6: Analytics & Monitoring

### Add Analytics
```bash
cd app
npm i @vercel/analytics
```

In `main.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

<App />
<Analytics />
```

### Error Tracking
```bash
npm i @sentry/react
```

```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'beta',
});
```

### Uptime Monitoring
- **UptimeRobot:** Free monitoring every 5 minutes
- **Pingdom:** Paid, more features

---

## Phase 7: Beta Testing Workflow

### Recommended Stack

| Component | Service | Cost |
|-----------|---------|------|
| Frontend | Vercel | Free |
| Backend | Railway/Render | Free tier |
| Database | Supabase | Free tier |
| Auth | Supabase Auth | Free tier |
| Storage | Supabase Storage | Free tier |
| Monitoring | Vercel Analytics | Free |
| Domain | Namecheap/Vercel | ~$12/year |

### Deployment Checklist

- [ ] Build production frontend
- [ ] Deploy to Vercel
- [ ] Deploy backend to Railway
- [ ] Set environment variables
- [ ] Configure CORS
- [ ] Add beta access control
- [ ] Set up analytics
- [ ] Configure custom domain
- [ ] SSL certificate (auto on Vercel)
- [ ] Test file upload functionality
- [ ] Test AI query endpoints
- [ ] Create beta tester invite list

---

## Quick Start: Deploy in 10 Minutes

### Step 1: Deploy Frontend (3 min)
```bash
cd projects/estinator/app
vercel
# Answer prompts, get URL: https://estinator-xyz.vercel.app
```

### Step 2: Deploy Backend (3 min)
```bash
cd projects/estinator/server
railway login
railway init
railway up
# Get URL: https://estinator-api.up.railway.app
```

### Step 3: Connect Frontend to Backend (2 min)
```bash
# In Vercel dashboard
vercel env add VITE_API_URL
# Enter: https://estinator-api.up.railway.app

# Redeploy
vercel --prod
```

### Step 4: Add Beta Gate (2 min)
Copy the `BetaGate` component code above into the app.

---

## Beta Launch Sequence

### Week 1: Internal Testing
- [ ] Deploy to staging
- [ ] Test with 2-3 team members
- [ ] Fix critical bugs

### Week 2: Friends & Family
- [ ] Invite 10 trusted users
- [ ] Collect feedback via form
- [ ] Iterate on UI/UX

### Week 3: Expanded Beta
- [ ] Open to 50 users
- [ ] Monitor analytics
- [ ] Fix performance issues

### Week 4: Public Beta
- [ ] Remove invite gate
- [ ] Launch on Product Hunt
- [ ] Collect testimonials

---

## Post-Launch Checklist

- [ ] Set up support channel (Discord/Slack)
- [ ] Create feedback form (Typeform)
- [ ] Monitor error logs daily
- [ ] Track key metrics (DAU, retention)
- [ ] Prepare onboarding docs
- [ ] Plan pricing tiers
- [ ] Set up payment (Stripe)

---

## Recommended Next Steps

1. **Deploy to Vercel now** (5 min)
2. **Add beta gate component** (10 min)
3. **Test with 3 friends** (this week)
4. **Iterate based on feedback** (next week)

**Ready to deploy?** 🚀

Run: `cd projects/estinator/app && vercel`
