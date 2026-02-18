#!/usr/bin/env node
/**
 * POD Listing Writer — Module 4
 * Uses Claude to write SEO-optimized Etsy listing copy.
 * Title, description, 13 tags — all tuned for Etsy search.
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, '..', 'assets', 'state.json');

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return {};
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function writeListing(niche, keywords, productType) {
  const prompt = `You are an expert Etsy SEO copywriter specializing in print-on-demand products.

Write an optimized Etsy listing for a "${niche.replace(/-/g, ' ')}" themed ${productType}.

Trending keywords to incorporate: ${keywords.slice(0, 10).join(', ')}

Return a JSON object with exactly these fields:
{
  "title": "65-140 char title with top keywords at the front",
  "description": "400-500 word description with keywords naturally woven in. Include: what it is, who it's for, sizing info, care instructions, gift occasion",
  "tags": ["array", "of", "exactly", "13", "tags", "max", "20", "chars", "each"],
  "price": suggested retail price in USD as a number (e.g. 24.99)
}

Rules:
- Title: lead with strongest keyword, no ALL CAPS, no symbols
- Tags: long-tail phrases buyers actually search, no duplicates from title
- Description: conversational, mention "perfect gift", include niche keywords
- Price: $24.99 for tees, $44.99 for hoodies, $14.99 for mugs

Return ONLY the JSON, no markdown.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}

async function main() {
  const state = loadState();
  const niche = state.niche || 'cat-mom';
  const keywords = state.trendingKeywords || [niche];
  const pending = state.pendingListings || [];

  if (pending.length === 0) {
    console.log('⚠️  No pending listings. Run mockup-engine.js first.');
    process.exit(1);
  }

  console.log(`\n✍️  POD Listing Writer — Niche: ${niche}`);
  console.log('='.repeat(50));
  console.log(`Writing copy for ${pending.length} products...\n`);

  const readyListings = [];

  for (const item of pending) {
    console.log(`📝 Writing listing for: ${item.blueprint} (${item.productId})`);

    try {
      const copy = await writeListing(niche, keywords, item.blueprint);

      const listing = {
        ...item,
        ...copy,
        status: 'ready-to-publish',
        writtenAt: new Date().toISOString(),
      };

      readyListings.push(listing);

      console.log(`  ✅ Title: "${copy.title.slice(0, 50)}..."`);
      console.log(`  📌 Tags: ${copy.tags.slice(0, 3).join(', ')}...`);
      console.log(`  💰 Price: $${copy.price}`);
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
    }
  }

  // Update state
  state.pendingListings = [];
  state.readyListings = [...(state.readyListings || []), ...readyListings];
  saveState(state);

  console.log(`\n✅ ${readyListings.length} listings ready to publish`);
  console.log(`💡 Next: run publisher.js to create Etsy draft listings`);
}

main().catch(console.error);
