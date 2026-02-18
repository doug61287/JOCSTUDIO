#!/usr/bin/env node
/**
 * POD Publisher — Module 5
 * Creates Etsy draft listings from ready copy + Printify mockup images.
 * Uses Etsy Open API v3.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
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

async function etsyRequest(method, endpoint, body = null) {
  const apiKey = process.env.ETSY_API_KEY;
  const accessToken = process.env.ETSY_ACCESS_TOKEN;
  if (!apiKey || !accessToken) throw new Error('ETSY_API_KEY and ETSY_ACCESS_TOKEN required');

  const data = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'openapi.etsy.com',
      path: `/v3/application${endpoint}`,
      method,
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
      }
    }, (res) => {
      let result = '';
      res.on('data', chunk => result += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(result) });
        } catch {
          resolve({ status: res.statusCode, data: result });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getShopId() {
  const state = loadState();
  if (state.etsyShopId) return state.etsyShopId;

  const { data } = await etsyRequest('GET', '/shops?limit=1');
  const shopId = data?.results?.[0]?.shop_id?.toString();
  if (!shopId) throw new Error('No Etsy shop found');

  const updated = loadState();
  updated.etsyShopId = shopId;
  saveState(updated);
  return shopId;
}

async function createDraftListing(shopId, listing) {
  const { data } = await etsyRequest('POST', `/shops/${shopId}/listings`, {
    quantity: 999,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    who_made: 'i_did',
    when_made: 'made_to_order',
    taxonomy_id: 1,   // Clothing & Accessories
    tags: listing.tags,
    materials: ['cotton', 'polyester'],
    shipping_profile_id: null, // Will need to set after first run
    state: 'draft',
    type: 'physical',
  });

  return data;
}

async function main() {
  const state = loadState();
  const ready = (state.readyListings || []).filter(l => l.status === 'ready-to-publish');

  if (ready.length === 0) {
    console.log('⚠️  No listings ready to publish. Run listing-writer.js first.');
    process.exit(1);
  }

  console.log(`\n🚀 POD Publisher — Publishing to Etsy`);
  console.log('='.repeat(50));
  console.log(`Publishing ${ready.length} listings as drafts...\n`);

  const shopId = await getShopId();
  const published = [];

  for (const listing of ready) {
    console.log(`📤 Publishing: "${listing.title?.slice(0, 50)}..."`);

    try {
      const etsy = await createDraftListing(shopId, listing);

      published.push({
        ...listing,
        etsyListingId: etsy.listing_id,
        etsyUrl: `https://www.etsy.com/listing/${etsy.listing_id}`,
        status: 'published-draft',
        publishedAt: new Date().toISOString(),
      });

      console.log(`  ✅ Draft created: etsy.com/listing/${etsy.listing_id}`);
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
    }
  }

  // Update state
  state.readyListings = state.readyListings.map(l => {
    const pub = published.find(p => p.productId === l.productId);
    return pub || l;
  });
  state.publishedListings = [...(state.publishedListings || []), ...published];
  saveState(state);

  console.log(`\n✅ ${published.length} listings published as Etsy drafts`);
  console.log(`\n⚠️  REVIEW before activating:`);
  for (const p of published) {
    console.log(`  • ${p.etsyUrl}`);
  }
  console.log(`\n💡 Activate listings in Etsy → Shop Manager → Listings → Drafts`);
  console.log(`💡 Then run tracker.js daily to monitor performance`);
}

main().catch(console.error);
