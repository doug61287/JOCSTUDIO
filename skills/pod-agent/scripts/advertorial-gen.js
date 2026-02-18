#!/usr/bin/env node
/**
 * POD Advertorial Generator — Module 7
 *
 * Converts a ready listing into a full advertorial page using Zack's 6-section framework:
 *   1. Validate     — mirror the buyer's frustration (generic gifts feel cheap)
 *   2. Mechanism    — explain WHY the problem exists (mass production)
 *   3. Solution     — introduce the category solution (custom POD)
 *   4. Product      — present THIS specific design/listing naturally
 *   5. Social proof — realistic buyer testimonials (3-4 specific voices)
 *   6. Soft CTA     — low-pressure close ("worth checking out if...")
 *
 * Output: an HTML file per listing, ready to host (Carrd, Webflow, GitHub Pages).
 * Meta Ad → /advertorial/[listing-slug].html → Etsy listing URL
 *
 * Usage:
 *   ANTHROPIC_API_KEY=... node advertorial-gen.js
 *   ANTHROPIC_API_KEY=... node advertorial-gen.js --listing "cat-mom-tee-v1"
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '..', 'assets', 'state.json');
const ADVERTORIAL_DIR = path.join(__dirname, '..', 'generated', 'advertorials');

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return {};
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Section Prompts ─────────────────────────────────────────────────────────

async function generateAdvertorialCopy(niche, listing) {
  const nicheLabel = niche.replace(/-/g, ' ');
  const productType = listing.blueprint || 'product';
  const etsy_url = listing.etsyListingUrl || '#ETSY_URL';

  const prompt = `You are a conversion copywriter specializing in native advertorials for Meta (Facebook/Instagram) traffic.

Write a complete 6-section advertorial for a "${nicheLabel}" themed ${productType} on Etsy.

Product details:
- Title: ${listing.title || `${nicheLabel} ${productType}`}
- Price: $${listing.price || '24.99'}
- Tags/keywords: ${(listing.tags || []).slice(0, 6).join(', ')}

Framework — write each section with this exact structure:

SECTION 1 — VALIDATE (80-100 words)
Open by mirroring the reader's frustration. They've tried generic gifts before and it felt hollow. Be specific. No selling. Just "yes, I've been there too."

SECTION 2 — MECHANISM (80-100 words)  
Explain WHY generic gifts disappoint — mass production, same-design-for-everyone, profit over personality. Give the reader language to articulate what they already felt.

SECTION 3 — SOLUTION CATEGORY (80-100 words)
Introduce custom print-on-demand as a concept, NOT the product yet. Why customized beats mass-produced. This is where they realize there's a better way.

SECTION 4 — PRODUCT (100-120 words)
Now introduce THIS specific design naturally. What makes it different. Who it was designed for. How it captures something real about ${nicheLabel} identity. Still not a hard sell.

SECTION 5 — SOCIAL PROOF (100-120 words)
3-4 SHORT testimonial-style quotes from fictional but realistic buyers. Mix demographics. Be specific (not "loved it!" — more like "wore this to my daughter's soccer game and two cat moms stopped me"). No fake star ratings.

SECTION 6 — SOFT CTA (60-80 words)
Low-pressure close. "If you know a cat mom who deserves something real..." or "Worth checking out if you want a gift that actually lands." Include a call-to-action that feels like a recommendation, not a pitch. End with a single sentence linking to the listing.

Return a JSON object:
{
  "headline": "article-style headline (not a sales headline)",
  "subheadline": "one sentence hook under the headline",
  "sections": {
    "validate": "...",
    "mechanism": "...",
    "solution": "...",
    "product": "...",
    "social_proof": "...",
    "cta": "..."
  },
  "meta_ad_hook": "3-5 sentence ad copy that teases the advertorial (curiosity gap, no direct product mention)",
  "estimated_read_time": "X min read"
}

Return ONLY the JSON. No markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
  return JSON.parse(text);
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildHTML(copy, listing, etsy_url) {
  const { headline, subheadline, sections, meta_ad_hook, estimated_read_time } = copy;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
  <meta name="description" content="${subheadline}" />
  <!-- No robots index — traffic from paid ads only -->
  <meta name="robots" content="noindex, nofollow" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #fafaf8;
      color: #1a1a1a;
      line-height: 1.75;
    }
    .masthead {
      background: #fff;
      border-bottom: 2px solid #1a1a1a;
      padding: 12px 20px;
      text-align: center;
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #666;
    }
    .masthead strong { color: #1a1a1a; }
    .container {
      max-width: 680px;
      margin: 0 auto;
      padding: 40px 20px 80px;
    }
    .label {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 12px;
    }
    h1 {
      font-size: clamp(24px, 5vw, 36px);
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 16px;
    }
    .subheadline {
      font-size: 18px;
      color: #444;
      margin-bottom: 8px;
      font-style: italic;
    }
    .meta {
      font-size: 12px;
      color: #aaa;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .section {
      margin-bottom: 32px;
    }
    .section p {
      font-size: 17px;
      margin-bottom: 16px;
    }
    .product-box {
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 24px;
      margin: 32px 0;
    }
    .product-box h3 {
      font-size: 15px;
      margin-bottom: 8px;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .product-box .product-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .cta-btn {
      display: inline-block;
      background: #e04040;
      color: #fff;
      padding: 14px 28px;
      border-radius: 4px;
      font-family: -apple-system, sans-serif;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      text-align: center;
      width: 100%;
    }
    .cta-btn:hover { background: #c53030; }
    .testimonials {
      background: #f5f5f2;
      border-left: 3px solid #ccc;
      padding: 20px 24px;
      margin: 32px 0;
      border-radius: 0 4px 4px 0;
    }
    .testimonials p {
      font-size: 15px;
      font-style: italic;
      color: #444;
      margin-bottom: 12px;
    }
    .testimonials p:last-child { margin-bottom: 0; }
    .soft-cta {
      font-size: 17px;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #eee;
    }
    .soft-cta a { color: #e04040; }
    .disclosure {
      font-size: 11px;
      color: #bbb;
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
    }
    /* Meta Ad Hook — hidden in page, used for ad copy reference */
    .ad-hook-ref { display: none; }
  </style>
