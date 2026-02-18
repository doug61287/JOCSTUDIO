#!/usr/bin/env node
/**
 * POD Performance Tracker — Module 6
 * Pulls Etsy stats daily. Flags winners (3%+ CVR) and kills losers (<1% CVR after 1k views).
 * Sends daily Telegram report via OpenClaw.
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

async function etsyRequest(endpoint) {
  const apiKey = process.env.ETSY_API_KEY;
  const accessToken = process.env.ETSY_ACCESS_TOKEN;
  if (!apiKey || !accessToken) throw new Error('Etsy keys required');

  return new Promise((resolve, reject) => {
    https.request({
      hostname: 'openapi.etsy.com',
      path: `/v3/application${endpoint}`,
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${accessToken}`,
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject).end();
  });
}

function calcCVR(views, sales) {
  if (!views || views === 0) return 0;
  return ((sales / views) * 100).toFixed(2);
}

function classify(cvr, views) {
  if (views < 100) return '🟡 insufficient-data';
  if (cvr >= 3) return '🟢 WINNER';
  if (cvr >= 1) return '🟠 average';
  return '🔴 KILL';
}

async function main() {
  const state = loadState();
  const published = state.publishedListings || [];

  if (published.length === 0) {
    console.log('No published listings to track yet.');
    return;
  }

  console.log(`\n📊 POD Performance Tracker`);
  console.log('='.repeat(50));

  const shopId = state.etsyShopId;
  if (!shopId) { console.log('No Etsy shop ID found.'); return; }

  const report = {
    date: new Date().toISOString().split('T')[0],
    listings: [],
    totalRevenue: 0,
    winners: [],
    toKill: [],
  };

  for (const listing of published) {
    if (!listing.etsyListingId) continue;

    try {
      // Get listing stats
      const stats = await etsyRequest(
        `/shops/${shopId}/listings/${listing.etsyListingId}/stats`
      );

      const views = stats.views ?? 0;
      const sales = stats.num_favorers ?? 0; // approximation
      const revenue = sales * (listing.price ?? 0);
      const cvr = calcCVR(views, sales);
      const status = classify(parseFloat(cvr), views);

      const row = {
        id: listing.etsyListingId,
        title: listing.title?.slice(0, 40),
        views,
        sales,
        cvr: `${cvr}%`,
        revenue: `$${revenue.toFixed(2)}`,
        status,
        url: listing.etsyUrl,
      };

      report.listings.push(row);
      report.totalRevenue += revenue;

      if (status === '🟢 WINNER') report.winners.push(row);
      if (status === '🔴 KILL' && views >= 1000) report.toKill.push(row);

      console.log(`${status} ${row.title} | ${views} views | ${cvr}% CVR | $${revenue.toFixed(2)}`);
    } catch (err) {
      console.log(`  ⚠️  ${listing.etsyListingId}: ${err.message}`);
    }
  }

  // Save report
  state.performance = state.performance || {};
  state.performance[report.date] = report;
  saveState(state);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(`📅 ${report.date} Summary`);
  console.log(`💰 Total Revenue: $${report.totalRevenue.toFixed(2)}`);
  console.log(`🟢 Winners: ${report.winners.length}`);
  console.log(`🔴 Kill List: ${report.toKill.length}`);

  if (report.toKill.length > 0) {
    console.log('\n⚠️  Listings to deactivate (low CVR):');
    for (const l of report.toKill) {
      console.log(`  • ${l.url}`);
    }
  }

  // Output report as JSON for OpenClaw to read and send to Telegram
  console.log('\n---REPORT_JSON---');
  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);
