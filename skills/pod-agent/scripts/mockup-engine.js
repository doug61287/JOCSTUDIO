#!/usr/bin/env node
/**
 * POD Mockup Engine — Module 3
 * Creates product mockups via Printify API.
 * Blueprint IDs: 6=Unisex Hoodie, 12=Unisex Tee, 77=Phone Case, 125=Mug
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

const PRINTIFY_API = 'api.printify.com';

// Product blueprints we want to create for each design
const PRODUCT_BLUEPRINTS = [
  { blueprintId: 12, title: 'Unisex T-Shirt', printProviderId: 99 },  // Printify Choice
  { blueprintId: 6,  title: 'Unisex Hoodie',  printProviderId: 99 },
  { blueprintId: 77, title: 'Phone Case',     printProviderId: 99 },
];

async function printifyRequest(method, endpoint, body = null) {
  const apiKey = process.env.PRINTIFY_API_KEY;
  if (!apiKey) throw new Error('PRINTIFY_API_KEY not set');

  const data = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: PRINTIFY_API,
      path: `/v1${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PODAgent/1.0',
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
  if (state.printifyShopId) return state.printifyShopId;

  const { data } = await printifyRequest('GET', '/shops.json');
  const shopId = data?.[0]?.id?.toString();
  if (!shopId) throw new Error('No Printify shop found. Create one at printify.com');

  state.printifyShopId = shopId;
  saveState(state);
  console.log(`🏪 Using shop: ${data[0].title} (${shopId})`);
  return shopId;
}

async function uploadImageToPrintify(imageUrl, filename) {
  const { data } = await printifyRequest('POST', '/uploads/images.json', {
    file_name: filename,
    url: imageUrl,
  });
  return data.id;
}

async function createProduct(shopId, design, blueprint) {
  const imageId = await uploadImageToPrintify(design.imageUrl, `${design.id}.png`);

  const product = {
    title: `${design.niche.replace(/-/g, ' ')} ${blueprint.title}`,
    description: `Perfect gift for ${design.niche.replace(/-/g, ' ')} lovers!`,
    blueprint_id: blueprint.blueprintId,
    print_provider_id: blueprint.printProviderId,
    variants: [
      // Will be populated by Printify based on blueprint
      { id: 1, price: blueprint.blueprintId === 12 ? 2499 : 4499, is_enabled: true }
    ],
    print_areas: [{
      variant_ids: [1],
      placeholders: [{
        position: 'front',
        images: [{
          id: imageId,
          x: 0.5, y: 0.5,
          scale: 1,
          angle: 0
        }]
      }]
    }]
  };

  const { data } = await printifyRequest('POST', `/shops/${shopId}/products.json`, product);
  return data;
}

async function main() {
  const state = loadState();
  const designs = (state.generatedDesigns || []).filter(d => d.status === 'ready');

  if (designs.length === 0) {
    console.log('⚠️  No ready designs found. Run design-gen.js first.');
    process.exit(1);
  }

  console.log(`\n🖨️  POD Mockup Engine — Creating Printify Products`);
  console.log('='.repeat(50));

  const shopId = await getShopId();
  const created = [];

  for (const design of designs.slice(0, 3)) { // max 3 at a time
    console.log(`\n📦 Creating products for: ${design.id}`);

    for (const blueprint of PRODUCT_BLUEPRINTS) {
      try {
        const product = await createProduct(shopId, design, blueprint);
        console.log(`  ✅ ${blueprint.title}: ${product.id}`);
        created.push({ designId: design.id, productId: product.id, blueprint: blueprint.title });

        // Mark design as in progress
        design.status = 'mockup-created';
        design.printifyProductIds = [...(design.printifyProductIds || []), product.id];
      } catch (err) {
        console.log(`  ❌ ${blueprint.title}: ${err.message}`);
      }
    }
  }

  // Update state
  state.generatedDesigns = state.generatedDesigns.map(d => {
    const updated = designs.find(u => u.id === d.id);
    return updated || d;
  });
  state.pendingListings = [...(state.pendingListings || []), ...created];
  saveState(state);

  console.log(`\n✅ Created ${created.length} Printify products`);
  console.log(`💡 Next: run listing-writer.js to generate SEO copy`);
}

main().catch(console.error);