</head>
<body>
  <div class="masthead">
    <strong>Sponsored Content</strong> &nbsp;·&nbsp; Lifestyle &nbsp;·&nbsp; Gift Ideas
  </div>

  <div class="container">
    <p class="label">Gift Guide</p>
    <h1>${headline}</h1>
    <p class="subheadline">${subheadline}</p>
    <p class="meta">${estimated_read_time} &nbsp;·&nbsp; Sponsored</p>

    <!-- Section 1: Validate -->
    <div class="section">
      ${sections.validate.split('\n\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>

    <!-- Section 2: Mechanism -->
    <div class="section">
      ${sections.mechanism.split('\n\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>

    <!-- Section 3: Solution -->
    <div class="section">
      ${sections.solution.split('\n\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>

    <!-- Section 4: Product -->
    <div class="section">
      ${sections.product.split('\n\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>

    <!-- Product Box -->
    <div class="product-box">
      <h3>Featured on Etsy</h3>
      <div class="product-title">${listing.title || 'Custom Design'}</div>
      <p style="font-size:14px; color:#666; margin-bottom:16px;">From $${listing.price || '24.99'} · Free shipping on orders $35+</p>
      <a class="cta-btn" href="${etsy_url}" target="_blank" rel="noopener">
        View on Etsy →
      </a>
    </div>

    <!-- Section 5: Social Proof -->
    <div class="testimonials">
      ${sections.social_proof.split('\n\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>

    <!-- Section 6: Soft CTA -->
    <div class="soft-cta">
      ${sections.cta.split('\n\n').map(p => `<p>${p}</p>`).join('\n      ')}
      <p style="margin-top:20px;">
        <a class="cta-btn" href="${etsy_url}" target="_blank" rel="noopener">
          See if it's right for you →
        </a>
      </p>
    </div>

    <div class="disclosure">
      This is a sponsored article. We may earn a commission if you purchase through our links.
    </div>
  </div>

  <!-- Ad Hook Reference (for Meta ad copy) -->
  <div class="ad-hook-ref" data-ad-hook="${meta_ad_hook}"></div>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const state = loadState();
  const niche = state.niche || 'cat-mom';

  // Target specific listing via --listing flag, or process all ready listings
  const targetSlug = process.argv.includes('--listing')
    ? process.argv[process.argv.indexOf('--listing') + 1]
    : null;

  let listings = state.readyListings || [];
  if (targetSlug) {
    listings = listings.filter(l => slugify(l.title || '') === targetSlug || l.id === targetSlug);
  }

  if (listings.length === 0) {
    console.log('⚠️  No ready listings found. Run listing-writer.js first.');
    process.exit(1);
  }

  // Ensure output dir exists
  if (!fs.existsSync(ADVERTORIAL_DIR)) {
    fs.mkdirSync(ADVERTORIAL_DIR, { recursive: true });
  }

  console.log(`\n📰 POD Advertorial Generator — Niche: ${niche}`);
  console.log('='.repeat(50));
  console.log(`Generating advertorials for ${listings.length} listing(s)...\n`);

  const results = [];

  for (const listing of listings) {
    const slug = slugify(listing.title || `${niche}-product`);
    console.log(`📝 Generating: ${slug}`);

    try {
      const copy = await generateAdvertorialCopy(niche, listing);
      const etsy_url = listing.etsyListingUrl || listing.etsyUrl || '#ETSY_URL_PENDING';

      const html = buildHTML(copy, listing, etsy_url);
      const filename = `${slug}-advertorial.html`;
      const outPath = path.join(ADVERTORIAL_DIR, filename);

      fs.writeFileSync(outPath, html, 'utf8');

      // Save JSON copy too (for ad team / A/B testing)
      const jsonPath = path.join(ADVERTORIAL_DIR, `${slug}-advertorial.json`);
      fs.writeFileSync(jsonPath, JSON.stringify({ listing, copy }, null, 2), 'utf8');

      results.push({ slug, filename, headline: copy.headline, meta_ad_hook: copy.meta_ad_hook });

      console.log(`  ✅ Headline: "${copy.headline.slice(0, 60)}..."`);
      console.log(`  📣 Ad hook: "${copy.meta_ad_hook.slice(0, 80)}..."`);
      console.log(`  💾 Saved: generated/advertorials/${filename}`);
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
    }

    console.log('');
  }

  // Update state
  state.advertorials = [...(state.advertorials || []), ...results];
  saveState(state);

  console.log('='.repeat(50));
  console.log(`✅ ${results.length} advertorial(s) generated`);
  console.log(`\n📁 Output: skills/pod-agent/generated/advertorials/`);
  console.log(`\n🚀 Next steps:`);
  console.log(`  1. Host HTML files (GitHub Pages / Carrd / Cloudflare Pages)`);
  console.log(`  2. Create Meta ad using ad_hook text from the JSON files`);
  console.log(`  3. Ad → advertorial URL → Etsy listing`);
  console.log(`  4. Target: women 28-50, interests: cats, pet gifts, Etsy`);
}

main().catch(console.error);
