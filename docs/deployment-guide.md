# JOCHero Landing Page Deployment Guide

## Current Setup
- **Repository:** https://github.com/Doug61287/jocstudio.git
- **Landing Page:** `product/landing/index.html` (single-file static site)
- **Domain:** JOCHero.com (to be connected)

---

## Option 1: Vercel (Recommended)

Vercel offers free hosting, automatic HTTPS, and GitHub auto-deploy.

### Method A: GitHub Integration (Easiest - Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com) and sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select the `jocstudio` repository
   - Configure:
     - **Framework Preset:** Other
     - **Root Directory:** `product/landing`
     - **Build Command:** (leave empty)
     - **Output Directory:** `.` or leave empty

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment (usually < 1 minute)
   - You'll get a URL like `jocstudio-xxx.vercel.app`

4. **Connect Custom Domain (JOCHero.com)**
   - Go to Project Settings → Domains
   - Add `jochero.com` and `www.jochero.com`
   - Follow DNS instructions:
     - Add an **A record** pointing to `76.76.21.21`
     - Or add a **CNAME** pointing to `cname.vercel-dns.com`
   - Vercel provides free SSL automatically

5. **Auto-Deploy from GitHub**
   - Every push to the `main` branch will automatically deploy
   - Preview deployments for pull requests

### Method B: Vercel CLI

```bash
# Install Vercel CLI (already done)
npm i -g vercel

# Navigate to landing page
cd ~/clawd/projects/jocstudio/product/landing

# Login (opens browser for auth)
vercel login

# Deploy to production
vercel --prod

# Or deploy with settings
vercel --prod --name jochero
```

---

## Option 2: Netlify (Alternative)

If Vercel doesn't work, Netlify is equally good.

### Method A: Web Dashboard

1. Visit [netlify.com](https://netlify.com) and sign in with GitHub
2. Click "Add new site" → "Import an existing project"
3. Select GitHub → `jocstudio` repository
4. Configure:
   - **Base directory:** `product/landing`
   - **Build command:** (leave empty)
   - **Publish directory:** `.`
5. Click "Deploy site"

### Connect Custom Domain
1. Go to Site settings → Domain management
2. Add custom domain: `jochero.com`
3. Follow DNS instructions provided

### Method B: Netlify CLI

```bash
# Install
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd ~/clawd/projects/jocstudio/product/landing
netlify deploy --prod --dir=.
```

---

## DNS Configuration for JOCHero.com

Wherever your domain is registered (GoDaddy, Namecheap, Cloudflare, etc.):

### For Vercel:
| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### For Netlify:
| Type | Name | Value |
|------|------|-------|
| CNAME | @ | [your-site].netlify.app |
| CNAME | www | [your-site].netlify.app |

**Note:** Some registrars don't support CNAME for root domain (@). Use Vercel's A record method or Netlify's load balancer IPs.

---

## Automatic Deployments from GitHub

Once connected via either platform's GitHub integration:

1. **Push to main** → Automatic production deployment
2. **Create PR** → Preview deployment with unique URL
3. **Merge PR** → Production updated automatically

### Workflow Example:
```bash
# Make changes locally
cd ~/clawd/projects/jocstudio/product/landing
# Edit index.html

# Commit and push
git add .
git commit -m "Update landing page"
git push origin main

# Vercel/Netlify automatically deploys within ~1 minute
```

---

## Troubleshooting

### Deploy fails
- Check that `product/landing/index.html` exists
- Ensure root directory is set to `product/landing`
- Check build logs in Vercel/Netlify dashboard

### Domain not working
- DNS propagation takes up to 48 hours (usually much faster)
- Verify DNS records are correct: `dig jochero.com`
- Check domain status in hosting dashboard

### SSL certificate issues
- Both platforms auto-provision SSL
- Wait a few minutes after adding domain
- Force HTTPS in settings

---

## Quick Reference

| Task | Command/Action |
|------|----------------|
| Deploy via CLI | `vercel --prod` |
| Check deployment | `vercel ls` |
| View domains | `vercel domains ls` |
| Add domain | `vercel domains add jochero.com` |
| View logs | Check Vercel/Netlify dashboard |

---

## Current Status

- [ ] Vercel CLI installed ✅
- [ ] Vercel login completed (pending user auth)
- [ ] Initial deployment
- [ ] Custom domain connected
- [ ] SSL certificate active
- [ ] Auto-deploy from GitHub confirmed

**Next Steps:**
1. User authenticates with Vercel (browser login)
2. Deploy landing page
3. Add JOCHero.com domain
4. Update DNS records at domain registrar
